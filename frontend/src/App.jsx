import { Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import Home from './pages/Home'
import Episodes from './pages/Episodes'
import Feedback from './pages/Feedback'
import Contacts from './pages/Contacts'
import Login from './pages/Login'
import Showyourtalent from './pages/Showyourtalent'
import GuestProfile from './pages/GuestProfile'
import Talentstories from './pages/Talentstories'
import Footer from './components/common/Footer'
import Guests from './components/Profile/Guests'
import Play from './pages/Play'
import ForgotPassword from './pages/ForgotPasswordmain'
import TalentProfile from './pages/TalentProfile'
import Profile from './pages/Profile'

function App() {

  return (
    <>
      <Header/>

      <Routes>

        <Route path="/" element={<Home/>}/>
        <Route path="/episodes" element={<Episodes/>}/>
        <Route path="/feedback" element={<Feedback/>}/>
        <Route path="/talentstories" element={<Talentstories/>}/>
        <Route path="/showyourtalent" element={<Showyourtalent/>}/>
        <Route path="/contacts" element={<Contacts/>}/>
        <Route path="/login" element={<Login/>}/>

        {/* Guests Page */}
        <Route path="/guests" element={<Guests/>}/>
        <Route path="/GuestProfile" element={<Guests/>}/>

        {/* Guest Profile Page */}
        <Route path="/guest/:id" element={<GuestProfile/>}/>

        {/* Talent Profile Page */}
        <Route path="/talent/:id" element={<TalentProfile/>}/>

        {/* Video Playback Page */}
        <Route path="/play/:videoId" element={<Play/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/profile" element={<Profile/>}/>

      </Routes>

      <Footer/>
    </>
  )
}

export default App