import React, { useState } from 'react';
import { Wallet, AlertCircle, Smartphone, Monitor } from 'lucide-react';
import { connectWallet } from '../utils/web3';
import toast from 'react-hot-toast';

interface Props {
  onConnect: (address: string) => void;
}

export const ConnectWallet: React.FC<Props> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      const { address } = await connectWallet();
      toast.success('Wallet connected successfully!');
      onConnect(address);
    } catch (error: any) {
      console.error('Connection error:', error);
      const errorMessage = error?.message || 'Failed to connect wallet. Please try again.';
      toast.error(errorMessage, {
        duration: 5000,
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <Wallet className="w-16 h-16 mx-auto text-blue-400 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to SecureEx</h1>
          <p className="text-blue-200">Secure, Decentralized File Sharing</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 ${
              isConnecting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <Wallet className="w-5 h-5" />
            {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
          </button>

          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <div className="flex-1 h-px bg-blue-200/20"></div>
            <span>Available on</span>
            <div className="flex-1 h-px bg-blue-200/20"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-white/5">
              <Smartphone className="w-8 h-8 text-blue-400 mb-2" />
              <span className="text-blue-200 text-sm">Mobile</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-white/5">
              <Monitor className="w-8 h-8 text-blue-400 mb-2" />
              <span className="text-blue-200 text-sm">Browser</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};