# Transaction Features Implementation Guide

## Overview

This guide outlines how to implement transaction history, gas estimation, and retry mechanisms for the NFT platform using wagmi/viem instead of ethers.js.

## Prerequisites

The project uses:
- **wagmi** v2.12.29 - React hooks for Ethereum
- **viem** v2.39.3 - TypeScript library for Ethereum
- **@rainbow-me/rainbowkit** - Wallet connection UI

## Transaction History

### Database Schema

Create a Supabase table for transaction tracking:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tx_hash TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  contract_address TEXT NOT NULL,
  function_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')) NOT NULL,
  gas_used TEXT,
  gas_price TEXT,
  block_number BIGINT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  UNIQUE(tx_hash, chain_id)
);

-- Index for user queries
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

### Implementation with wagmi

```typescript
// src/hooks/useTransactionHistory.ts
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface TransactionRecord {
  id: string;
  tx_hash: string;
  chain_id: number;
  contract_address: string;
  function_name: string;
  status: 'pending' | 'confirmed' | 'failed';
  gas_used?: string;
  block_number?: number;
  created_at: string;
  confirmed_at?: string;
}

export function useTransactionHistory() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    async function fetchTransactions() {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setTransactions(data);
      }
      setLoading(false);
    }

    fetchTransactions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('transaction_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
      }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [address]);

  return { transactions, loading };
}
```

### Transaction History Component

```typescript
// src/components/wallet/TransactionHistory.tsx
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

export function TransactionHistory() {
  const { transactions, loading } = useTransactionHistory();

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {tx.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                {tx.status === 'confirmed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {tx.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                
                <div>
                  <p className="font-medium">{tx.function_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={
                  tx.status === 'confirmed' ? 'default' :
                  tx.status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {tx.status}
                </Badge>
                
                <a
                  href={`https://etherscan.io/tx/${tx.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Gas Estimation

### Using wagmi Hooks

```typescript
// src/hooks/useGasEstimate.ts
import { useEstimateGas, useGasPrice } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useState, useEffect } from 'react';

export function useGasEstimate(
  contractAddress: `0x${string}`,
  functionName: string,
  args: any[]
) {
  const [ethPrice, setEthPrice] = useState(0);

  // Estimate gas limit
  const { data: gasEstimate } = useEstimateGas({
    address: contractAddress,
    functionName,
    args,
  });

  // Get current gas price
  const { data: gasPrice } = useGasPrice();

  // Fetch ETH price
  useEffect(() => {
    async function fetchEthPrice() {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Failed to fetch ETH price:', error);
      }
    }
    fetchEthPrice();
  }, []);

  // Calculate estimated cost
  const estimatedCostEth = gasEstimate && gasPrice
    ? formatEther(gasEstimate * gasPrice)
    : '0';

  const estimatedCostUsd = ethPrice
    ? (parseFloat(estimatedCostEth) * ethPrice).toFixed(2)
    : '0';

  return {
    gasLimit: gasEstimate,
    gasPrice,
    estimatedCostEth,
    estimatedCostUsd,
  };
}
```

### Gas Estimator Component

```typescript
// src/components/wallet/GasEstimator.tsx
import { useGasEstimate } from '@/hooks/useGasEstimate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel } from 'lucide-react';

interface GasEstimatorProps {
  contractAddress: `0x${string}`;
  functionName: string;
  args: any[];
}

export function GasEstimator({ contractAddress, functionName, args }: GasEstimatorProps) {
  const { gasLimit, gasPrice, estimatedCostEth, estimatedCostUsd } = useGasEstimate(
    contractAddress,
    functionName,
    args
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="w-5 h-5" />
          Gas Estimate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gas Limit:</span>
            <span className="font-medium">{gasLimit?.toString() || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gas Price:</span>
            <span className="font-medium">{gasPrice?.toString() || '—'} wei</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Cost:</span>
            <span className="font-medium">
              {estimatedCostEth} ETH (${estimatedCostUsd})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Transaction Retry Logic

### Using wagmi's useWriteContract

```typescript
// src/hooks/useTransactionWithRetry.ts
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useTransactionWithRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function executeWithRetry(
    contractAddress: `0x${string}`,
    abi: any,
    functionName: string,
    args: any[]
  ) {
    try {
      // Save transaction to database
      const { data: user } = await supabase.auth.getUser();
      if (user.user && hash) {
        await supabase.from('transactions').insert({
          user_id: user.user.id,
          tx_hash: hash,
          chain_id: 1, // Replace with actual chain ID
          contract_address: contractAddress,
          function_name: functionName,
          status: 'pending',
        });
      }

      // Execute transaction
      await writeContract({
        address: contractAddress,
        abi,
        functionName,
        args,
      });

      setRetryCount(0);
    } catch (err) {
      console.error('Transaction failed:', err);

      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(contractAddress, abi, functionName, args);
      }

      throw err;
    }
  }

  return {
    executeWithRetry,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
    retryCount,
  };
}
```

### Usage Example

```typescript
// src/components/MintButton.tsx
import { useTransactionWithRetry } from '@/hooks/useTransactionWithRetry';
import { Button } from '@/components/ui/button';

export function MintButton() {
  const { executeWithRetry, isPending, isConfirming, isSuccess, retryCount } = 
    useTransactionWithRetry();

  async function handleMint() {
    await executeWithRetry(
      '0x...', // contract address
      contractABI,
      'mint',
      [1] // args
    );
  }

  return (
    <Button onClick={handleMint} disabled={isPending || isConfirming}>
      {isPending && 'Preparing...'}
      {isConfirming && 'Confirming...'}
      {retryCount > 0 && `Retrying (${retryCount}/3)...`}
      {!isPending && !isConfirming && 'Mint NFT'}
    </Button>
  );
}
```

## Best Practices

1. **Error Handling**: Always handle transaction errors gracefully
2. **User Feedback**: Show clear status updates during transaction lifecycle
3. **Gas Buffer**: Add 10-20% buffer to gas estimates
4. **Retry Logic**: Implement exponential backoff for retries
5. **Database Sync**: Keep transaction records in sync with blockchain state
6. **Real-time Updates**: Use Supabase real-time subscriptions for live updates

## Resources

- [wagmi Documentation](https://wagmi.sh/)
- [viem Documentation](https://viem.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Supabase Real-time](https://supabase.com/docs/guides/realtime)
