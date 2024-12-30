'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FaSun, FaMoon } from "react-icons/fa";
import { motion } from "framer-motion";

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Only set 'mounted' to true after the component has mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent rendering on the server
  if (!mounted) {
    return null;
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label="change theme"
        className='text-text text-3xl hover:text-subtext0'
      >
        {theme === 'light' ? <FaSun /> : <FaMoon />}
      </motion.button>
    </>
  );
};

export default ThemeSwitch;