import React from 'react';

export default function RiskGauge({ score = 0, riskLevel = 'LOW', prediction = 'LEGITIMATE', confidence = 0.95 }) {
  // Radius and circumference for SVG circle
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Use 270 degree arc for gauge look
  const strokeDashoffset = circumference - (score / 100) * circumference * 0.75;

  let color = 'var(--status-safe)';
  let glowColor = 'var(--shadow-glow-safe)';
  let badgeClass = 'badge-legitimate';

  if (prediction === 'PHISHING' || score > 70) {
    color = 'var(--status-phishing)';
    glowColor = 'var(--shadow-glow-danger)';
    badgeClass = 'badge-phishing';
  } else if (prediction === 'SUSPICIOUS' || score > 35) {
    color = 'var(--status-suspicious)';
    glowColor = '0 0 30px rgba(245, 158, 11, 0.35)';
    badgeClass = 'badge-suspicious';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          height={220}
          width={220}
          style={{ transform: 'rotate(135deg)', filter: `drop-shadow(${glowColor})` }}
        >
          {/* Background track */}
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            r={normalizedRadius}
            cx={110}
            cy={110}
            strokeLinecap="round"
          />
          {/* Active progress track */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
            }}
            r={normalizedRadius}
            cx={110}
            cy={110}
            strokeLinecap="round"
          />
        </svg>

        {/* Center score readout */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Risk Score
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: '3.2rem',
              fontWeight: 800,
              lineHeight: 1,
              color: color,
              textShadow: `0 0 20px ${color}80`,
              margin: '4px 0',
            }}
          >
            {score}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            out of 100
          </span>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.95rem', padding: '6px 16px' }}>
          ● {prediction} ({riskLevel} RISK)
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          AI Confidence: {(confidence * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
