import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./contexts/AuthContext";
import { SystemSettingsProvider } from "./contexts/SystemSettingsContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler";
import SessionTimeoutWarning from "./components/SessionTimeoutWarning";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopOnMount from "./components/ScrollToTopOnMount";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ErrorPage from "./pages/ErrorPage";
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
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ErrorBoundary>
        <AuthProvider>
          <SystemSettingsProvider>
            <div className="App">
            <Navbar />
            <ScrollToTopOnMount />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route
                path="/oauth2/redirect"
                element={<OAuth2RedirectHandler />}
              />
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
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/manager-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["MANAGER"]}>
                    <ManagerDashboard />
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
            </Routes>
            <Footer />
            <ScrollToTop />
            <SessionTimeoutWarning />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </SystemSettingsProvider>
      </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
