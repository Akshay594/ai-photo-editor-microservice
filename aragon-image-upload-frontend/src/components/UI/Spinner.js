import React from 'react';
import classNames from 'classnames';

const Spinner = ({ size = 'md', className = '' }) => {
  const spinnerClasses = classNames(
    'animate-spin rounded-full border-t-transparent',
    {
      'w-4 h-4 border-2': size === 'sm',
      'w-6 h-6 border-2': size === 'md',
      'w-8 h-8 border-3': size === 'lg',
    },
    className || 'border-aragon-primary'
  );

  return (
    <div className="inline-flex">
      <div className={spinnerClasses} role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;