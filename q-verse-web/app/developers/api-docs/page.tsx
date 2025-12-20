"use client";

import { useEffect } from "react";

export default function APIDocsPage() {
  useEffect(() => {
    // Redirect to Swagger UI
    if (typeof window !== "undefined") {
      window.location.href = "/swagger-ui/";
    }
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📚</div>
        <h1 className="text-2xl font-bold mb-4">Redirecting to API Documentation...</h1>
        <p className="text-gray-400">If you are not redirected, <a href="/swagger-ui/" className="text-blue-400 hover:underline">click here</a>.</p>
      </div>
    </div>
  );
}
