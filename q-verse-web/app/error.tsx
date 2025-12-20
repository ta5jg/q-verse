"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-2xl font-bold mb-4 text-red-400">System Malfunction</h2>
      <p className="text-gray-400 mb-6">
        We encountered an error processing your request.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
      >
        Retry Operation
      </button>
    </div>
  );
}
