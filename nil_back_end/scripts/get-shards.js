#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Function to get the base RPC URL from .env
function getBaseRpcUrl() {
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/NIL_TESTNET_URL=(.*)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return 'https://api.devnet.nil.foundation/api/bot-1253/cda16f81590b0f26c11f4b25c4417b41';
  } catch (error) {
    console.error('Error reading RPC URL from .env file:', error.message);
    return 'https://api.devnet.nil.foundation/api/bot-1253/cda16f81590b0f26c11f4b25c4417b41';
  }
}

async function main() {
  console.log('=nil; Shard Configuration');
  console.log('=========================');
  
  // Get the base RPC URL
  const baseRpcUrl = getBaseRpcUrl();
  console.log(`Current RPC URL: ${baseRpcUrl}`);
  
  console.log('\nNote: The =nil; network API does not support automatic shard ID retrieval.');
  console.log('You will need to manually configure the shard ID.');
  
  // Ask user to enter a shard ID manually
  const manualShardId = await prompt('Enter the shard ID to use (e.g., 1, 2, 3, etc.)');
  
  if (!manualShardId || manualShardId.trim() === '') {
    console.log('No shard ID provided. Exiting...');
    rl.close();
    return;
  }
  
  // Normalize the shard ID (remove any non-numeric characters)
  const normalizedShardId = manualShardId.trim().replace(/[^0-9]/g, '');
  
  if (normalizedShardId === '') {
    console.log('Invalid shard ID. Please enter a numeric value.');
    rl.close();
    return;
  }
  
  console.log(`Using shard ID: ${normalizedShardId}`);
  
  // Update NIL_SHARD_ID in .env file
  updateEnvValue('NIL_SHARD_ID', normalizedShardId);
  
  console.log('\nShard configuration complete!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run deploy" to deploy the contract to the selected shard');
  console.log('2. Run "npm run mint" to mint NFTs on the selected shard');
  
  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 