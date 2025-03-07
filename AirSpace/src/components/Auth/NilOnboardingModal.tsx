"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface NilOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

const NilOnboardingModal: React.FC<NilOnboardingModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsConnecting(false);
      setShowTroubleshooting(false);
    }
  }, [isOpen]);

  // Define the steps for the onboarding process
  const steps = [
    {
      title: "Welcome to =nil; Foundation",
      description: "Experience the future of Ethereum scaling with =nil; Foundation's zkSharding technology",
      image: "/images/nil-logo.png",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            =nil; is an Ethereum layer-2 blockchain powered by zkSharding. The cluster unlocks the power of many machines by partitioning state across shards with cross-shard communications being a built-in feature of the protocol.
          </p>
          <div className="bg-darkmode/50 p-4 rounded-lg border border-primary/20">
            <h4 className="text-white font-medium mb-2">Key Benefits:</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>Unparalleled scalability through zkSharding</li>
              <li>Seamless cross-shard communication</li>
              <li>Enhanced security with zero-knowledge proofs</li>
              <li>Full Ethereum compatibility</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Your =nil; Wallet",
      description: "A secure and user-friendly way to interact with the =nil; network",
      image: "/images/nil-logo.png",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            The =nil; wallet provides a seamless experience for managing your assets and interacting with dApps on the =nil; network.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-darkmode/50 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center mb-2">
                <Icon icon="ph:shield-check" className="text-primary mr-2" />
                <h4 className="text-white font-medium">Secure by Design</h4>
              </div>
              <p className="text-sm text-gray-300">
                Built with security-first principles to protect your assets
              </p>
            </div>
            <div className="bg-darkmode/50 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center mb-2">
                <Icon icon="ph:lightning" className="text-primary mr-2" />
                <h4 className="text-white font-medium">Fast Transactions</h4>
              </div>
              <p className="text-sm text-gray-300">
                Experience lightning-fast transactions with minimal fees
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Connect Your Wallet",
      description: "Get started with =nil; in just a few clicks",
      image: "/images/nil-logo.png",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Connecting your =nil; wallet is simple and secure. Click the button below to initiate the connection process.
          </p>
          <div className="bg-darkmode/50 p-4 rounded-lg border border-primary/20">
            <h4 className="text-white font-medium mb-2">What happens next:</h4>
            <ol className="list-decimal pl-5 space-y-2 text-gray-300">
              <li>Our system will initialize your =nil; wallet</li>
              <li>You'll receive a unique wallet address</li>
              <li>Your wallet will be connected to the AirSpace platform</li>
              <li>You can start buying and selling air rights as NFTs</li>
            </ol>
          </div>
        </div>
      )
    }
  ];

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Show loading toast
      const loadingToast = toast.loading('Initializing =nil; wallet connection...', {
        id: 'nil-connecting-loading'
      });
      
      // Simulate backend call to initialize wallet
      // In a real implementation, this would call the backend script
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toast.success('Successfully connected to =nil; wallet!', {
        id: 'nil-connect-success',
        duration: 3000
      });
      
      // Call the onConnect callback
      onConnect();
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error connecting to =nil; wallet:', error);
      
      // Show error toast
      toast.error('Failed to connect. Please try again.', {
        id: 'nil-connect-error',
        duration: 3000
      });
      
      setIsConnecting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-dark_grey rounded-xl max-w-2xl w-full mx-4 overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white hover:text-primary z-10"
        >
          <Icon icon="ph:x" className="w-6 h-6" />
        </button>
        
        {/* Content */}
        <div className="p-8">
          {/* Logo and step indicator */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="relative w-12 h-12 mr-4">
                <Image 
                  src={showTroubleshooting ? "/images/nil-logo.png" : steps[currentStep].image}
                  alt="=nil; Foundation"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  {showTroubleshooting ? "Troubleshooting" : steps[currentStep].title}
                </h2>
                <p className="text-gray-400 text-sm">
                  {showTroubleshooting ? "Help with connecting your wallet" : steps[currentStep].description}
                </p>
              </div>
            </div>
            
            {!showTroubleshooting && (
              <div className="flex items-center gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? "bg-primary" : "bg-gray-600"
                    }`}
                  ></div>
                ))}
              </div>
            )}
          </div>
          
          {/* Main content */}
          <div className="min-h-[300px]">
            {showTroubleshooting ? (
              <div className="space-y-6">
                <h3 className="text-white text-lg font-medium">Common Issues</h3>
                
                <div className="space-y-4">
                  <div className="bg-darkmode/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-white font-medium mb-2">Wallet Not Initializing</h4>
                    <p className="text-gray-300 mb-2">
                      If your wallet isn't initializing, try the following:
                    </p>
                    <ul className="list-disc pl-5 text-gray-300">
                      <li>Refresh the page and try again</li>
                      <li>Check your internet connection</li>
                      <li>Ensure you're using a supported browser (Chrome, Firefox, Edge)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-darkmode/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-white font-medium mb-2">Connection Issues</h4>
                    <p className="text-gray-300 mb-2">
                      If you're having trouble connecting:
                    </p>
                    <ul className="list-disc pl-5 text-gray-300">
                      <li>Make sure you have the =nil; CLI installed</li>
                      <li>Check if your firewall is blocking the connection</li>
                      <li>Try connecting from a different network</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-gray-300">
                    For additional help, please visit the{" "}
                    <a
                      href="https://docs.nil.foundation/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      =nil; Foundation documentation
                    </a>{" "}
                    or contact support.
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {steps[currentStep].content}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          
          {/* Footer buttons */}
          <div className="mt-8 flex justify-between">
            {showTroubleshooting ? (
              <>
                <button
                  onClick={() => setShowTroubleshooting(false)}
                  className="px-4 py-2 text-white hover:text-primary transition-colors"
                >
                  Back to Onboarding
                </button>
                
                <a
                  href="https://docs.nil.foundation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-darkmode px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Visit Documentation
                </a>
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-white hover:text-primary transition-colors"
                >
                  Back
                </button>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowTroubleshooting(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Need Help?
                  </button>
                  
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-primary text-darkmode px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                  >
                    {isConnecting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-darkmode" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={prevStep}
                  className={`px-4 py-2 text-white hover:text-primary transition-colors ${
                    currentStep === 0 ? "invisible" : ""
                  }`}
                >
                  Back
                </button>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowTroubleshooting(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Need Help?
                  </button>
                  
                  <button
                    onClick={nextStep}
                    className="bg-primary text-darkmode px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NilOnboardingModal; 