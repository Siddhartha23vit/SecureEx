import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Upload, Share2, LogOut, Download, Inbox, Upload as UploadIcon, X, Layers, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToPinata, getFileUrl } from '../utils/pinata';
import { shortenAddress } from '../utils/web3';
import { saveFiles, loadFiles, addSharedFile } from '../utils/storage';
import { FileShare } from '../types';

interface Props {
  address: string;
  onDisconnect: () => void;
}

const NavTab: React.FC<{ 
  label: string; 
  icon: React.ReactNode; 
  isActive: boolean;
  onClick: () => void 
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-white/10 text-white' 
        : 'text-blue-200 hover:bg-white/10'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const Dashboard: React.FC<Props> = ({ address, onDisconnect }) => {
  const [files, setFiles] = useState<FileShare[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileShare | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'files' | 'compression' | 'mpc'>('files');

  useEffect(() => {
    const loadedFiles = loadFiles();
    setFiles(loadedFiles);
  }, []);

  const { myFiles, sharedWithMe } = useMemo(() => {
    return {
      myFiles: files.filter(f => f.sharedBy === address.toLowerCase()),
      sharedWithMe: files.filter(f => f.sharedTo === address.toLowerCase())
    };
  }, [files, address]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const cid = await uploadToPinata(file);
      const newFile: FileShare = {
        cid,
        name: file.name,
        sharedBy: address.toLowerCase(),
        sharedTo: '',
        timestamp: Date.now(),
      };
      addSharedFile(newFile);
      setFiles(loadFiles());
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleShare = useCallback((file: FileShare) => {
    setSelectedFile(file);
    setSharing(true);
  }, []);

  const validateEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const confirmShare = useCallback(() => {
    if (!selectedFile || !recipientAddress) {
      toast.error('Please enter a recipient address');
      return;
    }

    if (!validateEthereumAddress(recipientAddress)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    const normalizedRecipientAddress = recipientAddress.toLowerCase();
    const normalizedUserAddress = address.toLowerCase();

    if (normalizedRecipientAddress === normalizedUserAddress) {
      toast.error('You cannot share a file with yourself');
      return;
    }

    // Create a new shared file entry
    const sharedFile: FileShare = {
      ...selectedFile,
      sharedTo: normalizedRecipientAddress,
      timestamp: Date.now(),
    };

    addSharedFile(sharedFile);
    setFiles(loadFiles());
    setSharing(false);
    setSelectedFile(null);
    setRecipientAddress('');
    toast.success('File shared successfully!');
  }, [selectedFile, recipientAddress, address]);

  const FileList = ({ files, title, icon: Icon }: { files: FileShare[], title: string, icon: React.ComponentType<any> }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      {files.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
          <p className="text-blue-200">No files found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {files.map((file) => (
            <div
              key={`${file.cid}-${file.sharedTo}`}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{file.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-200">
                    {new Date(file.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                {file.sharedTo && (
                  <p className="text-blue-200 text-sm">
                    Shared with: {shortenAddress(file.sharedTo)}
                  </p>
                )}
                {file.sharedBy !== address.toLowerCase() && (
                  <p className="text-blue-200 text-sm">
                    Shared by: {shortenAddress(file.sharedBy)}
                  </p>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <a
                  href={getFileUrl(file.cid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                {!file.sharedTo && file.sharedBy === address.toLowerCase() && (
                  <button
                    onClick={() => handleShare(file)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'compression':
        // return (
        //   <iframe
        //     src="https://rgbcompress.streamlit.app/"
        //     className="w-full h-[calc(100vh-8rem)] rounded-xl bg-white/10 backdrop-blur-lg"
        //     title="Compression Tool"
        //   />
        // );
        window.open('https://rgbcompress.streamlit.app/', '_blank');
        break;
      case 'mpc':
        return (
          <iframe
            src="https://expert-octo-waddle.vercel.app/"
            className="w-full h-[calc(130vh-8rem)] rounded-xl bg-white/10 backdrop-blur-lg"
            title="MPC Tool"
          />
        );
      default:
        return (
          <>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <label className="flex-1">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-8">
              <FileList files={myFiles} title="My Files" icon={UploadIcon} />
              <FileList files={sharedWithMe} title="Shared with Me" icon={Inbox} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black">
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-white">SecureEx</h1>
              <div className="flex gap-4">
                <NavTab
                  label="Files"
                  icon={<Upload className="w-4 h-4" />}
                  isActive={activeTab === 'files'}
                  onClick={() => setActiveTab('files')}
                />
                <NavTab
                  label="Compression"
                  icon={<Layers className="w-4 h-4" />}
                  isActive={activeTab === 'compression'}
                  onClick={() => setActiveTab('compression')}
                />
                <NavTab
                  label="MPC"
                  icon={<Shield className="w-4 h-4" />}
                  isActive={activeTab === 'mpc'}
                  onClick={() => setActiveTab('mpc')}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-blue-200">
                Connected: {shortenAddress(address)}
              </p>
              <button
                onClick={onDisconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {renderContent()}
      </div>

      {sharing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Share File</h2>
              <button
                onClick={() => {
                  setSharing(false);
                  setSelectedFile(null);
                  setRecipientAddress('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {selectedFile && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">File:</p>
                <p className="font-medium">{selectedFile.name}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient's MetaMask Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={confirmShare}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};