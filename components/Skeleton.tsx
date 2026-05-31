import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    count = 1,
}) => {
    const baseClass = 'animate-pulse bg-slate-200 dark:bg-slate-700';

    const variantClass = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded',
        rounded: 'rounded-xl',
    }[variant];

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
    };

    if (count === 1) {
        return <div className={`${baseClass} ${variantClass} ${className}`} style={style} />;
    }

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`${baseClass} ${variantClass} ${className}`} style={style} />
            ))}
        </>
    );
};

// Skeleton components for common patterns
export const SkeletonCard: React.FC = () => (
    <div className="card p-6 space-y-4">
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="rounded" height={100} />
        <div className="flex gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
            </div>
        </div>
    </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <Skeleton variant="text" width="30%" height={24} />
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="50%" />
                    </div>
                    <Skeleton variant="rounded" width={80} height={32} />
                </div>
            ))}
        </div>
    </div>
);

export const SkeletonStatCard: React.FC = () => (
    <div className="card p-6">
        <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="text" width="30%" height={14} />
            </div>
            <Skeleton variant="rounded" width={56} height={56} />
        </div>
    </div>
);

export const SkeletonDashboard: React.FC = () => (
    <div className="space-y-6">
        <div>
            <Skeleton variant="text" width="30%" height={32} className="mb-2" />
            <Skeleton variant="text" width="50%" height={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonStatCard key={i} />
            ))}
        </div>

        <SkeletonCard />
        <SkeletonTable rows={5} />
    </div>
);

export default Skeleton;
