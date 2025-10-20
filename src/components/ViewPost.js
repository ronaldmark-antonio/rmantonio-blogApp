import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Container, Breadcrumb, Button, ListGroup, Spinner } from 'react-bootstrap';
import logo from '../images/blogpad-logo.png';

export default function ViewPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `https://rmantonio-blogapp.onrender.com/posts/getPost/${id}`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error('Failed to fetch post details');

        const data = await res.json();
        setPost(data.post || data); // Use data.post if API wraps response
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  if (error)
    return (
      <Container className="py-5 text-center">
        <h4 className="text-danger">Error:</h4>
        <p>{error}</p>
        <Button variant="dark" onClick={() => navigate('/posts')}>
          &larr; Back to Posts
        </Button>
      </Container>
    );

  if (!post)
    return (
      <Container className="py-5 text-center">
        <p>No post found.</p>
        <Button variant="dark" onClick={() => navigate('/posts')}>
          &larr; Back to Posts
        </Button>
      </Container>
    );

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container className="py-4" style={{ maxWidth: '800px' }}>
        {/* Header with logo only */}
        <div className="mb-4 d-flex align-items-center">
          <img src={logo} alt="BlogPad Logo" style={{ width: '160px', height: 'auto' }} />
        </div>

        <div
          className="mb-4 p-3"
          style={{
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 6px 20px rgba(0, 0, 0, 0.10)',
            height: '60px',
          }}
        >
          <Breadcrumb style={{ fontSize: '1rem', marginBottom: 0 }}>
            <Breadcrumb.Item
              linkAs={Link}
              linkProps={{ to: '/posts' }}
              className="text-muted"
              style={{ fontWeight: 500, textDecoration: 'none' }}
            >
              Posts
            </Breadcrumb.Item>
            <Breadcrumb.Item active style={{ fontWeight: 600, color: '#000' }}>
              {post.title || 'Untitled'}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <Card
          className="border-0 p-3"
          style={{
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 6px 20px rgba(0, 0, 0, 0.10)',
          }}
        >
          <Card.Body>
          <h2 className="fw-bold mb-3">{post.title || 'Untitled'}</h2>

          <Card.Text className="text-dark mb-2">
          <strong>Author:</strong> {post.author_information || 'Unknown'}
          </Card.Text>

          <Card.Text className="text-dark mb-3" style={{ whiteSpace: 'pre-line' }}>
          <strong>Content:</strong> {post.content || 'No content available.'}
          </Card.Text>

          <Card.Text className="text-dark mb-3">
          <strong>Date Added:</strong> {formatDate(post.creationAdded)}
          </Card.Text>

          {Array.isArray(post.comments) && post.comments.length > 0 && (
            <div className="mb-3">
            <strong>Comments:</strong>
            <ListGroup
            variant="flush"
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              marginTop: '8px',
              }}
              >
              {post.comments.map((c) => (
                <ListGroup.Item key={c._id}>{c.comment}</ListGroup.Item>
                ))}
                </ListGroup>
                </div>
                )}

                <Button variant="dark" onClick={() => navigate('/posts')} className="mt-3">
                &larr; Back to Posts
                </Button>
                </Card.Body>

        </Card>
      </Container>
    </div>
  );
}
