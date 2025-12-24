/* ==============================================
 * File:        q-verse-web/app/system/metrics/page.tsx
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   System Metrics Dashboard Page
 *
 *   Displays real-time system metrics including request counts,
 *   transaction statistics, and performance metrics.
 *
 * License:
 *   MIT License
 * ============================================== */

"use client";

import { useState, useEffect } from "react";
import { apiMethods } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiMethods.getMetrics();
        setMetrics(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch metrics");
        setLoading(false);
      }
    };

    fetchMetrics();
    // Changed from 5 seconds to 30 seconds to prevent DDoS-like behavior
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner size="lg" text="Loading metrics..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Metrics</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          System Metrics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Requests */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Total Requests</div>
            <div className="text-3xl font-bold text-white">{metrics?.total_requests?.toLocaleString() || 0}</div>
          </div>

          {/* Successful Requests */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Successful</div>
            <div className="text-3xl font-bold text-green-400">{metrics?.successful_requests?.toLocaleString() || 0}</div>
          </div>

          {/* Failed Requests */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Failed</div>
            <div className="text-3xl font-bold text-red-400">{metrics?.failed_requests?.toLocaleString() || 0}</div>
          </div>

          {/* Success Rate */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Success Rate</div>
            <div className="text-3xl font-bold text-blue-400">
              {metrics?.success_rate ? `${metrics.success_rate.toFixed(2)}%` : "0%"}
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Total Transactions</div>
            <div className="text-3xl font-bold text-white">{metrics?.total_transactions?.toLocaleString() || 0}</div>
          </div>

          {/* Total Swaps */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Total Swaps</div>
            <div className="text-3xl font-bold text-purple-400">{metrics?.total_swaps?.toLocaleString() || 0}</div>
          </div>

          {/* Bridge Transactions */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Bridge Transactions</div>
            <div className="text-3xl font-bold text-cyan-400">{metrics?.total_bridge_transactions?.toLocaleString() || 0}</div>
          </div>

          {/* Active Connections */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Active Connections</div>
            <div className="text-3xl font-bold text-yellow-400">{metrics?.active_connections?.toLocaleString() || 0}</div>
          </div>

          {/* Avg Response Time */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Avg Response Time</div>
            <div className="text-3xl font-bold text-green-400">
              {metrics?.avg_response_time_ms ? `${metrics.avg_response_time_ms.toFixed(2)}ms` : "0ms"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
