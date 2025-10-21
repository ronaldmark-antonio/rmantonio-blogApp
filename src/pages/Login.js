import { useState, useContext, useRef } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import UserContext from '../UserContext';
import logo from '../images/blogpad-logo.png';

export default function Login() {
  const notyf = useRef(new Notyf({ duration: 2000, ripple: true })).current;
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isActive = email !== '' && password !== '';

  const authenticate = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const res = await fetch('https://rmantonio-blogapp.onrender.com/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.access) {

        const token = data.access;

        localStorage.setItem('token', token);
        notyf.success('Login successful!');

        const userData = await retrieveUserDetails(token);

        if (userData) {

          setUser(userData);

          localStorage.setItem('user', JSON.stringify(userData));

          navigate('/posts');

        } else {

          notyf.error('Failed to load user details.');

        }

      } else if (data.message === 'Email and password do not match') {
          
          notyf.error('Incorrect credentials. Try Again.');

      } else {
        
        notyf.error(data.message || 'User Not Found. Try Again.');
      
      }

    } catch (err) {

        console.error(err);

        notyf.error('Network error. Please try again.');

    } finally {
        setEmail('');
        setPassword('');
        setLoading(false);
      }
  };

  const retrieveUserDetails = async (token) => {
    try {

      const res = await fetch('https://rmantonio-blogapp.onrender.com/users/details', {
        headers: { Authorization: `Bearer ${token}` },
        
      });

      const data = await res.json();

      if (data.user) {
        return {
          id: data.user._id,
          isAdmin: data.user.isAdmin,
          isLoading: false,
        };
      }

      return null;

    } catch (err) {

        console.error('Failed to retrieve user details:', err);
        
      return null;
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg border-0 rounded-1">
            <Card.Body className="p-5 text-center">
              
              <img
                src={logo}
                alt="StreamFlix Logo"
                className="img-fluid mb-3"
                style={{ maxWidth: '200px' }}
              />

              <h2 className="fw-bold mb-4 text-dark">Login</h2>

              <Form onSubmit={authenticate}>
                <Form.Group controlId="userEmail" className="mb-3 text-start">
                  <Form.Label>Email Address:</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-4 text-start">
                  <Form.Label>Password:</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="dark"
                    type="submit"
                    disabled={!isActive || loading}
                    size="lg"
                    className="rounded-3"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />{' '}
                        Logging in...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
              </Form>

              <div className="mt-4">
                <p className="mb-0">
                  Don’t have an account?{' '}
                  <a href="/register" className="text-decoration-none fw-semibold text-dark">
                    Register
                  </a>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
