import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutSection from "../components/AboutSection";

function Home() {
  return (
    <div className="font-body">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <AboutSection />
      </div>
    </div>
  );
}

export default Home;