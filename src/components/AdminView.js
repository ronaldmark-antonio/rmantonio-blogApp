import { useState, useEffect, useRef } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import logo from '../images/blogpad-logo.png';

export default function AdminView() {
  const [posts, setPosts] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const notyf = useRef(new Notyf({ duration: 2000, ripple: true })).current;

  const fetchPosts = async () => {
    try {

      const res = await fetch('https://rmantonio-blogapp.onrender.com/posts/getPosts', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch posts');

        const data = await res.json();

        setPosts(Array.isArray(data.posts) ? data.posts : []);

    } catch (err) {

        console.error('Error loading posts:', err);

        notyf.error('Could not load posts.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handleDeletePost = async (postId) => {

    const confirmed = window.confirm('Are you sure you want to delete this post?');

    if (!confirmed) return;

    try {
      const res = await fetch(`https://rmantonio-blogapp.onrender.com/posts/deletePost/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete post');

        notyf.success('Post Deleted Successfully!');

        fetchPosts();

    } catch (err) {

        console.error('Error deleting post:', err);

        notyf.error('Could not delete post.');
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
      const date = new Date(dateString);

      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
  };

  const currentPosts = [...posts].reverse();

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <img src={logo} alt="BlogPad Logo" style={{ width: '180px', height: 'auto' }} />
          <Button
            variant="dark"
            onClick={handleLogout}
            style={{
              borderRadius: '12px',
              padding: '8px 20px',
              fontWeight: '600',
              letterSpacing: '0.05em',
            }}
          >
            Logout
          </Button>
        </div>

        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark">Admin Dashboard</h2>
          <p className="text-muted fs-5">Manage and moderate all blog posts.</p>
        </div>

        {currentPosts.length === 0 ? (
          <p className="text-center text-muted">No posts found.</p>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {currentPosts.map((post) => (
              <Col key={post._id || post.id}>
                <Card
                  className="h-100 border-0"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <Card.Body className="d-flex flex-column p-3">
                    <div className="d-flex justify-content-end mb-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeletePost(post._id || post.id)}
                        style={{ borderRadius: '8px', padding: '4px 10px' }}
                      >
                        Delete
                      </Button>
                    </div>

                    {/* Post Title */}
                    <Card.Title className="fs-5 fw-bold text-dark mb-2">
                      {post.title || 'Untitled'}
                    </Card.Title>

                    {/* Post Info */}
                    <Card.Text className="text-dark small mb-1">
                      <strong>Author:</strong> {post.author_information || 'Anonymous'}
                    </Card.Text>

                    <Card.Text className="text-dark small mb-1">
                      <strong>Created:</strong>{' '}
                      {post.creationAdded
                        ? formatDate(post.creationAdded)
                        : post.createdAt
                        ? formatDate(post.createdAt)
                        : post.created_at
                        ? formatDate(post.created_at)
                        : 'Unknown'}
                    </Card.Text>

                    <Card.Text className="text-dark small mb-2">
                      <strong>Content:</strong>{' '}
                      {post.content
                        ? post.content.length > 100
                          ? post.content.slice(0, 100) + '...'
                          : post.content
                        : 'No content available.'}
                    </Card.Text>

                    {Array.isArray(post.comments) && post.comments.length > 0 && (
                      <Card.Text className="text-muted small mb-2">
                        <strong>Comments:</strong> {post.comments.length}
                      </Card.Text>
                    )}

                    <div className="mt-auto">
                      <Button
                        variant="dark"
                        className="w-100 py-2"
                        onClick={() => handleViewPost(post._id || post.id)}
                        style={{ borderRadius: '10px', fontWeight: '600' }}
                      >
                        Read More
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
