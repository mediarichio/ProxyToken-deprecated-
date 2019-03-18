const build = require('./build');

const colors = require('colors');
const HDWalletProvider = require('truffle-hdwallet-provider');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require("fs");

// Support for production blockchain isn't implemented yet.
const useProductionBlockchain = false;

const log = true;
const debug = false;
let logger = console;

function getProvider() {
    if (useProductionBlockchain)
        return new Web3(new HDWalletProvider(
            'foster door tonight blade swing method kind wide glass pepper permit scrub',
            'https://rinkeby.infura.io/v3/2694f180955f4061af2ea57208316964'
        ));
    else
        return ganache.provider();
}

async function deployContract(provider, contractFullPath, doBuild, someLogger) {
    if (!!someLogger)
        logger = someLogger;

    if (doBuild)
        build(contractFullPath, logger);

    if (log) logger.log('==> Deploying contract \'' + contractPath + '\' and dependencies...');

    provider.setMaxListeners(15);       // Suppress MaxListenersExceededWarning warning
    const web3 = new Web3(provider);
    this.gasPrice = await web3.eth.getGasPrice();
    this.accounts = await web3.eth.getAccounts();

    // Read in the compiled contract code and fetch ABI description and the bytecode as objects
    const compiled = JSON.parse(fs.readFileSync("./output/contracts.json"));
    const abi = compiled.contracts["ProxyToken.sol"]["ProxyToken"].abi;
    const bytecode = compiled.contracts['ProxyToken.sol']['ProxyToken'].evm.bytecode.object;

    // Deploy the contract and send it gas to run.
    if (log) logger.log('Attempting to deploy from account:' + this.accounts[0]);
    this.contract = await new web3.eth.Contract(abi)
        .deploy({data: '0x' + bytecode, arguments: []})
        .send({from: this.accounts[0], gas: '6000000'});

    if (this.contract.options.address == null) {
        if (log) logger.log(colors.red('==> Deploy FAILED!\n'));
    } else {
        if (log) logger.log(colors.green('==> Contract deployed!') + ' to: ' + colors.blue(this.contract.options.address) + '\n');
    }
    return this;
}

async function deploy(contractFullPath, theLogger, doBuild) {
    if (!!theLogger)
        logger = theLogger;

    const deployment = await deployContract(getProvider(), contractFullPath, theLogger, doBuild).catch(logger.log);
    if (log) logger.log('Done!');

    logger.log('Deployment: '+deployment);
    return deployment;
}

// Pass build function to module user
module.exports = deploy;

// Uncomment to make it run if invoked directly from the command line
//deploy(null, console, true);
