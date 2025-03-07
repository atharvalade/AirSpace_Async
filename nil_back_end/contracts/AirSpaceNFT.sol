// contracts/AirSpaceNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Note: In a production environment, you would import NilTokenBase.sol
// import "@nil-foundation/contracts/NilTokenBase.sol";

/**
 * @title AirSpaceNFT
 * @dev Implementation of the AirSpaceNFT contract for the =nil; network
 * This contract represents air rights as NFTs
 */
contract AirSpaceNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Mapping from token ID to token URI
    mapping(uint256 => string) private _tokenURIs;

    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("AirSpace", "AIRSP") {}

    /**
     * @dev Mints a new token
     * @param to The address that will receive the minted token
     * @param metadataURI The token URI for the new token
     * @return The ID of the newly minted token
     */
    function mint(address to, string memory metadataURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        emit NFTMinted(to, newTokenId, metadataURI);
        
        return newTokenId;
    }

    /**
     * @dev Sets the token URI for a given token
     * @param tokenId The token ID to set the URI for
     * @param _tokenURI The URI to assign
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @dev Returns the token URI for a given token
     * @param tokenId The token ID to get the URI for
     * @return The token URI string
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
}