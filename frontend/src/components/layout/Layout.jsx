import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui';

export default function Layout({ children, tab, setTab }) {
    const { user, logout } = useAuth();
    const nav = user?.role === "Resident"
        ? [{ id: "home", label: "Home" }, { id: "request", label: "New Pickup" }, { id: "history", label: "My Pickups" }, { id: "rewards", label: "Rewards" }]
        : user?.role === "Driver"
            ? [{ id: "home", label: "Today's Route" }, { id: "verify", label: "Verify Pickup" }]
            : [{ id: "home", label: "Overview" }, { id: "fleet", label: "Fleet" }, { id: "pickups", label: "Requests" }, { id: "reports", label: "Reports" }];

    return (
        <div style={{ minHeight: "100vh", background: "#f8faf9", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
            <header style={{ background: "white", borderBottom: "0.5px solid #e5e7eb", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 50 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 15, color: "#0F6E56", letterSpacing: -0.5 }}>RecycleLink</span>
                    <nav style={{ display: "flex", gap: 2 }}>
                        {nav.map(n => (
                            <button key={n.id} onClick={() => setTab(n.id)}
                                style={{ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: tab === n.id ? "#E1F5EE" : "transparent", color: tab === n.id ? "#0F6E56" : "#6b7280", transition: "all .12s" }}>
                                {n.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{user?.name}</span>
                    <Badge label={user?.role} color={{ bg: "#E1F5EE", text: "#0F6E56" }} />
                    <button onClick={logout} style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
                </div>
            </header>
            <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>{children}</main>
        </div>
    );
}
