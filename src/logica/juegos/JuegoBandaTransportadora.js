// Importamos las clases de entidades (estas no cambian)
import Personaje from "./Personaje.js";
import Ranura from "./Ranura.js";
import CintaTransportadora from "./CintaTransportadora.js";

// Importamos la base y el enum
import JuegoBase from "./JuegoBase.js";
import { FaseJuego } from "./FaseJuego.js";

// (Corrección 1: Ranuras por defecto)
const DEFAULT_RANURAS = [
    { id: "r1", indice: 1, x: 20, y: 30 },
    { id: "r2", indice: 2, x: 40, y: 30 },
    { id: "r3", indice: 3, x: 60, y: 30 },
    { id: "r4", indice: 4, x: 80, y: 30 },
];

// Observa el "extends JuegoBase"
export default class JuegoBandaTransportadora extends JuegoBase {

    constructor(config = {}) {
        // 1. Llamamos al constructor base
        super(config); // Esto inicializa config, eventos, fase, vidas, tiempo

        // 2. Inicializamos el estado PROPIO de este juego
        this.personaje = new Personaje(18, 60);
        this.cinta = new CintaTransportadora(); // usa defaults

        // (Corrección 1: Usar ranuras por defecto)
        const ranurasConfig = this.config.ranuras ?? DEFAULT_RANURAS;
        this.ranuras = ranurasConfig.slice(0, this.config.slots ?? 4)
            .map(r => new Ranura(r.id, r.indice, r.x, r.y));

        this._ultimoSnapshot = null;
    }

    // ------------- Suscripción / lectura -------------

    // 'on' se hereda automáticamente de JuegoBase

    snapshot() {
        // 1. Obtenemos el snapshot base (fase, vidas, tiempo)
        const baseState = super.snapshot();

        // 2. Añadimos el estado específico de este juego
        this._ultimoSnapshot = {
            ...baseState,
            personaje: { x: this.personaje.x, y: this.personaje.y, carga: this.personaje.carga },
            paquetes: this.fase === FaseJuego.INTRO
                ? []
                : this.cinta.paquetes.map(p => ({ id: p.id, valor: p.valor, x: p.x, y: p.y })),
            ranuras: this.ranuras.map(r => ({ id: r.id, indice: r.indice, x: r.x, y: r.y, valor: r.valor })),
        };
        return this._ultimoSnapshot;
    }

    // ------------- Ciclo de vida (Implementación) -------------

    // 'iniciar' se hereda y funciona tal cual

    // 'detener' se hereda y funciona tal cual

    // Debemos implementar el método "abstracto"
    empezarTimers() {
        // No empezar si no estamos "en curso" o si ya están corriendo
        if (this.fase !== FaseJuego.EN_CURSO || this._timers.length > 0) return;

        // bucle de movimiento/colisiones
        const timerMovimiento = setInterval(() => {
            this.cinta.avanzar();
            this.cinta.spawnear(() => this._muestrearSecuencia());
            this._intentarRecogerOColocar();
            if (this._todasRanurasLlenas()) this._ganar(); // _ganar() es heredado

            this.eventos.emit("tick", this.snapshot());
        }, 50);

        // reloj
        const timerReloj = setInterval(() => {
            this.tiempo = Math.max(0, this.tiempo - 1);
            if (this.tiempo === 0) this._perder(); // _perder() es heredado
            this.eventos.emit("tick", this.snapshot());
        }, 1000);

        // 3. REGISTRAMOS los timers para que 'detener' pueda limpiarlos
        this._registrarTimer(timerMovimiento);
        this._registrarTimer(timerReloj);
    }

    // Sobreescribimos 'reiniciar' para limpiar el estado específico
    reiniciar(aIntroduccion = true) {
        // 1. Limpiamos el estado de ESTE juego
        this.personaje = new Personaje(18, 60);
        this.cinta.paquetes = [];
        this.ranuras.forEach(r => r.valor = null);

        // 2. Llamamos a la lógica base (que detiene timers, resetea vidas/tiempo, etc.)
        super.reiniciar(aIntroduccion);
    }

    // ------------- Entradas del jugador (Implementación) -------------

    // Implementamos la interfaz de input genérica
    procesarInput(tipo, payload) {
        if (tipo !== "mover" || this.fase !== FaseJuego.EN_CURSO) return;

        let dx = 0, dy = 0;
        const step = this.config.step ?? 5;

        switch(payload) {
            case "arriba":    dy = -step; break;
            case "abajo":     dy =  step; break;
            case "izquierda": dx = -step; break;
            case "derecha":   dx =  step; break;
            default: return; // No es un payload que entendamos
        }

        // (Corrección 2: Límites por defecto)
        const limites = this.config.limites ?? { minX: 5, maxX: 95, minY: 10, maxY: 90 };
        this.personaje.mover(dx, dy, limites);

        this._intentarRecogerOColocar();
        this.eventos.emit("tick", this.snapshot());
    }

    // ------------- Reglas de interacción (Específicas del juego) -------------

    _intentarRecogerOColocar() {

        // ▼▼▼ CORRECCIÓN 3: Radios de interacción por defecto ▼▼▼
        const radioPick = this.config.radioPick ?? 8;
        const radioRanura = this.config.radioRanura ?? 6;
        // ▲▲▲ FIN DE LA CORRECCIÓN ▲▲▲

        // Recoger paquete si no lleva nada
        if (this.personaje.carga == null) {
            const golpe = this.cinta.paquetes.find(p =>
                this.personaje.distanciaA(p) < radioPick // <-- Usar la variable
            );
            if (golpe) {
                this.personaje.carga = golpe.valor;
                this.cinta.paquetes = this.cinta.paquetes.filter(p => p.id !== golpe.id);
            }
        }

        // Colocar en ranura si lleva algo
        if (this.personaje.carga != null) {
            const cerca = this.ranuras.find(r =>
                r.estaLibre() && this.personaje.distanciaA(r) < radioRanura // <-- Usar la variable
            );
            if (cerca) {
                const esperado = this.config.secuencia[cerca.indice - 1];
                if (this.personaje.carga === esperado) {
                    cerca.valor = this.personaje.carga;     // correcto
                } else {
                    this.vidas = Math.max(0, this.vidas - 1); // error
                    if (this.vidas === 0) {
                        this._perder(); // Llamamos al método heredado
                        return;
                    }
                }
                this.personaje.carga = null;
            }
        }
    }

    // (Corrección 4: Seguro anti-listas-vacías)
    _todasRanurasLlenas() {
        // No se puede ganar si no hay ranuras definidas
        if (this.ranuras.length === 0) {
            return false;
        }
        return this.ranuras.every(r => !r.estaLibre());
    }

    // '_ganar' y '_perder' ya NO se definen aquí, se heredan de JuegoBase

    // ------------- Utilidades (Específicas del juego) -------------
    _muestrearSecuencia() {
        // (Aseguramos que 'secuencia' también tenga un default)
        const arr = this.config.secuencia ?? [2, 4, 6, 8];
        return arr[Math.floor(Math.random() * arr.length)];
    }
}