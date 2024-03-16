// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

contract uBlob {

    event Credit(address indexed creditee, uint256 amount);
    
    error Invalid();

    address payable public receiver;

    constructor(address payable _receiver) {
        receiver = _receiver;
    }

    receive() external payable {
        (bool success, ) = receiver.call{value: msg.value}("");
        if (!success) revert Invalid();
        emit Credit(msg.sender, msg.value);
    }

}
