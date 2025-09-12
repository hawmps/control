import React from 'react';
import { AlertCircle } from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  hintClassName?: string;
}

// =============================================================================
// FORM FIELD WRAPPER COMPONENT
// =============================================================================

export function FormField({
  children,
  label,
  required = false,
  error,
  hint,
  className = '',
  labelClassName = '',
  errorClassName = '',
  hintClassName = ''
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <div className={`flex items-center space-x-1 text-sm text-red-600 ${errorClassName}`}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <p className={`text-sm text-gray-500 ${hintClassName}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default FormField;