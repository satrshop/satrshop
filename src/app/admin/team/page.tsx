"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Shield, User, Mail, ShieldAlert } from "lucide-react";
import { adminFetch } from "@/lib/api/admin-client";

interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: "superadmin" | "admin";
  status: "active" | "pending";
  createdAt?: unknown;
}

export default function TeamManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [newAdmin, setNewAdmin] = useState({
    email: "",
    name: "",
    role: "admin" as "superadmin" | "admin"
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ admins: AdminUser[] }>("/api/admin/team");
      setAdmins(data.admins);
    } catch (err) {
      console.error("Failed to load admins:", err);
    }
    setLoading(false);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await adminFetch("/api/admin/team", {
        method: "POST",
        body: JSON.stringify({
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
        }),
      });
      
      setNewAdmin({ email: "", name: "", role: "admin" });
      fetchAdmins();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير معروف";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المدير؟")) {
      try {
        await adminFetch(`/api/admin/team/${id}`, { method: "DELETE" });
        fetchAdmins();
      } catch (err) {
        console.error("Failed to delete admin:", err);
      }
    }
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
        <h1 className="text-3xl font-black text-white">إدارة الفريق</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* نموذج الإضافة */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus size={20} className="text-secondary" />
            إضافة مدير جديد
          </h2>
          
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">الاسم</label>
              <div className="relative">
                <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  required
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white focus:outline-none focus:border-secondary"
                  placeholder="أحمد علي"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white focus:outline-none focus:border-secondary text-left"
                  placeholder="admin@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">الصلاحية</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={newAdmin.role === "admin"}
                    onChange={() => setNewAdmin({ ...newAdmin, role: "admin" })}
                    className="text-secondary focus:ring-secondary"
                  />
                  <span className="text-white/80">مدير عام</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={newAdmin.role === "superadmin"}
                    onChange={() => setNewAdmin({ ...newAdmin, role: "superadmin" })}
                    className="text-secondary focus:ring-secondary"
                  />
                  <span className="text-white/80">مدير رئيسي (Super)</span>
                </label>
              </div>
            </div>

            {error && <p className="text-rose-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              إرسال دعوة للمدير
            </button>
            <p className="text-xs text-white/40 text-center mt-2">
              بمجرد الإضافة، يمكن للمدير الجديد التسجيل عبر صفحة `satrshop.com/admin/register`
            </p>
          </form>
        </div>

        {/* قائمة المدراء */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-6 py-4">الاسم</th>
                  <th className="px-6 py-4">البريد الإلكتروني</th>
                  <th className="px-6 py-4">الصلاحية</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {admins.map((admin) => (
                  <tr key={admin.id} className="text-white/80 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold">{admin.name}</td>
                    <td className="px-6 py-4 font-mono text-xs" dir="ltr">{admin.email}</td>
                    <td className="px-6 py-4">
                      {admin.role === "superadmin" ? (
                        <span className="flex items-center gap-1 text-purple-400 bg-purple-400/10 px-2 py-1 rounded-lg w-fit">
                          <ShieldAlert size={14} /> رئيسي
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg w-fit">
                          <Shield size={14} /> عادي
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {admin.status === "active" ? (
                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">نشط</span>
                      ) : (
                        <span className="text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg">قيد الانتظار</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(admin.id!)}
                        className="text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-400/10 transition-colors"
                        title="حذف المدير"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
