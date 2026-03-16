import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { residentAPI } from '../services/api';
import { Badge, Card, Stat, Btn, CAT_COLORS, STATUS_COLORS } from '../components/ui';

import { QRCodeSVG } from 'qrcode.react';

function ResidentHome({ setTab, pickups }) {
    const active = pickups.filter(p => p.status !== "Completed");
    const completed = pickups.filter(p => p.status === "Completed");

    // Calculate rewards from real backend payload (which includes p.reward)
    const totalPoints = pickups.reduce((acc, p) => acc + (p.reward?.points || 0), 0);
    const totalEarned = pickups.reduce((acc, p) => acc + (p.reward?.paymentAmount || 0), 0);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>Welcome back 👋</h2>
                <p style={{ color: "#6b7280", marginTop: 4 }}>Your recycling dashboard</p>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <Stat label="Eco Points" value={totalPoints} accent="#0F6E56" />
                <Stat label="Total Earned" value={`₹${totalEarned.toFixed(2)}`} />
                <Stat label="Active Pickups" value={active.length} />
                <Stat label="Completed" value={completed.length} />
            </div>
            {active.length > 0 && (
                <Card style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 14 }}>Active pickups</div>
                    {active.map(p => (
                        <div key={p._id || p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid #f3f4f6" }}>
                            <div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                                    <Badge label={p.wasteCategory || p.waste_category} color={{ bg: CAT_COLORS[p.wasteCategory || p.waste_category] + "22", text: CAT_COLORS[p.wasteCategory || p.waste_category] }} />
                                    <Badge label={p.status} color={STATUS_COLORS[p.status]} />
                                </div>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>{p.address}</div>
                            </div>
                            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                                {p.qrCode && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                        <div style={{ background: 'white', padding: 4, borderRadius: 4, border: '1px solid #e5e7eb' }}>
                                            <QRCodeSVG value={p.qrCode} size={48} level="L" />
                                        </div>
                                        <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>{p.qrCode}</div>
                                    </div>
                                )}
                                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{new Date(p.pickupTime || p.pickup_time).toLocaleDateString("en-IN")}</div>
                            </div>
                        </div>
                    ))}
                </Card>
            )}
            <Btn onClick={() => setTab("request")}>+ Schedule New Pickup</Btn>
        </div>
    );
}

function PickupHistory({ pickups }) {
    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>My Pickup History</h2>
            {pickups.length === 0 && <div style={{ color: "#6b7280" }}>No pickups requested yet.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pickups.map(p => {
                    const cat = p.wasteCategory || p.waste_category;
                    return (
                        <Card key={p._id || p.id}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                        <Badge label={cat} color={{ bg: CAT_COLORS[cat] + "22", text: CAT_COLORS[cat] }} />
                                        <Badge label={p.status} color={STATUS_COLORS[p.status]} />
                                    </div>
                                    <div style={{ fontSize: 13, color: "#6b7280" }}>{p.address}</div>
                                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{new Date(p.pickupTime || p.pickup_time).toLocaleString("en-IN")}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    {(p.actualWeight || p.actual_weight) && <div style={{ fontSize: 13, fontWeight: 700 }}>{p.actualWeight || p.actual_weight} kg</div>}
                                    {p.reward?.points ? <div style={{ fontSize: 12, color: "#0F6E56", fontWeight: 600 }}>+{p.reward.points} pts</div> : null}
                                    {p.reward?.paymentAmount ? <div style={{ fontSize: 12, color: "#185FA5" }}>₹{p.reward.paymentAmount}</div> : null}
                                    {p.qrCode && <div style={{ fontSize: 11, fontFamily: "monospace", color: "#9ca3af", marginTop: 4 }}>{p.qrCode}</div>}
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}

function Rewards({ pickups }) {
    const totalPoints = pickups.reduce((acc, p) => acc + (p.reward?.points || 0), 0);
    const totalEarned = pickups.reduce((acc, p) => acc + (p.reward?.paymentAmount || 0), 0);
    const rewardsCount = pickups.filter(p => p.reward).length;

    return (
        <div style={{ maxWidth: 600 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>My Rewards</h2>
            <Card style={{ marginBottom: 20, textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: "#0F6E56", fontFamily: "monospace" }}>{totalPoints}</div>
                <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>eco-points available</div>
                <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <Btn>Redeem Points</Btn>
                    <Btn variant="secondary">Transfer via UPI</Btn>
                </div>
            </Card>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <Stat label="Total Earned" value={`₹${totalEarned.toFixed(2)}`} />
                <Stat label="Transactions" value={rewardsCount} />
            </div>
            <Card>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 14 }}>Point rate card</div>
                {[["E-Waste", 50], ["Metal", 30], ["Plastic", 15], ["Glass", 10], ["Paper", 8]].map(([cat, rate]) => (
                    <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #f3f4f6", fontSize: 13 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: CAT_COLORS[cat], display: "inline-block" }} />
                            {cat}
                        </span>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0F6E56" }}>{rate} pts/kg</span>
                    </div>
                ))}
            </Card>
        </div>
    );
}

export default function ResidentDashboard({ tab, setTab }) {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const { data } = await residentAPI.getHistory();
            setPickups(data);
        } catch (err) {
            console.error("Failed to load pickups", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData, tab]); // Re-load when returning to dashboard

    if (loading) return <div>Loading dashboard...</div>;

    if (tab === "home") return <ResidentHome setTab={setTab} pickups={pickups} />;
    if (tab === "history") return <PickupHistory pickups={pickups} />;
    if (tab === "rewards") return <Rewards pickups={pickups} />;

    return null;
}
