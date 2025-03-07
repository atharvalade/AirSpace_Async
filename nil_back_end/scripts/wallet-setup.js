const { execSync } = require('child_process');
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

// Function to check if nil CLI is installed
function checkNilCli() {
  try {
    // Try to run a simple nil command instead of using --version
    const output = execSync('nil help', { encoding: 'utf8' });
    console.log('=nil; CLI detected successfully!');
    return true;
  } catch (error) {
    console.error('=nil; CLI not found or not in PATH. Please install it first.');
    console.log('You can install it by running:');
    console.log('curl -fsSL https://github.com/NilFoundation/nil_cli/raw/master/install.sh | bash');
    console.log('\nIf you have already installed it, make sure it is in your PATH:');
    console.log('export PATH="$HOME/.local/bin:$PATH"');
    return false;
  }
}

// Function to initialize nil CLI config
async function initNilConfig() {
  try {
    console.log('Initializing =nil; CLI config...');
    execSync('nil config init', { encoding: 'utf8' });
    console.log('Config initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing config:', error.message);
    return false;
  }
}

// Function to set RPC endpoint
async function setRpcEndpoint() {
  try {
    const rpcEndpoint = await prompt('Enter the =nil; testnet RPC endpoint (leave empty for default)');
    
    if (rpcEndpoint) {
      console.log(`Setting RPC endpoint to: ${rpcEndpoint}`);
      execSync(`nil config set rpc_endpoint ${rpcEndpoint}`, { encoding: 'utf8' });
      console.log('RPC endpoint set successfully!');
      
      // Also update the .env file
      updateEnvValue('NIL_TESTNET_URL', rpcEndpoint);
    } else {
      console.log('Using default RPC endpoint');
    }
    return true;
  } catch (error) {
    console.error('Error setting RPC endpoint:', error.message);
    return false;
  }
}

// Function to generate a new key using nil CLI
async function generateNewKey() {
  try {
    console.log('Generating a new private key using nil CLI...');
    const output = execSync('nil keygen new', { encoding: 'utf8' });
    console.log('New key generated successfully!');
    return true;
  } catch (error) {
    console.error('Error generating new key:', error.message);
    return false;
  }
}

// Function to create a new smart account
async function createSmartAccount() {
  try {
    console.log('Creating a new smart account...');
    const output = execSync('nil smart-account new', { encoding: 'utf8' });
    console.log('Smart account created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating smart account:', error.message);
    return false;
  }
}

// Function to get smart account info
function getSmartAccountInfo() {
  try {
    console.log('Retrieving smart account information...');
    const output = execSync('nil smart-account info', { encoding: 'utf8' });
    console.log('\nSmart Account Information:');
    console.log(output);
    
    // Extract the smart account address
    const addressMatch = output.match(/Smart account address: ([0-9a-fA-Fx]+)/);
    if (addressMatch && addressMatch[1]) {
      return addressMatch[1];
    }
    return null;
  } catch (error) {
    console.error('Error retrieving smart account info:', error.message);
    return null;
  }
}

// Function to update a specific value in the .env file
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

// Function to get private key from nil CLI config
function getPrivateKey() {
  try {
    console.log('Retrieving private key from =nil; CLI config...');
    
    // Get the config file location
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const configPath = `${homeDir}/.nil/config.json`;
    
    if (!fs.existsSync(configPath)) {
      console.error(`Config file not found at ${configPath}`);
      return null;
    }
    
    // Read the config file
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Extract the private key
    if (config && config.private_key) {
      console.log('Private key found in =nil; CLI config');
      return config.private_key;
    } else {
      console.error('Private key not found in =nil; CLI config');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving private key:', error.message);
    return null;
  }
}

async function main() {
  console.log('=nil; Wallet Setup');
  console.log('==================');
  
  // Check if nil CLI is installed
  if (!checkNilCli()) {
    rl.close();
    return;
  }
  
  // Initialize nil CLI config
  const initStep = await prompt('Do you want to initialize the =nil; CLI config? (yes/no)');
  if (initStep.toLowerCase() === 'yes') {
    await initNilConfig();
  }
  
  // Set RPC endpoint
  const setRpcStep = await prompt('Do you want to set the RPC endpoint? (yes/no)');
  if (setRpcStep.toLowerCase() === 'yes') {
    await setRpcEndpoint();
  }
  
  // Ask if user wants to generate a new key
  const generateNew = await prompt('Do you want to generate a new private key? (yes/no)');
  if (generateNew.toLowerCase() === 'yes') {
    const success = await generateNewKey();
    if (!success) {
      console.log('Failed to generate a new key. Please try again or generate manually using "nil keygen new".');
      rl.close();
      return;
    }
  }
  
  // Ask if user wants to create a new smart account
  const createAccount = await prompt('Do you want to create a new smart account? (yes/no)');
  if (createAccount.toLowerCase() === 'yes') {
    const success = await createSmartAccount();
    if (!success) {
      console.log('Failed to create a smart account. Please try again or create manually using "nil smart-account new".');
      rl.close();
      return;
    }
  }
  
  // Get smart account info
  const smartAccountAddress = getSmartAccountInfo();
  
  // Get private key from nil CLI config
  const privateKey = getPrivateKey();
  
  if (smartAccountAddress) {
    // Update .env file with smart account address
    updateEnvValue('NIL_WALLET_ADDRESS', smartAccountAddress);
    
    if (privateKey) {
      // Update .env file with private key
      updateEnvValue('PRIVATE_KEY', privateKey);
      console.log('Private key saved to .env file');
    } else {
      console.log('Warning: Could not retrieve private key from =nil; CLI config.');
      console.log('You will need to manually set the PRIVATE_KEY in your .env file.');
    }
    
    console.log('\nWallet setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run compile" to compile the NFT contract');
    console.log('2. Run "npm run deploy" to deploy the contract to =nil; testnet');
    console.log('3. Run "npm run mint" to mint NFTs');
  } else {
    console.log('Failed to retrieve smart account address. Please check your =nil; CLI setup.');
  }
  
  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 