import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Input, Select, Btn } from '../components/ui';

export default function AuthScreen() {
    const { login } = useAuth();
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "Resident", address: "" });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleDemo = async (role) => {
        const credentials = {
            Resident: { email: "resident@recyclelink.com", password: "resident123" },
            Driver: { email: "driver@recyclelink.com", password: "driver123" },
            Admin: { email: "admin@recyclelink.com", password: "admin123" },
        };
        
        setLoading(true); setErr("");
        try {
            const res = await authAPI.login(credentials[role]);
            login(res.data.user, res.data.token);
        } catch (e) {
            setErr(e.response?.data?.error || "Demo login failed. Make sure to seed the database first.");
            setLoading(false);
        }
    };

    const submit = async () => {
        setLoading(true); setErr("");
        try {
            const res = mode === 'login'
                ? await authAPI.login({ email: form.email, password: form.password })
                : await authAPI.register(form);

            login(res.data.user, res.data.token);
        } catch (e) {
            setErr(e.response?.data?.error || e.message || "Authentication failed");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "#f8faf9", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
            <div style={{ flex: 1, background: "#0F6E56", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", color: "white" }}>
                <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: -0.5 }}>RecycleLink</div>
                <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.3, marginBottom: 16 }}>On-Demand<br />Resource Recovery</div>
                <div style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.6, maxWidth: 320 }}>
                    Schedule recyclable pickups, track your fleet in real-time, and earn rewards for every kilogram diverted from landfills.
                </div>
                <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 12, opacity: 0.6, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>Try demo accounts</div>
                    {["Resident", "Driver", "Admin"].map(r => (
                        <button key={r} onClick={() => handleDemo(r)}
                            style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "white", cursor: "pointer", textAlign: "left", fontSize: 14, display: "flex", justifyContent: "space-between" }}>
                            <span>{r}</span><span style={{ opacity: 0.5 }}>→</span>
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
                <div style={{ width: "100%", maxWidth: 380 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                        {["login", "register"].map(m => (
                            <button key={m} onClick={() => setMode(m)}
                                style={{ flex: 1, padding: "9px", borderRadius: 8, border: "0.5px solid #d1d5db", background: mode === m ? "#0F6E56" : "white", color: mode === m ? "white" : "#374151", cursor: "pointer", fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>
                                {m === "login" ? "Sign In" : "Register"}
                            </button>
                        ))}
                    </div>
                    {mode === "register" && <Input label="Full Name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" />}
                    <Input label="Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
                    <Input label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" />
                    {mode === "register" && <>
                        <Input label="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91-9XXXXXXXXX" />
                        <Select label="Role" value={form.role} onChange={e => set("role", e.target.value)} options={[{ value: "Resident", label: "Resident" }, { value: "Driver", label: "Driver" }]} />
                        <Input label="Address" value={form.address} onChange={e => set("address", e.target.value)} placeholder="Your locality" />
                    </>}
                    {err && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
                    <Btn onClick={submit} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
                        {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
                    </Btn>
                </div>
            </div>
        </div>
    );
}
