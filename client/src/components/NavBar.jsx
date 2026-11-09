import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand bg-dark" data-bs-theme="dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Articles</Link>
        <ul className="navbar-nav me-auto">
          <li className="nav-item"><NavLink className="nav-link" to="/" end>Read</NavLink></li>
          {user && <li className="nav-item"><NavLink className="nav-link" to="/admin">Admin</NavLink></li>}
        </ul>
        {user ? (
          <div className="d-flex align-items-center gap-2">
            <span className="navbar-text">{user.username}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Log out</button>
          </div>
        ) : (
          <Link className="btn btn-outline-light btn-sm" to="/login">Log in</Link>
        )}
      </div>
    </nav>
  );
}
