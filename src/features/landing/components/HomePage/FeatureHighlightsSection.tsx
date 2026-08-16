'use client'

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { BarChart3, Boxes, Sparkles, Truck, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type FeatureHighlight = {
  icon: LucideIcon
  title: string
  description: string
  iconClassName: string
}

const featureHighlights: FeatureHighlight[] = [
  {
    icon: Boxes,
    title: 'Tồn kho thời gian thực',
    description:
      'Theo dõi từng SKU theo vị trí Kho > Dãy > Bin, cập nhật tức thời khi hàng dịch chuyển.',
    iconClassName: 'bg-primary/10 text-primary',
  },
  {
    icon: Truck,
    title: 'Điều phối vận chuyển',
    description:
      'Lập kế hoạch xuất nhập, gán tài xế và theo dõi trạng thái giao hàng trên một bảng điều khiển.',
    iconClassName: 'bg-secondary-container text-on-secondary-container',
  },
  {
    icon: BarChart3,
    title: 'Phân tích vận hành',
    description: 'Báo cáo luồng hàng, hiệu suất nhân sự và độ chính xác kiểm kê theo từng chu kỳ.',
    iconClassName: 'bg-primary/10 text-primary',
  },
  {
    icon: Sparkles,
    title: 'AI dự báo nhu cầu',
    description:
      'Gợi ý nhập hàng và cảnh báo thiếu hụt dựa trên lịch sử xuất nhập của chính kho bạn.',
    iconClassName: 'bg-tertiary-container text-on-tertiary-container',
  },
]

const maxTiltDegrees = 9

function TiltCard({ feature, index }: { feature: FeatureHighlight; index: number }) {
  const prefersReducedMotion = useReducedMotion()
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5
    rotateY.set(relativeX * maxTiltDegrees * 2)
    rotateX.set(-relativeY * maxTiltDegrees * 2)
  }

  const handlePointerLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const FeatureIcon = feature.icon

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        prefersReducedMotion
          ? undefined
          : { rotateX, rotateY, transformPerspective: 850, transformStyle: 'preserve-3d' }
      }
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      className="h-full"
    >
      <Card className="border-border/70 hover:border-primary/40 h-full transition-colors">
        <CardContent
          className="flex h-full flex-col gap-3"
          style={prefersReducedMotion ? undefined : { transform: 'translateZ(24px)' }}
        >
          <div className={`w-fit rounded-lg p-2.5 ${feature.iconClassName}`}>
            <FeatureIcon className="size-5" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold">{feature.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function FeatureHighlightsSection() {
  return (
    <section id="features" className="scroll-mt-14" aria-labelledby="features-heading">
      <div className="mx-auto w-full max-w-(--container-landing) px-4 py-16 md:px-6 lg:py-24">
        <div className="mb-12 max-w-2xl">
          <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
            Một nền tảng, đủ mọi nghiệp vụ
          </p>
          <h2 id="features-heading" className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
            Được thiết kế cho đội vận hành kho làm việc cả ngày trên màn hình
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featureHighlights.map((feature, index) => (
            <TiltCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
