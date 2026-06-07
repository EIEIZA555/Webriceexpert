import { useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { DocumentListByCollection } from "../components/DocumentListByCollection";
import { fetchDocsAndCollections, type DocumentResponse, type CollectionItem } from "../lib/api";

export default function Knowledge() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocsAndCollections()
      .then(({ documents, collections }) => {
        setDocuments(documents);
        setCollections(collections);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">คลังความรู้</h2>
        <p className="text-sm text-muted-foreground mt-1">
          เอกสารและความรู้เกี่ยวกับการปลูกข้าว — ใช้เป็นแหล่งอ้างอิงของ AI ผู้ช่วย
        </p>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : documents.length === 0 ? (
        <EmptyState message="ยังไม่มีเอกสารในระบบ" />
      ) : (
        <DocumentListByCollection documents={documents} collections={collections} />
      )}
    </div>
  );
}
