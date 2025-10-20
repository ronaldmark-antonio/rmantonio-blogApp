import { useEffect, useState } from 'react';
import AdminView from '../components/AdminView';
import UserView from '../components/UserView';
import { useGlobalStore } from '../UserContext';

    
export default function MoviesPage() {
  const { user } = useGlobalStore();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {

      if (!user.isLoading) {

        try {
          const token = localStorage.getItem('token');
          const endpoint = user.isAdmin
            ? 'https://rmantonio-blogapp.onrender.com/posts/getPosts'
            : 'https://rmantonio-blogapp.onrender.com/posts/getPosts';

          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {

            throw new Error(`HTTP error! status: ${response.status}`);

          }

          const data = await response.json();

          setPosts(data.posts || data);

        } catch (error) {
            console.error('Error fetching posts:', error);
        }
      }
    };

    fetchPosts();
  }, [user]);

  if (user.isLoading) return <p>Loading...</p>;

  return (
    <div className="container">
      {user.isAdmin ? (
        <AdminView postsData={posts} />
      ) : (
        <UserView postsData={posts} />
      )}
    </div>
  );
}
