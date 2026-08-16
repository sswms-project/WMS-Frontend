'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const weeklyFlowData = [
  { week: 'T1', inbound: 4200, outbound: 3800 },
  { week: 'T2', inbound: 4600, outbound: 4100 },
  { week: 'T3', inbound: 4400, outbound: 4550 },
  { week: 'T4', inbound: 5100, outbound: 4700 },
  { week: 'T5', inbound: 4900, outbound: 5150 },
  { week: 'T6', inbound: 5600, outbound: 5300 },
  { week: 'T7', inbound: 5900, outbound: 5480 },
  { week: 'T8', inbound: 5700, outbound: 5900 },
  { week: 'T9', inbound: 6300, outbound: 6050 },
  { week: 'T10', inbound: 6800, outbound: 6400 },
  { week: 'T11', inbound: 6600, outbound: 6750 },
  { week: 'T12', inbound: 7200, outbound: 6900 },
]

const weeklyFlowConfig = {
  inbound: { label: 'Nhập kho', color: 'var(--chart-1)' },
  outbound: { label: 'Xuất kho', color: 'var(--chart-2)' },
} satisfies ChartConfig

const warehouseThroughputData = [
  { warehouse: 'Kho A', orders: 2318 },
  { warehouse: 'Kho B', orders: 1874 },
  { warehouse: 'Kho C', orders: 1592 },
  { warehouse: 'Kho D', orders: 1210 },
  { warehouse: 'Kho E', orders: 864 },
]

const warehouseThroughputConfig = {
  orders: { label: 'Đơn đã xử lý', color: 'var(--chart-1)' },
} satisfies ChartConfig

const operationHighlights = [
  { value: '99,7%', label: 'Độ chính xác kiểm kê' },
  { value: '-42%', label: 'Thời gian xử lý đơn' },
  { value: '8,4×', label: 'Vòng quay tồn kho / năm' },
]

export function DataInsightsSection() {
  const sectionInnerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionInnerRef,
    offset: ['start end', 'end center'],
  })
  const depthScale = useTransform(scrollYProgress, [0, 1], [0.95, 1])
  const depthOpacity = useTransform(scrollYProgress, [0, 0.55], [0.4, 1])
  const depthY = useTransform(scrollYProgress, [0, 1], [40, 0])

  return (
    <section id="insights" className="scroll-mt-14" aria-labelledby="insights-heading">
      <div className="mx-auto w-full max-w-(--container-landing) px-4 py-16 md:px-6 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
            Trực quan hóa dữ liệu
          </p>
          <h2 id="insights-heading" className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
            Toàn cảnh vận hành kho trong một màn hình
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed md:text-base">
            Số liệu dưới đây là dữ liệu minh họa từ bảng điều khiển KOVIA — cập nhật theo thời gian
            thực khi kho của bạn hoạt động.
          </p>
        </div>

        {/* Depth-on-scroll: the whole board rises and sharpens as it enters */}
        <motion.div
          ref={sectionInnerRef}
          style={
            prefersReducedMotion
              ? undefined
              : { scale: depthScale, opacity: depthOpacity, y: depthY }
          }
          className="grid gap-5 lg:grid-cols-[1.5fr_1fr]"
        >
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Luồng nhập – xuất 12 tuần gần nhất</CardTitle>
              <CardDescription>Số kiện hàng qua cổng mỗi tuần</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={weeklyFlowConfig} className="h-[280px] w-full">
                <AreaChart data={weeklyFlowData} margin={{ left: 4, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="fillInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-inbound)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="var(--color-inbound)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fillOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-outbound)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="var(--color-outbound)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} width={44} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    dataKey="inbound"
                    type="monotone"
                    stroke="var(--color-inbound)"
                    strokeWidth={2}
                    fill="url(#fillInbound)"
                  />
                  <Area
                    dataKey="outbound"
                    type="monotone"
                    stroke="var(--color-outbound)"
                    strokeWidth={2}
                    fill="url(#fillOutbound)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {operationHighlights.map((highlight) => (
                <Card key={highlight.label} className="border-border/70 gap-0 py-4">
                  <CardContent className="px-4">
                    <p className="text-primary font-mono text-xl font-semibold sm:text-2xl">
                      {highlight.value}
                    </p>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-snug font-semibold tracking-wide uppercase">
                      {highlight.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border/70 flex-1">
              <CardHeader>
                <CardTitle className="text-base">Sản lượng theo kho</CardTitle>
                <CardDescription>Đơn đã xử lý trong tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={warehouseThroughputConfig} className="h-[180px] w-full">
                  <BarChart data={warehouseThroughputData} margin={{ top: 4, right: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="warehouse" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar
                      dataKey="orders"
                      fill="var(--color-orders)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
