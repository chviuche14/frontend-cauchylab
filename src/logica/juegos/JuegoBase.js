import { PublicadorEventos } from "../core/PublicadorEventos.js";
import { FaseJuego } from "./FaseJuego.js";

export default class JuegoBase {
    constructor(config = {}) {
        // Truco para simular "abstract class" en JS
        if (this.constructor === JuegoBase) {
            throw new Error("No se puede instanciar JuegoBase directamente. Debes extenderla.");
        }

        this.config = Object.freeze(config);
        this.eventos = new PublicadorEventos();

        this.fase = FaseJuego.INTRO;
        this.vidas = config.vidas ?? 3;
        this.tiempo = config.tiempoLimite ?? 60;

        this._timers = []; // Un array para gestionar todos los timers
    }

    // --- API Pública Universal (Heredada por todos) ---

    on(evento, cb) {
        return this.eventos.on(evento, cb);
    }

    snapshot() {
        // El snapshot base. Cada hijo añadirá sus propios datos.
        return {
            fase: this.fase,
            vidas: this.vidas,
            tiempo: this.tiempo,
        };
    }

    iniciar() {
        if (this.fase !== FaseJuego.INTRO) return;
        this.fase = FaseJuego.EN_CURSO;
        // La UI escuchará este evento y llamará a 'empezarTimers'
        // cuando termine la animación de "Ready, Go!"
        this.eventos.emit("fase", this.snapshot());
    }

    detener() {
        // Detiene TODOS los timers registrados por el juego
        this._timers.forEach(clearInterval);
        this._timers = [];
    }

    reiniciar(aIntroduccion = true) {
        this.detener();
        this.vidas = this.config.vidas ?? 3;
        this.tiempo = this.config.tiempoLimite ?? 60;

        if (!aIntroduccion) {
            // Reintento rápido (sin intro)
            this.fase = FaseJuego.EN_CURSO;
            // El hijo DEBE haber implementado esto
            this.empezarTimers();
        } else {
            // Volver a la pantalla de "Intro"
            this.fase = FaseJuego.INTRO;
        }

        // El 'tick' es necesario para actualizar el snapshot
        this.eventos.emit("tick", this.snapshot());
        this.eventos.emit("fase", this.snapshot());
    }

    // --- Métodos "Abstractos" (Deben ser implementados por las clases hijas) ---

    empezarTimers() {
        // Inicia el "game loop" (setIntervals, etc.)
        throw new Error("El método 'empezarTimers' debe ser implementado por la subclase.");
    }

    procesarInput(tipo, payload) {
        // Recibe y maneja la entrada del jugador (ej: tipo="mover", payload="arriba")
        throw new Error("El método 'procesarInput' debe ser implementado por la subclase.");
    }

    // --- Lógica de estado interna (Heredada) ---

    _registrarTimer(timer) {
        // Helper para que 'detener' funcione
        this._timers.push(timer);
    }

    _ganar() {
        if (this.fase !== FaseJuego.EN_CURSO) return;
        this.fase = FaseJuego.GANADO;
        this.detener();
        this.eventos.emit("ganado", this.snapshot());
        this.eventos.emit("fase", this.snapshot());
    }

    _perder() {
        if (this.fase !== FaseJuego.EN_CURSO) return;
        this.fase = FaseJuego.PERDIDO;
        this.detener();
        this.eventos.emit("perdido", this.snapshot());
        this.eventos.emit("fase", this.snapshot());
    }
}