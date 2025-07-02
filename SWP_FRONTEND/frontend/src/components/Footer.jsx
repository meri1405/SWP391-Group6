import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">        <div className="footer-content">
          <div className="footer-section about">
            <div className="footer-logo">
              <img src="/medical-logo.svg" alt="Logo" className="footer-logo-img" />
              <h3>Y Tế Học Đường</h3>
            </div>
            <p>
              Hỗ trợ công tác chăm sóc sức khỏe học sinh toàn diện.
            </p>
            <div className="contact-info-inline">
              <p><i className="fas fa-map-marker-alt"></i> Lô E2a-7, Đường D1, Khu Công Nghệ Cao, Phường Long Thạnh Mỹ, TP.Thủ Đức, TP.Hồ Chí Minh</p>
              <p><i className="fas fa-phone"></i> (028) 1234 5678</p>
              <p><i className="fas fa-envelope"></i> info@ytehocduong.edu.vn</p>
            </div>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="footer-section links">
            <h3>Liên kết nhanh</h3>
            <ul>
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/documents">Tài liệu</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/about">Giới thiệu</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} Y tế Học đường. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
