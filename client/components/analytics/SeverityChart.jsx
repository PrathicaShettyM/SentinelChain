import { useEffect, useState } from "react";
import { fetchSeverityStats } from "../../services/indexerApi";

export default function SeverityChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchSeverityStats().then(setData);
  }, []);

  return data.map(d => (
    <div key={d.level}>
      Level {d.level}: {d.count}
    </div>
  ));
}
