# **SentinelChain** - A Blockchain-Augmented SIEM for Immutable Forensic Integrity

**SentinelChain** is an advanced security architecture that integrates **Wazuh SIEM** with a **decentralized private ledger (Hardhat)** to ensure the absolute integrity of security logs. By leveraging the immutability of blockchain technology, SentinelChain prevents "log-clearing" attacks, providing a cryptographically verifiable audit trail for critical security events.

**The Problem**

In modern cyber-attacks, sophisticated actors often modify or delete local system logs after a breach to evade detection. Standard SIEM solutions remain vulnerable if the centralized log management server is compromised.

The Solution (Core Features)
1. **Immutable Forensic Logging**: High-severity alerts from Wazuh are hashed using SHA-256 and anchored to a local blockchain, making them impossible to alter or delete.

2. **Passwordless Ecosystem**: Integrated with Windows Hello for Business and TPM 2.0 to eliminate credential-based attack vectors.

3. **Automated Response & Verification**: An Express.js middleware acts as an "Oracle," parsing real-time telemetry and triggering on-chain events for automated incident mitigation.

4. **Cryptographic Validation**: A React-based dashboard allows security auditors to verify the integrity of any log artifact by comparing its current state against its on-chain digital twin.


**Technical Stack**

1. **Security Orchestration**: Wazuh (Manager & Agents), Kali Linux, Active Directory.

2. **Blockchain Infrastructure**: Solidity, Hardhat, Ethers.js.

3. **Middleware**: Node.js, Express.js (RESTful API Bridge).

4. **Frontend**: React.js, Tailwind CSS (Real-time Monitoring).




/sentinelchain (Root Folder)
├── /blockchain (Hardhat Project)
│   ├── /contracts       <-- Your Solidity code (SecurityLedger.sol)
│   ├── /scripts         <-- Deployment scripts
│   ├── /test            <-- Smart contract tests
│   └── hardhat.config.js
│
├── /server (Express.js - The Bridge)
│   ├── /routes          <-- API endpoints (e.g., /wazuh-webhook)
│   ├── /controllers     <-- Logic for hashing logs & talking to Hardhat
│   ├── /utils           <-- Helper functions (SHA-256 hashing)
│   └── index.js         <-- Main server entry point
│
├── /frontend (React App)
│   ├── /src
│   │   ├── /components  <-- UI parts (LogTable, AlertPopup)
│   │   ├── /hooks       <-- Custom hooks for Ethers.js
│   │   └── App.js       <-- Main page
│   └── package.json
│
├── .gitignore
└── README.md


3. What to add in the Smart Contract
Keep your contract simple. Storing data on-chain is expensive (or heavy), so only store the "fingerprint" of the log.

Log Struct: A data structure to hold the agentID, timestamp, alertLevel, and a messageHash (the SHA-256 hash of the full log).

Mapping: A way to look up logs by their unique Wazuh ID.

storeLog Function: This takes the alert details and saves them. Use the onlyOwner modifier so only your Express server can add logs.

verifyLog Function: A function that takes a full log string from the user, hashes it, and checks if it matches the hash stored on-chain.

Events: Emit an AlertTriggered event whenever a high-level alert (Level 12+) is saved. Your frontend can listen for this to show a "Red Alert" popup.

4. What to add in the Express Server
This is where the "brain" of your automation lives.

Ingestion Route: A POST endpoint (e.g., /api/wazuh) that receives the JSON you shared earlier.

Data Parsing: It should extract only the parts you need (like rule.description and rule.level).

Hashing Logic: Use a library like crypto to create a hash of the original message. This is what you send to the contract.

Ethers.js Integration: Use your Hardhat private key to sign and send the transaction to the local blockchain.

Alerting Logic: If the level is high, the server can trigger a "Next Step"—like sending a message to a Discord/Slack bot or calling an Ansible playbook to lock a VM.




1. The Smart Contract Data Structure
You need a Smart Contract to act as your "Immutable Ledger." It should store only the most important parts of the Wazuh message to save on gas/storage costs.

What to store on-chain:

Log ID: The unique ID from Wazuh (id).

Timestamp: When the event happened.

Alert Level: The severity (rule.level).

Description: What happened (e.g., "Successful sudo to ROOT").

Source Agent: Which computer the alert came from.

Hash of Full Log: Instead of storing the whole giant JSON, store a SHA-256 hash of it. This proves the log hasn't been tampered with.

2. On-Chain Alerting Logic
You can put some logic inside the Smart Contract to handle "Alerting." This makes the response automated and decentralized.

Severity Threshold: Create a function that triggers an "Event" on the blockchain if the rule.level is higher than 7 (high risk).

Critical Action Flag: If the full_log contains specific keywords (like pkill, rm -rf, or Mimikatz), the contract can emit a "CriticalAlert" signal.

Automation Trigger: Your Ansible playbooks can "listen" to the blockchain. When they see a "CriticalAlert" event, they automatically run a script to lock the user account or isolate the VM.

3. The Backend Flow (The "Bridge")
You need a small script (Node.js or Python) to act as the bridge between Wazuh and the Blockchain.

Parse: Receive the JSON you shared. Extract the body.message string and convert it to an object.

Filter: Don't send everything. Only send alerts with level 3 or higher to the blockchain.

Hash: Take the entire original message string and create a hash.

Transaction: Call your Smart Contract function (e.g., storeLog(...)) using a library like Ethers.js or Web3.js.

4. Verification System (For Step 3 of your plan)
To "Verify log artifacts using blockchain," you need a simple UI or script that does this:

Takes a log file from the Ubuntu server.

Calculates its hash.

Asks the Blockchain: "What is the hash stored for Log ID 1765616984?"

If the hashes match, the log is Valid. If they don't match, an attacker likely edited the logs to hide their tracks.





1. Implementation Steps (Simple Guide)
**Step 1: Data Ingestion & Hashing (The Bridge)**
Set up your Express server to act as a listener. When Wazuh fires an alert, the server:

Receives the JSON body.

Filters for high-level alerts (e.g., Level 7+).

Uses the crypto library to create a SHA-256 hash of the entire message string. This hash is your "digital fingerprint."

**Step 2: On-Chain Commitment (Hardhat)**
Deploy your Solidity contract to the local Hardhat network. The Express server then:

Calls the contract’s storeLog function using Ethers.js.

Passes the Wazuh ID, alert level, and the hash.

The contract records these, automatically attaching a blockchain timestamp that can't be faked.

**Step 3: Forensic Report Generation (PDF)**
Add a "Generate Report" button in your React dashboard.

When clicked, the frontend sends the log ID to the Express server.

The server uses a library like jspdf or pdfkit to create a document.

Crucially: The PDF must include the Transaction Hash and the On-Chain Log Hash to prove the report is backed by the blockchain.

**Step 4: Verification Logic (The Audit)**
Create a "Verify" page in React.

The user uploads a log file or pastes a log message.

The system hashes it and compares it to the hash stored on the blockchain.

If they match, a "Verified: Chain of Custody Intact" badge appears.

2. Expected Outcomes (What you get)
By the end of this project, you will have a working system that provides:

**Immutable Evidence Log**: A list of security alerts that no attacker—even with "Root" access—can delete or modify.

**Tamper Detection**: Immediate proof if someone tries to edit the original Wazuh logs.

**Automated Incident Timeline**: A cryptographically timestamped sequence of events for forensic reconstruction.

**Court-Ready Documentation**: PDF reports that link digital evidence directly to a blockchain transaction.

3. Final Project Feature List
This is the list you can put in your project report to show the "full scope" of your work:

Core Security Features
**SIEM Integration**: Real-time ingestion of Wazuh security telemetry.

**Blockchain Anchoring**: Every critical alert is permanently committed to a decentralized ledger.

**SHA-256 Integrity Verification**: Mathematical proof of data consistency.

**Passwordless AD Environment**: Practical implementation of modern authentication to reduce the attack surface.

Forensic & Novel Features

**Cryptographic Chain of Custody**: Tracks the log from the moment it is generated by a Windows/Ubuntu agent.

**Multi-Role Certification: (Optional)** Requires an "Auditor" signature to verify the forensic validity of an alert.

**Automated Forensic PDF Reports**: Generates official evidence documents with embedded blockchain metadata.

**"Evidence Lockdown" Automation**: Ansible playbooks that trigger upon high-severity alerts to preserve system state (disk/RAM snapshots).



npx hardhat compile

npx hardhat run scripts/deploy.js --network localhost


  Contract deployment: SentinelChain
  Contract address:    0x5fbdb2315678afecb367f032d93f642f64180aa3
  Transaction:         0xa88d9587ef0f00a0c0eb43dca7d717b5c7acef86b85bffc389d46aa15f9c81f4
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  Value:               0 ETH 
  Gas used:            1288960 of 16777216
  Block #1:            0x432076b7355b3ad466d95b89ef3c6383e8e53e635c9091838f34a8a6af784e53
