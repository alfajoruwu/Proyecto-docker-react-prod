
import { formatearFecha } from '../../AuxS/Utilidades';

import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';

import { FaDatabase, FaRegFileAlt, FaRegCalendarCheck, FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';

const MostrarCartasDB = ({ ListaBasesDatos, onEditarDB, onBorrarDB }) => {
    const { mostrarToast } = useToast();

    const Navigate = useNavigate();

    const { ProbarDBIDMENU, SetProbarDBIDMENU, SetterProbarDBIDMENU } = useContext(EstadoGlobalContexto)

    // Formatear fecha para mostrar
    const formatFecha = (fechaStr) => {
        if (!fechaStr) return 'Fecha desconocida';
        try {
            return formatearFecha(new Date(fechaStr));
        } catch (error) {
            return fechaStr;
        }
    };

    const IrProbarDB = () => { Navigate('/ProbarDB') }

    return (
        <div className='flex flex-row flex-wrap gap-3'>
            {ListaBasesDatos && ListaBasesDatos.length > 0 ? ListaBasesDatos.map((db) => (
                <div key={db.id} className="card card-compact w-full md:w-96 bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-[360px]">
                    {/* Header con scroll vertical y max 3 líneas */}
                    <div className="bg-neutral p-4 rounded-t-xl flex-shrink-0 max-h-[90px] min-h-[70px] overflow-y-auto overflow-x-hidden">
                        <div className="flex justify-between items-start">
                            <h2 className="card-title text-base-100 break-words break-all leading-snug max-w-full">{db.nombre || 'Sin nombre'}</h2>
                        </div>
                    </div>

                    {/* Contenido con scroll de arriba hacia abajo */}
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                        <div className="p-4 space-y-3">
                            {/* Resumen */}
                            <div className="flex-shrink-0">
                                <p className="text-gray-700 mb-1 font-semibold flex items-center gap-2">
                                    <FaRegFileAlt className="text-lg flex-shrink-0" />
                                    Resumen
                                </p>
                                <div className="max-h-20 overflow-y-auto overflow-x-hidden bg-base-200 rounded p-2">
                                    <p className="break-words break-all whitespace-pre-wrap text-sm text-gray-600">{db.resumen || 'Sin descripción'}</p>
                                </div>
                            </div>

                            {/* Información de fecha */}
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 flex-shrink-0">
                                <FaRegCalendarCheck className="text-lg flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Creación</p>
                                    <p className="font-medium text-gray-500 break-all">{formatFecha(db.fecha_creacion)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer con acciones responsive */}
                    <div className="p-4 border-t border-gray-200 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                className="btn btn-secondary btn-outline flex-1 btn-sm"
                                onClick={() => onEditarDB(db.id)}
                            >
                                <FaEdit className="sm:mr-2 flex-shrink-0" /> <span className="hidden sm:inline">Editar</span>
                            </button>

                            <button
                                className="btn btn-error btn-outline flex-1 btn-sm"
                                onClick={() => {
                                    if (window.confirm(`¿Eliminar "${db.nombre}"?`)) {
                                        onBorrarDB(db.id);
                                    }
                                }}
                            >
                                <FaTrashAlt className="sm:mr-2 flex-shrink-0" /> <span className="hidden sm:inline">Borrar</span>
                            </button>

                            <button
                                className="btn btn-accent btn-outline flex-1 btn-sm"
                                onClick={() => {
                                    console.log(`Probar la base de datos: ${db.id}`);
                                    SetProbarDBIDMENU(db.id);
                                    IrProbarDB();

                                }}
                            >
                                <FaEye className="sm:mr-2 flex-shrink-0" /> <span className="hidden sm:inline">Probar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center w-full py-10">
                    <h3 className="text-lg font-semibold">No hay bases de datos disponibles</h3>
                    <p className="mt-2">Crea una nueva base de datos haciendo clic en el botón "+"</p>
                </div>
            )}
        </div>
    );
}

export default MostrarCartasDB;