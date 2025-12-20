"use client";

import { useEffect, useState } from 'react';
import { getWebSocket } from '@/lib/websocket';

export function useRealtimePrice(token: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = getWebSocket();
    
    const unsubscribe = ws.subscribe(`price:${token}`, (data: any) => {
      setPrice(data.price);
      setLoading(false);
    });

    // Initial fetch
    fetch(`/api/oracle/price/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setPrice(data.data.price);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch initial price:', err);
        setLoading(false);
      });

    return () => {
      unsubscribe();
    };
  }, [token]);

  return { price, loading };
}

export function useRealtimeTransactions(walletId: string) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = getWebSocket();
    
    const unsubscribe = ws.subscribe(`transactions:${walletId}`, (data: any) => {
      setTransactions(prev => [data, ...prev].slice(0, 50));
    });

    // Initial fetch
    fetch(`/api/wallets/${walletId}/transactions`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTransactions(data.data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch transactions:', err);
        setLoading(false);
      });

    return () => {
      unsubscribe();
    };
  }, [walletId]);

  return { transactions, loading };
}

export function useRealtimeBlocks() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [latestBlock, setLatestBlock] = useState<any>(null);

  useEffect(() => {
    const ws = getWebSocket();
    
    const unsubscribe = ws.subscribe('block:new', (data: any) => {
      setLatestBlock(data);
      setBlocks(prev => [data, ...prev].slice(0, 20));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { blocks, latestBlock };
}

export function useRealtimeTPS() {
  const [tps, setTps] = useState<number>(0);

  useEffect(() => {
    const ws = getWebSocket();
    
    const unsubscribe = ws.subscribe('network:tps', (data: any) => {
      setTps(data.tps);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { tps };
}
