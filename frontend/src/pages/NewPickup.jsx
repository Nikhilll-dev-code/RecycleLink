import React, { useState } from 'react';
import { residentAPI } from '../services/api';
import { Card, Select, Input, Btn, CAT_COLORS } from '../components/ui';
import MapView from '../components/MapView';

import { QRCodeSVG } from 'qrcode.react';

export default function NewPickup() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        wasteCategory: "E-Waste",
        estimatedWeight: "",
        pickupTime: "",
        address: "",
        notes: "",
        locationLat: 17.3850,
        locationLng: 78.4867
    });
    const [done, setDone] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async () => {
        setSubmitting(true);
        setErr("");
        try {
            const res = await residentAPI.requestPickup(form);
            setDone(res.data);
        } catch (e) {
            setErr(e.response?.data?.error || e.message || "Failed to submit request");
        } finally {
            setSubmitting(false);
        }
    };

    if (done) return (
        <Card style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "40px 32px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Pickup Scheduled!</div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>Your driver will verify collection using this QR code.</div>
            <div style={{ background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 8, padding: "16px 24px", marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <QRCodeSVG value={done.qrCode} size={150} level="M" includeMargin={true} />
                <div style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: "#0F6E56", marginTop: 12 }}>{done.qrCode}</div>
            </div>
            <Btn onClick={() => { setDone(null); setStep(1); }}>Schedule Another</Btn>
        </Card>
    );

    const steps = ["Category & Weight", "Location & Time", "Confirm"];

    return (
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>New Pickup Request</h2>
                <div style={{ display: "flex", gap: 8 }}>
                    {steps.map((s, i) => (
                        <div key={i} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ height: 4, borderRadius: 2, background: step > i ? "#0F6E56" : "#e5e7eb", marginBottom: 6 }} />
                            <div style={{ fontSize: 11, color: step > i ? "#0F6E56" : "#9ca3af", fontWeight: step === i + 1 ? 700 : 400 }}>{s}</div>
                        </div>
                    ))}
                </div>
            </div>

            <Card>
                {step === 1 && <>
                    <Select label="Waste Category" value={form.wasteCategory} onChange={e => set("wasteCategory", e.target.value)}
                        options={["E-Waste", "Metal", "Plastic", "Glass", "Paper", "Organic", "Other"].map(c => ({ value: c, label: c }))} />
                    <Input label="Estimated Weight (kg)" type="number" min="0.5" value={form.estimatedWeight} onChange={e => set("estimatedWeight", e.target.value)} placeholder="e.g. 5" />
                    <Input label="Notes (optional)" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any special instructions" />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                        {["E-Waste", "Metal", "Plastic", "Glass", "Paper"].map(c => (
                            <button key={c} onClick={() => set("wasteCategory", c)}
                                style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${form.wasteCategory === c ? CAT_COLORS[c] : "#e5e7eb"}`, background: form.wasteCategory === c ? CAT_COLORS[c] + "18" : "white", color: form.wasteCategory === c ? CAT_COLORS[c] : "#374151", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                {c}
                            </button>
                        ))}
                    </div>
                </>}

                {step === 2 && <>
                    <Input label="Pickup Address" value={form.address} onChange={e => set("address", e.target.value)} placeholder="House/Flat, Street, Area" />
                    <Input label="Preferred Pickup Time" type="datetime-local" value={form.pickupTime} onChange={e => set("pickupTime", e.target.value)} />
                    <div style={{ height: 200, width: "100%", marginTop: 12, borderRadius: 8, overflow: "hidden", border: "1px solid #d1d5db" }}>
                        <MapView
                            selectable
                            center={{ lat: form.locationLat, lng: form.locationLng }}
                            markers={[{ lat: form.locationLat, lng: form.locationLng, label: "Here" }]}
                            onLocationSelect={(loc) => {
                                set("locationLat", loc.lat);
                                set("locationLng", loc.lng);
                            }}
                        />
                    </div>
                    <div style={{ background: "#E1F5EE", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#0F6E56", marginTop: 8 }}>
                        📍 Tap on the map to fine-tune your exact location.
                    </div>
                </>}

                {step === 3 && <>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Review your request</div>
                    {[["Category", form.wasteCategory], ["Est. Weight", `${form.estimatedWeight} kg`], ["Address", form.address], ["Pickup Time", form.pickupTime ? new Date(form.pickupTime).toLocaleString("en-IN") : "—"], ["Notes", form.notes || "—"]].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #f3f4f6", fontSize: 13 }}>
                            <span style={{ color: "#6b7280" }}>{k}</span>
                            <span style={{ fontWeight: 600, color: "#111", textAlign: "right", maxWidth: "60%" }}>{v}</span>
                        </div>
                    ))}
                    {err && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginTop: 14 }}>{err}</div>}
                </>}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                    {step > 1 ? <Btn variant="secondary" onClick={() => setStep(s => s - 1)}>← Back</Btn> : <span />}
                    {step < 3
                        ? <Btn onClick={() => setStep(s => s + 1)}>Next →</Btn>
                        : <Btn onClick={submit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request ✓'}</Btn>
                    }
                </div>
            </Card>
        </div>
    );
}
