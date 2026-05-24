import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} size="sm">
            <CardContent className="p-3 animate-pulse">
              <div className="h-3 w-14 bg-muted rounded mb-2" />
              <div className="h-7 w-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <div className="h-4 w-32 bg-muted rounded mb-3 animate-pulse" />
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <Card key={i} size="sm">
              <CardContent className="p-3.5 flex items-center gap-3 animate-pulse">
                <div className="size-9 rounded-xl bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-28 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 w-14 bg-muted rounded-full" />
                  <div className="h-5 w-14 bg-muted rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
