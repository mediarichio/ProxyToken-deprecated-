const path = require('path');
const fs = require('fs');
const sha3 = require('js-sha3');

const password = fs.readFileSync(path.resolve('./', 'kill-password.txt'), 'utf8');

const encrypted = sha3.keccak256(password);
console.log('Keccak256(password):', encrypted, 'length:', encrypted.length);