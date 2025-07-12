import React, { useMemo } from 'react';
import quotes from '../data/quotesData';
import { motion } from 'framer-motion';

const animations = [
  { initial: { opacity: 0, y: -40 }, animate: { opacity: 1, y: 0 } },
  { initial: { opacity: 0, scale: 0.5, rotate: -10 }, animate: { opacity: 1, scale: 1, rotate: 0 } },
  { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } },
  { initial: { opacity: 0, rotateX: 90 }, animate: { opacity: 1, rotateX: 0 } },
  { initial: { opacity: 0, y: 30, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 } }
];

const QuoteOfTheDay = () => {
  const todayIndex = useMemo(() => {
    const date = new Date();
    return date.getDate() % quotes.length;
  }, []);

  const selectedQuote = quotes[todayIndex];

  const randomAnimation = useMemo(() => {
    const index = Math.floor(Math.random() * animations.length);
    return animations[index];
  }, []);

  return (
    <>
      {/* Inject Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:ital,wght@1,400;1,600&display=swap');

          .font-display {
            font-family: 'Inter', sans-serif;
          }

          .font-serif {
            font-family: 'Playfair Display', serif;
          }
        `}
      </style>

      <motion.div
        initial={randomAnimation.initial}
        animate={randomAnimation.animate}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="mb-8 text-center px-4"
      >
        <h3 className="text-4xl sm:text-4xl font-bold text-indigo-600 mb-4 font-display">
          ✨ Quote of the Day
        </h3>
        <p className="text-xl sm:text-4xl text-gray-800 italic font-serif leading-relaxed">
          “{selectedQuote.text}”
        </p>
        <p className="text-sm text-gray-500 mt-2 font-display">— {selectedQuote.author}</p>
      </motion.div>
    </>
  );
};

export default QuoteOfTheDay;
