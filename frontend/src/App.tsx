import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { BuyerRequirementsPage } from './pages/BuyerRequirementsPage';
import { MatchingEnginePage } from './pages/MatchingEnginePage';
import { ExchangeManagerPage } from './pages/ExchangeManagerPage';
import { MLAnalyticsPage } from './pages/MLAnalyticsPage';
import { EnvironmentalImpactPage } from './pages/EnvironmentalImpactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { BuyerRequirement, WasteListing } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedReqForMatch, setSelectedReqForMatch] = useState<BuyerRequirement | null>(null);
  const [selectedListingForExchange, setSelectedListingForExchange] = useState<WasteListing | null>(null);

  const handleSelectRequirementForMatch = (req: BuyerRequirement) => {
    setSelectedReqForMatch(req);
    setActiveTab('matching');
  };

  const handleSelectListingForExchange = (listing: WasteListing) => {
    setSelectedListingForExchange(listing);
    setActiveTab('marketplace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 py-8">
        {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === 'marketplace' && (
          <MarketplacePage 
            setActiveTab={setActiveTab} 
            onSelectListingForExchange={handleSelectListingForExchange}
          />
        )}
        {activeTab === 'requirements' && (
          <BuyerRequirementsPage 
            setActiveTab={setActiveTab} 
            onSelectRequirementForMatch={handleSelectRequirementForMatch}
          />
        )}
        {activeTab === 'matching' && (
          <MatchingEnginePage 
            selectedRequirement={selectedReqForMatch} 
            setActiveTab={setActiveTab}
            onInitiateExchange={handleSelectListingForExchange}
          />
        )}
        {activeTab === 'exchanges' && <ExchangeManagerPage setActiveTab={setActiveTab} />}
        {activeTab === 'analytics' && <MLAnalyticsPage />}
        {activeTab === 'impact' && <EnvironmentalImpactPage />}
        {activeTab === 'admin' && <AdminDashboardPage />}
        {activeTab === 'about' && <AboutPage />}
        {activeTab === 'login' && <LoginPage setActiveTab={setActiveTab} />}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
