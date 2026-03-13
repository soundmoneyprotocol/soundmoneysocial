/**
 * Wallet Adapter Context
 * Provides wallet state and functions throughout the app
 */

import React, { ReactNode, useEffect } from 'react';
import { walletAdapterService } from '@/services/walletAdapterService';

interface WalletContextProviderProps {
  children: ReactNode;
  network?: 'devnet' | 'testnet' | 'mainnet-beta' | 'localhost';
  autoInjectWallets?: boolean;
}

/**
 * Wallet Context Provider
 * Wraps the app with wallet functionality
 *
 * Note: Full Solana wallet adapter integration requires:
 * npm install @solana/wallet-adapter-react @solana/wallet-adapter-base @solana/web3.js
 *
 * Usage:
 * <WalletContextProvider network="mainnet-beta">
 *   <App />
 * </WalletContextProvider>
 */
export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({
  children,
  network = 'mainnet-beta',
  autoInjectWallets = false,
}) => {
  // Auto-inject wallets for testing if enabled
  useEffect(() => {
    if (autoInjectWallets && process.env.NODE_ENV === 'development') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('inject-wallets') === 'true') {
        import('@/services/walletInjectionService').then(({ walletInjectionService }) => {
          walletInjectionService.injectAllWallets({ autoApprove: true });
          console.log('✅ Mock wallets injected for testing');
        });
      }
    }
  }, [autoInjectWallets]);

  // For now, just render children
  // Full ConnectionProvider/WalletProvider setup requires npm install
  return <>{children}</>;
};

export default WalletContextProvider;
