// app/read/[id]/loading.tsx
export default function ReaderLoading() {
  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Progress bar skeleton */}
      <div className="w-full bg-zinc-800 rounded-full h-2 animate-pulse">
        <div className="bg-gradient-to-r from-zinc-600 to-zinc-500 h-2 rounded-full w-1/3 animate-pulse" />
      </div>

      {/* Header content skeleton */}
      <div className="pt-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-8 w-3/4 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg animate-pulse" />
        
        {/* Author skeleton */}
        <div className="h-4 w-32 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded animate-pulse" />
        
        {/* Genres skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-16 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Cover image skeleton */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-700 animate-pulse">
        <div className="aspect-[3/4] w-full">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>

      {/* Pages skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-700 animate-pulse"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.5s'
            }}
          >
            <div className="aspect-[3/4] w-full">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse" />
            </div>
            
            {/* Page number indicator */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom loading indicator */}
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

