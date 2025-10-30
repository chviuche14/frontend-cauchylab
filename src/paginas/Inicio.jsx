import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Iconos (Color primario Fucsia) ---
const Icono = ({ children }) => <div className="flex justify-center mb-4 text-[#F11A7B]">{children}</div>;
const Gamepad2 = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="11" x2="10" y2="11"></line><line x1="8" y1="9" x2="8" y2="13"></line><line x1="15" y1="12" x2="15.01" y2="12"></line><line x1="18" y1="10" x2="18.01" y2="10"></line><path d="M17.32 5H6.68a4 4 0 0 0-3.97 3.59c-.04.25-.05.5-.05.75v5.32c0 .26.01.5.05.75A4 4 0 0 0 6.68 19h10.64a4 4 0 0 0 3.97-3.59c.04-.25.05-.5.05-.75v-5.32c0-.26-.01-.5-.05-.75A4 4 0 0 0 17.32 5z"></path></svg>;
const ArrowRight = () => <svg className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-200" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const Sparkles = () => <svg className="inline-block w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l1.09 3.78L17.85 5.3l-3.78 1.09L12.72 11l-1.09-3.78L6.85 5.3l3.78-1.09z"/><path d="M4 8l0.66 2.28L7.51 11l-2.28.66L4.66 14l-.66-2.28L1.15 11l2.28-.66z"/><path d="M19 15l0.66 2.28L22.51 18l-2.28.66L19.66 21l-.66-2.28L16.15 18l2.28-.66z"/></svg>;
const PlayCircle = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>;


const Inicio = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false); // Mantener por si se usa en otro lugar

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 font-sans relative overflow-hidden">

            {/* Fondo de Grícula Retro Animada */}
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,theme(colors.purple.200)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.purple.200)_1px,transparent_1px)] [background-size:2rem_2rem] animate-pulse"></div>

            {/* Efecto de cursor brillante */}
            <div
                className="pointer-events-none fixed w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-500 ease-out"
                style={{
                    background: 'radial-gradient(circle, #F11A7B 0%, transparent 70%)',
                    left: mousePosition.x - 192,
                    top: mousePosition.y - 192,
                }}
            />

            {/* Elementos flotantes decorativos */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-[#F11A7B]/10 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-[#982176]/10 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
            <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-[#F11A7B]/10 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>

            <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">

                {/* --- Sección Héroe --- */}
                <div className="flex flex-col md:flex-row items-center gap-12 mb-24 md:mb-32">

                    {/* Izquierda: Texto y Botones */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-[#F11A7B]/20 to-[#982176]/20 rounded-full border border-[#F11A7B]/30 animate-pulse">
                            <span className="text-sm font-bold text-[#982176] flex items-center gap-2">
                                <Sparkles /> Nueva Experiencia de Aprendizaje
                            </span>
                        </div>

                        <h1 className="font-bold text-6xl md:text-8xl mb-6 bg-gradient-to-r from-[#F11A7B] via-[#982176] to-[#F11A7B] bg-clip-text text-transparent animate-pulse" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                            CauchyLab
                        </h1>

                        <h2 className="text-xl md:text-2xl mb-10 text-gray-600 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                            Desarrollo de un Software Educativo para la Enseñanza de <span className="text-[#F11A7B] font-bold">Sucesiones</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link
                                to="/login"
                                className="group relative px-8 py-4 bg-gradient-to-r from-[#F11A7B] to-[#d6176c] text-white font-bold text-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#F11A7B]/50 hover:scale-105 active:scale-95"
                                style={{ fontFamily: 'monospace' }}
                            >
            <span className="relative z-10 flex items-center justify-center">
              Comenzar Aventura <ArrowRight />
            </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#d6176c] to-[#F11A7B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </Link>

                            <Link
                                to="/registro"
                                className="group relative px-8 py-4 bg-white text-[#982176] font-bold text-lg rounded-lg border-2 border-[#982176] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#982176]/30 hover:scale-105 active:scale-95"
                                style={{ fontFamily: 'monospace' }}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
            <span className="relative z-10 flex items-center justify-center group-hover:text-white transition-colors duration-300">
              Crear Cuenta
            </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#982176] to-[#F11A7B] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                            </Link>
                        </div>
                    </div>

                    {/* Derecha: Imagen con efectos mejorados */}
                    <div className="flex-1 flex justify-center md:justify-end">
                        <div className="relative w-64 h-64 md:w-96 md:h-96 group">
                            {/* Robot SVG placeholder con animaciones */}
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F11A7B]/20 to-[#982176]/20 rounded-2xl border-4 border-[#982176] shadow-2xl transition-all duration-500 group-hover:border-[#F11A7B] group-hover:shadow-[#F11A7B]/50 group-hover:scale-105 group-hover:rotate-2">
                                {/* Robot Simple */}
                                <svg className="w-3/4 h-3/4 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 200 200" fill="none">
                                    {/* Antena */}
                                    <line x1="100" y1="20" x2="100" y2="40" stroke="#982176" strokeWidth="4" strokeLinecap="round" className="animate-pulse"/>
                                    <circle cx="100" cy="15" r="5" fill="#F11A7B" className="animate-pulse"/>

                                    {/* Cabeza */}
                                    <rect x="60" y="40" width="80" height="60" rx="10" fill="#982176" className="group-hover:fill-[#F11A7B] transition-colors duration-500"/>

                                    {/* Ojos */}
                                    <circle cx="80" cy="65" r="8" fill="white" className="animate-pulse"/>
                                    <circle cx="120" cy="65" r="8" fill="white" className="animate-pulse" style={{ animationDelay: '0.2s' }}/>
                                    <circle cx="80" cy="65" r="4" fill="#F11A7B"/>
                                    <circle cx="120" cy="65" r="4" fill="#F11A7B"/>

                                    {/* Boca */}
                                    <path d="M 80 85 Q 100 92 120 85" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>

                                    {/* Cuerpo */}
                                    <rect x="70" y="110" width="60" height="70" rx="8" fill="#F11A7B" className="group-hover:fill-[#982176] transition-colors duration-500"/>

                                    {/* Panel del pecho */}
                                    <rect x="85" y="125" width="30" height="40" rx="4" fill="white" opacity="0.3"/>

                                    {/* Brazos */}
                                    <rect x="40" y="120" width="20" height="50" rx="10" fill="#982176"/>
                                    <rect x="140" y="120" width="20" height="50" rx="10" fill="#982176"/>
                                </svg>
                            </div>

                            {/* Efectos decorativos con animación */}
                            <div className="absolute -top-2 -left-2 w-1/3 h-1/3 border-t-4 border-l-4 border-[#F11A7B] rounded-tl-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:-top-4 group-hover:-left-4"></div>
                            <div className="absolute -bottom-2 -right-2 w-1/3 h-1/3 border-b-4 border-r-4 border-[#982176] rounded-br-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:-bottom-4 group-hover:-right-4"></div>

                            {/* Partículas flotantes */}
                            <div className="absolute top-10 -left-10 w-4 h-4 bg-[#F11A7B] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                            <div className="absolute bottom-10 -right-10 w-4 h-4 bg-[#982176] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                    </div>
                </div>

                {/* --- Sección de Características (MEJORADA) --- */}
                <div className="mb-24 md:mb-32 text-center relative">
                    <h2 className="font-bold text-4xl text-center mb-4 text-[#982176]" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        ¡Eleva tu aprendizaje con nuestra Práctica Interactiva!
                    </h2>
                    <div className="w-32 h-1 bg-gradient-to-r from-[#F11A7B] to-[#982176] mx-auto mb-16 rounded-full"></div>

                    {/* Elementos decorativos de fondo para la sección */}
                    <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>


                    {/* Tarjeta de Práctica Interactiva con estilo mejorado */}
                    <div className="flex justify-center max-w-6xl mx-auto px-4">
                        <div
                            className="group relative bg-white/90 backdrop-blur-md p-10 rounded-3xl border-4 border-gray-200 transition-all duration-700 shadow-2xl hover:border-[#F11A7B] hover:shadow-2xl hover:shadow-[#F11A7B]/40 hover:-translate-y-4 hover:scale-105 max-w-lg w-full transform rotate-1 group-hover:rotate-0" // Aumentado el padding, borde, tamaño máximo y animación
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)',
                                zIndex: 2
                            }}
                        >
                            {/* Borde brillante animado */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#F11A7B] to-[#982176] opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-700 mb-6 text-[#F11A7B]">
                                    <Icono><Gamepad2 /></Icono>
                                </div>
                                <h3 className="font-bold text-3xl text-center mb-4 text-gray-900 group-hover:text-[#F11A7B] transition-colors duration-300" style={{ fontFamily: 'monospace' }}>
                                    ¡Juega y Aprende Sucesiones!
                                </h3>
                                <p className="text-gray-700 text-lg text-center leading-relaxed mb-8">
                                    Domina los conceptos de las sucesiones matemáticas a través
                                    de juegos. ¡Prepárate para la diversión!
                                </p>
                            </div>

                            {/* Esquinas decorativas */}
                            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#F11A7B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#982176] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>
                </div>

                {/* --- Sección "Quiénes Somos" --- */}
                <div className="relative bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-md p-10 rounded-2xl border-2 border-gray-200 shadow-2xl max-w-5xl mx-auto overflow-hidden">
                    {/* Efecto de brillo de fondo */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F11A7B]/10 to-[#982176]/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <h3 className="font-bold text-3xl text-center mb-6 bg-gradient-to-r from-[#982176] to-[#F11A7B] bg-clip-text text-transparent" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                            ¿Quiénes Somos?
                        </h3>

                        <div className="w-24 h-1 bg-gradient-to-r from-[#F11A7B] to-[#982176] mx-auto mb-8 rounded-full"></div>

                        <p className="text-lg text-center mb-6 text-gray-900">
                            <strong className="text-[#982176]">Desarrollado por: Christian Viuche</strong>
                        </p>

                        <p className="text-gray-700 text-center max-w-3xl mx-auto leading-relaxed text-lg">
                            Soy un estudiante de <span className="text-[#F11A7B] font-semibold">Ingeniería de Sistemas</span> apasionado por la educación y la tecnología.
                            CauchyLab nace de la necesidad de hacer más accesible y divertido el aprendizaje de las
                            matemáticas, específicamente las <span className="text-[#982176] font-semibold">sucesiones</span>.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Inicio;