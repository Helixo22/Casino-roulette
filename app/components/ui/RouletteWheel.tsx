import React from 'react';

interface RouletteWheelProps {
  spinning: boolean;
  result: string | null;
}

const NUMBERS = [
  '0', '32', '15', '19', '4', '21', '2', '25', '17', '34', '6', '27', '13', '36',
  '11', '30', '8', '23', '10', '5', '24', '16', '33', '1', '20', '14', '31', '9',
  '22', '18', '29', '7', '28', '12', '35', '3', '26', '00'
];

const RED_NUMBERS = ['1', '3', '5', '7', '9', '12', '14', '16', '18', '19', '21', '23', '25', '27', '30', '32', '34', '36'];

export const RouletteWheel: React.FC<RouletteWheelProps> = ({ spinning, result }) => {
  return (
    <svg viewBox="0 0 500 500" className={`w-full h-full ${spinning ? 'animate-spin' : ''}`}>
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: 'rgb(255,255,255)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgb(0,0,0)', stopOpacity: 1 }} />
        </radialGradient>
      </defs>
      <circle cx="250" cy="250" r="250" fill="url(#grad)" />
      {NUMBERS.map((number, index) => {
        const angle = (index * 360) / NUMBERS.length;
        const isRed = RED_NUMBERS.includes(number);
        return (
          <g key={number} transform={`rotate(${angle} 250 250)`}>
            <path
              d={`M250 250 L250 0 A250 250 0 0 1 ${250 + 250 * Math.sin(Math.PI / NUMBERS.length)} ${250 - 250 * Math.cos(Math.PI / NUMBERS.length)} Z`}
              fill={isRed ? 'red' : (number === '0' || number === '00' ? 'green' : 'black')}
            />
            <text
              x="250"
              y="20"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              transform="rotate(90 250 20)"
            >
              {number}
            </text>
          </g>
        );
      })}
      <circle cx="250" cy="250" r="30" fill="white" />
      {result && (
        <text x="250" y="255" fontSize="20" fontWeight="bold" textAnchor="middle" fill="black">
          {result}
        </text>
      )}
    </svg>
  );
};