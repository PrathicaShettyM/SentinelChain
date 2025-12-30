import 'dotenv/config';
import express, { json } from "express";
import { createHash } from "crypto";
import { ethers } from "ethers";

const app = express();
app.use(json());

// ------------------ ETHERS SETUP ------------------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const abi = [
  "function storeLog(string,string,uint8,string,bytes32,string)"
];

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);

// ------------------ ROUTE ------------------
app.post("/wazuh", async (req, res) => {
  try {
    /* ------------------------------------------------
       1. Parse embedded JSON string from Wazuh
    ------------------------------------------------ */
    const wazuhMessage = JSON.parse(req.body.message);

    /* ------------------------------------------------
       2. Extract required fields
    ------------------------------------------------ */
    const logId = wazuhMessage.id;
    const agentId = wazuhMessage.agent.id;
    const alertLevel = wazuhMessage.rule.level;
    const description = wazuhMessage.rule.description;
    const rawMessage = wazuhMessage.full_log;

    /* ------------------------------------------------
       3. Hash the full log (SHA-256)
    ------------------------------------------------ */
    const messageHash =
      "0x" +
      createHash("sha256")
        .update(rawMessage)
        .digest("hex");

    /* ------------------------------------------------
       4. Send to blockchain
    ------------------------------------------------ */
    const tx = await contract.storeLog(
      logId,
      agentId,
      alertLevel,
      description,
      messageHash,
      rawMessage
    );

    await tx.wait();

    console.log("✅ Log stored on-chain:", logId);

    res.status(200).json({
      status: "success",
      txHash: tx.hash,
      logId
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ------------------ START SERVER ------------------
app.listen(3000, () => {
  console.log("🚀 Wazuh listener running on port 3000");
});
