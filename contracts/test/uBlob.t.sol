// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {Test, console2} from "forge-std/Test.sol";
import {uBlob} from "../src/uBlob.sol";

contract uBlobTest is Test {

    event Credit(address indexed creditee, uint256 amount);

    function test_forwardEther(uint256 amount) public {
        amount = bound(amount, 0.000001 ether, 100000 ether);

        address payable receiver = payable(makeAddr("ublob.receiver"));
        address payable ublob = payable(address(new uBlob(receiver)));

        address creditee = makeAddr("creditee");
        vm.deal(creditee, amount);

        vm.startPrank(creditee);
        vm.expectEmit(true, true, true, true);
        emit Credit(creditee, amount);
        (bool success, ) = ublob.call{value: amount}("");
        assertTrue(success);
        assertEq(receiver.balance, amount);
    }
}
