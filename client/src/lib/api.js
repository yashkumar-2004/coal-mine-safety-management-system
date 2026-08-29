const apiBase = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const url = `${apiBase}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = localStorage.getItem("coal_token");
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Health check (preserved original function)
export async function getHealth() {
  const response = await fetch(`${apiBase}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`);
  }
  return response.json();
}

// Auth APIs
export async function loginUser(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(userData) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function getCurrentUser() {
  return request("/api/auth/me");
}

export async function getUsers() {
  return request("/api/auth/users");
}

// Mines APIs
export async function getMines(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.type && params.type !== "ALL") query.append("type", params.type);
  if (params.status && params.status !== "ALL") query.append("status", params.status);
  const qStr = query.toString();
  return request(`/api/mines${qStr ? `?${qStr}` : ""}`);
}

export async function getMineById(id) {
  return request(`/api/mines/${id}`);
}

export async function createMine(mineData) {
  return request("/api/mines", {
    method: "POST",
    body: JSON.stringify(mineData),
  });
}

export async function updateMine(id, mineData) {
  return request(`/api/mines/${id}`, {
    method: "PUT",
    body: JSON.stringify(mineData),
  });
}

export async function deleteMine(id) {
  return request(`/api/mines/${id}`, {
    method: "DELETE",
  });
}

// Regulations APIs
export async function getRegulations(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.governing_body && params.governing_body !== "ALL") query.append("governing_body", params.governing_body);
  if (params.category && params.category !== "ALL") query.append("category", params.category);
  if (params.severity_level && params.severity_level !== "ALL") query.append("severity_level", params.severity_level);
  const qStr = query.toString();
  return request(`/api/regulations${qStr ? `?${qStr}` : ""}`);
}

export async function createRegulation(regData) {
  return request("/api/regulations", {
    method: "POST",
    body: JSON.stringify(regData),
  });
}

export async function updateRegulation(id, regData) {
  return request(`/api/regulations/${id}`, {
    method: "PUT",
    body: JSON.stringify(regData),
  });
}

// Inspections APIs
export async function getInspections(params = {}) {
  const query = new URLSearchParams();
  if (params.mine_id) query.append("mine_id", params.mine_id);
  if (params.status && params.status !== "ALL") query.append("status", params.status);
  if (params.category && params.category !== "ALL") query.append("category", params.category);
  if (params.search) query.append("search", params.search);
  const qStr = query.toString();
  return request(`/api/inspections${qStr ? `?${qStr}` : ""}`);
}

export async function getInspectionById(id) {
  return request(`/api/inspections/${id}`);
}

export async function createInspection(inspectionData) {
  return request("/api/inspections", {
    method: "POST",
    body: JSON.stringify(inspectionData),
  });
}

export async function deleteInspection(id) {
  return request(`/api/inspections/${id}`, {
    method: "DELETE",
  });
}

// Violations & CAPA APIs
export async function getViolations(params = {}) {
  const query = new URLSearchParams();
  if (params.mine_id) query.append("mine_id", params.mine_id);
  if (params.status && params.status !== "ALL") query.append("status", params.status);
  if (params.severity && params.severity !== "ALL") query.append("severity", params.severity);
  if (params.category && params.category !== "ALL") query.append("category", params.category);
  if (params.search) query.append("search", params.search);
  const qStr = query.toString();
  return request(`/api/violations${qStr ? `?${qStr}` : ""}`);
}

export async function getViolationById(id) {
  return request(`/api/violations/${id}`);
}

export async function createViolation(violationData) {
  return request("/api/violations", {
    method: "POST",
    body: JSON.stringify(violationData),
  });
}

export async function updateViolation(id, updateData) {
  return request(`/api/violations/${id}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}

export async function deleteViolation(id) {
  return request(`/api/violations/${id}`, {
    method: "DELETE",
  });
}

// Telemetry APIs
export async function getTelemetry(params = {}) {
  const query = new URLSearchParams();
  if (params.mine_id) query.append("mine_id", params.mine_id);
  const qStr = query.toString();
  return request(`/api/telemetry${qStr ? `?${qStr}` : ""}`);
}

export async function getTelemetryHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.mine_id) query.append("mine_id", params.mine_id);
  if (params.limit) query.append("limit", params.limit);
  const qStr = query.toString();
  return request(`/api/telemetry/history${qStr ? `?${qStr}` : ""}`);
}

export async function ingestTelemetry(readingData) {
  return request("/api/telemetry", {
    method: "POST",
    body: JSON.stringify(readingData),
  });
}

export async function simulateTelemetry() {
  return request("/api/telemetry/simulate", {
    method: "POST",
  });
}

// Dashboard Analytics
export async function getDashboardAnalytics() {
  return request("/api/analytics/dashboard");
}
