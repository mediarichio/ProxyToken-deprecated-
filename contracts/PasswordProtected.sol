pragma solidity ^0.5.7;

/**
 * @dev Implements a contract to add password-protection support to API calls of child contracts.
 * This is secure through storage of only the keccak256 hash of the password, which is irreversible.
 * Critically, all sensitive methods have private visibility.
 *
 * As implemented, the password has contract-wide scope. This does not implement per-account passwords,
 * though that would not be difficult to do.
 */
contract PasswordProtected {
    bytes32 private passwordHash;

    /**
     * A contract password must be set at construction time.
     */
    constructor (string memory password) internal {
        _setNewPassword(password);
    }

    function _setNewPassword(string memory password) private {
        passwordHash = keccak256(bytes(password));
    }

    function _isValidPassword(string memory password) internal view returns (bool ok) {
        return (bytes32(keccak256(bytes(password))) == passwordHash);
    }

    /**
     * Any contract functions requiring password-restricted access can use this modifier.
     */
    modifier onlyValidPassword(string memory password) {
        require(_isValidPassword(password), "access denied");
        _;
    }

    /**
     * Allow password to be changed.
     */
    function _changePassword(string memory oldPassword, string memory newPassword) onlyValidPassword(oldPassword) internal returns (bool ok) {
        _setNewPassword(newPassword);
        return true;
    }
}
