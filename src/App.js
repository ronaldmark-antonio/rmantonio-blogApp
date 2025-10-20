import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Posts from './pages/Posts';
import UserProvider from './UserContext';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import ViewPost from './components/ViewPost';

function App() {

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');

      return storedUser ? JSON.parse(storedUser) : { id: null, isAdmin: false };

    } catch {
        return { id: null, isAdmin: false };
    }

  });

  const [loading, setLoading] = useState(true);

  const unsetUser = () => {
    localStorage.clear();

    setUser({ id: null, isAdmin: false });

  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser({ id: null, isAdmin: false });

      setLoading(false);

      return;
    }

    fetch('https://rmantonio-blogapp.onrender.com/users/details', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {

          if (!res.ok) throw new Error('Invalid token');
            
            return res.json();
      })
      .then((data) => {
        
        if (data.user) {
          
          const userData = {
            id: data.user._id,

            isAdmin: data.user.isAdmin,
          };

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

        } else {
            unsetUser();
        }
      })
      .catch(() => unsetUser())
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const RedirectIfLoggedIn = ({ children }) => {
    return user.id ? <Navigate to="/posts" replace /> : children;
  };

  const ProtectedRoute = ({ children }) => {
    return user.id ? children : <Navigate to="/login" replace />;
  };

  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <Router>
        <Container>
          <Routes>
            <Route
              path="/register"
              element={
                <RedirectIfLoggedIn>
                  <Register />
                </RedirectIfLoggedIn>
              }
            />
            <Route
              path="/login"
              element={
                <RedirectIfLoggedIn>
                  <Login />
                </RedirectIfLoggedIn>
              }
            />

            <Route path="/" element={<Navigate to="/posts" replace />} />
            
            <Route
              path="/posts"
              element={
                <ProtectedRoute>
                  {user.isAdmin ? <AdminView /> : <UserView />}
                </ProtectedRoute>
              }
            />

            <Route path="/post/:id" element={<ViewPost />} />
          </Routes>
        </Container>
      </Router>
    </UserProvider>
  );
}

export default App;
