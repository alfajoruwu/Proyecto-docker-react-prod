import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';
import { FaFilePen } from "react-icons/fa6";
import { FaFileArrowUp } from "react-icons/fa6";
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { useEffect } from 'react';

const FormularioEditarDB = ({ dbId, SetNombre, SetResumen, Setcontext, NombreArchivo, SeterNombreArchivo, SQLinicial, SeterSQLinicial, Nombre, Resumen, Contexto, seterNombreDB, seterResumen, seterContexto, onCreateSuccess }) => {

    const Navigate = useNavigate();
    const { mostrarToast } = useToast();
    const { valorGlobal, setValorGlobal } = useContext(EstadoGlobalContexto)

    const LimpiarFormularios = () => {
        SeterNombreArchivo('');
        SeterSQLinicial('');
        SetNombre('');
        SetResumen('');
        Setcontext('');
    }


    const ModificarDB = (Nombre, Resumen, Contexto, SQL, idDB) => {

        console.log('Modificando base de datos:', Nombre, Resumen, Contexto, SQL, idDB);

        apiClient.put('/basedatos/EditarDB', { dbName: Nombre, Descripcion: Contexto, Resumen: Resumen, SQL: SQL, dbId: idDB })
            .then(response => {
                console.log('resultado:', response.data);
                mostrarToast(response.data.message, 'success', 3000);
                document.getElementById('Editar_db').close();
                LimpiarFormularios();
                if (onCreateSuccess) {
                    onCreateSuccess();
                }
            })
            .catch(error => {
                console.error('Error del backend:', error.response?.data?.error || error.message);
                mostrarToast(error.response?.data?.error || 'Error al modificar la base de datos', 'error', 3000);
            });
    }

    // Abrir Editar SQL
    const EditarSQL = () => {
        SetTempTextoModificar(SQLinicial)
        document.getElementById('EditarSQL').showModal();
    }

    // Cancelar cambios
    const CancelarCambios = () => {
        document.getElementById('EditarSQL').close();
        SeterSQLinicial(TempTextoModificar);
        mostrarToast('Cambios cancelados', 'warning');
    }

    // Crear nuevo SQL
    const CrearnuevoINIT = (Texto) => {
        SeterNombreArchivo('Nuevo.init');
        SeterSQLinicial(Texto)
        document.getElementById('EditarSQL').close();
        mostrarToast('Archivo creado correctamente', 'success');
    }

    const ModificarINIT = (Texto) => {
        SeterSQLinicial(Texto)
        document.getElementById('EditarSQL').close();
        mostrarToast('Archivo actualizado correctamente', 'success');
    }

    // Temporal para copia de texto
    const [TempTextoModificar, SetTempTextoModificar] = useState('')
    const SetterTempTextoModificar = (event) => {
        SetTempTextoModificar(event.target.value)
    }


    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file && file.name.endsWith('.sql')) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;
                SeterSQLinicial(content);
                console.log('Contenido del archivo SQL:');
                console.log(content);
            };

            SeterNombreArchivo(file.name)
            console.log(NombreArchivo)
            reader.readAsText(file);
            document.getElementById('Subir_Archivo').close()
        } else {

            SeterNombreArchivo('')
            SeterSQLinicial('')
            mostrarToast('Tipo de archivo no compatible', 'error', 3000);
        }
    };

    return (
        <div className='p-4 gap-6 flex flex-col'>

            <h1 class="text-2xl font-bold mb-6 text-center">Editar base de datos</h1>

            <div>
                <label className='label'>Nombre de la base de datos</label>
                <input value={Nombre} onChange={seterNombreDB} type="text" placeholder="Nombre de base de datos" class="input w-full " />
            </div>

            <div className='flex flex-col'>
                <label className='label'>Resumen</label>
                <textarea value={Resumen} onChange={seterResumen} class="textarea w-full" placeholder="Pequeña descripcion de la base de datos"></textarea>
            </div>

            <div className='flex flex-col'>
                <label className='label'>Contexto</label>
                <textarea value={Contexto} onChange={seterContexto} class="textarea w-full" placeholder="En que consiste la base de datos"></textarea>
            </div>

            {
                NombreArchivo != '' &&
                <div className="flex bg-success rounded p-3 text-accent-content shadow-lg">
                    <div className='flex gap-2 '>

                        <h1>Archivo seleccionado: {NombreArchivo}</h1>
                    </div>


                </div>
            }

            <div className='divider'></div>


            <div className='flex flex-wrap gap-3 w-full'>
                <button onClick={() => document.getElementById('Subir_Archivo').showModal()} className='btn h-20 btn-primary text-xl flex-1'> <div className='flex flex-col items-center gap-3'><text>Subir archivo</text>  <FaFileArrowUp size="1.5rem" /></div> </button>

                <button onClick={() => EditarSQL()} className='btn btn-primary flex-1 h-20 text-xl'> <div className='flex flex-col items-center gap-3'> <text>Editar SQL inicial</text>  <FaFilePen size="1.5rem" /></div> </button>
            </div>

            <div className='flex flex-wrap flex-row w-[100%] gap-3'>

                <button onClick={() => ModificarDB(Nombre, Resumen, Contexto, SQLinicial, dbId)} className='btn flex-3 btn-primary'>Modificar base de datos</button>


                <button onClick={() => { LimpiarFormularios(); }} className='btn flex-1 btn-error'>Limpiar formulario</button>
            </div>



            {/* POP-UPS */}

            <dialog id="Subir_Archivo" className="modal">
                <div className="modal-box flex flex-col gap-2 w-11/12 max-w-5xl">

                    <h3 className="font-bold text-lg">Subir archivo SQL.init</h3>

                    <div className='p-6'>
                        <input onChange={handleFileChange} type="file" class="file-input w-full file-input-primary" />
                    </div>

                    {
                        NombreArchivo != '' &&
                        <div className="flex bg-success rounded p-3 text-accent-content shadow-lg">
                            <div className='flex gap-2 '>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h1>Tu archivo ha sido cargado correctamente.</h1>
                            </div>


                        </div>
                    }

                    {
                        NombreArchivo == '' &&
                        <div className="flex bg-neutral rounded p-3 text-error-content shadow-lg">
                            <div className='flex gap-2'>
                                <h1>Selecciona archivo con formato SQL</h1>
                            </div>
                        </div>
                    }

                    <div className='flex gap-3 flex-row'>

                    </div>


                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>


            <dialog id="EditarSQL" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <h3 className="font-bold  text-lg">Editor archivo</h3>
                    <div className='  flex flex-col gap-3 '>

                        <CodeMirror className=''
                            value={SQLinicial}
                            height='50vh'
                            onChange={SeterSQLinicial}
                            extensions={[sql()]}
                            basicSetup={{
                                lineNumbers: true,
                                highlightActiveLineGutter: true,
                                highlightSpecialChars: true,
                                foldGutter: true,
                                dropCursor: true,
                                allowMultipleSelections: true,
                                indentOnInput: true,
                                syntaxHighlighting: true,
                                bracketMatching: true,
                                closeBrackets: true,
                                autocompletion: true,
                                rectangularSelection: true,
                                crosshairCursor: true,
                                highlightActiveLine: true,
                                highlightSelectionMatches: true,
                                closeBracketsKeymap: true,
                                searchKeymap: true,
                                foldKeymap: true,
                                completionKeymap: true,
                                lintKeymap: true
                            }}

                        />

                        {NombreArchivo == '' &&
                            <div className='flex flex-row gap-3'>
                                <button onClick={() => CrearnuevoINIT(SQLinicial)} className='btn flex-1 btn-primary'>Guardar nuevo archivo</button>
                                <button onClick={() => CancelarCambios()} className='btn flex-1 btn-error'>Cancelar</button>
                            </div>
                        }
                        {NombreArchivo != '' &&
                            <div className='flex flex-row gap-3'>
                                <button onClick={() => ModificarINIT(SQLinicial)} className='btn flex-1 btn-primary'>Actualizar</button>
                                <button onClick={() => CancelarCambios()} className='btn flex-1 btn-error'>Cancelar</button>
                            </div>
                        }
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </div>



    )
}

export default FormularioEditarDB