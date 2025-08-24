interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showGlow?: boolean;
  label?: string;
}

export default function ProgressRing({ 
  percentage, 
  size = 120, 
  strokeWidth = 10,
  color = "#4ECDC4",
  backgroundColor = "rgba(255, 255, 255, 0.1)",
  showGlow = true,
  label
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Dynamic color based on percentage
  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "#00D9AA"; // Success green
    if (percent >= 60) return "#4ECDC4"; // Main teal
    if (percent >= 40) return "#44D9E8"; // Complementary cyan
    if (percent >= 20) return "#FF8C42"; // Warning orange
    return "#FF6B6B"; // Danger coral
  };
  
  const progressColor = getProgressColor(percentage);
  const glowColor = progressColor;

  return (
    <div className="relative inline-block group cursor-pointer" style={{ width: size, height: size }}>
      {/* Outer glow effect */}
      {showGlow && (
        <div 
          className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
            filter: 'blur(8px)',
            transform: 'scale(1.2)'
          }}
        />
      )}
      
      {/* Inner glassmorphism background */}
      <div 
        className="absolute inset-2 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 shadow-xl group-hover:shadow-2xl transition-all duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
        }}
      />
      
      <svg 
        className="progress-ring transform -rotate-90 relative z-10 group-hover:scale-105 transition-transform duration-500" 
        width={size} 
        height={size}
        data-testid="progress-ring"
      >
        {/* Background circle with glassmorphism */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-30"
        />
        
        {/* Progress circle with gradient and glow */}
        <defs>
          <linearGradient id={`gradient-${percentage}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={progressColor} stopOpacity="1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={progressColor} stopOpacity="1" />
          </linearGradient>
          <filter id={`glow-${percentage}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${percentage})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          filter={showGlow ? `url(#glow-${percentage})` : undefined}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transformOrigin: 'center'
          }}
        />
        
        {/* Inner highlight circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="none"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
      </svg>
      
      {/* Enhanced percentage text with glassmorphism background */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div 
            className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-gray-800 group-hover:to-gray-500 transition-all duration-500" 
            data-testid="progress-percentage"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {Math.round(percentage)}%
          </div>
          {label && (
            <div className="text-xs font-medium text-gray-600 group-hover:text-gray-500 transition-colors duration-300">
              {label}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating particles effect */}
      {showGlow && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-ping"
            style={{
              top: '20%',
              left: '70%',
              animationDuration: '2s',
              animationDelay: '0s'
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-white rounded-full opacity-40 animate-ping"
            style={{
              top: '60%',
              left: '25%',
              animationDuration: '3s',
              animationDelay: '1s'
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-white rounded-full opacity-50 animate-ping"
            style={{
              top: '80%',
              left: '60%',
              animationDuration: '2.5s',
              animationDelay: '0.5s'
            }}
          />
        </div>
      )}
    </div>
  );
}
