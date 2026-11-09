import { Navigate, Route, Routes } from 'react-router';
import NavBar from './components/NavBar.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import ReaderPage from './pages/ReaderPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <>
      <NavBar />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<ReaderPage />} />
          <Route path="/articles/:id" element={<ArticlePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
