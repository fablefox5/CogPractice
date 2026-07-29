import './App.css'
import LandingPage from './pages/LandingPage'
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
  <BrowserRouter>

    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/services" element={<ServicesPage />} />
    </Routes>
  </BrowserRouter>
  );
}

export default App
