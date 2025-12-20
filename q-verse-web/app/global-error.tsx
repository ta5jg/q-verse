"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-black text-white flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-8 max-w-md text-center">
            The Q-Verse core encountered a critical anomaly. 
            Don't worry, funds are safe.
        </p>
        <button
          onClick={() => reset()}
          className="bg-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-500 transition-all"
        >
          Reboot System
        </button>
      </body>
    </html>
  );
}
