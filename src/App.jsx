import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MatrixRain from './components/MatrixRain'
import CursorTrail from './components/CursorTrail'
import Home from './pages/Home'
import Learning from './pages/Learning'
import Projects from './pages/Projects'
import Contributions from './pages/Contributions'
import Reading from './pages/Reading'

export default function App() {
  return (
    <HashRouter>
      <MatrixRain />
      <CursorTrail />
      <Navbar />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/learning"      element={<Learning />} />
        <Route path="/projects"      element={<Projects />} />
        <Route path="/contributions" element={<Contributions />} />
        <Route path="/reading"       element={<Reading />} />
      </Routes>
      <Footer />
    </HashRouter>
  )
}
