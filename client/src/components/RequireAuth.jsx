import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

// UI convenience only: the real check is requireAuth on the server
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}
