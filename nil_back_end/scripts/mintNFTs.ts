import { ethers } from "hardhat";
import { AirSpaceNFT__factory } from "../types/contracts/factories/contracts/AirSpaceNFT__factory";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import axios from "axios";
import { Wallet, providers } from "ethers";

dotenv.config();

const metadata = [
  {
    title: "Niagara Falls Hotel View Rights",
    description: "Secure the pristine view of Niagara Falls by purchasing air rights above the existing hotel structure. Prime location with unobstructed views of the falls.",
    image: "https://ipfs.io/ipfs/QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU",
    address: "6650 Niagara Parkway, Niagara Falls, ON L2G 0L0",
    currentHeight: "10 floors",
    maxHeight: "25 floors",
    floorsToBuy: "11-25 floors",
    price: "250,000"
  },
  {
    title: "Vancouver Harbor View Rights",
    description: "Protect your panoramic view of Vancouver's harbor and North Shore mountains. Strategic location in downtown Vancouver.",
    image: "https://ipfs.io/ipfs/QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU",
    address: "1128 West Georgia Street, Vancouver, BC V6E 0A8",
    currentHeight: "15 floors",
    maxHeight: "30 floors",
    floorsToBuy: "16-30 floors",
    price: "375,000"
  },
  {
    title: "Miami Beach Oceanfront Rights",
    description: "Preserve your ocean view in South Beach Miami. Excellent opportunity to secure views of the Atlantic Ocean.",
    image: "https://ipfs.io/ipfs/QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU",
    address: "1100 Collins Avenue, Miami Beach, FL 33139",
    currentHeight: "8 floors",
    maxHeight: "20 floors",
    floorsToBuy: "9-20 floors",
    price: "420,000"
  },
  {
    title: "Sydney Opera House View Rights",
    description: "Once-in-a-lifetime opportunity to secure air rights with direct views of the Sydney Opera House and Harbor Bridge.",
    image: "https://ipfs.io/ipfs/QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU",
    address: "71 Macquarie Street, Sydney NSW 2000",
    currentHeight: "12 floors",
    maxHeight: "28 floors",
    floorsToBuy: "13-28 floors",
    price: "580,000"
  },
  {
    title: "Dubai Marina View Rights",
    description: "Secure spectacular views of Dubai Marina and the Arabian Gulf. Premium location in the heart of New Dubai.",
    image: "https://ipfs.io/ipfs/QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU",
    address: "Dubai Marina, Plot No. JLT-PH2-T2A Dubai, UAE",
    currentHeight: "20 floors",
    maxHeight: "45 floors",
    floorsToBuy: "21-45 floors",
    price: "680,000"
  }
];

// Function to save metadata locally
async function saveMetadataLocally(metadata: any, index: number): Promise<string> {
  const metadataDir = path.join(__dirname, "../metadata");
  
  // Create metadata directory if it doesn't exist
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }
  
  const filePath = path.join(metadataDir, `${index}.json`);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  
  return filePath;
}

// Function to request tokens from the =nil; faucet
async function requestTokensFromFaucet(address: string, token: string = "NIL") {
  try {
    // Replace USERNAME with a unique identifier or use the wallet address
    const username = address.substring(2, 10); // Using part of the address as username
    const faucetUrl = `http://api.devnet.nil.foundation/api/faucet/${username}/${token}`;
    
    console.log(`Requesting ${token} tokens from faucet for address ${address}...`);
    const response = await axios.get(faucetUrl);
    
    if (response.status === 200) {
      console.log(`Successfully requested ${token} tokens from faucet.`);
      return true;
    } else {
      console.error(`Failed to request tokens. Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error("Error requesting tokens from faucet:", error);
    return false;
  }
}

async function main() {
  // Check if PRIVATE_KEY is set in .env
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in .env file");
  }

  // Check if NIL_TESTNET_URL is set in .env
  if (!process.env.NIL_TESTNET_URL) {
    throw new Error("NIL_TESTNET_URL not found in .env file");
  }

  // Create provider and wallet
  const provider = new providers.JsonRpcProvider(process.env.NIL_TESTNET_URL);
  const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Minting NFTs with account:", wallet.address);
  
  try {
    const balance = await wallet.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    // Request tokens from faucet if balance is low
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
      console.log("Balance is low, requesting tokens from faucet...");
      await requestTokensFromFaucet(wallet.address);
      
      // Wait a bit for the tokens to be credited
      console.log("Waiting for tokens to be credited...");
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const newBalance = await wallet.getBalance();
      console.log("New account balance:", ethers.utils.formatEther(newBalance), "ETH");
    }

    if (!process.env.NFT_CONTRACT_ADDRESS) {
      throw new Error("NFT_CONTRACT_ADDRESS not found in .env file");
    }

    const nftContract = AirSpaceNFT__factory.connect(
      process.env.NFT_CONTRACT_ADDRESS,
      wallet
    );

    console.log("Starting to mint NFTs...");

    for (let i = 0; i < metadata.length; i++) {
      const nftMetadata = {
        name: metadata[i].title,
        description: metadata[i].description,
        image: metadata[i].image,
        attributes: [
          { trait_type: "Address", value: metadata[i].address },
          { trait_type: "Current Height", value: metadata[i].currentHeight },
          { trait_type: "Maximum Height", value: metadata[i].maxHeight },
          { trait_type: "Available Floors", value: metadata[i].floorsToBuy },
          { trait_type: "Price", value: metadata[i].price }
        ]
      };

      // Save metadata locally
      const metadataPath = await saveMetadataLocally(nftMetadata, i);
      console.log(`Metadata saved to ${metadataPath}`);
      
      // In a production environment, you would upload this metadata to IPFS
      // For now, we'll use a mock URI that points to our local file
      const tokenURI = `file://${metadataPath}`;
      
      console.log(`Minting NFT ${i + 1}/${metadata.length}: ${nftMetadata.name}`);
      
      try {
        // Estimate gas for the transaction
        const gasEstimate = await nftContract.estimateGas.mint(wallet.address, tokenURI);
        console.log(`Estimated gas: ${gasEstimate.toString()}`);
        
        // Add a buffer to the gas estimate
        const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
        
        const tx = await nftContract.mint(wallet.address, tokenURI, {
          gasLimit
        });
        
        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait(2); // Wait for 2 confirmations
        
        console.log(`✓ NFT ${i + 1} minted successfully. Transaction hash:`, receipt.transactionHash);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
      } catch (error) {
        console.error(`× Failed to mint NFT ${i + 1}:`, error);
      }

      // Add a delay between mints to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log("All NFTs have been minted!");
  } catch (error) {
    console.error("Minting failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 