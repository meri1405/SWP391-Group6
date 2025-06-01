import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler";
import SessionTimeoutWarning from "./components/SessionTimeoutWarning";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopOnMount from "./components/ScrollToTopOnMount";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import About from "./pages/About";
import Search from "./pages/Search";
import ParentDashboard from "./pages/ParentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolNurseDashboard from "./pages/SchoolNurseDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <ScrollToTopOnMount />          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<Search />} />
            <Route
              path="/parent-dashboard"
              element={
                <ProtectedRoute allowedRoles={["PARENT"]}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-dashboard"
              element={
                <ProtectedRoute allowedRoles={["SCHOOLNURSE"]}>
                  <SchoolNurseDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>          <Footer />
          <ScrollToTop />
          <SessionTimeoutWarning />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
