import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch blogs data
    fetch('/content/blogs.json')
      .then(response => response.json())
      .then(data => {
        setBlogs(data.blogs.slice(0, 3)); // Get first 3 blogs
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching blogs:', error);
        setLoading(false);
      });

    // Fetch documents data
    fetch('/content/documents.json')
      .then(response => response.json())
      .then(data => {
        setDocuments(data.documents.slice(0, 3)); // Get first 3 documents
      })
      .catch(error => {
        console.error('Error fetching documents:', error);
      });
  }, []);
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Hệ Thống Quản Lý Y Tế Học Đường</h1>
          <p>Nâng cao sức khỏe, phát triển toàn diện cho học sinh</p>
        </div>
      </section>

      {/* School Information Section */}
      <section className="school-info">
        <div className="container">
          <br />
          <h2>Thông Tin Y Tế Học Đường</h2>
          <div className="info-grid">
            <div className="info-card">
              <i className="fas fa-heartbeat"></i>
              <h3>Chăm Sóc Sức Khỏe</h3>
              <p>Dịch vụ khám sức khỏe định kỳ và tư vấn y tế cho học sinh</p>
            </div>
            <div className="info-card">
              <i className="fas fa-notes-medical"></i>
              <h3>Hồ Sơ Y Tế</h3>
              <p>Quản lý hồ sơ sức khỏe điện tử cho từng học sinh</p>
            </div>
            <div className="info-card">
              <i className="fas fa-first-aid"></i>
              <h3>Sơ Cứu</h3>
              <p>Trang thiết bị y tế và nhân viên y tế được đào tạo chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="documents">
        <div className="container">
          <br />
          <h2>Tài Liệu Y Tế</h2>
          {loading ? (
            <p className="loading-text">Đang tải tài liệu...</p>
          ) : (
            <div className="documents-grid">
              {documents.map(doc => (
                <div key={doc.id} className="document-card">
                  <div className="document-icon">
                    <i className="fas fa-file-medical"></i>
                  </div>
                  <div className="document-info">
                    <h3>{doc.title}</h3>
                    <p className="document-category">{doc.category}</p>
                    <p className="document-date">Cập nhật: {doc.lastUpdated}</p>
                  </div>
                  <Link to={`/documents/${doc.id}`} className="document-link">
                    Xem chi tiết
                  </Link>
                </div>
              ))}
            </div>
          )}
          <Link to="/documents" className="view-all">
            Xem tất cả tài liệu
          </Link>
          <br />
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog">
        <div className="container">
          <br />
          <h2>Tin Tức & Chia Sẻ</h2>
          {loading ? (
            <p className="loading-text">Đang tải bài viết...</p>
          ) : (
            <div className="blog-grid">
              {blogs.map(post => (
                <div key={post.id} className="blog-card">
                  <div className="blog-image">
                    <img src={post.image || '/images/default-blog.jpg'} alt={post.title} />
                  </div>
                  <div className="blog-content">
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="blog-meta">
                      <span className="blog-date">{post.date}</span>
                      <Link to={`/blog/${post.id}`} className="read-more">
                        Đọc thêm
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/blog" className="view-all">
            Xem tất cả bài viết
          </Link>
          <br />
        </div>
      </section>
    </div>
  );
};

export default Home; 