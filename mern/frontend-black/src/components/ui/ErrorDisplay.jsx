import React from 'react';
import Button from './Button';

const ErrorDisplay = ({ message, onRetry }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center p-8">
        <h2 className="text-2xl text-red-600 mb-4">Oops! Something went wrong.</h2>
        <p className="mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry}>Try Again</Button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;