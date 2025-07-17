import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-surface/50"
        >
          {/* Image skeleton */}
          <div className="aspect-video overflow-hidden">
            <Skeleton className="w-full h-full bg-white/5" />
          </div>
          
          {/* Content skeleton */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <Skeleton className="h-8 w-3/4 bg-white/5" />
            
            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-5/6 bg-white/5" />
            </div>
            
            {/* Tech stack */}
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-6 w-16 rounded-full bg-white/5" />
              ))}
            </div>
            
            {/* Progress bar skeleton */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20 bg-white/5" />
                <Skeleton className="h-3 w-10 bg-white/5" />
              </div>
              <Skeleton className="h-2 w-full rounded-full bg-white/5" />
            </div>
            
            {/* Link skeleton */}
            <Skeleton className="h-10 w-32 rounded-lg bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}