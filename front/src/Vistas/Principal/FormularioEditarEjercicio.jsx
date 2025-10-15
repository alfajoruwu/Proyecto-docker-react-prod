import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';
import { FaFilePen } from "react-icons/fa6";
import { FaFileArrowUp } from "react-icons/fa6";
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import CustomTable from '../../AuxS/CustomTable';

const FormularioCrearEjercicio = ({ listaDB, ActualizarEjercicios, CargandoEDITAR }) => {

    const Navigate = useNavigate();
    const { mostrarToast } = useToast();
    const { NombreEjercicio, SetNombreEjercicio, SetterNombreEjercicio, ResumenEjercicio, SetResumenEjercicio, SetterResumenEjercicio, ProblemaEjercicio, SetProblemaEjercicio, SetterProblemaEjercicio,
        DificultadEjercicio, SetDificultadEjercicio, SetterDificultadEjercicio,
        PermitirIAEjercicio, SetPermitirIAEjercicio, SetterPermitirIAEjercicio,
        VerRespuestaEsperada, SetVerRespuestaEsperada, SetterVerRespuestaEsperada,
        IDDBSeleccionadaEjercicio, IDSetDBSeleccionadaEjercicio, IDSetterDBSeleccionadaEjercicio, topicosSeleccionados, setTopicosSeleccionados,
        SolucionEjercicio, SetSolucionEjercicio, SetterSolucionEjercicio, TablaSolucionEjercicio, SetTablaSolucionEjercicio, SetterTablaSolucionEjercicio,
        ListaTopicosEjercicios, SetListaTopicosEjercicios, SetterListaTopicosEjercicios, ID_Editar_ejercicio, SetID_Editar_ejercicio, SetterID_Editar_ejercicio } = useContext(EstadoGlobalContexto)

    const LimpiarFormularios = () => {
    }

    // Navergar
    const IrCrearDB = () => { Navigate('/CrearDB') }
    const IrCrearSolucion = () => {
        if (IDDBSeleccionadaEjercicio == 'placeholder' || IDDBSeleccionadaEjercicio == '') {
            mostrarToast('Debes seleccionar una base de datos antes de crear una solucion', 'error')
            return;
        }
        Navigate('/CrearSolucion')
    }

    const [PaginaActual, SetPaginaActual] = useState(0)
    const SetterPaginaActual = (event) => {
        SetPaginaActual(event.target.value)
    }


    // Me equivoque con la palabra Resumen = descripcion
    const MostrarFormulario = () => {
        console.log("Mostrar formulario")
        console.log("Nombre del ejercicio: ", NombreEjercicio)
        console.log("Resumen del ejercicio: ", ResumenEjercicio)
        console.log("Problema del ejercicio: ", ProblemaEjercicio)
        console.log("Dificultad del ejercicio: ", DificultadEjercicio)
        console.log("Permitir IA: ", PermitirIAEjercicio)
        console.log("Ver respuesta esperada: ", VerRespuestaEsperada)
        console.log("ID de la base de datos seleccionada: ", IDDBSeleccionadaEjercicio)
        console.log("Solucion del ejercicio: ", SolucionEjercicio)
        console.log("Tabla de solucion del ejercicio: ", TablaSolucionEjercicio)
        console.log("Topicos seleccionados: ", topicosSeleccionados)

        apiClient.put('/ejericicios/editarEjercicio', { id: ID_Editar_ejercicio, nombre: NombreEjercicio, problema: ProblemaEjercicio, descripcion: ResumenEjercicio, solucionSQL: SolucionEjercicio, dbId: IDDBSeleccionadaEjercicio, dificultad: DificultadEjercicio, permitirIA: PermitirIAEjercicio, verRespuestaEsperada: VerRespuestaEsperada, topicos: topicosSeleccionados, Tabla_Solucion: TablaSolucionEjercicio })
            .then(response => { console.log('Usuarios:', response.data); mostrarToast(response.data.message, 'success', 3000); LimpiarFormulario(); document.getElementById('Editar_db').close(); ActualizarEjercicios(); })
            .catch(error => { console.error('Error del backend:', error.response.data.message); mostrarToast(error.response.data.details, 'error', 3000); });

    }

    const LimpiarFormulario = () => {
        SetNombreEjercicio('');
        SetResumenEjercicio('');
        SetProblemaEjercicio('');
        SetDificultadEjercicio(1);
        SetPermitirIAEjercicio(true);
        SetVerRespuestaEsperada(true);
        IDSetDBSeleccionadaEjercicio('placeholder');
        SetSolucionEjercicio('');
        SetTablaSolucionEjercicio([]);
        setTopicosSeleccionados([]);
        SetListaTopicosEjercicios([]);
    }

    const [nuevoTopico, setNuevoTopico] = useState("");

    // Lista de tópicos disponibles (puedes traerla desde una API también)
    const topicosDisponibles = [
        "WHERE",
        "JOIN",
        "GROUP BY",
        "ORDER BY",
        "SUBQUERIES",
        "AGREGACION",
    ];

    const CambiarDB = (event) => {
        if (IDDBSeleccionadaEjercicio == 'placeholder' || IDDBSeleccionadaEjercicio == '') {
            IDSetDBSeleccionadaEjercicio(event.target.value);
        }
        else {
            const confirmacion = window.confirm(
                "Si cambia la base de datos se borrará la solución del ejercicio actual, ¿desea continuar?"
            );

            // Si el usuario hace clic en "Aceptar" (Sí), actualiza el estado
            if (confirmacion) {
                IDSetDBSeleccionadaEjercicio(event.target.value);
                SetSolucionEjercicio(''); // Limpiar la solución actual
                SetTablaSolucionEjercicio([]); // Limpiar la tabla de solución actual
                mostrarToast('Base de datos cambiada correctamente', 'success');
            } else {
                // Si hace clic en "Cancelar" (No), no hagas nada
                return;
            }
        }
    };

    const Mostrarerror = () => {
        if (listaDB.length == 0 && SolucionEjercicio != '') {
            return (true);
        }

        return (false);
    }




    return (
        <div className='p-4 gap-6 flex flex-col'>

            <h1 class="text-2xl font-bold mb-6 text-center">Editar ejercicio</h1>
            {CargandoEDITAR == true && <div>Cargando...</div>}
            <ul className="steps">
                <li onClick={() => SetPaginaActual(0)} className={PaginaActual >= 0 ? "step step-primary" : "step "}>Nombre</li>
                <li onClick={() => SetPaginaActual(1)} className={PaginaActual >= 1 ? "step step-primary" : "step "}>Dificultad</li>
                <li onClick={() => SetPaginaActual(2)} className={PaginaActual >= 2 ? "step step-primary" : "step "}>Solucion</li>
                <li onClick={() => SetPaginaActual(3)} className={PaginaActual >= 3 ? "step step-primary" : "step "}>Topicos</li>
            </ul>

            {PaginaActual === 0 && (
                <>
                    {Mostrarerror() && <div className='bg-error p-4 rounded-xl flex flex-col gap-3'> <h1 className='text-error-content'>Error: No puedes crear un ejercicio sin una base de datos</h1> <button onClick={() => IrCrearDB()} className='btn btn-warning'>Ir a crear Base de datos</button></div>}

                    {/* Contenido del formulario */}
                    <div>
                        <label className='label'>Nombre del ejercicio</label>
                        <input value={NombreEjercicio} onChange={SetterNombreEjercicio} type="text" placeholder="Nombre de base de datos" className="input w-full" />
                    </div>

                    <div className='flex flex-col'>
                        <label className='label'>Resumen</label>
                        <textarea value={ResumenEjercicio} onChange={SetterResumenEjercicio} class="textarea w-full" placeholder="Pequeña descripcion del ejercicio (preview)"></textarea>
                    </div>

                    <div className='flex flex-col'>
                        <label className='label'>Problema a resolver</label>
                        <textarea value={ProblemaEjercicio} onChange={SetterProblemaEjercicio} class="textarea w-full" placeholder="Redaccion del problema a resolver"></textarea>
                    </div>


                    {/* Botón de navegación */}
                    <div className='flex justify-end'>
                        <button onClick={() => SetPaginaActual(1)} className='btn btn-primary'>
                            Siguiente
                        </button>
                    </div>
                </>
            )}

            {
                PaginaActual === 1 &&
                <>
                    {/* Range area selector */}
                    <div className='flex flex-col'>
                        <label className='label'>Dificultad</label>
                        <div className="w-full">
                            <input value={DificultadEjercicio} onChange={SetterDificultadEjercicio} type="range" min={1} max="3" className="range range-primary w-full" step="1" />
                            <div className="flex justify-between px-2.5 mt-2 text-xs">
                                <span>|</span>
                                <span>|</span>
                                <span>|</span>
                            </div>

                            <div className="flex justify-between px-2.5 mt-2 text-xs">
                                <span>Facil </span>
                                <span>Medio</span>
                                <span>Dificil</span>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col'>
                        <label className='label'>Opciones adicionales</label>
                        <div className='flex flex-col gap-3 border-2 border-primary border-dotted p-3 rounded-xl'>
                            <div className='flex flex-row gap-3'>
                                <label className='label'>uso de IA</label>
                                <input checked={PermitirIAEjercicio} onChange={SetterPermitirIAEjercicio} type="checkbox" defaultChecked className="checkbox checkbox-primary" />
                            </div>

                            <div className='flex flex-row gap-3'>
                                <label className='label'>ver la respuesta esperada</label>
                                <input checked={VerRespuestaEsperada} onChange={SetterVerRespuestaEsperada} type="checkbox" defaultChecked className="checkbox checkbox-primary" />
                            </div>

                        </div>
                    </div>


                    <div className='flex  justify-between'>
                        <button onClick={() => SetPaginaActual(0)} className='btn btn-primary'>Retroceder</button>
                        <button onClick={() => SetPaginaActual(2)} className='btn btn-primary'>Siguiente</button>
                    </div>
                </>
            }

            {
                PaginaActual === 2 &&
                <>
                    <div className='flex flex-col'>
                        <label className='label'>Selecciona base de datos</label>
                        <select value={IDDBSeleccionadaEjercicio} onChange={CambiarDB} defaultValue='NULL' className="select w-full">
                            <option value="placeholder">Bases de datos disponibles</option>
                            {listaDB.map((db, index) => (
                                <option key={index} value={db.id}>{db.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className='flex flex-col'>
                        <label className='label'>Crea solucion del ejercicio</label>
                        <button onClick={() => IrCrearSolucion()} className='btn btn-primary'>Ir a crear solucion</button>
                    </div>

                    <div className='flex flex-col'>
                        <label className='label'>Solucion del ejercicio</label>

                        {SolucionEjercicio != '' &&
                            <CodeMirror
                                value={SolucionEjercicio}
                                onChange={SetSolucionEjercicio}
                                height='15vh'
                                editable={false}
                                extensions={[sql()]}
                            ></CodeMirror>
                        }
                        {SolucionEjercicio == '' &&
                            <CodeMirror
                                value="Solucion NO DEFINIDA"
                                height='15vh'
                                editable={false}
                                extensions={[sql()]}
                            ></CodeMirror>
                        }
                    </div>

                    <div className='flex flex-col'>
                        <label className='label'>Tabla esperada</label>
                        <CustomTable data={TablaSolucionEjercicio} itemsPerPage={3} />
                    </div>


                    <div className='flex justify-between'>
                        <button onClick={() => SetPaginaActual(1)} className='btn btn-primary'>Retroceder</button>
                        <button onClick={() => SetPaginaActual(3)} className='btn btn-primary'>Siguiente</button>
                    </div>
                </>
            }

            {
                PaginaActual === 3 && (
                    <div className="space-y-6">
                        {/* Selector de tópicos predeterminados */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-lg font-medium">Selecciona los tópicos relevantes:</span>
                            </label>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {topicosDisponibles.map((topico) => (
                                    <label key={topico} className="cursor-pointer flex items-center gap-2 p-2 hover:bg-base-200 rounded-md">
                                        <input
                                            type="checkbox"
                                            checked={topicosSeleccionados.includes(topico)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setTopicosSeleccionados([...topicosSeleccionados, topico]);
                                                } else {
                                                    setTopicosSeleccionados(
                                                        topicosSeleccionados.filter((t) => t !== topico)
                                                    );
                                                }
                                            }}
                                            className="checkbox checkbox-primary"
                                        />
                                        <span className="text-sm sm:text-base">{topico}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Campo para añadir nuevo tópico */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nuevoTopico}
                                onChange={(e) => setNuevoTopico(e.target.value)}
                                placeholder="Añadir nuevo tópico"
                                className="input input-bordered w-full"
                            />
                            <button
                                onClick={() => {
                                    const valor = nuevoTopico.trim();
                                    if (valor && !topicosDisponibles.includes(valor) && !topicosSeleccionados.includes(valor)) {
                                        setTopicosSeleccionados([...topicosSeleccionados, valor]);
                                        setNuevoTopico("");
                                    }
                                }}
                                className="btn btn-primary btn-outline btn-sm"
                            >
                                +
                            </button>
                        </div>

                        {/* Mostrar tópicos seleccionados */}
                        {topicosSeleccionados.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Tópicos seleccionados:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {topicosSeleccionados.map((topico) => (
                                        <div
                                            key={topico}
                                            className="badge badge-primary badge-outline badge-lg"
                                        >
                                            <span>{topico}</span>
                                            {/* Solo mostrar X si es un tópico custom */}
                                            {topicosDisponibles.indexOf(topico) === -1 && (
                                                <button
                                                    onClick={() =>
                                                        setTopicosSeleccionados(
                                                            topicosSeleccionados.filter((t) => t !== topico)
                                                        )
                                                    }
                                                    className="badge badge-primary badge-lg"
                                                    aria-label="Eliminar tópico"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Botón retroceder */}
                        <div className="flex justify-between mt-6">
                            <button onClick={() => SetPaginaActual(2)} className="btn btn-primary">
                                Retroceder
                            </button>
                            <button onClick={MostrarFormulario} className="btn btn-success">
                                Guardar
                            </button>
                        </div>
                    </div>
                )
            }





        </div >



    )
}

export default FormularioCrearEjercicio