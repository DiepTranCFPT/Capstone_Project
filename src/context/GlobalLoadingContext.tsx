import React, { createContext, useCallback, useContext, useState } from "react";

interface GlobalLoadingState {
  isLoading: boolean;
  message?: string;
}

interface GlobalLoadingContextValue extends GlobalLoadingState {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | undefined>(
  undefined,
);

export const GlobalLoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<GlobalLoadingState>({
    isLoading: false,
    message: undefined,
  });

  const showLoading = useCallback((message?: string) => {
    setState({ isLoading: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setState({ isLoading: false, message: undefined });
  }, []);

  return (
    <GlobalLoadingContext.Provider
      value={{
        ...state,
        showLoading,
        hideLoading,
      }}
    >
      {children}
      {state.isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 px-6">
            <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center shadow-2xl animate-bounce">
              <img src="/logo-ap.png" alt="AP Logo" className="w-14 h-14 object-contain animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-semibold text-white">
                Architecting your experience
              </p>
              {state.message && (
                <p className="text-sm text-slate-200/90">{state.message}</p>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs tracking-[0.2em] text-slate-300 uppercase">
                Interface locked during processing
              </p>
            </div>
          </div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
};

export const useGlobalLoading = (): GlobalLoadingContextValue => {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) {
    throw new Error("useGlobalLoading must be used within a GlobalLoadingProvider");
  }
  return ctx;
};


