import React from 'react';
import classNames from 'classnames';

const Alert = ({ 
  children, 
  type = 'info', 
  className = '',
  onClose,
  ...props 
}) => {
  const alertClasses = classNames(
    'p-4 rounded-md flex items-start justify-between',
    {
      'bg-blue-50 text-blue-700 border border-blue-200': type === 'info',
      'bg-green-50 text-green-700 border border-green-200': type === 'success',
      'bg-yellow-50 text-yellow-700 border border-yellow-200': type === 'warning',
      'bg-red-50 text-red-700 border border-red-200': type === 'error',
    },
    className
  );

  return (
    <div className={alertClasses} role="alert" {...props}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <span className="text-xl">×</span>
        </button>
      )}
    </div>
  );
};

export default Alert;