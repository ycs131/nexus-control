import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, Button, message } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import type { FanCurvePoint, GpuParamRanges } from '../../types/ipc';

interface FanCurveEditorProps {
  deviceId: string;
  initialPoints?: FanCurvePoint[];
  paramRanges?: GpuParamRanges;
}

const DEFAULT_POINTS: FanCurvePoint[] = [
  { temperature: 40, speed_percent: 30 },
  { temperature: 55, speed_percent: 40 },
  { temperature: 65, speed_percent: 55 },
  { temperature: 75, speed_percent: 70 },
  { temperature: 85, speed_percent: 85 },
  { temperature: 95, speed_percent: 100 },
];

const FanCurveEditor: React.FC<FanCurveEditorProps> = ({
  deviceId,
  initialPoints,
  paramRanges,
}) => {
  const [points, setPoints] = useState<FanCurvePoint[]>(initialPoints ?? DEFAULT_POINTS);
  const [saving, setSaving] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const tempMin = paramRanges?.fan_curve.temp_min ?? 30;
  const tempMax = paramRanges?.fan_curve.temp_max ?? 100;
  const speedMin = paramRanges?.fan_curve.speed_min ?? 30;
  const speedMax = paramRanges?.fan_curve.speed_max ?? 100;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = 500;
  const height = 280;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const xScale = (temp: number) => padding.left + ((temp - tempMin) / (tempMax - tempMin)) * plotW;
  const yScale = (speed: number) => padding.top + plotH - ((speed - speedMin) / (speedMax - speedMin)) * plotH;
  const invXScale = (px: number) =>
    Math.round(tempMin + ((px - padding.left) / plotW) * (tempMax - tempMin));
  const invYScale = (py: number) =>
    Math.round(speedMin + ((plotH - (py - padding.top)) / plotH) * (speedMax - speedMin));

  const sortedPoints = [...points].sort((a, b) => a.temperature - b.temperature);

  const linePath = sortedPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.temperature)},${yScale(p.speed_percent)}`)
    .join(' ');

  const handleMouseDown = (index: number) => {
    setDraggingIndex(index);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingIndex === null || !svgRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const px = e.clientX - svgRect.left;
      const py = e.clientY - svgRect.top;

      let newTemp = invXScale(px);
      let newSpeed = invYScale(py);

      newTemp = Math.max(tempMin, Math.min(tempMax, newTemp));
      newSpeed = Math.max(speedMin, Math.min(speedMax, newSpeed));

      setPoints((prev) => {
        const next = [...prev];
        next[draggingIndex] = { temperature: newTemp, speed_percent: newSpeed };
        return next;
      });
    },
    [draggingIndex, tempMin, tempMax, speedMin, speedMax]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [draggingIndex, handleMouseUp]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await invoke('set_gpu_fan_curve', {
        deviceId,
        fanCurve: sortedPoints.map((p) => ({
          temperature: p.temperature,
          speed_percent: p.speed_percent,
        })),
      });
      message.success('Fan curve applied');
    } catch (err) {
      message.error(`Failed: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Fan Curve" size="small">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ cursor: draggingIndex !== null ? 'grabbing' : 'default' }}
        onMouseMove={handleMouseMove}
      >
        {/* Grid lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const temp = tempMin + ((tempMax - tempMin) / 7) * i;
          const x = xScale(temp);
          return (
            <g key={`grid-v-${i}`}>
              <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#e8e8e8" strokeWidth={1} />
              <text x={x} y={height - 5} textAnchor="middle" fontSize={10} fill="#888">
                {temp}°C
              </text>
            </g>
          );
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const speed = speedMin + ((speedMax - speedMin) / 7) * i;
          const y = yScale(speed);
          return (
            <g key={`grid-h-${i}`}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e8e8e8" strokeWidth={1} />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#888">
                {speed}%
              </text>
            </g>
          );
        })}

        {/* Fan curve line */}
        <path d={linePath} fill="none" stroke="#1890ff" strokeWidth={2.5} strokeLinejoin="round" />

        {/* Draggable points */}
        {sortedPoints.map((p, i) => (
          <circle
            key={`point-${i}`}
            cx={xScale(p.temperature)}
            cy={yScale(p.speed_percent)}
            r={6}
            fill="#1890ff"
            stroke="#fff"
            strokeWidth={2}
            style={{ cursor: 'grab' }}
            onMouseDown={() => handleMouseDown(i)}
          />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Button type="primary" onClick={handleSave} loading={saving}>
          Apply Fan Curve
        </Button>
      </div>
    </Card>
  );
};

export default FanCurveEditor;
