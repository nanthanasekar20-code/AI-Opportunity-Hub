import { motion } from "framer-motion";

function AboutSection() {
  return (
    <section className="relative w-full bg-white py-28 px-6">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span className="text-xs font-semibold tracking-widest text-amber uppercase mb-4 block">
          About us
        </span>

        <h2 className="font-display font-bold text-3xl md:text-4xl text-ink mb-6">
          Empowering educators with AI opportunities.
        </h2>

        <p className="font-body text-steel text-base md:text-lg leading-relaxed">
        At AI Opportunity Hub, we believe that discovering the right opportunity should never be difficult.

        Our platform aggregates AI and Machine Learning opportunities from trusted organizations, universities, research labs, and technology companies into one easy-to-use portal. Whether it's an internship, hackathon, research position, competition, or job opening, faculty members can quickly find and share valuable opportunities with their students.

          We aim to reduce the time spent searching across multiple websites while ensuring that educators stay informed about the latest AI/ML opportunities.
        </p>
      </motion.div>
    </section>
  );
}

export default AboutSection;