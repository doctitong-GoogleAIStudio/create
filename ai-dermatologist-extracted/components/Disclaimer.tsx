import React from 'react';

interface DisclaimerProps {
  message: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ message }) => {
  return (
    <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 p-4 rounded-md shadow-sm" role="alert">
      <div className="flex">
        <div className="py-1">
          <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z" />
          </svg>
        </div>
        <div>
          <p className="font-bold">Important Disclaimer</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;