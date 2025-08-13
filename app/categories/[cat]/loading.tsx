// app/categories/[cat]/loading.tsx
export default function CategoryLoading() {
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg animate-pulse" />
        <div className="mt-2 h-4 w-32 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded animate-pulse" />
      </div>

      {/* Category works grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 ring-1 ring-white/10 shadow-lg animate-pulse hover:scale-105 transition-transform duration-300"
            style={{
              animationDelay: `${i * 0.05}s`,
              animationDuration: '1.5s'
            }}
          >
            {/* Cover skeleton with shimmer effect */}
            <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-zinc-800 to-zinc-700 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse" />
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-3 p-4">
              {/* Title */}
              <div className="h-4 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded animate-pulse" />
              
              {/* Author and genres */}
              <div className="space-y-2">
                <div className="h-3 w-2/3 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-full animate-pulse" />
                <div className="flex gap-1">
                  <div className="h-2 w-12 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-full animate-pulse" />
                  <div className="h-2 w-16 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-full animate-pulse" />
                </div>
              </div>
              
              {/* Meta info */}
              <div className="flex justify-between items-center pt-2">
                <div className="h-2 w-16 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded animate-pulse" />
                <div className="h-2 w-12 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded animate-pulse" />
              </div>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-8">
        <div className="flex space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

