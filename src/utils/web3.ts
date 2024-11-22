import { MetaMaskSDK, SDKProvider } from '@metamask/sdk';
import { ethers } from 'ethers';

let metamaskSDK: MetaMaskSDK;

const initializeSDK = () => {
  if (!metamaskSDK) {
    metamaskSDK = new MetaMaskSDK({
      dappMetadata: {
        name: 'SecureEx',
        url: window.location.href,
      },
      logging: {
        sdk: false,
      },
      checkInstallationImmediately: true,
      connectOptions: {
        mustBeMetaMask: true,
      },
    });
  }
  return metamaskSDK;
};

export const shortenAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const connectWallet = async () => {
  try {
    const sdk = initializeSDK();
    const ethereum = sdk.getProvider();
    
    if (!ethereum) {
      throw new Error('Please install MetaMask to use this application.');
    }

    const provider = new ethers.providers.Web3Provider(ethereum as any);
    
    // Request account access
    const accounts = await ethereum.request<string[]>({ 
      method: 'eth_requestAccounts' 
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }

    const signer = provider.getSigner();
    const address = await signer.getAddress();

    // Setup event listeners
    ethereum.on('accountsChanged', (newAccounts: string[]) => {
      if (!newAccounts || newAccounts.length === 0) {
        window.location.reload();
      }
    });

    ethereum.on('chainChanged', () => {
      window.location.reload();
    });

    ethereum.on('disconnect', () => {
      window.location.reload();
    });

    return { provider, signer, address };
  } catch (error: any) {
    console.error('Wallet connection error:', error);
    
    if (error?.code === 4001) {
      throw new Error('You rejected the connection request. Please try again.');
    }
    
    if (error?.code === -32002) {
      throw new Error('MetaMask is already processing a connection request. Please check your wallet.');
    }
    
    if (error?.message?.includes('install')) {
      throw new Error('Please install MetaMask to use this application.');
    }

    throw error;
  }
};