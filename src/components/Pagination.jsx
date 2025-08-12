import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';
import PropTypes from 'prop-types';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalElements, 
  pageSize, 
  onPageChange,
  showInfo = true,
  showSizeSelector = false,
  pageSizeOptions = [5, 10, 25, 50],
  onPageSizeChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, currentPage - half);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className={`d-flex justify-content-between align-items-center ${className}`}>
      {showInfo && (
        <div className="pagination-info">
          <small className="text-muted">
            Mostrando {startItem} a {endItem} de {totalElements} registros
          </small>
        </div>
      )}
      
      <div className="d-flex align-items-center gap-3">
        {showSizeSelector && (
          <div className="page-size-selector">
            <small className="text-muted me-2">Mostrar:</small>
            <select 
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={pageSize}
              onChange={(e) => onPageSizeChange && onPageSizeChange(parseInt(e.target.value))}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        
        <BootstrapPagination className="mb-0">
          <BootstrapPagination.First 
            disabled={currentPage === 0}
            onClick={() => onPageChange(0)}
          />
          <BootstrapPagination.Prev 
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
          />
          
          {visiblePages[0] > 0 && (
            <>
              <BootstrapPagination.Item onClick={() => onPageChange(0)}>
                1
              </BootstrapPagination.Item>
              {visiblePages[0] > 1 && <BootstrapPagination.Ellipsis />}
            </>
          )}
          
          {visiblePages.map(page => (
            <BootstrapPagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page + 1}
            </BootstrapPagination.Item>
          ))}
          
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 2 && <BootstrapPagination.Ellipsis />}
              <BootstrapPagination.Item onClick={() => onPageChange(totalPages - 1)}>
                {totalPages}
              </BootstrapPagination.Item>
            </>
          )}
          
          <BootstrapPagination.Next 
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
          />
          <BootstrapPagination.Last 
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(totalPages - 1)}
          />
        </BootstrapPagination>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalElements: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showInfo: PropTypes.bool,
  showSizeSelector: PropTypes.bool,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  onPageSizeChange: PropTypes.func,
  className: PropTypes.string
};

// Funciones legacy para compatibilidad
export function itemRender(current, type, originalElement) {
    if (type === "prev") {
      return <a>Previous</a>;
    }
    if (type === "next") {
      return <a>Next</a>;
    }
    return originalElement;
}
  
export function onShowSizeChange(current, pageSize) {
    // console.log(current, pageSize);
}

export default Pagination;