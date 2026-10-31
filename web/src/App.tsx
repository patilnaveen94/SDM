import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicSite } from './pages/PublicSite';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { DashboardPage } from './admin/DashboardPage';
import { GearPage } from './admin/GearPage';
import { InventoryPage } from './admin/InventoryPage';
import { OrdersPage } from './admin/OrdersPage';
import { ReportsPage } from './admin/ReportsPage';
import { UpdatesPage } from './admin/UpdatesPage';
import { MediaPage } from './admin/MediaPage';
import { PartnersPage } from './admin/PartnersPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<PublicSite />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/gear" element={<GearPage />} />
          <Route path="/admin/inventory" element={<InventoryPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/updates" element={<UpdatesPage />} />
          <Route path="/admin/media" element={<MediaPage />} />
          <Route path="/admin/partners" element={<PartnersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
