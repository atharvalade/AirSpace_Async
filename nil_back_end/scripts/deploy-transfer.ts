import { ethers } from "hardhat";
import axios from "axios";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { Wallet, providers } from "ethers";

dotenv.config();

// Function to get shard ID from .env
function getShardId(): string | null {
  if (process.env.NIL_SHARD_ID) {
    return process.env.NIL_SHARD_ID;
  }
  return null;
}

// Function to create a provider with shard ID
function createProviderWithShard(rpcUrl: string, shardId: string): providers.JsonRpcProvider {
  // Create a custom provider with shard ID in the request
  const provider = new providers.JsonRpcProvider(rpcUrl);
  
  // Override the send method to include the shard ID in the request
  const originalSend = provider.send.bind(provider);
  provider.send = async (method: string, params: Array<any>): Promise<any> => {
    // Add shard ID to the request context
    const modifiedParams = [...params];
    
    // For specific methods, add shard context
    if (method === 'eth_getBalance' || 
        method === 'eth_call' || 
        method === 'eth_estimateGas' || 
        method === 'eth_sendTransaction' || 
        method === 'eth_sendRawTransaction') {
      // Add shard context to the last parameter if it's an object
      if (modifiedParams.length > 0 && typeof modifiedParams[modifiedParams.length - 1] === 'object') {
        modifiedParams[modifiedParams.length - 1].shard = shardId;
      } else {
        // Add a new parameter with shard context
        modifiedParams.push({ shard: shardId });
      }
    }
    
    return originalSend(method, modifiedParams);
  };
  
  return provider;
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

  // Get shard ID from .env
  const shardId = getShardId();
  
  if (!shardId) {
    console.log("No shard ID found in .env file.");
    console.log("Please run 'npm run get-shards' to configure a shard before deploying.");
    return;
  }
  
  console.log(`Using shard ID: ${shardId}`);

  // Create provider with shard ID
  const provider = createProviderWithShard(process.env.NIL_TESTNET_URL, shardId);
  const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Deploying AirSpaceTransfer contract with account:", wallet.address);
  
  try {
    const balance = await wallet.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    if (balance.lt(ethers.utils.parseEther("0.1"))) {
      console.log("Warning: Low balance. You may need to top up your account.");
    }

    console.log("Deploying AirSpaceTransfer contract...");

    // Create a factory for the contract using the wallet as signer
    const AirSpaceTransfer = await ethers.getContractFactory("AirSpaceTransfer", wallet);
    const transfer = await AirSpaceTransfer.deploy();

    console.log("Deployment transaction sent. Waiting for confirmation...");
    await transfer.deployed();

    console.log("AirSpaceTransfer deployed to:", transfer.address);
    
    // Save the contract address to .env file
    const envFile = '.env';
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    // Check if TRANSFER_CONTRACT_ADDRESS already exists in .env
    if (envContent.includes('TRANSFER_CONTRACT_ADDRESS=')) {
      // Update existing value
      const updatedEnvContent = envContent.replace(
        /^TRANSFER_CONTRACT_ADDRESS=.*$/m,
        `TRANSFER_CONTRACT_ADDRESS=${transfer.address}`
      );
      fs.writeFileSync(envFile, updatedEnvContent);
    } else {
      // Add new value
      fs.writeFileSync(envFile, `${envContent}\nTRANSFER_CONTRACT_ADDRESS=${transfer.address}`);
    }
    
    console.log("Transfer contract address saved to .env file");
    console.log("Deployment complete!");
    
    console.log("\nTo use this contract:");
    console.log("1. Send NIL tokens to the contract address");
    console.log("2. Approve the contract to transfer your NFT");
    console.log("3. Call the transferBoth function to transfer both NIL and NFT");
    
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 