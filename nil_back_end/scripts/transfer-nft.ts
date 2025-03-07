import { ethers } from "hardhat";
import { AirSpaceNFT__factory } from "../types/contracts/factories/contracts/AirSpaceNFT__factory";
import * as dotenv from "dotenv";
import { Wallet, providers } from "ethers";
import * as readline from "readline";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${question}: `, (answer) => {
      resolve(answer);
    });
  });
}

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
  // Check if required environment variables are set
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in .env file");
  }

  if (!process.env.NIL_TESTNET_URL) {
    throw new Error("NIL_TESTNET_URL not found in .env file");
  }

  if (!process.env.NFT_CONTRACT_ADDRESS) {
    throw new Error("NFT_CONTRACT_ADDRESS not found in .env file");
  }

  // Get shard ID from .env
  const shardId = getShardId();
  
  if (!shardId) {
    console.log("No shard ID found in .env file.");
    console.log("Please run 'npm run get-shards' to configure a shard before transferring NFTs.");
    return;
  }
  
  console.log(`Using shard ID: ${shardId}`);

  // Create provider with shard ID
  const provider = createProviderWithShard(process.env.NIL_TESTNET_URL, shardId);
  const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Connected to =nil; network with account:", wallet.address);
  
  try {
    const balance = await wallet.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    // Connect to the NFT contract
    const nftContract = AirSpaceNFT__factory.connect(
      process.env.NFT_CONTRACT_ADDRESS,
      wallet
    );

    // Get token ID to transfer
    const tokenId = await prompt("Enter the token ID to transfer");
    if (!tokenId || isNaN(parseInt(tokenId))) {
      throw new Error("Invalid token ID");
    }

    // Check if the sender owns the token
    try {
      const owner = await nftContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
        throw new Error(`You don't own token ID ${tokenId}. It is owned by ${owner}`);
      }
      console.log(`You are the owner of token ID ${tokenId}`);
    } catch (error) {
      console.error("Error checking token ownership:", error);
      rl.close();
      return;
    }

    // Get recipient address
    const recipientAddress = await prompt("Enter the recipient's =nil; wallet address");
    if (!ethers.utils.isAddress(recipientAddress)) {
      throw new Error("Invalid recipient address");
    }

    console.log(`Preparing to transfer token ID ${tokenId} to ${recipientAddress}...`);
    
    // Confirm the transfer
    const confirmation = await prompt("Are you sure you want to proceed with this transfer? (yes/no)");
    if (confirmation.toLowerCase() !== "yes") {
      console.log("Transfer cancelled");
      rl.close();
      return;
    }

    // Estimate gas for the transaction
    const gasEstimate = await nftContract.estimateGas.transferFrom(
      wallet.address,
      recipientAddress,
      tokenId
    );
    console.log(`Estimated gas: ${gasEstimate.toString()}`);
    
    // Add a buffer to the gas estimate
    const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
    
    // Execute the transfer
    console.log("Executing transfer...");
    const tx = await nftContract.transferFrom(
      wallet.address,
      recipientAddress,
      tokenId,
      {
        gasLimit
      }
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait(2); // Wait for 2 confirmations
    
    console.log(`✓ NFT successfully transferred! Transaction hash: ${receipt.transactionHash}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    console.log("\nTransfer summary:");
    console.log(`- Token ID: ${tokenId}`);
    console.log(`- From: ${wallet.address}`);
    console.log(`- To: ${recipientAddress}`);
    console.log(`- Contract: ${process.env.NFT_CONTRACT_ADDRESS}`);
    
  } catch (error) {
    console.error("Transfer failed:", error);
  } finally {
    rl.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 