export default function SneakerCardSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 h-full flex flex-col">
      <div className="h-72 bg-zinc-800 animate-pulse" />
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="h-3 w-1/3 bg-zinc-800 rounded animate-pulse" />
        <div className="h-6 w-3/4 bg-zinc-800 rounded animate-pulse" />
        <div className="flex items-center justify-between pt-5 mt-auto">
          <div className="h-6 w-24 bg-zinc-800 rounded animate-pulse" />
          <div className="h-8 w-20 bg-zinc-800 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
