import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-l-4 border-l-zinc-200">
            <CardContent className="p-3">
              <div className="h-3 w-12 bg-zinc-200 rounded mb-2" />
              <div className="h-7 w-8 bg-zinc-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <div className="h-4 w-32 bg-zinc-200 rounded mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-7 bg-zinc-200 rounded" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-28 bg-zinc-200 rounded" />
                  <div className="h-3 w-20 bg-zinc-200 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-zinc-200 rounded-full" />
                  <div className="h-5 w-16 bg-zinc-200 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
