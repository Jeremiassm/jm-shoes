import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function SneakerDetailSkeleton() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28">
        <div className="h-4 w-48 bg-zinc-900 rounded animate-pulse mb-8" />

        <div className="md:grid md:grid-cols-2 gap-14 pb-16">
          <div className="grid grid-cols-[80px_1fr] gap-4">
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-20 h-20 rounded-xl bg-zinc-900 animate-pulse" />
              ))}
            </div>
            <div className="aspect-square rounded-3xl bg-zinc-900 animate-pulse" />
          </div>

          <div className="space-y-4 mt-6 md:mt-0">
            <div className="h-4 w-24 bg-zinc-900 rounded animate-pulse" />
            <div className="h-12 w-3/4 bg-zinc-900 rounded animate-pulse" />
            <div className="h-10 w-32 bg-zinc-900 rounded animate-pulse" />
            <div className="h-24 w-full bg-zinc-900 rounded animate-pulse" />
            <div className="h-14 w-full bg-zinc-900 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
