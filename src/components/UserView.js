import { useState, useEffect, useRef } from 'react';
import { Card, Button, Container, Row, Col, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import logo from '../images/blogpad-logo.png';

export default function UserView() {
  const notyf = useRef(new Notyf({ duration: 2000, ripple: true })).current;

  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formPost, setFormPost] = useState({
    title: '',
    content: '',
    author_information: '',
  });
  const [editingPostId, setEditingPostId] = useState(null);
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await fetch('https://rmantonio-blogapp.onrender.com/posts/getPosts', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');

        setPosts(Array.isArray(data.posts) ? data.posts : []);

    } catch (err) {

        console.error('Error loading posts:', err);

        alert('Could not load posts.');

    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handleAddClick = () => {
    setEditingPostId(null);
    setFormPost({ title: '', content: '', author_information: '' });
    setShowModal(true);
  };

  const handleEditClick = (post) => {
    setEditingPostId(post._id || post.id);
    setFormPost({
      title: post.title || '',
      content: post.content || '',
      author_information: post.author_information || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPostId(null);
    setFormPost({ title: '', content: '', author_information: '' });
  };

  const handleChange = (e) => {
    setFormPost({
      ...formPost,
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid =
    formPost.title.trim() !== '' &&
    formPost.content.trim() !== '' &&
    formPost.author_information.trim() !== '';

  const handleAddPost = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://rmantonio-blogapp.onrender.com/posts/addPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formPost),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to add post');

        notyf.success('Post Added Successfully!');

        handleCloseModal();

        fetchPosts();

    } catch (err) {

        console.error('Error adding post:', err);

        notyf.error('Could not add post.');
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    if (!editingPostId) return;
    try {
      const res = await fetch(`https://rmantonio-blogapp.onrender.com/posts/updatePost/${editingPostId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formPost),
      });

      if (!res.ok) {

        let errorMessage = 'Failed to update post';

        try {

          const errorData = await res.json();

          errorMessage = errorData.message || errorMessage;

        } catch {}
        throw new Error(errorMessage);
      }

      notyf.success('Post Updated Successfully!');

      handleCloseModal();

      fetchPosts();

    } catch (err) {

        console.error('Error updating post:', err);

        notyf.error('Could not update post.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!postId) {
      notyf.error('Invalid post ID.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    try {
      const res = await fetch(`https://rmantonio-blogapp.onrender.com/posts/deletePost/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {

        let errorMessage = 'Failed to delete post';

        try {

          const errorData = await res.json();

          errorMessage = errorData.message || errorMessage;

        } catch {}

        throw new Error(errorMessage);
      }
      
      notyf.success('Post Deleted Successfully!');

      fetchPosts();

    } catch (err) {
      
        console.error('Error deleting post:', err);

        notyf.error(err.message || 'Could not delete post.');
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
          <img src={logo} alt="Blog Logo" style={{ width: '180px', height: 'auto' }} />
          <div>
            <Button
              variant="dark"
              onClick={handleAddClick}
              className="me-2"
              style={{ borderRadius: '0', padding: '10px 20px', fontWeight: '600', letterSpacing: '0.05em' }}
            >
              + Add Post
            </Button>
            <Button
              variant="outline-dark"
              onClick={handleLogout}
              style={{ borderRadius: '0', padding: '10px 20px', fontWeight: '600', letterSpacing: '0.05em' }}
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="text-center mb-5">
          <h1 className="fw-bold text-dark">Welcome to the BlogPad</h1>
          <p className="text-muted fs-5">Explore thoughts, ideas, and stories shared by users.</p>
        </div>

        {currentPosts.length === 0 ? (
          <p className="text-center text-muted">No posts found.</p>
        ) : (
          <Row xs={1} sm={2} md={3} lg={3} className="g-4">
            {currentPosts.map((post) => (
              <Col key={post._id || post.id}>
                <Card
                  className="h-100 border-0"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 6px 20px rgba(0, 0, 0, 0.10)',
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
                    <div className="d-flex justify-content-end mb-2 gap-2 pb-3">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEditClick(post)}
                        style={{ borderRadius: '0', padding: '4px 10px' }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeletePost(post._id || post.id)}
                        style={{ borderRadius: '0', padding: '4px 10px' }}
                      >
                        Delete
                      </Button>
                    </div>

                    <Card.Title className="mb-2 fs-5 text-dark fw-bold">{post.title || 'Untitled'}</Card.Title>

                    <Card.Text className="mb-1 text-dark small">
                      <strong>Content:</strong>{' '}
                      {post.content
                        ? post.content.length > 100
                          ? post.content.slice(0, 100) + '...'
                          : post.content
                        : 'No content available.'}
                    </Card.Text>

                    <Card.Text className="mb-1 text-dark small">
                      <strong>Author:</strong> {post.author_information || 'Anonymous'}
                    </Card.Text>

                    <Card.Text className="mb-1 text-dark small">
                      <strong>Date Added:</strong>{' '}
                      {post.creationAdded
                        ? formatDate(post.creationAdded)
                        : post.createdAt
                        ? formatDate(post.createdAt)
                        : post.created_at
                        ? formatDate(post.created_at)
                        : 'Unknown'}
                    </Card.Text>

                    <Card.Text className="mb-1 text-dark small pb-3">
                      <strong>Comments:</strong> {Array.isArray(post.comments) ? post.comments.length : 0}
                    </Card.Text>

                    <div className="mt-auto">
                      <Button
                        variant="dark"
                        className="w-100 py-2"
                        style={{ borderRadius: '0' }}
                        onClick={() => handleViewPost(post._id || post.id)}
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

      <Modal show={showModal} onHide={handleCloseModal} dialogClassName="no-radius-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editingPostId ? 'Edit Post' : 'Add Post'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editingPostId ? handleEditPost : handleAddPost}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formPost.title}
                onChange={handleChange}
                required
                style={{ borderRadius: '0' }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                value={formPost.content}
                onChange={handleChange}
                rows={4}
                required
                style={{ borderRadius: '0' }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Author Information</Form.Label>
              <Form.Control
                type="text"
                name="author_information"
                value={formPost.author_information}
                onChange={handleChange}
                style={{ borderRadius: '0' }}
              />
            </Form.Group>
            <Button
              type="submit"
              variant="dark"
              className="w-100"
              disabled={!isFormValid}
              style={{
                borderRadius: '0',
                opacity: isFormValid ? 1 : 0.5,
                cursor: isFormValid ? 'pointer' : 'not-allowed'
              }}
            >
              {editingPostId ? 'Save Changes' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>


      </Container>
    </div>
  );
}
