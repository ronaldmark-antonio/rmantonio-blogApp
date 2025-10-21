import { useState, useRef } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import logo from '../images/blogpad-logo.png';

export default function Register() {
  const notyf = useRef(new Notyf({ duration: 2000, ripple: true })).current;
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isActive = email !== '' && password !== '' && confirmPassword !== '' && password === confirmPassword;

  const registerUser = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch('https://rmantonio-blogapp.onrender.com/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdmin: false }),
      });

      const data = await res.json();

      if (res.ok && data.message === 'Registered Successfully') {
        notyf.success('Registration Successful!');

          setEmail('');
          setPassword('');
          setConfirmPassword('');

          navigate('/login');

      } else if (data.error === 'Password must be at least 8 characters') {

          notyf.error('Password must be at least 8 characters');

      } else {

          notyf.error(data.message || 'Registration failed. Please try again.');

      }
    } catch (err) {

        console.error(err);

        notyf.error('Network error. Please try again.');

    } finally {
        setLoading(false);
    }
  };

  return (
    <Container 
      className="d-flex align-items-center justify-content-center min-vh-100 bg-gradient" 
      style={{ maxWidth: '500px', padding: '20px' }}
    >
      <Row className="w-100 justify-content-center">
        <Col md={12}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              <img
                src={logo}
                alt="BlogPad Logo"
                className="img-fluid mb-3"
                style={{ maxWidth: '200px' }}
              />

              <h2 className="fw-bold mb-4 text-dark">Register</h2>

              <Form onSubmit={registerUser}>
                <Form.Group controlId="userEmail" className="mb-3 text-start">
                  <Form.Label className="fw-semibold">Email Address:</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ borderRadius: '0' }}
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-3 text-start">
                  <Form.Label className="fw-semibold">Password:</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ borderRadius: '0' }} 
                  />
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="mb-4 text-start">
                  <Form.Label className="fw-semibold">Confirm Password:</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ borderRadius: '0' }} 
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="dark"
                    type="submit"
                    disabled={!isActive || loading}
                    size="lg"
                    style={{ borderRadius: '0' }} 
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
                        Registering...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
              </Form>

              <div className="mt-4">
                <p className="mb-0">
                  Already have an account?{' '}
                  <a href="/login" className="text-decoration-none fw-semibold text-dark">
                    Login
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
