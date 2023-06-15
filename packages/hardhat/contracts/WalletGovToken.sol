// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WalletGovToken is ERC20, Ownable {
    event SignerUpdate(
        address registrarAddress,
        uint256 registrarNewWeight,
        address newSignerAddress,
        uint256 newSignerWeight,
        uint256 timestamp
    );

    constructor(uint256 _totalSupply) ERC20("WalletGovToken", "WGT") {
        super._mint(msg.sender, _totalSupply);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override onlyOwner returns (bool) {
        bool retVal = super.transferFrom(from, to, amount);
        emit SignerUpdate(
            from,
            this.balanceOf(from),
            to,
            this.balanceOf(to),
            block.timestamp
        );
        return retVal;
    }

    bool transferCalled;

    // Allowed to be called only once for setup purposes.
    function transfer(
        address to,
        uint256 amount
    ) public override onlyOwner returns (bool) {
        if (!transferCalled) {
            transferCalled = true;
            return super.transfer(to, amount);
        } else revert("WalletGovToken does not support direct transfers.");
    }

    // Approvals can only be given to the MultiSig wallet. Should only be used when
    // proposing a new member.
    function allowance(
        address from,
        address
    ) public view virtual override returns (uint256) {
        return super.allowance(from, owner());
    }

    function allowance() public view virtual returns (uint256) {
        return super.allowance(msg.sender, owner());
    }

    function approve(
        address,
        uint256 amount
    ) public virtual override returns (bool) {
        return this.approve(amount);
    }

    function approve(uint256 amount) public virtual returns (bool) {
        _approve(msg.sender, owner(), amount);
        return true;
    }
}
