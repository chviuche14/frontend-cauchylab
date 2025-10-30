// /src/logica/juegos/EventEmitter.js
// Una clase simple para emitir y escuchar eventos.
export default class EventEmitter {
    constructor() {
        this.callbacks = {};
    }

    on(event, cb) {
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(cb);
        // Devuelve una función "off" para desuscribirse
        return () => {
            this.callbacks[event] = this.callbacks[event]?.filter(c => c !== cb);
        };
    }

    emit(event, data) {
        this.callbacks[event]?.forEach(cb => cb(data));
    }
}