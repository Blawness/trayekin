import { Card, CardContent } from "@/components/ui/card";

export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-40 bg-zinc-200 rounded" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center space-y-2">
              <div className="h-3 w-32 bg-zinc-200 rounded mx-auto" />
              <div className="h-7 w-24 bg-zinc-200 rounded mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="h-4 w-28 bg-zinc-200 rounded" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-20 bg-zinc-200 rounded" />
                  <div className="h-3 w-16 bg-zinc-200 rounded" />
                </div>
                <div className="h-5 w-14 bg-zinc-200 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-1 text-center">
                    <div className="h-3 w-16 bg-zinc-200 rounded mx-auto" />
                    <div className="h-4 w-20 bg-zinc-200 rounded mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
