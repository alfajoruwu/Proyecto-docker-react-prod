import React from 'react'
import { useToast } from '../../Componentes/ToastContext';
import { formatearFecha } from '../../AuxS/Utilidades';

const MostrarCartasEjercicio = ({ ListaEjercicios, onEditarDB, onBorrarDB }) => {
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
            {ListaEjercicios && ListaEjercicios.length > 0 ? ListaEjercicios.map((ej) => (
                <div key={ej.id} className="card w-80 bg-base-100 card-md shadow-xl">
                    <div>
                        <div className='bg-neutral p-3 text-base-100 rounded-xl'>
                            <h2 className="card-title">{ej.nombre_ej || 'Sin nombre'}</h2>
                        </div>
                        <div className='card-body'>
                            <p><b>Resumen:</b> {ej.descripcion || 'Sin resumen'}</p>
                            <p><b>Fecha creación:</b> {formatFecha(ej.fecha_creacion)}</p>

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
                                            onBorrarDB(ej.id);
                                        }
                                    }}
                                >
                                    Borrar
                                </button>
                                <button className="btn btn-ghost">
                                    Ejercicios: {ej.ejercicios_count || 0}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center w-full py-10">
                    <h3 className="text-lg font-semibold">No hay ejercicios disponibles</h3>
                    <p className="mt-2">Crea un nuevo ejercicio haciendo clic en el botón "+"</p>
                </div>
            )}
        </div>
    );
}

export default MostrarCartasEjercicio;