import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import BootstrapButton from './BootstrapButton';

// Custom toast styles
const toastStyles = {
  success: {
    style: {
      background: '#0a8d4c',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      padding: '10px 15px',
    },
    icon: <FiCheckCircle size={16} />
  },
  error: {
    style: {
      background: '#d9534f',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      padding: '10px 15px',
    },
    icon: <FiAlertCircle size={16} />
  },
  info: {
    style: {
      background: '#5bc0de',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      padding: '10px 15px',
    },
    icon: <FiInfo size={16} />
  }
};

// Toast functions
export const showSuccessToast = (message, duration = 3000) => {
  return toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center w-full max-w-xs`}
        style={{
          ...toastStyles.success.style,
          opacity: t.visible ? 1 : 0,
          transition: 'all 0.35s ease-out'
        }}
      >
        <div className="d-flex align-items-center">
          <span className="me-2">
            {toastStyles.success.icon}
          </span>
          <span style={{ fontWeight: '500' }}>{message}</span>
          <BootstrapButton
            variant="link"
            onClick={() => toast.dismiss(t.id)}
            style={{
              marginLeft: 'auto',
              padding: '4px',
              color: 'white',
              minWidth: 'auto'
            }}
          >
            <FiX size={14} />
          </BootstrapButton>
        </div>
      </div>
    ),
    { duration }
  );
};

export const showErrorToast = (message, duration = 4000) => {
  return toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center w-full max-w-xs`}
        style={{
          ...toastStyles.error.style,
          opacity: t.visible ? 1 : 0,
          transition: 'all 0.35s ease-out'
        }}
      >
        <div className="d-flex align-items-center">
          <span className="me-2">
            {toastStyles.error.icon}
          </span>
          <span style={{ fontWeight: '500' }}>{message}</span>
          <BootstrapButton
            variant="link"
            onClick={() => toast.dismiss(t.id)}
            style={{
              marginLeft: 'auto',
              padding: '4px',
              color: 'white',
              minWidth: 'auto'
            }}
          >
            <FiX size={14} />
          </BootstrapButton>
        </div>
      </div>
    ),
    { duration }
  );
};

export const showInfoToast = (message, duration = 3000) => {
  return toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center w-full max-w-xs`}
        style={{
          ...toastStyles.info.style,
          opacity: t.visible ? 1 : 0,
          transition: 'all 0.35s ease-out'
        }}
      >
        <div className="d-flex align-items-center">
          <span className="me-2">
            {toastStyles.info.icon}
          </span>
          <span style={{ fontWeight: '500' }}>{message}</span>
          <BootstrapButton
            variant="link"
            onClick={() => toast.dismiss(t.id)}
            style={{
              marginLeft: 'auto',
              padding: '4px',
              color: 'white',
              minWidth: 'auto'
            }}
          >
            <FiX size={14} />
          </BootstrapButton>
        </div>
      </div>
    ),
    { duration }
  );
}; 