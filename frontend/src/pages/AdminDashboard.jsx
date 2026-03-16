import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { wsService } from '../services/websocket';
import { Card, Stat, Btn, Badge, CAT_COLORS, STATUS_COLORS } from '../components/ui';
import MapView from '../components/MapView';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

function AdminHome({ analytics, fleetList, loadData }) {
    if (!analytics) return <div>Loading analytics...</div>;
    const { summary, byCategory, trend, recentPickups } = analytics;

    const assignDriver = async (pickupId, driverId) => {
        try {
            await adminAPI.assignDriver({ pickupId, driverId });
            loadData(); // Refresh analytics and fleet
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Fleet Overview</h2>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Live · {new Date().toLocaleString("en-IN")}</span>
                </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <Stat label="Total Requests" value={summary?.totalRequests || summary?.total_requests || 0} />
                <Stat label="Completed" value={summary?.completed || 0} accent="#0F6E56" />
                <Stat label="In Progress" value={summary?.inProgress || summary?.in_progress || 0} />
                <Stat label="Diverted" value={`${Math.round(summary?.totalWeightKg || summary?.diverted_kg || 0)}kg`} accent="#185FA5" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <Card>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 14 }}>Material breakdown</div>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={byCategory} dataKey="weightKg" nameKey="wasteCategory" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                                    {byCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CAT_COLORS[entry.wasteCategory] || "#ccc"} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} kg`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 14 }}>Pickup Trend (Last 14 Days)</div>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                                <Tooltip />
                                <Bar dataKey="requests" fill="#0F6E56" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 14 }}>Recent requests</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr style={{ borderBottom: "0.5px solid #e5e7eb" }}>
                            {["Resident", "Category", "Scheduled", "Status", "Action"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "0 8px 10px", fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(recentPickups || []).slice(0, 5).map(p => (
                            <tr key={p.id || p._id} style={{ borderBottom: "0.5px solid #f3f4f6" }}>
                                <td style={{ padding: "10px 8px" }}>{p.resident || `User`}</td>
                                <td style={{ padding: "10px 8px" }}><Badge label={p.wasteCategory} color={{ bg: CAT_COLORS[p.wasteCategory] + "22", text: CAT_COLORS[p.wasteCategory] }} /></td>
                                <td style={{ padding: "10px 8px", color: "#6b7280" }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                                <td style={{ padding: "10px 8px" }}><Badge label={p.status} color={STATUS_COLORS[p.status]} /></td>
                                <td style={{ padding: "10px 8px", fontFamily: "monospace" }}>
                                    {p.status === "Pending" ? (
                                        <select
                                            onChange={(e) => assignDriver(p.id || p._id, e.target.value)}
                                            style={{ padding: "4px", fontSize: "12px", border: "1px solid #d1d5db", borderRadius: 4 }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Assign Driver</option>
                                            {fleetList.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        p.actualWeight ? `${p.actualWeight}kg` : `-`
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

function AdminFleet({ fleetList }) {
    const [fleet, setFleet] = useState(fleetList);

    useEffect(() => {
        // Listen for real-time driver location updates
        const unsubscribe = wsService.addListener((msg) => {
            if (msg.type === 'DRIVER_LOCATION') {
                setFleet(prev => prev.map(d =>
                    d.id === msg.driverId ? { ...d, currentLat: msg.lat, currentLng: msg.lng } : d
                ));
            }
        });
        return unsubscribe;
    }, []);

    const mapMarkers = fleet.filter(d => d.currentLat && d.currentLng).map(d => ({
        lat: d.currentLat, lng: d.currentLng, label: d.name?.substring(0, 1) || 'D'
    }));

    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Fleet Status</h2>
            <div style={{ height: 350, width: "100%", borderRadius: 12, overflow: "hidden", marginBottom: 24, border: "1px solid #d1d5db" }}>
                <MapView markers={mapMarkers} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {fleet.map(d => (
                    <Card key={d.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0F6E56", fontSize: 13 }}>
                                    {(d.name || 'D').split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name || 'Unknown Driver'}</div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>{d.vehicle?.vehicleType || 'Truck'} · {d.vehicle?.licensePlate || 'XX-XXXX'}</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{d.activePickups || 0}</div>
                                    <div style={{ fontSize: 10, color: "#9ca3af" }}>active</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: "#0F6E56" }}>{d.completedToday || 0}</div>
                                    <div style={{ fontSize: 10, color: "#9ca3af" }}>done today</div>
                                </div>
                                <Badge label={d.status} color={{ "Active": { bg: "#E1F5EE", text: "#0F6E56" }, "On Route": { bg: "#E6F1FB", text: "#185FA5" }, "Inactive": { bg: "#f3f4f6", text: "#9ca3af" } }[d.status] || { bg: "#f3f4f6", text: "#9ca3af" }} />
                            </div>
                        </div>
                    </Card>
                ))}
                {fleet.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>No drivers found.</div>}
            </div>
        </div>
    );
}

function AdminReports({ analytics }) {
    return (
        <div style={{ maxWidth: 700 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>EPR Compliance Report</h2>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <Stat label="Diverted from Landfill" value={`${Math.round(analytics?.summary?.totalWeightKg || 0)} kg`} accent="#0F6E56" sub="↑ 23% vs target" />
                <Stat label="Fuel Saved" value="19%" sub="vs baseline route" />
                <Stat label="Avg Response" value="34 min" sub="↓ 36% vs SLA" />
            </div>
            <Card>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 16 }}>SWM 2026 compliance checklist</div>
                {[
                    ["Digital pickup records maintained", true],
                    ["VTS integration active on all vehicles", true],
                    ["Waste category segregation tracked", true],
                    ["EPR report submitted to portal", false],
                    ["IoT bin sensor integration", false],
                ].map(([item, done]) => (
                    <div key={item} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "0.5px solid #f3f4f6", alignItems: "center" }}>
                        <span style={{ fontSize: 16, color: done ? "#0F6E56" : "#d1d5db" }}>{done ? "✓" : "○"}</span>
                        <span style={{ fontSize: 13, color: done ? "#374151" : "#9ca3af" }}>{item}</span>
                    </div>
                ))}
                <div style={{ marginTop: 16 }}>
                    <Btn disabled>Download EPR Report (PDF)</Btn>
                </div>
            </Card>
        </div>
    );
}

export default function AdminDashboard({ tab, setTab }) {
    const [analytics, setAnalytics] = useState(null);
    const [fleet, setFleet] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [analyticsRes, fleetRes] = await Promise.all([
                adminAPI.getAnalytics(),
                adminAPI.getFleet()
            ]);
            setAnalytics(analyticsRes.data);
            setFleet(fleetRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData, tab]);

    if (loading) return <div>Loading dashboard...</div>;

    if (tab === "home") return <AdminHome analytics={analytics} fleetList={fleet} loadData={loadData} />;
    if (tab === "fleet") return <AdminFleet fleetList={fleet} />;
    if (tab === "reports") return <AdminReports analytics={analytics} />;
    // Fallback for Pickups tab, which normally is just PickupHistory or similar admin view.
    if (tab === "pickups") return <AdminHome analytics={analytics} fleetList={fleet} loadData={loadData} />;

    return null;
}
