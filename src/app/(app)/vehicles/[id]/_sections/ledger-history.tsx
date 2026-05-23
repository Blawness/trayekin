import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/status";

type Entry = {
  id: string;
  date: string;
  revenue: number;
  expenses: number;
  notes: string | null;
};

type Props = {
  entries: Entry[];
  driverNameByDate?: Record<string, string>;
};

export function LedgerHistorySection({ entries, driverNameByDate }: Props) {
  if (entries.length === 0) return null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Riwayat Setoran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.slice(0, 30).map((e) => (
            <div key={e.id} className="flex justify-between text-sm border-b pb-2">
              <div>
                <div>{formatDate(new Date(e.date))}</div>
                {driverNameByDate?.[e.date] && (
                  <div className="text-xs text-muted-foreground">
                    Sopir: {driverNameByDate[e.date]}
                  </div>
                )}
                {e.notes && (
                  <div className="text-xs text-muted-foreground">{e.notes}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-green-600">
                  +Rp {e.revenue.toLocaleString("id-ID")}
                </div>
                {e.expenses > 0 && (
                  <div className="text-red-600 text-xs">
                    -Rp {e.expenses.toLocaleString("id-ID")}
                  </div>
                )}
                {e.expenses === 0 && e.revenue === 0 && (
                  <div className="text-xs text-muted-foreground">Rp 0</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
