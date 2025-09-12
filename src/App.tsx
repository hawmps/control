import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui';
import Layout from './components/layout/Layout';

// Import pages
import Items from './pages/Items';
import EnvironmentsManagement from './pages/EnvironmentsManagement';
import Controls from './pages/Controls';
import Documents from './pages/Documents';
import ManageStatus from './pages/ManageStatus';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <Layout 
                appName="Security Control Tracker"
              />
            }
          >
            <Route index element={<Items />} />
            <Route path="items-management" element={<EnvironmentsManagement />} />
            <Route path="controls" element={<Controls />} />
            <Route path="documents" element={<Documents />} />
            <Route path="manage-status" element={<ManageStatus />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;