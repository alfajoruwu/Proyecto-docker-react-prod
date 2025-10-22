import React, { useContext, useEffect, useState, useRef } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import './SQLEjecucion.css';
import CustomTable from '../../AuxS/CustomTable';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { FaDatabase, FaCode, FaPlay, FaCheckCircle, FaTimes, FaTable, FaRobot, FaEye, FaLightbulb, FaFile, FaHome, FaProjectDiagram, FaSearchPlus, FaSearchMinus, FaUndo } from 'react-icons/fa';
import mermaid from 'mermaid';

const RealizarEjercicio = ({ }) => {

    // Inicializar Mermaid
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            er: {
                useMaxWidth: false,
                fontSize: 14,
                diagramPadding: 20
            },
            flowchart: {
                useMaxWidth: false
            }
        });
    }, []);

    const mermaidRef = useRef(null);

    const handleCelebrate = () => {
        const end = Date.now() + 7 * 1000; // 15 segundos
        const colors = ['#bb0000', '#ffffff']; // Tus colores normales

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame(); // Iniciar animación
    };


    const Navigate = useNavigate();
    const { mostrarToast } = useToast();

    const { IdEjercicioResolver, SetIdEjercicioResolver, SetterIdEjercicioResolver } = useContext(EstadoGlobalContexto)

    const [ResumenEjercicio, SetResumenEjercicio] = useState('')
    const SetterResumenEjercicio = (event) => {
        SetResumenEjercicio(event.target.value)
    }

    const [ProblemaEjercicio, SetProblemaEjercicio] = useState('')
    const SetterProblemaEjercicio = (event) => {
        SetProblemaEjercicio(event.target.value)
    }
    const [IDDBSeleccionadaEjercicio, SetIDDBSeleccionadaEjercicio] = useState('')
    const SetterIDDBSeleccionadaEjercicio = (event) => {
        SetIDDBSeleccionadaEjercicio(event.target.value)
    }

    const [SolucionEjercicio, SetSolucionEjercicio] = useState('')
    const SetterSolucionEjercicio = (event) => {
        SetSolucionEjercicio(event.target.value)
    }

    const [TablaSolucionEjercicio, SetTablaSolucionEjercicio] = useState('')
    const SetterTablaSolucionEjercicio = (event) => {
        SetTablaSolucionEjercicio(event.target.value)
    }

    const EjecutarSQL = () => {
        console.log('Ejecutar SQL', SQLEjecutar);
        apiClient.post('/basedatos/EjecutarQuery', { dbId: IDDBSeleccionadaEjercicio, query: SQLEjecutar })
            .then(response => {
                console.log('SQL Ejecutado:', response);
                mostrarToast(response.data.message, 'success', 3000);
                SetTablasSQLResultado(response.data.filas);
                // Cambiar a la pestaña de output cuando se ejecuta SQL
                setTabActiva('output');
                // Registrar ejecución exitosa
                apiClient.post('/ejericicios/RegistrarEjecucionSQL', {
                    ejercicioId: IdEjercicioResolver,
                    sqlQuery: SQLEjecutar,
                    resultado: 'Exitoso'
                });
            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                const errorDetalle = error.response.data.detalle || error.response.data.error;
                mostrarToast('SQL Error: ' + errorDetalle, 'error', 3000);
                // Limpiar la tabla de resultados cuando hay error
                SetTablasSQLResultado('');
                // Cambiar a la pestaña de output también en caso de error
                setTabActiva('output');
                // Registrar ejecución fallida con el error completo
                apiClient.post('/ejericicios/RegistrarEjecucionSQL', {
                    ejercicioId: IdEjercicioResolver,
                    sqlQuery: SQLEjecutar,
                    resultado: 'ERROR: ' + errorDetalle
                });
            });

    }

    const manejarCambio = (event) => {
        const tablaSeleccionada = event.target.value;
        console.log('Tabla seleccionada:', tablaSeleccionada);
        apiClient.post('/basedatos/EjecutarQuery', { dbId: IDDBSeleccionadaEjercicio, query: 'select * from ' + tablaSeleccionada })
            .then(response => {
                console.log('SQL Ejecutado:', response);
                SetTablaInicial(response.data.filas)
            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                mostrarToast(error.response.data.error, 'error', 3000);
            });
    }

    const IrCrearEjercicio = () => { Navigate('/principal') }

    const CancelarCreacionDERespuesta = () => {
        SetSQLEjecutar('');
        SetTablaInicial('');
        IrCrearEjercicio();

    }

    const AbrirPopUPCorrecto = () => {
        const dialog = document.getElementById('Respuesta_Correcta');
        dialog.showModal();
        handleCelebrate()
    }

    const CerrarPopUpCorrecto = () => {
        const dialog = document.getElementById('Respuesta_Correcta');
        dialog.close();
    }

    const CrearRespuesta = () => {

        if (SQLEjecutar === '') {
            mostrarToast('Por favor, ingrese una consulta SQL válida.', 'error', 3000);
            return;
        }
        if (TablasSQLResultado === '') {
            mostrarToast('Por favor, ejecute una consulta SQL para obtener resultados.', 'error', 3000);
            return;
        }
        apiClient.post('/ejericicios/RevisarRespuesta', {
            ejercicioId: IdEjercicioResolver,
            sqlIntento: SQLEjecutar,
            Tabla_Usuario: TablasSQLResultado
        })
            .then(response => {
                console.log('Respuesta de la API:', response);

                response.data.esCorrecto === true ? AbrirPopUPCorrecto() : mostrarToast('Respuesta incorrecta, vuelve a intentarlo!', 'error', 3000);


            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                mostrarToast('Error: ' + error.response.data.error, 'error', 3000);
            });

    }


    const [SQLEjecutar, SetSQLEjecutar] = useState('')
    const SetterSQLEjecutar = (event) => {
        SetSQLEjecutar(event.target.value)
    }

    const [TablasDisponibles, SetTablasDisponibles] = useState('')
    const SetterTablasDisponibles = (event) => {
        SetTablasDisponibles(event.target.value)
    }

    const [EstructuraDB, SetEstructuraDB] = useState('')
    const SetterEstructuraDB = (event) => {
        SetEstructuraDB(event.target.value)
    }

    const [DatosDB, SetDatosDB] = useState('')
    const SetterDatosDB = (event) => {
        SetDatosDB(event.target.value)
    }

    const [TablasSQLResultado, SetTablasSQLResultado] = useState('')
    const SetterTablasSQLResultado = (event) => {
        SetTablasSQLResultado(event.target.value)
    }

    const [TablaInicial, SetTablaInicial] = useState('')
    const SetterTablaInicial = (event) => {
        SetTablaInicial(event.target.value)
    }


    const [RespuestaIA, SetRespuestaIA] = useState('')
    const SetterRespuestaIA = (event) => {
        SetRespuestaIA(event.target.value)
    }

    const [MostrarTabla, SetMostrarTabla] = useState(false)
    const SetterMostrarTabla = (event) => {
        SetMostrarTabla(event.target.value)
    }

    const [MostrarIA, SetMostrarIA] = useState(false)
    const SetterMostrarIA = (event) => {
        SetMostrarIA(event.target.value)
    }

    const [CargandoRespuestaIA, SetCargandoRespuestaIA] = useState('')
    const SetterCargandoRespuestaIA = (event) => {
        SetCargandoRespuestaIA(event.target.value)
    }

    const [tabActiva, setTabActiva] = useState('diagrama');

    const [erroresExpandidos, setErroresExpandidos] = useState({});

    const [mostrarFeedback, setMostrarFeedback] = useState(false);

    // Función para convertir SQL a Mermaid ERD
    const convertirSQLaMermaid = (sqlInit) => {
        if (!sqlInit) return '';

        let mermaidCode = 'erDiagram\n';
        const tablas = {};
        const relaciones = [];

        // Regex para extraer CREATE TABLE
        const createTableRegex = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?\s*\(([\s\S]*?)\);/gi;
        let match;

        while ((match = createTableRegex.exec(sqlInit)) !== null) {
            const nombreTabla = match[1];
            const contenido = match[2];

            tablas[nombreTabla] = {
                columnas: [],
                pk: [],
                fk: []
            };

            // Separar por comas pero no dentro de paréntesis
            const lineas = contenido.split(/,(?![^()]*\))/);

            lineas.forEach(linea => {
                const lineaTrim = linea.trim();

                // Detectar PRIMARY KEY constraint
                const pkMatch = lineaTrim.match(/PRIMARY KEY\s*\(([^)]+)\)/i);
                if (pkMatch) {
                    const cols = pkMatch[1].split(',').map(c => c.trim().replace(/`/g, ''));
                    tablas[nombreTabla].pk.push(...cols);
                    return;
                }

                // Detectar FOREIGN KEY
                const fkMatch = lineaTrim.match(/FOREIGN KEY\s*\(`?(\w+)`?\)\s*REFERENCES\s*`?(\w+)`?\s*\(`?(\w+)`?\)/i);
                if (fkMatch) {
                    relaciones.push({
                        desde: nombreTabla,
                        columna: fkMatch[1],
                        hasta: fkMatch[2],
                        columnaRef: fkMatch[3]
                    });
                    tablas[nombreTabla].fk.push(fkMatch[1]);
                    return;
                }

                // Parsear columna normal
                const colMatch = lineaTrim.match(/`?(\w+)`?\s+(\w+(?:\(\d+(?:,\s*\d+)?\))?)(.*)/i);
                if (colMatch) {
                    const nombreCol = colMatch[1];
                    const tipo = colMatch[2];
                    const restricciones = colMatch[3] || '';

                    // Determinar tipo simple
                    let tipoSimple = tipo.toUpperCase();
                    if (tipoSimple.includes('INT')) tipoSimple = 'int';
                    else if (tipoSimple.includes('VARCHAR') || tipoSimple.includes('TEXT')) tipoSimple = 'string';
                    else if (tipoSimple.includes('DECIMAL') || tipoSimple.includes('FLOAT')) tipoSimple = 'float';
                    else if (tipoSimple.includes('DATE')) tipoSimple = 'date';
                    else if (tipoSimple.includes('BOOL')) tipoSimple = 'bool';

                    let isPK = restricciones.toUpperCase().includes('PRIMARY KEY');
                    if (isPK) {
                        tablas[nombreTabla].pk.push(nombreCol);
                    }

                    tablas[nombreTabla].columnas.push({
                        nombre: nombreCol,
                        tipo: tipoSimple,
                        isPK: isPK
                    });
                }
            });
        }

        // Generar código Mermaid
        Object.keys(tablas).forEach(nombreTabla => {
            const tabla = tablas[nombreTabla];

            mermaidCode += `    ${nombreTabla} {\n`;

            tabla.columnas.forEach(col => {
                let atributos = [];
                if (tabla.pk.includes(col.nombre)) atributos.push('PK');
                if (tabla.fk.includes(col.nombre)) atributos.push('FK');

                const atributosStr = atributos.length > 0 ? ` "${atributos.join(',')}"` : '';
                mermaidCode += `        ${col.tipo} ${col.nombre}${atributosStr}\n`;
            });

            mermaidCode += `    }\n`;
        });

        // Agregar relaciones
        relaciones.forEach(rel => {
            // Formato: TABLA1 ||--o{ TABLA2 : "tiene"
            // ||--o{ significa: uno a muchos
            mermaidCode += `    ${rel.hasta} ||--o{ ${rel.desde} : "referencia"\n`;
        });

        return mermaidCode;
    };

    const [mermaidCode, setMermaidCode] = useState('');

    const [zoomLevel, setZoomLevel] = useState(1);

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.2, 3)); // Máximo 300%
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.2, 0.3)); // Mínimo 30%
    };

    const handleZoomReset = () => {
        setZoomLevel(1);
    };

    // Renderizar diagrama Mermaid cuando cambie el código
    useEffect(() => {
        if (mermaidCode && mermaidRef.current && tabActiva === 'diagrama') {
            mermaidRef.current.innerHTML = mermaidCode;
            mermaid.contentLoaded();
        }
    }, [mermaidCode, tabActiva]);

    // Función para parsear la respuesta de la IA y extraer los errores
    const parsearErroresIA = (respuesta) => {
        if (!respuesta) return [];

        // Verificar si explícitamente dice que no hay errores
        if (respuesta.toLowerCase().includes('no hay error encontrado') ||
            respuesta.toLowerCase().includes('no se encontró ningún error')) {
            return [];
        }

        const errores = [];

        // Patrón flexible que captura TODO lo que está entre el número y los dos puntos
        // Ejemplos que captura:
        // - "1. Lógico:"
        // - "1. Error Lógico:"
        // - "1. Error de Sintaxis:"
        // - "1. Sintaxis:"
        // - "1. Conceptual:"
        const regex = /(\d+)\.\s*([^:]+?):\s*([^\n]+?)\s*\n\s*[-–—]\s*¿?Por\s*qué\s*es\s*un\s*error\??:?\s*([^\n]+(?:\n(?!\d+\.|\n\n)[^\n]+)*)/gi;

        let match;
        while ((match = regex.exec(respuesta)) !== null) {
            errores.push({
                numero: match[1],
                tipo: match[2].trim(),
                descripcion: match[3].trim(),
                explicacion: match[4].trim().replace(/\s+/g, ' ')
            });
        }

        return errores;
    };

    const toggleError = (index) => {
        setErroresExpandidos(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const ObtenerDatosEjercicio = () => {
        // Obtener los datos del ejercicio seleccionado
        console.log('ID del ejercicio a resolver:', IdEjercicioResolver);

        // Registrar inicio de ejercicio
        apiClient.post('/ejericicios/IniciarEjercicio', { ejercicioId: IdEjercicioResolver })
            .then(res => console.log(res.data.message))
            .catch(err => console.error('Error al registrar inicio de ejercicio:', err));


        let idBaseDatos = '';

        apiClient.get('/ejericicios/ObtenerEjercicio_Usuario/' + IdEjercicioResolver)
            .then(response => {
                const ejercicio = response.data.ejercicio;
                console.log(response.data)
                console.log('Datos del ejercicio:', ejercicio);
                SetResumenEjercicio(ejercicio.resumen || '');
                SetMostrarTabla(ejercicio.permitirsolucion || false);
                SetMostrarIA(ejercicio.permitiria || false);
                SetProblemaEjercicio(ejercicio.problema || '');
                SetIDDBSeleccionadaEjercicio(ejercicio.id_basedatos || '');
                idBaseDatos = ejercicio.id_basedatos || '';
                SetSolucionEjercicio(ejercicio.solucion || '');
                SetTablaSolucionEjercicio(response.data.Tablas || '');
                console.log(ejercicio.tabla_solucion)
                // Cargar la base de datos
                apiClient.get('/basedatos/ObtenerDB_publico/' + idBaseDatos)
                    .then(response => {
                        const { estructura, db } = response.data;

                        console.log('DatosDB:', db);
                        console.log('Estructura:', estructura);

                        SetEstructuraDB(estructura);
                        SetDatosDB(db);

                        // Generar Mermaid ERD para el diagrama
                        if (db.sql_init) {
                            const mermaidGenerado = convertirSQLaMermaid(db.sql_init);
                            setMermaidCode(mermaidGenerado);
                            console.log('Mermaid ERD generado:', mermaidGenerado);
                        }

                        // Ejecutar query inicial
                        const primeraTabla = estructura[0]?.tablename;
                        if (primeraTabla) {
                            apiClient.post('/basedatos/EjecutarQuery', {
                                dbId: idBaseDatos,
                                query: 'SELECT * FROM ' + primeraTabla
                            })
                                .then(response => {
                                    console.log('SQL Ejecutado:', response);
                                    SetTablaInicial(response.data.filas);
                                })
                                .catch(error => {
                                    console.error('Error del backend:', error.response?.data?.error || error.message);
                                    mostrarToast(error.response?.data?.error || 'Error desconocido', 'error', 3000);
                                });
                        } else {
                            mostrarToast('No hay tablas para mostrar.', 'warning', 3000);
                        }

                    })
                    .catch(error => {
                        console.error('Error al obtener la base de datos:', error);
                        mostrarToast('Error al obtener base de datos', 'error', 3000);
                    });

            })
            .catch(error => {
                console.error('Error al obtener el ejercicio:', error);
                mostrarToast('Error al cargar el ejercicio', 'error', 3000);
            });

    }



    const EnviarMensajeIA = () => {
        // Validar que los valores no estén vacíos
        if (!DatosDB.sql_init || !ProblemaEjercicio || !SQLEjecutar) {
            console.warn('Uno o más valores requeridos están vacíos.');
            mostrarToast('Debes tener una respuesta para consultar.', 'warning', 3000);
            return; // Detener la ejecución si algún valor está vacío
        }

        // Convertir la tabla del estudiante a formato legible si existe
        let tablaEstudianteFormateada = null;
        if (TablasSQLResultado && Array.isArray(TablasSQLResultado) && TablasSQLResultado.length > 0) {
            // Convertir el array de objetos a formato de tabla
            tablaEstudianteFormateada = JSON.stringify(TablasSQLResultado, null, 2);
        }

        console.log('Enviando a IA:', {
            contexto: DatosDB.sql_init,
            problema: ProblemaEjercicio,
            respuesta: SQLEjecutar,
            ejercicioId: IdEjercicioResolver,
            tablaEstudiante: tablaEstudianteFormateada
        });

        SetCargandoRespuestaIA(true);
        setMostrarFeedback(true);

        apiClient.post('/IA/PromptA', {
            contexto: DatosDB.sql_init,
            problema: ProblemaEjercicio,
            respuesta: SQLEjecutar,
            ejercicioId: IdEjercicioResolver,
            tablaEstudiante: tablaEstudianteFormateada
        })
            .then(response => {
                console.log('Respuesta ia:', response.data);
                SetRespuestaIA(response.data.respuesta);
                SetCargandoRespuestaIA(false);
                mostrarToast('Respuesta de IA recibida', 'success', 3000);
            })
            .catch(error => {
                console.error('Error del backend:', error.response?.data?.error || 'Error desconocido');
                SetCargandoRespuestaIA(false);
                mostrarToast(error.response?.data?.error || 'Error desconocido', 'error', 3000);
            });
    };

    const EnviarMensajeIA2 = () => {
        // Validar que los valores no estén vacíos


        SetCargandoRespuestaIA(true);

        apiClient.post('/IA/PromptB', {
            contexto: DatosDB.sql_init,
            problema: ProblemaEjercicio,
            respuesta: SQLEjecutar,
            ejercicioId: IdEjercicioResolver
        })
            .then(response => {
                console.log('Respuesta ia:', response.data);
                SetRespuestaIA(response.data.respuesta);
                SetCargandoRespuestaIA(false);
                mostrarToast('Respuesta de IA recibida', 'success', 3000);
            })
            .catch(error => {
                console.error('Error del backend:', error.response?.data?.error || 'Error desconocido');
                SetCargandoRespuestaIA(false);
                mostrarToast(error.response?.data?.error || 'Error desconocido', 'error', 3000);
            });
    };

    const AbrirAyudaIA = () => {
        document.getElementById('AyudaIA').showModal();

    }

    const CerrarAyudaIA = () => {
        document.getElementById('AyudaIA').close();
    }


    useEffect(() => {
        ObtenerDatosEjercicio();

    }, []);



    return (
        <div className='flex flex-col h-screen overflow-hidden'>
            <Navbar />

            <div className='flex flex-col lg:h-[calc(100vh-4rem)] gap-2 p-2 overflow-y-auto'>
                {/* FILA 1: Enunciado (10% alto en desktop, auto en mobile) */}
                <div className='lg:h-[10%] min-h-[80px] flex flex-col rounded-lg p-4 shadow-lg bg-white flex-shrink-0'>
                    <div className="flex items-center gap-3">
                        <FaLightbulb className="text-primary text-2xl flex-shrink-0" />
                        <div className="flex-1 overflow-y-auto">
                            <h3 className="text-lg font-bold text-primary mb-1">Problema</h3>
                            <p className="text-sm leading-relaxed">{ProblemaEjercicio}</p>
                        </div>
                    </div>
                </div>

                {/* FILA 2: Editor SQL y Panel de pestañas - horizontal en desktop, vertical en mobile */}
                <div className='lg:h-[50%] flex flex-col lg:flex-row gap-2 min-h-[300px] flex-shrink-0'>
                    {/* Editor SQL izquierdo en desktop, arriba en mobile */}
                    <div className='w-full lg:w-1/2 h-[400px] lg:h-full flex flex-col rounded-lg p-3 shadow-lg bg-white overflow-hidden'>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 flex-shrink-0">
                            <h3 className="text-lg sm:text-xl font-bold text-primary">Editor SQL</h3>
                            <div className='flex gap-2'>
                                <button onClick={() => EjecutarSQL()} className='btn btn-secondary btn-xs sm:btn-sm'>
                                    <FaPlay className="mr-1" />
                                    <span className="hidden sm:inline">Ejecutar</span>
                                    <span className="sm:hidden">Exec</span>
                                </button>
                                <button onClick={() => CrearRespuesta()} className='btn btn-primary btn-xs sm:btn-sm'>
                                    <FaCheckCircle className="mr-1" />
                                    <span className="sm:inline">Revisar respuesta</span>
                                    <span className="sm:hidden">Check</span>
                                </button>
                            </div>
                        </div>

                        <div className='flex-1 overflow-auto'>
                            <CodeMirror
                                className='h-full'
                                value={SQLEjecutar}
                                placeholder={"SELECT * FROM tabla WHERE condicion;"}
                                onChange={(value) => SetSQLEjecutar(value)}
                                height='100%'
                                extensions={[sql()]}
                            />
                        </div>
                    </div>

                    {/* Panel de pestañas derecho en desktop, abajo en mobile */}
                    <div className='w-full lg:w-1/2 h-[400px] lg:h-full flex flex-col rounded-lg p-3 shadow-lg bg-white overflow-hidden'>
                        <div role="tablist" className="tabs tabs-boxed mb-2 flex-shrink-0 bg-base-200 flex-wrap">
                            <button
                                className={`tab tab-xs sm:tab-sm ${tabActiva === 'diagrama' ? 'tab-active' : ''}`}
                                onClick={() => setTabActiva('diagrama')}
                            >
                                <FaProjectDiagram className="mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Diagrama</span>
                            </button>
                            <button
                                className={`tab tab-xs sm:tab-sm ${tabActiva === 'tablas' ? 'tab-active' : ''}`}
                                onClick={() => setTabActiva('tablas')}
                            >
                                <FaTable className="mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Tablas</span>
                            </button>
                            <button
                                className={`tab tab-xs sm:tab-sm ${tabActiva === 'contexto' ? 'tab-active' : ''}`}
                                onClick={() => setTabActiva('contexto')}
                            >
                                <FaDatabase className="mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Contexto</span>
                            </button>
                            <button
                                className={`tab tab-xs sm:tab-sm ${tabActiva === 'output' ? 'tab-active' : ''}`}
                                onClick={() => setTabActiva('output')}
                            >
                                <FaEye className="mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Output</span>
                            </button>
                            {MostrarTabla && (
                                <button
                                    className={`tab tab-xs sm:tab-sm ${tabActiva === 'esperada' ? 'tab-active' : ''}`}
                                    onClick={() => setTabActiva('esperada')}
                                >
                                    <FaCheckCircle className="mr-1 sm:mr-2" />
                                    <span className="text-xs sm:text-sm">Esperada</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden bg-base-100 rounded-lg border border-base-300">
                            {tabActiva === 'diagrama' && (
                                <div className="h-full w-full flex flex-col bg-white relative">
                                    {/* Controles de Zoom */}
                                    <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white rounded-lg shadow-lg border border-base-300 p-1">
                                        <button
                                            onClick={handleZoomIn}
                                            className="btn btn-xs btn-ghost"
                                            title="Acercar"
                                        >
                                            <FaSearchPlus />
                                        </button>
                                        <button
                                            onClick={handleZoomReset}
                                            className="btn btn-xs btn-ghost"
                                            title="Restablecer zoom"
                                        >
                                            <FaUndo />
                                        </button>
                                        <button
                                            onClick={handleZoomOut}
                                            className="btn btn-xs btn-ghost"
                                            title="Alejar"
                                        >
                                            <FaSearchMinus />
                                        </button>
                                        <span className="btn btn-xs btn-ghost pointer-events-none">
                                            {Math.round(zoomLevel * 100)}%
                                        </span>
                                    </div>

                                    {/* Área del diagrama con scroll */}
                                    <div className="flex-1 overflow-auto p-4">
                                        {mermaidCode ? (
                                            <div
                                                className="min-w-max min-h-max flex items-start justify-center"
                                                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                                            >
                                                <div className="mermaid" ref={mermaidRef}>
                                                    {mermaidCode}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center opacity-50">
                                                    <FaProjectDiagram className="text-4xl mx-auto mb-2" />
                                                    <p className="text-sm">Generando diagrama de base de datos...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {tabActiva === 'tablas' && (
                                <div className="h-full flex flex-col p-3">
                                    <div className="form-control mb-2 flex-shrink-0">
                                        <select onChange={manejarCambio} defaultValue="" className="select select-bordered select-primary select-sm">
                                            {EstructuraDB.length !== 0 && EstructuraDB.map((tabla, index) => (
                                                <option key={index} value={tabla.tablename}>
                                                    {tabla.tablename}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='flex-1 overflow-auto'>
                                        <CustomTable itemsPerPage={10} data={TablaInicial} />
                                    </div>
                                </div>
                            )}

                            {tabActiva === 'contexto' && (
                                <div className="h-full overflow-y-auto p-4">
                                    <p className="leading-relaxed text-sm whitespace-pre-wrap">
                                        {DatosDB.descripcion}
                                    </p>
                                </div>
                            )}

                            {tabActiva === 'output' && (
                                <div className="h-full overflow-auto p-3">
                                    <CustomTable itemsPerPage={10} data={TablasSQLResultado} />
                                </div>
                            )}

                            {tabActiva === 'esperada' && MostrarTabla && (
                                <div className="h-full overflow-auto p-3">
                                    <CustomTable itemsPerPage={10} data={TablaSolucionEjercicio} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FILA 3: Feedback de IA (40% alto en desktop, auto en mobile) */}
                <div className='lg:h-[40%] min-h-[300px] flex flex-col rounded-lg p-3 sm:p-4 shadow-lg bg-white overflow-hidden flex-shrink-0'>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 flex-shrink-0">
                        <h3 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2">
                            <FaRobot />
                            Feedback de IA
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => EnviarMensajeIA()} className='btn btn-primary btn-xs sm:btn-sm'>
                                <FaLightbulb className="mr-1" />
                                <span className="hidden sm:inline">Revisar con IA</span>
                                <span className="sm:hidden">Revisar</span>
                            </button>
                            {mostrarFeedback && (
                                <button onClick={() => {
                                    setMostrarFeedback(false);
                                    SetRespuestaIA('');
                                }} className='btn btn-ghost btn-xs sm:btn-sm'>
                                    <FaTimes />
                                </button>
                            )}
                            {/* <button onClick={() => CancelarCreacionDERespuesta()} className='btn btn-error btn-xs sm:btn-sm'>
                                <FaHome className="mr-1" />
                                <span className="hidden sm:inline">Salir</span>
                                <span className="sm:hidden">Salir</span>
                            </button> */}
                        </div>
                    </div>

                    <div className='flex-1 overflow-y-auto bg-base-100 rounded-lg p-3 sm:p-4 border border-base-300'>
                        {!mostrarFeedback && !CargandoRespuestaIA && (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 px-4">
                                <FaRobot className="text-4xl sm:text-6xl mb-4" />
                                <p className="text-sm sm:text-lg">Haz clic en "Revisar con IA" para obtener feedback sobre tu consulta SQL</p>
                            </div>
                        )}

                        {CargandoRespuestaIA ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                                    <span className="text-sm sm:text-lg">Analizando tu consulta SQL...</span>
                                </div>
                            </div>
                        ) : (
                            mostrarFeedback && RespuestaIA && (() => {
                                const errores = parsearErroresIA(RespuestaIA);

                                if (errores.length === 0) {
                                    return (
                                        <div className="p-4 sm:p-6 bg-success bg-opacity-10 border-2 border-success rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FaCheckCircle className="text-2xl sm:text-3xl flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-bold text-base sm:text-lg">¡Excelente trabajo!</h4>
                                                    <p className="text-xs sm:text-sm opacity-70">No se encontraron errores en tu consulta SQL.</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FaLightbulb className="text-warning text-lg sm:text-xl" />
                                            <h4 className="font-bold text-base sm:text-lg">Errores identificados: {errores.length}</h4>
                                        </div>

                                        {errores.map((error, index) => (
                                            <div
                                                key={index}
                                                className="collapse collapse-arrow bg-base-200 border border-base-300 shadow-md hover:shadow-lg transition-all"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={erroresExpandidos[index] || false}
                                                    onChange={() => toggleError(index)}
                                                />
                                                <div className="collapse-title font-medium flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
                                                    <span className="badge badge-error badge-sm sm:badge-lg">{error.numero}</span>
                                                    <div className="flex-1">
                                                        <span className="font-bold text-error">{error.tipo}</span>
                                                        <p className="text-xs sm:text-sm opacity-80 mt-1">{error.descripcion}</p>
                                                    </div>
                                                </div>
                                                <div className="collapse-content bg-base-100">
                                                    <div className="pt-4 pl-2 border-l-4 border-warning">
                                                        <p className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                                                            <FaLightbulb className="text-warning" />
                                                            ¿Por qué es un error?
                                                        </p>
                                                        <p className="text-xs sm:text-sm leading-relaxed">{error.explicacion}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </div>
            </div>

            {/* Pop up de respuesta correcta */}
            <dialog id="Respuesta_Correcta" className="modal">
                <div className="modal-box flex flex-col gap-2 w-11/12 max-w-5xl">
                    <h3 className="font-bold text-lg text-primary">Felicidades! Completaste correctamente el ejercicio</h3>
                    <p className="py-4">Tu respuesta fue correcta, puedes intentar resolver el ejercicio nuevamente o probar uno diferente.</p>
                    <div className='flex gap-3 flex-row'>
                        <button onClick={() => IrCrearEjercicio()} className="btn btn-primary">Volver al inicio</button>
                        <button onClick={() => CerrarPopUpCorrecto()} className="btn btn-secondary">Regresar al ejercicio</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}

export default RealizarEjercicio