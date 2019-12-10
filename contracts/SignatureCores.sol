pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "contracts/SignatureBase.sol";

contract Signature is SignatureBase {
    
    address public newContractAddress;

    constructor() public  {
        paused = false;
        ceoAddress = msg.sender;
        cooAddress = msg.sender;
    }
    
    /// @dev Used to mark the smart contract as upgraded, in case there is a serious
    ///  breaking bug. This method does nothing but keep track of the new contract and
    ///  emit a message indicating that the new address is set. It's up to clients of this
    ///  contract to update to the new contract address in that case. (This contract will
    ///  be paused indefinitely if such an upgrade takes place.)
    /// @param _v2Address new address
    function setNewAddress(address _v2Address) external onlyCEO whenPaused {
        // See README.md for updgrade plan
        newContractAddress = _v2Address;
        emit ContractUpgrade(_v2Address);
    }
    
    /// @notice No tipping!
    /// @dev Reject all Signatures from being sent here, unless it's from one of the
    ///  two auction contracts. (Hopefully, we can prevent user accidents.)
    //function() external payable {
        //require(
        //    msg.sender == address(cooAddress)
        //);
    //}

    /// @notice Returns all the relevant information about a specific kitty.
    /// @param _user_id The ID of the user of interest.
    function getSignaturesOf(uint128 _user_id)
        external
        view
        whenNotPaused
        returns (
        Signature[] memory signatures
    ) {
        signatures = _signaturesOf[_user_id];
    }
    
    /// @notice Returns all the relevant information about a specific kitty.
    /// @param _id The ID of the kitty of interest.
    function getSignature(uint256 _id)
        external
        view
        whenNotPaused
        returns (
        string memory username,
        uint128 user_id,
        uint128 created_at
    ) {
        Signature storage signature = signatures[_id];

        username = signature.username;
        user_id = signature.user_id;
        created_at = signature.created_at;
        
    }
    
    /// @dev An internal method that creates a new kitty and stores it. This
    ///  method doesn't do any checking and should only be called when the
    ///  input data is known to be valid. Will generate both a Birth event
    ///  and a Transfer event.
    /// @param _username The kitty ID of the matron of this cat (zero for gen0)
    /// @param _user_id The kitty ID of the sire of this cat (zero for gen0)
    /// @param _comment_id The generation number of this cat, must be computed by caller.
    /// @param _created_at The kitty's genetic code.
    /// @param _updated_at The inital owner of this cat, must be non-zero (except for the unKitty, ID 0)
    function createSignature(
        string memory _username,
        uint128 _user_id,
        uint128 _comment_id,
        uint128 _created_at,
        uint128 _updated_at
    )
        public
        onlyCEO
        whenNotPaused
        returns (uint)
    {
        uint256 newSignatureId = _createSignature(_username, _user_id, _comment_id, _created_at, _updated_at);
        return newSignatureId;
    }
}