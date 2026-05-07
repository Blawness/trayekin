import { Card, CardContent } from "@/components/ui/card";

export default function DriversLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-7 w-16 bg-zinc-200 rounded" />
        <div className="h-7 w-24 bg-zinc-200 rounded-lg" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-full bg-zinc-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-28 bg-zinc-200 rounded" />
                <div className="h-3 w-24 bg-zinc-200 rounded" />
              </div>
              <div className="h-5 w-16 bg-zinc-200 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
