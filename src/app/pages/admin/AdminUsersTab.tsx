import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { EmptyState } from "../../components/EmptyState";
import LoadingScreen from "../../components/LoadingScreen";
import { apiFetch } from "../../lib/api";
import { getErrorMessage } from "../../lib/getErrorMessage";

import type { UserResponse } from "../../lib/types";

export default function AdminUsersTab() {
  const [usersList, setUsersList] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<UserResponse[]>("/admin/users", {}, true)
      .then(setUsersList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const updatedUser = await apiFetch<UserResponse>(
        `/admin/users/${userId}/role`,
        {
          method: "PUT",
          body: JSON.stringify({ role: newRole }),
        },
        true,
      );
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? updatedUser : u)),
      );
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">ผู้ใช้งาน ({usersList.length})</h3>
      {loading ? (
        <LoadingScreen />
      ) : usersList.length === 0 ? (
        <EmptyState message="ไม่มีข้อมูลผู้ใช้งาน" />
      ) : (
        <Card className="rounded-xl overflow-hidden shadow-sm border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium">ชื่อผู้ใช้</th>
                  <th className="px-6 py-4 font-medium">บทบาท</th>
                  <th className="px-6 py-4 font-medium min-w-[200px]">เปลี่ยนบทบาท</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium">
                        {user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full max-w-[150px] p-2"
                      >
                        <option value="user">ผู้ใช้</option>
                        <option value="admin">ผู้ดูแลระบบ</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
