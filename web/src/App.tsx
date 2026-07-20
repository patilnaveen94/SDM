import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicSite } from './pages/PublicSite';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { DashboardPage } from './admin/DashboardPage';
import { GearPage } from './admin/GearPage';
import { OrdersPage } from './admin/OrdersPage';
import { UpdatesPage } from './admin/UpdatesPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<PublicSite />} />

        {/* Admin routes — accessed via /admin URL directly */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/gear" element={<GearPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/updates" element={<UpdatesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
