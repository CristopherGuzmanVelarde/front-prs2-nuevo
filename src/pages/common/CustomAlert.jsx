import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const CustomAlert = ({ 
  show, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info', 
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = true,
  autoClose = false,
  autoCloseTime = 1500
}) => {
  React.useEffect(() => {
    if (autoClose && show) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, autoCloseTime, onClose]);

  const getVariant = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-times-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-info-circle';
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered
      className="modal-dialog-centered"
    >
      <Modal.Header closeButton className={`bg-${getVariant()} text-white border-0`}>
        <Modal.Title className="d-flex align-items-center">
          <i className={`${getIcon()} me-2`}></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        {message}
      </Modal.Body>
      <Modal.Footer className="border-0 pb-3">
        {showCancel && (
          <Button 
            variant="light" 
            onClick={onClose}
            className="me-2"
          >
            <i className="fas fa-times me-1"></i>
            {cancelText}
          </Button>
        )}
        {onConfirm && (
          <Button 
            variant={getVariant()} 
            onClick={onConfirm}
          >
            <i className="fas fa-check me-1"></i>
            {confirmText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

CustomAlert.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  showCancel: PropTypes.bool,
  autoClose: PropTypes.bool,
  autoCloseTime: PropTypes.number
};

CustomAlert.defaultProps = {
  type: 'info',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  showCancel: true,
  autoClose: false,
  autoCloseTime: 1500,
  onConfirm: null
};

export default CustomAlert; 