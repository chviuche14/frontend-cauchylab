// src/paginas/JuegoModulo.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"; // <--- Importa useCallback
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Clock, Lightbulb, RotateCcw } from "lucide-react";

// ====== POO ======
// 1. Importa las clases de AMBOS juegos
import JuegoBandaTransportadora from '/src/logica/juegos/JuegoBandaTransportadora.js';
import JuegoCruzarRio from '/src/logica/juegos/JuegoCruzarRio.js'; // <--- NUEVO

// 2. Importa el enum
import { FaseJuego } from '/src/logica/juegos/FaseJuego.js';

// Toast simple
const useToast = () => {
    // Memoiza el objeto toast para que sea estable
    const toast = useMemo(() => ({
        toast: (o) => console.log(`[Toast] ${o.title}: ${o.description}`)
    }), []);
    return toast;
};

// Assets
const personajeImg = "/personaje.png";
const personajeGuia = "/robot.png";

// Botón/ Card (tus componentes)
const RetroButton = ({ children, onClick, disabled = false, className = "bg-primary text-white hover:bg-primary-dark" }) => (
    <button onClick={onClick} disabled={disabled}
            className={`px-4 py-2 rounded font-bold transition-colors duration-200 shadow-md retro-button ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        {children}
    </button>
);
const CyberCard = ({ children, className = "" }) => (
    <div className={`p-6 border-2 border-purple-500 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl ${className}`}>{children}</div>
);

// ====================================================
// Configs
// ====================================================
const NIVEL_CONFIGS = {
    "1": {
        storageKey: "nivel1_banda_done:Definición de sucesión",
        secuencia: [2, 4, 6, 8],
        tipo: "banda", // <--- TIPO BANDA
        nombre: "Banda Transportadora: Sucesión Aritmética",
        tiempo_limite: 60,
        vidas: 3,
        slots: 4,
    },
    "2": {
        storageKey: "nivel2_rio_done:Determinación de una sucesión", // <--- CORREGIDO
        secuencia: [3, 6, 9, 12],                                  // <--- CORREGIDO
        tipo: "rio",                                                 // <--- CORREGIDO
        nombre: "Cruzar el Río: Sucesión Aritmética",                  // <--- CORREGIDO
        tiempo_limite: 90,                                           // <--- CORREGIDO
        vidas: 3,
        slots: 4, // (Irrelevante para el río)
    },
};

// ====================================================
// Sub-componente BANDA (Con 3 correcciones de bugs)
// ====================================================
const JuegoNivel1 = ({ config, onComplete, onNavigateToPanel }) => {
    const { toast } = useToast();

    // ===== Instancia del juego POO
    const juegoRef = useRef(null);
    const [snap, setSnap] = useState(null);
    const [faseUI, setFaseUI] = useState("intro");
    const [mostrarPista, setMostrarPista] = useState(false);

    // Crear instancia + suscripciones
    useEffect(() => {
        const juego = new JuegoBandaTransportadora({
            tiempo_limite: config.tiempo_limite,
            vidas: config.vidas,
            slots: config.slots,
            secuencia: config.secuencia,
        });
        juegoRef.current = juego;

        const offTick = juego.on("tick", (s) => setSnap(s));
        const offFase = juego.on("fase", (s) => {
            setSnap(s);
            setFaseUI(mapearFase(s.fase));
        });
        const offWin = juego.on("ganado", (s) => {
            setSnap(s);
            setFaseUI("cierre");
            toast({ title: "¡Nivel Completado! 🎉", description: "Has superado el desafío de la banda transportadora." });
            onComplete?.(); // <--- BUG FIX 1: Llamar onComplete para guardar progreso
        });
        const offFail = juego.on("perdido", (s) => {
            setSnap(s);
            setFaseUI("fallo");
        });

        setSnap(juego.snapshot());
        setFaseUI("intro");

        return () => { offTick(); offFase(); offWin(); offFail(); juego.detener(); };
    }, [config, onComplete, toast]); // <--- Dependencias estables

    // Teclado
    useEffect(() => {
        const handler = (e) => {
            const j = juegoRef.current;
            if (!j || j.fase !== FaseJuego.EN_CURSO) return;

            const k = e.key.toLowerCase();
            let keyHandled = false;

            if (k === "arrowup" || k === "w") {
                j.procesarInput("mover", "arriba");
                keyHandled = true;
            }
            if (k === "arrowdown" || k === "s") {
                j.procesarInput("mover", "abajo");
                keyHandled = true;
            }
            if (k === "arrowleft" || k === "a") {
                j.procesarInput("mover", "izquierda");
                keyHandled = true;
            }
            if (k === "arrowright" || k === "d") {
                j.procesarInput("mover", "derecha");
                keyHandled = true;
            }

            if (keyHandled) {
                e.preventDefault();
            }
        };

        window.addEventListener("keydown", handler);

        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Mapear fases
    const mapearFase = (faseClase) => {
        switch (faseClase) {
            case FaseJuego.INTRO: return "intro";
            case FaseJuego.EN_CURSO: return "banda";
            case FaseJuego.GANADO: return "cierre";
            case FaseJuego.PERDIDO: return "fallo";
            default: return "intro";
        }
    };

    // D-Pad móvil (llama a la clase)
    const DPad = () => {
        const guard = useRef(0);
        // --- BUG FIX 2: Usar procesarInput con string de dirección ---
        const one = (dir, e) => {
            e.preventDefault();
            const now = performance.now();
            if (now - guard.current < 80) return;
            guard.current = now;
            const j = juegoRef.current;
            if (!j || j.fase !== FaseJuego.EN_CURSO) return;
            j.procesarInput("mover", dir); // <--- Llama a procesarInput
        };
        return (
            <div
                className="md:hidden sticky bottom-0 z-20 w-full px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0)+10px)] bg-black/80 backdrop-blur border-t border-purple-500 select-none"
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="mx-auto grid grid-cols-3 gap-2 max-w-xs">
                    <div />
                    {/* --- BUG FIX 2: Enviar string --- */}
                    <button type="button" className="h-12 rounded-md bg-[#F11A7B] text-white font-bold text-lg active:scale-95 transition-transform"
                            onPointerDown={(e) => one("arriba", e)}>↑</button>
                    <div />
                    <button type="button" className="h-12 rounded-md bg-[#F11A7B] text-white font-bold text-lg active:scale-95 transition-transform"
                            onPointerDown={(e) => one("izquierda", e)}>←</button>
                    <button type="button" className="h-12 rounded-md bg-[#F11A7B] text-white font-bold text-lg active:scale-95 transition-transform"
                            onPointerDown={(e) => one("abajo", e)}>↓</button>
                    <button type="button" className="h-12 rounded-md bg-[#F11A7B] text-white font-bold text-lg active:scale-95 transition-transform"
                            onPointerDown={(e) => one("derecha", e)}>→</button>
                </div>
            </div>
        );
    };

    // Dialogos (tu mismo contenido)
    const DIALOGOS = {
        introduccion: [
            "¡Bienvenido a CauchyLab! Aquí aprenderás sobre sucesiones matemáticas.",
            "En PC usa flechas/WASD. En celular usa el D-Pad de la parte inferior. Recoge un número y colócalo en la ranura correcta."
        ],
        banda: [
            "¡Muy bien! Observa los números que aparecen y muévelos hacia las ranuras.",
            "Recuerda: una sucesión tiene un orden especial, fíjate en el patrón."
        ],
        cierre: [
            "¡Excelente! Has descubierto el orden correcto y formado la sucesión.",
            "Una sucesión es una lista ORDENADA generada por una regla. ¡Nivel completado! 🎉"
        ],
        fallo: [
            "Se acabó el tiempo o te quedaste sin vidas.",
            "Pulsa Volver a Intentar para reiniciar el nivel."
        ],
    };
    const [dialogIndex, setDialogIndex] = useState(0);
    const avanzarDialogo = () => {
        // --- BUG FIX 3: Lógica correcta para seleccionar diálogo ---
        let arr;
        if (faseUI === 'intro') arr = DIALOGOS.introduccion;
        else if (faseUI === 'banda') arr = DIALOGOS.banda;
        else if (faseUI === 'cierre') arr = DIALOGOS.cierre;
        else arr = DIALOGOS.fallo;
        // --- FIN CORRECCIÓN ---

        if (dialogIndex < arr.length - 1) {
            setDialogIndex((i) => i + 1);
        } else {
            if (faseUI === "intro") {
                setDialogIndex(0);
                juegoRef.current?.iniciar();
            } else if (faseUI === "banda") {
                juegoRef.current?.empezarTimers();
            }
        }
    };

    // Reintento
    const reiniciar = (aIntro = true) => {
        setDialogIndex(0);
        juegoRef.current?.reiniciar(aIntro);
        if (aIntro) setFaseUI("intro");
    };

    if (!snap) {
        return <div className="p-6">Cargando juego…</div>;
    }

    // Para resaltar ranura cercana
    const RADIO_RANURA = 6;
    const slotCercano = snap.ranuras.reduce((acc, r) => {
        const dx = snap.personaje.x - r.x;
        const dy = snap.personaje.y - r.y;
        const d = Math.hypot(dx, dy);
        if (d < RADIO_RANURA && (!acc || d < acc.d)) return { r, d };
        return acc;
    }, null);

    return (
        <div className="w-full">
            {/* Fases UI */}
            <CyberCard className="w-full grid grid-cols-3 items-center gap-2 mb-3 p-3 border-purple-700/50">
                {/* Col 1: Pista */}
                <div className="text-sm justify-self-start">
                    <RetroButton
                        onClick={() => setMostrarPista(v => !v)}
                        className="bg-white text-[#982176] border-2 border-[#982176] hover:bg-[#982176] hover:text-white !px-3 !py-1.5 text-xs"
                    >
                        <Lightbulb className="mr-1 w-4 h-4" />
                        {mostrarPista ? "Ocultar" : "Pista"}
                    </RetroButton>
                </div>

                {/* Col 2: Fases */}
                <div className="w-full flex items-center justify-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${faseUI === "intro" ? "bg-[#F11A7B] text-white" : "bg-gray-200 text-gray-600"}`}>Intro</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${faseUI === "banda" ? "bg-[#F11A7B] text-white" : "bg-gray-200 text-gray-600"}`}>Banda</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${faseUI === "cierre" ? "bg-[#F11A7B] text-white" : "bg-gray-200 text-gray-600"}`}>Cierre</span>
                </div>

                {/* Col 3: Stats */}
                <div className="flex items-center justify-self-end gap-3 text-sm font-bold">
                    <span className="flex items-center gap-1 text-yellow-500"><Clock className="w-4 h-4" />{snap.tiempo}s</span>
                    <span className="flex items-center gap-1 text-red-500"><Heart className="w-4 h-4" />{"❤".repeat(snap.vidas)}</span>
                </div>
            </CyberCard>

            {/* Pista */}
            {mostrarPista && (
                <CyberCard className="mb-3 bg-yellow-100 border-yellow-400 !p-3">
                    <p className="font-readable text-sm text-gray-800">
                        <strong>💡 Pista:</strong> Observa el patrón: <strong>{config.secuencia.join(" → ")}</strong>. Coloca cada número en la ranura con su posición:
                        &nbsp;ranura 1 → {config.secuencia[0]}, ranura 2 → {config.secuencia[1]}, etc.
                    </p>
                </CyberCard>
            )}

            {/* Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
                {/* Diálogo */}
                <div className="order-2 xl:order-1 flex flex-col items-center">
                    <CyberCard className="max-w-sm w-full bg-white border-purple-700/50">
                        <div className="font-readable text-sm leading-relaxed min-h-[80px] mb-4 text-gray-700">
                            {/* --- BUG FIX 3: Lógica de diálogos correcta --- */}
                            {faseUI === 'intro' && DIALOGOS.introduccion[dialogIndex]}
                            {faseUI === 'banda' && DIALOGOS.banda[dialogIndex]}
                            {faseUI === 'cierre' && DIALOGOS.cierre[dialogIndex]}
                            {faseUI === 'fallo' && DIALOGOS.fallo[dialogIndex]}
                        </div>
                        <div className="flex justify-center">
                            <RetroButton
                                onClick={avanzarDialogo}
                                disabled={faseUI === "cierre" && dialogIndex === (DIALOGOS.cierre.length - 1)}
                                className="bg-[#982176] text-white hover:bg-[#F11A7B] active:scale-95"
                            >
                                {faseUI === "cierre" && dialogIndex === (DIALOGOS.cierre.length - 1) ? "¡Listo!" : "Siguiente"}
                            </RetroButton>
                        </div>
                    </CyberCard>
                    {/* Personaje guía */}
                    <div className="w-56 h-56 flex items-center justify-center mt-4 ">
                        <img
                            src={personajeGuia}
                            alt="Personaje guía"
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/280x280/8B5CF6/FFFFFF?text=GUIA_BOT"; }}
                        />
                    </div>
                </div>

                {/* Escenario */}
                <div className="order-1 xl:order-2">
                    <CyberCard className="p-0 border-[#F11A7B] shadow-2xl shadow-purple-500/50">
                        <div className="relative w-full h-[500px] bg-gray-900 rounded-lg overflow-hidden select-none">
                            {/* Fondo */}
                            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(241,26,123,.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(241,26,123,.3)_1px,transparent_1px)] [background-size:2rem_2rem]"></div>

                            {/* Banda */}
                            <div className="absolute w-full h-8 bg-gray-500/50 border-y-2 border-[#982176]" style={{ top: `75%`, transform: "translateY(-50%)" }}>
                                <div className="w-full h-full bg-[repeating-linear-gradient(to_right,transparent,transparent_10px,rgba(255,255,255,.1)_10px,rgba(255,255,255,.1)_20px)] animate-[pulse_5s_infinite]"></div>
                            </div>

                            {/* Paquetes (desde snapshot) */}
                            {snap.paquetes.map((p) => (
                                <div key={p.id}
                                     className="absolute w-8 h-8 rounded bg-[#982176] text-white flex items-center justify-center font-bold text-sm border-2 border-white/20 shadow-lg"
                                     style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}>
                                    {p.valor}
                                </div>
                            ))}

                            {/* Ranuras (desde snapshot) */}
                            {snap.ranuras.map((r) => {
                                const placed = r.valor != null;
                                const isNear = slotCercano && slotCercano.r.id === r.id;
                                return (
                                    <div key={r.id}
                                         className={`absolute w-12 h-12 rounded border-2 flex items-center justify-center font-bold text-lg transition-all
                                  ${placed ? "bg-[#F11A7B] text-white border-[#F11A7B]" : "bg-gray-100 text-gray-500 border-gray-400"}
                                  ${isNear ? "ring-4 ring-[#F11A7B]/70 scale-105" : ""}`}
                                         style={{ left: `${r.x}%`, top: `${r.y}%`, transform: "translate(-50%, -50%)" }}>
                                        {placed ? r.valor : r.indice}
                                    </div>
                                );
                            })}

                            {/* Personaje */}
                            <div className="absolute w-32 h-32 flex items-center justify-center transition-transform duration-100 will-change-transform"
                                 style={{ left: `${snap.personaje.x}%`, top: `${snap.personaje.y}%`, transform: "translate(-50%, -50%)" }}>
                                <img
                                    src={personajeImg}
                                    alt="Personaje del juego"
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/160x160/1E3A8A/FFFFFF?text=ROBOT_ERROR"; }}
                                />
                            </div>

                            {/* Paquete “en cabeza” */}
                            {snap.personaje.carga != null && (
                                <div className="absolute w-6 h-6 rounded bg-yellow-400 text-gray-900 flex items-center justify-center font-bold text-xs border border-yellow-700"
                                     style={{ left: `${snap.personaje.x}%`, top: `${snap.personaje.y - 8}%`, transform: "translate(-50%, -50%)" }}>
                                    {snap.personaje.carga}
                                </div>
                            )}

                            {/* Instrucciones */}
                            {faseUI === "banda" && (
                                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded p-2 border border-purple-500">
                                    <p className="text-white text-xs font-readable text-center">
                                        PC: ←↑↓→ / WASD · Móvil: usa el <b>D-Pad</b> inferior. Un toque = un paso.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CyberCard>

                    {/* D-Pad solo en móvil */}
                    {faseUI === "banda" && <DPad />}
                </div>
            </div>

            {/* MODAL FINAL (ganado / perdido) */}
            {(faseUI === "cierre" || faseUI === "fallo") && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <CyberCard className={`max-w-xl w-full text-center bg-white ${faseUI === "cierre" ? "border-[#F11A7B] shadow-2xl shadow-[#F11A7B]/70" : "border-red-600 shadow-2xl shadow-red-600/70"} animate-in zoom-in duration-300`}>
                        {faseUI === "cierre" ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mx-auto mb-4 animate-bounce">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <h2 className="font-bold text-4xl text-[#982176] mb-4">🏆 ¡Nivel Completado!</h2>
                                <p className="text-lg text-gray-700 mb-6">Has descubierto el orden correcto y formado la sucesión. ¡Felicidades!</p>
                                <RetroButton
                                    onClick={() => {
                                        // onComplete se llama en el listener 'offWin'
                                        reiniciar(true);
                                        onNavigateToPanel?.();
                                    }}
                                    className="bg-[#F11A7B] text-white hover:bg-[#982176] active:scale-95"
                                >
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Continuar
                                </RetroButton>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mx-auto mb-4">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <h2 className="font-bold text-4xl text-red-600 mb-4">💥 Juego Terminado</h2>
                                <p className="text-lg text-gray-700 mb-6">Se acabó el tiempo o te quedaste sin vidas. ¡A practicar más!</p>
                                <RetroButton onClick={() => reiniciar(true)} className="bg-red-600 text-white hover:bg-red-700 active:scale-95">
                                    <RotateCcw className="mr-2 w-4 h-4" />
                                    Volver a Intentar
                                </RetroButton>
                            </>
                        )}
                    </CyberCard>
                </div>
            )}
        </div>
    );
};


// ====================================================
// Sub-componente RÍO (NUEVO)
// ====================================================
const JuegoNivel2 = ({ config, onComplete, onNavigateToPanel }) => {
    const { toast } = useToast();

    // ===== Instancia del juego POO
    const juegoRef = useRef(null);
    const [snap, setSnap] = useState(null);
    const [faseUI, setFaseUI] = useState("intro");
    const [mostrarPista, setMostrarPista] = useState(false);

    // Crear instancia + suscripciones
    useEffect(() => {
        // Usa la NUEVA clase JuegoCruzarRio
        const juego = new JuegoCruzarRio({
            tiempo_limite: config.tiempo_limite,
            vidas: config.vidas,
            secuencia: config.secuencia,
        });
        juegoRef.current = juego;

        const offTick = juego.on("tick", (s) => setSnap(s));
        const offFase = juego.on("fase", (s) => {
            setSnap(s);
            setFaseUI(mapearFase(s.fase));
        });
        const offWin = juego.on("ganado", (s) => {
            setSnap(s);
            setFaseUI("cierre");
            toast({ title: "¡Nivel Completado! 🎉", description: "¡Cruzaste el río con éxito!" });
            onComplete?.(); // Llama a onComplete
        });
        const offFail = juego.on("perdido", (s) => {
            setSnap(s);
            setFaseUI("fallo");
        });

        // Primer snapshot
        setSnap(juego.snapshot());
        setFaseUI("intro");

        return () => { offTick(); offFase(); offWin(); offFail(); juego.detener(); };
    }, [config, onComplete, toast]);

    // Mapear fases
    const mapearFase = (faseClase) => {
        switch (faseClase) {
            case FaseJuego.INTRO: return "intro";
            case FaseJuego.EN_CURSO: return "juego"; // "juego" en lugar de "banda"
            case FaseJuego.GANADO: return "cierre";
            case FaseJuego.PERDIDO: return "fallo";
            default: return "intro";
        }
    };

    // Dialogos (específicos del río)
    const DIALOGOS = {
        intro: [
            "¡Bienvenido al Río de las Sucesiones! Comienza en la orilla izquierda.",
            `Debes seguir la regla: ${config.secuencia.join(" → ")}. Al caer en la última piedra, ¡saltarás a la META!`,
        ],
        juego: [
            "Haz clic para saltar en orden. ¡Cuidado con las piedras incorrectas o el tiempo!",
        ],
        cierre: ["¡Excelente! Cruzaste de orilla a orilla siguiendo la sucesión.", "Nivel completado 🎉"],
        fallo: ["El tiempo se agotó o perdiste todas las vidas.", "Inténtalo de nuevo siguiendo la regla."],
    };
    const [dialogIndex, setDialogIndex] = useState(0);
    const avanzarDialogo = () => {
        // --- Lógica de diálogo CORREGIDA ---
        let arr;
        if (faseUI === 'intro') arr = DIALOGOS.intro;
        else if (faseUI === 'juego') arr = DIALOGOS.juego;
        else if (faseUI === 'cierre') arr = DIALOGOS.cierre;
        else arr = DIALOGOS.fallo;
        // --- Fin Corrección ---

        if (dialogIndex < arr.length - 1) {
            setDialogIndex((i) => i + 1);
        } else {
            if (faseUI === "intro") {
                setDialogIndex(0);
                juegoRef.current?.iniciar();
            } else if (faseUI === "juego") {
                juegoRef.current?.empezarTimers();
            }
        }
    };

    // Reintento
    const reiniciar = (aIntro = true) => {
        setDialogIndex(0);
        juegoRef.current?.reiniciar(aIntro);
        if (aIntro) setFaseUI("intro");
    };

    // --- Componentes de UI específicos del Río ---

    // Piedra (visual)
    const PiedraPastito = ({ piedra, onClick, visitada, isError }) => (
        <div
            onClick={onClick}
            className={`absolute w-[10%] h-[10%] cursor-pointer select-none transition-all duration-300 ${visitada ? "scale-105" : "hover:scale-105"}`}
            style={{ left: `${piedra.x}%`, top: `${piedra.y}%`, transform: "translate(-50%, -50%)" }}
        >
            <div className="absolute inset-0 translate-y-2 blur-md opacity-35 rounded-[22px] bg-black/30" />
            <div
                className={`relative w-full h-full rounded-[22px] border-4 bg-gradient-to-br from-[#D9C4B0] to-[#A27B5C] border-[#A27B5C]
                shadow-[inset_0_10px_18px_rgba(255,255,255,0.35),_0_8px_18px_rgba(0,0,0,0.35)]
                ${isError ? "ring-8 ring-red-500/60 animate-pulse" : ""}
                ${visitada ? "ring-4 ring-[#7AE2CF]" : ""}`}
            >
                <div className="absolute bottom-0 left-0 right-0 h-5 rounded-b-[20px] bg-black/10" />
                {visitada && <div className="absolute -inset-1 rounded-[24px] ring-2 ring-white/50 opacity-70" />}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-bold text-xl md:text-2xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
                        {piedra.valor}
                    </span>
                </div>
            </div>
        </div>
    );

    // Orilla (visual)
    const OrillaTag = ({ x, y, side, active = false }) => (
        <div
            className={`absolute w-[90px] h-[70px] rounded-2xl flex items-center justify-center bg-[#1F7D53] border-4 border-[#2A9F5D]
            shadow-[inset_0_6px_10px_rgba(255,255,255,0.35),_0_8px_18px_rgba(0,0,0,0.35)]
            ${active ? "ring-4 ring-emerald-400/70" : "opacity-80"}`}
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
        >
            <span className="font-bold text-sm text-white drop-shadow-lg">
                {side === "inicio" ? "INICIO" : "META"}
            </span>
        </div>
    );

    if (!snap) {
        return <div className="p-6">Cargando juego…</div>;
    }

    // --- Render del Juego 2 ---
    return (
        <div className="w-full">
            {/* Fases UI */}
            <CyberCard className="w-full grid grid-cols-3 items-center gap-2 mb-3 p-3 border-purple-700/50">
                {/* Col 1: Pista */}
                <div className="text-sm justify-self-start">
                    <RetroButton
                        onClick={() => setMostrarPista(v => !v)}
                        className="bg-white text-[#982176] border-2 border-[#982176] hover:bg-[#982176] hover:text-white !px-3 !py-1.5 text-xs"
                    >
                        <Lightbulb className="mr-1 w-4 h-4" />
                        {mostrarPista ? "Ocultar" : "Pista"}
                    </RetroButton>
                </div>

                {/* Col 2: Fases */}
                <div className="w-full flex items-center justify-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${faseUI === "intro" ? "bg-[#F11A7B] text-white" : "bg-gray-200 text-gray-600"}`}>Intro</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${faseUI === "juego" ? "bg-[#F11A7B] text-white" : "bg-gray-200 text-gray-600"}`}>Juego</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${faseUI === "cierre" ? "bg-[#F11A7B] text-white" : "bg-gray-200 text-gray-600"}`}>Cierre</span>
                </div>

                {/* Col 3: Stats */}
                <div className="flex items-center justify-self-end gap-3 text-sm font-bold">
                    <span className="flex items-center gap-1 text-yellow-500"><Clock className="w-4 h-4" />{snap.tiempo}s</span>
                    <span className="flex items-center gap-1 text-red-500"><Heart className="w-4 h-4" />{"❤".repeat(snap.vidas)}</span>
                </div>
            </CyberCard>

            {/* Pista */}
            {mostrarPista && (
                <CyberCard className="mb-3 bg-yellow-100 border-yellow-400 !p-3">
                    <p className="font-readable text-sm text-gray-800">
                        <strong>💡 Pista:</strong> Pisa las piedras en este orden: <strong>{config.secuencia.join(" → ")}</strong>.
                    </p>
                </CyberCard>
            )}

            {/* Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
                {/* Diálogo */}
                <div className="order-2 xl:order-1 flex flex-col items-center">
                    <CyberCard className="max-w-sm w-full bg-white border-purple-700/50">
                        <div className="font-readable text-sm leading-relaxed min-h-[80px] mb-4 text-gray-700">
                            {/* --- CORRECCIÓN AQUÍ --- */}
                            {faseUI === 'intro' && DIALOGOS.intro[dialogIndex]}
                            {faseUI === 'juego' && DIALOGOS.juego[dialogIndex]}
                            {faseUI === 'cierre' && DIALOGOS.cierre[dialogIndex]}
                            {faseUI === 'fallo' && DIALOGOS.fallo[dialogIndex]}
                        </div>
                        <div className="flex justify-center">
                            <RetroButton
                                onClick={avanzarDialogo}
                                disabled={faseUI === "cierre" && dialogIndex === (DIALOGOS.cierre.length - 1)}
                                className="bg-[#982176] text-white hover:bg-[#F11A7B] active:scale-95"
                            >
                                {faseUI === "cierre" && dialogIndex === (DIALOGOS.cierre.length - 1) ? "¡Listo!" : "Siguiente"}
                            </RetroButton>
                        </div>
                    </CyberCard>
                    <div className="w-56 h-56 flex items-center justify-center mt-4 ">
                        <img
                            src={personajeGuia}
                            alt="Personaje guía"
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/280x280/8B5CF6/FFFFFF?text=GUIA_BOT"; }}
                        />
                    </div>
                </div>

                {/* Escenario */}
                <div className="order-1 xl:order-2">
                    <CyberCard className="p-0 border-[#F11A7B] shadow-2xl shadow-purple-500/50">
                        <div className="relative w-full h-[520px] rounded-lg overflow-hidden bg-blue-800">
                            {/* Fondo de Agua */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-80"></div>
                            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,rgba(255,255,255,.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.1)_50%,rgba(255,255,255,.1)_75%,transparent_75%,transparent)] [background-size:60px_60px] animate-pulse"></div>

                            {/* Orillas (Césped) */}
                            <div className="absolute left-0 top-0 bottom-0 w-[22%] bg-green-700 border-r-4 border-green-900"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-[22%] bg-green-700 border-l-4 border-green-900"></div>

                            {/* Orilla Inicio (Tag) */}
                            <OrillaTag x={snap.startPos.x} y={snap.startPos.y} side="inicio" active={false} />

                            {/* Orilla Meta (Tag) */}
                            <OrillaTag x={snap.metaPos.x} y={snap.metaPos.y} side="meta" active={snap.piedrasVisitadas.length === snap.secuencia.length} />

                            {/* Piedras (desde snapshot) */}
                            {snap.piedras.map((p) => (
                                <PiedraPastito
                                    key={p.id}
                                    piedra={p}
                                    onClick={() => juegoRef.current.procesarInput("clickPiedra", p.id)}
                                    visitada={snap.piedrasVisitadas.includes(p.id)}
                                    isError={snap.errorPiedraId === p.id}
                                />
                            ))}

                            {/* Personaje */}
                            <div className="absolute w-32 h-32 flex items-center justify-center transition-all duration-300 ease-out z-10"
                                 style={{ left: `${snap.personaje.x}%`, top: `${snap.personaje.y}%`, transform: "translate(-50%, -50%)" }}>
                                <img
                                    src={personajeImg}
                                    alt="Personaje del juego"
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/160x160/1E3A8A/FFFFFF?text=ROBOT_ERROR"; }}
                                />
                            </div>

                            {/* Progreso */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1/2 bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-purple-500">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-[11px] font-bold">PROGRESO</span>
                                    <span className="text-white text-[11px] font-bold">{snap.piedrasVisitadas.length}/{snap.secuencia.length}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                                    <div
                                        className="h-full bg-[#F11A7B] transition-all duration-500"
                                        style={{ width: `${(snap.piedrasVisitadas.length / snap.secuencia.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CyberCard>
                </div>
            </div>

            {/* MODAL FINAL (ganado / perdido) */}
            {(faseUI === "cierre" || faseUI === "fallo") && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <CyberCard className={`max-w-xl w-full text-center bg-white ${faseUI === "cierre" ? "border-[#F11A7B] shadow-2xl shadow-[#F11A7B]/70" : "border-red-600 shadow-2xl shadow-red-600/70"} animate-in zoom-in duration-300`}>
                        {faseUI === "cierre" ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mx-auto mb-4 animate-bounce">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <h2 className="font-bold text-4xl text-[#982176] mb-4">🏆 ¡Nivel Completado!</h2>
                                <p className="text-lg text-gray-700 mb-6">¡Cruzaste de orilla a orilla, perfecto!</p>
                                <RetroButton
                                    onClick={() => {
                                        reiniciar(true);
                                        onNavigateToPanel?.();
                                    }}
                                    className="bg-[#F11A7B] text-white hover:bg-[#982176] active:scale-95"
                                >
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Continuar
                                </RetroButton>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mx-auto mb-4">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <h2 className="font-bold text-4xl text-red-600 mb-4">💥 Juego Terminado</h2>
                                <p className="text-lg text-gray-700 mb-6">Se acabó el tiempo o te quedaste sin vidas. ¡A practicar más!</p>
                                <RetroButton onClick={() => reiniciar(true)} className="bg-red-600 text-white hover:bg-red-700 active:scale-95">
                                    <RotateCcw className="mr-2 w-4 h-4" />
                                    Volver a Intentar
                                </RetroButton>
                            </>
                        )}
                    </CyberCard>
                </div>
            )}
        </div>
    );
};


// =======================================================
// WRAPPER (Controlador Principal)
// =======================================================
const JuegoModulo = () => {
    const { moduloId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast(); // <--- Ahora es estable

    // Quitado el mouse tracker para EVITAR EL BUCLE INFINITO
    // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    // useEffect(() => {
    //     const onMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    //     window.addEventListener("mousemove", onMove);
    //     return () => window.removeEventListener("mousemove", onMove);
    // }, []);

    const nivelConfig = useMemo(() => {
        const id = moduloId || "1";
        return NIVEL_CONFIGS[id] || NIVEL_CONFIGS["1"] || null;
    }, [moduloId]);

    // --- CORRECCIÓN DEL BUCLE: Usar useCallback ---
    // Estas funciones ahora son estables y no causarán re-renders infinitos
    const handleLevelComplete = useCallback(() => {
        if (nivelConfig?.storageKey) localStorage.setItem(nivelConfig.storageKey, "true");
        // El toast ya se maneja dentro de cada sub-componente
    }, [nivelConfig]); // Depende de nivelConfig

    const handleNavigateToPanel = useCallback(() => {
        navigate("/panel");
    }, [navigate]); // Depende de navigate

    if (!nivelConfig) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <CyberCard className="max-w-md w-full text-center bg-red-50 border-red-500">
                    <h2 className="text-red-600 font-bold text-xl">Error de Configuración</h2>
                    <div className="p-4">
                        <p className="mb-4 text-gray-700">No se encontró una configuración de juego válida para el módulo.</p>
                        <Link to="/panel" replace>
                            <RetroButton className="bg-red-600 hover:bg-red-700">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Volver al Panel
                            </RetroButton>
                        </Link>
                    </div>
                </CyberCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 font-readable relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,theme(colors.purple.200)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.purple.200)_1px,transparent_1px)] [background-size:2rem_2rem] animate-pulse"></div>

            {/* Quitado el div del mouse-tracker para evitar el bucle */}
            {/* <div
                className="pointer-events-none fixed w-96 h-96 ..."
            /> */}

            <div className="relative z-10 container mx-auto px-4 py-4">
                <Link to="/panel" className="absolute top-4 left-4 z-20">
                    <RetroButton className="bg-white text-[#982176] border-2 border-[#982176] hover:bg-[#982176] hover:text-white">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Volver al Panel
                    </RetroButton>
                </Link>

                <div className="max-w-6xl mx-auto pt-2">
                    <h1
                        className="font-bold text-4xl md:text-5xl text-center mb-1 bg-gradient-to-r from-[#F11A7B] via-[#982176] to-[#F11A7B] bg-clip-text text-transparent"
                        style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                    >
                        CAUCHYLAB
                    </h1>
                    <h2 className="text-2xl font-bold text-center mb-2 text-[#982176]">
                        {nivelConfig.nombre.toUpperCase()}
                    </h2>
                    <p className="text-center text-gray-600 mb-3">{nivelConfig.storageKey.split(":")[1]}</p>

                    {/* ================================================== */}
                    {/* <--- ¡AQUÍ ESTÁ LA MAGIA! ---> */}
                    {/* ================================================== */}
                    {/* Render condicional basado en el tipo de config */}

                    {nivelConfig.tipo === "banda" && (
                        <JuegoNivel1
                            config={nivelConfig}
                            onComplete={handleLevelComplete}
                            onNavigateToPanel={handleNavigateToPanel}
                        />
                    )}

                    {nivelConfig.tipo === "rio" && (
                        <JuegoNivel2
                            config={nivelConfig}
                            onComplete={handleLevelComplete}
                            onNavigateToPanel={handleNavigateToPanel}
                        />
                    )}

                </div>
            </div>

            <footer className="relative z-10 p-4 text-center text-xs text-gray-500 border-t mt-16">
                &copy; {new Date().getFullYear()} CauchyLab. Un desafío de sucesiones.
            </footer>
        </div>
    );
};

export default JuegoModulo;