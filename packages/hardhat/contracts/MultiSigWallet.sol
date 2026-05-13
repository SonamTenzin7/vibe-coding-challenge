// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiSigWallet {
    event Deposit(address indexed sender, uint amount);
    event TransactionSubmitted(uint indexed txIndex, address indexed to, uint value, bytes data);
    event TransactionApproved(uint indexed txIndex, address indexed owner);
    event ApprovalRevoked(uint indexed txIndex, address indexed owner);
    event TransactionExecuted(uint indexed txIndex);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event ThresholdChanged(uint newThreshold);

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
    }

    address[] public owners;
    uint public threshold;
    mapping(address => bool) public isOwner;
    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public approved;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier onlyWallet() {
        require(msg.sender == address(this), "not wallet");
        _;
    }

    modifier txExists(uint txIndex) {
        require(txIndex < transactions.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint txIndex) {
        require(!transactions[txIndex].executed, "already executed");
        _;
    }

    constructor() {
        owners.push(msg.sender);
        isOwner[msg.sender] = true;
        threshold = 1;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submitTransaction(address to, uint value, bytes calldata data) external onlyOwner {
        uint txIndex = transactions.length;
        transactions.push(Transaction({ to: to, value: value, data: data, executed: false, numConfirmations: 0 }));
        emit TransactionSubmitted(txIndex, to, value, data);
    }

    function approveTransaction(uint txIndex) external onlyOwner txExists(txIndex) notExecuted(txIndex) {
        require(!approved[txIndex][msg.sender], "already approved");
        approved[txIndex][msg.sender] = true;
        transactions[txIndex].numConfirmations += 1;
        emit TransactionApproved(txIndex, msg.sender);
    }

    function revokeApproval(uint txIndex) external onlyOwner txExists(txIndex) notExecuted(txIndex) {
        require(approved[txIndex][msg.sender], "not approved");
        approved[txIndex][msg.sender] = false;
        transactions[txIndex].numConfirmations -= 1;
        emit ApprovalRevoked(txIndex, msg.sender);
    }

    function executeTransaction(uint txIndex) external onlyOwner txExists(txIndex) notExecuted(txIndex) {
        require(transactions[txIndex].numConfirmations >= threshold, "not enough approvals");
        transactions[txIndex].executed = true;
        (bool success, ) = transactions[txIndex].to.call{ value: transactions[txIndex].value }(
            transactions[txIndex].data
        );
        require(success, "tx failed");
        emit TransactionExecuted(txIndex);
    }

    function addOwner(address newOwner) external onlyWallet {
        require(newOwner != address(0), "invalid address");
        require(!isOwner[newOwner], "already owner");
        isOwner[newOwner] = true;
        owners.push(newOwner);
        emit OwnerAdded(newOwner);
    }

    function removeOwner(address owner) external onlyWallet {
        require(isOwner[owner], "not owner");
        require(owners.length - 1 >= threshold, "would drop below threshold");
        isOwner[owner] = false;
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        emit OwnerRemoved(owner);
    }

    function changeThreshold(uint newThreshold) external onlyWallet {
        require(newThreshold >= 1 && newThreshold <= owners.length, "invalid threshold");
        threshold = newThreshold;
        emit ThresholdChanged(newThreshold);
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getTransaction(uint txIndex) external view returns (address to, uint value, bytes memory data, bool executed, uint numConfirmations) {
        Transaction storage t = transactions[txIndex];
        return (t.to, t.value, t.data, t.executed, t.numConfirmations);
    }

    function getTransactionCount() external view returns (uint) {
        return transactions.length;
    }
}
