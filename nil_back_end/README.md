# AirSpace NFT on =nil; Network

This project implements NFT minting for AirSpace on the =nil; network. It allows for the creation and management of NFTs representing air rights.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- =nil; CLI installed (for wallet setup)
- A wallet with =nil; testnet tokens

## Installing =nil; CLI

The =nil; CLI is required for wallet setup and management. Install it using:

```bash
curl -fsSL https://github.com/NilFoundation/nil_cli/raw/master/install.sh | bash
```

After installation, make sure the CLI is in your PATH:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

You may want to add this line to your shell profile file (e.g., ~/.bashrc, ~/.zshrc) to make it permanent.

Verify the installation:

```bash
nil help
```

### Installing =nil; SDK

To use the smart account creation and token top-up functionality, you need to install the =nil; SDK:

```bash
npm run install-sdk
```

This script will install the @nil-foundation/sdk package, which is required for creating smart accounts and topping them up with tokens.

### Fixing PATH Issues

If you're having trouble with the =nil; CLI not being found, we provide a helper script:

```bash
npm run fix-path
```

This script will:
1. Add ~/.local/bin to your PATH for the current session
2. Verify that the nil CLI is accessible
3. Optionally add the PATH update to your shell profile file

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the setup script to configure your environment:

```bash
npm run setup
```

This interactive script will:
- Create or update your `.env` file
- Prompt for your =nil; testnet URL
- Prompt for your wallet's private key (automatically extracted from =nil; CLI if available)
- Prompt for the NFT contract address (if already deployed)
- Prompt for your wallet address (automatically extracted from =nil; CLI if available)

## Wallet Setup

There are multiple ways to set up your wallet:

### Option 1: Using the =nil; CLI

To create and manage your =nil; wallet using the CLI, you can use our wallet setup script:

```bash
npm run wallet-setup
```

This script will guide you through the official =nil; CLI workflow:

1. Initialize the =nil; CLI config (`nil config init`)
2. Set the RPC endpoint (`nil config set rpc_endpoint RPC_ENDPOINT`)
3. Generate a new private key (`nil keygen new`)
4. Create a new smart account (`nil smart-account new`)
5. Retrieve your smart account information (`nil smart-account info`)
6. Extract your private key from the =nil; CLI config
7. Save your wallet address and private key to the `.env` file

### Option 2: Using the =nil; SDK

To create a smart account directly using the =nil; SDK and top it up with tokens:

```bash
npm run create-account
```

This script will:
1. Create a new smart account using the =nil; SDK
2. Save the account address and private key to your `.env` file
3. Check your token balance before top-up
4. Top up your account with custom 'mock' tokens (NIL, BTC, USDC, etc.)
5. Check your token balance after top-up

This is particularly useful for quickly creating a new account and funding it with test tokens for development purposes.

### Option 3: Automated Wallet Initialization

For a streamlined experience, especially when integrating with the frontend, use our automated wallet initialization script:

```bash
npm run initialize-wallet
```

This script will:
1. Check if the =nil; CLI is installed
2. Initialize the =nil; CLI config with your testnet URL
3. Generate a new private key
4. Create a new smart account
5. Extract the wallet address and private key
6. Save both to your `.env` file
7. Return the wallet information as JSON

This script is designed to be called programmatically from the frontend, providing a seamless onboarding experience for users.

### Extracting Your Private Key

If you already have a =nil; CLI wallet set up but need to extract your private key:

```bash
npm run extract-key
```

This script will:
1. Read the =nil; CLI config file
2. Extract your private key
3. Optionally save it to your `.env` file

### Configuring Shards

The =nil; network uses sharding, and you need to configure a shard ID to interact with. Use our shard configuration script:

```bash
npm run get-shards
```

This script will:
1. Prompt you to enter a shard ID manually (e.g., 1, 2, 3, etc.)
2. Update your RPC URL to include the shard ID
3. Save the shard ID and updated RPC URL to your `.env` file

You must run this script before deploying contracts or minting NFTs.

> **Note**: The =nil; network API does not currently support automatic shard ID retrieval. You will need to manually specify a shard ID to use. If you encounter "shard API not found" errors, try different shard IDs until you find one that works.

You can also manually set up your wallet using the =nil; CLI directly:

```bash
# Initialize config
nil config init

# Set RPC endpoint
nil config set rpc_endpoint YOUR_RPC_ENDPOINT

# Generate new private key
nil keygen new

# Create new smart account
nil smart-account new

# View your smart account info
nil smart-account info
```

## Usage

### Compile Contracts

```bash
npm run compile
```

### Configure a Shard

```bash
npm run get-shards
```

### Deploy NFT Contract

```bash
npm run deploy
```

This will:
1. Check your wallet balance
2. Request tokens from the faucet if needed
3. Deploy the AirSpaceNFT contract to the configured shard
4. Save the contract address to your `.env` file

### Mint NFTs

```bash
npm run mint
```

This will mint 5 NFTs with the predefined metadata.

### Transfer NFTs

To transfer an NFT to another wallet:

```bash
npm run transfer
```

This interactive script will:
1. Connect to your wallet and the NFT contract
2. Prompt for the token ID you want to transfer
3. Verify that you own the token
4. Prompt for the recipient's wallet address
5. Execute the transfer transaction

## Automated Token and NFT Transfer

This project includes a smart contract that automatically transfers 1 NIL token and an NFT to a hardcoded wallet address (0x000129e60021a183845df99AAB9fb0931Df64B5c).

### Deploy Transfer Contract

```bash
npm run deploy-transfer
```

This will deploy the AirSpaceTransfer contract, which is designed to transfer both NIL tokens and NFTs to the hardcoded address.

### Execute Transfer

```bash
npm run transfer-tokens
```

This interactive script will:
1. Connect to your wallet, the NFT contract, and the transfer contract
2. Prompt for the NFT token ID to transfer
3. Verify that you own the token
4. Send 1 NIL to the transfer contract
5. Approve the transfer contract to handle your NFT
6. Execute the transfer of both 1 NIL and the NFT to the hardcoded address

### Transfer Contract Details

The `AirSpaceTransfer` contract includes the following functions:

- `transferNIL()`: Transfers 1 NIL token to the hardcoded recipient
- `transferNFT(address nftContract, uint256 tokenId)`: Transfers a specific NFT to the hardcoded recipient
- `transferBoth(address nftContract, uint256 tokenId)`: Transfers both 1 NIL and a specific NFT to the hardcoded recipient
- `withdrawNIL(uint256 amount)`: Allows the owner to withdraw NIL tokens from the contract
- `withdrawNFT(address nftContract, uint256 tokenId)`: Allows the owner to withdraw an NFT from the contract

## Contract Details

The `AirSpaceNFT` contract is an ERC-721 compliant contract that allows for:
- Minting new NFTs with metadata
- Transferring NFTs between addresses
- Viewing NFT metadata

## Metadata Structure

Each NFT has the following metadata structure:

```json
{
  "name": "NFT Title",
  "description": "Detailed description of the air rights",
  "image": "Image URL",
  "attributes": [
    { "trait_type": "Address", "value": "Physical address" },
    { "trait_type": "Current Height", "value": "Current building height" },
    { "trait_type": "Maximum Height", "value": "Maximum allowed height" },
    { "trait_type": "Available Floors", "value": "Floors available for purchase" },
    { "trait_type": "Price", "value": "Price in USD" }
  ]
}
```

## =nil; Network Integration

This project integrates with the =nil; network by:
1. Connecting to the =nil; testnet
2. Using the faucet service to obtain testnet tokens
3. Deploying ERC-721 contracts to the network
4. Minting NFTs on the network
5. Facilitating NFT transfers between wallets
6. Automating token and NFT transfers to a specific address

## Troubleshooting

- **Insufficient funds**: Run the deployment script again to request tokens from the faucet
- **Transaction failures**: Check the gas settings and network status
- **Contract verification**: Use the =nil; block explorer to verify your contract
- **Error with deployer account**: Make sure your private key is correctly set in the .env file
- **Wallet issues**: Ensure the =nil; CLI is properly installed and configured
- **"Command not found" errors**: Run `npm run fix-path` to add the =nil; CLI to your PATH
- **Private key errors**: Run `npm run extract-key` to extract your private key from the =nil; CLI config
- **Shard errors**: Run `npm run get-shards` to configure a shard ID before deploying or minting
- **Balance errors**: If you encounter "shard API not found" errors, try different shard IDs until you find one that works

## License

MIT 