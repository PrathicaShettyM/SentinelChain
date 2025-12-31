import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../../blockchain/contract";

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let contract;

    async function init() {
      contract = await getContract();

      /* -------------------------------
         1️⃣ LOAD PAST EVENTS
      -------------------------------- */

      const pastAlerts = await contract.queryFilter("AlertTriggered");
      const pastCritical = await contract.queryFilter("CriticalAlert");

      const formatted = [
        ...pastAlerts
          .filter(e => e.args)
          .map(e => ({
            type: "alert",
            logId: e.args.logId ?? e.args[0],
            agentId: e.args.agentId ?? e.args[1],
            level: Number(e.args.alertLevel ?? e.args[2]),
            timestamp: Number(e.args.timestamp ?? e.args[3])
          })),

        ...pastCritical
          .filter(e => e.args)
          .map(e => ({
            type: "critical",
            // indexed string → HASH ONLY
            logId: ethers.hexlify(e.topics[1]),
            keyword: e.args.keyword ?? e.args[1],
            timestamp: Number(e.args.timestamp ?? e.args[2])
          }))
      ];

      setAlerts(formatted);

      /* -------------------------------
         2️⃣ REAL-TIME LISTENERS
      -------------------------------- */

      contract.on("AlertTriggered", (logId, agentId, level, timestamp) => {
        setAlerts(a => [
          {
            type: "alert",
            logId,
            agentId,
            level: Number(level),
            timestamp: Number(timestamp)
          },
          ...a
        ]);
      });

      contract.on("CriticalAlert", (logIdHash, keyword, timestamp, event) => {
        setAlerts(a => [
          {
            type: "critical",
            // topic[1] = keccak256(logId)
            logId: ethers.hexlify(event.topics[1]),
            keyword,
            timestamp: Number(timestamp)
          },
          ...a
        ]);
      });
    }

    init();

    return () => {
      contract?.removeAllListeners();
    };
  }, []);

  /* -------------------------------
     UI
  -------------------------------- */

  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`p-2 rounded text-sm ${
            a.type === "critical"
              ? "bg-red-900 text-red-300"
              : "bg-yellow-900 text-yellow-300"
          }`}
        >
          {a.type === "critical" ? (
            <>
              🔥 <b>CRITICAL ATTACK</b><br />
              <span className="text-xs break-all">
                LogHash: {a.logId}
              </span>
            </>
          ) : (
            `⚠️ Alert L${a.level} — Agent ${a.agentId}`
          )}
        </div>
      ))}
    </div>
  );
}
