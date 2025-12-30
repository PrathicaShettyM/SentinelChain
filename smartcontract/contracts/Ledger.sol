// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SentinelChain
 * @author SentinelChain Project
 * @notice Immutable forensic ledger for Wazuh SIEM alerts
 */
contract SentinelChain {

    /* ------------------------------------------------------------------
       OWNER LOGIC
    ------------------------------------------------------------------ */
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /* ------------------------------------------------------------------
       DATA STRUCTURE
    ------------------------------------------------------------------ */

    struct LogEntry {
        string agentId;        // Source system (Wazuh agent)
        uint256 timestamp;     // When the alert occurred
        uint8 alertLevel;      // Severity level
        bytes32 messageHash;   // SHA-256 hash of full log
        string description;    // Short alert description
        bool exists;           // Prevent overwrites
    }

    // Mapping: Wazuh Log ID -> LogEntry
    mapping(string => LogEntry) private logs;

    /* ------------------------------------------------------------------
       EVENTS (USED BY FRONTEND & AUTOMATION)
    ------------------------------------------------------------------ */

    // Fired for high-severity alerts
    event AlertTriggered(
        string indexed logId,
        string agentId,
        uint8 alertLevel,
        uint256 timestamp
    );

    // Fired for extremely dangerous activity
    event CriticalAlert(
        string indexed logId,
        string keyword,
        uint256 timestamp
    );

    /* ------------------------------------------------------------------
       CORE FUNCTION: STORE LOG
    ------------------------------------------------------------------ */

    /**
     * @notice Store a Wazuh alert fingerprint on-chain
     */
    function storeLog(
        string calldata logId,
        string calldata agentId,
        uint8 alertLevel,
        string calldata description,
        bytes32 messageHash,
        string calldata rawMessage
    ) external onlyOwner {

        require(!logs[logId].exists, "Log already exists");

        logs[logId] = LogEntry({
            agentId: agentId,
            timestamp: block.timestamp,
            alertLevel: alertLevel,
            messageHash: messageHash,
            description: description,
            exists: true
        });

        // Emit alert event for high-severity alerts
        if (alertLevel >= 7) {
            emit AlertTriggered(
                logId,
                agentId,
                alertLevel,
                block.timestamp
            );
        }

        // Detect critical attack keywords
        if (
            _contains(rawMessage, "rm -rf") ||
            _contains(rawMessage, "mimikatz") ||
            _contains(rawMessage, "pkill")
        ) {
            emit CriticalAlert(
                logId,
                "CRITICAL_COMMAND_DETECTED",
                block.timestamp
            );
        }
    }

    /* ------------------------------------------------------------------
       VERIFICATION FUNCTION
    ------------------------------------------------------------------ */

    /**
     * @notice Verify a log by hashing and comparing with blockchain
     */
    function verifyLog(
        string calldata logId,
        string calldata fullLog
    ) external view returns (bool) {

        require(logs[logId].exists, "Log not found");

        bytes32 calculatedHash = sha256(bytes(fullLog));
        return calculatedHash == logs[logId].messageHash;
    }

    /* ------------------------------------------------------------------
       READ-ONLY FUNCTION (AUDIT USE)
    ------------------------------------------------------------------ */

    function getLog(string calldata logId)
        external
        view
        returns (
            string memory agentId,
            uint256 timestamp,
            uint8 alertLevel,
            bytes32 messageHash,
            string memory description
        )
    {
        require(logs[logId].exists, "Log not found");

        LogEntry memory log = logs[logId];
        return (
            log.agentId,
            log.timestamp,
            log.alertLevel,
            log.messageHash,
            log.description
        );
    }

    /* ------------------------------------------------------------------
       INTERNAL HELPER FUNCTION
    ------------------------------------------------------------------ */

    function _contains(string memory text, string memory keyword)
        internal
        pure
        returns (bool)
    {
        bytes memory textBytes = bytes(text);
        bytes memory keywordBytes = bytes(keyword);

        if (keywordBytes.length > textBytes.length) return false;

        for (uint i = 0; i <= textBytes.length - keywordBytes.length; i++) {
            bool matchFound = true;

            for (uint j = 0; j < keywordBytes.length; j++) {
                if (textBytes[i + j] != keywordBytes[j]) {
                    matchFound = false;
                    break;
                }
            }

            if (matchFound) return true;
        }

        return false;
    }
}
