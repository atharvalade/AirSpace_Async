import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Wallet, providers, Contract } from "ethers";
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

// AirSpaceTransfer ABI (simplified for the functions we need)
const transferAbi = [
  "function transferNIL() public payable",
  "function transferNFT(address nftContract, uint256 tokenId) public",
  "function transferBoth(address nftContract, uint256 tokenId) public payable",
  "function withdrawNIL(uint256 amount) public",
  "function withdrawNFT(address nftContract, uint256 tokenId) public",
  "receive() external payable"
];

// AirSpaceNFT ABI (simplified for the functions we need)
const nftAbi = [
  "function approve(address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) public"
];

async function main() {
  // Check if required environment variables are set
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in .env file");
  }

  if (!process.env.NIL_TESTNET_URL) {
    throw new Error("NIL_TESTNET_URL not found in .env file");
  }

  if (!process.env.TRANSFER_CONTRACT_ADDRESS) {
    throw new Error("TRANSFER_CONTRACT_ADDRESS not found in .env file. Please deploy the contract first.");
  }

  if (!process.env.NFT_CONTRACT_ADDRESS) {
    throw new Error("NFT_CONTRACT_ADDRESS not found in .env file. Please deploy the NFT contract first.");
  }

  // Get shard ID from .env
  const shardId = getShardId();
  
  if (!shardId) {
    console.log("No shard ID found in .env file.");
    console.log("Please run 'npm run get-shards' to configure a shard before proceeding.");
    rl.close();
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

    // Connect to the contracts
    const transferContract = new Contract(process.env.TRANSFER_CONTRACT_ADDRESS, transferAbi, wallet);
    const nftContract = new Contract(process.env.NFT_CONTRACT_ADDRESS, nftAbi, wallet);
    
    console.log("Transfer contract address:", process.env.TRANSFER_CONTRACT_ADDRESS);
    console.log("NFT contract address:", process.env.NFT_CONTRACT_ADDRESS);
    
    // Get token ID to transfer
    const tokenId = await prompt("Enter the NFT token ID to transfer");
    if (!tokenId || isNaN(parseInt(tokenId))) {
      throw new Error("Invalid token ID");
    }
    
    // Check if the user owns the token
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
    
    // Ask for confirmation
    const confirmation = await prompt(`Are you sure you want to transfer 1 NIL and NFT #${tokenId} to 0x000129e60021a183845df99aab9fb0931df64b5c? (yes/no)`);
    if (confirmation.toLowerCase() !== "yes") {
      console.log("Transfer cancelled");
      rl.close();
      return;
    }
    
    // Step 1: Send NIL tokens to the contract
    console.log("Step 1: Sending 1 NIL to the transfer contract...");
    const sendTx = await wallet.sendTransaction({
      to: transferContract.address,
      value: ethers.utils.parseEther("1")
    });
    console.log(`Transaction sent: ${sendTx.hash}`);
    await sendTx.wait();
    console.log("NIL tokens sent successfully!");
    
    // Step 2: Approve the contract to transfer the NFT
    console.log("Step 2: Approving the transfer contract to handle your NFT...");
    const approveTx = await nftContract.approve(transferContract.address, tokenId);
    console.log(`Transaction sent: ${approveTx.hash}`);
    await approveTx.wait();
    console.log("Approval granted successfully!");
    
    // Step 3: Call the transferBoth function
    console.log("Step 3: Executing the transfer...");
    const transferTx = await transferContract.transferBoth(nftContract.address, tokenId);
    console.log(`Transaction sent: ${transferTx.hash}`);
    await transferTx.wait();
    console.log("Transfer executed successfully!");
    
    console.log("\nTransfer summary:");
    console.log(`- 1 NIL and NFT #${tokenId} transferred to 0x000129e60021a183845df99aab9fb0931df64b5c`);
    console.log(`- From: ${wallet.address}`);
    console.log(`- Transfer contract: ${transferContract.address}`);
    console.log(`- NFT contract: ${nftContract.address}`);
    
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