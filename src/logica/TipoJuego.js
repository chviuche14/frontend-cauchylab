// ruta/a/tu/logica/TipoJuego.js

const DEFAULT_BASE_URL =
    import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";

export default class TipoJuego {
    static #instance = null;

    static getInstance() {
        if (!TipoJuego.#instance) {
            TipoJuego.#instance = new TipoJuego();
        }
        return TipoJuego.#instance;
    }

    constructor() {
        this.baseURL = DEFAULT_BASE_URL;
    }

    async #jsonFetch(path, { method = "GET", body } = {}) {
        const url = `${this.baseURL}${path}`;

        const options = {
            method,
            headers: body ? { "Content-Type": "application/json" } : undefined,
            credentials: "include", // Envía cookies (para sesiones de auth)
            body: body ? JSON.stringify(body) : undefined,
        };

        const res = await fetch(url, options);

        let data = null;
        try {
            data = await res.json();
        } catch {
            // Petición vacía (ej. 204 No Content)
        }

        if (!res.ok) {
            const msg = data?.error || `Error ${res.status} en ${method} ${url}`;
            const err = new Error(msg);
            err.status = res.status;
            err.payload = data;
            throw err;
        }

        return data;
    }

    // --- Métodos Públicos (para usuarios) ---
    async listar() {
        // CORRECCIÓN: La API devuelve el array directamente.
        const data = await this.#jsonFetch("/api/tipos-juegos");
        return data || [];
    }

    async obtener(id) {
        // CORRECCIÓN: La API devuelve el objeto directamente.
        const data = await this.#jsonFetch(`/api/tipos-juegos/${id}`);
        return data;
    }

    // --- Métodos de Administración (para admins) ---
    async adminListar() {
        // CORRECCIÓN: La ruta /admin/all no existía en tu backend.
        // Se usa la ruta general que sí existe.
        const data = await this.#jsonFetch("/api/tipos-juegos");
        return data || [];
    }

    async crear({ nombre, descripcion }) {
        const data = await this.#jsonFetch("/api/tipos-juegos", {
            method: "POST",
            body: { nombre, descripcion },
        });
        return data.id;
    }

    async actualizar(id, patch) {
        await this.#jsonFetch(`/api/tipos-juegos/${id}`, {
            method: "PUT",
            body: patch,
        });
        return true;
    }

    async eliminar(id) {
        await this.#jsonFetch(`/api/tipos-juegos/${id}`, { method: "DELETE" });
        return true;
    }
}