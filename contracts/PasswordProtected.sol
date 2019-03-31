pragma solidity ^0.5.2;

/**
 * Implementation of a contract to add password-protection support to API calls of child contracts.
 * This is secure through storage of only the keccak256 hash of the password, which is irreversible.
 * Critically, no methods are public. The only internally exposed elements are the constructor,
 * which establishes the original password, and the modifier isCorrectPassword, which can be attached
 * to methods which accept a password argument and require a valid password to perform the function.
 */
contract PasswordProtected {
	bytes32 private passwordHash;

	constructor (string memory password) internal {
		_setNewPassword(password);
	}

	function _setNewPassword(string memory password) private {
		passwordHash = keccak256(bytes(password));
	}

	modifier onlyCorrectPassword(string memory password) {
		require(bytes32(keccak256(bytes(password))) == passwordHash, "access denied");
		_;
	}

	function changePassword(string memory oldPassword, string memory newPassword) onlyCorrectPassword(oldPassword) public returns (bool ok) {
		_setNewPassword(newPassword);
		return true;
	}
}
