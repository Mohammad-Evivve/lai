import React from 'react';
import { motion } from 'framer-motion';

/**
 * SignalVisual Component
 * Renders abstract SVG animations representing leadership system states.
 * Types: CONVERGENCE, DIVERGENCE, NETWORK, COHERENCE
 */
const SignalVisual = ({ type, width = 300, height = 150, color = "#2dd4bf", opacity = 0.6 }) => {
  const renderVisual = () => {
    switch (type) {
      case 'CONVERGENCE':
        return (
          <g>
            {[...Array(5)].map((_, i) => (
              <motion.line
                key={i}
                x1={20}
                y1={20 + i * (height / 6)}
                x2={width - 20}
                y2={height / 2}
                stroke={color}
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: opacity }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  delay: i * 0.2,
                  ease: "easeInOut" 
                }}
              />
            ))}
            <motion.circle 
              cx={width - 20} 
              cy={height / 2} 
              r="3" 
              fill={color}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </g>
        );

      case 'DIVERGENCE':
        return (
          <g>
            <motion.line
              x1={20}
              y1={height / 2}
              x2={width / 3}
              y2={height / 2}
              stroke={color}
              strokeWidth="1.5"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            {[...Array(4)].map((_, i) => (
              <motion.line
                key={i}
                x1={width / 3}
                y1={height / 2}
                x2={width - 20}
                y2={15 + i * (height / 4)}
                stroke={color}
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: opacity * 0.8 }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  delay: i * 0.3,
                  ease: "easeInOut" 
                }}
              />
            ))}
          </g>
        );

      case 'NETWORK':
        const nodes = [
          { x: 40, y: 30 }, { x: 100, y: 20 }, { x: 160, y: 40 },
          { x: 60, y: 80 }, { x: 130, y: 90 }, { x: 200, y: 60 },
          { x: 240, y: 30 }, { x: 80, y: 50 }
        ];
        return (
          <g>
            {nodes.map((node, i) => (
              <React.Fragment key={i}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="2"
                  fill={color}
                  animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
                  transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.5 }}
                />
                {nodes.slice(i + 1).map((target, j) => (
                  (i + j) % 3 === 0 && (
                    <motion.line
                      key={`${i}-${j}`}
                      x1={node.x} y1={node.y}
                      x2={target.x} y2={target.y}
                      stroke={color}
                      strokeWidth="0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.15, 0] }}
                      transition={{ duration: 5 + i, repeat: Infinity, delay: i }}
                    />
                  )
                ))}
              </React.Fragment>
            ))}
          </g>
        );

      case 'COHERENCE':
        return (
          <g>
            {[...Array(6)].map((_, i) => (
              <motion.line
                key={i}
                x1={20}
                y1={20 + i * (height / 7)}
                x2={width - 20}
                y2={20 + i * (height / 7)}
                stroke={color}
                strokeWidth="1.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: opacity }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: i * 0.4
                }}
              />
            ))}
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      style={{ overflow: 'visible' }}
    >
      {renderVisual()}
    </svg>
  );
};

export default SignalVisual;
