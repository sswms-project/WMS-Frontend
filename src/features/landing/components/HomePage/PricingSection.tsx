'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Check, CircleAlert, Minus, PackageCheck, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublicSubscriptionPlansQuery } from '@/features/subscription/hooks/use-subscription'
import type { SubscriptionPlanResponse } from '@/features/subscription/types/subscription.types'
import { APP_ROUTES } from '@/routes/app-routes'

function formatVnd(amount: number) {
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`
}

function formatLimit(limit: number, unit: string) {
  return `Tối đa ${limit} ${unit}`
}

function formatPlanDescription(plan: SubscriptionPlanResponse) {
  const limitFeatures = plan.features.filter((f) => f.featureType === 'Limit')
  if (limitFeatures.length === 0) return plan.planName
  return (
    limitFeatures
      .map((f) => `Tối đa ${f.limitValue ?? '?'} ${f.displayName.toLowerCase()}`)
      .join(', ') + '.'
  )
}

function PlanPrice({ plan }: { readonly plan: SubscriptionPlanResponse }) {
  if (plan.monthlyPrice === 0) {
    return <span className="text-3xl font-bold tracking-tight">Miễn phí</span>
  }

  return (
    <span className="text-3xl font-bold tracking-tight tabular-nums">
      {formatVnd(plan.monthlyPrice)}
    </span>
  )
}

function PricingPlanCard({
  plan,
  index,
}: {
  readonly plan: SubscriptionPlanResponse
  readonly index: number
}) {
  const prefersReducedMotion = useReducedMotion()
  const capabilities = plan.features.map((feature) => ({
    enabled: true,
    label:
      feature.featureType === 'Limit'
        ? formatLimit(feature.limitValue ?? 0, feature.displayName.toLowerCase())
        : feature.displayName,
  }))

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      className="h-full"
    >
      <Card className="border-border/70 flex h-full flex-col rounded-lg">
        <CardHeader>
          <div className="bg-muted text-muted-foreground mb-2 flex size-9 items-center justify-center rounded-lg">
            <PackageCheck className="size-4" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg">{plan.planName}</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {formatPlanDescription(plan)}
          </p>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <PlanPrice plan={plan} />
            {plan.monthlyPrice > 0 && (
              <span className="text-muted-foreground text-xs">mỗi tháng</span>
            )}
          </p>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2.5">
            {capabilities.map((capability) => (
              <li
                key={capability.label}
                className="text-foreground flex items-start gap-2.5 text-sm"
              >
                {capability.enabled ? (
                  <Check className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Minus
                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className={capability.enabled ? undefined : 'text-muted-foreground'}>
                  {capability.enabled
                    ? capability.label
                    : `Chưa bao gồm ${capability.label.toLowerCase()}`}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full rounded-full" variant="outline" asChild>
            <Link href={APP_ROUTES.auth.register}>Đăng ký sử dụng</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function PricingSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Đang tải bảng giá">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="border-border/70 rounded-lg">
          <CardHeader className="space-y-4">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-9 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function PricingSection() {
  const { data: plans, isError, isLoading, refetch } = usePublicSubscriptionPlansQuery()

  return (
    <section
      id="pricing"
      className="border-border/60 bg-surface-container-low/60 scroll-mt-14 border-y"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto w-full max-w-(--container-landing) px-4 py-16 md:px-6 lg:py-24">
        <div className="mb-8 max-w-2xl">
          <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
            Bảng giá minh bạch
          </p>
          <h2 id="pricing-heading" className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
            Trả đúng theo quy mô kho của bạn
          </h2>
        </div>

        {isLoading && <PricingSkeleton />}

        {isError && (
          <Alert variant="destructive" className="max-w-2xl rounded-lg">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Không thể tải bảng giá</AlertTitle>
            <AlertDescription>
              Vui lòng kiểm tra kết nối và thử lại để xem các gói dịch vụ hiện có.
            </AlertDescription>
            <Button variant="outline" size="sm" className="mt-3 w-fit" onClick={() => refetch()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Thử lại
            </Button>
          </Alert>
        )}

        {!isLoading && !isError && plans?.length === 0 && (
          <Empty className="border-border bg-card rounded-lg">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageCheck aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Chưa có gói dịch vụ</EmptyTitle>
              <EmptyDescription>Thông tin bảng giá sẽ được cập nhật sớm.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && !isError && plans && plans.length > 0 && (
          <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan, index) => (
              <PricingPlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
