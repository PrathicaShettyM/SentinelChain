import { useEffect, useState } from "react";
import { fetchAgentLogs } from "../../services/indexerApi";

export default function AgentDrilldown({ agentId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (agentId) fetchAgentLogs(agentId).then(setLogs);
  }, [agentId]);

  return logs.map(l => (
    <div key={l.logId}>
      {l.description} (L{l.level})
    </div>
  ));
}
