import express from "express";
import { ethers } from "ethers";
import { createRequire } from "module";
import { Buffer } from "buffer";
import cors from "cors";

// Load ABI
const require = createRequire(import.meta.url);
const contractJson = require(
  "../smartcontract/artifacts/contracts/Ledger.sol/SentinelChain.json"
);

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));

const PORT = 4000;

// ----------------------
// 1️⃣ Blockchain Setup
// ----------------------
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// 🔴 MUST be a real deployed address
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const contract = new ethers.Contract(
  contractAddress,
  contractJson.abi,
  provider
);

// ----------------------
// 2️⃣ Severity Storage
// ----------------------
const severity = { low: 0, medium: 0, critical: 0 };

function classify(level) {
  if (level >= 7) severity.critical++;
  else if (level >= 4) severity.medium++;
  else severity.low++;
}

// ----------------------
// 3️⃣ SAFE logHash resolver (FIXED)
// ----------------------
async function getLogHash(logIdRaw) {
  const logId = String(logIdRaw); // ✅ CRITICAL FIX

  try {
    const log = await contract.getLog(logId);
    return log.messageHash;
  } catch {
    // fallback: deterministic hex from logId string
    return "0x" + Buffer.from(logId, "utf8").toString("hex");
  }
}

// ----------------------
// 4️⃣ Index Past Events
// ----------------------
async function indexPastEvents() {
  try {
    const pastAlerts = await contract.queryFilter("AlertTriggered");

    for (const e of pastAlerts) {
      const logId = String(e.args[0]);
      const agentId = String(e.args[1]);
      const level = Number(e.args[2]);

      classify(level);

      const hash = await getLogHash(logId);
      console.log(
        `Past Alert: L${level} from ${agentId} (Hash ${hash})`
      );
    }

    const pastCritical = await contract.queryFilter("CriticalAlert");

    for (const e of pastCritical) {
      const logId = String(e.args[0]);
      const keyword = String(e.args[1]);

      severity.critical++;

      const hash = await getLogHash(logId);
      console.log(
        `🔥 Past CRITICAL: ${keyword} (Hash ${hash})`
      );
    }

    console.log(`Indexed ${pastAlerts.length} past alerts`);
  } catch (err) {
    console.error("Error indexing past events:", err);
  }
}

// ----------------------
// 5️⃣ Live Event Listeners
// ----------------------
contract.on("AlertTriggered", async (logIdRaw, agentIdRaw, level) => {
  const logId = String(logIdRaw);
  const agentId = String(agentIdRaw);

  classify(Number(level));

  const hash = await getLogHash(logId);
  console.log(
    `New Alert: L${level} from ${agentId} (Hash ${hash})`
  );
});

contract.on("CriticalAlert", async (logIdRaw, keywordRaw) => {
  const logId = String(logIdRaw);
  const keyword = String(keywordRaw);

  severity.critical++;

  const hash = await getLogHash(logId);
  console.log(
    `🔥 CRITICAL: ${keyword} (Hash ${hash})`
  );
});

// ----------------------
// 6️⃣ API Endpoint
// ----------------------
app.get("/severity", (req, res) => {
  res.json([
    { level: "Low", count: severity.low },
    { level: "Medium", count: severity.medium },
    { level: "Critical", count: severity.critical }
  ]);
});

// ----------------------
// 7️⃣ Start Server
// ----------------------
app.listen(PORT, async () => {
  await indexPastEvents();
  console.log(`📊 Indexer running at http://localhost:${PORT}`);
});
