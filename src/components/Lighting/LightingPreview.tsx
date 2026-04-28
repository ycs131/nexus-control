import React, { useRef, useEffect, useCallback } from 'react';
import { Card } from 'antd';
import type { LightingMode, RgbColor } from '../../types/ipc';

interface LightingPreviewProps {
  mode: LightingMode;
  colors: RgbColor[];
  brightness: number;
  speed: number;
}

const LightingPreview: React.FC<LightingPreviewProps> = ({ mode, colors, brightness, speed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      timeRef.current = timestamp;

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, w, h);

      const primaryColor = colors[0] ?? { r: 255, g: 255, b: 255 };
      const bright = brightness / 100;

      const applyBrightness = (c: RgbColor): string => {
        const r = Math.round(c.r * bright);
        const g = Math.round(c.g * bright);
        const b = Math.round(c.b * bright);
        return `rgb(${r},${g},${b})`;
      };

      switch (mode) {
        case 'Static': {
          const color = applyBrightness(primaryColor);
          ctx.fillStyle = color;
          ctx.fillRect(10, 10, w - 20, h - 20);
          break;
        }
        case 'Breathing': {
          const breath = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(timestamp / 1000));
          const r = Math.round(primaryColor.r * bright * breath);
          const g = Math.round(primaryColor.g * bright * breath);
          const b = Math.round(primaryColor.b * bright * breath);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(10, 10, w - 20, h - 20);
          break;
        }
        case 'Rainbow': {
          const offset = (timestamp / (2000 / (speed || 1))) % w;
          for (let x = 0; x < w; x++) {
            const hue = ((x + offset) / w) * 360;
            const rgb = hslToRgb(hue / 360, 0.8, 0.5);
            ctx.fillStyle = applyBrightness({
              r: Math.round(rgb[0] * 255),
              g: Math.round(rgb[1] * 255),
              b: Math.round(rgb[2] * 255),
            });
            ctx.fillRect(x, 10, 1, h - 20);
          }
          break;
        }
        case 'ColorCycle': {
          const hue = (timestamp / (3000 / (speed || 1))) % 360;
          const rgb = hslToRgb(hue / 360, 0.8, 0.5);
          const color = applyBrightness({
            r: Math.round(rgb[0] * 255),
            g: Math.round(rgb[1] * 255),
            b: Math.round(rgb[2] * 255),
          });
          ctx.fillStyle = color;
          ctx.fillRect(10, 10, w - 20, h - 20);
          break;
        }
        case 'Flashing': {
          const flash = Math.floor(timestamp / (500 / (speed || 1))) % 2 === 0;
          ctx.fillStyle = flash ? applyBrightness(primaryColor) : '#1a1a2e';
          ctx.fillRect(10, 10, w - 20, h - 20);
          break;
        }
        default: {
          ctx.fillStyle = applyBrightness(primaryColor);
          ctx.fillRect(10, 10, w - 20, h - 20);
        }
      }

      // Draw LED dots at bottom
      const dotSize = 6;
      const gap = 4;
      const totalWidth = colors.length * (dotSize + gap) - gap;
      let startX = (w - totalWidth) / 2;
      colors.forEach((c) => {
        ctx.beginPath();
        ctx.arc(startX + dotSize / 2, h - 15, dotSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = applyBrightness(c);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        startX += dotSize + gap;
      });

      animRef.current = requestAnimationFrame(draw);
    },
    [mode, colors, brightness, speed]
  );

  useEffect(() => {
    timeRef.current = performance.now();
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <Card title="Lighting Preview" size="small">
      <canvas
        ref={canvasRef}
        width={280}
        height={100}
        style={{ width: '100%', height: 100, borderRadius: 6 }}
      />
    </Card>
  );
};

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r, g, b];
}

export default LightingPreview;
