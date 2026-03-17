import Home_head from "../components/Home/Home_head";
import Home_about from "../components/Home/Home_about";
import PurposeSection from "../components/Home/Home_purpose";
import Home_VM from "../components/Home/Home_V&M";
import Home_review from "../components/Home/Home_review";

function Home() {
    return(
        <div className="home">
            <Home_head/>
            <Home_about/>
            <PurposeSection/>
            <Home_VM/>
            <Home_review/>
        </div>  
    )
}
export default Home;