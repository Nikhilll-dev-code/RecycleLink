import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthScreen from './pages/AuthScreen';
import Layout from './components/layout/Layout';
import ResidentDashboard from './pages/ResidentDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NewPickup from './pages/NewPickup';

function DashboardRouter() {
  const { user } = useAuth();

  const defaultTab = user?.role === "Resident" ? "home" : "home";
  const [tab, setTab] = useState(defaultTab);

  const renderComponent = () => {
    if (user?.role === "Resident") {
      if (tab === "request") return <NewPickup />;
      return <ResidentDashboard tab={tab} setTab={setTab} />;
    }
    if (user?.role === "Driver") {
      return <DriverDashboard tab={tab} setTab={setTab} />;
    }
    if (user?.role === "Admin") {
      return <AdminDashboard tab={tab} setTab={setTab} />;
    }
    return null;
  };

  return <Layout tab={tab} setTab={setTab}>{renderComponent()}</Layout>;
}

export default function App() {
  const { user } = useAuth();
  return user ? <DashboardRouter /> : <AuthScreen />;
}
