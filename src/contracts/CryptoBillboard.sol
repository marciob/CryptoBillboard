// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoBillboard{
    // Payable address to receive Ether
    address payable public owner;

    // Payable constructor to set address to receive Ether
    constructor() payable {
        owner = payable(msg.sender);
    }
    
    // Function to withdraw all Ether from this contract.
    function withdraw() public {
        require(msg.sender == owner, "You are not allowed");
        // get the amount of Ether stored in this contract
        uint amount = address(this).balance;

        // send all Ether to owner
        // Owner can receive Ether since the address of owner is payable
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Failed to send Ether");
    }
    
    //headline storage
    string public billboardText;
    
    //latest price storage
    uint public latestPrice;
    
    //event for new text headline
    event newTextEvent(string eventOutput);
    
    //event for new price
    event newPrice(uint eventOutput);
    
    function newHeadline(string memory myText)public payable{
        //the value need to be higher than the latest price
        require(msg.value > latestPrice);
        
        billboardText = myText;
        latestPrice = msg.value;
        
        emit newTextEvent(myText);
        emit newPrice(latestPrice);
    }
    
    function getHeadline() public view returns(string memory){
        return billboardText;
    }
    
    function getContractBalance() public view returns(uint){
        uint amount = address(this).balance;
        return amount;
    }
}
