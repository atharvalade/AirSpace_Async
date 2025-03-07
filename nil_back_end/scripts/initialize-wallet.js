#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to update .env file
function updateEnvFile(key, value) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Check if the key already exists in the .env file
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
      // Replace the existing key-value pair
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add a new key-value pair
      envContent += `\n${key}=${value}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated ${key} in .env file`);
  } catch (error) {
    console.error(`Error updating .env file: ${error.message}`);
  }
}

// Function to check if nil CLI is installed
function checkNilCli() {
  try {
    execSync('nil --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to initialize nil CLI config
function initializeNilConfig(rpcEndpoint) {
  try {
    console.log('Initializing nil CLI config...');
    execSync('nil config init', { stdio: 'inherit' });
    
    console.log(`Setting RPC endpoint to ${rpcEndpoint}...`);
    execSync(`nil config set rpc_endpoint ${rpcEndpoint}`, { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error(`Error initializing nil CLI config: ${error.message}`);
    return false;
  }
}

// Function to generate a new private key
function generatePrivateKey() {
  try {
    console.log('Generating new private key...');
    execSync('nil keygen new', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error generating private key: ${error.message}`);
    return false;
  }
}

// Function to create a new smart account
function createSmartAccount() {
  try {
    console.log('Creating new smart account...');
    execSync('nil smart-account new', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error creating smart account: ${error.message}`);
    return false;
  }
}

// Function to get smart account info
function getSmartAccountInfo() {
  try {
    console.log('Retrieving smart account info...');
    const accountInfo = execSync('nil smart-account info', { encoding: 'utf8' });
    
    // Extract wallet address from account info
    const addressMatch = accountInfo.match(/Address:\s+([0-9a-fA-Fx]+)/);
    if (addressMatch && addressMatch[1]) {
      const walletAddress = addressMatch[1];
      console.log(`Wallet address: ${walletAddress}`);
      return walletAddress;
    } else {
      console.error('Could not extract wallet address from account info');
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving smart account info: ${error.message}`);
    return null;
  }
}

// Function to extract private key from nil CLI config
function extractPrivateKey() {
  try {
    console.log('Extracting private key from nil CLI config...');
    
    // Get home directory
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    
    // Path to nil CLI config file
    const configPath = path.join(homeDir, '.nil', 'config.json');
    
    if (!fs.existsSync(configPath)) {
      console.error(`nil CLI config file not found at ${configPath}`);
      return null;
    }
    
    // Read and parse config file
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Extract private key
    if (config && config.private_key) {
      const privateKey = config.private_key;
      console.log('Private key extracted successfully');
      return privateKey;
    } else {
      console.error('Private key not found in nil CLI config');
      return null;
    }
  } catch (error) {
    console.error(`Error extracting private key: ${error.message}`);
    return null;
  }
}

// Main function
async function main() {
  console.log('=== =nil; Wallet Initialization ===');
  
  // Check if nil CLI is installed
  if (!checkNilCli()) {
    console.error('nil CLI is not installed. Please install it first.');
    console.log('You can install it using: curl -fsSL https://github.com/NilFoundation/nil_cli/raw/master/install.sh | bash');
    process.exit(1);
  }
  
  try {
    // Get RPC endpoint from .env or prompt user
    let rpcEndpoint = process.env.NIL_TESTNET_URL;
    if (!rpcEndpoint) {
      rpcEndpoint = await prompt('Enter =nil; testnet URL: ');
      if (!rpcEndpoint) {
        console.error('RPC endpoint is required');
        process.exit(1);
      }
    }
    
    // Initialize nil CLI config
    if (!initializeNilConfig(rpcEndpoint)) {
      process.exit(1);
    }
    
    // Generate new private key
    if (!generatePrivateKey()) {
      process.exit(1);
    }
    
    // Create new smart account
    if (!createSmartAccount()) {
      process.exit(1);
    }
    
    // Get smart account info
    const walletAddress = getSmartAccountInfo();
    if (!walletAddress) {
      process.exit(1);
    }
    
    // Extract private key
    const privateKey = extractPrivateKey();
    if (!privateKey) {
      process.exit(1);
    }
    
    // Update .env file with wallet address and private key
    updateEnvFile('WALLET_ADDRESS', walletAddress);
    updateEnvFile('PRIVATE_KEY', privateKey);
    
    console.log('=== Wallet Initialization Complete ===');
    console.log(`Wallet Address: ${walletAddress}`);
    console.log('Private Key: [HIDDEN]');
    console.log('Both have been saved to your .env file');
    
    // Return wallet info as JSON
    const walletInfo = {
      address: walletAddress,
      privateKey: privateKey
    };
    
    console.log(JSON.stringify(walletInfo));
    
    return walletInfo;
  } catch (error) {
    console.error(`Error initializing wallet: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Check if script is being run directly
if (require.main === module) {
  main();
} else {
  // Export for use as a module
  module.exports = main;
} 