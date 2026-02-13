/**
 * Mock RAG - Simulates retrieval from knowledge base for latency comparison demo
 */

import knowledgeBase from "../data/knowledgeBase.json";

export interface KnowledgeItem {
  id: string;
  topic: string;
  content: string;
  keywords: string[];
}

const kb = knowledgeBase as KnowledgeItem[];

/** Simulate RAG search and response with configurable delay (for latency demo) */
export async function mockRagQuery(
  query: string,
  delayMs: number = 400
): Promise<{ content: string; latencyMs: number; sources: Array<{ title: string; page?: number }> }> {
  const start = performance.now();

  await new Promise((r) => setTimeout(r, delayMs));

  const q = query.toLowerCase().trim();
  const matches: KnowledgeItem[] = [];

  for (const item of kb) {
    const score =
      (item.keywords.some((k) => q.includes(k.toLowerCase())) ? 2 : 0) +
      (item.topic.toLowerCase().includes(q) || item.content.toLowerCase().includes(q) ? 1 : 0);
    if (score > 0) matches.push(item);
  }

  const latencyMs = Math.round(performance.now() - start);

  if (matches.length === 0) {
    return {
      content: `ขอบคุณสำหรับคำถามครับ ไม่พบข้อมูลที่เกี่ยวข้องกับ "${query}" ในคลังความรู้ปัจจุบัน\n\nลองถามเกี่ยวกับ:\n- การแก้ใบเหลือง\n- การคำนวณปุ๋ย\n- โรคข้าว\n- พันธุ์ข้าว เช่น หอมมะลิ, RD43`,
      latencyMs,
      sources: [],
    };
  }

  const best = matches[0];
  const sources = matches.slice(0, 2).map((m) => ({ title: m.topic }));

  return {
    content: best.content,
    latencyMs,
    sources,
  };
}
