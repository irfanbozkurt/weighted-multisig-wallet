import { useState, useEffect } from "react";

/*
  ~ What it does? ~

  Enables you to keep track of events 

  ~ How can I use? ~

  const setPurposeEvents = useEventListener(readContracts, "YourContract", "SetPurpose", localProvider, 1);

  ~ Features ~

  - Provide readContracts by loading contracts (see more on ContractLoader.js)
  - Specify the name of the contract, in this case it is "YourContract"
  - Specify the name of the event in the contract, in this case we keep track of "SetPurpose" event
  - Specify the provider 
*/

export default function useEventListener(contracts, walletContractName, eventName, provider, startBlock, args) {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    if (typeof provider !== "undefined" && typeof startBlock !== "undefined") {
      // if you want to read _all_ events from your contracts, set this to the block number it is deployed
      provider.resetEventsBlock(startBlock);
    }
    if (contracts && walletContractName && contracts[walletContractName]) {
      try {
        contracts[walletContractName].on(eventName, (...args) => {
          let blockNumber = args[args.length - 1].blockNumber;
          setUpdates(messages => [Object.assign({ blockNumber }, args.pop().args), ...messages]);
        });
        return () => {
          contracts[walletContractName].removeListener(eventName);
        };
      } catch (e) {
        console.log(e);
      }
    }
  }, [provider, startBlock, contracts, walletContractName, eventName]);

  return updates;
}
