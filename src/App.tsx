import './App.css'
import LandingPage from './pages/LandingPage'
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AccountsPage from './pages/AccountsPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
  <BrowserRouter>

    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/accounts" element={<AccountsPage />} />
    </Routes>
  </BrowserRouter>
  );
}

export default App
