// app/admin/loading.tsx
export default function AdminLoading() {
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-10 w-48 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg animate-pulse" />
        <div className="mt-3 h-4 w-64 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded animate-pulse" />
      </div>

      {/* Admin actions skeleton */}
      <div className="flex gap-4 mb-6">
        <div className="h-12 w-32 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg animate-pulse" />
        <div className="h-12 w-32 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg animate-pulse" />
        <div className="h-12 w-32 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg animate-pulse" />
      </div>

      {/* Admin content grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 ring-1 ring-white/10 shadow-lg animate-pulse hover:scale-105 transition-transform duration-300"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.5s'
            }}
          >
            {/* Content skeleton */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div className="h-6 w-3/4 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded animate-pulse" />
              
              {/* Description */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-gradient-to-r from-zinc-700 to-zinc-600 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded animate-pulse" />
              </div>
              
              {/* Action button */}
              <div className="h-10 w-24 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-lg animate-pulse" />
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

