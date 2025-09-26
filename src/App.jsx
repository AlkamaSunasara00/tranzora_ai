import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import History from "./pages/History"
import "./App.css"
import { TranslationProvider } from "./utils/TranslationContext"

function App() {
  return (
    <TranslationProvider>
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
    </TranslationProvider>
  )
}

export default App
