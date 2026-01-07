export default function Loading() {
    return (
        <div className="flex-1 p-8 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-white/5 rounded-xl"></div>
                    <div className="h-4 w-32 bg-white/5 rounded-lg"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-10 bg-white/5 rounded-xl"></div>
                    <div className="h-10 w-10 bg-white/5 rounded-xl"></div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white/5 h-32 rounded-3xl border border-white/5"></div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/5 h-[400px] rounded-3xl border border-white/5"></div>
                <div className="bg-white/5 h-[400px] rounded-3xl border border-white/5"></div>
            </div>
        </div>
    )
}
