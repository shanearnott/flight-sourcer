import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SearchesList from './pages/SearchesList';
import CreateSearch from './pages/CreateSearch';
import SearchDetail from './pages/SearchDetail';
import PriceHistory from './pages/PriceHistory';
import AlertLog from './pages/AlertLog';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="searches" element={<SearchesList />} />
        <Route path="searches/new" element={<CreateSearch />} />
        <Route path="search/:id" element={<SearchDetail />} />
        <Route path="history" element={<PriceHistory />} />
        <Route path="alerts" element={<AlertLog />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
