import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";

const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

const CAT = {
  luce: { label: "Luce", short: "L", color: "#F59E0B", bg: "#FBEFD9" },
  gas: { label: "Gas", short: "G", color: "#10B981", bg: "#DCF2E8" },
  telco: { label: "Telco", short: "T", color: "#6366F1", bg: "#E5E4F8" },
  vas: { label: "VAS", short: "V", color: "#F43F5E", bg: "#FBDFE4" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
* { box-sizing: border-box; }
body { margin: 0; }
.app { min-height: 100vh; font-family: 'Inter', sans-serif; color: #1E2433; padding: 20px 16px 48px;
  background:
    radial-gradient(circle at 0% 0%, #BFD3F7 0%, rgba(191,211,247,0) 45%),
    radial-gradient(circle at 100% 45%, #F2EADB 0%, rgba(242,234,219,0) 40%),
    radial-gradient(circle at 50% 95%, #D9DDF9 0%, rgba(217,221,249,0) 50%),
    #EDF1F9; }
.wrap { max-width: 520px; margin: 0 auto; }
.disp { font-family: 'Space Grotesk', sans-serif; }
.header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
.brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.logo { width: 48px; height: 48px; border-radius: 50%; background: #2563EB; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; box-shadow: 0 8px 20px rgba(37,99,235,.35); flex-shrink: 0; }
.brand h1 { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 18px; }
.logo img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
.uname { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; text-transform: capitalize; }
.brand p { margin: 0; font-size: 12px; color: #6B7280; }
.logout { background: none; border: none; padding: 0; font-size: 12px; color: #2563EB; text-decoration: underline; cursor: pointer; font-family: inherit; }
.month { display: flex; align-items: center; background: rgba(255,255,255,.6); border: 1px solid rgba(255,255,255,.95); border-radius: 999px; padding: 8px 6px; box-shadow: 0 4px 16px rgba(30,36,51,.06); }
.month span { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; text-align: center; min-width: 92px; line-height: 1.2; }
.month button { background: none; border: none; font-size: 22px; color: #374151; padding: 0 8px; cursor: pointer; }
.tabs { display: flex; background: rgba(255,255,255,.45); border-radius: 999px; padding: 5px; margin-bottom: 18px; }
.tabs button { flex: 1; border: none; background: none; padding: 10px 0; border-radius: 999px; font-size: 14px; font-weight: 500; color: #6B7280; cursor: pointer; font-family: inherit; }
.tabs button.on { background: #fff; color: #111827; font-weight: 600; box-shadow: 0 4px 12px rgba(30,36,51,.08); }
.stack { display: flex; flex-direction: column; gap: 14px; }
.card { background: rgba(255,255,255,.72); border: 1px solid rgba(255,255,255,.95); border-radius: 24px; padding: 18px; box-shadow: 0 6px 24px rgba(30,36,51,.05); }
.card h2 { margin: 0 0 4px; font-family: 'Space Grotesk', sans-serif; font-size: 18px; }
.muted { color: #6B7280; font-size: 13px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.stat-label { font-size: 13px; color: #6B7280; display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.stat-val { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 28px; margin-top: 8px; white-space: nowrap; }
.grid3 .stat-val { font-size: 21px; }
.grid3 .card { padding: 14px; }
.stat-val small { font-size: 15px; color: #9CA3AF; font-weight: 500; margin-left: 4px; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.big { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 46px; line-height: 1.1; }
.big small { font-size: 22px; color: #9CA3AF; font-weight: 500; margin-left: 8px; }
.eyebrow { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #6B7280; }
.tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 14px; }
.tile { border-radius: 16px; padding: 10px; }
.tile .tl { font-size: 12px; color: #6B7280; margin-top: 8px; }
.tile .tv { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.sec-head h2 { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 19px; }
.btn-primary { background: #2563EB; color: #fff; border: none; border-radius: 999px; padding: 11px 18px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; box-shadow: 0 8px 18px rgba(37,99,235,.3); }
.btn-primary:disabled { background: #A5B4D4; box-shadow: none; }
.btn-ghost { background: #EEF0F4; color: #4B5563; border: none; border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.btn-danger { background: #FDE2E7; color: #E11D48; border: none; border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.day-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.acts { display: flex; gap: 6px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.chip { border-radius: 999px; padding: 4px 11px; font-size: 13px; font-weight: 600; }
.field label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4B5563; margin-bottom: 8px; }
.inp { width: 100%; background: rgba(255,255,255,.9); border: 1px solid #EEF0F4; border-radius: 18px; padding: 14px 16px; font-size: 17px; font-family: inherit; color: #1E2433; outline: none; }
.inp:focus { border-color: #93B4F5; }
.stepper { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.9); border: 1px solid #EEF0F4; border-radius: 18px; padding: 5px; }
.stepper button { width: 42px; height: 42px; border-radius: 50%; border: none; background: #EEF0F4; color: #1E2433; font-size: 22px; font-weight: 600; cursor: pointer; flex-shrink: 0; font-family: inherit; line-height: 1; }
.stepper input { flex: 1; min-width: 0; width: 100%; border: none; background: transparent; text-align: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; color: #1E2433; outline: none; -moz-appearance: textfield; }
.stepper input::-webkit-outer-spin-button, .stepper input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.stepper.small { background: rgba(255,255,255,.75); border: none; width: 160px; }
.steps { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.step-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; border-radius: 18px; padding: 8px 8px 8px 14px; }
.step-label { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; }
.hint { font-size: 12px; color: #6B7280; margin-top: 6px; padding-left: 6px; }
.hint.bad { color: #E11D48; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
.row { display: grid; grid-template-columns: 1fr 60px 50px 60px; align-items: center; padding: 12px 0; border-bottom: 1px solid #EDEFF3; font-size: 16px; }
.row:last-child { border-bottom: none; }
.row.head { font-size: 11px; letter-spacing: .1em; color: #6B7280; padding-top: 4px; }
.row .r { text-align: right; }
.cat { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.line { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #EDEFF3; font-size: 15px; }
.line:last-child { border-bottom: none; }
.line span:first-child { color: #6B7280; }
.line span:last-child { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
.dark { border-radius: 24px; padding: 20px; color: #fff; }
.dark .eyebrow { color: #AEB6CC; }
.dark .big { color: #fff; }
.dark-1 { background: linear-gradient(120deg, #1B2233 0%, #1E3A6E 100%); }
.dark-2 { background: linear-gradient(120deg, #2E3571 0%, #1B2233 100%); }
.btn-dark { background: rgba(255,255,255,.14); color: #fff; border: none; border-radius: 999px; padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
.err { background: #FDE2E7; color: #9F1239; border-radius: 16px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }
.back { background: none; border: none; color: #2563EB; font-size: 14px; font-weight: 600; padding: 0; margin-bottom: 14px; cursor: pointer; font-family: inherit; }
.note { font-size: 12px; color: #6B7280; margin-top: 14px; line-height: 1.5; }
.login-band { background: linear-gradient(120deg, #1B2233 0%, #1E3A6E 100%); padding: 26px 24px; display: flex; justify-content: center; }
.login-band img { width: 100%; max-width: 280px; height: auto; display: block; }
.btn-google { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #fff; color: #1E2433; border: 1px solid #E3E6EC; border-radius: 999px; padding: 12px 18px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(30,36,51,.06); }
.divider { display: flex; align-items: center; gap: 10px; margin: 16px 0; color: #9CA3AF; font-size: 12px; }
.divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: #E3E6EC; }
.link { background: none; border: none; color: #6B7280; font-size: 13px; text-decoration: underline; width: 100%; margin-top: 14px; cursor: pointer; font-family: inherit; }
.sotto-nome { display: flex; align-items: center; gap: 8px; margin-top: 3px; flex-wrap: wrap; }
.ponte { display: inline-flex; align-items: center; background: rgba(255,255,255,.85); border: 1px solid rgba(255,255,255,.95); color: #2563EB; border-radius: 999px; padding: 3px 9px; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; box-shadow: 0 2px 8px rgba(30,36,51,.07); }
.ore-mancanti { color: #B45309; font-weight: 600; }
.card-attesa { border: 1.5px dashed #F2C27A; }
.btn-piccolo { padding: 8px 14px; font-size: 13px; box-shadow: 0 6px 14px rgba(37,99,235,.25); }
.dalle-note { margin-top: 10px; font-size: 12.5px; color: #6B7280; }
.from-notes { margin-top: 14px; background: #EAF1FE; border: 1px solid #D3E2FD; color: #1E3A8A; border-radius: 16px; padding: 11px 14px; font-size: 14px; line-height: 1.5; }
.from-notes b { font-weight: 600; }
.from-notes.dup { background: #FFF6E5; border-color: #FBE5BC; color: #7A4A00; }
.btn-notes { display: block; margin-top: 9px; background: #fff; color: #1E2433; border: 1px solid rgba(30,36,51,.12); border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.step-sub { display: block; font-size: 11.5px; font-weight: 500; color: #6B7280; margin-top: 1px; }
.stepper button:disabled { opacity: .35; cursor: default; }
.avviso { background: #FFF6E5; color: #7A4A00; border-radius: 16px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }
`;

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function emptyKo() {
  return { ko_luce: 0, ko_gas: 0, ko_telco: 0, ko_vas: 0, ko_vas_luce: 0, ko_vas_gas: 0, ko_vas_telco: 0 };
}
function fmtEuro(n) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
function fmtNum(n, decimals = 0) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtDay(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}
const emptyForm = { date: "", hours: "", luce: "", gas: "", telco: "", vas: "" };

// --- contratti che arrivano dal blocco note clienti (solo numeri: giorno e quantità) ---
const URL_NOTE = "https://note-clienti.vercel.app";
const TIPI = ["luce", "gas", "telco", "vas"];
const COL = { luce: "luce", gas: "gas", telco: "contratti_telco", vas: "vas" }; // colonne della tabella entries
function oggiIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function meseDopo(k) {
  const [y, m] = k.split("-").map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
}
function vuoti() {
  return { luce: 0, gas: 0, telco: 0, vas: 0, clienti: 0 };
}
function totale(n) {
  return n ? n.luce + n.gas + n.telco + n.vas : 0;
}
function sommaNote(righe) {
  const s = vuoti();
  const clienti = new Set();
  for (const r of righe) {
    const c = { luce: r.n_luce || 0, gas: r.n_gas || 0, telco: r.n_telco || 0, vas: r.n_vas || 0 };
    TIPI.forEach((k) => { s[k] += c[k]; });
    if (totale(c) > 0) clienti.add(r.cliente_id);
  }
  s.clienti = clienti.size;
  return s;
}
function raggruppaNote(righe) {
  const perGiorno = {};
  for (const r of righe) {
    if (!perGiorno[r.data]) perGiorno[r.data] = [];
    perGiorno[r.data].push(r);
  }
  const out = {};
  for (const d of Object.keys(perGiorno)) out[d] = sommaNote(perGiorno[d]);
  return out;
}
function testoNumeri(n) {
  const parti = TIPI.filter((k) => Number(n[k]) > 0).map((k) => `${CAT[k].label} ${n[k]}`);
  return parti.length ? parti.join(" · ") : "nessun contratto";
}

// Ore scritte come ore.minuti: "2.35" o "2,35" = 2 ore e 35 minuti; "6.5" = 6 ore e 50 minuti; "8" = 8 ore.
// Restituisce le ore in decimale (2.35 -> 2,5833), oppure null se vuoto, NaN se non valido.
function parseHM(str) {
  const t = String(str || "").trim().replace(",", ".").replace(":", ".");
  if (!t) return null;
  const m = t.match(/^(\d{1,3})(?:\.(\d{1,2}))?$/);
  if (!m) return NaN;
  const h = parseInt(m[1], 10);
  const min = m[2] === undefined ? 0 : (m[2].length === 1 ? parseInt(m[2], 10) * 10 : parseInt(m[2], 10));
  if (min >= 60) return NaN;
  return h + min / 60;
}
// Da ore decimali a "2.35" (per il campo di inserimento)
function toHM(dec) {
  const tot = Math.round(Number(dec) * 60);
  const h = Math.floor(tot / 60), m = tot % 60;
  return m ? `${h}.${String(m).padStart(2, "0")}` : `${h}`;
}
// Da ore decimali a { h, m } per la visualizzazione
function splitHM(dec) {
  const tot = Math.round(Number(dec) * 60);
  return { h: Math.floor(tot / 60), m: tot % 60 };
}
function HoursText({ value }) {
  const { h, m } = splitHM(value);
  return <>{h} h{m ? ` ${m} min` : ""}</>;
}

function Dot({ color }) {
  return <span className="dot" style={{ background: color }} />;
}

function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInGoogle() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) setError(error.message);
        else setInfo("Se l'email è registrata, riceverai a breve un link per reimpostare la password (controlla anche lo spam).");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else setInfo("Registrazione avviata. Controlla la tua email per confermare l'account, poi accedi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div className="card" style={{ width: "100%", maxWidth: 380, padding: 0, overflow: "hidden" }}>
        <div className="login-band">
          <img src="/logo-dc.png" alt="Digital Contact – Customer Experience" />
        </div>
        <div style={{ padding: 18 }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: 0 }}>Compensi mensili</h2>
          <p className="muted" style={{ margin: "2px 0 0" }}>{mode === "signin" ? "Accedi al tuo account" : mode === "signup" ? "Crea un nuovo account" : "Recupera la password"}</p>
        </div>
        {mode !== "reset" && <>
        <button className="btn-google" type="button" onClick={signInGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Accedi con Google
        </button>
        <div className="divider"><span>oppure con email</span></div>
        </>}
        <form onSubmit={submit} className="stack">
          <div className="field">
            <label>Email</label>
            <input className="inp" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "reset" && (
            <div className="field">
              <label>Password</label>
              <input className="inp" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          {mode === "signin" && (
            <button type="button" className="link" style={{ marginTop: -4, textAlign: "right" }} onClick={() => { setMode("reset"); setError(""); setInfo(""); }}>
              Password dimenticata?
            </button>
          )}
          {error && <div className="err" style={{ margin: 0 }}>{error}</div>}
          {info && <div className="muted">{info}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Attendere…" : mode === "signin" ? "Accedi" : mode === "signup" ? "Registrati" : "Invia link di recupero"}
          </button>
        </form>
        <button className="link" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}>
          {mode === "signin" ? "Non hai un account? Registrati" : mode === "signup" ? "Hai già un account? Accedi" : "Torna all'accesso"}
        </button>
        </div>
      </div>
    </div>
  );
}

function NewPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Le due password non coincidono."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else onDone();
  }

  return (
    <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <h2>Imposta una nuova password</h2>
        <p className="muted" style={{ marginTop: 0 }}>Scegli una password di almeno 6 caratteri.</p>
        <form onSubmit={submit} className="stack">
          <div className="field">
            <label>Nuova password</label>
            <input className="inp" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="field">
            <label>Ripeti la password</label>
            <input className="inp" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <div className="err" style={{ margin: 0 }}>{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Attendere…" : "Salva password"}</button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div className="app"><style>{CSS}</style></div>;
  if (recovery && session) return <NewPasswordScreen onDone={() => setRecovery(false)} />;
  if (!session) return <AuthScreen />;
  return <MainApp session={session} />;
}

function MainApp({ session }) {
  const [refDate, setRefDate] = useState(new Date());
  const [tab, setTab] = useState("giorni");
  const [showFiscali, setShowFiscali] = useState(false);
  const [entries, setEntries] = useState([]);
  const [ko, setKo] = useState(emptyKo());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [collegato, setCollegato] = useState(false); // ha collegato il blocco note?
  const [noteMese, setNoteMese] = useState({}); // contratti dalle note, giorno per giorno
  const [noteErr, setNoteErr] = useState(false);
  const [noteForm, setNoteForm] = useState(null); // contratti dalle note per la data del modulo
  const formRef = useRef(null);

  const key = monthKey(refDate);
  const userId = session.user.id;
  const meta = session.user.user_metadata || {};
  const avatarUrl = meta.avatar_url || meta.picture || "";
  const displayName = meta.full_name || meta.name
    ? (meta.full_name || meta.name).split(" ")[0]
    : (session.user.email || "").split("@")[0];
  const initial = (displayName || "?").charAt(0).toUpperCase();

  const load = useCallback(async (k, silenzioso = false) => {
    if (!silenzioso) setLoading(true);
    setErrorMsg("");
    const [r1, r2, r4] = await Promise.all([
      supabase.from("entries").select("*").eq("month", k).order("date"),
      supabase.from("monthly_ko").select("*").eq("month", k).maybeSingle(),
      supabase.from("note_collegamento").select("user_id").maybeSingle(),
    ]);
    if (r1.error) setErrorMsg("Errore nel caricamento delle giornate: " + r1.error.message);
    setEntries(r1.data || []);
    if (r2.error) setErrorMsg((prev) => prev || "Errore nel caricamento dei KO: " + r2.error.message);
    setKo(r2.data || emptyKo());
    // contratti dalle note: solo per chi ha collegato il blocco note (per gli altri tutto come prima)
    const conNote = !r4.error && !!r4.data;
    setCollegato(conNote);
    if (conNote) {
      const r3 = await supabase.from("contratti_note").select("data, cliente_id, n_luce, n_gas, n_telco, n_vas").eq("conta", true).gte("data", `${k}-01`).lt("data", meseDopo(k));
      // se non si caricano, l'app funziona con i numeri scritti a mano e lo segnala
      setNoteMese(r3.error ? {} : raggruppaNote(r3.data || []));
      setNoteErr(!!r3.error);
    } else {
      setNoteMese({});
      setNoteErr(false);
    }
    setLoading(false);
  }, []);

  // chi usa le note: quando torni sull'app i numeri si aggiornano da soli
  useEffect(() => {
    if (!collegato) return undefined;
    const ricarica = () => { if (document.visibilityState === "visible") load(key, true); };
    document.addEventListener("visibilitychange", ricarica);
    window.addEventListener("focus", ricarica);
    return () => {
      document.removeEventListener("visibilitychange", ricarica);
      window.removeEventListener("focus", ricarica);
    };
  }, [key, load, collegato]);

  useEffect(() => {
    load(key);
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setNoteForm(null);
  }, [key, load]);

  function changeMonth(delta) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() + delta, 1);
    setRefDate(d);
  }

  // ore proposte: quelle dell'ultima giornata inserita (anche di mesi precedenti)
  async function oreProposte() {
    if (entries.length > 0) {
      const last = [...entries].sort((a, b) => a.date.localeCompare(b.date))[entries.length - 1];
      return toHM(last.hours);
    }
    const { data } = await supabase.from("entries").select("hours").order("date", { ascending: false }).limit(1);
    return data && data.length ? toHM(data[0].hours) : "";
  }

  // contratti delle note per un giorno: dal mese già caricato, oppure dal database se è un altro mese
  async function noteDelGiorno(date) {
    if (!collegato || !date) return vuoti();
    if (date.startsWith(key)) return noteMese[date] || vuoti();
    const { data, error } = await supabase.from("contratti_note").select("cliente_id, n_luce, n_gas, n_telco, n_vas").eq("conta", true).eq("data", date);
    return error || !data ? vuoti() : sommaNote(data);
  }

  function vaiAlModulo() {
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  async function openNew() {
    const todayIso = oggiIso();
    apriGiorno(todayIso.startsWith(key) ? todayIso : `${key}-01`, false);
  }

  // nuova giornata: i contratti delle note (se ci sono) sono già nei contatori, metti le ore
  async function apriGiorno(date, scorri) {
    setEditingId(null);
    const [ore, n] = await Promise.all([oreProposte(), noteDelGiorno(date)]);
    setNoteForm({ date, ...n });
    setForm({ ...emptyForm, date, hours: ore, luce: String(n.luce), gas: String(n.gas), telco: String(n.telco), vas: String(n.vas) });
    setShowForm(true);
    if (scorri) vaiAlModulo();
  }

  // cambio data nel modulo: cambiano i contratti delle note, restano quelli aggiunti a mano
  async function cambiaData(d) {
    const prima = noteForm;
    setForm((f) => ({ ...f, date: d }));
    if (editingId || !collegato) return;
    const n = await noteDelGiorno(d);
    setNoteForm({ date: d, ...n });
    setForm((f) => {
      if (f.date !== d) return f;
      const out = { ...f };
      TIPI.forEach((k) => {
        const aMano = Math.max(0, (parseInt(f[k]) || 0) - (prima ? prima[k] || 0 : 0));
        out[k] = String(n[k] + aMano);
      });
      return out;
    });
  }

  // quanti contratti di quel tipo arrivano dalle note per la data del modulo
  function dalleNote(k) {
    return noteForm && noteForm.date === form.date ? noteForm[k] || 0 : 0;
  }

  // +/−: non si scende sotto i contratti delle note (quelli si cambiano nel blocco note)
  function step(field, delta) {
    const min = dalleNote(field);
    setForm((f) => ({ ...f, [field]: String(Math.max(min, (parseInt(f[field]) || 0) + delta)) }));
  }

  function startEdit(e) {
    const primo = entries.find((x) => x.date === e.date)?.id === e.id;
    const n = primo ? noteMese[e.date] || vuoti() : vuoti();
    setEditingId(e.id);
    setNoteForm({ date: e.date, ...n });
    setForm({
      date: e.date,
      hours: toHM(e.hours),
      luce: String((Number(e.luce) || 0) + n.luce),
      gas: String((Number(e.gas) || 0) + n.gas),
      telco: String((Number(e.contratti_telco) || 0) + n.telco),
      vas: String((Number(e.vas) || 0) + n.vas),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
    setNoteForm(null);
  }

  async function saveEntry() {
    const parsedHours = parseHM(form.hours);
    if (!form.date || parsedHours === null || isNaN(parsedHours)) return;
    // nella giornata si salvano solo i contratti aggiunti a mano: quelli delle note sono già contati a parte
    const aMano = (k) => Math.max(0, (parseInt(form[k]) || 0) - dalleNote(k));
    const row = {
      user_id: userId,
      month: form.date.slice(0, 7),
      date: form.date,
      hours: Math.round(parsedHours * 10000) / 10000,
      luce: aMano("luce"),
      gas: aMano("gas"),
      contratti_telco: aMano("telco"),
      vas: aMano("vas"),
    };
    const { error } = editingId
      ? await supabase.from("entries").update(row).eq("id", editingId)
      : await supabase.from("entries").insert(row);
    if (error) {
      setErrorMsg("Salvataggio non riuscito: " + error.message);
      return;
    }
    closeForm();
    load(key, true);
  }

  async function removeEntry(e) {
    const conNote = totale(noteMese[e.date]) > 0;
    const domanda = conNote
      ? "Eliminare la giornata (ore e contratti aggiunti a mano)? I contratti delle note restano."
      : "Eliminare questa giornata?";
    if (!window.confirm(domanda)) return;
    const { error } = await supabase.from("entries").delete().eq("id", e.id);
    if (error) { setErrorMsg("Eliminazione non riuscita: " + error.message); return; }
    load(key, true);
  }

  async function updateKoField(field, val) {
    const n = Math.max(0, parseInt(val) || 0);
    const next = { ...ko, [field]: n, month: key, user_id: userId };
    setKo(next);
    const { error } = await supabase.from("monthly_ko").upsert(next, { onConflict: "user_id,month" });
    if (error) setErrorMsg("Salvataggio KO non riuscito: " + error.message);
  }

  // --- calcoli compensi ---
  const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0);
  const noteTot = vuoti();
  Object.values(noteMese).forEach((n) => TIPI.forEach((k) => { noteTot[k] += n[k]; }));
  const gross = {
    luce: entries.reduce((s, e) => s + Number(e.luce), 0) + noteTot.luce,
    gas: entries.reduce((s, e) => s + Number(e.gas), 0) + noteTot.gas,
    telco: entries.reduce((s, e) => s + Number(e.contratti_telco), 0) + noteTot.telco,
    vas: entries.reduce((s, e) => s + Number(e.vas), 0) + noteTot.vas,
  };
  const totaleLordi = gross.luce + gross.gas + gross.telco;

  const resa = totalHours > 0 ? totaleLordi / totalHours : 0;
  let gettone = 0;
  if (resa >= 0.7) gettone = 20;
  else if (resa >= 0.6) gettone = 15;
  else if (resa >= 0.5) gettone = 5;

  const koTot = {
    luce: ko.ko_luce + ko.ko_vas_luce,
    gas: ko.ko_gas + ko.ko_vas_gas,
    telco: ko.ko_telco + ko.ko_vas_telco,
    vas: ko.ko_vas + ko.ko_vas_luce + ko.ko_vas_gas + ko.ko_vas_telco,
  };
  const netti = {
    luce: Math.max(0, gross.luce - koTot.luce),
    gas: Math.max(0, gross.gas - koTot.gas),
    telco: Math.max(0, gross.telco - koTot.telco),
    vas: Math.max(0, gross.vas - koTot.vas),
  };

  const pagaBase = totalHours * 8.5;
  const provvLuceGas = (netti.luce + netti.gas) * gettone;
  const provvTelco = netti.telco * 10;
  const provvVas = netti.vas * 2;
  const guadagnoTotale = pagaBase + provvLuceGas + provvTelco + provvVas;

  // --- netto stimato co.co.co. ---
  const contributiPrev = guadagnoTotale * 0.118;
  const imponibileFiscale = guadagnoTotale - contributiPrev;
  const irpefLorda = imponibileFiscale * 0.23;
  const detrazione = 166.04;
  const irpefNetta = Math.max(0, irpefLorda - detrazione);
  const nettoStimato = guadagnoTotale - contributiPrev - irpefNetta;

  const catKeys = ["luce", "gas", "telco", "vas"];
  // solo per chi usa le note: avviso (non blocco) se esiste già una giornata nella stessa data
  const doppione = collegato && !editingId && showForm ? entries.find((e) => e.date === form.date) : null;
  const giorniLista = (() => {
    const lista = [];
    const visti = new Set();
    for (const e of entries) {
      const primo = !visti.has(e.date);
      visti.add(e.date);
      lista.push({ id: e.id, date: e.date, entry: e, note: primo ? noteMese[e.date] || null : null });
    }
    for (const d of Object.keys(noteMese)) {
      if (!visti.has(d) && totale(noteMese[d]) > 0) lista.push({ id: "note-" + d, date: d, entry: null, note: noteMese[d] });
    }
    return lista.sort((a, b) => a.date.localeCompare(b.date));
  })();
  const quandoForm = form.date === oggiIso() ? "di oggi" : "del " + (form.date ? fmtDay(form.date) : "");

  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="wrap">
        <div className="header">
          <div className="brand">
            <div className="logo">
              {avatarUrl ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 className="uname">{displayName}</h1>
              {collegato ? (
                <div className="sotto-nome">
                  <button className="logout" onClick={() => supabase.auth.signOut()}>Esci</button>
                  <a className="ponte" href={URL_NOTE} target="_blank" rel="noopener noreferrer">Note clienti ↗</a>
                </div>
              ) : (
                <button className="logout" onClick={() => supabase.auth.signOut()}>Esci</button>
              )}
            </div>
          </div>
          <div className="month">
            <button onClick={() => changeMonth(-1)} aria-label="Mese precedente">‹</button>
            <span>{MESI[refDate.getMonth()]}<br />{refDate.getFullYear()}</span>
            <button onClick={() => changeMonth(1)} aria-label="Mese successivo">›</button>
          </div>
        </div>

        <div className="tabs">
          {[["giorni", "Giorni"], ["finemese", "Fine mese"], ["riepilogo", "Riepilogo"]].map(([id, lbl]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => { setTab(id); setShowFiscali(false); }}>{lbl}</button>
          ))}
        </div>

        {errorMsg && <div className="err">{errorMsg}</div>}
        {noteErr && <div className="avviso">Contratti dalle note non caricati: i totali potrebbero essere più bassi. Riprova tra poco.</div>}

        {loading ? (
          <p className="muted">Caricamento…</p>
        ) : tab === "giorni" ? (
          <div className="stack">
            <div className="grid2">
              <div className="card">
                <div className="stat-label">Ore totali <Dot color="#9CA3AF" /></div>
                <div className="stat-val">{splitHM(totalHours).h}<small>h</small>{splitHM(totalHours).m ? <> {splitHM(totalHours).m}<small>min</small></> : null}</div>
              </div>
              <div className="card">
                <div className="stat-label">Resa oraria <Dot color="#2563EB" /></div>
                <div className="stat-val">{fmtNum(resa, 2)}<small>/h</small></div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <h2>Contratti lordi · mese</h2>
                <span className="muted">Luce + Gas + Telco</span>
              </div>
              <div className="big">{totaleLordi}<small>contratti</small></div>
              <div className="tiles">
                {catKeys.map((k) => (
                  <div key={k} className="tile" style={{ background: CAT[k].bg }}>
                    <Dot color={CAT[k].color} />
                    <div className="tl">{CAT[k].label}</div>
                    <div className="tv" style={{ color: CAT[k].color }}>{gross[k]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sec-head">
              <h2>Giornate</h2>
              {!showForm && <button className="btn-primary" onClick={openNew}>+ Aggiungi</button>}
            </div>

            {showForm && (
              <div className="card" ref={formRef} style={{ scrollMarginTop: 12 }}>
                <h2>{editingId ? "Modifica giornata" : "Nuova giornata"}</h2>
                <div className="form-grid">
                  <div className="field">
                    <label>Data</label>
                    <input className="inp" type="date" value={form.date} onChange={(e) => cambiaData(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Ore lavorate</label>
                    <input className="inp" type="text" inputMode="decimal" placeholder="es. 6.30" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
                    {(() => {
                      const v = parseHM(form.hours);
                      if (v === null) return <div className="hint">ore.minuti, es. 2.35</div>;
                      if (isNaN(v)) return <div className="hint bad">Formato non valido (minuti da 00 a 59)</div>;
                      return <div className="hint">= <HoursText value={v} /></div>;
                    })()}
                  </div>
                </div>
                {doppione ? (
                  <div className="from-notes dup">
                    Il {fmtDay(form.date)} c'è già una giornata salvata. Per aggiungere ore o contratti a quel giorno, apri quella.
                    <button type="button" className="btn-notes" onClick={() => startEdit(doppione)}>Apri quella</button>
                  </div>
                ) : noteForm && noteForm.date === form.date && totale(noteForm) > 0 ? (
                  <div className="from-notes">
                    Dalle note clienti {quandoForm}: <b>{testoNumeri(noteForm)}</b> ({noteForm.clienti} {noteForm.clienti === 1 ? "cliente" : "clienti"}). Sono già qui sotto: {editingId ? "controlla e salva." : "metti le ore e salva."}
                  </div>
                ) : null}
                <div className="steps">
                  {catKeys.map((k) => (
                    <div key={k} className="step-row" style={{ background: CAT[k].bg }}>
                      <span className="step-label"><Dot color={CAT[k].color} /><span>{CAT[k].label}{dalleNote(k) > 0 && <small className="step-sub">{dalleNote(k)} dalle note</small>}</span></span>
                      <div className="stepper small">
                        <button type="button" onClick={() => step(k, -1)} disabled={dalleNote(k) > 0 && (parseInt(form[k]) || 0) <= dalleNote(k)} aria-label={"Meno " + CAT[k].label}>−</button>
                        <input type="number" inputMode="numeric" min="0" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} onBlur={() => { if (dalleNote(k) > 0) setForm((f) => ({ ...f, [k]: String(Math.max(dalleNote(k), parseInt(f[k]) || 0)) })); }} style={{ color: CAT[k].color }} />
                        <button type="button" onClick={() => step(k, 1)} aria-label={"Più " + CAT[k].label} style={{ background: CAT[k].color, color: "#fff" }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={saveEntry} disabled={!form.date || parseHM(form.hours) === null || isNaN(parseHM(form.hours))}>
                    {editingId ? "Salva modifiche" : "Salva giornata"}
                  </button>
                  <button className="btn-ghost" onClick={closeForm}>Annulla</button>
                </div>
              </div>
            )}

            {giorniLista.length === 0 ? (
              <p className="muted" style={{ textAlign: "center", padding: "16px 0" }}>Nessuna giornata registrata per questo mese.</p>
            ) : (
              giorniLista.map(({ id, date, entry: e, note: n }) => {
                const val = (cat) => (e ? Number(e[COL[cat]]) || 0 : 0) + (n ? n[cat] : 0);
                return (
                  <div key={id} className={"card" + (e ? "" : " card-attesa")}>
                    <div className="day-top">
                      <span className="muted" style={{ fontSize: 15 }}>
                        {fmtDay(date)}&nbsp;&nbsp;{e ? <span style={{ color: "#1E2433" }}><HoursText value={e.hours} /></span> : <span className="ore-mancanti">Ore da inserire</span>}
                      </span>
                      <div className="acts">
                        {e ? (
                          <>
                            <button className="btn-ghost" onClick={() => startEdit(e)}>Modifica</button>
                            <button className="btn-danger" onClick={() => removeEntry(e)}>Elimina</button>
                          </>
                        ) : (
                          <button className="btn-primary btn-piccolo" onClick={() => apriGiorno(date, true)}>Metti le ore</button>
                        )}
                      </div>
                    </div>
                    <div className="chips">
                      {catKeys.map((cat) => (
                        <span key={cat} className="chip" style={{ background: CAT[cat].bg, color: CAT[cat].color }}>{CAT[cat].short} {val(cat)}</span>
                      ))}
                    </div>
                    {n && totale(n) > 0 && <div className="dalle-note">Dalle note clienti: {testoNumeri(n)}</div>}
                  </div>
                );
              })
            )}
          </div>
        ) : tab === "finemese" ? (
          <div className="stack">
            <div className="card">
              <h2>KO definitivi</h2>
              <p className="muted" style={{ margin: 0 }}>Inserimento manuale a fine mese.</p>
              <div className="form-grid">
                {catKeys.map((k) => (
                  <div key={k} className="field">
                    <label><Dot color={CAT[k].color} />KO {CAT[k].label}</label>
                    <input className="inp" type="number" inputMode="numeric" min="0" placeholder="0"
                      value={ko["ko_" + k] ? ko["ko_" + k] : ""} onChange={(e) => updateKoField("ko_" + k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h2>KO VAS collegati</h2>
              <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
                Contratti base andati KO che avevano un VAS associato: si sommano sia al KO del servizio base sia al KO VAS totale.
              </p>
              <div className="stack" style={{ marginTop: 14 }}>
                {["luce", "gas", "telco"].map((k) => (
                  <div key={k} className="field">
                    <label><Dot color={CAT[k].color} />KO VAS collegati a {CAT[k].label}</label>
                    <input className="inp" type="number" inputMode="numeric" min="0" placeholder="0"
                      value={ko["ko_vas_" + k] ? ko["ko_vas_" + k] : ""} onChange={(e) => updateKoField("ko_vas_" + k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
            <p className="muted" style={{ textAlign: "center", margin: 0 }}>
              KO totali applicati — Luce {koTot.luce} · Gas {koTot.gas} · Telco {koTot.telco} · VAS {koTot.vas}
            </p>
          </div>
        ) : !showFiscali ? (
          <div className="stack">
            <div className="grid3">
              <div className="card"><div className="stat-label">Ore totali</div><div className="stat-val">{splitHM(totalHours).h}<small>h</small>{splitHM(totalHours).m ? <> {splitHM(totalHours).m}<small>m</small></> : null}</div></div>
              <div className="card"><div className="stat-label">Resa oraria</div><div className="stat-val">{fmtNum(resa * 100, 1)}%</div></div>
              <div className="card"><div className="stat-label">Gettone</div><div className="stat-val">{gettone}€</div></div>
            </div>

            <div className="card">
              <div className="eyebrow">Contratti lordi · Luce + Gas + Telco</div>
              <div className="big">{totaleLordi}</div>
            </div>

            <div className="card">
              <h2>Netti per categoria</h2>
              <div className="row head"><span>CATEGORIA</span><span className="r">LORDI</span><span className="r">KO</span><span className="r">NETTI</span></div>
              {catKeys.map((k) => (
                <div key={k} className="row">
                  <span className="cat"><Dot color={CAT[k].color} />{CAT[k].label}</span>
                  <span className="r">{gross[k]}</span>
                  <span className="r" style={{ color: "#6B7280" }}>{koTot[k]}</span>
                  <span className="r disp" style={{ color: CAT[k].color, fontWeight: 700 }}>{netti[k]}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h2>Scomposizione guadagno</h2>
              <div className="line"><span>Paga base (8,50 €/h)</span><span>{fmtEuro(pagaBase)}</span></div>
              <div className="line"><span>Provvigioni Luce + Gas</span><span>{fmtEuro(provvLuceGas)}</span></div>
              <div className="line"><span>Provvigioni Telco</span><span>{fmtEuro(provvTelco)}</span></div>
              <div className="line"><span>Provvigioni VAS</span><span>{fmtEuro(provvVas)}</span></div>
            </div>

            <div className="dark dark-1">
              <div className="eyebrow">Guadagno totale</div>
              <div className="big" style={{ marginTop: 8 }}>{fmtEuro(guadagnoTotale)}</div>
            </div>

            <div className="dark dark-2">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div className="eyebrow" style={{ lineHeight: 1.6 }}>Netto stimato · co.co.co.</div>
                <button className="btn-dark" onClick={() => setShowFiscali(true)}>Dettagli fiscali</button>
              </div>
              <div className="big" style={{ marginTop: 8 }}>{fmtEuro(nettoStimato)}</div>
            </div>
          </div>
        ) : (
          <div className="card">
            <button className="back" onClick={() => setShowFiscali(false)}>← Torna al Riepilogo</button>
            <h2>Dettagli fiscali</h2>
            <div className="line"><span>Guadagno totale (lordo)</span><span>{fmtEuro(guadagnoTotale)}</span></div>
            <div className="line"><span>Contributi previdenziali (11,80%)</span><span>{fmtEuro(contributiPrev)}</span></div>
            <div className="line"><span>Imponibile fiscale</span><span>{fmtEuro(imponibileFiscale)}</span></div>
            <div className="line"><span>IRPEF lorda (23%)</span><span>{fmtEuro(irpefLorda)}</span></div>
            <div className="line"><span>Detrazione applicata</span><span>{fmtEuro(detrazione)}</span></div>
            <div className="line"><span>IRPEF netta</span><span>{fmtEuro(irpefNetta)}</span></div>
            <div className="line"><span>Netto stimato</span><span>{fmtEuro(nettoStimato)}</span></div>
            <p className="note">
              Stima basata su aliquota IRPEF 23% flat e detrazione da lavoro dipendente fissa a 166,04 €/mese, calibrate sui cedolini reali. Valida finché il reddito annuo cumulato resta sotto i 28.000 €.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
