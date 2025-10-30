import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- Íconos (Sin cambios) ---
const ArrowLeft = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         className="w-8 h-8 md:w-10 md:h-10">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const UserIcon = () => (
    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const LockIcon = () => (
    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const XIcon = () => (
    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const EyeIcon = ({ open = false }) => (
    open ? (
        <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l22 22"></path>
            <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12c.46-1.02 1.08-1.99 1.84-2.88M9.9 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.89 11 8- .53 1.18-1.29 2.27-2.22 3.22M14.12 14.12a3 3 0 01-4.24-4.24"/>
        </svg>
    ) : (
        <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    )
);

// --- Componente ---
const InicioSesion = () => {
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [focusedField, setFocusedField] = useState(null);
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault();
        if (cargando) return;

        const form = new FormData(event.currentTarget);
        const identifier = form.get("username"); // usuario o email
        const password = form.get("password");

        // Validación simple (requiere que ambos campos tengan *algo*)
        if (!identifier || !password) {
            setError("Completa usuario/email y contraseña.");
            return;
        }

        // --- INICIO DEL TRUCO PARA LA DEMO ---
        setError("");
        setCargando(true);

        // 1. Simular un pequeño retraso de red (para que se vea el spinner)
        setTimeout(() => {

            // 2. Lógica de "truco" para la demo:
            // Si el usuario es 'admin', va al panel de admin.
            // Cualquier otro usuario (con contraseña) va al panel de usuario.
            if (identifier.toLowerCase().startsWith("admin")) {
                // GUARDAMOS un usuario FALSO en localStorage para que el PanelAdmin lo lea
                localStorage.setItem("cauchy_user", JSON.stringify({
                    username: "AdminDemo",
                    email: "admin@cauchy.com",
                    rol: "admin"
                }));
                navigate("/admin");
            } else {
                // GUARDAMOS un usuario FALSO en localStorage para que el Panel lo lea
                localStorage.setItem("cauchy_user", JSON.stringify({
                    username: identifier, // Usamos el nombre que escribiste
                    email: `${identifier}@demo.com`,
                    rol: "user"
                }));
                navigate("/panel");
            }

            setCargando(false);

        }, 800); // 800ms de retraso falso
        // --- FIN DEL TRUCO ---


        /*
        // --- CÓDIGO ORIGINAL CON API REAL (COMENTADO) ---
        try {
            setError("");
            setCargando(true);
            const user = await Usuario.getInstance().iniciarSesion({ identifier, password });

            // Redirigir según el rol del usuario
            if (user.rol === "user") {
                navigate("/panel");
            } else if (user.rol === "admin") {
                navigate("/admin");
            }
        } catch (err) {
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setCargando(false);
        }
        */
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 font-readable relative overflow-hidden flex items-center justify-center py-12 px-4">
            {/* Fondo de Grícula Retro Animada */}
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,theme(colors.purple.200)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.purple.200)_1px,transparent_1px)] [background-size:2rem_2rem] animate-pulse"></div>

            {/* Efecto de cursor brillante */}
            <div
                className="pointer-events-none fixed w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-500 ease-out"
                style={{
                    background: "radial-gradient(circle, #F11A7B 0%, transparent 70%)",
                    left: mousePosition.x - 192,
                    top: mousePosition.y - 192,
                }}
            />

            {/* Botón de regreso estilizado */}
            <Link
                to="/"
                title="Volver al inicio"
                className="absolute z-20 top-6 left-6 md:top-8 md:left-8 p-2 rounded-lg bg-white/80 backdrop-blur-md border-2 border-[#982176] text-[#982176] hover:text-white hover:bg-gradient-to-r hover:from-[#982176] hover:to-[#F11A7B] hover:border-transparent transition-all duration-300 transform hover:scale-110 hover:rotate-[-5deg] shadow-lg hover:shadow-2xl hover:shadow-[#982176]/30"
            >
                <ArrowLeft />
            </Link>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="relative bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-md p-8 md:p-10 rounded-2xl border-2 border-gray-200 shadow-2xl overflow-hidden">
                    {/* Glow decorativo */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F11A7B]/10 to-[#982176]/10 rounded-full blur-3xl"></div>
                    {/* Esquinas */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-[#F11A7B] rounded-tl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-[#982176] rounded-br-lg"></div>

                    <div className="relative z-10">
                        <h2
                            className="font-bold text-3xl md:text-4xl text-center mb-2 bg-gradient-to-r from-[#982176] to-[#F11A7B] bg-clip-text text-transparent"
                            style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                        >
                            Iniciar Sesión
                        </h2>

                        <div className="w-24 h-1 bg-gradient-to-r from-[#F11A7B] to-[#982176] mx-auto mb-8 rounded-full"></div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 rounded-lg border-2 border-red-300 bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-4 py-3 flex items-center gap-2 animate-pulse shadow-lg">
                                <XIcon />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                            {/* Usuario / Email */}
                            <div className="relative group">
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-bold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-[#F11A7B]"
                                >
                                    Usuario o Email
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <UserIcon />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="user o admin" // Actualizado placeholder
                                        onFocus={() => setFocusedField("username")}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F11A7B]/50 focus:border-[#F11A7B] text-gray-900 placeholder:text-gray-400 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-[#982176]/50"
                                        autoComplete="username"
                                        required
                                    />
                                    {focusedField === "username" && (
                                        <div className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-[#F11A7B] to-[#982176] animate-pulse"></div>
                                    )}
                                </div>
                            </div>

                            {/* Contraseña */}
                            <div className="relative group">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-bold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-[#F11A7B]"
                                >
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <LockIcon />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPass ? "text" : "password"}
                                        placeholder="•••••••• (escribe algo)" // Actualizado placeholder
                                        onFocus={() => setFocusedField("password")}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-11 pr-11 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F11A7B]/50 focus:border-[#F11A7B] text-gray-900 placeholder:text-gray-400 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-[#982176]/50"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition"
                                        title={showPass ? "Ocultar" : "Mostrar"}
                                        aria-label="Mostrar u ocultar contraseña"
                                    >
                                        <EyeIcon open={showPass} />
                                    </button>

                                    {focusedField === "password" && (
                                        <div className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-[#F11A7B] to-[#982176] animate-pulse"></div>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={cargando}
                                className={`group relative mt-2 px-8 py-4 bg-gradient-to-r from-[#F11A7B] to-[#d6176c] text-white font-bold text-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#F11A7B]/50 hover:scale-105 active:scale-95 ${
                                    cargando ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                                style={{ fontFamily: "monospace" }}
                            >
                <span className="relative z-10 flex items-center justify-center">
                  {cargando ? (
                      <>
                          <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                          >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                          </svg>
                          Entrando...
                      </>
                  ) : (
                      "Entrar"
                  )}
                </span>
                                {!cargando && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#d6176c] to-[#F11A7B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Registro link */}
                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                            <p className="text-center text-sm text-gray-600">
                                ¿No tienes una cuenta?{" "}
                                <Link
                                    to="/registro"
                                    className="font-bold text-[#982176] hover:text-[#F11A7B] underline transition-colors duration-200 hover:scale-105 inline-block"
                                >
                                    Regístrate
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InicioSesion;