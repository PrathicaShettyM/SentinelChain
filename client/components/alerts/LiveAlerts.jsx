import { useEffect, useState } from "react";
import { getContract } from "../../blockchain/contract";

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let contract;

    getContract().then(c => {
      contract = c;

      c.on("AlertTriggered", (id, agent, level) => {
        setAlerts(a => [...a, { id, agent, level }]);
      });

      c.on("CriticalAlert", (id) => {
        setAlerts(a => [...a, { id, critical: true }]);
      });
    });

    return () => contract?.removeAllListeners();
  }, []);

  return (
    <div className="space-y-2 text-sm">
      {alerts.length === 0 && (
        <p className="text-slate-500">No alerts yet</p>
      )}

      {alerts.map((a, i) => (
        <div
          key={i}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md border
            ${
              a.critical
                ? "bg-red-950 border-red-800 text-red-400"
                : "bg-amber-950 border-amber-800 text-amber-400"
            }
          `}
        >
          <span className="font-semibold">
            {a.critical ? "🔥 CRITICAL" : "⚠️ ALERT"}
          </span>
          <span className="font-mono text-xs text-slate-200">
            {a.id}
          </span>
        </div>
      ))}
    </div>
  );
}
