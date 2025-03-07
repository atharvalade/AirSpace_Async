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

  // Create provider and wallet
  const provider = new providers.JsonRpcProvider(process.env.NIL_TESTNET_URL);
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