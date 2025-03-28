import React from 'react';

const ProgressBar = ({ current, total }) => {
  const percentage = Math.min(100, Math.round((current / total) * 100)) || 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Uploaded Images</span>
        <span className="text-sm font-medium text-gray-700">{current} of {total}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-aragon-primary to-aragon-secondary" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;