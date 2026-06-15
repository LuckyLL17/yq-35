import { useState, useRef, useEffect } from 'react';
import { Share2, Download, Copy, Check, X, QrCode } from 'lucide-react';
import type { TestMeta } from '@/types';
import { REFERENCE_SCORES } from '@/store/useScoreStore';

interface ShareResultProps {
  test: TestMeta;
  score: number;
  isNewBest?: boolean;
}

export default function ShareResult({ test, score, isNewBest }: ShareResultProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const referenceScore = REFERENCE_SCORES[test.id] || 1;

  const calculateBeatPercentage = () => {
    let normalized: number;
    if (test.higherIsBetter) {
      normalized = Math.min(100, (score / referenceScore) * 50 + 20);
    } else {
      normalized = Math.min(100, Math.max(0, (referenceScore / Math.max(score, 1)) * 50 + 20));
    }
    return Math.round(Math.min(99, Math.max(1, normalized)));
  };

  const beatPercentage = calculateBeatPercentage();

  const generateShareImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0a0f');
    gradient.addColorStop(0.5, '#0f0f18');
    gradient.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    const glowGradient = ctx.createRadialGradient(width / 2, 100, 0, width / 2, 100, 300);
    glowGradient.addColorStop(0, test.color + '25');
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, width, 400);

    const cardX = 40;
    const cardY = 60;
    const cardW = width - 80;
    const cardH = height - 120;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.fill();
    ctx.stroke();

    if (isNewBest) {
      ctx.save();
      ctx.translate(width - 100, 100);
      ctx.rotate(-0.5);
      ctx.fillStyle = test.color;
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 新纪录', 0, 0);
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('测试成绩', width / 2, cardY + 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(test.name, width / 2, cardY + 90);

    const scoreY = cardY + 180;
    ctx.fillStyle = test.color;
    ctx.font = 'bold 96px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = test.color;
    ctx.shadowBlur = 30;
    ctx.fillText(String(score), width / 2, scoreY);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(test.unit, width / 2 + ctx.measureText(String(score)).width / 2 + 15, scoreY - 30);

    const beatY = cardY + 280;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('击败了全球', width / 2, beatY);

    ctx.fillStyle = test.color;
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText(`${beatPercentage}%`, width / 2, beatY + 55);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText('的用户', width / 2, beatY + 85);

    const qrSize = 140;
    const qrX = width / 2 - qrSize / 2;
    const qrY = cardY + 420;

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
    ctx.fill();

    drawQRCodePattern(ctx, qrX, qrY, qrSize, test.color);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('扫码挑战你的朋友', width / 2, qrY + qrSize + 40);

    const bottomY = cardY + cardH - 40;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Human Benchmark · 人类基准测试', width / 2, bottomY);

    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
  };

  const drawQRCodePattern = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) => {
    const gridSize = 21;
    const cellSize = size / gridSize;

    ctx.fillStyle = '#1a1a1a';

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const isCorner =
          (i < 7 && j < 7) ||
          (i < 7 && j >= gridSize - 7) ||
          (i >= gridSize - 7 && j < 7);

        if (isCorner) continue;

        const hash = ((i * 7 + j * 13 + i * j) % 7) < 3;
        if (hash) {
          ctx.fillRect(
            x + j * cellSize,
            y + i * cellSize,
            cellSize + 0.5,
            cellSize + 0.5
          );
        }
      }
    }

    const drawCornerSquare = (cx: number, cy: number) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(cx, cy, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + cellSize, cy + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = color;
      ctx.fillRect(cx + cellSize * 2, cy + cellSize * 2, cellSize * 3, cellSize * 3);
    };

    drawCornerSquare(x, y);
    drawCornerSquare(x + size - cellSize * 7, y);
    drawCornerSquare(x, y + size - cellSize * 7);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, cellSize * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, cellSize * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, cellSize * 0.8, 0, Math.PI * 2);
    ctx.fill();
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => generateShareImage(), 50);
  };

  const handleClose = () => {
    setIsOpen(false);
    setImageUrl(null);
    setCopied(false);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = `${test.name}-成绩.png`;
    link.href = imageUrl;
    link.click();
  };

  const handleCopyText = async () => {
    const text = `我在「${test.name}」测试中获得了 ${score}${test.unit} 的成绩，击败了全球 ${beatPercentage}% 的用户！来挑战我吧！`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <Share2 className="w-4 h-4" />
        分享成绩
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">分享成绩</h3>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="relative bg-black/30 rounded-xl p-4 mb-6 flex items-center justify-center min-h-[400px]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="分享图片"
                  className="max-w-full max-h-[400px] rounded-lg shadow-2xl"
                  style={{ boxShadow: `0 0 60px ${test.color}30` }}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/40">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <span>生成中...</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={!imageUrl}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                下载图片
              </button>

              <button
                onClick={handleCopyText}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-neon-green" />
                    <span className="text-neon-green">已复制文案</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制分享文案
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                <QrCode className="w-3.5 h-3.5" />
                <span>分享文案预览</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                我在「{test.name}」测试中获得了 {score}
                {test.unit} 的成绩，击败了全球 {beatPercentage}% 的用户！来挑战我吧！
              </p>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
