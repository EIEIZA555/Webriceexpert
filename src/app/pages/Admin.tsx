import { useState } from "react";
import {
  FileText,
  MessageSquare,
  Sprout,
  Users,
  AlertTriangle,
} from "lucide-react";
import VarietiesAdminPanel from "./VarietiesAdminPanel";
import AdminUsersTab from "./admin/AdminUsersTab";
import AdminDocsTab from "./admin/AdminDocsTab";
import AdminPromptsTab from "./admin/AdminPromptsTab";
import AdminGapsTab from "./admin/AdminGapsTab";

type Tab = "users" | "docs" | "prompts" | "varieties" | "gaps";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "users", label: "จัดการผู้ใช้งาน", icon: <Users className="w-4 h-4" /> },
  { key: "docs", label: "จัดการเอกสาร", icon: <FileText className="w-4 h-4" /> },
  { key: "prompts", label: "จัดการคำถามแนะนำ", icon: <MessageSquare className="w-4 h-4" /> },
  { key: "varieties", label: "จัดการพันธุ์ข้าว", icon: <Sprout className="w-4 h-4" /> },
  { key: "gaps", label: "ช่องว่างความรู้", icon: <AlertTriangle className="w-4 h-4" /> },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [collectionsVersion, setCollectionsVersion] = useState(0);

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">จัดการระบบ</h2>
        <p className="text-sm text-muted-foreground mt-1">
          จัดการผู้ใช้งาน เอกสาร คำถามแนะนำ พันธุ์ข้าว และติดตามช่องว่างความรู้
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === key
                ? "bg-primary text-white"
                : "bg-white border border-border text-foreground hover:bg-accent"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {activeTab === "users" && <AdminUsersTab />}
      {activeTab === "docs" && (
        <AdminDocsTab collectionsVersion={collectionsVersion} />
      )}
      {activeTab === "prompts" && <AdminPromptsTab />}
      {activeTab === "varieties" && (
        <VarietiesAdminPanel
          onVarietiesMutated={() =>
            setCollectionsVersion((v) => v + 1)
          }
        />
      )}
      {activeTab === "gaps" && <AdminGapsTab />}
    </div>
  );
}
