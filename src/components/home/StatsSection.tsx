import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

const stats = [
  { value: 3192, label: "SUCCESSFULLY TRAINED", suffix: "+" },
  { value: 15485, label: "CLASSES COMPLETED", suffix: "+" },
  { value: 97.55, label: "SATISFACTION RATE", suffix: "%" },
  { value: 1200, label: "CERTIFIED TEACHERS", suffix: "+" },
];

const StatsSection: React.FC = () => {
  return (
    <div className="w-full bg-teal-400 py-16 flex justify-center">
      <div className="max-w-6xl w-full flex flex-wrap justify-around gap-8 text-center">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="w-44"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <p className="text-white text-3xl font-bold">
              <CountUp
                end={stat.value}
                duration={2.5}
                separator=","
                suffix={stat.suffix}
              />
            </p>
            <p className="text-white text-sm font-bold mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
