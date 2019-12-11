pragma solidity ^0.5.0;

import "contracts/SignatureAccessControl.sol";
//import "ERC721.sol";

contract SignatureBase is SignatureAccessControl {
    
    event Signed(string username, uint32 user_id, uint256 signatureId);

    struct Signature {
        // github username
        string username;

        // github user_id.
        uint32 user_id;

        // github comment_id.
        uint32 comment_id;

        // github repo_id
        uint32 repo_id;

        // repo pull request
        uint32 pull_request_no;

        // timestamp of created_at and updated_at.
        uint64 created_at;
        uint64 updated_at;
    }
    
    Signature[] signatures;

    // @dev A mapping from owner address to count of tokens that address owns.
    //  Used internally inside balanceOf() to resolve ownership count.
    mapping (uint32 => Signature[]) _signaturesOf;

    // @dev A mapping from owner address to count of tokens that address owns.
    //  Used internally inside balanceOf() to resolve ownership count.
    mapping (uint32 => Signature[]) _signaturesOfRepo;
    
    /// @dev An internal method that creates a new kitty and stores it. This
    ///  method doesn't do any checking and should only be called when the
    ///  input data is known to be valid. Will generate both a Birth event
    ///  and a Transfer event.
    /// @param _username The kitty ID of the matron of this cat (zero for gen0)
    /// @param _user_id The kitty ID of the sire of this cat (zero for gen0)
    /// @param _comment_id The generation number of this cat, must be computed by caller.
    /// @param _repo_id The github repo_id
    /// @param _pull_request_no The repo pull request no
    /// @param _created_at The kitty's genetic code.
    /// @param _updated_at The inital owner of this cat, must be non-zero (except for the unKitty, ID 0)
    function _createSignature(
        string memory _username,
        uint32 _user_id,
        uint32 _comment_id,
        uint32 _repo_id,
        uint32 _pull_request_no,
        uint64 _created_at,
        uint64 _updated_at
    )
        internal
        returns (uint)
    {
        // These requires are not strictly necessary, our calling code should make
        // sure that these conditions are never broken. However! _createKitty() is already
        // an expensive call (for storage), and it doesn't hurt to be especially careful
        // to ensure our data structures are always valid.
        //require(_matronId == uint256(uint32(_matronId)));
        //require(_sireId == uint256(uint32(_sireId)));
        //require(_generation == uint256(uint16(_generation)));

        Signature memory _signature = Signature({
            username: _username,
            user_id: _user_id,
            comment_id: _comment_id,
            repo_id: _repo_id,
            pull_request_no: _pull_request_no,
            created_at: _created_at,
            updated_at: _updated_at
        });
        uint256 newSignatureId = signatures.push(_signature) - 1;

        // It's probably never going to happen, 4 billion cats is A LOT, but
        // let's just be 100% sure we never let this happen.
        //require(newKittenId == uint256(uint32(newKittenId)));

        // emit the birth event
        emit Signed(
            _username,
            _user_id,
            newSignatureId
        );

        // This will assign ownership, and also emit the Transfer event as
        // per ERC721 draft
        // transfer(cooAddress, newSignatureId);

        _signaturesOf[_user_id].push(_signature);
        _signaturesOfRepo[_repo_id].push(_signature);

        return newSignatureId;
    }

}