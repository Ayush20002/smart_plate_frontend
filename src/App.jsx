// App.jsx
import { Routes, Route } from 'react-router-dom';
import ButtonGradient from "./assets/svg/ButtonGradient";
import Benefits from "./components/Benefits";
import Collaboration from "./components/Collaboration";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import Roadmap from "./components/Roadmap";
import Services from "./components/Services";
import DietForm from './components/design/DietForm';

const App = () => {
  return (
    <Routes>
      {/* Main Landing Page Route */}
      <Route path="/" element={
        <>
          <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
            <Header />
            <Hero />
            <Benefits />
            <Collaboration />
            <Services />
            <Pricing />
            <Roadmap />
            <Footer />
          </div>
          <ButtonGradient />
        </>
      } />

      {/* Diet Form Page Route */}
      <Route path="/diet-form" element={
        <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
          <Header />
          <DietForm />
          <Footer />
        </div>
      } />
    </Routes>
  );
};

export default App;
