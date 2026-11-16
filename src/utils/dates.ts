export const localDayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const sameDay = (a: string, b: Date) =>
  localDayKey(new Date(a)) === localDayKey(b);
export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfWeek = (d: Date) => {
  const x = startOfDay(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
export const startOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1);
export const fmtDate = (s: string) =>
  new Date(s).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
