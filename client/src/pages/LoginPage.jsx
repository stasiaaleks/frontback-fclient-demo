import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-sm-8 col-md-5 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h1 className="h4 mb-3">Log in</h1>
            <ErrorAlert message={error} onClose={() => setError(null)} />
            <form onSubmit={handleSubmit}>
              <input className="form-control mb-2" placeholder="Username" autoComplete="username"
                value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input className="form-control mb-3" type="password" placeholder="Password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" className="btn btn-primary w-100">Log in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
