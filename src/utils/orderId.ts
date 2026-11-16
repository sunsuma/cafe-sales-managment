export function makeOrderNumber(existing: string[]) {
  const d = new Date(),
    date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const prefix = `ORD-${date}-`;
  let n =
    existing
      .filter((x) => x.startsWith(prefix))
      .reduce((m, x) => Math.max(m, Number(x.slice(-4)) || 0), 0) + 1;
  let id = `${prefix}${String(n).padStart(4, "0")}`;
  while (existing.includes(id)) {
    n++;
    id = `${prefix}${String(n).padStart(4, "0")}`;
  }
  return id;
}
