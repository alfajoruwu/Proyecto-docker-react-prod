import React, { useState, useEffect } from 'react';

const CustomTable = ({ data = [], itemsPerPage = 5 }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Detectar columnas del primer objeto
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    // Paginación
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const goToPrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    // ✅ Resetear currentPage si los datos cambian o itemsPerPage se actualiza
    useEffect(() => {
        const newTotalPages = Math.ceil(data.length / itemsPerPage);

        // Si no hay datos o la página actual excede las páginas disponibles
        if (newTotalPages === 0 || currentPage > newTotalPages) {
            setCurrentPage(1);
        }
    }, [data, itemsPerPage]); // Solo dependemos de data e itemsPerPage

    return (
        <div className="flex flex-col bg-base-100 w-full">
            {/* Contenedor de la tabla con scroll lateral en móviles */}
            <div className="overflow-x-auto w-full">
                <table className="table table-zebra w-full">
                    {/* Head */}
                    <thead className="bg-primary">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`p-2 sm:p-3 font-medium text-primary-content text-xs sm:text-sm whitespace-nowrap ${index === 0 ? 'rounded-tl-lg' : ''
                                        } ${index === columns.length - 1 ? 'rounded-tr-lg' : ''}`}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-8 text-sm sm:text-base"
                                >
                                    No hay datos disponibles para mostrar.
                                </td>
                            </tr>
                        ) : (
                            currentData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover">
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="p-2 sm:p-3 text-xs sm:text-sm"
                                        >
                                            {String(row[col])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {data.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-4 px-2 sm:px-0">
                    <div className="text-xs sm:text-sm text-center sm:text-left">
                        Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, data.length)} de {data.length} resultados
                    </div>
                    <div className="join">
                        <button
                            className="join-item btn btn-sm"
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        <button className="join-item btn btn-sm">
                            Página {currentPage}
                        </button>
                        <button
                            className="join-item btn btn-sm"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomTable;