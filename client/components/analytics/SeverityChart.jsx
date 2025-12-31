import { useEffect, useState } from "react";
import { fetchSeverityStats } from "../../services/indexerApi";

export default function SeverityChart() {
  const [stats, setStats] = useState({
    Low: 0,
    Medium: 0,
    Critical: 0
  });

  useEffect(() => {
    async function loadStats() {
      const data = await fetchSeverityStats();

      // data = [{ level: "Low", count: X }, ...]
      const next = { Low: 0, Medium: 0, Critical: 0 };

      data.forEach(d => {
        if (next[d.level] !== undefined) {
          next[d.level] = d.count;
        }
      });

      setStats(next);
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">
        Severity Distribution
      </h3>

      <div className="p-2 rounded bg-green-900 text-green-300">
        🟢 Low Severity: {stats.Low}
      </div>

      <div className="p-2 rounded bg-yellow-900 text-yellow-300">
        🟡 Medium Severity: {stats.Medium}
      </div>

      <div className="p-2 rounded bg-red-900 text-red-300">
        🔴 Critical Severity: {stats.Critical}
      </div>
    </div>
  );
}
