"use client";

import { useRef, useState, useEffect } from "react";

interface SignatureCanvasProps {
  onSign: (signatureDataUrl: string) => void;
  disabled?: boolean;
}

export default function SignatureCanvas({ onSign, disabled }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Resize canvas to match its CSS display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      // Preserve current drawing
      const ctx = canvas.getContext("2d");
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#1A3A33";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (imageData) ctx.putImageData(imageData, 0, 0);
      }
    });

    resizeObserver.observe(canvas);
    // Initial size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    return () => resizeObserver.disconnect();
  }, []);

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function getTouchPos(e: React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  function startDrawing(x: number, y: number) {
    if (disabled) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1A3A33";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }

  function draw(x: number, y: number) {
    if (!isDrawing || disabled) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSignature) {
      setHasSignature(true);
    }
  }

  function stopDrawing() {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      onSign(canvas.toDataURL("image/png"));
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSign("");
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={`w-full h-[150px] border-2 border-dashed rounded-xl bg-white transition-colors ${
            disabled
              ? "border-gray-200 cursor-not-allowed opacity-60"
              : hasSignature
              ? "border-teal"
              : "border-gray-300 cursor-crosshair"
          }`}
          style={{ touchAction: "none" }}
          onMouseDown={(e) => { const p = getPos(e); startDrawing(p.x, p.y); }}
          onMouseMove={(e) => { const p = getPos(e); draw(p.x, p.y); }}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => { e.preventDefault(); const p = getTouchPos(e); startDrawing(p.x, p.y); }}
          onTouchMove={(e) => { e.preventDefault(); const p = getTouchPos(e); draw(p.x, p.y); }}
          onTouchEnd={(e) => { e.preventDefault(); stopDrawing(); }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="font-body text-sm text-gray-300">Assine aqui</span>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearCanvas}
          disabled={disabled || !hasSignature}
          className="font-body text-xs text-verde-noite/50 hover:text-verde-noite disabled:opacity-30 disabled:cursor-not-allowed transition underline"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
