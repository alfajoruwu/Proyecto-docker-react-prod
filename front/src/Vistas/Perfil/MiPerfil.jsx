import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal';
import { useToast } from '../../Componentes/ToastContext';
import axiosInstance from '../../AuxS/Axiosinstance';
import './MiPerfil.css';

const MiPerfil = () => {
    const navigate = useNavigate();
    const { mostrarToast } = useToast();
    const { Nombre } = useContext(EstadoGlobalContexto);

    const [estadisticas, setEstadisticas] = useState(null);
    const [logros, setLogros] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Verificar autenticación
        const accessToken = localStorage.getItem('accessToken');
        const nombreLocal = localStorage.getItem('Nombre');

        if (!accessToken || !nombreLocal) {
            mostrarToast('Debes iniciar sesión para ver tu perfil', 'error', 3000);
            navigate('/login');
            return;
        }

        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setCargando(true);
        setError(null);

        try {
            // Cargar estadísticas
            const respuestaEstadisticas = await axiosInstance.get('/usuarios/estadisticas');
            setEstadisticas(respuestaEstadisticas.data);

            // Cargar logros
            const respuestaLogros = await axiosInstance.get('/usuarios/logros');
            setLogros(respuestaLogros.data);

        } catch (err) {
            console.error('Error cargando datos del perfil:', err);
            setError('Error al cargar los datos del perfil');
            mostrarToast('Error al cargar los datos del perfil', 'error', 3000);
        } finally {
            setCargando(false);
        }
    };

    const obtenerNombreDificultad = (dificultad) => {
        const nombres = {
            1: 'Fácil',
            2: 'Medio',
            3: 'Difícil'
        };
        return nombres[dificultad] || `Nivel ${dificultad}`;
    };

    const obtenerColorDificultad = (dificultad) => {
        const colores = {
            1: 'badge-success',
            2: 'badge-info',
            3: 'badge-warning'
        };
        return colores[dificultad] || 'badge-neutral';
    };

    const formatearFecha = (fecha) => {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (cargando) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </>
        );
    }

    if (error || !estadisticas) {
        return (
            <>
                <Navbar />
                <div className="container mx-auto p-4">
                    <div className="alert alert-error">
                        <span>{error || 'No se pudieron cargar los datos'}</span>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="perfil-container container mx-auto p-4 md:p-6 lg:p-8">
                {/* Encabezado del perfil */}
                <div className="perfil-header card bg-base-200 shadow-xl mb-6">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row items-center gap-4">

                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold">{estadisticas.usuario.nombre}</h1>
                                <p className="text-base-content/70">{estadisticas.usuario.email}</p>
                                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                                    <div className="badge badge-primary">{estadisticas.usuario.rol}</div>
                                    <div className="badge badge-outline">
                                        Miembro desde {formatearFecha(estadisticas.usuario.fecha_registro)}
                                    </div>
                                    <div className="badge badge-outline">
                                        {Math.floor(estadisticas.usuario.dias_registrado)} días registrado
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="stat bg-base-200 rounded-lg shadow">
                        <div className="stat-figure text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="stat-title">Ejercicios Resueltos</div>
                        <div className="stat-value text-primary">{estadisticas.resumen.ejercicios_resueltos}</div>
                        <div className="stat-desc">¡Sigue así!</div>
                    </div>

                    <div className="stat bg-base-200 rounded-lg shadow">
                        <div className="stat-figure text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        <div className="stat-title">Total Intentos</div>
                        <div className="stat-value text-secondary">{estadisticas.resumen.total_intentos}</div>
                        <div className="stat-desc">
                            {estadisticas.tasa_exito}% de éxito
                        </div>
                    </div>

                    <div className="stat bg-base-200 rounded-lg shadow">
                        <div className="stat-figure text-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                            </svg>
                        </div>
                        <div className="stat-title">Consultas IA</div>
                        <div className="stat-value text-accent">{estadisticas.resumen.consultas_ia}</div>
                        <div className="stat-desc">Ayuda inteligente</div>
                    </div>

                    <div className="stat bg-base-200 rounded-lg shadow">
                        <div className="stat-figure text-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                            </svg>
                        </div>
                        <div className="stat-title">Ejecuciones SQL</div>
                        <div className="stat-value text-info">{estadisticas.resumen.ejecuciones_sql}</div>
                        <div className="stat-desc">Consultas ejecutadas</div>
                    </div>
                </div>

                {/* Grid de información detallada */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Ejercicios por dificultad */}
                    <div className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">📊 Progreso por Dificultad</h2>
                            <div className="space-y-3">
                                {estadisticas.ejercicios.por_dificultad.length > 0 ? (
                                    estadisticas.ejercicios.por_dificultad.map((dif) => (
                                        <div key={dif.dificultad} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className={`badge ${obtenerColorDificultad(dif.dificultad)}`}>
                                                    {obtenerNombreDificultad(dif.dificultad)}
                                                </span>
                                                <span className="text-sm">
                                                    {dif.resueltos} / {dif.intentados}
                                                </span>
                                            </div>
                                            <progress
                                                className="progress progress-primary w-full"
                                                value={dif.resueltos}
                                                max={dif.intentados || 1}
                                            ></progress>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-base-content/50 text-center py-4">
                                        Aún no has intentado ningún ejercicio
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Uso de IA */}
                    <div className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">🤖 Revisiones con Inteligencia Artificial</h2>
                            <div className="text-center">
                                <div className="stat">
                                    <div className="stat-title">Consultas de Revisión</div>
                                    <div className="stat-value text-4xl text-primary">{estadisticas.ia.consultas_revision}</div>
                                    <div className="stat-desc mt-2">Veces que solicitaste ayuda de la IA para revisar tu código SQL</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tópicos más practicados */}
                {estadisticas.topicos && estadisticas.topicos.length > 0 && (
                    <div className="card bg-base-200 shadow-xl mb-6">
                        <div className="card-body">
                            <h2 className="card-title">🎯 Tópicos Más Practicados</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {estadisticas.topicos.map((topico, index) => (
                                    <div key={index} className="card bg-base-100 shadow">
                                        <div className="card-body p-4">
                                            <h3 className="font-bold">{topico.topico}</h3>
                                            <div className="text-sm space-y-1">
                                                <p>Intentados: <span className="font-bold">{topico.intentados}</span></p>
                                                <p>Resueltos: <span className="font-bold text-success">{topico.resueltos}</span></p>
                                            </div>
                                            <progress
                                                className="progress progress-success w-full"
                                                value={topico.resueltos}
                                                max={topico.intentados || 1}
                                            ></progress>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Logros */}
                {logros && logros.logros.length > 0 && (
                    <div className="card bg-base-200 shadow-xl mb-6">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="card-title">🏆 Logros</h2>
                                <div className="badge badge-lg badge-primary">
                                    {logros.logros_desbloqueados} / {logros.total_logros}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {logros.logros.map((logro, index) => (
                                    <div
                                        key={index}
                                        className={`card bg-base-100 shadow ${logro.desbloqueado ? 'border-2 border-success' : 'opacity-60'}`}
                                    >
                                        <div className="card-body p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="text-4xl">{logro.icono}</div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold">{logro.nombre}</h3>
                                                    <p className="text-sm text-base-content/70">{logro.descripcion}</p>
                                                    {logro.progreso !== undefined && (
                                                        <div className="mt-2">
                                                            <div className="text-xs text-base-content/70 mb-1">
                                                                {logro.progreso} / {logro.objetivo}
                                                            </div>
                                                            <progress
                                                                className={`progress ${logro.desbloqueado ? 'progress-success' : 'progress-primary'} w-full`}
                                                                value={logro.progreso}
                                                                max={logro.objetivo}
                                                            ></progress>
                                                        </div>
                                                    )}
                                                    {logro.fecha && (
                                                        <div className="text-xs text-success mt-2">
                                                            ✓ Desbloqueado el {formatearFecha(logro.fecha)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Estadísticas adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-base-200 shadow">
                        <div className="card-body text-center">
                            <div className="text-4xl mb-2">🔥</div>
                            <div className="text-2xl font-bold">{estadisticas.resumen.dias_activos_semana}</div>
                            <div className="text-sm text-base-content/70">Días activos esta semana</div>
                        </div>
                    </div>

                    <div className="card bg-base-200 shadow">
                        <div className="card-body text-center">
                            <div className="text-4xl mb-2">⭐</div>
                            <div className="text-2xl font-bold">{estadisticas.resumen.resueltos_primer_intento}</div>
                            <div className="text-sm text-base-content/70">Resueltos al primer intento</div>
                        </div>
                    </div>

                    <div className="card bg-base-200 shadow">
                        <div className="card-body text-center">
                            <div className="text-4xl mb-2">⏱️</div>
                            <div className="text-2xl font-bold">
                                {estadisticas.actividad.tiempo_promedio_resolucion > 0
                                    ? `${Math.round(estadisticas.actividad.tiempo_promedio_resolucion)} min`
                                    : 'N/A'}
                            </div>
                            <div className="text-sm text-base-content/70">Tiempo promedio de resolución</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MiPerfil;
