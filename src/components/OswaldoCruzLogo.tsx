import React from 'react';

interface OswaldoCruzLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  subtitleColor?: string;
}

export const OswaldoCruzLogo: React.FC<OswaldoCruzLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-white',
  subtitleColor = 'text-teal-400',
}) => {
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return { w: 26, h: 26, viewBox: '0 0 100 100' };
      case 'lg':
        return { w: 46, h: 46, viewBox: '0 0 100 100' };
      case 'xl':
        return { w: 60, h: 60, viewBox: '0 0 100 100' };
      case 'md':
      default:
        return { w: 36, h: 36, viewBox: '0 0 100 100' };
    }
  };

  const { w, h } = getIconSize();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Emblem based on official Hospital Alemão Oswaldo Cruz geometry */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        {/* Top-Right Quadrant: Vibrant Oswaldo Cruz Teal */}
        <path
          d="M 50 10 A 40 40 0 0 1 90 50 L 50 50 Z"
          fill="#00a2b4"
        />
        {/* Top-Left Quadrant: Medium Deep Teal */}
        <path
          d="M 50 10 A 40 40 0 0 0 10 50 L 50 50 Z"
          fill="#007788"
        />
        {/* Bottom-Left Quadrant: Deep Petrol Navy */}
        <path
          d="M 10 50 A 40 40 0 0 0 50 90 L 50 50 Z"
          fill="#083847"
        />
        {/* Inner concentric ring / modern cutout styling */}
        <circle cx="50" cy="50" r="15" fill="#0c232f" />
        <circle cx="50" cy="50" r="7" fill="#00d2e6" />
      </svg>

      {showText && (
        <div className="flex flex-col select-none leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-black tracking-tight text-sm sm:text-base uppercase ${textColor}`}>
              OSWALDO CRUZ
            </span>
          </div>
          <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.22em] ${subtitleColor} mt-0.5`}>
            HOSPITAL ALEMÃO
          </span>
        </div>
      )}
    </div>
  );
};
