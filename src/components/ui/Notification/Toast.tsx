import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export interface ToastProps extends Toast {
  onRemove: (id: string) => void;
}

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

// =============================================================================
// TOAST COMPONENT
// =============================================================================

export function ToastComponent({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  persistent = false, 
  action, 
  onDismiss, 
  onRemove 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Show animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Auto dismiss
  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);
  
  const handleDismiss = () => {
    setIsRemoving(true);
    onDismiss?.();
    
    // Wait for animation before removing
    setTimeout(() => {
      onRemove(id);
    }, 300);
  };
  
  const handleActionClick = () => {
    action?.onClick();
    handleDismiss();
  };
  
  // Icon and styling based on type
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };
  
  const { icon: Icon, bgColor, borderColor, iconColor, titleColor, messageColor } = config[type];
  
  return (
    <div
      className={`
        max-w-md w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
        ${bgColor} ${borderColor} border
        transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          
          <div className="ml-3 flex-1 min-w-0 pt-0.5">
            {title && (
              <p className={`text-sm font-medium ${titleColor} break-words`}>
                {title}
              </p>
            )}
            <p className={`text-sm ${messageColor} ${title ? 'mt-1' : ''} break-words`}>
              {message}
            </p>
            
            {action && (
              <div className="mt-3">
                <button
                  onClick={handleActionClick}
                  className={`text-sm font-medium ${titleColor} hover:${titleColor.replace('800', '900')} focus:outline-none focus:underline`}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleDismiss}
              className={`rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TOAST CONTEXT & PROVIDER
// =============================================================================

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ 
  children, 
  position = 'top-right',
  maxToasts = 5 
}: { 
  children: React.ReactNode;
  position?: ToastContainerProps['position'];
  maxToasts?: number;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36);
    const newToast: Toast = { ...toast, id };
    
    setToasts(prev => {
      const updated = [...prev, newToast];
      // Remove oldest toasts if exceeding max
      return updated.slice(-maxToasts);
    });
  };
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const clearToasts = () => {
    setToasts([]);
  };
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2'
  };
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className={`fixed z-50 p-6 ${positionClasses[position]} pointer-events-none`}>
        <div className="flex flex-col space-y-4">
          {toasts.map(toast => (
            <ToastComponent
              key={toast.id}
              {...toast}
              onRemove={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

// =============================================================================
// TOAST HOOK
// =============================================================================

export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  const { addToast, removeToast, clearToasts } = context;
  
  // Convenience methods
  const success = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ type: 'success', message, ...options });
  };
  
  const error = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ type: 'error', message, ...options });
  };
  
  const warning = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ type: 'warning', message, ...options });
  };
  
  const info = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ type: 'info', message, ...options });
  };
  
  return {
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  };
}