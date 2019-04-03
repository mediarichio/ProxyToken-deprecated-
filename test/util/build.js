const colors = require('colors');
const path = require('path');
const fs = require('fs');
const solc = require('solc');

const log = true;
const debug = false;
let logger = console;

const pathSeparator = /[\\/]/;

const contractPath_default = './contracts/ProxyToken.sol';

let allSources = '';
const dependencies = [];
const files = new Set();

// Saving this for later if case we want to use solc 0.5's dependency handling.
const input = {
    language: 'Solidity',
    sources: {},
    settings: {
        outputSelection: {
            '*': {
                '*': [
                    'evm.bytecode', 'abi',
//                    'metadata', 'evm.bytecode.sourceMap', 'evm.bytecode.opcodes'
                ]
            }
        }
    }
};
// But for now, we do the dependency traversal here and it is working.
const input_monolithic = {
    language: 'Solidity',
    sources: {},
    settings: {
        outputSelection: {
            'ProxyToken.sol': {
                'ProxyToken': [
                    'evm.bytecode', 'abi',
//                    'metadata', 'evm.bytecode.sourceMap', 'evm.bytecode.opcodes'
                ]
            }
        }
    }
};

function build(fullContractPath, theLogger) {
    if (!!theLogger)
        logger = theLogger;

    if (!fullContractPath)
        fullContractPath = contractPath_default;

    let index = fullContractPath.lastIndexOf('/');
    if (index === -1)
        index = fullContractPath.lastIndexOf('\\');
    if (index === -1) {
        logger.log(colors.red('Invalid full path given: ' + fullContractPath))
    } else {
        const path = fullContractPath.substring(0, index + 1);
        const file = fullContractPath.substring(index + 1);
        return compileContract(path, file);
    }
}

// Pass build function to module user
module.exports = build;

// Uncomment to make it run if invoked directly from the command line
//build(null, console);


function compileContract(contractPath, contractFile) {
    if (log) logger.log('==> Compiling contract \'' + contractPath + contractFile + '\' and dependencies...');

    this.contractPath = contractPath;
    this.contractFile = contractFile;

    // Process dependencies manually, since older node solc didn't support imports properly.
    // This can be eliminated now that we're using solc 0.5.2, but right now it's working fine.
    addSource(contractFile, readSources(contractPath + contractFile));
    input_monolithic.sources[contractFile] = {content: allSources};

    // Save the monolithic source to output
    saveOutputFile('contracts.sol', allSources);

    // Compile all the contracts
    if (log) logger.log('Compiling \'' + contractPath + '\' and dependencies...');
    const compiled = solc.compile(JSON.stringify(input_monolithic), loadImport);
    const compiledObject = JSON.parse(compiled);

    // Save the full compiled outputJSON, pretty-printed
    let compiledJson = JSON.stringify(compiledObject, null, 2);
    //compiledJson = unescapeQuotes(unquote(compiledJson));
    saveOutputFile('contracts.json', compiledJson);
    if (log) logger.log(JSON.parse(compiledJson));

    // Sort the ABI alphabetically by name so it's visually easier to locate a given methods while in Remix.
    const abi = compiledObject.contracts["ProxyToken.sol"]["ProxyToken"].abi;
    this.abi = abi.sort((a,b) => {
        if (lower(a.name) < lower(b.name))
            return -1;
        if (lower(a.name) > lower(b.name))
            return 1;
        return 0;
    });

    // Save the sorted ABI to output
    saveOutputFile('contracts.abi', JSON.stringify(this.abi, null, 2));

    function loadImport(path) {
        // This should never happen because we process imports manually.
        if (log) logger.log(colors.red.bold('requested import: ' + path + ': not implemented!'));
    }

    if (compiledObject.errors === undefined) {
        this.buildSuccess = true;
        logger.log(colors.green.bold('Build SUCCESSFUL!\n'));
    } else {
        this.buildSuccess = false;
        logger.log(colors.red.bold('The build FAILED!\n'));
    }

    this.compiledContract = compiledObject;

    return this;
}

function lower(x) {
    if (x === undefined)
        return '';
    else
        return x.toLowerCase();
}

function unquote(str) {
    return str.substring(1, str.length - 1);
}

function unescapeQuotes(str) {
    return str.replace(new RegExp('\\\\"', 'g'), '"');
}

function saveOutputFile(filename, data) {
    filename = 'output/' + filename;
    fs.writeFileSync(filename, data, function (err, data) {
        if (err) if (log) logger.log(colors.red.bold('!!! Error while saving \'' + filename + '\': ' + err));
        if (log) logger.log(colors.green.bold('Successfully saved \'' + filename + '\''));
    });
}

function addSource(contractFullPath, sourceText) {
    const contractFile = contractFullPath.indexOf('\\') > 0
        ? contractFullPath.substring(contractFullPath.lastIndexOf('\\') + 1)
        : contractFullPath.substring(contractFullPath.lastIndexOf('/') + 1);
    if (!files.has(contractFile)) {
        allSources += (sourceText + '\n');
        input.sources[contractFile] = {content: sourceText};
        files.add(contractFile);
    }
}

function readMonolithicSource(contractPath) {
    contractPath = replaceAll(contractPath, pathSeparator, '\\');
    const contractFile = contractPath.substring(contractPath.lastIndexOf('\\') + 1);

    input_monolithic.sources[contractFile] = readSources(contractPath);

}

function readSources(contractFullPath) {
    contractFullPath = replaceAll(contractFullPath, pathSeparator, '\\');
    const contractBase = contractFullPath.substring(0, contractFullPath.lastIndexOf('\\') + 1);
    const contractFile = contractFullPath.substring(contractFullPath.lastIndexOf('\\') + 1);

    let sourceStripped = '';
    if (!files.has(contractFile)) {
        dependencies.push(contractFullPath);

        if (log) logger.log('Reading \'' + contractFullPath);
        const contractSource = fs.readFileSync(path.resolve(contractBase, contractFile), 'utf8');

        const lines = contractSource.split("\n");
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.startsWith('import ')) {
                const dependencyFullPath = parseAndResolveImportPath(contractBase, substituteDependencyLine(line));
                const importedSource = readSources(dependencyFullPath);
                const parts = line.split('\"');
                const importFullPath = parts[1];        // The text between the double quotes
                addSource(importFullPath, importedSource);
            } else
                sourceStripped += (line + '\n');
        }
    }

    return sourceStripped;
}

// Slight HACK: This replaces the openzeppelin-solidity implementation of PauserRole.sol with our own.
// We do this to make openzeppelin-solidity's implementation of Pausable.sol have our required behavior
// without having to change the calling code. See comments in PauserRole.sol for details about why we differ.
function substituteDependencyLine(line) {
    if (line.indexOf('PauserRole.sol') >= 0)
        return ('import "../../../ProxyToken/contracts/PauserRole.sol"');
    else
        return line;
}

function parseAndResolveImportPath(contractBase, line) {
    let baseParts = contractBase.split(pathSeparator);
    if (baseParts.length > 0 && baseParts[baseParts.length - 1] === '')
        baseParts.pop();        // Remove trailing '/' from path component

    let lineParts = line.split('"')[1].split(pathSeparator);

    for (let i = 0; i < lineParts.length; i++) {
        let part = lineParts[i];
        if (part !== '.') {
            if (part === '..') {
                if (baseParts.length === 0 || baseParts[baseParts.length - 1] === '..') {
                    baseParts.push(part);
                } else {
                    let popped = baseParts.pop();
                    if (popped === '.')
                        baseParts.push(part);
                }
            } else {
                baseParts.push(part);
            }
        }
    }

    let resolvedPath = '';
    for (let i = 0; i < baseParts.length; i++) {
        resolvedPath += baseParts[i];
        if (i !== baseParts.length - 1)
            resolvedPath += '\\';
    }

    if (debug) logger.log('resolved as ' + resolvedPath);
    return resolvedPath;
}

function replaceAll(value, oldSeparator, newSeparator) {
    let result = '';
    const parts = value.split(oldSeparator);
    for (let i = 0; i < parts.length; i++) {
        result += parts[i];
        if (i !== parts.length - 1)
            result += newSeparator;
    }
    return result;
}

build();