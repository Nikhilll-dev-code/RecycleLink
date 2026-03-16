import React, { useState, useEffect, useCallback } from 'react';
import { driverAPI } from '../services/api';
import { wsService } from '../services/websocket';
import { Card, Stat, Btn, Badge, Input, CAT_COLORS, STATUS_COLORS } from '../components/ui';
import MapView from '../components/MapView';
import QRScanner from '../components/QRScanner';

function DriverHome({ pickups }) {
    const [active, setActive] = useState(null);

    // Track location and send via WebSocket
    useEffect(() => {
        let watchId;
        if ("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    wsService.sendLocationUpdate(position.coords.latitude, position.coords.longitude);
                },
                (err) => console.error("Geolocation error", err),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const completedCount = pickups.filter(p => p.status === 'Completed').length;
    const pendingCount = pickups.filter(p => p.status !== 'Completed').length;

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Today's Pickups</h2>
                <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                    <Stat label="Assigned" value={pendingCount} />
                    <Stat label="Completed Today" value={completedCount} accent="#0F6E56" />
                    <Stat label="Live Tracking" value="Active" accent="#185FA5" />
                </div>
            </div>

            <div style={{ marginBottom: 20, height: 300, borderRadius: 12, overflow: "hidden" }}>
                <MapView
                    markers={pickups.filter(p => p.status !== 'Completed').map(p => ({
                        lat: p.locationLat || 17.44, lng: p.locationLng || 78.50, label: p.wasteCategory || "P"
                    }))}
                />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pickups.map((p, i) => (
                    <Card key={p._id || p.id} style={{ cursor: "pointer", border: active === (p._id || p.id) ? "1.5px solid #1D9E75" : "0.5px solid #e5e7eb" }} onClick={() => setActive(active === (p._id || p.id) ? null : (p._id || p.id))}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#0F6E56", flexShrink: 0 }}>{i + 1}</div>
                                <div>
                                    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                        <Badge label={p.wasteCategory || p.waste_category} color={{ bg: CAT_COLORS[p.wasteCategory || p.waste_category] + "22", text: CAT_COLORS[p.wasteCategory || p.waste_category] }} />
                                        <Badge label={p.status} color={STATUS_COLORS[p.status]} />
                                    </div>
                                    <div style={{ fontSize: 13, color: "#374151" }}>{p.address}</div>
                                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{new Date(p.pickupTime || p.pickup_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                                </div>
                            </div>
                            <span style={{ fontSize: 18, color: "#9ca3af" }}>{active === (p._id || p.id) ? "▲" : "▼"}</span>
                        </div>
                        {active === (p._id || p.id) && (
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "0.5px solid #f3f4f6" }}>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <Btn style={{ flex: 1, justifyContent: "center" }} onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const lat = p.locationLat;
                                        const lng = p.locationLng;
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank'); 
                                    }}>Navigate →</Btn>
                                    <Btn variant="secondary" style={{ flex: 1, justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${p.residentPhone || ''}`; }}>Call Resident</Btn>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
                {pickups.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>No pickups assigned today.</div>}
            </div>
        </div>
    );
}

function VerifyPickup({ loadData }) {
    const [qr, setQr] = useState("");
    const [weight, setWeight] = useState("");
    const [result, setResult] = useState(null);
    const [err, setErr] = useState("");
    const [mode, setMode] = useState("scan"); // "scan" or "manual"

    const verify = async (codeToVerify) => {
        const finalQr = codeToVerify || qr;
        if (!finalQr || !weight) {
            setErr("Please provide both QR code and actual weight in kg");
            return;
        }
        setErr("");
        try {
            const res = await driverAPI.verifyPickup({ qrCode: finalQr, actualWeight: parseFloat(weight) });
            setResult(res.data);
            loadData(); // refresh list
        } catch (e) {
            setErr(e.response?.data?.error || e.message || "Verification failed");
        }
    };

    const onScanSuccess = (decodedText) => {
        setMode("manual");
        setQr(decodedText);
        // If we already have weight, auto verify
        if (weight) verify(decodedText);
    };

    if (result) return (
        <Card style={{ maxWidth: 420, margin: "0 auto", textAlign: "center", padding: "40px 32px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Pickup Verified!</div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>{result.pickup.wasteCategory} • {result.pickup.actualWeight}kg</div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <Stat label="Points Awarded" value={result.reward?.points} accent="#0F6E56" />
                <Stat label="Payment" value={`₹${result.reward?.payment || result.reward?.paymentAmount || 0}`} />
            </div>
            <Btn style={{ marginTop: 20 }} onClick={() => { setResult(null); setQr(""); setWeight(""); setMode("scan"); }}>Verify Next Pickup</Btn>
        </Card>
    );

    return (
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Verify Pickup</h2>
                <button onClick={() => setMode(mode === 'scan' ? 'manual' : 'scan')} style={{ fontSize: 12, background: 'none', border: 'none', color: '#0F6E56', cursor: 'pointer', fontWeight: 600 }}>
                    {mode === 'scan' ? 'Manual Entry' : 'Scan QR'}
                </button>
            </div>

            <Card>
                {mode === 'scan' ? (
                    <div style={{ marginBottom: 20, textAlign: "center" }}>
                        <QRScanner onScanSuccess={onScanSuccess} />
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 12 }}>Position the QR code within the frame to scan</div>
                        <div style={{ marginTop: 16 }}>
                            <Input label="Actual Weight (kg)" type="number" min="0" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 4.5" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ background: "#f9fafb", border: "1.5px dashed #d1d5db", borderRadius: 10, padding: "32px", textAlign: "center", marginBottom: 20 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                            <div style={{ fontSize: 13, color: "#6b7280" }}>Scan household QR code</div>
                            <Btn onClick={() => setMode("scan")} variant="secondary" style={{ marginTop: 12 }}>Open Scanner</Btn>
                        </div>
                        <Input label="QR Code" value={qr} onChange={e => setQr(e.target.value)} placeholder="RL-XXXXXXXX" />
                        <Input label="Actual Weight (kg)" type="number" min="0" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 4.5" />
                    </>
                )}

                {err && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
                <Btn onClick={() => verify()} disabled={!qr || !weight} style={{ width: "100%", justifyContent: "center" }}>Confirm Collection ✓</Btn>
            </Card>
        </div>
    );
}

export default function DriverDashboard({ tab, setTab }) {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const res = await driverAPI.getRoutes();
            setPickups(res.data.pickups || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData, tab]);

    if (loading) return <div>Loading route...</div>;

    if (tab === "home") return <DriverHome pickups={pickups} />;
    if (tab === "verify") return <VerifyPickup loadData={loadData} />;

    return null;
}
