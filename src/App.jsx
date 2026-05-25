import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { seedData } from './data';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import MapView from './pages/MapView';
import Homecares from './pages/Homecares';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import LoginPaciente from './pages/LoginPaciente';
import PacienteDashboard from './pages/PacienteDashboard';

// Componente para proteger rotas da Área Restrita
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('ef_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  useEffect(() => { seedData(); }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pacientes" element={<Patients />} />
        <Route path="pacientes/:id" element={<PatientDetail />} />
        <Route path="mapa" element={<MapView />} />
        <Route path="homecares" element={<Homecares />} />
        <Route path="agendamentos" element={<Appointments />} />
      </Route>
      <Route path="/paciente/login" element={<LoginPaciente />} />
      <Route path="/paciente/dashboard" element={<PacienteDashboard />} />
    </Routes>
  );
}
