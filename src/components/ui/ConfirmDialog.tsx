"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title = "تأكيد الإجراء",
  message,
  onConfirm,
  onCancel,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  isDangerous = true,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1e293b] border border-white/10 p-6 rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${isDangerous ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-1 mt-1">
                  <h3 className="text-xl font-black text-white">{title}</h3>
                  <p className="text-white/60 font-bold mt-2 leading-relaxed whitespace-pre-line">
                    {message}
                  </p>
                </div>
                <button 
                  onClick={onCancel}
                  className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-black shadow-lg transition-all ${
                    isDangerous 
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' 
                      : 'bg-secondary text-primary hover:bg-secondary/90 shadow-secondary/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
