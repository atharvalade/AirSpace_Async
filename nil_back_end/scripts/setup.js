const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '../.env');

// Default values
const defaultValues = {
  NIL_TESTNET_URL: 'https://api.devnet.nil.foundation/api/bot-1253/cda16f81590b0f26c11f4b25c4417b41',
  PRIVATE_KEY: '',
  NFT_CONTRACT_ADDRESS: '',
  NIL_WALLET_ADDRESS: ''
};

// Function to prompt for input
function prompt(question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(`${question} (${defaultValue || 'none'}): `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

// Function to check if nil CLI is installed
function checkNilCli() {
  try {
    // Try to run a simple nil command instead of using --version
    const output = execSync('nil help', { encoding: 'utf8' });
    console.log('=nil; CLI detected successfully!');
    return true;
  } catch (error) {
    console.log('=nil; CLI not detected. For best experience, install it using:');
    console.log('curl -fsSL https://github.com/NilFoundation/nil_cli/raw/master/install.sh | bash');
    console.log('\nIf you have already installed it, make sure it is in your PATH:');
    console.log('export PATH="$HOME/.local/bin:$PATH"');
    return false;
  }
}

// Function to get smart account info if available
function getSmartAccountInfo() {
  try {
    const output = execSync('nil smart-account info', { encoding: 'utf8' });
    const addressMatch = output.match(/Smart account address: ([0-9a-fA-Fx]+)/);
    if (addressMatch && addressMatch[1]) {
      console.log(`Found smart account address: ${addressMatch[1]}`);
      return addressMatch[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('Setting up .env file for =nil; NFT deployment');
  
  let envContent = '';
  let existingValues = {};
  
  // If .env file exists, read its content
  if (fs.existsSync(envPath)) {
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
  
  // Check if nil CLI is installed
  const nilCliInstalled = checkNilCli();
  
  // Try to get smart account address from nil CLI
  let smartAccountAddress = null;
  if (nilCliInstalled) {
    smartAccountAddress = getSmartAccountInfo();
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
  
  const walletAddress = await prompt(
    'Enter your =nil; wallet address',
    smartAccountAddress || existingValues.NIL_WALLET_ADDRESS || defaultValues.NIL_WALLET_ADDRESS
  );
  
  // Create new .env content
  const newEnvContent = `NIL_TESTNET_URL=${nilTestnetUrl}
PRIVATE_KEY=${privateKey}
NFT_CONTRACT_ADDRESS=${nftContractAddress}
NIL_WALLET_ADDRESS=${walletAddress}`;
  
  // Write to .env file
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log('.env file has been updated successfully!');
  
  if (!nilCliInstalled) {
    console.log('\nFor wallet setup, we recommend installing the =nil; CLI:');
    console.log('1. Install the CLI: curl -fsSL https://github.com/NilFoundation/nil_cli/raw/master/install.sh | bash');
    console.log('2. Run our wallet setup script: npm run wallet-setup');
  } else if (!smartAccountAddress) {
    console.log('\nNo smart account detected. To set up your wallet:');
    console.log('Run our wallet setup script: npm run wallet-setup');
  }
  
  console.log('\nNext steps:');
  console.log('1. npm run compile - to compile the contracts');
  console.log('2. npm run deploy - to deploy the NFT contract');
  console.log('3. npm run mint - to mint the NFTs');
  
  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
}); 