import { useMotionValue } from "framer-motion";
import { Briefcase, Trophy, Code2, GraduationCap } from "lucide-react";
import FloatingTag from "./FloatingTag";

function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    // Get position relative to center of the screen, normalized between -1 and 1
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen overflow-hidden bg-mist flex flex-col items-center justify-center px-6"
    >
      {/* Floating tags scattered around the hero */}
      {/* Outer ring — far from center, minimal blur */}
      <FloatingTag label="Hackathons" icon={Code2} top="10%" left="6%" delay={0.1} strength={30} blurAmount={1} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Aerospace" top="8%" right="8%" delay={0.15} strength={28} blurAmount={1} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Remote" top="60%" left="5%" delay={0.6} strength={14} blurAmount={1} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="GSoC" top="62%" right="6%" delay={0.65} strength={18} blurAmount={1} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Internships" icon={Briefcase} top="88%" left="14%" delay={0.8} strength={16} blurAmount={1} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="NLP" top="90%" right="16%" delay={0.85} strength={14} blurAmount={1} mouseX={mouseX} mouseY={mouseY} />

      {/* Middle ring — moderate blur */}
      <FloatingTag label="Research Fellowships" icon={GraduationCap} top="20%" right="14%" delay={0.2} strength={24} blurAmount={2} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Data Science" top="22%" left="14%" delay={0.25} strength={22} blurAmount={2} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Cyber Security" top="38%" left="8%" delay={0.35} strength={20} blurAmount={2} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Kaggle Competitions" icon={Trophy} top="40%" right="9%" delay={0.4} strength={20} blurAmount={2} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Robotics" top="74%" left="18%" delay={0.7} strength={16} blurAmount={2} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Computer Vision" top="76%" right="20%" delay={0.75} strength={16} blurAmount={2} mouseX={mouseX} mouseY={mouseY} />

      {/* Inner ring — closest to headline, heaviest blur */}
      <FloatingTag label="ML Engineer" icon={Briefcase} top="14%" left="34%" delay={0.3} strength={12} blurAmount={3} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Deep Learning" top="16%" right="32%" delay={0.32} strength={12} blurAmount={3} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="LLM Research" top="48%" left="28%" delay={0.45} strength={10} blurAmount={3} mouseX={mouseX} mouseY={mouseY} />
      <FloatingTag label="Generative AI" top="50%" right="26%" delay={0.5} strength={10} blurAmount={3} mouseX={mouseX} mouseY={mouseY} />
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        

        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-ink leading-tight">
          Find what's next
          <br />
          in AI &amp; ML
        </h1>

        

        <div className="flex gap-4 mt-8">
          <button className="bg-ink text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-cocoa transition-colors">
            Explore Opportunities
          </button>
          <button className="bg-white text-ink border border-mist px-6 py-3 rounded-full font-medium text-sm hover:border-steel transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;