import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";

import LogSearch from "../components/logs/LogSearch";
import LogDetails from "../components/logs/LogDetails";
import VerifyLog from "../components/logs/VerifyLog";
import LiveAlerts from "../components/alerts/LiveAlerts";
import SeverityChart from "../components/analytics/SeverityChart";
import { getContract } from "../blockchain/contract";

/* ------------------ LAYOUT ------------------ */

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
      <h1 className="text-lg font-semibold text-sky-400">
        🛡 SentinelChain
      </h1>

      <div className="flex gap-6 text-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive
              ? "text-sky-400 font-medium"
              : "text-slate-400 hover:text-slate-200"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/logs"
          className={({ isActive }) =>
            isActive
              ? "text-sky-400 font-medium"
              : "text-slate-400 hover:text-slate-200"
          }
        >
          Logs
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive
              ? "text-sky-400 font-medium"
              : "text-slate-400 hover:text-slate-200"
          }
        >
          Analytics
        </NavLink>
      </div>
    </nav>
  );
}

function PageWrapper({ title, children }) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-sky-400 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ------------------ PAGES ------------------ */

function Dashboard() {
  return (
    <PageWrapper title="Security Dashboard">
      <Card title="Live Alerts">
        <LiveAlerts />
      </Card>
    </PageWrapper>
  );
}

function LogLookup() {
  const [log, setLog] = useState(null);
  const [logId, setLogId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  const searchLog = async (id) => {
    try {
      const contract = await getContract();
      const res = await contract.getLog(id);

      setLogId(id);
      console.log("Searching logId:", id);
      
      setLog({
        agentId: res[0],
        timestamp: new Date(Number(res[1]) * 1000).toLocaleString(),
        level: res[2],
        hash: res[3],
        description: res[4]
      });
    } catch {
      alert("Log not found");
    }
  };

  const verifyLog = async (hashedLog) => {
    try {
      const contract = await getContract();
      const isValid = await contract.verifyLog(logId, hashedLog);
      setVerifyResult(isValid);
    } catch {
      setVerifyResult(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Log Lookup</h2>

      <LogSearch onSearch={searchLog} />
      <LogDetails log={log} />

      {log && (
        <>
          <VerifyLog onVerify={verifyLog} />

          {verifyResult !== null && (
            <div
              className={`mt-3 p-2 rounded-md text-sm ${
                verifyResult
                  ? "bg-emerald-900 text-emerald-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {verifyResult ? "✔ Log Verified" : "✖ Log Tampered"}
            </div>
          )}
        </>
      )}
    </>
  );
}


function Analytics() {
  return (
    <PageWrapper title="Analytics">
      <Card title="Severity Distribution">
        <SeverityChart />
      </Card>
    </PageWrapper>
  );
}

/* ------------------ APP ROOT ------------------ */

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/logs" element={<LogLookup />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
