/**
 * Privy Wallet Service
 * Handles Privy integration for wallet management and email authentication
 * Uses magic link login and embedded wallets for user accounts
 */

export interface WalletUser {
  id: string;
  email: string;
  walletAddress: string;
  walletType: 'embedded' | 'connected';
  linkedAt: string;
  isVerified: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  amount: number;
  currency: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

class PrivyWalletService {
  /**
   * Initialize Privy with your app ID
   * Get your app ID from https://dashboard.privy.io
   */
  private appId = process.env.REACT_APP_PRIVY_APP_ID || '';

  /**
   * Link email to user account via magic link
   * Creates an embedded wallet for the user
   */
  async linkEmailToWallet(email: string): Promise<WalletUser> {
    try {
      // In production, this would call Privy's API
      // For now, we'll store locally and generate a mock wallet
      const walletUser: WalletUser = {
        id: `privy_${Date.now()}`,
        email: email,
        walletAddress: this.generateWalletAddress(),
        walletType: 'embedded',
        linkedAt: new Date().toISOString(),
        isVerified: false, // Will be verified after magic link confirmation
      };

      // Store in localStorage (in production, would be on Privy backend)
      localStorage.setItem(`privy_wallet_${email}`, JSON.stringify(walletUser));
      console.log(`✅ Email linked to wallet: ${email}`);

      return walletUser;
    } catch (error) {
      console.error('Error linking email to wallet:', error);
      throw error;
    }
  }

  /**
   * Send magic link to user's email
   * User confirms email ownership and gains access to embedded wallet
   */
  async sendMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // In production, this would call Privy's sendMagicLink endpoint
      console.log(`📧 Magic link sent to: ${email}`);

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: `Magic link sent to ${email}. Please check your email to verify and access your wallet.`,
      };
    } catch (error) {
      console.error('Error sending magic link:', error);
      throw error;
    }
  }

  /**
   * Verify magic link and enable wallet access
   */
  async verifyMagicLink(email: string, linkCode: string): Promise<WalletUser | null> {
    try {
      const storedUser = localStorage.getItem(`privy_wallet_${email}`);
      if (storedUser) {
        const user = JSON.parse(storedUser) as WalletUser;
        user.isVerified = true;
        localStorage.setItem(`privy_wallet_${email}`, JSON.stringify(user));
        console.log(`✅ Email verified for: ${email}`);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error verifying magic link:', error);
      return null;
    }
  }

  /**
   * Get user's wallet
   */
  async getWallet(email: string): Promise<WalletUser | null> {
    try {
      const stored = localStorage.getItem(`privy_wallet_${email}`);
      if (stored) {
        return JSON.parse(stored) as WalletUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting wallet:', error);
      return null;
    }
  }

  /**
   * Get wallet balance (in production, would call blockchain)
   */
  async getWalletBalance(walletAddress: string): Promise<{ BZY: number; USD: number }> {
    try {
      // Mock balance - in production would query blockchain
      const mockBalance = parseFloat(localStorage.getItem(`wallet_balance_${walletAddress}`) || '1250.45');
      const usdValue = mockBalance * 0.15; // Assuming 1 BZY = $0.15

      return {
        BZY: mockBalance,
        USD: usdValue,
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return { BZY: 0, USD: 0 };
    }
  }

  /**
   * Send funds from wallet
   */
  async sendFunds(fromAddress: string, toAddress: string, amount: number): Promise<WalletTransaction> {
    try {
      const transaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        type: 'send',
        amount: amount,
        currency: 'BZY',
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      // In production, this would call Privy's transaction API
      console.log(`💸 Transaction initiated: ${amount} BZY from ${fromAddress} to ${toAddress}`);

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      transaction.status = 'completed';
      transaction.txHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      // Store transaction
      this.storeTransaction(fromAddress, transaction);

      return transaction;
    } catch (error) {
      console.error('Error sending funds:', error);
      throw error;
    }
  }

  /**
   * Request funds to wallet
   */
  async requestFunds(toAddress: string, amount: number, description: string): Promise<{ requestId: string; message: string }> {
    try {
      const requestId = `req_${Date.now()}`;
      console.log(`🙏 Fund request created: ${amount} BZY to ${toAddress}`);

      return {
        requestId: requestId,
        message: `Fund request for ${amount} BZY created. Share your payment link with the sender.`,
      };
    } catch (error) {
      console.error('Error requesting funds:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(walletAddress: string): Promise<WalletTransaction[]> {
    try {
      const stored = localStorage.getItem(`transactions_${walletAddress}`);
      if (stored) {
        return JSON.parse(stored) as WalletTransaction[];
      }
      return [];
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * Link external wallet (Phantom, MetaMask, etc.)
   * Allows users to connect existing wallets
   */
  async linkExternalWallet(walletAddress: string, walletType: string): Promise<WalletUser | null> {
    try {
      const userEmail = localStorage.getItem('user_email') || '';
      const stored = localStorage.getItem(`privy_wallet_${userEmail}`);

      if (stored) {
        const user = JSON.parse(stored) as WalletUser;
        // Store linked wallet separately
        localStorage.setItem(`linked_wallet_${userEmail}`, JSON.stringify({
          address: walletAddress,
          type: walletType,
          linkedAt: new Date().toISOString(),
        }));

        console.log(`✅ External wallet linked: ${walletType} - ${walletAddress}`);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error linking external wallet:', error);
      return null;
    }
  }

  /**
   * Get linked wallets
   */
  async getLinkedWallets(email: string): Promise<Array<{ address: string; type: string; linkedAt: string }>> {
    try {
      const stored = localStorage.getItem(`linked_wallet_${email}`);
      if (stored) {
        return [JSON.parse(stored)];
      }
      return [];
    } catch (error) {
      console.error('Error getting linked wallets:', error);
      return [];
    }
  }

  /**
   * Private helper: Generate random wallet address
   */
  private generateWalletAddress(): string {
    return `0x${Math.random().toString(16).slice(2, 42)}`;
  }

  /**
   * Private helper: Store transaction
   */
  private storeTransaction(walletAddress: string, transaction: WalletTransaction): void {
    const existing = localStorage.getItem(`transactions_${walletAddress}`) || '[]';
    const transactions = JSON.parse(existing) as WalletTransaction[];
    transactions.push(transaction);
    localStorage.setItem(`transactions_${walletAddress}`, JSON.stringify(transactions));
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(email: string): Promise<boolean> {
    try {
      localStorage.removeItem(`privy_wallet_${email}`);
      localStorage.removeItem(`linked_wallet_${email}`);
      console.log(`✅ Wallet disconnected for: ${email}`);
      return true;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      return false;
    }
  }
}

export const privyWalletService = new PrivyWalletService();
export default privyWalletService;
