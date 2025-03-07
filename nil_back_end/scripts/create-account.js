#!/usr/bin/env node

const { HttpTransport } = require('@nil-foundation/sdk/transport');
const { PublicClient } = require('@nil-foundation/sdk/client');
const { generateSmartAccount, topUp } = require('@nil-foundation/sdk/account');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '../.env');

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(`${question}: `, (answer) => {
      resolve(answer);
    });
  });
}

// Function to update .env file with a specific value
function updateEnvValue(key, value) {
  try {
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add the key-value pair
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(
        new RegExp(`${key}=.*`, 'g'),
        `${key}=${value}`
      );
    } else {
      envContent += `\n${key}=${value}`;
    }
    
    // Write updated content back to .env file
    fs.writeFileSync(envPath, envContent);
    console.log(`${key} saved to .env file: ${value}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${key} in .env file:`, error.message);
    return false;
  }
}

// Function to get value from .env
function getEnvValue(key, defaultValue = '') {
  if (process.env[key]) {
    return process.env[key];
  }
  return defaultValue;
}

async function main() {
  console.log('=nil; Smart Account Creation and Token Top-Up');
  console.log('===========================================');
  
  // Get RPC and Faucet endpoints
  const rpcEndpoint = getEnvValue('NIL_TESTNET_URL', 'https://api.devnet.nil.foundation/api/bot-1253/cda16f81590b0f26c11f4b25c4417b41');
  const faucetEndpoint = getEnvValue('NIL_FAUCET_URL', 'https://api.devnet.nil.foundation/api/faucet');
  
  // Get shard ID
  let shardId = getEnvValue('NIL_SHARD_ID', '1');
  
  // If no shard ID is set, prompt for one
  if (!shardId) {
    shardId = await prompt('Enter the shard ID to use (e.g., 1, 2, 3, etc.)');
    if (!shardId || shardId.trim() === '') {
      console.log('No shard ID provided. Using default shard ID: 1');
      shardId = '1';
    }
    updateEnvValue('NIL_SHARD_ID', shardId);
  }
  
  console.log(`Using RPC endpoint: ${rpcEndpoint}`);
  console.log(`Using faucet endpoint: ${faucetEndpoint}`);
  console.log(`Using shard ID: ${shardId}`);
  
  try {
    console.log('\nCreating a new smart account...');
    
    // Initialize the client
    const client = new PublicClient({
      transport: new HttpTransport({
        endpoint: rpcEndpoint,
      }),
      shardId: parseInt(shardId),
    });
    
    // Generate a new smart account
    const smartAccount = await generateSmartAccount({
      shardId: parseInt(shardId),
      rpcEndpoint: rpcEndpoint,
      faucetEndpoint: faucetEndpoint,
    });
    
    console.log(`\nSmart account created successfully!`);
    console.log(`Address: ${smartAccount.address}`);
    console.log(`Private Key: ${smartAccount.privateKey}`);
    
    // Save the smart account details to .env
    updateEnvValue('NIL_WALLET_ADDRESS', smartAccount.address);
    updateEnvValue('PRIVATE_KEY', smartAccount.privateKey);
    
    // Check token balance before top-up
    console.log('\nChecking token balance before top-up...');
    const resultBeforeTopUp = await client.getTokens(smartAccount.address, "latest");
    console.log('Token balance before top-up:');
    console.log(resultBeforeTopUp);
    
    // Ask which token to top up
    const token = await prompt('Enter the token to top up (NIL, BTC, USDC, etc.)');
    if (!token || token.trim() === '') {
      console.log('No token specified. Using default token: NIL');
      token = 'NIL';
    }
    
    // Ask for amount
    let amount = await prompt('Enter the amount to top up (e.g., 1000000)');
    if (!amount || amount.trim() === '' || isNaN(parseInt(amount))) {
      console.log('Invalid amount. Using default amount: 1000000');
      amount = '1000000';
    }
    
    // Top up the account with the specified token
    console.log(`\nTopping up account with ${amount} ${token}...`);
    await topUp({
      address: smartAccount.address,
      faucetEndpoint: faucetEndpoint,
      rpcEndpoint: rpcEndpoint,
      token: token,
      amount: parseInt(amount),
    });
    
    // Check token balance after top-up
    console.log('\nChecking token balance after top-up...');
    const resultAfterTopUp = await client.getTokens(smartAccount.address, "latest");
    console.log('Token balance after top-up:');
    console.log(resultAfterTopUp);
    
    console.log('\nSmart account creation and token top-up complete!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run deploy" to deploy the contract');
    console.log('2. Run "npm run mint" to mint NFTs');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 