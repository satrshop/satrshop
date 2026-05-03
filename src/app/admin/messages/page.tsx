"use client";

import { useState, useEffect } from "react";
import { ContactMessage } from "@/types/models/message";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Trash2, 
  Clock, 
  Phone, 
  Mail as MailIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown
} from "lucide-react";
import { adminFetch } from "@/lib/api/admin-client";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await adminFetch<{ messages: ContactMessage[] }>("/api/admin/messages");
      setMessages(data.messages);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();
  }, []);

  const executeDelete = async (id: string) => {
    try {
      await adminFetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      setMessages(prev => prev.filter(m => m.id !== id));
      showToast("تم حذف الرسالة بنجاح", "success");
    } catch (err) {
      showToast("فشل في حذف الرسالة", "error");
      console.error("Failed to delete message:", err);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !currentStatus;
    try {
      await adminFetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isRead: newStatus }),
      });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: newStatus } : m));
      showToast(newStatus ? "تم تحديد الرسالة كمقروءة" : "تم تحديد الرسالة كغير مقروءة", "success");
    } catch (err) {
      showToast("فشل في تحديث حالة الرسالة", "error");
      console.error("Failed to update message:", err);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black mb-2">رسائل العملاء</h1>
        <p className="text-white/60 font-bold text-lg">متابعة استفسارات الزبائن والرسائل الواردة من صفحة تواصل معنا.</p>
      </div>

      {/* Search */}
      <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
        <Search className="text-white/20 mr-2" size={20} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث في الأسماء، البريد الإلكتروني، أو محتوى الرسالة..."
          className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-white/20 font-bold"
        />
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-white/60 font-bold text-lg">جاري تحميل الرسائل...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredMessages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => {
                  setExpandedId(expandedId === msg.id ? null : msg.id);
                  if (!msg.isRead) {
                    adminFetch(`/api/admin/messages/${msg.id}`, {
                      method: "PUT",
                      body: JSON.stringify({ isRead: true }),
                    }).then(() => {
                      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
                    }).catch(() => {});
                  }
                }}
                className={`bg-[#1e293b] rounded-[2rem] border border-white/5 overflow-hidden cursor-pointer transition-all hover:border-secondary/30 ${
                  !msg.isRead ? "ring-1 ring-secondary/50 bg-secondary/5" : ""
                }`}
              >
                <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      !msg.isRead ? "bg-secondary text-primary" : "bg-white/5 text-white/40"
                    }`}>
                      <MailIcon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{msg.name}</h3>
                        {!msg.isRead && (
                          <span className="bg-secondary text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase">جديد</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-white/40 text-sm font-bold">
                        <span className="flex items-center gap-2"><MailIcon size={14} /> {msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-2"><Phone size={14} /> {msg.phone}</span>}
                        <span className="flex items-center gap-2"><Clock size={14} /> {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "---"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mr-auto md:mr-0">
                    <button 
                      onClick={(e) => toggleReadStatus(msg.id, msg.isRead, e)}
                      title={msg.isRead ? "تحديد كغير مقروء" : "تحديد كمقروء"}
                      className={`p-3 rounded-xl transition-all ${
                        msg.isRead ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-secondary/20 text-secondary hover:bg-secondary/30"
                      }`}
                    >
                      {msg.isRead ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessageToDelete(msg.id);
                      }}
                      className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className={`p-1 transition-transform duration-300 ${expandedId === msg.id ? "rotate-180" : ""}`}>
                      <ChevronDown size={20} className="text-white/20" />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === msg.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/20"
                    >
                      <div className="p-8 sm:p-10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-white/20 mb-4">محتوى الرسالة</h4>
                        <p className="text-lg text-white/80 leading-relaxed whitespace-pre-wrap font-medium">
                          {msg.content}
                        </p>
                        
                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4">
                          <a 
                            href={`mailto:${msg.email}`}
                            className="bg-secondary text-primary px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform inline-flex items-center gap-2"
                          >
                            <MailIcon size={18} />
                            الرد عبر البريد الإلكتروني
                          </a>
                          {msg.phone && (
                            <a 
                              href={`tel:${msg.phone}`}
                              className="bg-white/5 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all inline-flex items-center gap-2"
                            >
                              <Phone size={18} />
                              اتصال هاتفي
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredMessages.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <MailIcon size={32} className="text-white/10" />
              </div>
              <h3 className="text-xl font-bold text-white/40">لا توجد رسائل حالياً</h3>
              <p className="text-white/20 font-bold">عندما يرسل الزبائن رسائل من صفحة تواصل معنا، ستظهر هنا.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={messageToDelete !== null}
        title="حذف رسالة"
        message="هل أنت متأكد من حذف هذه الرسالة بشكل نهائي؟"
        onConfirm={() => {
          if (messageToDelete) executeDelete(messageToDelete);
        }}
        onCancel={() => setMessageToDelete(null)}
      />
    </div>
  );
}
