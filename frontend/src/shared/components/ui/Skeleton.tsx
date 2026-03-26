import { forwardRef } from "react";

import { classNames } from "@/shared/utils/classnames";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = "rectangular",
      width,
      height,
      animation = true,
      ...props
    },
    ref
  ) => {
    const baseClasses = "bg-slate-200 dark:bg-slate-700";

    const variantClasses = {
      text: "rounded",
      rectangular: "rounded-lg",
      circular: "rounded-full",
    };

    const sizeClasses = classNames(
      width !== undefined && `w-[${typeof width === "number" ? `${width}px` : width}]`,
      height !== undefined && `h-[${typeof height === "number" ? `${height}px` : height}]`
    );

    return (
      <div
        ref={ref}
        className={classNames(
          baseClasses,
          variantClasses[variant],
          sizeClasses,
          animation && "ui-skeleton",
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Preset skeleton components for common use cases
export function SkeletonText({ lines = 1, className, ...props }: { lines?: number } & SkeletonProps) {
  if (lines === 1) {
    return <Skeleton variant="text" height={16} className={className} {...props} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? "60%" : "100%"}
          className={className}
          {...props}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40, className, ...props }: { size?: number } & SkeletonProps) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}

export function SkeletonButton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      variant="rectangular"
      height={40}
      width={120}
      className={classNames("rounded-xl", className)}
      {...props}
    />
  );
}

