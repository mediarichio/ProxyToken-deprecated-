# Project Title

Smart contracts for the MediaRich.io proxy token, the ICO token which later can be redeemed for the Dyncoin ecosystem token. 

Core to the ProxyToken is implementation of a fully-featured vesting token.
 
Here is a brief summary of its features and capabilities:

- Simultaneously supports both revocable and irrevocable token grants. Use cases for this are token purchases (irrevocable) as well employee compensation plans (revocable).
- At the time of grant, tokens are deposited into the beneficiary's account, but the non-vested portion is prevented from being spent. We like this model because it ensures the not-vested tokens are stored safely with the beneficiary and remain locked, with no possibility of unreleased tokens being accidentally spent or used for another purpose.
- If a revocable token grant is revoked by the grantor, the beneficiary keeps the vested tokens, and the not-vested tokens are returned to the grantor.
- Sophisticated support for a grantor role, which can be assigned to multiple accounts, creating the ability to form multiple grant pools of different types for different purposes, each with its own grantor.
- Each grant pool may have its own uniform vesting schedule, which is applied to grants made to all beneficiaries from that pool. Restrictions can be set to parameterize the grantor's ability to set start dates, and a grantor expiration date can be set to automatically close the pool.
- There's also an ability to create one-off grants, where each beneficiary can have a unique vesting schedule for its grant.
- The vesting schedule supports start date, cliff date, end date and interval. If interval is 1, the grant vests linearly. If interval is a number like say 30, vesting bumps up every 30 days. There is a restriction that both the interval from start to the cliff and the overall duration must be an even multiple of the interval. This flexibility opens up many possible vesting patterns.
- All grant-related dates are measured in whole days, with each day starting at midnight UTC time. This locks all vesting to the same clock, which will help with orderly bookkeeping. It also disallows absurd cases like grants that are 15 minutes long, etc.
- There is a limit of one vesting grant at a time per account. A beneficiary can have multiple grants in effect on different terms simply by using a new account for each new grant.
- Support for an address self-registration mechanism, and safe methods which will only transact with a verified address, to help prevent token loss through accidental bad data.
- Enterprise-style support for roles and permissions, with mechanisms in place to prevent loss of ownership control or accidental transfer of ownership to an invalid address.
- Full automated test coverage of the contract code written in nodejs.
- I am wrapping up loose ends with this work before I publish the source, but it will be soon. I am eager to receive any feedback and hear ideas for improvement that this group may have. Also, I hope many of you will find it useful, and can help me improve on it.

## Getting Started

The project requires node.js. I'm using node v10.15.1. The node modules/versions you need are enumerated in `install.bat` and `package.json`.

### Prerequisites

You'll need a copy of the [openzeppelin-solidity](https://github.com/OpenZeppelin/openzeppelin-solidity.git) repository.

Clone it to a folder called `openzeppelin-solidity` which is a sibling of `ProxyToken`.

### Installing

After you've pulled the code, install node modules:

First, install NPM (if you haven't already)

```
npm install npm -g
```

And then the needed modules

```
npm install --save mocha@^5.1.1  colors  solc@^0.5.6  web3@^1.0.0-beta.37  ganache-cli@^6.4.1  truffle-hdwallet-provider@0.0.5
```

At this time, the only thing you can do next is run the tests. I'm working on some deployment tools for testing on an Ethereum testnet, but it's not ready yet.

## Running the tests

Run the tests by issuing the command:

```
npm test
```

or in a DOS command prompt, simply:

```
test.bat
```

### Breakdown into end-to-end tests

There is a comprehensive set of tests written using Mocha to exercise functions of the smart contract that aren't already covered by openzeppelin-solidity, which has tests for the underlying contracts which were not modified. Web3 and ganache are used to form a test blockchain which the tests are run against.

The testing style used here is end-to-end, or functional in nature. While these tests run pretty quickly, technically they're not unit tests. I've attempted to cover all major functionality, but there is still work needed to be done, for example, there are no tests yet to verify event generation.
 

## Deployment

This section is yet to be written.

## Built With

* [openzeppelin-solidity](https://github.com/OpenZeppelin/openzeppelin-solidity.git) - a battle-tested framework of reusable smart contracts.

## Contributing

This section is yet to be written. 

## Versioning

This section is yet to be written. 

## Authors

* **David Jennings** - *Initial work* - [djenning90](https://github.com/djenning90)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

This section is yet to be written. 