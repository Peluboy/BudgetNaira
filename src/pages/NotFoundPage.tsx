import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from '@react-icons/all-files/fa/FaHome';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4 mb-2">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary inline-flex items-center">
          <FaHome className="mr-2" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;