import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Pagination, Container } from 'react-bootstrap';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import logo from '../images/blogpad-logo.png';

export default function AdminView() {
  const notyf = useRef(new Notyf()).current;

  const [movies, setMovies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 10;

  const [newMovie, setNewMovie] = useState({
    title: '',
    director: '',
    year: '',
    description: '',
    genre: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMovies = async () => {

      try {
        const res = await fetch(
          'https://rmantonio-blogapp.onrender.com/posts/getPosts',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error('Failed to fetch posts');

	        const data = await res.json();

	        setMovies(Array.isArray(data.posts) ? data.posts : []);

      } catch (err) {
	        console.error('Error loading posts:', err);
	        alert('Could not load posts.');
      }
    };

    fetchMovies();
  }, [token]);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setNewMovie({
      ...newMovie,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        'https://movieapp-api-lms1.onrender.com/movies/addMovie',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newMovie),
        }
      );

      if (!res.ok) throw new Error('Failed to add movie');

      const res2 = await fetch(
        'https://movieapp-api-lms1.onrender.com/movies/getMovies',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data2 = await res2.json();

      setMovies(Array.isArray(data2.movies) ? data2.movies : []);

      notyf.success('Movie added successfully!');

      setNewMovie({
        title: '',
        director: '',
        year: '',
        description: '',
        genre: '',
      });

      handleClose();

    } catch (err) {
      console.error('Error adding movie:', err);
      notyf.error('Could not add movie.');
    }
  };

  const handleLogout = () => {

    localStorage.removeItem('token');

    window.location.href = '/login';
  };

  const totalPages = Math.ceil(movies.length / moviesPerPage);
  const indexOfLast = currentPage * moviesPerPage;
  const indexOfFirst = indexOfLast - moviesPerPage;
  const currentMovies = [...movies]
    .reverse()
    .slice(indexOfFirst, indexOfLast);

  const handlePageChange = (pageNumber) => {

    setCurrentPage(pageNumber);

    window.scrollTo(0, 0);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container className="py-4" style={{ maxWidth: '900px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <img
            src={logo}
            alt="StreamFlix Logo"
            style={{ width: '180px', height: 'auto' }}
          />
          <div>
            <Button
              variant="danger"
              onClick={handleShow}
              className="me-2"
              id="addMovie"
              style={{
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: '600',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b02a37')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              + Add Movie
            </Button>
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
        </div>

        <h2 className="fw-bold text-dark mb-4 text-center">Admin Dashboard</h2>

        <Table
          striped
          bordered
          hover
          responsive
          style={{
            borderRadius: '12px',
            boxShadow:
              '0 4px 8px rgba(0, 0, 0, 0.15), 0 6px 20px rgba(0, 0, 0, 0.10)',
          }}
          className="bg-white"
        >
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Director</th>
              <th>Year</th>
              <th>Description</th>
              <th>Genre</th>
            </tr>
          </thead>
          <tbody>
            {currentMovies.length > 0 ? (
              currentMovies.map((movie, index) => (
                <tr key={movie._id || index}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{movie.title || 'Untitled'}</td>
                  <td>{movie.director || 'N/A'}</td>
                  <td>{movie.year || 'N/A'}</td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                    {movie.description || 'No description'}
                  </td>
                  <td>{movie.genre || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No movies found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <Pagination className="justify-content-center mt-4">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              const isActive = page === currentPage;
              return (
                <Pagination.Item
                  key={page}
                  active={isActive}
                  onClick={() => handlePageChange(page)}
                  className={
                    isActive
                      ? 'bg-danger text-white border-danger'
                      : 'bg-dark text-white'
                  }
                  style={{
                    border: 'none',
                    margin: '0 4px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  {page}
                </Pagination.Item>
              );
            })}
          </Pagination>
        )}

        <Modal
          show={showModal}
          onHide={handleClose}
          centered
          backdrop="static"
          keyboard={false}
          contentClassName="rounded-4 shadow-sm border-0"
        >
          <Modal.Header closeButton className="border-0 pb-2">
            <Modal.Title className="fw-bold fs-4">Add Movie</Modal.Title>
          </Modal.Header>

          <Form onSubmit={handleAddMovie}>
            <Modal.Body className="px-4 pt-0">
              <Form.Group className="mb-3" controlId="formTitle">
                <Form.Label className="fw-semibold">Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={newMovie.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter movie title"
                  style={{
                    borderRadius: '12px',
                    borderColor: '#ddd',
                    padding: '10px 15px',
                    fontSize: '1rem',
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDirector">
                <Form.Label className="fw-semibold">Director</Form.Label>
                <Form.Control
                  type="text"
                  name="director"
                  value={newMovie.director}
                  onChange={handleChange}
                  required
                  placeholder="Director's name"
                  style={{
                    borderRadius: '12px',
                    borderColor: '#ddd',
                    padding: '10px 15px',
                    fontSize: '1rem',
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formYear">
                <Form.Label className="fw-semibold">Year</Form.Label>
                <Form.Control
                  type="number"
                  name="year"
                  value={newMovie.year}
                  onChange={handleChange}
                  required
                  placeholder="Release year"
                  min={1888}
                  max={new Date().getFullYear()}
                  style={{
                    borderRadius: '12px',
                    borderColor: '#ddd',
                    padding: '10px 15px',
                    fontSize: '1rem',
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDescription">
                <Form.Label className="fw-semibold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={newMovie.description}
                  onChange={handleChange}
                  required
                  placeholder="Brief movie description"
                  style={{
                    borderRadius: '12px',
                    borderColor: '#ddd',
                    padding: '10px 15px',
                    fontSize: '1rem',
                    resize: 'vertical',
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formGenre">
                <Form.Label className="fw-semibold">Genre</Form.Label>
                <Form.Control
                  type="text"
                  name="genre"
                  value={newMovie.genre}
                  onChange={handleChange}
                  required
                  placeholder="Genre(s)"
                  style={{
                    borderRadius: '12px',
                    borderColor: '#ddd',
                    padding: '10px 15px',
                    fontSize: '1rem',
                  }}
                />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer className="border-0 px-4 pb-4">
              <Button
                variant="secondary"
                onClick={handleClose}
                style={{
                  borderRadius: '12px',
                  padding: '8px 20px',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="submit"
                id="addMovie"
                style={{
                  borderRadius: '12px',
                  padding: '8px 20px',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b02a37')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
              >
                Submit
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
}
