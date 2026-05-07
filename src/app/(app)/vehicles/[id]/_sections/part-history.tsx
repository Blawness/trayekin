import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatus, getStatusLabel, getStatusColor, formatDate } from "@/lib/utils/status";

type Part = {
  id: string;
  partName: string;
  cost: number;
  date: string;
  odometer: number | null;
  lifespanMonths: number | null;
  nextReplaceDate: string | null;
  notes: string | null;
};

type Props = {
  parts: Part[];
};

export function PartHistorySection({ parts }: Props) {
  if (parts.length === 0) return null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Riwayat Suku Cadang</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {parts.map((p) => {
            const dueStatus = p.nextReplaceDate
              ? getStatus(new Date(p.nextReplaceDate))
              : null;
            return (
              <div key={p.id} className="flex justify-between text-sm border-b pb-2">
                <div>
                  <div className="font-medium">{p.partName}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(new Date(p.date))}
                    {p.odometer &&
                      ` · ${p.odometer.toLocaleString("id-ID")} KM`}
                    {p.cost > 0 &&
                      ` · Rp ${p.cost.toLocaleString("id-ID")}`}
                  </div>
                  {p.notes && (
                    <div className="text-xs text-muted-foreground">
                      {p.notes}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs">
                  {p.lifespanMonths && (
                    <div className="text-muted-foreground">
                      Umur: {p.lifespanMonths} bln
                    </div>
                  )}
                  {p.nextReplaceDate && dueStatus && (
                    <Badge className={`mt-0.5 ${getStatusColor(dueStatus)}`}>
                      {getStatusLabel(dueStatus)}:{" "}
                      {formatDate(new Date(p.nextReplaceDate))}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
