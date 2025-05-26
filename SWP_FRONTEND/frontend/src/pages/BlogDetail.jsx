import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
    
    // Fetch blogs data
    fetch('/content/blogs.json')
      .then(response => response.json())
      .then(data => {
        const foundBlog = data.blogs.find(blog => blog.id === parseInt(id));
        if (foundBlog) {
          setBlog(foundBlog);
        } else {
          setError('Không tìm thấy bài viết');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching blog details:', error);
        setError('Có lỗi xảy ra khi tải dữ liệu');
        setLoading(false);
      });
  }, [id]);
  // Function to parse markdown content into HTML
  const renderMarkdown = (content) => {
    if (!content) return '';

    // Basic markdown parsing (this is a simple implementation)
    let html = content
      // Headers - remove # symbols completely
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      // Remove any stray # symbols that aren't part of headers
      .replace(/(?<![#\w])[#](?![#])/g, '')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/- (.*$)/gim, '<li>$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return '<p>' + html + '</p>';
  };

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="container">
          <div className="loading-container">
            <p>Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-detail-page">
        <div className="container">
          <div className="error-container">
            <h2>{error || 'Không tìm thấy bài viết'}</h2>
            <Link to="/blog" className="back-button">Quay lại trang Blog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="page-header">
        <div className="container">
          <h1>{blog.title}</h1>
          <div className="blog-meta">
            <span className="blog-date">
              <i className="fas fa-calendar-alt"></i> {blog.date}
            </span>
            <span className="blog-author">
              <i className="fas fa-user"></i> {blog.author}
            </span>
            {blog.authorTitle && (
              <span className="blog-author-title">
                <i className="fas fa-briefcase"></i> {blog.authorTitle}
              </span>
            )}
          </div>
        </div>
      </div>      <div className="container">
        <div className="blog-detail">
          {blog.image && (
            <div className="blog-detail-image-container">
              <img src={blog.image} alt={blog.title} className="blog-detail-image" />
            </div>
          )}

          <div 
            className="blog-content-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
          />

          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-tags">
              {blog.tags.map((tag, index) => (
                <span key={index} className="blog-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="blog-navigation">
            <Link to="/blog" className="prev">
              <i className="fas fa-arrow-left"></i> Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
