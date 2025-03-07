#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get private key from nil CLI config
function getPrivateKey() {
  try {
    console.log('Attempting to extract private key from =nil; CLI config...');
    
    // Get the config file location
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const configPath = `${homeDir}/.nil/config.json`;
    
    if (!fs.existsSync(configPath)) {
      console.error(`Config file not found at ${configPath}`);
      console.log('Please make sure you have initialized the =nil; CLI with:');
      console.log('nil config init');
      console.log('nil keygen new');
      return null;
    }
    
    // Read the config file
    const configContent = fs.readFileSync(configPath, 'utf8');
    let config;
    
    try {
      config = JSON.parse(configContent);
    } catch (error) {
      console.error('Error parsing config file:', error.message);
      return null;
    }
    
    // Extract the private key
    if (config && config.private_key) {
      console.log('Private key found in =nil; CLI config!');
      return config.private_key;
    } else {
      console.error('Private key not found in =nil; CLI config');
      console.log('Please make sure you have generated a key with:');
      console.log('nil keygen new');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving private key:', error.message);
    return null;
  }
}

// Function to update .env file with private key
function updateEnvFile(privateKey) {
  try {
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add the private key
    if (envContent.includes('PRIVATE_KEY=')) {
      envContent = envContent.replace(
        /PRIVATE_KEY=.*/,
        `PRIVATE_KEY=${privateKey}`
      );
    } else {
      envContent += `\nPRIVATE_KEY=${privateKey}`;
    }
    
    // Write updated content back to .env file
    fs.writeFileSync(envPath, envContent);
    console.log('Private key saved to .env file');
    return true;
  } catch (error) {
    console.error('Error updating .env file:', error.message);
    return false;
  }
}

async function main() {
  console.log('=nil; Private Key Extractor');
  console.log('==========================');
  
  const privateKey = getPrivateKey();
  
  if (privateKey) {
    console.log('\nYour private key is:');
    console.log(privateKey);
    
    const saveToEnv = await new Promise(resolve => {
      rl.question('Do you want to save this private key to your .env file? (yes/no): ', answer => {
        resolve(answer.toLowerCase() === 'yes');
      });
    });
    
    if (saveToEnv) {
      updateEnvFile(privateKey);
    } else {
      console.log('Private key not saved to .env file');
      console.log('You will need to manually add it to your .env file as:');
      console.log(`PRIVATE_KEY=${privateKey}`);
    }
  }
  
  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 