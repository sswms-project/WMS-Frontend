import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/routes/app-routes'

const sectionLinks = [
  { href: '/#features', label: 'Tính năng' },
  { href: '/#insights', label: 'Dữ liệu' },
  { href: APP_ROUTES.pricing, label: 'Bảng giá' },
  { href: '/#contact', label: 'Liên hệ' },
] as const

export function HomeHeader() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-(--container-landing) items-center justify-between px-4 md:px-6">
        <Logo />

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Điều hướng tới các phần trong trang"
        >
          {sectionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="flex items-center gap-2" aria-label="Tài khoản">
          <Button variant="ghost" asChild>
            <Link href={APP_ROUTES.auth.login}>Đăng nhập</Link>
          </Button>
          <Button className="rounded-full font-semibold" asChild>
            <Link href={APP_ROUTES.auth.register}>Dùng thử miễn phí</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
