import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SimpleStorage_abi from "../contractAbi.json";

export default function CryptoBillboard() {

    // contract to interact with
    const contractAddress = "0x2F2672E8b57e66234a6c50c8c3EdFEf67cC88336";

    const [errorMessage, setErrorMessage] = useState(null);     // error message if wallet no connected
    const [defaultAccount, setDefaultAccount] = useState(null);     // wallet address that is connected
    const [connectButtonText, setConnectButton] = useState("Connect Wallet");       // button message when connected/disconnected

    const [currentContractVal, setCurrentContractVal] = useState(null);     // contract value message

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

    // connect wallet to the web dapp
    const connectWalletHandler = () => {
        console.log("connectWalletHandler was called")
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(result => {
                    accountChangedHandler(result[0]);
                    setConnectButton("Connected");
                })

            setErrorMessage(null);
        } else {
            console.log('Need to install MetaMask');
            setErrorMessage('Please install MetaMask browser extension to interact with the smart contract (connectWalletHandler)');
        }
    }

    // verify a new address connected to the contract
    const accountChangedHandler = (newAccount) => {
        console.log("accountChangedHandler was called")
        setDefaultAccount(newAccount);
        updateEthers();
    }

    const chainChangedHandler = () => {
        // reload the page to avoid any errors with chain change mid use of application
        console.log("chainChangedHandler was called")

        window.location.reload();
    }

    // listen for account and chain changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', accountChangedHandler);

        window.ethereum.on('chainChanged', chainChangedHandler);
    }

    // connect Etherjs to: provider, signer and contract
    const updateEthers = () => {

        // code to test
        // const infuraProvider = new ethers.providers.InfuraProvider("rinkeby", "44be7d94cf5942f0a9864be036c606f1");
        // const wallet = new ethers.Wallet(privateKey, infuraProvider);
        // const signer = wallet.connect(infuraProvider);
        // contract = new ethers.Contract(contractAddress, SimpleStorage_abi, signer);

        // let tempProvider = new ethers.providers.InfuraProvider("rinkeby", "44be7d94cf5942f0a9864be036c606f1");
        // setProvider(tempProvider);

        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);

        let tempSigner = tempProvider.getSigner();
        setSigner(tempSigner);

        let tempContract = new ethers.Contract(contractAddress, SimpleStorage_abi, tempSigner);
        setContract(tempContract);

        console.log("updateEthers was called, tempProvider: ", tempProvider);
        console.log("updateEthers was called, tempSigner: ", tempSigner);
        console.log("updateEthers was called, tempContract: ", tempContract);
    }



    // call "set" function in the contract to set a new input to the contract
    const setHandler = async (event) => {
        console.log("setHandler was called")

        if (window.ethereum && defaultAccount != null) {
            event.preventDefault();
            console.log('Data sent to the contract: ' + event.target.setText.value);
            contract.newHeadline(event.target.setText.value);
            const transaction = await contract.newHeadline({
                value: ethers.utils.parseEther("0.01")
            })
            //sends 0.1 eth
            await transaction.wait()
            setErrorMessage(null);

        } if (window.ethereum && defaultAccount == null) {
            event.preventDefault();
            console.log('Need to connect your wallet');
            setErrorMessage('Please connect your wallet');

        } else {
            event.preventDefault();
            console.log('Need to install MetaMask');
            setErrorMessage('Please install MetaMask browser extension to interact with the smart contract (setHandler)');
        }
    }

    console.log("current value", currentContractVal);

    useEffect(() => {
        (async function () {

            try {
                console.log("getCurrentVal was called")

                if (window.ethereum && defaultAccount != null) {

                    let val = await contract.getHeadline();
                    setCurrentContractVal(val);
                    setErrorMessage(null);

                } else if (window.ethereum && defaultAccount == null) {

                    console.log('Need to connect your wallet');
                    setErrorMessage('Please connect your wallet');

                }
            } catch (e) {
                console.error(e);
            }
        }
        )();
    });

    return (
        <div>

            <button id="walletButton" className="buttonStyle" onClick={connectWalletHandler}>{connectButtonText}</button>


            <div className="pageTitle">
                <h3>
                    The official Billboard of crypto
                </h3>
            </div>

            <div className="addressDisplay">
                <h3>Address: {defaultAccount}</h3>
            </div>

            <div className="errorDisplay">
                {errorMessage}
            </div>

            {/* <button onClick={getCurrentVal} className="buttonStyle">Get Current Value</button>
            <div><br /></div> */}

            <div className="box1">
                <p className="insideText">{currentContractVal}</p>
            </div>

            <form onSubmit={setHandler}>
                <div className="textBox">
                    <input id="setText" type="text" />
                </div>
                <div id="setButton" ><button type={"submit"} className="buttonStyle">Place my text</button></div>
            </form>

            <div><br /></div>

        </div>
    )
}
