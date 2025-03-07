const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '../.env');

// Check if .env file exists
const envExists = fs.existsSync(envPath);

// Default values
const defaultValues = {
  NIL_TESTNET_URL: 'https://api.devnet.nil.foundation/api/bot-1253/cda16f81590b0f26c11f4b25c4417b41',
  PRIVATE_KEY: '',
  NFT_CONTRACT_ADDRESS: ''
};

// Function to prompt for input
function prompt(question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(`${question} (${defaultValue || 'none'}): `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

async function main() {
  console.log('Setting up .env file for =nil; NFT deployment');
  
  let envContent = '';
  let existingValues = {};
  
  // If .env file exists, read its content
  if (envExists) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse existing values
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          existingValues[key.trim()] = value.trim();
        }
      }
    });
  }
  
  // Prompt for each value
  const nilTestnetUrl = await prompt(
    'Enter the =nil; testnet URL',
    existingValues.NIL_TESTNET_URL || defaultValues.NIL_TESTNET_URL
  );
  
  const privateKey = await prompt(
    'Enter your private key (without 0x prefix)',
    existingValues.PRIVATE_KEY || defaultValues.PRIVATE_KEY
  );
  
  const nftContractAddress = await prompt(
    'Enter the NFT contract address (leave empty if not deployed yet)',
    existingValues.NFT_CONTRACT_ADDRESS || defaultValues.NFT_CONTRACT_ADDRESS
  );
  
  // Create new .env content
  const newEnvContent = `NIL_TESTNET_URL=${nilTestnetUrl}
PRIVATE_KEY=${privateKey}
NFT_CONTRACT_ADDRESS=${nftContractAddress}`;
  
  // Write to .env file
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log('.env file has been updated successfully!');
  console.log('You can now run:');
  console.log('  npm run compile - to compile the contracts');
  console.log('  npm run deploy - to deploy the NFT contract');
  console.log('  npm run mint - to mint the NFTs');
  
  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
}); 