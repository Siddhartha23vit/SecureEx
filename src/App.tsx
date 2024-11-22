import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ConnectWallet } from './components/ConnectWallet';
import { Dashboard } from './components/Dashboard';

function App() {
  const [address, setAddress] = useState<string>('');

  return (
    <>
      <Toaster position="top-right" />
      {!address ? (
        <ConnectWallet onConnect={setAddress} />
      ) : (
        <Dashboard 
          address={address} 
          onDisconnect={() => setAddress('')} 
        />
      )}
    </>
  );
}

export default App;