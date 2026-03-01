import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Learning from './components/Learning'
import Projects from './components/Projects'
import Contributions from './components/Contributions'
import Footer from './components/Footer'
import CursorTrail from './components/CursorTrail'

function App() {
  return (
    <>
      <CursorTrail />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Learning />
        <Projects />
        <Contributions />
      </main>
      <Footer />
    </>
  )
}

export default App
