import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ScannerPage from './pages/ScannerPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import EducationPage from './pages/EducationPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'scanner':
        return <ScannerPage />;
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'history':
        return <HistoryPage />;
      case 'education':
        return <EducationPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <ScannerPage />;
    }
  };

  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main style={{ flex: 1 }}>
          {renderActivePage()}
        </main>
        <Footer setActiveTab={setActiveTab} />
        <AuthModal />
      </div>
    </AuthProvider>
  );
}
