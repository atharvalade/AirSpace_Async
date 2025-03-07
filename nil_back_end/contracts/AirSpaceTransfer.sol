// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AirSpaceTransfer
 * @dev Contract for transferring NIL tokens and NFTs to a specific address
 */
contract AirSpaceTransfer is Ownable {
    // Hardcoded recipient address
    address public constant RECIPIENT = 0x000129e60021a183845df99AAB9fb0931Df64B5c;
    
    // Events
    event TokenTransferred(address indexed from, address indexed to, uint256 amount);
    event NFTTransferred(address indexed from, address indexed to, address indexed nftContract, uint256 tokenId);
    
    // Receive function to accept NIL tokens
    receive() external payable {}
    
    /**
     * @dev Transfers 1 NIL token to the hardcoded recipient address
     */
    function transferNIL() public payable {
        require(address(this).balance >= 1 ether, "Insufficient balance to transfer 1 NIL");
        
        // Transfer 1 NIL to the recipient
        (bool success, ) = RECIPIENT.call{value: 1 ether}("");
        require(success, "NIL transfer failed");
        
        emit TokenTransferred(address(this), RECIPIENT, 1 ether);
    }
    
    /**
     * @dev Transfers a specific NFT to the hardcoded recipient address
     * @param nftContract The address of the NFT contract
     * @param tokenId The ID of the NFT to transfer
     */
    function transferNFT(address nftContract, uint256 tokenId) public onlyOwner {
        require(nftContract != address(0), "Invalid NFT contract address");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == address(this), "Contract does not own this NFT");
        
        // Transfer the NFT to the recipient
        nft.safeTransferFrom(address(this), RECIPIENT, tokenId);
        
        emit NFTTransferred(address(this), RECIPIENT, nftContract, tokenId);
    }
    
    /**
     * @dev Transfers both 1 NIL token and a specific NFT to the hardcoded recipient address
     * @param nftContract The address of the NFT contract
     * @param tokenId The ID of the NFT to transfer
     */
    function transferBoth(address nftContract, uint256 tokenId) public payable onlyOwner {
        transferNIL();
        transferNFT(nftContract, tokenId);
    }
    
    /**
     * @dev Allows the owner to withdraw any remaining NIL tokens
     * @param amount The amount of NIL to withdraw
     */
    function withdrawNIL(uint256 amount) public onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Allows the owner to withdraw any NFT
     * @param nftContract The address of the NFT contract
     * @param tokenId The ID of the NFT to withdraw
     */
    function withdrawNFT(address nftContract, uint256 tokenId) public onlyOwner {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == address(this), "Contract does not own this NFT");
        
        nft.safeTransferFrom(address(this), msg.sender, tokenId);
    }
} 