import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';
import { FaFilePen } from "react-icons/fa6";
import { FaFileArrowUp } from "react-icons/fa6";
import { FaDatabase, FaSave, FaTimes, FaCode, FaCheckCircle, FaEdit, FaExclamationTriangle } from "react-icons/fa";
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { useEffect } from 'react';

const FormularioEditarDB = ({ dbId, SetNombre, SetResumen, Setcontext, NombreArchivo, SeterNombreArchivo, SQLinicial, SeterSQLinicial, Nombre, Resumen, Contexto, seterNombreDB, seterResumen, seterContexto, onCreateSuccess }) => {

    const Navigate = useNavigate();
    const { mostrarToast } = useToast();
    const { valorGlobal, setValorGlobal } = useContext(EstadoGlobalContexto)

    const [advertenciaSQL, setAdvertenciaSQL] = useState(null);

    // Función para validar SQL en tiempo real
    const validarSQLTiempoReal = (sql) => {
        if (!sql || sql.trim() === '') {
            setAdvertenciaSQL(null);
            return;
        }

        const sqlLimpio = sql
            .replace(/--.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();

        // Palabras y patrones prohibidos (seguridad + incompatibilidades MySQL + restricciones backend)
        const prohibiciones = [
            // Seguridad - Acceso al sistema
            { patron: /\bPG_\w+/, mensaje: 'Acceso a tablas del sistema (pg_*) no está permitido.' },
            { patron: /\bINFORMATION_SCHEMA\./, mensaje: 'Acceso a INFORMATION_SCHEMA no está permitido.' },
            { patron: /\bPG_CATALOG\./, mensaje: 'Acceso a PG_CATALOG no está permitido.' },
            { patron: /\bCURRENT_USER\b/, mensaje: 'La función CURRENT_USER no está permitida.' },
            { patron: /\bCURRENT_DATABASE\b/, mensaje: 'La función CURRENT_DATABASE no está permitida.' },
            { patron: /\bSESSION_USER\b/, mensaje: 'La función SESSION_USER no está permitida.' },
            { patron: /\bPG_SLEEP\b/, mensaje: 'La función PG_SLEEP no está permitida.' },
            
            // Restricciones del backend - Solo CREATE e INSERT permitidos
            { patron: /\bDROP\b/i, mensaje: 'DROP no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bUPDATE\b/i, mensaje: 'UPDATE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bALTER\b/i, mensaje: 'ALTER no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bGRANT\b/i, mensaje: 'GRANT no está permitido. Los permisos se asignan automáticamente.' },
            { patron: /\bREVOKE\b/i, mensaje: 'REVOKE no está permitido. Los permisos se gestionan automáticamente.' },
            { patron: /\bTRUNCATE\b/i, mensaje: 'TRUNCATE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bREPLACE\b/i, mensaje: 'REPLACE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bEXECUTE\b/i, mensaje: 'EXECUTE no está permitido por razones de seguridad.' },
            { patron: /\bMERGE\b/i, mensaje: 'MERGE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bFUNCTION\b/i, mensaje: 'CREATE FUNCTION no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bTRIGGER\b/i, mensaje: 'CREATE TRIGGER no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bINDEX\b/i, mensaje: 'CREATE INDEX no está permitido en SQL inicial. Los índices pueden agregarse después.' },
            { patron: /\bSEQUENCE\b/i, mensaje: 'CREATE SEQUENCE no está permitido. Usa SERIAL en su lugar.' },
            { patron: /\bVIEW\b/i, mensaje: 'CREATE VIEW no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bRULE\b/i, mensaje: 'CREATE RULE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bCAST\b/i, mensaje: 'CREATE CAST no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO.' },
            { patron: /\bEXTENSION\b/i, mensaje: 'CREATE EXTENSION no está permitido. Las extensiones las gestiona el administrador.' },
            { patron: /\bOWNER\s+TO\b/i, mensaje: 'OWNER TO no está permitido. El propietario se asigna automáticamente.' },
            { patron: /\bSECURITY\b/i, mensaje: 'Configuraciones de SECURITY no están permitidas en SQL inicial.' },
            
            // Incompatibilidades MySQL → PostgreSQL
            { patron: /\bAUTO_INCREMENT\b/i, mensaje: 'AUTO_INCREMENT es de MySQL. En PostgreSQL usa SERIAL o GENERATED ALWAYS AS IDENTITY.' },
            { patron: /\bENGINE\s*=\s*InnoDB/i, mensaje: 'ENGINE=InnoDB es de MySQL. PostgreSQL no necesita especificar motor de almacenamiento.' },
            { patron: /\bTINYINT\b/i, mensaje: 'TINYINT no existe en PostgreSQL. Usa SMALLINT en su lugar.' },
            { patron: /\bMEDIUMINT\b/i, mensaje: 'MEDIUMINT no existe en PostgreSQL. Usa INTEGER en su lugar.' },
            { patron: /\bDOUBLE\b(?!\s+PRECISION)/i, mensaje: 'DOUBLE sin PRECISION no es estándar. En PostgreSQL usa DOUBLE PRECISION o REAL.' },
            { patron: /\bDATETIME\b/i, mensaje: 'DATETIME no existe en PostgreSQL. Usa TIMESTAMP en su lugar.' },
            { patron: /\bLIMIT\s+\d+\s*,\s*\d+/i, mensaje: 'Sintaxis LIMIT offset,count es de MySQL. En PostgreSQL usa LIMIT count OFFSET offset.' },
            { patron: /`[^`]+`/, mensaje: 'Backticks (`) son de MySQL. En PostgreSQL usa comillas dobles ("tabla") o sin comillas.' },
            { patron: /\bUNSIGNED\b/i, mensaje: 'UNSIGNED no existe en PostgreSQL. Usa tipos numéricos apropiados o CHECK constraints.' },
            { patron: /\bZEROFILL\b/i, mensaje: 'ZEROFILL no existe en PostgreSQL. Formatea en la aplicación o usa LPAD().' },
            { patron: /\bENUM\s*\([^)]+\)/i, mensaje: 'ENUM con sintaxis inline no está permitido. Crea el tipo con CREATE TYPE nombre AS ENUM (...) primero.' },
        ];

        // Buscar la primera coincidencia
        for (const { patron, mensaje } of prohibiciones) {
            if (patron.test(sqlLimpio)) {
                setAdvertenciaSQL({ tipo: 'error', mensaje });
                return;
            }
        }

        // Si no hay errores, limpiar advertencia
        setAdvertenciaSQL(null);
    };

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

            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                    <FaEdit className="text-xl text-secondary-content" />
                </div>
                <h1 className="text-2xl font-bold text-secondary">Editar base de datos</h1>
            </div>

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
                    <div className='flex gap-2 items-center'>
                        <FaCheckCircle className="text-lg" />
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

                <button onClick={() => ModificarDB(Nombre, Resumen, Contexto, SQLinicial, dbId)} className='btn flex-3 btn-primary'>
                    <FaSave className="mr-2" />
                    Modificar base de datos
                </button>

                <button onClick={() => { LimpiarFormularios(); }} className='btn flex-1 btn-error'>
                    <FaTimes className="mr-2" />
                    Limpiar formulario
                </button>
            </div>



            {/* POP-UPS */}

            <dialog id="Subir_Archivo" className="modal">
                <div className="modal-box flex flex-col gap-2 w-11/12 max-w-5xl">

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <FaFileArrowUp className="text-lg text-primary-content" />
                        </div>
                        <h3 className="font-bold text-lg">Subir archivo SQL.init</h3>
                    </div>

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
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                            <FaCode className="text-lg text-secondary-content" />
                        </div>
                        <h3 className="font-bold text-lg">Editor archivo</h3>
                    </div>
                    <div className='flex flex-col gap-3'>

                        {/* Advertencia SQL en tiempo real */}
                        {advertenciaSQL && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
                                <div className="flex items-center gap-3">
                                    <FaExclamationTriangle className="text-2xl flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-lg">Advertencia de seguridad</p>
                                        <p className="text-sm mt-1">{advertenciaSQL.mensaje}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <CodeMirror className=''
                            value={SQLinicial}
                            height='50vh'
                            onChange={(value) => {
                                SeterSQLinicial(value);
                                validarSQLTiempoReal(value);
                            }}
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
                                <button onClick={() => CrearnuevoINIT(SQLinicial)} className='btn flex-1 btn-primary'>
                                    <FaSave className="mr-2" />
                                    Guardar nuevo archivo
                                </button>
                                <button onClick={() => CancelarCambios()} className='btn flex-1 btn-error'>
                                    <FaTimes className="mr-2" />
                                    Cancelar
                                </button>
                            </div>
                        }
                        {NombreArchivo != '' &&
                            <div className='flex flex-row gap-3'>
                                <button onClick={() => ModificarINIT(SQLinicial)} className='btn flex-1 btn-primary'>
                                    <FaSave className="mr-2" />
                                    Actualizar
                                </button>
                                <button onClick={() => CancelarCambios()} className='btn flex-1 btn-error'>
                                    <FaTimes className="mr-2" />
                                    Cancelar
                                </button>
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