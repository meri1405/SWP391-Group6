import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Documents.css';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Fetch documents data
    fetch('/content/documents.json')
      .then(response => response.json())
      .then(data => {
        setDocuments(data.documents);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.documents.map(doc => doc.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching documents:', error);
        setLoading(false);
      });
  }, []);

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  return (
    <div className="documents-page">
      <div className="page-header">
        <div className="container">
          <h1>Tài Liệu Y Tế Học Đường</h1>
          <p>Hướng dẫn, quy trình và biểu mẫu dành cho cán bộ, giáo viên và học sinh</p>
        </div>
      </div>

      <div className="container">
        <div className="filter-container">
          <label htmlFor="category-filter">Lọc theo danh mục:</label>
          <select 
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tất cả tài liệu</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <p>Đang tải tài liệu...</p>
          </div>
        ) : (
          <div className="documents-grid">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="document-card">
                <div className="document-icon">
                  <i className="fas fa-file-medical"></i>
                </div>
                <div className="document-info">
                  <h2>{doc.title}</h2>
                  <p className="document-category">{doc.category}</p>
                  <p className="document-date">Cập nhật: {doc.lastUpdated}</p>
                  <p className="document-description">{doc.description}</p>
                </div>
                <Link to={`/documents/${doc.id}`} className="view-document-btn">
                  Xem chi tiết <i className="fas fa-arrow-right"></i>
                </Link>
                {doc.fileUrl && (
                  <a href={doc.fileUrl} className="download-btn" download>
                    <i className="fas fa-download"></i> Tải xuống
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
          <div className="no-results">
            <p>Không tìm thấy tài liệu thuộc danh mục này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
