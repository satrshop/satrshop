"use client";

import { useState, useEffect } from "react";
import { Loader2, Activity, Clock, User, Info } from "lucide-react";
import { adminFetch } from "@/lib/api/admin-client";

interface ActivityLog {
  id?: string;
  adminEmail: string;
  adminName: string;
  action: string;
  details: string;
  createdAt?: { seconds: number; nanoseconds: number } | { _seconds: number; _nanoseconds: number };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ logs: ActivityLog[] }>("/api/admin/logs?limit=200");
      setLogs(data.logs);
    } catch (err) {
      console.error("Failed to load logs:", err);
    }
    setLoading(false);
  };

  const formatDate = (timestamp: ActivityLog["createdAt"]) => {
    if (!timestamp) return "الآن";
    // Handle both Firestore Timestamp and plain Date serialized from Admin SDK
    const seconds = "seconds" in timestamp ? timestamp.seconds : "_seconds" in timestamp ? timestamp._seconds : 0;
    if (!seconds) return "الآن";
    const date = new Date(seconds * 1000);
    return new Intl.DateTimeFormat("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Activity className="text-secondary" />
          سجل النشاطات (Audit Logs)
        </h1>
        <button onClick={fetchLogs} className="text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-white transition-colors">
          تحديث السجل
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-6 py-4">المدير</th>
                <th className="px-6 py-4">الحركة</th>
                <th className="px-6 py-4">التفاصيل</th>
                <th className="px-6 py-4">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/40">لا يوجد حركات مسجلة حتى الآن</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="text-white/80 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-white/40" />
                        <div>
                          <p className="font-bold">{log.adminName}</p>
                          <p className="text-xs text-white/40 font-mono" dir="ltr">{log.adminEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 flex items-center gap-2">
                      <Info size={16} className="text-white/20 shrink-0" />
                      <span className="truncate max-w-xs md:max-w-md">{log.details}</span>
                    </td>
                    <td className="px-6 py-4 text-white/40 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
