import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

// just for the UI, the server checks auth anyway
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}
