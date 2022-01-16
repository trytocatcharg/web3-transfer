# web3-transfer
This script allow you to send a percentage of your token to a list of wallets


<h1 align="center">token transfer to a list of wallet</h1>


### Installation Instructions

Create (update) a file calle wallets.json with the following format:

```
 [
  {
   "wallet": "addresss 1",
   "percentage": "0.5"
  },
  {
   "wallet": "addresss 2",
   "percentage": "0.5"
  }
 ]
```

Create (update) the .env file with the following key properties:

- senderPrivateKey: The [private key](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key) of your wallet. 


Just run: 
```
npm install

// web3 instance
// chainId for bsc -> 56 mainnet | 97 testnet
// node for bsc -> https://bsc-dataseed.binance.org/ mainnet |  https://data-seed-prebsc-1-s1.binance.org:8545 testnet
// the token you want to transfer
transferToWallets(web3,chainId, token)
```
