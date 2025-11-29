import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const formatDateDDMMYYYY = (dateString) => {
  if (!dateString) return 'N/A'; // handle null/undefined
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};


export const showToast = (message, type) => {
  const options = {
    className:
      type === 'success'
        ? 'my-toast my-toast-success'
        : type === 'error'
          ? 'my-toast my-toast-error'
          : type === 'warn'
            ? 'my-toast my-toast-warn'
            : 'my-toast my-toast-info',
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  if (type === 'success') toast.success(message, options);
  else if (type === 'error') toast.error(message, options);
  else if (type === 'warn') toast.warn(message, options);
  else toast.info(message, options);
};