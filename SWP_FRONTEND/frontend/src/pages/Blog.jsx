import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Blog.css';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch blogs data
    fetch('/content/blogs.json')
      .then(response => response.json())
      .then(data => {
        setBlogs(data.blogs);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching blogs:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="blog-page">
      <div className="page-header">
        <div className="container">
          <h1>Tin Tức & Bài Viết Y Tế</h1>
          <p>Cập nhật thông tin, kiến thức về sức khỏe học đường</p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-container">
            <p>Đang tải dữ liệu...</p>
          </div>        ) : (
          <div className="blog-list">
            {blogs.map(blog => (
              <div key={blog.id} className="blog-item">
                <div className="blog-image">
                  <img src={blog.image || '/images/default-blog.jpg'} alt={blog.title} />
                </div>
                <div className="blog-content">
                  <h2 className="blog-title">{blog.title}</h2>
                  <div className="blog-meta">
                    <span className="blog-date">
                      <i className="fas fa-calendar-alt"></i> {blog.date}
                    </span>
                    <span className="blog-author">
                      <i className="fas fa-user"></i> {blog.author}
                    </span>
                  </div>
                  <p className="blog-excerpt">{blog.excerpt}</p>
                  <Link to={`/blog/${blog.id}`} className="read-more-btn">
                    Đọc tiếp <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
