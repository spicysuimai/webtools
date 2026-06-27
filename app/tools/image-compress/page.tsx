"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// MAX_PIXELS is a safety cap to avoid browser memory pressure when allocating
// the Canvas backing store (4 bytes per pixel for RGBA, plus internal copies).
const MAX_PIXELS = 40_000_000;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const DEFAULT_QUALITY = 0.8;

type ImageInfo = {
  name: string;
  type: string;
  width: number;
  height: number;
  size: number;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExtension(mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

function isPng(mimeType: string): boolean {
  return mimeType === "image/png";
}

export default function ImageCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalInfo, setOriginalInfo] = useState<ImageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [processing, setProcessing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Stable refs so useEffect cleanup and callbacks never capture stale URLs.
  const originalUrlRef = useRef<string | null>(null);
  const compressedUrlRef = useRef<string | null>(null);

  // Single entry point for revoking all live Object URLs.
  const revokeAllUrls = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    if (compressedUrlRef.current) {
      URL.revokeObjectURL(compressedUrlRef.current);
      compressedUrlRef.current = null;
    }
  }, []);

  // Guaranteed cleanup on unmount.
  useEffect(() => revokeAllUrls, [revokeAllUrls]);

  const resetAll = useCallback(() => {
    revokeAllUrls();
    setFile(null);
    setOriginalInfo(null);
    setError(null);
    setQuality(DEFAULT_QUALITY);
    setProcessing(false);
    setCompressedBlob(null);
    setOriginalUrl(null);
    setCompressedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [revokeAllUrls]);

  const handleSelectFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;

      // Validate MIME type.
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        setError("不支持的图片格式，请选择 JPEG、PNG 或 WebP 格式。");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Validate file size.
      if (f.size > MAX_FILE_SIZE) {
        setError("文件大小超过 50 MB 限制，请选择较小的图片。");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Clean up previous state before loading new image.
      revokeAllUrls();
      setError(null);
      setCompressedBlob(null);
      setCompressedUrl(null);
      setQuality(DEFAULT_QUALITY);

      const url = URL.createObjectURL(f);
      originalUrlRef.current = url;
      setOriginalUrl(url);
      setFile(f);

      const img = new Image();
      img.onload = () => {
        const pixels = img.naturalWidth * img.naturalHeight;
        if (pixels > MAX_PIXELS) {
          setError(
            `图片像素过大（${img.naturalWidth}×${img.naturalHeight}，${pixels.toLocaleString()} 像素），超过 ${MAX_PIXELS.toLocaleString()} 像素限制，请选择较小的图片。`
          );
          revokeAllUrls();
          setFile(null);
          setOriginalUrl(null);
          setOriginalInfo(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        setOriginalInfo({
          name: f.name,
          type: f.type,
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: f.size,
        });
      };
      img.onerror = () => {
        setError("图片加载失败，文件可能已损坏。");
        revokeAllUrls();
        setFile(null);
        setOriginalUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      img.src = url;
    },
    [revokeAllUrls]
  );

  const handleCompress = useCallback(() => {
    if (!file || !originalInfo || !originalUrlRef.current) return;
    setError(null);
    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = originalInfo.width;
        canvas.height = originalInfo.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Canvas 初始化失败，请重试。");
          setProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = file.type;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError("压缩处理失败，请重试或更换图片。");
              setProcessing(false);
              return;
            }

            if (compressedUrlRef.current) {
              URL.revokeObjectURL(compressedUrlRef.current);
            }
            const url = URL.createObjectURL(blob);
            compressedUrlRef.current = url;
            setCompressedBlob(blob);
            setCompressedUrl(url);
            setProcessing(false);
          },
          mimeType,
          isPng(mimeType) ? undefined : quality
        );
      } catch {
        setError("压缩处理异常，请重试。");
        setProcessing(false);
      }
    };
    img.onerror = () => {
      setError("图片加载失败，无法进行压缩。");
      setProcessing(false);
    };
    img.src = originalUrlRef.current;
  }, [file, originalInfo, quality]);

  const handleDownload = useCallback(() => {
    if (!compressedBlob || !originalInfo) return;

    const ext = getExtension(originalInfo.type);
    const base = originalInfo.name.replace(/\.[^.]+$/, "");
    const filename = `${base}-compressed.${ext}`;

    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Release the temporary download URL after the browser initiates the download.
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [compressedBlob, originalInfo]);

  // Derived stats.
  const originalSize = originalInfo?.size ?? null;
  const compressedSize = compressedBlob?.size ?? null;
  const ratio =
    originalSize && compressedSize
      ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
      : null;
  const isReduced =
    originalSize != null && compressedSize != null && compressedSize < originalSize;
  const isEqual =
    originalSize != null && compressedSize != null && compressedSize === originalSize;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">图片压缩</h1>
      <p className="mt-4 max-w-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        在浏览器本地压缩图片，文件不会上传到服务器，保护你的隐私。
      </p>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleSelectFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          选择图片
        </button>
        {file && (
          <button
            type="button"
            onClick={resetAll}
            disabled={processing}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            清空
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="flex-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
            aria-label="关闭错误提示"
          >
            ✕
          </button>
        </div>
      )}

      {/* Processing indicator */}
      {processing && (
        <p className="mt-4 text-sm text-zinc-500">正在压缩...</p>
      )}

      {/* Main content: only visible after a valid image is loaded */}
      {originalInfo && originalUrl && (
        <div className="mt-6 space-y-8">
          {/* Original image section */}
          <section>
            <h2 className="text-lg font-semibold">原图</h2>
            <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="原图预览"
                className="max-h-[400px] w-full object-contain"
              />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-zinc-500">文件名</dt>
                <dd className="font-medium truncate" title={originalInfo.name}>
                  {originalInfo.name}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">格式</dt>
                <dd className="font-medium">{originalInfo.type}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">尺寸</dt>
                <dd className="font-medium">
                  {originalInfo.width} × {originalInfo.height}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">文件大小</dt>
                <dd className="font-medium">{formatSize(originalInfo.size)}</dd>
              </div>
            </dl>
          </section>

          {/* Quality control */}
          <section>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                压缩质量
                {isPng(originalInfo.type) ? "" : `：${Math.round(quality * 100)}%`}
              </label>
              {isPng(originalInfo.type) && (
                <span className="text-xs text-zinc-500">PNG 不适用质量调节</span>
              )}
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              disabled={isPng(originalInfo.type) || processing}
              className="mt-2 w-full accent-zinc-800 disabled:opacity-30 dark:accent-zinc-200"
            />
            <p className="mt-2 text-xs text-zinc-500">
              {isPng(originalInfo.type)
                ? "PNG 是无损格式，Canvas 重编码可能去除部分元数据，但压缩后体积可能变小、相近或变大。"
                : "数值越低压缩率越高，图片质量越低。"}
            </p>
          </section>

          {/* Compress button */}
          <button
            type="button"
            onClick={handleCompress}
            disabled={processing}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            压缩
          </button>

          {/* Compressed result */}
          {compressedUrl && compressedBlob && (
            <section>
              <h2 className="text-lg font-semibold">压缩结果</h2>
              <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={compressedUrl}
                  alt="压缩后预览"
                  className="max-h-[400px] w-full object-contain"
                />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-zinc-500">压缩后大小</dt>
                  <dd className="font-medium">{formatSize(compressedBlob.size)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">体积变化</dt>
                  <dd className="font-medium">
                    {isReduced
                      ? `-${formatSize(originalInfo.size - compressedBlob.size)}`
                      : isEqual
                        ? "无变化"
                        : `+${formatSize(compressedBlob.size - originalInfo.size)}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">压缩比</dt>
                  <dd className="font-medium">{ratio !== null ? `${ratio}%` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">输出格式</dt>
                  <dd className="font-medium">{getExtension(originalInfo.type).toUpperCase()}</dd>
                </div>
              </dl>
              {!isReduced && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  压缩后文件未变小，未获得明显压缩。
                  {isPng(originalInfo.type)
                    ? " PNG 重编码结果取决于图像内容。"
                    : " 当前图片可能已被充分压缩。"}
                </p>
              )}
              <button
                type="button"
                onClick={handleDownload}
                className="mt-4 rounded-lg border border-zinc-200 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                下载压缩后的图片
              </button>
            </section>
          )}
        </div>
      )}

      {/* Empty state */}
      {!originalInfo && !error && (
        <p className="mt-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
          选择一张图片开始压缩。
        </p>
      )}
    </main>
  );
}
