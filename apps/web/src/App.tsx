import { useState } from 'react';
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { LoginForm } from './features/auth/LoginForm';
import { SetPasswordPage } from './features/auth/SetPasswordPage';
import { useSession } from './features/auth/useSession';
import { Layout } from './components/Layout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ClientsListPage } from './features/clients/ClientsListPage';
import { ClientCreatePage } from './features/clients/ClientCreatePage';
import { ClientEditPage } from './features/clients/ClientEditPage';
import { AgreementsListPage } from './features/agreements/AgreementsListPage';
import { AgreementCreatePage } from './features/agreements/AgreementCreatePage';
import { AgreementEditPage } from './features/agreements/AgreementEditPage';
import { LicencesListPage } from './features/licences/LicencesListPage';
import { LicenceCreatePage } from './features/licences/LicenceCreatePage';
import { LicenceEditPage } from './features/licences/LicenceEditPage';
import { UsersListPage } from './features/users/UsersListPage';
import { AdminRoute } from './components/AdminRoute';

function App() {
  const { session, loading } = useSession();
  const [isRecovery, setIsRecovery] = useState(() => /type=(invite|recovery)/.test(window.location.hash));

  if (loading) return null;
  if (isRecovery) return <SetPasswordPage onDone={() => setIsRecovery(false)} />;
  if (!session) return <LoginForm />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clients" element={<ClientsListPage />} />
          <Route path="clients/new" element={<ClientCreatePage />} />
          <Route path="clients/:id/edit" element={<ClientEditPage />} />
          <Route path="agreements" element={<AgreementsListPage />} />
          <Route path="agreements/new" element={<AgreementCreatePage />} />
          <Route path="agreements/:id/edit" element={<AgreementEditPage />} />
          <Route path="licences" element={<LicencesListPage />} />
          <Route path="licences/new" element={<LicenceCreatePage />} />
          <Route path="licences/:id/edit" element={<LicenceEditPage />} />
          <Route
            path="users"
            element={
              <AdminRoute>
                <UsersListPage />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
