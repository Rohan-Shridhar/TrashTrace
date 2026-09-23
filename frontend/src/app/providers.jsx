import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function AppProviders({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  };

  const showToast = (message, type = "info") => {
    const id = crypto.randomUUID();

    setToasts((current) => [
      ...current,
      {
        id,
        message,
        type,
      },
    ]);

    window.setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      removeToast,
    }),
    [toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-region" aria-live="polite">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span>{toast.message}</span>
            <span aria-hidden="true">×</span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}