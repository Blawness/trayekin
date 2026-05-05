export type Status = "aman" | "mendekati" | "terlambat";

export function getStatus(targetDate: Date): Status {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "terlambat";
  if (diffDays <= 30) return "mendekati";
  return "aman";
}

export function getStatusLabel(status: Status): string {
  switch (status) {
    case "aman":
      return "Aman";
    case "mendekati":
      return "Mendekati";
    case "terlambat":
      return "Terlambat";
  }
}

export function getStatusColor(status: Status): string {
  switch (status) {
    case "aman":
      return "bg-green-100 text-green-700";
    case "mendekati":
      return "bg-yellow-100 text-yellow-700";
    case "terlambat":
      return "bg-red-100 text-red-700";
  }
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
