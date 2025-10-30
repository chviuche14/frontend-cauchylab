export default class Ranura {
    constructor(id, indice, x, y) {
        this.id = id;          // "r1","r2",…
        this.indice = indice;  // 1..N
        this.x = x;
        this.y = y;
        this.valor = null;     // número colocado (si ya fue correcto)
    }

    estaLibre() { return this.valor === null; }
}