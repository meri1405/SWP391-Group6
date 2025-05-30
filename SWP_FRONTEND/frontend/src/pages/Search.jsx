import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Search.css';

const Search = () => {
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState({ documents: [], blogs: [] });
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    setLoading(true);
    
    // Function to fetch and filter data
    const fetchData = async () => {
      try {
        // Fetch documents data
        const documentsResponse = await fetch('/content/documents.json');
        const documentsData = await documentsResponse.json();
        
        // Fetch blogs data
        const blogsResponse = await fetch('/content/blogs.json');
        const blogsData = await blogsResponse.json();
        
        // Filter documents based on search query
        const filteredDocuments = documentsData.documents.filter(doc => 
          doc.title.toLowerCase().includes(query.toLowerCase()) || 
          doc.description.toLowerCase().includes(query.toLowerCase()) || 
          doc.content.toLowerCase().includes(query.toLowerCase()) ||
          doc.category.toLowerCase().includes(query.toLowerCase())
        );
        
        // Filter blogs based on search query
        const filteredBlogs = blogsData.blogs.filter(blog => 
          blog.title.toLowerCase().includes(query.toLowerCase()) || 
          blog.excerpt.toLowerCase().includes(query.toLowerCase()) || 
          blog.content.toLowerCase().includes(query.toLowerCase()) ||
          (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        );
        
        setSearchResults({
          documents: filteredDocuments,
          blogs: filteredBlogs
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setLoading(false);
      }
    };
    
    if (query) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [query]);
  
  const totalResults = searchResults.documents.length + searchResults.blogs.length;

  return (
    <div className="search-page">
      <div className="container">
        <h1>Kết quả tìm kiếm</h1>
        <p className="search-query">Tìm kiếm cho: <strong>{query}</strong></p>
        
        {loading ? (
          <div className="loading-container">
            <p>Đang tìm kiếm...</p>
          </div>
        ) : (
          <>
            {query ? (
              <>
                <p className="results-count">Tìm thấy {totalResults} kết quả</p>
                
                {/* Document Results */}
                {searchResults.documents.length > 0 && (
                  <div className="search-section">
                    <h2>Tài liệu ({searchResults.documents.length})</h2>
                    <div className="search-results documents">
                      {searchResults.documents.map(doc => (
                        <div key={`doc-${doc.id}`} className="search-result-item">
                          <Link to={`/documents/${doc.id}`} className="result-title">
                            {doc.title}
                          </Link>
                          <p className="result-meta">
                            <span className="result-category">{doc.category}</span>
                            <span className="result-date">Cập nhật: {doc.lastUpdated}</span>
                          </p>
                          <p className="result-description">{doc.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Blog Results */}
                {searchResults.blogs.length > 0 && (
                  <div className="search-section">
                    <h2>Bài viết ({searchResults.blogs.length})</h2>
                    <div className="search-results blogs">
                      {searchResults.blogs.map(blog => (
                        <div key={`blog-${blog.id}`} className="search-result-item">
                          <Link to={`/blog/${blog.id}`} className="result-title">
                            {blog.title}
                          </Link>
                          <p className="result-meta">
                            <span className="result-author">{blog.author}</span>
                            <span className="result-date">{blog.date}</span>
                          </p>
                          <p className="result-description">{blog.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {totalResults === 0 && (
                  <div className="no-results">
                    <p>Không tìm thấy kết quả nào cho "{query}". Vui lòng thử từ khóa khác.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="no-query">
                <p>Vui lòng nhập từ khóa để tìm kiếm.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
