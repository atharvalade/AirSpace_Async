"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface VerifiableCredential {
  id: string;
  issuanceDate: string;
  // Add other properties as needed
}

interface HumanityProtocolContextType {
  hasCredential: boolean;
  createCredential: () => Promise<void>;
  verifyCredential: () => Promise<boolean>;
  isFallbackMode: boolean;
  isLoading: boolean;
  credential: VerifiableCredential | null;
}

const defaultContext: HumanityProtocolContextType = {
  hasCredential: true,
  createCredential: async () => {},
  verifyCredential: async () => true,
  isFallbackMode: false,
  isLoading: false,
  credential: null,
};

const HumanityProtocolContext = createContext<HumanityProtocolContextType>(defaultContext);

export const HumanityProtocolProvider: React.FC<{ children: ReactNode; apiKey?: string }> = ({ 
  children, 
  apiKey 
}) => {
  return (
    <HumanityProtocolContext.Provider value={defaultContext}>
      {children}
    </HumanityProtocolContext.Provider>
  );
};

export const useHumanityProtocol = () => useContext(HumanityProtocolContext);
