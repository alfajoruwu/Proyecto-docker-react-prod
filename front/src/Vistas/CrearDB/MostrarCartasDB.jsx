import React from 'react'
import { useToast } from '../../Componentes/ToastContext';
import { formatearFecha } from '../../AuxS/Utilidades';

const MostrarCartasDB = ({ ListaBasesDatos, onEditarDB, onBorrarDB }) => {
    const { mostrarToast } = useToast();

    // Formatear fecha para mostrar
    const formatFecha = (fechaStr) => {
        if (!fechaStr) return 'Fecha desconocida';
        try {
            return formatearFecha(new Date(fechaStr));
        } catch (error) {
            return fechaStr;
        }
    };

    return (
        <div className='flex flex-row flex-wrap gap-3'>
            {ListaBasesDatos && ListaBasesDatos.length > 0 ? ListaBasesDatos.map((db) => (
                <div key={db.id} className="card w-80 bg-base-100 card-md shadow-xl">
                    <div>
                        <div className='bg-neutral p-3 text-base-100 rounded-xl'>
                            <h2 className="card-title">{db.nombre || 'Sin nombre'}</h2>
                        </div>
                        <div className='card-body'>
                            <p><b>Resumen:</b> {db.resumen || 'Sin resumen'}</p>
                            <p><b>Fecha creación:</b> {formatFecha(db.fecha_creacion)}</p>

                            <div className="divider"></div>

                            <div className="card-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => onEditarDB(db.id)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={() => {
                                        if (window.confirm(`¿Estás seguro de que quieres borrar la base de datos "${db.nombre}"?`)) {
                                            onBorrarDB(db.id);
                                        }
                                    }}
                                >
                                    Borrar
                                </button>
                                <button className="btn btn-ghost">
                                    Ejercicios: {db.ejercicios_count || 0}
                                </button>
                            </div>
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