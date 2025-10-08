import { toast as toastify } from 'react-toastify';
import type { ToastOptions, Id } from 'react-toastify';

// Toast utility functions for consistent messaging across the app
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return toastify.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return toastify.error(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return toastify.warning(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return toastify.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toastify.loading(message, {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options,
    });
  },

  dismiss: (toastId?: Id) => {
    toastify.dismiss(toastId);
  },

  update: (toastId: Id, options: ToastOptions) => {
    toastify.update(toastId, options);
  },
};

// Vietnamese messages for authentication
export const authMessages = {
  login: {
    success: 'Đăng nhập thành công!',
    error: 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.',
    invalidCredentials: 'Email hoặc mật khẩu không đúng.',
    loading: 'Đang đăng nhập...',
  },
  register: {
    success: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
    error: 'Đăng ký thất bại. Vui lòng thử lại.',
    emailVerification: 'Vui lòng kiểm tra email để xác thực tài khoản.',
    loading: 'Đang đăng ký...',
  },
  common: {
    networkError: 'Lỗi kết nối mạng. Vui lòng thử lại.',
    serverError: 'Lỗi máy chủ. Vui lòng thử lại sau.',
    unexpectedError: 'Có lỗi xảy ra. Vui lòng thử lại.',
  },
};
