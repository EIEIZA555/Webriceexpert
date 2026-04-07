function getDateOnlyISO(isoOrDateString: string): string {
  return isoOrDateString.slice(0, 10);
}

export function addDaysToISODate(dateISO: string, dayOffset: number): string {
  const iso = getDateOnlyISO(dateISO);
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + dayOffset);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
