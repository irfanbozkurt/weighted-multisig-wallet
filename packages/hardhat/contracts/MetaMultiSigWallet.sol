// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./WalletGovToken.sol";

contract MetaMultiSigWallet {
    using ECDSA for bytes32;

    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event ExecuteTransaction(
        address indexed owner,
        address payable to,
        uint256 value,
        bytes data,
        uint256 nonce,
        bytes32 hash,
        bytes result
    );

    uint256 public quorumPerMillion;
    uint256 public nonce;
    uint256 public chainId;

    WalletGovToken public govToken;
    uint256 public constant govTokenSupply = 1000000;

    modifier onlySelf() {
        // require(msg.sender == address(this), "Not Self");
        _;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    constructor(uint256 _chainId, uint256 _quorumPerMillion) {
        require(
            _quorumPerMillion > 0,
            "constructor: must be non-zero sigs required"
        );
        quorumPerMillion = _quorumPerMillion;

        chainId = _chainId;

        govToken = new WalletGovToken(govTokenSupply);
        govToken.transfer(msg.sender, govTokenSupply);
    }

    function transferWeight(
        address ref,
        address recipient,
        uint256 givenSupply
    ) public payable onlySelf {
        require(recipient != address(0), "transferWeight: zero address");
        require(
            givenSupply > 0,
            "You must give at least 1 governance tokens to the newcomer."
        );
        govToken.transferFrom(ref, recipient, givenSupply);
    }

    function updateQuorumPerMillion(
        uint256 newquorumPerMillion
    ) public payable onlySelf {
        require(
            newquorumPerMillion > 0,
            "updateQuorumPerMillion: must be non-zero sigs required"
        );
        quorumPerMillion = newquorumPerMillion;
    }

    function getMe() external view returns (address) {
        return msg.sender;
    }

    function executeTransaction(
        address payable _receiver,
        uint256 _value,
        bytes memory _calldata,
        bytes[] memory signatures
    ) public returns (bytes memory) {
        require(hasWeight(), "executeTransaction: only owners can execute");
        bytes32 _hash = getTransactionHash(nonce, _receiver, _value, _calldata);
        nonce++;
        uint256 totalWeight;
        address duplicateGuard;
        for (uint256 i = 0; i < signatures.length; i++) {
            address recovered = recover(_hash, signatures[i]);
            require(
                recovered > duplicateGuard,
                "executeTransaction: duplicate or unordered signatures"
            );
            duplicateGuard = recovered;

            totalWeight += govToken.balanceOf(recovered);
            if (totalWeight >= quorumPerMillion) break;
        }

        require(
            totalWeight >= quorumPerMillion,
            "executeTransaction: not enough valid signatures"
        );

        (bool success, bytes memory result) = _receiver.call{value: _value}(
            _calldata
        );
        require(success, "call failed");

        emit ExecuteTransaction(
            msg.sender,
            _receiver,
            _value,
            _calldata,
            nonce - 1,
            _hash,
            result
        );
        return result;
    }

    function getTransactionHash(
        uint256 _nonce,
        address to,
        uint256 value,
        bytes memory _calldata
    ) public view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    address(this),
                    chainId,
                    _nonce,
                    to,
                    value,
                    _calldata
                )
            );
    }

    function recover(
        bytes32 _hash,
        bytes memory _signature
    ) public pure returns (address) {
        return _hash.toEthSignedMessageHash().recover(_signature);
    }

    function hasWeight() public view returns (bool) {
        return govToken.balanceOf(msg.sender) > 0;
    }

    //  Streaming stuff

    // event OpenStream(address indexed to, uint256 amount, uint256 frequency);
    // event CloseStream(address indexed to);
    // event Withdraw(address indexed to, uint256 amount, string reason);

    // struct Stream {
    //     uint256 amount;
    //     uint256 frequency;
    //     uint256 last;
    // }

    // mapping(address => Stream) public streams;

    // function streamWithdraw(uint256 amount, string memory reason) public {
    //     require(streams[msg.sender].amount > 0, "withdraw: no open stream");
    //     _streamWithdraw(payable(msg.sender), amount, reason);
    // }

    // function _streamWithdraw(
    //     address payable to,
    //     uint256 amount,
    //     string memory reason
    // ) private {
    //     uint256 totalAmountCanWithdraw = streamBalance(to);
    //     require(totalAmountCanWithdraw >= amount, "withdraw: not enough");
    //     streams[to].last =
    //         streams[to].last +
    //         (((block.timestamp - streams[to].last) * amount) /
    //             totalAmountCanWithdraw);
    //     emit Withdraw(to, amount, reason);
    //     to.transfer(amount);
    // }

    // function streamBalance(address to) public view returns (uint256) {
    //     return
    //         (streams[to].amount * (block.timestamp - streams[to].last)) /
    //         streams[to].frequency;
    // }

    // function openStream(
    //     address to,
    //     uint256 amount,
    //     uint256 frequency
    // ) public onlySelf {
    //     require(streams[to].amount == 0, "openStream: stream already open");
    //     require(amount > 0, "openStream: no amount");
    //     require(frequency > 0, "openStream: no frequency");

    //     streams[to].amount = amount;
    //     streams[to].frequency = frequency;
    //     streams[to].last = block.timestamp;

    //     emit OpenStream(to, amount, frequency);
    // }

    // function closeStream(address payable to) public onlySelf {
    //     require(streams[to].amount > 0, "closeStream: stream already closed");
    //     _streamWithdraw(to, streams[to].amount, "stream closed");
    //     delete streams[to];
    //     emit CloseStream(to);
    // }
}
