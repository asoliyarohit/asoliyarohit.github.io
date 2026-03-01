export default function Jharokha() {
  const hangings = [-36, -18, 0, 18, 36]
  const archDots = [
    // Left side (bottom to apex)
    { cx: 80, cy: 262 }, { cx: 64, cy: 228 }, { cx: 60, cy: 192 },
    { cx: 68, cy: 158 }, { cx: 86, cy: 126 }, { cx: 110, cy: 100 },
    { cx: 136, cy: 78 },
    // Right side (apex to bottom)
    { cx: 164, cy: 78 }, { cx: 190, cy: 100 }, { cx: 214, cy: 126 },
    { cx: 232, cy: 158 }, { cx: 240, cy: 192 }, { cx: 236, cy: 228 }, { cx: 220, cy: 262 },
  ]

  return (
    <div className="jharokha-wrapper">
      <div className="jharokha-glow" />
      <svg
        className="jharokha-svg"
        viewBox="0 0 300 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Rajasthani Jharokha decorative element"
        role="img"
      >
        <defs>
          {/* Gold gradient */}
          <linearGradient id="jhGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#FF6B2C" />
          </linearGradient>

          {/* Subtle gold */}
          <linearGradient id="jhGoldSub" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0.4" />
          </linearGradient>

          {/* Jali diamond pattern */}
          <pattern id="jali" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M11,0 L22,11 L11,22 L0,11 Z" fill="none" stroke="#D4AF37" strokeWidth="0.55" opacity="0.42" />
            <path d="M11,5 L16,11 L11,17 L6,11 Z" fill="none" stroke="#FF6B2C" strokeWidth="0.4" opacity="0.28" />
            <circle cx="11" cy="11" r="1" fill="#D4AF37" opacity="0.25" />
          </pattern>

          {/* Clip to arch interior */}
          <clipPath id="archClip">
            <path d="M 68,282 C 68,210 100,130 150,68 C 200,130 232,210 232,282 Z" />
          </clipPath>

          {/* Glow filter */}
          <filter id="glowF" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft glow */}
          <filter id="softGlowF" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Ambient background glow ── */}
        <ellipse cx="150" cy="210" rx="130" ry="160" fill="rgba(212,175,55,0.04)" />

        {/* ── Jali fill inside arch ── */}
        <rect x="0" y="0" width="300" height="440" fill="url(#jali)" clipPath="url(#archClip)" className="jali-anim" />

        {/* ── Outer arch frame ── */}
        <path
          d="M 48,290 C 48,220 95,118 150,58 C 205,118 252,220 252,290 Z"
          fill="rgba(8,8,18,0.88)"
          stroke="url(#jhGold)"
          strokeWidth="2.5"
          filter="url(#glowF)"
        />

        {/* ── Inner arch lines (nested arches for depth) ── */}
        <path
          d="M 68,282 C 68,210 100,130 150,70 C 200,130 232,210 232,282"
          fill="none"
          stroke="#FF6B2C"
          strokeWidth="1.2"
          opacity="0.65"
        />
        <path
          d="M 85,278 C 85,215 112,143 150,88 C 188,143 215,215 215,278"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.8"
          opacity="0.45"
        />
        <path
          d="M 100,274 C 100,220 122,157 150,106 C 178,157 200,220 200,274"
          fill="none"
          stroke="#FF6B2C"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* ── Decorative dots along arch edge ── */}
        {archDots.map((pt, i) => (
          <circle key={i} cx={pt.cx} cy={pt.cy} r="2.5" fill="url(#jhGold)" opacity="0.6" />
        ))}

        {/* ── Horizontal decorative bands ── */}
        <line x1="92" y1="170" x2="208" y2="170" stroke="#D4AF37" strokeWidth="0.5" opacity="0.35" strokeDasharray="5,5" />
        <line x1="78" y1="220" x2="222" y2="220" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" strokeDasharray="5,5" />

        {/* ── Multifoil cusps at apex ── */}
        <circle cx="150" cy="70" r="12" fill="none" stroke="#D4AF37" strokeWidth="1.2" opacity="0.55" />
        <circle cx="126" cy="88" r="9" fill="none" stroke="#D4AF37" strokeWidth="0.9" opacity="0.4" />
        <circle cx="174" cy="88" r="9" fill="none" stroke="#D4AF37" strokeWidth="0.9" opacity="0.4" />
        <circle cx="108" cy="114" r="7" fill="none" stroke="#D4AF37" strokeWidth="0.7" opacity="0.3" />
        <circle cx="192" cy="114" r="7" fill="none" stroke="#D4AF37" strokeWidth="0.7" opacity="0.3" />

        {/* ── Central 8-petal lotus medallion (spinning) ── */}
        <g className="petal-spin">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180
            const px = 150 + Math.cos(rad) * 17
            const py = 200 + Math.sin(rad) * 17
            return (
              <ellipse
                key={i}
                cx={px}
                cy={py}
                rx="5"
                ry="12"
                transform={`rotate(${deg}, ${px}, ${py})`}
                fill="url(#jhGoldSub)"
              />
            )
          })}
        </g>
        {/* Lotus center */}
        <circle cx="150" cy="200" r="10" fill="url(#jhGold)" opacity="0.55" filter="url(#glowF)" />
        <circle cx="150" cy="200" r="5" fill="#FF6B2C" opacity="0.8" />
        <circle cx="150" cy="200" r="2" fill="#D4AF37" opacity="1" />

        {/* ── Glow pulse rings ── */}
        <circle cx="150" cy="200" r="72" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.25" className="pulse-ring-1" />
        <circle cx="150" cy="200" r="90" fill="none" stroke="#FF6B2C" strokeWidth="0.4" opacity="0.18" className="pulse-ring-2" />
        <circle cx="150" cy="200" r="108" fill="none" stroke="#D4AF37" strokeWidth="0.3" opacity="0.1" className="pulse-ring-3" />

        {/* ── Bottom platform ── */}
        <rect x="38" y="288" width="224" height="12" rx="3" fill="#D4AF37" opacity="0.18" />
        <rect x="30" y="298" width="240" height="7" rx="2" fill="#D4AF37" opacity="0.1" />

        {/* ── Left corbel bracket ── */}
        <path d="M 48,290 Q 22,308 26,335 L 48,335 Z" fill="url(#jhGoldSub)" opacity="0.6" />
        <line x1="48" y1="290" x2="26" y2="335" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />

        {/* ── Right corbel bracket ── */}
        <path d="M 252,290 Q 278,308 274,335 L 252,335 Z" fill="url(#jhGoldSub)" opacity="0.6" />
        <line x1="252" y1="290" x2="274" y2="335" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />

        {/* ── Side pillars ── */}
        <rect x="38" y="298" width="16" height="80" rx="3" fill="url(#jhGold)" opacity="0.15" />
        <rect x="246" y="298" width="16" height="80" rx="3" fill="url(#jhGold)" opacity="0.15" />
        {/* Pillar decorations */}
        {[310, 330, 350].map((y, i) => (
          <g key={i}>
            <rect x="39" y={y} width="14" height="2" rx="1" fill="#D4AF37" opacity="0.35" />
            <rect x="247" y={y} width="14" height="2" rx="1" fill="#D4AF37" opacity="0.35" />
          </g>
        ))}

        {/* ── Hanging ghungroo ornaments ── */}
        {hangings.map((offset, i) => {
          const x = 150 + offset
          return (
            <g key={i}>
              <line x1={x} y1="288" x2={x} y2="304" stroke="#D4AF37" strokeWidth="0.8" opacity="0.55" />
              <circle cx={x} cy="307" r="3.5" fill="url(#jhGold)" opacity="0.75" filter="url(#glowF)" />
              <circle cx={x} cy="307" r="1.5" fill="#FFF8E7" opacity="0.6" />
            </g>
          )
        })}

        {/* ── Top finial / kalash ── */}
        {/* Base ring */}
        <ellipse cx="150" cy="48" r="14" ry="7" fill="url(#jhGold)" opacity="0.7" filter="url(#softGlowF)" />
        {/* Kalash body */}
        <path d="M 140,48 Q 135,34 139,22 L 161,22 Q 165,34 160,48 Z" fill="url(#jhGold)" opacity="0.65" />
        {/* Neck */}
        <rect x="144" y="17" width="12" height="7" rx="2" fill="url(#jhGold)" opacity="0.8" />
        {/* Top gem */}
        <circle cx="150" cy="13" r="6" fill="#FF6B2C" opacity="0.9" filter="url(#glowF)" />
        <circle cx="150" cy="13" r="3" fill="#D4AF37" opacity="1" />
        {/* Crown lines */}
        {[-12, -6, 0, 6, 12].map((dx, i) => (
          <line
            key={i}
            x1={150 + dx}
            y1="7"
            x2={150 + dx * 1.4}
            y2="2"
            stroke="#D4AF37"
            strokeWidth="1"
            opacity={0.5 - Math.abs(dx) * 0.03}
          />
        ))}
        {/* Horizontal bar */}
        <rect x="136" y="43" width="28" height="2.5" rx="1" fill="#D4AF37" opacity="0.6" />
      </svg>
    </div>
  )
}
