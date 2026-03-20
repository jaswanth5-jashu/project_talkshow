import { Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import ScrollToTop from './components/common/ScrollToTop'
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
import UserProfile from './pages/UserProfile'
import ForgotPassword from './pages/ForgotPasswordmain'
import TalentProfile from './pages/TalentProfile'
import Profile from './pages/Profile'

function App() {

  return (
    <>
      <ScrollToTop />
      <Header/>

      <Routes>

        <Route path="/" element={<Home/>}/>
        <Route path="/Episodes" element={<Episodes/>}/>
        <Route path="/feedback" element={<Feedback/>}/>
        <Route path="/Talentstories" element={<Talentstories/>}/>
        <Route path="/showyourtalent" element={<Showyourtalent/>}/>
        <Route path="/Contacts" element={<Contacts/>}/>
        <Route path="/login" element={<Login/>}/>

        <Route path="/guests" element={<Guests/>}/>


        <Route path="/guest/:id" element={<GuestProfile/>}/>


        <Route path="/talent/:id" element={<TalentProfile/>}/>


        <Route path="/play/:videoId" element={<Play/>}/>
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/profile" element={<Profile/>}/>

      </Routes>

      <Footer/>
    </>
  )
}

export default App