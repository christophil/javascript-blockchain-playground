const SHA256 = require('crypto-js/sha256');

class Transaction{
    constructor(fromAddress, toAddress, amount, label = ''){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
        this.label = label;
        this.hash = SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp + this.label).toString();
    }
}

class Block{
    constructor(index, timestamp, transaction, previousHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transaction) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

class Blockchain{

    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
        this.miningReward = 50;
        this.pendingTransactions = [];
        this.defaultMiningRewardAddress = "0";
    }

    createGenesisBlock(){
        return new Block(0, Date.now(), new Transaction("0", "0", 100000), "0");
    }

    getLastestBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransaction(miningRewardAddress){

        let pendingTransactionsHashList = [];

        this.pendingTransactions.forEach((transaction) => {
            pendingTransactionsHashList.push(transaction.hash);
        });

        console.log("Pending transactions list : ", pendingTransactionsHashList.join(','));

        let transactionToMine = this.pendingTransactions.splice(0, 1)[0];

        console.log("Transaction selected to mine : " + transactionToMine.hash);

        let block = new Block(-1, Date.now(), transactionToMine);
        this.addBlock(block);

        let miningRewardBlock = new Block(-1, Date.now(), new Transaction(this.defaultMiningRewardAddress, miningRewardAddress, this.miningReward, "Mining reward"));
        this.addBlock(miningRewardBlock);

    }


    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
           if(block.transaction.fromAddress === address){
                balance -= block.transaction.amount;
           }
           else if(block.transaction.toAddress === address){
                balance += block.transaction.amount;
           }
        }

        console.log("Balance of '" + address +"'=" + balance);
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLastestBlock().hash;
        newBlock.index = this.getLastestBlock().index + 1;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    showBlockchain(){
        console.log(JSON.stringify(this, null, 4));
    }

    isBlockchainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i -1];

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        return true;
    }

    showIsBlockchainValid(){
        console.log((this.isBlockchainValid())?'Blockchain is valid':'Blockchain is not valid');
    }
}

let coinChain = new Blockchain();

coinChain.createTransaction(new Transaction('address1', 'address2', 100));
coinChain.createTransaction(new Transaction('address2', 'address1', 20));

coinChain.minePendingTransaction("minerAddress");
coinChain.minePendingTransaction("minerAddress");

coinChain.showBlockchain();
coinChain.showIsBlockchainValid();
coinChain.getBalanceOfAddress("minerAddress");
coinChain.getBalanceOfAddress("address1");
coinChain.getBalanceOfAddress("address2");


