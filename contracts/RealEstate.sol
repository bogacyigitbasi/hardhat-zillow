//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// the point is just to create a regular NFT contract for the
// real estate that can be locked into an escrow contract as the next step.

// we may consider it to fractionalize after the escrow as a separrate challenge.

contract RealEstate is ERC721URIStorage {
    uint256 testval;
    using Counters for Counters.Counter;
    //IEnumarable tokenIds
    Counters.Counter private _tokenIds;

    constructor() ERC721("Real Estate", "REAL") {}

    function mint(string memory _tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        return tokenId;
    }
    // how many is the same with the number of Ids assigned
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
