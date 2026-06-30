import { motion, useTransform, useSpring } from "framer-motion";
import { useState } from "react";

function FloatingTag({ label, icon: Icon, top, left, right, delay, mouseX, mouseY, strength = 20, blurAmount = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  const x = useTransform(mouseX, (val) => val * strength);
  const y = useTransform(mouseY, (val) => val * strength);

  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });

  return (
    <motion.div
      className="absolute select-none pointer-events-auto cursor-default"
      style={{
        top: top,
        left: left,
        right: right,
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: [0, 1, 1, 1],
        y: [10, 0, -6, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="flex items-center gap-2 bg-white/80 border border-mist px-4 py-2 rounded-full shadow-sm text-sm font-medium text-midnight whitespace-nowrap"
        animate={{
          filter: isHovered ? "blur(0px)" : `blur(${blurAmount}px)`,
          opacity: isHovered ? 1 : 0.55,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {Icon && <Icon size={14} className="text-amber" />}
        {label}
      </motion.div>
    </motion.div>
  );
}

export default FloatingTag;