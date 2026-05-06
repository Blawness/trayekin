import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function VehicleDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card>
        <CardHeader>
          <div className="h-7 w-36 bg-zinc-200 rounded" />
          <div className="h-4 w-24 bg-zinc-200 rounded mt-1" />
        </CardHeader>
        <CardContent className="flex gap-3">
          <div className="h-6 w-20 bg-zinc-200 rounded-full" />
          <div className="h-6 w-20 bg-zinc-200 rounded-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="h-4 w-28 bg-zinc-200 rounded" />
        </CardHeader>
        <CardContent className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-zinc-200 rounded" />
            <div className="h-10 w-full bg-zinc-200 rounded-lg" />
          </div>
          <div className="h-7 w-16 bg-zinc-200 rounded-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="h-4 w-28 bg-zinc-200 rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-zinc-200 rounded" />
            <div className="h-10 w-full bg-zinc-200 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-zinc-200 rounded" />
            <div className="h-10 w-full bg-zinc-200 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 bg-zinc-200 rounded" />
            <div className="h-10 w-full bg-zinc-200 rounded-lg" />
          </div>
          <div className="h-7 w-16 bg-zinc-200 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
