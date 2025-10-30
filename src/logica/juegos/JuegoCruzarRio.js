// /src/logica/juegos/JuegoCruzarRio.js
import EventEmitter from './EventEmitter.js';
import { FaseJuego } from './FaseJuego.js';

// --- Constantes del Nivel 2 ---
const START_POS = { x: 11, y: 85 };
const GOAL_POS = { x: 90, y: 55 };
const COLS = [28, 43, 58, 72];
const ROWS = [28, 45, 62, 80];
const GRID4 = ROWS.flatMap((y) => COLS.map((x) => ({ x, y })));
const JUMP_RADIUS = 9;

export default class JuegoCruzarRio extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.fase = FaseJuego.INTRO;

        this.tiempo_limite = config.tiempo_limite || 90;
        this.vidas_max = config.vidas || 3;
        this.secuencia = config.secuencia || [3, 6, 9, 12];

        // Generar piedras correctas y falsas
        this.piedras = this._generarPiedras(this.secuencia);

        // Estado
        this.tiempo = this.tiempo_limite;
        this.vidas = this.vidas_max;
        this.personaje = START_POS;
        this.piedrasVisitadas = []; // Array de IDs de piedras correctas
        this.errorPiedraId = null; // Para animar error

        this.relojRef = null;
    }

    // --- Generador de Piedras (Lógica interna) ---
    _generarPiedras(secuencia) {
        // 1. Definir piedras correctas
        const correctasCoords = [
            { x: COLS[0], y: ROWS[3] }, // 3
            { x: COLS[1], y: ROWS[2] }, // 6
            { x: COLS[2], y: ROWS[1] }, // 9
            { x: COLS[3], y: ROWS[2] }, // 12
        ];
        const piedrasCorrectas = secuencia.map((valor, i) => ({
            id: `p${i + 1}`,
            idx: i + 1,
            ...correctasCoords[i],
            valor: valor,
            esCorrecta: true,
        }));

        // 2. Definir piedras falsas (distractores)
        const usedKeys = new Set(correctasCoords.map(c => `${c.x}-${c.y}`));
        const distractorCoords = GRID4.filter(c => !usedKeys.has(`${c.x}-${c.y}`));
        const distractorValues = [4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20];
        const piedrasFalsas = distractorCoords.map((c, i) => ({
            id: `pf${i + 1}`,
            ...c,
            valor: distractorValues[i % distractorValues.length],
            esCorrecta: false,
        }));

        return [...piedrasCorrectas, ...piedrasFalsas];
    }

    // --- API Pública ---

    iniciar() {
        this.fase = FaseJuego.EN_CURSO;
        this.emit("fase", this.snapshot());
    }

    empezarTimers() {
        if (this.relojRef) clearInterval(this.relojRef);
        this.relojRef = setInterval(() => this._tick(), 1000);
    }

    detener() {
        if (this.relojRef) clearInterval(this.relojRef);
    }

    reiniciar(aIntro = true) {
        this.detener();
        this.tiempo = this.tiempo_limite;
        this.vidas = this.vidas_max;
        this.personaje = START_POS;
        this.piedrasVisitadas = [];
        this.errorPiedraId = null;
        this.fase = aIntro ? FaseJuego.INTRO : FaseJuego.EN_CURSO;
        this.emit("fase", this.snapshot());
    }

    // El "cerebro" del juego: procesa los clics del usuario
    procesarInput(tipo, payload) {
        if (tipo === "clickPiedra" && this.fase === FaseJuego.EN_CURSO) {
            const piedraId = payload;
            const piedra = this.piedras.find(p => p.id === piedraId);
            if (!piedra) return;

            // 1. Mover personaje
            this.personaje = { x: piedra.x, y: piedra.y };

            // 2. Validar
            if (piedra.esCorrecta) {
                // Es una piedra correcta. ¿Es la que sigue?
                const esLaSiguiente = piedra.idx === this.piedrasVisitadas.length + 1;
                if (esLaSiguiente) {
                    this.piedrasVisitadas.push(piedra.id);

                    // ¿Ganó? (Es la última piedra correcta)
                    if (this.piedrasVisitadas.length === this.secuencia.length) {
                        // Salto automático a la meta
                        setTimeout(() => {
                            this.personaje = GOAL_POS;
                            this._ganar();
                        }, 450);
                    }
                } else {
                    // Es una piedra correcta, pero fuera de orden
                    this._penalizar(piedra.id);
                }
            } else {
                // Es una piedra falsa
                this._penalizar(piedra.id);
            }

            this.emit("tick", this.snapshot()); // Emitir snapshot actualizado
        }
    }

    // --- Lógica Interna ---

    _tick() {
        this.tiempo = Math.max(0, this.tiempo - 1);
        if (this.tiempo === 0) {
            this._perder();
        } else {
            this.emit("tick", this.snapshot());
        }
    }

    _penalizar(piedraId) {
        this.vidas = Math.max(0, this.vidas - 1);
        this.errorPiedraId = piedraId;

        // Quitar el resaltado de error después de un tiempo
        setTimeout(() => {
            this.errorPiedraId = null;
            this.emit("tick", this.snapshot());
        }, 600);

        if (this.vidas === 0) {
            this._perder();
        }
    }

    _ganar() {
        this.detener();
        this.fase = FaseJuego.GANADO;
        this.emit("ganado", this.snapshot());
    }

    _perder() {
        this.detener();
        this.fase = FaseJuego.PERDIDO;
        this.emit("perdido", this.snapshot());
    }

    // Devuelve un objeto plano con el estado actual
    snapshot() {
        return {
            fase: this.fase,
            tiempo: this.tiempo,
            vidas: this.vidas,
            personaje: this.personaje,
            piedras: this.piedras, // Lista completa de piedras (correctas y falsas)
            piedrasVisitadas: this.piedrasVisitadas, // array de IDs
            errorPiedraId: this.errorPiedraId,
            metaPos: GOAL_POS,
            startPos: START_POS,
            secuencia: this.secuencia,
        };
    }
}