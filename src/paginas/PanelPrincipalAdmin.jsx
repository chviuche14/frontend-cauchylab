// ruta/a/tu/componente/PanelPrincipalAdmin.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2, Plus, List, AlertCircle, Pencil, Trash2, X } from 'lucide-react';
import Usuario from '@/logica/Usuario';
import Modulo from '@/logica/Modulo';
import TipoJuego from '@/logica/TipoJuego';

const PanelPrincipalAdmin = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(Usuario.getInstance().getUser());
    const [saliendo, setSaliendo] = useState(false);
    const [modules, setModules] = useState([]);
    const [tiposJuegos, setTiposJuegos] = useState([]);
    const [loadingMods, setLoadingMods] = useState(false);
    const [loadingTipos, setLoadingTipos] = useState(false);

    const [activeView, setActiveView] = useState('dashboard');
    const [newModuleData, setNewModuleData] = useState({ nombre: '', descripcion: '', slug: '', orden: 1, tipo_juego_id: '' });
    const [newTipoJuegoData, setNewTipoJuegoData] = useState({ nombre: '', descripcion: '' });

    const [editingModule, setEditingModule] = useState(null);
    const [editingTipoJuego, setEditingTipoJuego] = useState(null);

    const [isCreating, setIsCreating] = useState(false);
    const [isCreatingTipoJuego, setIsCreatingTipoJuego] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [error, setError] = useState('');
    const [tipoJuegoError, setTipoJuegoError] = useState('');

    const handleLogout = async () => {
        if (saliendo) return;
        try {
            setSaliendo(true);
            await Usuario.getInstance().cerrarSesion();
            setUser(null);
            navigate("/", { replace: true });
        } catch (e) {
            alert(e.message || "No se pudo cerrar sesión");
        } finally {
            setSaliendo(false);
        }
    };

    const fetchModules = () => {
        setLoadingMods(true);
        setError('');
        Modulo.getInstance()
            .adminListar()
            .then(setModules)
            .catch((err) => {
                const errorMsg = err.message || "No se pudieron cargar los módulos";
                setError(errorMsg);

                if (errorMsg.toLowerCase().includes('autenticado')) {

                    alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
                    handleLogout();
                }
            })
            .finally(() => setLoadingMods(false));
    };

    const fetchTiposJuegos = () => {
        setLoadingTipos(true);
        setTipoJuegoError('');
        TipoJuego.getInstance()
            .listar()
            .then(setTiposJuegos)
            .catch((err) => {
                const errorMsg = err.message || "No se pudieron cargar los tipos de juegos";
                setTipoJuegoError(errorMsg);
                if (errorMsg.toLowerCase().includes('autenticado')) {
                    alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
                    handleLogout();
                }
            })
            .finally(() => setLoadingTipos(false));
    };

    useEffect(() => {
        fetchTiposJuegos();
    }, []);

    useEffect(() => {
        if (activeView === 'viewModules' || activeView === 'editModule') {
            fetchModules();
        } else if (activeView === 'viewTiposJuegos' || activeView === 'editTipoJuego') {
            fetchTiposJuegos();
        }
    }, [activeView]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewModuleData(prev => ({
            ...prev,
            [name]: name === 'orden' ? (value === '' ? '' : parseInt(value, 10)) : value
        }));
    };

    const handleTipoJuegoInputChange = (e) => {
        const { name, value } = e.target;
        setNewTipoJuegoData(prev => ({ ...prev, [name]: value }));
    };

    // --- MANEJO DE MÓDULOS (CRUD) ---

    const handleCreateModule = async (e) => {
        e.preventDefault();
        setError('');
        if (isCreating) return;

        if (!newModuleData.nombre.trim() || !newModuleData.descripcion.trim() || !newModuleData.tipo_juego_id) {
            setError("El nombre, la descripción y el tipo de juego son obligatorios.");
            return;
        }

        const generatedSlug = newModuleData.nombre
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');

        const dataToSend = {
            ...newModuleData,
            slug: generatedSlug,
        };

        setIsCreating(true);
        try {
            await Modulo.getInstance().crear(dataToSend);
            setNewModuleData({ nombre: '', descripcion: '', slug: '', orden: 1, tipo_juego_id: '' });
            setActiveView('viewModules');
        } catch (err) {
            setError(err.message || "Error al crear el módulo. Inténtalo de nuevo.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditModule = (id) => {
        const moduleToEdit = modules.find((module) => module.id === id);
        if (moduleToEdit) {
            setEditingModule(id);
            setNewModuleData({
                nombre: moduleToEdit.nombre,
                descripcion: moduleToEdit.descripcion,
                slug: moduleToEdit.slug,
                tipo_juego_id: moduleToEdit.tipo_juego_id,
                orden: moduleToEdit.orden,
                estado: moduleToEdit.estado
            });
            setActiveView('editModule');
        }
    };

    const handleUpdateModule = async (e) => {
        e.preventDefault();
        setError('');
        if (isUpdating || !editingModule) return;

        if (!newModuleData.nombre.trim() || !newModuleData.descripcion.trim() || !newModuleData.tipo_juego_id) {
            setError("El nombre, la descripción y el tipo de juego son obligatorios.");
            return;
        }

        const generatedSlug = newModuleData.nombre
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');

        const dataToSend = {
            ...newModuleData,
            slug: generatedSlug,
        };

        setIsUpdating(true);
        try {
            await Modulo.getInstance().actualizar(editingModule, dataToSend);
            setEditingModule(null);
            setNewModuleData({ nombre: '', descripcion: '', slug: '', orden: 1, tipo_juego_id: '' });
            setActiveView('viewModules');
        } catch (err) {
            setError(err.message || "Error al actualizar el módulo.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteModule = async (id) => {
        if (isDeleting) return;
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el módulo con ID: ${id}?`)) {
            return;
        }

        setIsDeleting(true);
        setError('');
        try {
            await Modulo.getInstance().eliminar(id);
            fetchModules();
        } catch (err) {
            setError(err.message || "Error al eliminar el módulo.");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- MANEJO DE TIPOS DE JUEGO (CRUD) ---

    const handleCreateTipoJuego = async (e) => {
        e.preventDefault();
        setTipoJuegoError('');
        if (isCreatingTipoJuego) return;

        if (!newTipoJuegoData.nombre.trim() || !newTipoJuegoData.descripcion.trim()) {
            setTipoJuegoError("El nombre y la descripción son obligatorios.");
            return;
        }

        setIsCreatingTipoJuego(true);
        try {
            await TipoJuego.getInstance().crear(newTipoJuegoData);
            setNewTipoJuegoData({ nombre: '', descripcion: '' });
            setActiveView('viewTiposJuegos');
        } catch (err) {
            setTipoJuegoError(err.message || "Error al crear el tipo de juego.");
        } finally {
            setIsCreatingTipoJuego(false);
        }
    };

    const handleEditTipoJuego = (id) => {
        const tipoToEdit = tiposJuegos.find((tipo) => tipo.id === id);
        if (tipoToEdit) {
            setEditingTipoJuego(id);
            setNewTipoJuegoData({
                nombre: tipoToEdit.nombre,
                descripcion: tipoToEdit.descripcion,
            });
            setActiveView('editTipoJuego');
        }
    };

    const handleUpdateTipoJuego = async (e) => {
        e.preventDefault();
        setTipoJuegoError('');
        if (isUpdating || !editingTipoJuego) return;

        if (!newTipoJuegoData.nombre.trim() || !newTipoJuegoData.descripcion.trim()) {
            setTipoJuegoError("El nombre y la descripción son obligatorios.");
            return;
        }

        setIsUpdating(true);
        try {
            await TipoJuego.getInstance().actualizar(editingTipoJuego, newTipoJuegoData);
            setEditingTipoJuego(null);
            setNewTipoJuegoData({ nombre: '', descripcion: '' });
            setActiveView('viewTiposJuegos');
        } catch (err) {
            setTipoJuegoError(err.message || "Error al actualizar el tipo de juego.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteTipoJuego = async (id) => {
        if (isDeleting) return;
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el Tipo de Juego con ID: ${id}?`)) {
            return;
        }

        setIsDeleting(true);
        setTipoJuegoError('');
        try {
            await TipoJuego.getInstance().eliminar(id);
            fetchTiposJuegos();
        } catch (err) {
            setTipoJuegoError(err.message || "Error al eliminar el Tipo de Juego. Asegúrate de que no tenga módulos asociados.");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- FUNCIÓN DE UTILIDAD PARA FORMATO DE FECHA ---
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        // Convertir la cadena de fecha a objeto Date
        const date = new Date(dateString);
        // Opciones para el formato de fecha y hora local
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        // Devolver la fecha formateada en español
        return date.toLocaleDateString('es-ES', options);
    };

    // --- VISTAS / RENDERS ---

    const renderCreateModule = () => (
        // ... (Sin cambios)
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Módulo</h2>
            <form onSubmit={handleCreateModule}>
                {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>}
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2 text-gray-600">Nombre del Módulo</label>
                    <input name="nombre" type="text" value={newModuleData.nombre} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" required />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2 text-gray-600">Descripción</label>
                    <textarea name="descripcion" value={newModuleData.descripcion} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" rows="4" required />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2 text-gray-600">Tipo de Juego</label>
                    <select name="tipo_juego_id" value={newModuleData.tipo_juego_id} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" required>
                        <option value="">Seleccione un tipo de juego</option>
                        {tiposJuegos.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" disabled={isCreating} className="w-full bg-[#F11A7B] text-white px-6 py-3 rounded-md hover:bg-[#982176] transition-colors">
                    {isCreating ? <Loader2 className="animate-spin mr-2 w-5 h-5 inline" /> : "Crear Módulo"}
                </button>
            </form>
        </div>
    );

    const renderEditModule = () => {
        // ... (Sin cambios)
        if (!editingModule) return <p className="text-red-500">Error: Módulo no seleccionado para editar.</p>;

        return (
            <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Editar Módulo (ID: {editingModule})</h2>
                    <button onClick={() => setActiveView('viewModules')} className="text-gray-500 hover:text-gray-800 transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleUpdateModule}>
                    {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>}
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-600">Nombre del Módulo</label>
                        <input name="nombre" type="text" value={newModuleData.nombre} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-600">Descripción</label>
                        <textarea name="descripcion" value={newModuleData.descripcion} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" rows="4" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-600">Tipo de Juego</label>
                        <select name="tipo_juego_id" value={newModuleData.tipo_juego_id} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" required>
                            <option value="">Seleccione un tipo de juego</option>
                            {tiposJuegos.map(tipo => (
                                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-600">Orden</label>
                            <input name="orden" type="number" value={newModuleData.orden} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-600">Estado</label>
                            <select name="estado" value={newModuleData.estado} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" required>
                                <option value="borrador">Borrador</option>
                                <option value="publicado">Publicado</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={isUpdating} className="w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors">
                        {isUpdating ? <Loader2 className="animate-spin mr-2 w-5 h-5 inline" /> : "Actualizar Módulo"}
                    </button>
                </form>
            </div>
        );
    };

    const renderViewModules = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Módulos</h2>
            {loadingMods && <Loader2 className="animate-spin mx-auto w-8 h-8 text-[#F11A7B]" />}
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    {error}
                </div>
            )}
            {!loadingMods && !error && modules.length === 0 && (
                <p className="text-gray-500">No hay módulos para mostrar.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <div key={module.id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${module.estado === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} mb-2 inline-block`}>
                            {module.estado}
                        </span>
                        <h3 className="text-xl font-bold text-[#982176] mb-1">{module.nombre}</h3>
                        <p className="text-xs text-gray-500 mb-2">Slug: {module.slug} | Orden: {module.orden}</p>
                        <p className="text-sm text-gray-600 mb-4">{module.descripcion}</p>

                        {/* --- INICIO: NUEVA SECCIÓN DE FECHAS --- */}
                        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                            <p>Creado: <span className="font-semibold">{formatDate(module.creado_en)}</span></p>
                            <p>Actualizado: <span className="font-semibold">{formatDate(module.actualizado_en)}</span></p>
                        </div>
                        {/* --- FIN: NUEVA SECCIÓN DE FECHAS --- */}

                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => handleEditModule(module.id)} className="text-blue-500 hover:text-blue-700 transition-colors" disabled={isUpdating || isDeleting}>
                                <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteModule(module.id)} className="text-red-500 hover:text-red-700 transition-colors" disabled={isUpdating || isDeleting}>
                                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderEditTipoJuego = () => {
        // ... (Sin cambios)
        if (!editingTipoJuego) return <p className="text-red-500">Error: Tipo de juego no seleccionado para editar.</p>;

        return (
            <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Editar Tipo de Juego (ID: {editingTipoJuego})</h2>
                    <button onClick={() => setActiveView('viewTiposJuegos')} className="text-gray-500 hover:text-gray-800 transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleUpdateTipoJuego}>
                    {tipoJuegoError && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6">{tipoJuegoError}</div>}
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-600">Nombre del Tipo de Juego</label>
                        <input name="nombre" type="text" value={newTipoJuegoData.nombre} onChange={handleTipoJuegoInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-600">Descripción</label>
                        <textarea name="descripcion" value={newTipoJuegoData.descripcion} onChange={handleTipoJuegoInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" rows="4" required />
                    </div>
                    <button type="submit" disabled={isUpdating} className="w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors">
                        {isUpdating ? <Loader2 className="animate-spin mr-2 w-5 h-5 inline" /> : "Actualizar Tipo de Juego"}
                    </button>
                </form>
            </div>
        );
    };

    const renderCreateTipoJuego = () => (
        // ... (Sin cambios)
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Tipo de Juego</h2>
            <form onSubmit={handleCreateTipoJuego}>
                {tipoJuegoError && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6">{tipoJuegoError}</div>}
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2 text-gray-600">Nombre del Tipo de Juego</label>
                    <input name="nombre" type="text" value={newTipoJuegoData.nombre} onChange={handleTipoJuegoInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" required />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2 text-gray-600">Descripción</label>
                    <textarea name="descripcion" value={newTipoJuegoData.descripcion} onChange={handleTipoJuegoInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-md" rows="4" required />
                </div>
                <button type="submit" disabled={isCreatingTipoJuego} className="w-full bg-[#F11A7B] text-white px-6 py-3 rounded-md hover:bg-[#982176] transition-colors">
                    {isCreatingTipoJuego ? <Loader2 className="animate-spin mr-2 w-5 h-5 inline" /> : "Crear Tipo de Juego"}
                </button>
            </form>
        </div>
    );

    const renderViewTiposJuegos = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Tipos de Juegos</h2>
            {loadingTipos && <Loader2 className="animate-spin mx-auto w-8 h-8 text-[#F11A7B]" />}
            {tipoJuegoError && (
                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    {tipoJuegoError}
                </div>
            )}
            {!loadingTipos && !tipoJuegoError && tiposJuegos.length === 0 && (
                <p className="text-gray-500">No hay tipos de juegos para mostrar.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiposJuegos.map((tipo) => (
                    <div key={tipo.id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-[#982176] mb-2">{tipo.nombre}</h3>
                        <p className="text-sm text-gray-600 mb-4">{tipo.descripcion}</p>

                        {/* --- INICIO: NUEVA SECCIÓN DE FECHAS --- */}
                        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                            <p>Creado: <span className="font-semibold">{formatDate(tipo.creado_en)}</span></p>
                            <p>Actualizado: <span className="font-semibold">{formatDate(tipo.actualizado_en)}</span></p>
                        </div>
                        {/* --- FIN: NUEVA SECCIÓN DE FECHAS --- */}

                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => handleEditTipoJuego(tipo.id)} className="text-blue-500 hover:text-blue-700 transition-colors" disabled={isUpdating || isDeleting}>
                                <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteTipoJuego(tipo.id)} className="text-red-500 hover:text-red-700 transition-colors" disabled={isUpdating || isDeleting}>
                                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- RENDER PRINCIPAL ---
    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
            <aside className="w-64 bg-gradient-to-b from-[#F11A7B] to-[#982176] text-white flex flex-col shadow-xl">
                <div className="p-6">
                    <h2 className="text-3xl font-bold mb-8 text-center tracking-wider">CAUCHYLAB</h2>
                </div>
                <nav className="flex-1 px-4">
                    <ul>
                        <li><button onClick={() => setActiveView('dashboard')} className={`w-full text-left py-3 px-4 mb-2 rounded-md transition-all flex items-center ${activeView === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Panel Principal</button></li>
                        <hr className="my-2 border-white/30" />
                        <li><button onClick={() => setActiveView('viewModules')} className={`w-full text-left py-3 px-4 mb-2 rounded-md transition-all flex items-center ${activeView === 'viewModules' ? 'bg-white/20' : 'hover:bg-white/10'}`}><List className="w-5 h-5 mr-3" /> Ver Módulos</button></li>
                        <li><button onClick={() => setActiveView('createModule')} className={`w-full text-left py-3 px-4 mb-2 rounded-md transition-all flex items-center ${activeView === 'createModule' ? 'bg-white/20' : 'hover:bg-white/10'}`}><Plus className="w-5 h-5 mr-3" /> Crear Módulo</button></li>
                        <hr className="my-2 border-white/30" />
                        <li><button onClick={() => setActiveView('viewTiposJuegos')} className={`w-full text-left py-3 px-4 mb-2 rounded-md transition-all flex items-center ${activeView === 'viewTiposJuegos' ? 'bg-white/20' : 'hover:bg-white/10'}`}><List className="w-5 h-5 mr-3" /> Ver Tipos de Juegos</button></li>
                        <li><button onClick={() => setActiveView('createTipoJuego')} className={`w-full text-left py-3 px-4 mb-2 rounded-md transition-all flex items-center ${activeView === 'createTipoJuego' ? 'bg-white/20' : 'hover:bg-white/10'}`}><Plus className="w-5 h-5 mr-3" /> Crear Tipo de Juego</button></li>
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#F11A7B]">ADMINISTRACIÓN</h1>
                        <p className="text-lg text-gray-600">
                            ¡Bienvenido, <span className="text-[#982176] font-bold">{user.username}</span>!
                        </p>
                    </div>
                </header>

                {activeView === 'dashboard' && (
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800">Panel Principal</h2>
                        <p className="mt-4 text-gray-600">Selecciona una opción del menú lateral para comenzar.</p>
                    </div>
                )}
                {activeView === 'createTipoJuego' && renderCreateTipoJuego()}
                {activeView === 'viewTiposJuegos' && renderViewTiposJuegos()}
                {activeView === 'editTipoJuego' && renderEditTipoJuego()}
                {activeView === 'createModule' && renderCreateModule()}
                {activeView === 'viewModules' && renderViewModules()}
                {activeView === 'editModule' && renderEditModule()}
            </main>
        </div>
    );
};

export default PanelPrincipalAdmin;