'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Activity, FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react'

const trustCertifications = [
  {
    icon: ShieldCheck,
    title: 'ISO 27001',
    description: 'Quản lý an toàn thông tin',
  },
  {
    icon: FileCheck2,
    title: 'SOC 2 Type II',
    description: 'Kiểm toán vận hành định kỳ',
  },
  {
    icon: LockKeyhole,
    title: 'GDPR',
    description: 'Bảo vệ dữ liệu cá nhân',
  },
  {
    icon: Activity,
    title: 'SLA 99,95%',
    description: 'Cam kết thời gian hoạt động',
  },
]

export function TrustBadgesSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      className="border-border/60 bg-surface-container-low/60 border-y"
      aria-label="Chứng nhận độ tin cậy"
    >
      <div className="mx-auto w-full max-w-(--container-landing) px-4 py-10 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustCertifications.map((certification, index) => {
            const CertificationIcon = certification.icon
            return (
              <motion.div
                key={certification.title}
                className="flex items-center gap-3.5"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
              >
                <div className="border-border bg-card text-primary rounded-full border p-3">
                  <CertificationIcon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">{certification.title}</p>
                  <p className="text-muted-foreground text-xs">{certification.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
