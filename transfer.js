const fs = require('fs');
const Web3 = require('web3');
require('dotenv').config();


async function transferToWallets(web3,chainId, token) {
    let rawdata = fs.readFileSync('wallets.json');

    /**
     * sample of wallets.json
        [
            {
                "wallet": "xXX",
                "percentage": "0.5"
            }
        ]
     */
    let wallets = JSON.parse(rawdata);
    var senderPrivateKey = process.env.senderPrivateKey;
    var senderAddress = web3.eth.accounts.privateKeyToAccount(senderPrivateKey).address;
    var tokenAddress = token;
    var amountSendToWalletsArray = [];

    var abiArray =[
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
    ]


    var contract = new web3.eth.Contract(abiArray, tokenAddress, {
        from: senderAddress
    });


    var balance = await contract.methods.balanceOf(senderAddress).call();
    console.log(`Balance before send: ${web3.utils.fromWei(balance)} \n------------------------`);
    // var decimals = await contract.methods.decimals().call();
    // console.log('decimals', decimals);

    if (balance <= 0) {
        console.log(`No balance enough`);
        return;
    }

    if (wallets === undefined || wallets.length === 0 ) {
        console.log(`not wallets to transfer`);
        return;
    }

    wallets.forEach(w => {
        amountSendToWalletsArray.push({
            wallet: w.wallet,
            amount: web3.utils.toWei(Math.floor(web3.utils.fromWei(balance) * w.percentage).toString(), 'ether')
        })
    });

    console.log(`Amounts to send : ${JSON.stringify(amountSendToWalletsArray)} \n------------------------`);
    
    let nonceIndex = 13;

    for (const w of wallets) {
        nonceResponse = await web3.eth.getTransactionCount(senderAddress);
        const amountTokenToSend = amountSendToWalletsArray.find(e => e.wallet === w.wallet).amount;
        var nonce = nonceResponse + nonceIndex;
        var gasPrice = 10 * 1e9; // 1 y 9 ceros -> 1000000000
        let estimateGas = await web3.eth.estimateGas({
            value: '0x0', // Only tokens
            data: contract.methods.transfer(w.wallet, amountTokenToSend).encodeABI(),
            from: senderAddress,
            to: tokenAddress
        });
        console.log({
            estimateGas: estimateGas
        });

        var txParams = {
            gas: web3.utils.toHex(Math.trunc(estimateGas * 1.10)),
            gasLimit: web3.utils.toHex(Math.trunc(estimateGas * 1.10)),
            gasPrice: web3.utils.toHex(gasPrice),
            chainId: chainId,
            data: contract.methods.transfer(w.wallet,amountTokenToSend).encodeABI(),
            from: senderAddress,
            to: tokenAddress,
        };
        
        console.log('txParams', txParams);
        var signedTx = await web3.eth.accounts.signTransaction(txParams, senderPrivateKey);

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('receipt tx', receipt);

        balanceAfter = await contract.methods.balanceOf(senderAddress).call();
        console.log(`Balance after send: ${web3.utils.fromWei(balanceAfter)} \n------------------------`);
        nonceIndex += 1;
    }

    return true
}


exports.transferToWallets = transferToWallets;

// // ======================== TESTING ========================

// var web3 = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545'));
// var node = process.env.node;
// var web3 = new Web3(new Web3.providers.HttpProvider(node));
// chainId = 56;
// transferToWallets(web3, chainId, process.env.tokenAddress)

// // ======================== TESTING ========================

