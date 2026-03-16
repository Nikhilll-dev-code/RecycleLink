import React from 'react';

export const CAT_COLORS = {
    "E-Waste": "#534AB7", "Metal": "#185FA5", "Plastic": "#3B6D11",
    "Glass": "#993C1D", "Paper": "#854F0B", "Organic": "#0F6E56", "Other": "#5F5E5A"
};

export const STATUS_COLORS = {
    "Pending": { bg: "#FAEEDA", text: "#854F0B" },
    "Assigned": { bg: "#E1F5EE", text: "#0F6E56" },
    "In Transit": { bg: "#E6F1FB", text: "#185FA5" },
    "Completed": { bg: "#EAF3DE", text: "#3B6D11" },
    "Cancelled": { bg: "#FCEBEB", text: "#A32D2D" },
};

export const Badge = ({ label, color }) => (
    <span style={{ background: color?.bg || "#F1EFE8", color: color?.text || "#444", fontSize: 11, fontFamily: "monospace", fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{label}</span>
);

export const Card = ({ children, style = {}, onClick }) => (
    <div onClick={onClick} style={{ background: "white", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", ...style }}>{children}</div>
);

export const Stat = ({ label, value, sub, accent }) => (
    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "1.2px", fontFamily: "monospace", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: accent || "#111", fontFamily: "monospace" }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "#10B981", marginTop: 2 }}>{sub}</div>}
    </div>
);

export const Btn = ({ children, onClick, variant = "primary", style = {}, disabled }) => {
    const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", transition: "all .15s", opacity: disabled ? 0.5 : 1 };
    const variants = {
        primary: { background: "#1D9E75", color: "white" },
        secondary: { background: "transparent", color: "#374151", border: "0.5px solid #d1d5db" },
        danger: { background: "#D85A30", color: "white" },
    };
    return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>{children}</button>;
};

export const Input = ({ label, ...props }) => (
    <div style={{ marginBottom: 14 }}>
        {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>{label}</label>}
        <input style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", background: "white", boxSizing: "border-box" }} {...props} />
    </div>
);

export const Select = ({ label, options, ...props }) => (
    <div style={{ marginBottom: 14 }}>
        {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>{label}</label>}
        <select style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", background: "white", boxSizing: "border-box" }} {...props}>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);
