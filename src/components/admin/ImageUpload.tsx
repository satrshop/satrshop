"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  X, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  initialValue?: string;
}

export default function ImageUpload({ onUploadComplete, initialValue }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloudinary credentials from environment variables
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        setError("يرجى إعداد بيانات Cloudinary في ملف .env أولاً");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setComplete(false);
      setProgress(0);
      setError("");
      
      uploadToCloudinary(selectedFile);
    }
  };

  const uploadToCloudinary = (fileToUpload: File) => {
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", UPLOAD_PRESET!);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        setComplete(true);
        setUploading(false);
        onUploadComplete(response.secure_url);
      } else {
        console.error("Cloudinary upload failed:", xhr.responseText);
        setError("فشل الرفع. تأكد من صحة Cloud Name و Upload Preset.");
        setUploading(false);
      }
    };

    xhr.onerror = () => {
      setError("خطأ في الاتصال بالسيرفر.");
      setUploading(false);
    };

    xhr.send(formData);
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setComplete(false);
    setProgress(0);
    setError("");
    onUploadComplete("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative aspect-[4/5] w-full rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
          preview ? "border-secondary" : "border-white/10 hover:border-secondary/40 hover:bg-white/5"
        } ${error ? "border-red-500/50 bg-red-500/5" : ""}`}
      >
        {preview ? (
          <>
            <Image src={preview} alt="Preview" fill className="object-cover" />
            
            {/* Uploading Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                    <circle
                      cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent"
                      strokeDasharray={`${226}`}
                      strokeDashoffset={`${226 - (226 * progress) / 100}`}
                      className="text-secondary"
                    />
                  </svg>
                  <span className="absolute text-white font-black text-sm">{Math.round(progress)}%</span>
                </div>
                <p className="text-white font-bold animate-pulse">جاري الرفع لـ Cloudinary...</p>
              </div>
            )}

            {/* Complete Checkmark */}
            {complete && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg z-10">
                <CheckCircle2 size={24} />
              </motion.div>
            )}

            {/* Controls */}
            {!uploading && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all z-10"
                >
                  <X size={20} />
                </button>
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center text-white font-bold">
                    <RefreshCw size={32} className="mb-2" />
                    <span>تغيير الصورة</span>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center p-6 space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-white/40 group-hover:text-secondary transition-colors">
              <Upload size={36} />
            </div>
            <div>
              <p className="text-white font-black text-lg">ارفع صورة للمنتج</p>
              <p className="text-white/40 font-bold text-sm">استخدم Cloudinary مجاناً</p>
            </div>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {error && (
        <p className="text-red-400 text-sm font-bold flex items-center gap-2 px-2 bg-red-500/10 py-3 rounded-xl border border-red-500/20">
          <AlertCircle size={16} />
          {error}
        </p>
      )}

      {complete && (
        <p className="text-emerald-400 text-sm font-bold flex items-center gap-2 px-2">
          <CheckCircle2 size={16} />
          تم الرفع بنجاح لـ Cloudinary
        </p>
      )}
    </div>
  );
}
