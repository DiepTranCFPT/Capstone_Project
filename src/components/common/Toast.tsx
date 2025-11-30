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
    success: 'Login successfully!',
    error: 'Login failed. Please check your email and password.',
    invalidCredentials: 'Email or password is incorrect.',
    loading: 'Logging in...',
  },
  register: {
    success: 'Register successfully! Please check your email to verify your account.',
    error: 'Register failed. Please try again.',
    emailVerification: 'Please check your email to verify your account.',
    loading: 'Registering...',
  },
  common: {
    networkError: 'Network error. Please try again.',
    serverError: 'Server error. Please try again later.',
    unexpectedError: 'An error occurred. Please try again.',
  },
};
