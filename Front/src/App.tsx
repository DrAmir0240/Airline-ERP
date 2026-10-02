import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AdminLayout from './layouts/AdminLayout';

import 'leaflet/dist/leaflet.css';
function App() {
  return (
    <BrowserRouter>
      <AdminLayout />
    </BrowserRouter>
  );
}

export default App;