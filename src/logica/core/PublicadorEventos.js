// export default class PublicadorEventos { // <-- LÍNEA ANTIGUA
export class PublicadorEventos { // <-- LÍNEA NUEVA
    constructor() { this._subs = Object.create(null); }

    on(evento, cb) {
        (this._subs[evento] ||= new Set()).add(cb);
        return () => this.off(evento, cb);
    }

    off(evento, cb) { this._subs[evento]?.delete(cb); }

    emit(evento, payload) {
        this._subs[evento]?.forEach((cb) => cb(payload));
    }
}