const API = "http://localhost:3000";

export const fetchSeverityStats = () =>
  fetch(`${API}/analytics/severity`).then(r => r.json());

export const fetchMitreStats = () =>
  fetch(`${API}/analytics/mitre`).then(r => r.json());
