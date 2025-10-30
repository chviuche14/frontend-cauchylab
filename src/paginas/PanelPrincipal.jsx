import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Usuario from "@/logica/Usuario";
import Modulo from "@/logica/Modulo";
import { GraduationCap, Layers, Puzzle, Rocket } from "lucide-react";

/* ======================= Íconos inline (logout / practicar) ======================= */
const LogOut = () => (
    <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);
const Gamepad2 = () => (
    <svg className="mr-2 w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="11" x2="10" y2="11"></line>
        <line x1="8" y1="9" x2="8" y2="13"></line>
        <line x1="15" y1="12" x2="15.01" y2="12"></line>
        <line x1="18" y1="10" x2="18.01" y2="10"></line>
        <path d="M17.32 5H6.68a4 4 0 0 0-3.97 3.59c-.04.25-.05.5-.05.75v5.32c0 .26.01.5.05.75A4 4 0 0 0 6.68 19h10.64a4 4 0 0 0 3.97-3.59c.04-.25.05-.5.05-.75v-5.32c0-.26-.01-.5-.05-.75A4 4 0 0 0 17.32 5z"></path>
    </svg>
);
/* ================================================================================== */

const PanelPrincipal = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(Usuario.getInstance().getUser());
    const [saliendo, setSaliendo] = useState(false);

    // Módulos ya filtrados por estado 'publicado'
    const [modules, setModules] = useState([]);
    const [loadingMods, setLoadingMods] = useState(true);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Glow que sigue el cursor
    useEffect(() => {
        const onMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    // Validar sesión
    useEffect(() => {
        if (!user) {
            Usuario.getInstance()
                .yo()
                .then(setUser)
                .catch(() => navigate("/login", { replace: true }));
        }
    }, [user, navigate]);

    // Cargar y filtrar módulos
    useEffect(() => {
        setLoadingMods(true);
        Modulo.getInstance()
            .listar()
            .then((allModules) => {
                // Filtra solo los módulos cuyo estado es 'publicado'
                const publishedModules = allModules.filter(m => m.estado === 'publicado');
                setModules(publishedModules);
            })
            .catch((err) => alert(err.message || "No se pudieron cargar los módulos"))
            .finally(() => setLoadingMods(false));
    }, []);

    const handleLogout = async () => {
        if (saliendo) return;
        try {
            setSaliendo(true);
            await Usuario.getInstance().cerrarSesion();
            navigate("/login", { replace: true });
        } catch (e) {
            alert(e.message || "No se pudo cerrar sesión");
        } finally {
            setSaliendo(false);
        }
    };

    // Botón principal (mismo estilo que Inicio)
    const btnMain =
        "group relative px-5 py-3 bg-gradient-to-r from-[#F11A7B] to-[#d6176c] text-white font-bold text-sm rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#F11A7B]/50 hover:scale-[1.02] active:scale-95";

    // Íconos de lucide para los módulos (rotan por índice)
    const moduleIcons = [GraduationCap, Layers, Puzzle, Rocket];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Cargando panel…
            </div>
        );
    }

    if (loadingMods) {
        return (
            <div className="min-h-screen relative flex items-center justify-center text-gray-600">
                {/* Fondo */}
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,theme(colors.purple.200)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.purple.200)_1px,transparent_1px)] [background-size:2rem_2rem] animate-pulse"></div>
                <div className="animate-pulse bg-white/80 px-6 py-4 rounded-xl border-2 border-gray-200 shadow-xl">
                    Cargando módulos…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 font-readable relative overflow-hidden">
            {/* Fondo de Grícula Retro Animada */}
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,theme(colors.purple.200)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.purple.200)_1px,transparent_1px)] [background-size:2rem_2rem] animate-pulse"></div>

            {/* Glow que sigue el cursor */}
            <div
                className="pointer-events-none fixed w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-500 ease-out"
                style={{
                    background: "radial-gradient(circle, #F11A7B 0%, transparent 70%)",
                    left: mousePosition.x - 192,
                    top: mousePosition.y - 192,
                }}
            />

            {/* Burbujas decorativas */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-[#F11A7B]/10 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-[#982176]/10 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
            <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-[#F11A7B]/10 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>

            <div className="relative z-10 container mx-auto px-4 py-10 md:py-12">
                {/* ================= Header ================= */}
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
                    <div>
                        <h1
                            className="font-bold text-4xl md:text-6xl bg-gradient-to-r from-[#F11A7B] via-[#982176] to-[#F11A7B] bg-clip-text text-transparent"
                            style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                        >
                            CAUCHYLAB
                        </h1>
                        <p className="font-readable text-lg text-gray-600 mt-1">
                            ¡Bienvenido, <span className="text-[#982176] font-bold">{user.username}</span>!
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={saliendo}
                        className={`group relative overflow-hidden font-semibold text-sm px-5 py-2 rounded-lg border-2 border-[#F11A7B] text-[#F11A7B] transition-all duration-300
              ${saliendo ? "opacity-60 cursor-not-allowed"
                            : "hover:text-white hover:shadow-2xl hover:shadow-[#F11A7B]/30"}`}
                        title="Cerrar sesión"
                    >
            <span className="relative z-10 flex items-center">
              <LogOut />
                {saliendo ? "Saliendo..." : "Salir"}
            </span>
                        {!saliendo && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#982176] to-[#F11A7B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </>
                        )}
                    </button>
                </header>

                {/* ================= Grid de Módulos ================= */}
                <main>
                    <h2
                        className="font-bold text-5xl text-center mb-4 text-[#982176]"
                        style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                    >
                        Módulos de Aprendizaje
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#F11A7B] to-[#982176] mx-auto mb-10 rounded-full"></div>

                    {modules.length === 0 ? (
                        <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl border-2 border-gray-200 shadow-2xl text-center text-gray-600">
                            Aún no hay módulos publicados para mostrar.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                            {modules.map((m, idx) => {
                                const Icon = moduleIcons[idx % moduleIcons.length];
                                return (
                                    <div
                                        key={m.id}
                                        className="group relative bg-white/90 backdrop-blur-md rounded-2xl border-2 border-gray-200 shadow-lg p-8 md:p-9 flex flex-col min-h-[16rem] md:min-h-[18rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-[#F11A7B]"
                                    >
                                        {/* Glow y esquinas: NO bloquean clics */}
                                        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F11A7B] to-[#982176] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"></div>
                                        <div className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#F11A7B] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#982176] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex items-start justify-start mb-4">
                                            {/* Etiqueta de Estado - La dejamos arriba sola */}
                                            <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                Publicado
                                            </span>
                                        </div>

                                        {/* Título con icono lucide al lado */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="shrink-0">
                                                <Icon className="w-10 h-10 text-[#F11A7B]" />
                                            </div>
                                            <h3 className="font-pixel text-xl text-gray-900 leading-snug">
                                                {m.nombre}
                                            </h3>
                                        </div>

                                        <p className="font-readable text-sm text-gray-600 flex-grow mb-3">
                                            {m.descripcion || "Sin descripción"}
                                        </p>

                                        {/* TIPO DE JUEGO MOVIDO AQUÍ */}
                                        {m.tipo_juego_nombre && (
                                            <p className="font-bold text-xs text-indigo-700 mb-6 bg-indigo-50 border border-indigo-200 py-1 px-2 rounded-lg inline-block self-start">
                                                Tipo de Juego: {m.tipo_juego_nombre}
                                            </p>
                                        )}
                                        {/* FIN TIPO DE JUEGO MOVIDO */}


                                        {/* ÚNICO BOTÓN: ¡Practicar! */}
                                        <Link to={`/juego/${m.orden}`} className={btnMain}>
    <span className="relative z-10 flex items-center justify-center">
        <Gamepad2 /> ¡Practicar!
    </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#d6176c] to-[#F11A7B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PanelPrincipal;