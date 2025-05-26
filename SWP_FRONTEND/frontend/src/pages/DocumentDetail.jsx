import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/DocumentDetail.css';

const DocumentDetail = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    // Thêm state để quản lý lượt tải
  const [downloadCount, setDownloadCount] = useState(0);
    // Hàm cập nhật lượt xem
  const updateViewCount = (doc) => {
    const currentViews = doc.views ? parseInt(doc.views) : 0;
    const newViewCount = currentViews + 1;
    
    // Trong thực tế, bạn sẽ gửi request API để cập nhật lượt xem trong database
    console.log(`Đã cập nhật lượt xem cho tài liệu ID ${doc.id}: ${newViewCount}`);
    
    // Cập nhật document với lượt xem mới
    setDocument({
      ...doc,
      views: newViewCount.toString()
    });
  };
  
  // Hàm cập nhật lượt tải
  const handleDownload = () => {
    const newDownloadCount = downloadCount + 1;
    setDownloadCount(newDownloadCount);
    
    // Trong thực tế, bạn sẽ gửi request API để cập nhật lượt tải trong database
    console.log(`Đã cập nhật lượt tải cho tài liệu ID ${id}: ${newDownloadCount}`);
    
    // Cập nhật document với lượt tải mới
    setDocument(prevDoc => ({
      ...prevDoc,
      downloads: newDownloadCount.toString()
    }));
  };
  
  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
    
    // Fetch document data
    fetch('/content/documents.json')
      .then(response => response.json())
      .then(data => {
        const foundDocument = data.documents.find(doc => doc.id === parseInt(id));        if (foundDocument) {
          setDocument(foundDocument);
          
          // Khởi tạo lượt tải từ document
          setDownloadCount(foundDocument.downloads ? parseInt(foundDocument.downloads) : 0);
          
          // Tăng lượt xem khi người dùng xem tài liệu
          updateViewCount(foundDocument);
        } else {
          setError('Không tìm thấy tài liệu');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching document details:', error);
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
      // Tables (basic support)
      .replace(/\| (.*) \|/g, function(match) {
        return '<tr><td>' + match.replace(/\|/g, '</td><td>').trim() + '</td></tr>';
      })
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return '<p>' + html + '</p>';
  };

  if (loading) {
    return (
      <div className="document-detail-page">
        <div className="container">
          <div className="loading-container">
            <p>Đang tải tài liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="document-detail-page">
        <div className="container">
          <div className="error-container">
            <h2>{error || 'Không tìm thấy tài liệu'}</h2>
            <Link to="/documents" className="back-button">Quay lại trang Tài liệu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-detail-page">
      <div className="page-header">
        <div className="container">
          <h1>{document.title}</h1>
          <div className="document-meta">
            <span className="document-category">
              <i className="fas fa-folder"></i> {document.category}
            </span>
            <span className="document-author">
              <i className="fas fa-user"></i> {document.author}
            </span>
            <span className="document-date">
              <i className="fas fa-calendar-alt"></i> Cập nhật: {document.lastUpdated}
            </span>
          </div>
        </div>
      </div>      <div className="container">
        <div className="document-detail">          <div className="document-description">
            <p>{document.description}</p>
          </div>

          <div className="document-info-bar">
            <div className="document-type">
              <i className="fas fa-file-alt"></i> 
              <span>{document.type || "Tài liệu"}</span>
            </div>
            <div className="document-views">
              <i className="fas fa-eye"></i> 
              <span>{document.views || "0"} lượt xem</span>
            </div>
            <div className="document-downloads">
              <i className="fas fa-download"></i> 
              <span>{document.downloads || "0"} lượt tải</span>
            </div>
          </div>

          <div className="document-content-container">
            <div 
              className="document-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(document.content) }}
            />
          </div>

          <div className="document-actions">
            {document.fileUrl && (
              <a 
                href={document.fileUrl} 
                className="download-btn" 
                download
                onClick={handleDownload} // Gọi hàm cập nhật lượt tải khi người dùng tải tài liệu
              >
                <i className="fas fa-download"></i> Tải tài liệu PDF
              </a>
            )}
          </div>

          <div className="document-navigation">
            <Link to="/documents" className="prev">
              <i className="fas fa-arrow-left"></i> Quay lại danh sách tài liệu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
