import { ethers } from "hardhat";
import axios from "axios";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { Wallet, providers } from "ethers";

dotenv.config();

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
      console.log(`Response: ${JSON.stringify(response.data)}`);
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
  
  console.log("Deploying contracts with account:", wallet.address);
  
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

    console.log("Deploying AirSpaceNFT contract...");

    // Create a factory for the contract using the wallet as signer
    const AirSpaceNFT = await ethers.getContractFactory("AirSpaceNFT", wallet);
    const nft = await AirSpaceNFT.deploy();

    console.log("Deployment transaction sent. Waiting for confirmation...");
    await nft.deployed();

    console.log("AirSpaceNFT deployed to:", nft.address);
    
    // Save the contract address to .env file
    const envFile = '.env';
    const envContent = fs.readFileSync(envFile, 'utf8');
    const updatedEnvContent = envContent.replace(
      /^NFT_CONTRACT_ADDRESS=.*$/m,
      `NFT_CONTRACT_ADDRESS=${nft.address}`
    );
    fs.writeFileSync(envFile, updatedEnvContent);
    
    console.log("Contract address saved to .env file");
    console.log("Deployment complete!");
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