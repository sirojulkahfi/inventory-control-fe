'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('BERIKUT ADALAH ERRORNYA CUY:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-10 text-black">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Waduh, Aplikasi Crash!</h2>
      <div className="bg-white p-4 rounded-lg shadow border border-red-200 mb-4 max-w-2xl w-full">
        <p className="font-mono text-sm text-red-800 break-words">{error.message}</p>
      </div>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        onClick={() => reset()}
      >
        Coba Render Ulang
      </button>
    </div>
  );
}