import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Container, Breadcrumb, Button, ListGroup, Spinner, Form } from 'react-bootstrap';
import logo from '../images/blogpad-logo.png';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css'; 

export default function ViewPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem('token');

  const notyf = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    ripple: true,
  });

  useEffect(() => {
    if (!token) {
      setIsAdmin(false);
      return;
    }

    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));

        console.log("Decoded Payload:", decodedPayload);

        setIsAdmin(!!decodedPayload.isAdmin);

        console.log('Is admin:', !!decodedPayload.isAdmin);

    } catch (error) {

        console.error('Error decoding token:', error);

        setIsAdmin(false);
    }
  }, [token]);

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

        setPost(data.post || data);

      } catch (err) {

        setError(err.message);

      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token]);

  const handleDeleteComment = async (commentId) => {
    if (!isAdmin) {
      notyf.error('Only admins can delete comments.');
      return;
    }

    try {
      const res = await fetch(
        `https://rmantonio-blogapp.onrender.com/posts/deleteComment/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete comment');
      }

      // Remove deleted comment from UI immediately
      setPost((prevPost) => ({
        ...prevPost,
        comments: prevPost.comments.filter(comment => comment._id !== commentId),
      }));

        notyf.success('Comment Deleted Successfully!');

    } catch (err) {

        console.error('Error during comment deletion:', err);

        notyf.error('Failed to delete comment.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <h4 className="text-danger">Error:</h4>
        <p>{error}</p>
        <Button variant="dark" onClick={() => navigate('/posts')}>
          &larr; Back to Posts
        </Button>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="py-5 text-center">
        <p>No post found.</p>
        <Button variant="dark" onClick={() => navigate('/posts')}>
          &larr; Back to Posts
        </Button>
      </Container>
    );
  }

  const comments = Array.isArray(post.comments) ? post.comments : [];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container className="py-4" style={{ maxWidth: '800px' }}>
        {/* Header with logo */}
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
              <strong>Date Added:</strong>{' '}
              {post.creationAdded
                ? new Date(post.creationAdded).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Unknown'}
            </Card.Text>

            {/* Comments Section */}
            <div className="mb-3">
              <strong>Comments:</strong>
              {comments.length > 0 ? (
                <ListGroup
                  variant="flush"
                  style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    marginTop: '8px',
                  }}
                >
                  {comments.map((c, index) => (
                    <ListGroup.Item key={c._id || index}>
                      {c?.comment || 'No content available'}
                      {isAdmin && (
                        <Button
                          variant="danger"
                          className="ms-2 float-end"
                          onClick={() => handleDeleteComment(c._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No comments yet.</p>
              )}
            </div>

            {/* Comment Form (disabled for admin) */}
            {!isAdmin && (
              <Form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!token) {
                    notyf.error('You must be logged in to comment.');
                    return;
                  }

                  if (!newComment.trim()) {
                    notyf.error('Comment cannot be empty.');
                    return;
                  }

                  const newCommentData = { comment: newComment, createdAt: new Date() };
                  setPost((prevPost) => ({
                    ...prevPost,
                    comments: [...prevPost.comments, newCommentData],
                  }));
                  setNewComment('');
                  notyf.success('Comment added successfully!');

                  try {
                    const res = await fetch(
                      `https://rmantonio-blogapp.onrender.com/posts/addComment/${id}`,
                      {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ comment: newComment }),
                      }
                    );

                    if (!res.ok) {
                      const errorData = await res.json();
                      throw new Error(errorData.message || 'Failed to add comment');
                    }
                  } catch (err) {
                    console.error('Error during comment submission:', err);
                    notyf.error('Failed to submit comment.');
                  }
                }}
              >
                <Form.Group controlId="newComment">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    style={{ borderRadius: '8px', resize: 'none' }}
                  />
                </Form.Group>

                {/* Submit and Back to Posts Buttons on Same Line, Aligned to Right */}
                <div className="d-flex justify-content-end mt-3">
                  {/* Show Back button only if admin */}
                  {isAdmin && (
                    <Button
                      variant="outline-dark"
                      onClick={() => navigate('/posts')}
                      style={{ borderRadius: '8px', marginRight: '10px' }}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    variant="dark"
                    type="submit"
                    style={{ borderRadius: '8px' }}
                  >
                    Submit
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
