import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 40, showText = true }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Logo Icon - Modern JH Monogram */}
            <div className="relative">
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Gradient Definitions */}
                    <defs>
                        <linearGradient id="logoGradientPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#059669" />
                            <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="logoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.3" />
                        </filter>
                    </defs>

                    {/* Main Circle Background */}
                    <circle cx="50" cy="50" r="48" fill="url(#logoGradientPrimary)" filter="url(#logoShadow)" />

                    {/* Inner Circle */}
                    <circle cx="50" cy="50" r="40" fill="white" fillOpacity="0.15" />

                    {/* JH Monogram */}
                    <g transform="translate(20, 25)">
                        {/* Letter J */}
                        <path
                            d="M 15 10 L 15 35 Q 15 45 8 45 Q 2 45 2 40"
                            stroke="white"
                            strokeWidth="7"
                            strokeLinecap="round"
                            fill="none"
                        />
                        {/* Letter H */}
                        <path
                            d="M 35 10 L 35 45 M 55 10 L 55 45 M 35 27 L 55 27"
                            stroke="white"
                            strokeWidth="7"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </g>

                    {/* Decorative Elements */}
                    <circle cx="85" cy="20" r="4" fill="white" fillOpacity="0.4" />
                    <circle cx="15" cy="80" r="3" fill="white" fillOpacity="0.3" />
                </svg>
            </div>

            {/* Logo Text */}
            {showText && (
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                        JUBEL HAVILAH
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-[0.3em] uppercase">
                        Enterprise
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
