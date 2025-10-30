export default class Paquete {
    constructor(id, valor, x, y) {
        this.id = id;
        this.valor = valor;
        this.x = x;
        this.y = y;
    }

    avanzar(dx) { this.x += dx; }
}