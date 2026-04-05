import type { RiceVarietyRecord } from "./riceVarietyTypes";

/** 4 พันธุ์เริ่มต้น — ห้ามลบ (isDefault: true) */
export function getSeedDefaultVarieties(): RiceVarietyRecord[] {
  return [
    {
      id: "jasmine",
      name: "ข้าวหอมมะลิ",
      seasonType: "napee",
      photoperiodSensitive: true,
      totalDays: 120,
      isDefault: true,
      scheduleMode: "FIXED_DATE",
      harvestMonthDay: "11-25",
      fixedMilestones: [
        { name: "ระยะรับท้อง (ใส่ปุ๋ยรอบ 2)", daysBeforeHarvest: 60 },
        { name: "ระยะออกดอก", daysBeforeHarvest: 30 },
        { name: "ระยะพลับพลึง", daysBeforeHarvest: 7 },
        { name: "ระยะเก็บเกี่ยว", daysBeforeHarvest: 0 },
      ],
      stages: [
        { name: "ระยะต้นกล้า", startDay: 0, endDay: 15 },
        { name: "ระยะแตกกอ", startDay: 16, endDay: 45 },
        { name: "ระยะออกดอก", startDay: 46, endDay: 75 },
        { name: "ระยะสุกแก่", startDay: 76, endDay: 120 },
      ],
    },
    {
      id: "rd43",
      name: "ข้าว RD43",
      seasonType: "naprang",
      photoperiodSensitive: false,
      totalDays: 95,
      isDefault: true,
      scheduleMode: "DAS_BASED",
      stages: [
        { name: "ระยะกล้า", startDay: 0, endDay: 20 },
        { name: "ระยะแตกกอ", startDay: 21, endDay: 45 },
        { name: "ระยะสร้างรวงอ่อน", startDay: 46, endDay: 65 },
        { name: "ระยะออกดอกและสุกแก่", startDay: 66, endDay: 95 },
      ],
    },
    {
      id: "kk15",
      name: "ข้าวกข 15",
      seasonType: "naprang",
      photoperiodSensitive: false,
      totalDays: 115,
      isDefault: true,
      scheduleMode: "DAS_BASED",
      stages: [
        { name: "ระยะต้นกล้า", startDay: 0, endDay: 15 },
        { name: "ระยะแตกกอ", startDay: 16, endDay: 45 },
        { name: "ระยะออกดอก", startDay: 46, endDay: 75 },
        { name: "ระยะสุกแก่", startDay: 76, endDay: 115 },
      ],
    },
    {
      id: "pathumthani",
      name: "ข้าวปทุมธานี",
      seasonType: "naprang",
      photoperiodSensitive: false,
      totalDays: 100,
      isDefault: true,
      scheduleMode: "DAS_BASED",
      stages: [
        { name: "ระยะต้นกล้า", startDay: 0, endDay: 12 },
        { name: "ระยะแตกกอ", startDay: 13, endDay: 40 },
        { name: "ระยะออกดอก", startDay: 41, endDay: 65 },
        { name: "ระยะสุกแก่", startDay: 66, endDay: 100 },
      ],
    },
  ];
}
