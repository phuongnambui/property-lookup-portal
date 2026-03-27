import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import PropertyDetail from './pages/PropertyDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Persistent background — only mounts on customer dashboard + detail routes
// Stays alive when navigating between the two so Ken Burns never resets
function CustomerBackground() {
  const location = useLocation();
  const isCustomerPage =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/property/');

  if (!isCustomerPage) return null;

  return <div className="customer-bg" />;
}

function App() {
  return (
    <Router>
      <div className="App">
        <CustomerBackground />
        <Routes>
          <Route path="/"                element={<CustomerLogin />} />
          <Route path="/dashboard"       element={<CustomerDashboard />} />
          <Route path="/property/:id"    element={<PropertyDetail />} />
          <Route path="/admin"           element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;