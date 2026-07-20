import React, { useEffect, useRef, useState, useId } from 'react';

/* =============================================
   DonutChart — radial expansion matching Recharts
   ============================================= */
export function DonutChart({ segments, size = 180, strokeWidth = 30, centerLabel, centerSub }) {
  const [animated, setAnimated] = useState(false);
  const CIRC = Math.PI * (size - strokeWidth);
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const GAP = 3; // gap in px around each segment

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  let cumulativeAngle = -90; // start from top

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* SVG Container — No rotation to match Recharts */}
      <svg width={size} height={size}>
        {/* bg circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const pct = seg.value / 100;
          const arcLen = CIRC * pct - GAP;
          const dashArray = `${arcLen < 0 ? 0 : arcLen} ${CIRC}`;
          const rotation = cumulativeAngle;
          cumulativeAngle += pct * 360;

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={animated ? dashArray : `0 ${CIRC}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
              transform={`rotate(${rotation} ${cx} ${cy})`}
              style={{
                transition: animated
                  ? `stroke-dasharray 1.5s ease ${i * 60}ms`
                  : 'none',
              }}
            />
          );
        })}
      </svg>

      {/* Center label — NOT part of SVG so it doesn't spin */}
      {centerLabel && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{centerLabel}</div>
          {centerSub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{centerSub}</div>}
        </div>
      )}
    </div>
  );
}

/* =============================================
   LineChart — pure SVG with left-to-right clip draw
   ============================================= */
export function LineChart({ datasets, labels, yLabel, height = 220, formatY }) {
  const svgRef = useRef(null);
  const [dims, setDims] = useState({ width: 600 });
  const [animated, setAnimated] = useState(false);
  const clipId = `line-clip-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (!svgRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setDims({ width: e.contentRect.width });
    });
    ro.observe(svgRef.current.parentElement);

    const t = setTimeout(() => setAnimated(true), 80);

    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

  const PAD = { top: 16, right: 24, bottom: 36, left: 56 };
  const W = dims.width;
  const H = height;
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // compute Y domain across all datasets
  const allValues = datasets.flatMap(d => d.data);
  const rawMax = Math.max(...allValues);
  const rawMin = 0;
  const yMax = Math.ceil(rawMax * 1.15 / 10000) * 10000 || 100;
  const yMin = rawMin;

  const fmt = formatY || (v => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${Math.round(v / 1000)}K`;
    return `${v}`;
  });

  const xPos = (i) => PAD.left + (labels.length > 1 ? (i / (labels.length - 1)) * chartW : chartW / 2);
  const yPos = (v) => PAD.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  // Cardinal spline
  const spline = (pts, tension = 0.4) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
      const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
      const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
      const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  // Y grid lines
  const yTicks = 5;
  const yGridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = yMin + (i / yTicks) * (yMax - yMin);
    return { v, y: yPos(v) };
  });

  return (
    <svg ref={svgRef} width="100%" height={H} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <clipPath id={clipId}>
          <rect
            x={PAD.left}
            y={0}
            width={animated ? chartW : 0}
            height={H}
            style={{
              transition: 'width 1.5s ease',
            }}
          />
        </clipPath>
      </defs>
      {/* Y grid + labels */}
      {yGridLines.map(({ v, y }, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
            stroke="#f1f5f9" strokeWidth={1.5} />
          <text x={PAD.left - 8} y={y + 4}
            textAnchor="end" fontSize={11} fill="#94a3b8">{fmt(v)}</text>
        </g>
      ))}

      {/* X axis labels */}
      {labels.map((lbl, i) => (
        <text key={i}
          x={xPos(i)} y={H - 8}
          textAnchor="middle" fontSize={11} fill="#94a3b8">{lbl}</text>
      ))}

      {/* Lines */}
      {datasets.map((ds, di) => {
        const pts = ds.data.map((v, i) => ({ x: xPos(i), y: yPos(v) }));
        const path = spline(pts);
        return (
          <path key={di} d={path}
            fill="none"
            stroke={ds.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={ds.dashed ? '6 4' : undefined}
            clipPath={`url(#${clipId})`}
          />
        );
      })}

      {/* Legend */}
      {datasets.length > 1 && (
        <g transform={`translate(${PAD.left}, ${H - 2})`}>
          {datasets.map((ds, di) => (
            <g key={di} transform={`translate(${di * 100}, 0)`}>
              <circle cx={5} cy={-2} r={4} fill={ds.color} />
              <text x={13} y={2} fontSize={11} fill="#64748b" fontWeight="500">{ds.label}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
