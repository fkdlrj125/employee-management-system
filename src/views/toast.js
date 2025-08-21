import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export const showToast = (message, type = 'info', options = {}) => {
  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warn':
      toast.warn(message, options);
      break;
    default:
      toast(message, options);
  }
};
