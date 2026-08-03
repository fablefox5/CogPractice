import './App.css'
import LandingPage from './pages/LandingPage'
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AccountsPage from './pages/AccountsPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute';
import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
function App() {
  return (
  <AuthProvider>
  <BrowserRouter>
    <Header />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Route>
    </Routes>
    <Footer />
  </BrowserRouter>
  </AuthProvider>
  );
}

export default App
