// LED Resistor Calculator - EmailCapture Component
// Responsibility: Renders the email list opt-in form and handles local submit state.
// The onSubmit prop is provided by App.jsx and handles the actual API call.
// This component manages only its own local UI state (email input, status).

import { useState } from "react";
import { Mail, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

/**
 * @param {object}   props
 * @param {function} props.onSubmit - async (email: string) => void
 *   Called by App.jsx. Should throw on failure so this component can handle it.
 * @param {string}   [props.leadMagnet] - Label for the lead magnet incentive
 */
export default function EmailCapture({
  onSubmit,
  leadMagnet = "Free Resistor Reference Card PDF",
}) {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      await onSubmit(email);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  // ── Success state ───────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-700/40
                      bg-emerald-950/20 px-5 py-6 text-center">
        <CheckCircle size={28} className="text-emerald-400" />
        <div>
          <p className="font-semibold text-emerald-300 text-sm">You're in!</p>
          <p className="text-[0.72rem] text-slate-500 mt-0.5">
            Check your inbox — your PDF is on its way.
          </p>
        </div>
      </div>
    );
  }

  // ── Default / error state ───────────────────────────────────────────────────
  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900 px-5 py-5"
      aria-label="Email signup"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Mail size={14} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-[0.85rem] font-bold text-slate-200">
            Get the free reference card
          </h3>
          <p className="text-[0.7rem] text-slate-500 leading-relaxed mt-0.5">
            {leadMagnet} — E24 series, color codes, and common Vf values, all in one printable sheet.
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
          onKeyDown={handleKeyDown}
          placeholder="you@example.com"
          disabled={status === "loading"}
          className={[
            "min-w-0 flex-1 rounded-md border bg-slate-950 px-3 py-2.5",
            "font-mono text-sm text-slate-100 placeholder-slate-600",
            "outline-none transition-colors duration-150",
            "disabled:opacity-50",
            status === "error" ? "border-red-500 focus:border-red-400" : "border-slate-700 focus:border-amber-400",
          ].join(" ")}
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-amber-500/50
                     bg-amber-500/10 px-3.5 py-2.5 font-mono text-[0.73rem] font-bold
                     uppercase tracking-wider text-amber-400 transition-all duration-200
                     hover:border-amber-400 hover:bg-amber-500/20
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? (
            <span className="animate-pulse">···</span>
          ) : (
            <><ArrowRight size={12} /> Get It</>
          )}
        </button>
      </div>

      {/* Inline error */}
      {status === "error" && errorMsg && (
        <p className="flex items-center gap-1.5 text-[0.7rem] text-red-400">
          <AlertCircle size={11} />
          {errorMsg}
        </p>
      )}

      {/* Privacy note */}
      <p className="text-[0.6rem] text-slate-700">
        No spam. Unsubscribe anytime. We never share your email.
      </p>
    </section>
  );
}
