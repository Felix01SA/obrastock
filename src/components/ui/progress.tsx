'use client'

import * as React from 'react'
import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const progressIndicatorVariants = cva('h-full transition-all duration-300', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondary-foreground/70',
      destructive: 'bg-rose-500 dark:bg-rose-600',
      success: 'bg-emerald-500 dark:bg-emerald-400',
      warning: 'bg-amber-500 dark:bg-amber-400',
      info: 'bg-sky-500 dark:bg-sky-400',
      purple: 'bg-purple-500 dark:bg-purple-400',
      amber: 'bg-amber-500 dark:bg-amber-400',
      blue: 'bg-blue-500 dark:bg-blue-400',
      emerald: 'bg-emerald-500 dark:bg-emerald-400',
      rose: 'bg-rose-500 dark:bg-rose-400',
      slate: 'bg-slate-500 dark:bg-slate-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type ProgressVariant = NonNullable<VariantProps<typeof progressIndicatorVariants>['variant']>

const ProgressContext = React.createContext<{ variant?: ProgressVariant }>({
  variant: 'default',
})

export interface ProgressProps
  extends ProgressPrimitive.Root.Props,
    VariantProps<typeof progressIndicatorVariants> {}

function Progress({
  className,
  children,
  value,
  variant = 'default',
  ...props
}: ProgressProps) {
  return (
    <ProgressContext.Provider value={{ variant: variant ?? 'default' }}>
      <ProgressPrimitive.Root
        value={value}
        data-slot="progress"
        className={cn('flex flex-wrap gap-3 w-full', className)}
        {...props}
      >
        {children ? (
          children
        ) : (
          <ProgressTrack>
            <ProgressIndicator variant={variant} />
          </ProgressTrack>
        )}
      </ProgressPrimitive.Root>
    </ProgressContext.Provider>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        'relative flex h-2 w-full items-center overflow-x-hidden rounded-full bg-slate-100 dark:bg-slate-800',
        className,
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

export interface ProgressIndicatorProps
  extends ProgressPrimitive.Indicator.Props,
    VariantProps<typeof progressIndicatorVariants> {}

function ProgressIndicator({ className, variant, ...props }: ProgressIndicatorProps) {
  const context = React.useContext(ProgressContext)
  const resolvedVariant = variant ?? context.variant ?? 'default'

  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(progressIndicatorVariants({ variant: resolvedVariant }), className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn('text-sm font-medium', className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn('ml-auto text-sm text-muted-foreground tabular-nums', className)}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
  progressIndicatorVariants,
}
