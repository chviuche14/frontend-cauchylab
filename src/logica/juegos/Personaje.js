export default class Personaje {
    constructor(x = 18, y = 60) {
        this.x = x;
        this.y = y;
        this.carga = null; // valor numérico del paquete que lleva
    }

    mover(dx, dy, limites) {
        const { minX, maxX, minY, maxY } = limites;
        this.x = Math.max(minX, Math.min(maxX, this.x + dx));
        this.y = Math.max(minY, Math.min(maxY, this.y + dy));
    }

    distanciaA(obj) {
        const dx = this.x - obj.x;
        const dy = this.y - obj.y;
        return Math.hypot(dx, dy);
    }
}