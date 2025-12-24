/* ==============================================
 * File:        q-verse-web/lib/api.ts
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Q-Verse API Client
 *
 *   Centralized API client with error handling, retries, and caching.
 *   Provides typed methods for all backend API endpoints.
 *
 * License:
 *   MIT License
 * ============================================== */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
  retries?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      cache = 'default',
      retries = 3,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      cache,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Request failed');
        }

        return data.data as T;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async get<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Singleton instance
export const api = new ApiClient();

// Convenience methods for common operations
export const apiMethods = {
  // User & Wallet
  createUser: (username: string) => api.post('/users', { username }),
  getBalance: (walletId: string, token: string) => 
    api.get(`/wallets/${walletId}/balance/${token}`),
  getTransactions: (walletId: string) => 
    api.get(`/wallets/${walletId}/transactions`),
  
  // Exchange
  swap: (data: any) => api.post('/exchange/swap', data),
  getPools: () => api.get('/exchange/pools'),
  createOrder: (data: any) => api.post('/exchange/orders', data),
  getOrderbook: (pair: string) => api.get(`/exchange/orderbook/${pair}`),
  
  // Bridge
  bridge: (data: any) => api.post('/bridge/transfer', data),
  
  // Oracle
  getPrice: (token: string) => api.get(`/oracle/price/${token}`),
  
  // Governance
  getProposals: () => api.get('/governance/proposals'),
  createProposal: (data: any) => api.post('/governance/proposal', data),
  vote: (data: any) => api.post('/governance/vote', data),
  
  // Yield Farming
  getYieldPools: () => api.get('/yield/pools'),
  stakeYield: (data: any) => api.post('/yield/stake', data),
  
  // Batch Operations
  batchTransfer: (data: any) => api.post('/batch/transfer', data),
  batchSwap: (data: any) => api.post('/batch/swap', data),
  
  // Metrics
  getMetrics: () => api.get('/metrics'),
  healthCheck: () => api.get('/health'),
};
