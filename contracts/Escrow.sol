//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

// there is a real estate token we can rent, and we lock it in an escrow until some set of actions happen
// the buyer/seller are the ultimate users however the scenario
// there are lender, inspector and appraiser roles to sign off before the porcess.
// seller lists the property, buyer deposits earnset, sign off from the appraisal, lender
// lender funds and transfer the ownershio to buyer
// seller gets paid

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public lender;
    address public inspector;
    address public realEstateTokenAddress;
    // receives the eth so payable
    address payable public seller;

    constructor(
        address _realEstateTokenAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        realEstateTokenAddress = _realEstateTokenAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }
}
