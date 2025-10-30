import Paquete from "./Paquete.js";

export default class CintaTransportadora {
    constructor({ y = 75, inicioX = -5, finX = 105, velocidad = 0.6, separacion = 18 } = {}) {
        this.y = y;
        this.inicioX = inicioX;
        this.finX = finX;
        this.velocidad = velocidad;    // avance por “tick”
        this.separacion = separacion;  // distancia mínima entre spawns
        this.paquetes = [];
    }

    _ultimo() { return this.paquetes[this.paquetes.length - 1]; }

    _necesitaSpawn() {
        const u = this._ultimo();
        return !u || u.x > (this.inicioX + this.separacion);
    }

    // genera un paquete nuevo según la función muestreadora (p.ej. secuencia random)
    spawnear(siguienteValorFn) {
        if (!this._necesitaSpawn()) return;
        const valor = siguienteValorFn();
        const id = `${Date.now()}-${Math.random()}`;
        this.paquetes.push(new Paquete(id, valor, this.inicioX, this.y));
    }

    // avanza los paquetes y limpia los que salieron de la banda
    avanzar() {
        this.paquetes = this.paquetes
            .map(p => { p.avanzar(this.velocidad); return p; })
            .filter(p => p.x < this.finX);
    }
}