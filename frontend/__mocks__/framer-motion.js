import React from 'react';

// Mock framer-motion for testing
export const motion = {
  div: ({ children, ...props }) => React.createElement('div', props, children),
  span: ({ children, ...props }) => React.createElement('span', props, children),
  button: ({ children, ...props }) => React.createElement('button', props, children),
  p: ({ children, ...props }) => React.createElement('p', props, children),
  h1: ({ children, ...props }) => React.createElement('h1', props, children),
  h2: ({ children, ...props }) => React.createElement('h2', props, children),
  h3: ({ children, ...props }) => React.createElement('h3', props, children),
};

export const AnimatePresence = ({ children }) => children;

export default {
  motion,
  AnimatePresence,
};
