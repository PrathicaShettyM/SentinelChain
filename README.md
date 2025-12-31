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



1. The Smart Contract Data Structure
You need a Smart Contract to act as your "Immutable Ledger." It should store only the most important parts of the Wazuh message to save on gas/storage costs.

What to store on-chain:

- `Log ID`: The unique ID from Wazuh (id).
- `Timestamp`: When the event happened.
- `Alert Level`: The severity (rule.level).
- `Description`: What happened (e.g., "Successful sudo to ROOT").
- `Source Agent`: Which computer the alert came from.
- `Hash of Full Log`: Instead of storing the whole giant JSON, store a SHA-256 hash of it. This proves the log hasn't been tampered with.

2. On-Chain Alerting Logic
You can put some logic inside the Smart Contract to handle "Alerting." This makes the response automated and decentralized.

- **Severity Threshold**: Create a function that triggers an "Event" on the blockchain if the rule.level is higher than 7 (high risk).

- **Critical Action Flag**: If the full_log contains specific keywords (like pkill, rm -rf, or Mimikatz), the contract can emit a "CriticalAlert" signal.

- **Automation Trigger**: Your Ansible playbooks can "listen" to the blockchain. When they see a "CriticalAlert" event, they automatically run a script to lock the user account or isolate the VM.

3. The Backend Flow (The "Bridge")
You need a small script (Node.js or Python) to act as the bridge between Wazuh and the Blockchain.

- **Parse**: Receive the JSON you shared. Extract the body.message string and convert it to an object.

- **Filter**: Don't send everything. Only send alerts with level 3 or higher to the blockchain.

- **Hash**: Take the entire original message string and create a hash.

- **Transaction**: Call your Smart Contract function (e.g., storeLog(...)) using a library like Ethers.js or Web3.js.

4. Verification System (For Step 3 of your plan)
To "Verify log artifacts using blockchain," you need a simple UI or script that does this:

- akes a log file from the Ubuntu server.
- Calculates its hash.
- Asks the Blockchain: "What is the hash stored for Log ID 1765616984?"
- If the hashes match, the log is Valid. If they don't match, an attacker likely edited the logs to hide their tracks.

1. Implementation Steps (Simple Guide)
**Step 1: Data Ingestion & Hashing (The Bridge)**
Set up your Express server to act as a listener. When Wazuh fires an alert, the server:

- Receives the JSON body.
- Filters for high-level alerts (e.g., Level 7+).
- Uses the crypto library to create a SHA-256 hash of the entire message string. This hash is your "digital fingerprint."

**Step 2: On-Chain Commitment (Hardhat)**
Deploy your Solidity contract to the local Hardhat network. The Express server then:

- Calls the contract’s storeLog function using Ethers.js.
- Passes the Wazuh ID, alert level, and the hash.
- The contract records these, automatically attaching a blockchain timestamp that can't be faked.

**Step 3: Verification Logic (The Audit)**
- Create a "Verify" page in React.
- The user uploads a log file or pastes a log message.
- The system hashes it and compares it to the hash stored on the blockchain.
- If they match, a "Verified: Chain of Custody Intact" badge appears.

2. Expected Outcomes (What you get)
By the end of this project, you will have a working system that provides:

- **Immutable Evidence Log**: A list of security alerts that no attacker—even with "Root" access—can delete or modify.

- **Tamper Detection**: Immediate proof if someone tries to edit the original Wazuh logs.

- **Automated Incident Timeline**: A cryptographically timestamped sequence of events for forensic reconstruction.

- **Court-Ready Documentation**: PDF reports that link digital evidence directly to a blockchain transaction.

3. Final Project Feature List

Core Security Features

- **SIEM Integration**: Real-time ingestion of Wazuh security telemetry.

- **Blockchain Anchoring**: Every critical alert is permanently committed to a decentralized ledger.

- **SHA-256 Integrity Verification**: Mathematical proof of data consistency.

- **Passwordless AD Environment**: Practical implementation of modern authentication to reduce the attack surface.


# commands

```bash
npx hardhat compile

npx hardhat run scripts/deploy.js --network localhost
```

```bash
  Contract deployment: SentinelChain
  Contract address:    0x5fbdb2315678afecb367f032d93f642f64180aa3
  Transaction:         0xa88d9587ef0f00a0c0eb43dca7d717b5c7acef86b85bffc389d46aa15f9c81f4
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  Value:               0 ETH 
  Gas used:            1288960 of 16777216
  Block #1:            0x432076b7355b3ad466d95b89ef3c6383e8e53e635c9091838f34a8a6af784e53
```

## System Architecture

┌─────────────┐
│ Wazuh Agent │
└──────┬──────┘
       ↓
┌──────────────────┐
│ Detection Engine │
│ (SIEM / Backend) │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Log Hashing      │
│ (SHA-256)        │
└──────┬───────────┘
       ↓
┌────────────────────────┐
│ Ethereum Blockchain    │
│ SentinelChain Contract │
└──────┬─────────────────┘
       ↓
┌──────────────────┐
│ Event Indexer    │
│ (Node + ethers)  │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ React Dashboard  │
│ (Live Alerts)    │
└──────────────────┘


## 🔐 Smart Contract Design 
SentinelChain.sol – Responsibilities

✔ Store immutable log fingerprints
✔ Verify log authenticity
✔ Emit alerts using events
✔ Enforce role-based access
✔ Detect high & critical threats

Why Events?
- No polling
- Real-time updates
- Cheap & efficient
- Native blockchain feature

## 📜 Smart Contract Flow 
Log Detected
    ↓
Hash Generated
    ↓
storeLog()
    ↓
Log Stored On-Chain
    ↓
AlertTriggered Event
    ↓
(If Critical)
    ↓
CriticalAlert Event

⚡ Event-Driven Architecture (Slide 8)
Why Events Instead of APIs?
- Traditional	v/s SentinelChain
- Polling	        - Event-driven
- Delayed	        - Real-time
- Mutable DB	    - Immutable chain
- Trust backend	  - Trust math

👉 Ethereum events act as real-time security signals.

🖥️ Backend Indexer (Slide 9)
- What the Indexer Does
- Connects to Ethereum JSON-RPC
- Listens to smart contract events
- Indexes past alerts
- Updates severity counters
- Exposes REST API to frontend

Key Feature

No database is required — blockchain is the source of truth.

## 📊 Severity Analytics 
Severity Classification Logic
Alert Level	Severity
```bash
1–3	Low
4–6	Medium
7+	Critical
```

Real-Time Aggregation

- Counts updated instantly via events
- Displayed on dashboard
- No polling or cron jobs

## 🧪 Attack Simulation 
Simulated Attacks

- rm -rf
- mimikatz
- pkill

Observed Behavior

- Normal alert logged
- Critical alert auto-triggered
- Blockchain hash generated
- Event emitted & indexed
- Frontend updated instantly

This proves practical security relevance.

## 🔍 Log Verification Workflow 
Verification Process
Raw Log
   ↓
Hash Generated (Frontend)
   ↓
verifyLog()
   ↓
Compare On-Chain Hash
   ↓
✔ Verified / ✖ Tampered

Why This Is Important

- Enables forensic audits

- Detects log manipulation

- Ensures post-incident integrity

## 🔐 Security Design Decisions 
Why Not Store Raw Logs On-Chain?

- High gas cost
- Privacy violation
- Poor scalability

Our Approach

✔ Store cryptographic fingerprints

✔ Verify integrity on demand

✔ Keep sensitive data off-chain

This is industry-aligned design.


