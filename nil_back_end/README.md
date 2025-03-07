# AirSpace NFT on =nil; Network

This project implements NFT minting for AirSpace on the =nil; network. It allows for the creation and management of NFTs representing air rights.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- A wallet with =nil; testnet tokens

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

## Troubleshooting

- **Insufficient funds**: Run the deployment script again to request tokens from the faucet
- **Transaction failures**: Check the gas settings and network status
- **Contract verification**: Use the =nil; block explorer to verify your contract
- **Error with deployer account**: Make sure your private key is correctly set in the .env file

## License

MIT 