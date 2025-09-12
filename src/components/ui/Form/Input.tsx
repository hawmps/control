import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ComponentType<any>;
  rightIcon?: React.ComponentType<any>;
  onRightIconClick?: () => void;
}

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon' | 'onRightIconClick'> {
  showPasswordToggle?: boolean;
}

// =============================================================================
// BASE INPUT COMPONENT
// =============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  variant = 'default',
  size = 'md',
  fullWidth = true,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors';
  
  const variantClasses = {
    default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-300 focus:ring-green-500 focus:border-green-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900';
  
  const paddingAdjustments = {
    left: LeftIcon ? (size === 'sm' ? 'pl-10' : size === 'lg' ? 'pl-12' : 'pl-11') : '',
    right: RightIcon ? (size === 'sm' ? 'pr-10' : size === 'lg' ? 'pr-12' : 'pr-11') : ''
  };
  
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  const iconPosition = {
    left: size === 'sm' ? 'left-3' : 'left-3.5',
    right: size === 'sm' ? 'right-3' : 'right-3.5'
  };
  
  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {LeftIcon && (
        <div className={`absolute inset-y-0 ${iconPosition.left} flex items-center pointer-events-none`}>
          <LeftIcon className={`${iconSize} text-gray-400`} />
        </div>
      )}
      
      <input
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${disabledClasses}
          ${paddingAdjustments.left}
          ${paddingAdjustments.right}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled}
        {...props}
      />
      
      {RightIcon && (
        <div className={`absolute inset-y-0 ${iconPosition.right} flex items-center ${onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'}`}>
          <RightIcon 
            className={`${iconSize} text-gray-400 ${onRightIconClick ? 'hover:text-gray-600' : ''}`}
            onClick={onRightIconClick}
          />
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// =============================================================================
// PASSWORD INPUT COMPONENT
// =============================================================================

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  showPasswordToggle = true,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={showPasswordToggle ? (showPassword ? EyeOff : Eye) : undefined}
      onRightIconClick={showPasswordToggle ? togglePassword : undefined}
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

// =============================================================================
// TEXTAREA COMPONENT
// =============================================================================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success';
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className = '',
  variant = 'default',
  resize = 'vertical',
  fullWidth = true,
  disabled,
  rows = 4,
  ...props
}, ref) => {
  const baseClasses = 'border rounded-md shadow-sm px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors';
  
  const variantClasses = {
    default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-300 focus:ring-green-500 focus:border-green-500'
  };
  
  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y'
  };
  
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900';
  
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${resizeClasses[resize]}
        ${disabledClasses}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Input;