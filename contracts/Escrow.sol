//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

// there is a real estate token we can rent, and we lock it in an escrow until some set of actions happen
// the buyer/seller are the ultimate users however the scenario
// there are lender, inspector and appraiser roles to sign off before the porcess.
// seller lists the property, buyer deposits earnset, sign off from the appraisal, lender
// lender funds and transfer the ownershio to buyer
// seller gets paid

// added the interface for ERC721
interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public lender;
    address public inspector;
    // pass the NFT address so escrow keep
    address public realEstateTokenAddress;
    // receives the eth so payable
    address payable public seller;

    // get if a token real estate is listed
    mapping(uint256 => bool) public isListed;

    // real estate price
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;

    // who is the buyer
    mapping(uint256 => address) public buyer;

    mapping(uint256 => bool) public inspectionPass;
    // approve the token's sale, we make the approver accountable here.
    mapping(uint256 => mapping(address => bool)) public approval;

    modifier onlySeller() {
        require(msg.sender == seller, "Only real estate agent can sell");
        _;
    }

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

    // take the NFT from the seller, put it on escrow and
    // list & sell it for the price defined by the seller
    // the ownership must have been put to a 3rd party (neutral)
    function list(
        uint256 _tokenId,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address _buyer
    ) public payable onlySeller {
        IERC721(realEstateTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        isListed[_tokenId] = true;
        purchasePrice[_tokenId] = _purchasePrice;
        escrowAmount[_tokenId] = _escrowAmount;
        buyer[_tokenId] = _buyer;
    }

    modifier onlyBuyer(uint256 _tokenId) {
        require(msg.sender == buyer[_tokenId], "Only buyer can call this");
        _;
    }

    // buyer deposits money on the contract like downpayment
    function depositCollateral(
        uint256 _tokenId
    ) public payable onlyBuyer(_tokenId) {
        require(msg.value >= escrowAmount[_tokenId]); // escrow amount added when listing
    }

    // appraisal / inspection
    modifier onlyInspector() {
        require(
            msg.sender == inspector,
            "Only inspector can call the contract"
        );
        _;
    }
    // only inspector can call it
    function updateInspectionStatus(
        uint256 _tokenId,
        bool _status
    ) public onlyInspector {
        inspectionPass[_tokenId] = _status;
    }

    function getInspectionStatus(uint256 _tokenId) public view returns (bool) {
        return inspectionPass[_tokenId];
    }

    function approveSale(uint256 _tokenId) public {
        approval[_tokenId][msg.sender] = true;
    }

    // require inspection status true
    // require sale to be authorized
    // require funds check
    // transfer the token to buyer // buyer needs to lend some money from lender??
    // transfer funds to the seller
    function finalizeSale(uint256 _tokenId) public {
        require(
            getInspectionStatus(_tokenId) == true,
            "Inspection is not passed"
        );
        require(approval[_tokenId][buyer[_tokenId]]);
        require(approval[_tokenId][seller]);
        require(approval[_tokenId][lender]);

        require(
            address(this).balance >= purchasePrice[_tokenId],
            "price is not sufficient"
        );
        // send contract balance to the seller.
        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        IERC721(realEstateTokenAddress).transferFrom(
            address(this),
            buyer[_tokenId],
            _tokenId
        );
    }
    // get contract balance for testing purposes
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
