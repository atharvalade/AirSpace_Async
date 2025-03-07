"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import NilOnboardingModal from './NilOnboardingModal';

const NilAuthButton: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const openOnboardingModal = () => {
    setIsOnboardingModalOpen(true);
  };

  const closeOnboardingModal = () => {
    setIsOnboardingModalOpen(false);
  };

  const handleConnect = async () => {
    try {
      // Open the onboarding modal instead of directly connecting
      openOnboardingModal();
    } catch (err) {
      toast.error('Failed to open connection dialog. Please try again.');
      console.error(err);
    }
  };

  const handleOnboardingConnect = async () => {
    try {
      setIsConnecting(true);
      
      // In a real implementation, this would call the backend script to initialize the wallet
      // For now, we'll simulate a successful connection
      setTimeout(() => {
        // Generate a random address for demonstration
        const mockAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        setAddress(mockAddress);
        setIsConnected(true);
        setIsConnecting(false);
      }, 1000);
    } catch (err) {
      setIsConnecting(false);
      toast.error('Failed to connect to =nil; wallet. Please try again.');
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Simulate disconnection
      setAddress(null);
      setIsConnected(false);
      setIsDropdownOpen(false);
      toast.success('Disconnected from =nil; wallet');
    } catch (err) {
      toast.error('Failed to disconnect. Please try again.');
      console.error(err);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <div className="relative dropdown-container">
        {isConnected ? (
          <div>
            <motion.button
              onClick={toggleDropdown}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src="/images/nil-logo.png" 
                alt="=nil;" 
                className="w-5 h-5" 
              />
              <span>{address ? formatAddress(address) : 'Connected'}</span>
              <Icon icon="ion:chevron-down" className="w-4 h-4" />
            </motion.button>

            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-darkmode border border-dark_border rounded-lg shadow-lg z-50"
              >
                <div className="p-2">
                  <button
                    onClick={handleDisconnect}
                    className="w-full text-left px-4 py-2 text-white hover:bg-dark_border rounded transition-colors duration-200"
                  >
                    Disconnect
                  </button>
                  <a
                    href={`https://explorer.testnet.nil.foundation/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-left px-4 py-2 text-white hover:bg-dark_border rounded transition-colors duration-200"
                  >
                    View on Explorer
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="/images/nil-logo.png" 
              alt="=nil;" 
              className="w-5 h-5" 
            />
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </div>
            ) : (
              'Connect =nil; Wallet'
            )}
          </motion.button>
        )}
      </div>

      {/* Onboarding Modal */}
      <NilOnboardingModal 
        isOpen={isOnboardingModalOpen} 
        onClose={closeOnboardingModal}
        onConnect={handleOnboardingConnect}
      />
    </>
  );
};

export default NilAuthButton; 