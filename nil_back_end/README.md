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
- Prompt for your wallet's private key
- Prompt for the NFT contract address (if already deployed)

## Wallet Setup

To create and manage your =nil; wallet, you can use our wallet setup script:

```bash
npm run wallet-setup
```

This script will guide you through the official =nil; CLI workflow:

1. Initialize the =nil; CLI config (`nil config init`)
2. Set the RPC endpoint (`nil config set rpc_endpoint RPC_ENDPOINT`)
3. Generate a new private key (`nil keygen new`)
4. Create a new smart account (`nil smart-account new`)
5. Retrieve your smart account information (`nil smart-account info`)
6. Save your wallet address to the `.env` file

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

### Deploy Contract

```bash
npm run deploy
```

This will:
1. Check your wallet balance
2. Request tokens from the faucet if needed
3. Deploy the AirSpaceNFT contract
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

## Troubleshooting

- **Insufficient funds**: Run the deployment script again to request tokens from the faucet
- **Transaction failures**: Check the gas settings and network status
- **Contract verification**: Use the =nil; block explorer to verify your contract
- **Error with deployer account**: Make sure your private key is correctly set in the .env file
- **Wallet issues**: Ensure the =nil; CLI is properly installed and configured
- **"Command not found" errors**: Run `npm run fix-path` to add the =nil; CLI to your PATH

## License

MIT 