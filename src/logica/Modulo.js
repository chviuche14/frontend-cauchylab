// logica/Modulo.js (Corregido)

const DEFAULT_BASE_URL =
    import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";

export default class Modulo {
    static #instance = null;

    static getInstance() {
        if (!Modulo.#instance) {
            Modulo.#instance = new Modulo();
        }
        return Modulo.#instance;
    }

    constructor() {
        this.baseURL = DEFAULT_BASE_URL;
    }

    async #jsonFetch(path, { method = "GET", body } = {}) {
        const url = `${this.baseURL}${path}`;
        const options = {
            method,
            headers: body ? { "Content-Type": "application/json" } : undefined,
            credentials: "include",
            body: body ? JSON.stringify(body) : undefined,
        };

        const res = await fetch(url, options);
        let data = null;
        try {
            data = await res.json();
        } catch {}

        if (!res.ok) {
            const msg = data?.error || `Error ${res.status} en ${method} ${url}`;
            const err = new Error(msg);
            err.status = res.status;
            err.payload = data;
            throw err;
        }
        return data;
    }

    async listar() {
        const data = await this.#jsonFetch("/api/modules");
        return data || []; // Asumiendo que la API devuelve un array directamente
    }

    async obtener(id) {
        const data = await this.#jsonFetch(`/api/modules/${id}`);
        return data;
    }

    async adminListar() {
        // OJO: Esta ruta /admin/all no parece existir en tu backend.
        // Usamos la ruta principal que sí existe.
        const data = await this.#jsonFetch("/api/modules");
        return data || [];
    }

    // CORRECCIÓN: Se añadió tipo_juego_id a los parámetros y al body de la petición.
    async crear({ nombre, descripcion, tipo_juego_id, estado = "borrador", slug = null, orden = 1 }) {
        const data = await this.#jsonFetch("/api/modules", {
            method: "POST",
            body: { nombre, descripcion, tipo_juego_id, estado, slug, orden },
        });
        return data.id;
    }

    async actualizar(id, patch) {
        await this.#jsonFetch(`/api/modules/${id}`, {
            method: "PUT",
            body: patch,
        });
        return true;
    }

    async eliminar(id) {
        await this.#jsonFetch(`/api/modules/${id}`, { method: "DELETE" });
        return true;
    }
}