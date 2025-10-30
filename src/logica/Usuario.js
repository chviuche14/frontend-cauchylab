// src/logica/Usuario.js
const DEFAULT_BASE_URL =
    import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";

export default class Usuario {
    static #instance = null;

    static getInstance() {
        if (!Usuario.#instance) {
            Usuario.#instance = new Usuario();
        }
        return Usuario.#instance;
    }

    constructor() {
        this.baseURL = DEFAULT_BASE_URL;
        this.currentUser = null;

        // Lee localStorage al iniciar
        try {
            const raw = localStorage.getItem("cauchy_user");
            if (raw) this.currentUser = JSON.parse(raw);
        } catch (_) {}
    }

    #saveUser(user) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem("cauchy_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("cauchy_user");
        }
    }

    getUser() {
        return this.currentUser;
    }

    isAutenticado() {
        return !!this.currentUser;
    }

    isAdmin() {
        return this.currentUser?.rol === "admin";
    }

    hasRole(role) {
        return this.currentUser?.rol === role;
    }

    async #jsonFetch(path, { method = "GET", body } = {}) {
        const res = await fetch(`${this.baseURL}${path}`, {
            method,
            headers: body ? { "Content-Type": "application/json" } : undefined,
            credentials: "include",
            body: body ? JSON.stringify(body) : undefined,
        });

        let data = null;
        try {
            data = await res.json();
        } catch {
            // respuesta vacía
        }

        if (!res.ok) {
            const msg = data?.error || `Error ${res.status}`;
            const err = new Error(msg);
            err.status = res.status;
            err.payload = data;
            throw err;
        }

        return data;
    }

    async registrar({ username, email, password }) {
        const data = await this.#jsonFetch("/api/auth/register", {
            method: "POST",
            body: { username, email, password },
        });
        this.#saveUser(data.user);
        return data.user;
    }

    async iniciarSesion({ identifier, password }) {
        const data = await this.#jsonFetch("/api/auth/login", {
            method: "POST",
            body: { identifier, password },
        });
        this.#saveUser(data.user);
        return data.user;
    }

    async yo() {
        const data = await this.#jsonFetch("/api/auth/me");
        this.#saveUser(data.user);
        return data.user;
    }

    async cerrarSesion() {
        await this.#jsonFetch("/api/auth/logout", { method: "POST" });
        this.#saveUser(null);
        return true;
    }
}
