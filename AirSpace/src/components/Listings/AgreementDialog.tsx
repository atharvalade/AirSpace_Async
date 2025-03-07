"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DeploymentProgress } from './DeploymentProgress';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { NFT } from "@/types/nft";
import { Icon } from '@iconify/react';

interface AgreementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: string | null;
  loading: boolean;
  nft: NFT | null;
}

export type StepStatus = 'waiting' | 'loading' | 'completed' | 'failed';

export interface Step {
  title: string;
  description: string;
  status: StepStatus;
  details?: string;
  txHash?: string;
}

interface DeploymentResponse {
  decision: 'EXECUTE' | 'REJECT';
  deployment_status: 'success' | 'failed';
  deployment_output: string;
  model_response: string;
}

export const AgreementDialog = ({ isOpen, onClose, agreement, loading, nft }: AgreementDialogProps) => {
  const [showProgress, setShowProgress] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [deploymentStatus, setDeploymentStatus] = useState<'waiting' | 'success' | 'failed'>('waiting');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([
    {
      title: "Verify Agreement",
      description: "Verifying the legal agreement",
      status: "waiting"
    },
    {
      title: "Connect =nil; Wallet",
      description: "Preparing for transaction",
      status: "waiting"
    },
    {
      title: "Transfer NIL",
      description: "Processing payment",
      status: "waiting"
    },
    {
      title: "Transfer NFT",
      description: "Transferring property rights",
      status: "waiting"
    },
    {
      title: "Verify Transfer",
      description: "Confirming transaction on =nil; network",
      status: "waiting"
    }
  ]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setShowProgress(false);
      setDeploymentStatus('waiting');
      setTxHash(null);
    }
  }, [isOpen]);

  const handleApprove = async () => {
    if (!nft) {
      toast.error("No NFT selected");
      return;
    }

    try {
      setApprovalLoading(true);
      setShowProgress(true);
      
      // Step 1: Verify Agreement
      updateStepStatus(0, 'loading');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(0, 'completed');
      
      // Step 2: Connect =nil; Wallet
      setCurrentStep(1);
      updateStepStatus(1, 'loading');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(1, 'completed');
      
      // Step 3: Transfer NIL
      setCurrentStep(2);
      updateStepStatus(2, 'loading');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock transaction hash
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxHash(mockTxHash);
      updateStepStatus(2, 'completed', undefined, mockTxHash);
      
      // Step 4: Transfer NFT
      setCurrentStep(3);
      updateStepStatus(3, 'loading');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus(3, 'completed');
      
      // Step 5: Verify Transfer
      setCurrentStep(4);
      updateStepStatus(4, 'loading');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(4, 'completed');
      
      // Set overall status to success
      setDeploymentStatus('success');
      toast.success('NFT purchase completed successfully!');
      
    } catch (error) {
      console.error('Error in transaction:', error);
      updateStepStatus(currentStep, 'failed', 'Transaction failed. Please try again.');
      setDeploymentStatus('failed');
      toast.error('Transaction failed. Please try again.');
    } finally {
      setApprovalLoading(false);
    }
  };

  const updateStepStatus = (stepIndex: number, status: StepStatus, details?: string, txHash?: string) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        status,
        ...(details && { details }),
        ...(txHash && { txHash })
      };
      return newSteps;
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-dark_grey rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-dark_border">
          <h2 className="text-white text-xl font-semibold">Purchase Agreement</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-primary transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : showProgress ? (
            <DeploymentProgress 
              steps={steps} 
              currentStep={currentStep}
              deploymentStatus={deploymentStatus === 'waiting' ? null : deploymentStatus}
              nftTokenId={nft?.token_id}
            />
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{agreement || 'No agreement available'}</ReactMarkdown>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-dark_border flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-dark_border text-white hover:bg-dark_border transition-colors"
            disabled={approvalLoading}
          >
            Cancel
          </button>
          
          {!showProgress && (
            <button
              onClick={handleApprove}
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              disabled={approvalLoading || !agreement}
            >
              {approvalLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Approve & Purchase'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 