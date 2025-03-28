import React from 'react';
import classNames from 'classnames';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  ...props 
}) => {
  const buttonClasses = classNames(
    'font-medium rounded focus:outline-none transition-colors',
    {
      'bg-aragon-primary hover:bg-aragon-primary/90 text-white': variant === 'primary',
      'bg-gray-200 hover:bg-gray-300 text-gray-800': variant === 'secondary',
      'bg-transparent border border-aragon-primary text-aragon-primary hover:bg-aragon-primary/10': variant === 'outline',
      'bg-aragon-error hover:bg-aragon-error/90 text-white': variant === 'danger',
      'opacity-50 cursor-not-allowed': disabled,
      'py-1 px-2 text-sm': size === 'sm',
      'py-2 px-4 text-base': size === 'md',
      'py-3 px-6 text-lg': size === 'lg',
    },
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;