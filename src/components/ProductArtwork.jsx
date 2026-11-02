import React from 'react';

/**
 * Light-theme, daylight studio artwork renderer inspired by Jimeng AI (即梦AI).
 * Clean, airy pastel/editorial backgrounds, realistic soft shadows, zero text clutter.
 */
export default function ProductArtwork({
  svgType = 'serum',
  customImageUrl = null,
  isCutout = false,
  palette = 'lavender', // 'lavender' | 'botanical' | 'cream' | 'glacier' | 'rose' | 'apricot' | 'festive'
  animate = false,
  badge = '',
  marketingBadge = null,
  className = ''
}) {
  const palettes = {
    festive: {
      bg: 'from-[#FFF1F2] via-[#FFE4E6] to-[#FED7AA]',
      glow1: 'rgba(239, 68, 68, 0.25)',
      glow2: 'rgba(245, 158, 11, 0.22)',
      podium: 'bg-[#FFF7ED]/90 border-amber-200'
    },
    lavender: {
      bg: 'from-[#F3F0FF] via-[#E9E4FF] to-[#DCD4FF]',
      glow1: 'rgba(139, 92, 246, 0.22)',
      glow2: 'rgba(236, 72, 153, 0.16)',
      podium: 'bg-white/75 border-white'
    },
    botanical: {
      bg: 'from-[#ECFDF5] via-[#D8F8E8] to-[#BCEFD6]',
      glow1: 'rgba(16, 185, 129, 0.22)',
      glow2: 'rgba(56, 189, 248, 0.18)',
      podium: 'bg-white/80 border-white'
    },
    cream: {
      bg: 'from-[#FAF7F2] via-[#F2ECE1] to-[#E6DEC8]',
      glow1: 'rgba(245, 158, 11, 0.18)',
      glow2: 'rgba(217, 119, 6, 0.14)',
      podium: 'bg-[#FFFDF9]/85 border-white'
    },
    glacier: {
      bg: 'from-[#F0F9FF] via-[#E0F2FE] to-[#C7E8FD]',
      glow1: 'rgba(14, 165, 233, 0.22)',
      glow2: 'rgba(99, 102, 241, 0.15)',
      podium: 'bg-white/80 border-white'
    },
    rose: {
      bg: 'from-[#FFF1F2] via-[#FFE4E6] to-[#FECDD3]',
      glow1: 'rgba(244, 63, 94, 0.2)',
      glow2: 'rgba(251, 146, 60, 0.15)',
      podium: 'bg-white/80 border-white'
    },
    apricot: {
      bg: 'from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]',
      glow1: 'rgba(245, 158, 11, 0.24)',
      glow2: 'rgba(244, 63, 94, 0.14)',
      podium: 'bg-white/85 border-white'
    }
  };

  const currentPalette = palettes[palette] || palettes.lavender;

  return (
    <div
      className={`relative overflow-hidden select-none flex items-center justify-center ${
        isCutout ? 'bg-[#F8FAFC]' : `bg-gradient-to-br ${currentPalette.bg}`
      } ${className}`}
    >
      {/* Daylight Sunbeam & Studio Podium */}
      {!isCutout && (
        <>
          <div
            className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full blur-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${currentPalette.glow1} 0%, transparent 70%)`
            }}
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${currentPalette.glow2} 0%, transparent 70%)`
            }}
          />
          {/* Window Sunlight Diagonal Streak */}
          <div className="absolute -inset-y-10 left-1/4 w-24 rotate-25 bg-gradient-to-r from-transparent via-white/45 to-transparent pointer-events-none" />
          {/* 3D Cylindrical Studio Podium */}
          <div
            className={`absolute bottom-[8%] w-2/3 h-8 rounded-[100%] shadow-[0_12px_24px_rgba(0,0,0,0.06)] border-t ${currentPalette.podium} pointer-events-none`}
          />
        </>
      )}

      {/* Subtle Checkerboard when viewing transparent cutout */}
      {isCutout && (
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
          }}
        />
      )}

      {/* Main Product Subject */}
      <div
        className={`relative z-10 w-3/4 h-3/4 flex items-center justify-center transition-transform duration-500 group-hover:scale-106 ${
          animate ? 'animate-float-gentle' : ''
        }`}
      >
        {customImageUrl ? (
          <img
            src={customImageUrl}
            alt="商品主体"
            className="max-w-full max-h-full object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.16)]"
          />
        ) : (
          <>
            {svgType === 'serum' && (
          <svg viewBox="0 0 240 280" className="w-full h-full drop-shadow-[0_18px_24px_rgba(79,70,229,0.22)]">
            <defs>
              <linearGradient id="ltSerum" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
              <linearGradient id="ltGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fde68a" />
              </linearGradient>
              <radialGradient id="ltBubble" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#c4b5fd" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </radialGradient>
            </defs>
            {!isCutout && (
              <>
                <circle cx="48" cy="105" r="8" fill="url(#ltBubble)" opacity="0.85" />
                <circle cx="192" cy="88" r="11" fill="url(#ltBubble)" opacity="0.75" />
                <circle cx="184" cy="196" r="6" fill="url(#ltBubble)" opacity="0.9" />
              </>
            )}
            <path d="M105 28 C105 14, 135 14, 135 28 L137 56 L103 56 Z" fill="#312e81" />
            <rect x="96" y="55" width="48" height="22" rx="4" fill="url(#ltGold)" />
            <path
              d="M96 77 C76 90, 72 106, 72 126 L72 232 C72 244, 82 252, 94 252 L146 252 C158 252, 168 244, 168 232 L168 126 C168 106, 164 90, 144 77 Z"
              fill="url(#ltSerum)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <path d="M83 108 L83 234" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
            <rect x="88" y="144" width="64" height="58" rx="6" fill="rgba(255,255,255,0.95)" />
            <text x="120" y="168" textAnchor="middle" fill="#1e1b4b" fontSize="8.5" fontWeight="bold" letterSpacing="2">
              LUMIÈRE
            </text>
            <line x1="102" y1="178" x2="138" y2="178" stroke="#6366f1" strokeWidth="1" />
            <text x="120" y="191" textAnchor="middle" fill="#64748b" fontSize="6" letterSpacing="1">
              ESSENCE
            </text>
          </svg>
        )}

        {svgType === 'headphone' && (
          <svg viewBox="0 0 240 260" className="w-full h-full drop-shadow-[0_18px_24px_rgba(14,165,233,0.22)]">
            <defs>
              <linearGradient id="ltSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="ltBlueCup" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="55%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <path
              d="M52 145 C52 60, 188 60, 188 145"
              fill="none"
              stroke="url(#ltSilver)"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <rect x="36" y="130" width="34" height="72" rx="17" fill="url(#ltBlueCup)" stroke="#ffffff" strokeWidth="1.5" />
            <rect x="64" y="136" width="14" height="60" rx="7" fill="#f1f5f9" />
            <rect x="170" y="130" width="34" height="72" rx="17" fill="url(#ltBlueCup)" stroke="#ffffff" strokeWidth="1.5" />
            <rect x="162" y="136" width="14" height="60" rx="7" fill="#f1f5f9" />
          </svg>
        )}

        {svgType === 'coffee' && (
          <svg viewBox="0 0 240 270" className="w-full h-full drop-shadow-[0_18px_24px_rgba(217,119,6,0.2)]">
            <defs>
              <linearGradient id="ltCream" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="65%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="ltCoffee" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="40%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>
            <rect x="78" y="36" width="84" height="114" rx="22" fill="url(#ltCream)" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="120" cy="78" r="17" fill="#292524" stroke="#f59e0b" strokeWidth="3.5" />
            <line x1="120" y1="78" x2="129" y2="68" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <path d="M94 150 L146 150 L136 168 L104 168 Z" fill="#44403c" />
            <path d="M116 168 L116 205" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M124 168 L124 205" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M88 192 L152 192 L144 242 C142 250, 98 250, 96 242 Z" fill="rgba(255,255,255,0.65)" stroke="#ffffff" strokeWidth="2" />
            <path d="M91 204 L149 204 L143 240 C141 246, 99 246, 97 240 Z" fill="url(#ltCoffee)" />
          </svg>
        )}

            {svgType === 'dress' && (
              <svg viewBox="0 0 240 280" className="w-full h-full drop-shadow-[0_18px_24px_rgba(236,72,153,0.2)]">
                <defs>
                  <linearGradient id="ltSilk" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fce7f3" />
                    <stop offset="50%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                </defs>
                <path d="M98 42 L104 75 L136 75 L142 42" fill="none" stroke="#f472b6" strokeWidth="2.5" />
                <path
                  d="M94 68 C108 78, 132 78, 146 68 L152 118 L184 242 C152 256, 88 256, 56 242 L88 118 Z"
                  fill="url(#ltSilk)"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <path d="M90 118 Q120 128 150 118" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
                <path d="M104 122 L78 236" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
                <path d="M138 122 L164 236" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
              </svg>
            )}
          </>
        )}
      </div>

      {/* E-commerce High-Conversion Marketing Badge */}
      {marketingBadge && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white text-[11px] font-black tracking-tight shadow-md border border-white/40 flex items-center gap-1">
            <span>🔥</span>
            <span>{marketingBadge}</span>
          </div>
        </div>
      )}

      {/* Minimal Pill Tag */}
      {badge && (
        <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-[11px] font-medium text-slate-700 shadow-sm">
          {badge}
        </div>
      )}
    </div>
  );
}
