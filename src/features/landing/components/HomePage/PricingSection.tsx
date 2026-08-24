'use client'

import { useState, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CircleAlert, PackageCheck, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { BillingCycleToggle } from '@/features/subscription/components/BillingCycleToggle'
import { PlanFeatureSummary } from '@/features/subscription/components/PlanFeatureSummary'
import { usePublicSubscriptionPlansQuery } from '@/features/subscription/hooks/use-subscription'
import type {
  BillingCycle,
  SubscriptionPlanResponse,
} from '@/features/subscription/types/subscription.types'
import {
  formatCurrency,
  getBillingPeriodLabel,
  getMonthlyEquivalent,
  getPlanPrice,
} from '@/features/subscription/utils/format-subscription'
import { APP_ROUTES } from '@/routes/app-routes'

function PlanPrice({
  plan,
  billingCycle,
}: {
  readonly plan: SubscriptionPlanResponse
  readonly billingCycle: BillingCycle
}) {
  const price = getPlanPrice(plan, billingCycle)

  if (price === 0) {
    return <span className="text-2xl font-bold">Miễn phí</span>
  }

  return <span className="min-w-0 text-2xl font-bold tabular-nums">{formatCurrency(price)}</span>
}

function PricingPlanCard({
  plan,
  index,
  billingCycle,
}: {
  readonly plan: SubscriptionPlanResponse
  readonly index: number
  readonly billingCycle: BillingCycle
}) {
  const prefersReducedMotion = useReducedMotion()
  const price = getPlanPrice(plan, billingCycle)
  const monthlyEquivalent = getMonthlyEquivalent(plan, billingCycle)

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      className="h-full"
    >
      <Card className="border-border/70 flex h-full flex-col gap-0 rounded-lg py-0">
        <CardHeader className="gap-2.5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-md">
              <PackageCheck className="size-4" aria-hidden="true" />
            </div>
            {billingCycle === 'Yearly' && plan.yearlyDiscountPercent > 0 && (
              <Badge variant="secondary">Tiết kiệm {plan.yearlyDiscountPercent}%</Badge>
            )}
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-lg" title={plan.planName}>
              {plan.planName}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {plan.features.length} quyền lợi được cấu hình
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="min-w-0 [overflow-wrap:anywhere]">
              <PlanPrice plan={plan} billingCycle={billingCycle} />
            </div>
            {price > 0 && (
              <span className="text-muted-foreground text-xs">
                {getBillingPeriodLabel(billingCycle)}
              </span>
            )}
          </div>
          {billingCycle === 'Yearly' && price > 0 && (
            <p className="text-muted-foreground text-xs tabular-nums">
              Tương đương {formatCurrency(monthlyEquivalent)}/tháng
            </p>
          )}
        </CardHeader>
        <CardContent className="border-border/70 flex-1 border-t p-4">
          <PlanFeatureSummary plan={plan} />
        </CardContent>
        <CardFooter className="p-4 pt-3">
          <Button className="w-full" variant="outline" asChild>
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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Monthly')
  const activePlans = (plans ?? []).toSorted((firstPlan, secondPlan) => {
    if (firstPlan.displayOrder !== secondPlan.displayOrder) {
      return firstPlan.displayOrder - secondPlan.displayOrder
    }
    return firstPlan.monthlyPrice - secondPlan.monthlyPrice
  })
  const maximumYearlySaving = activePlans.reduce(
    (maximum, plan) => Math.max(maximum, plan.yearlyDiscountPercent),
    0
  )
  const pricingGridStyle = {
    '--pricing-plan-columns': `repeat(${Math.min(activePlans.length, 4)}, minmax(0, 1fr))`,
  } as CSSProperties

  return (
    <section
      id="pricing"
      className="border-border/60 bg-surface-container-low/60 scroll-mt-14 border-y"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto w-full max-w-(--container-landing) px-4 py-12 md:px-6 lg:py-16">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
              Bảng giá minh bạch
            </p>
            <h2 id="pricing-heading" className="mt-2 text-2xl font-bold md:text-3xl">
              Trả đúng theo quy mô kho của bạn
            </h2>
          </div>
          <BillingCycleToggle
            value={billingCycle}
            yearlySavingPercent={maximumYearlySaving}
            onValueChange={setBillingCycle}
          />
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

        {!isLoading && !isError && activePlans.length === 0 && (
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

        {!isLoading && !isError && activePlans.length > 0 && (
          <div
            className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-(--pricing-plan-columns)"
            style={pricingGridStyle}
          >
            {activePlans.map((plan, index) => (
              <PricingPlanCard
                key={plan.id}
                plan={plan}
                index={index}
                billingCycle={billingCycle}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
