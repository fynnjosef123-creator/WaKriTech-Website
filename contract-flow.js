(function () {
  const API_URL = "https://selection-ai-api.onrender.com";
  const SESSION_KEY = "selection_ai_web_session";

  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
  }

  function saveSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async function api(path, options = {}) {
    const session = readSession();
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (session?.token) headers.Authorization = `Bearer ${session.token}`;
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Anfrage fehlgeschlagen (${response.status}).`);
    return payload;
  }

  function showStatus(message, kind = "") {
    const status = document.getElementById("status");
    status.textContent = message;
    status.className = `status show ${kind}`.trim();
  }

  function revealContractForm(type, user) {
    document.getElementById("loginForm").classList.add("hidden");
    const form = document.getElementById(type === "withdrawal" ? "withdrawForm" : "cancelForm");
    form.classList.remove("hidden");
    form.elements.name.value = user?.name || "";
    form.elements.email.value = user?.email || "";
  }

  function init({ type }) {
    const existing = readSession();
    if (existing?.token) revealContractForm(type, existing.user);

    document.getElementById("loginForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = event.currentTarget.querySelector("button");
      button.disabled = true;
      showStatus("Anmeldung wird geprüft ...");
      try {
        const session = await api("/v1/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
        saveSession(session);
        revealContractForm(type, session.user);
        showStatus("Konto bestätigt. Prüfe jetzt die Vertragsangaben.", "success");
      } catch (error) {
        showStatus(error.message, "error");
      } finally {
        button.disabled = false;
      }
    });

    const form = document.getElementById(type === "withdrawal" ? "withdrawForm" : "cancelForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = event.currentTarget.querySelector("button");
      button.disabled = true;
      showStatus(type === "withdrawal" ? "Widerruf wird übermittelt ..." : "Kündigung wird übermittelt ...");
      try {
        const payload = Object.fromEntries(new FormData(event.currentTarget));
        const result = await api(type === "withdrawal" ? "/v1/billing/withdraw" : "/v1/billing/cancel", { method: "POST", body: JSON.stringify(payload) });
        const emailNote = result.emailSent ? "\n\nDie Bestätigung wurde außerdem per E-Mail gesendet." : "\n\nBitte speichere diese Bestätigung. Der E-Mail-Versand konnte nicht bestätigt werden.";
        showStatus(`${result.confirmation}${emailNote}`, "success");
        event.currentTarget.querySelectorAll("input, select, textarea, button").forEach((control) => { control.disabled = true; });
      } catch (error) {
        showStatus(error.message, "error");
        button.disabled = false;
      }
    });
  }

  window.SelectionAIContractFlow = { init };
}());
