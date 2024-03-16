// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {uBlob} from "../src/uBlob.sol";

contract CounterScript is Script {

    function run() public {
        vm.broadcast();
        uBlob ublob = new uBlob(payable(address(msg.sender)));
        console2.log("uBlob deployed at", address(ublob));
    }
}
