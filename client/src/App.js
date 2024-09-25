import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Main from "../src/components/Main";
import Signin_mode from "../src/components/signin_up/Signin_mode";
import Contact from "../src/Pages/FooterItems/Contact";
import AboutUs from "../src/Pages/FooterItems/AboutUs";
import AccountPage from "./Pages/Account/AccountPage";
import DataTablolar from './Pages/Makul/DataTablolar';
import DataDetails from './Pages/Makul/DataDetails';
import PiyasaDetails from './Pages/Makul/PiyasaDetails';
import DailyData from './components/DailyData';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path="/login" element={<Signin_mode />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/account' element={<AccountPage />} />
          <Route path='/tables' element={<DataTablolar />} />
          <Route path='/tables/:tableName' element={<DataDetails />} />
          {/* <Route path="/piyasa" element={<Piyasa />} /> */}
          <Route path="/piyasa/:tableName" element={<PiyasaDetails />} />
          <Route path="/dailydata" element={<DailyData />} />
          
        </Routes>
      </Router>

    
    </div>
  );
}

export default App;
