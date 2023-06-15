
export default parseTransaction(readContracts, walletContractName, transactionData){
    const transactionInfo = readContracts[walletContractName].interface.parseTransaction(transactionData);

    const {name, payable, stateMutability, type, inputs, args} = transactionInfo.functionFragment;
    


}