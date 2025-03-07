// src/services/nilService.ts
import { ethers } from 'ethers';
import type { AirSpaceNFT } from '../types/contracts/contracts/AirSpaceNFT';
import { AirSpaceNFT__factory } from '../types/contracts/factories/contracts/AirSpaceNFT__factory';
import dotenv from 'dotenv';

dotenv.config();

export class NilService {
    private provider: ethers.providers.JsonRpcProvider;
    private signer: ethers.Signer;
    private nftContract: AirSpaceNFT;

    constructor() {
        // Connect to =nil; testnet
        this.provider = new ethers.providers.JsonRpcProvider(
            process.env.NIL_TESTNET_URL || 'https://api.devnet.nil.foundation/api/bot-1253/cda16f81590b0f26c11f4b25c4417b41'
        );
        
        // Initialize with private key (for testing)
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY environment variable is required');
        }
        
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        
        if (!process.env.NFT_CONTRACT_ADDRESS) {
            throw new Error('NFT_CONTRACT_ADDRESS environment variable is required');
        }
        
        // Initialize NFT contract
        this.nftContract = AirSpaceNFT__factory.connect(
            process.env.NFT_CONTRACT_ADDRESS,
            this.signer
        );
    }

    async mintNFT(to: string, tokenURI: string): Promise<ethers.ContractReceipt> {
        const tx = await this.nftContract.mint(to, tokenURI);
        return await tx.wait();
    }

    async transferNFT(from: string, to: string, tokenId: number): Promise<ethers.ContractReceipt> {
        const tx = await this.nftContract['safeTransferFrom(address,address,uint256)'](
            from,
            to,
            tokenId
        );
        return await tx.wait();
    }

    async getTokenURI(tokenId: number): Promise<string> {
        return await this.nftContract.tokenURI(tokenId);
    }
}

export default new NilService();