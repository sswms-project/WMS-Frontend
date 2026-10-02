'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnnouncementHistory } from '../components/Announcements/AnnouncementHistory'
import {
  useAdminSubscriptionPlansQuery,
  useSendAnnouncementMutation,
  useTenantsQuery,
} from '../hooks/use-admin'
import {
  ANNOUNCEMENT_ACTIONS,
  ANNOUNCEMENT_AUDIENCES,
  announcementSchema,
  NO_ANNOUNCEMENT_ACTION,
  type AnnouncementFormValues,
} from '../schemas/announcement.schema'

const PLAN_QUERY = { pageNumber: 1, pageSize: 100, status: 'Active' } as const

const DEFAULT_VALUES: AnnouncementFormValues = {
  title: '',
  message: '',
  audience: ANNOUNCEMENT_AUDIENCES.AllActiveTenants,
  planIds: [],
  tenantIds: [],
  action: NO_ANNOUNCEMENT_ACTION,
  sendEmail: false,
}

export default function AnnouncementsPage() {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: DEFAULT_VALUES,
  })
  const [pendingValues, setPendingValues] = useState<AnnouncementFormValues | null>(null)
  const plansQuery = useAdminSubscriptionPlansQuery(PLAN_QUERY)
  const sendMutation = useSendAnnouncementMutation()

  const audience = useWatch({ control: form.control, name: 'audience' })
  const [tenantSearch, setTenantSearch] = useState('')
  const tenantsQuery = useTenantsQuery({
    pageNumber: 1,
    pageSize: 20,
    status: 'Active',
    search: tenantSearch.trim() || undefined,
    sortBy: 'tenantName',
    sortDirection: 0,
  })
  const errors = form.formState.errors
  const plans = plansQuery.data?.items ?? []
  const tenants = tenantsQuery.data?.items ?? []

  async function confirmSend() {
    if (!pendingValues) return
    const values = pendingValues
    try {
      const response = await sendMutation.mutateAsync({
        title: values.title,
        message: values.message,
        audience: values.audience,
        planIds: values.audience === ANNOUNCEMENT_AUDIENCES.ByPlan ? values.planIds : null,
        tenantIds:
          values.audience === ANNOUNCEMENT_AUDIENCES.SpecificTenants ? values.tenantIds : null,
        action: values.action === NO_ANNOUNCEMENT_ACTION ? null : values.action,
        sendEmail: values.sendEmail,
      })
      const { recipientCount, emailQueuedCount } = response.data
      toast.success(`Đã gửi thông báo tới ${recipientCount} tổ chức`)
      if (emailQueuedCount > 0) {
        toast.info(`${emailQueuedCount} email đã được xếp hàng gửi, hệ thống sẽ tự thử lại nếu lỗi`)
      }
      form.reset(DEFAULT_VALUES)
    } catch {
      // Lỗi đã được hook xử lý (toast + log); giữ nguyên form để người dùng gửi lại.
    } finally {
      setPendingValues(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Thông báo hệ thống</h1>
        <p className="text-muted-foreground text-sm">
          Gửi thông báo tới chủ các tổ chức đang hoạt động, kèm email nếu cần.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Soạn thông báo</CardTitle>
          <CardDescription>
            Thông báo hiển thị trong chuông thông báo của người nhận.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={form.handleSubmit(setPendingValues)}>
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="announcement-title">Tiêu đề</FieldLabel>
              <Input
                id="announcement-title"
                maxLength={255}
                autoComplete="off"
                aria-invalid={Boolean(errors.title)}
                {...form.register('title')}
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={Boolean(errors.message)}>
              <FieldLabel htmlFor="announcement-message">Nội dung</FieldLabel>
              <Textarea
                id="announcement-message"
                rows={6}
                maxLength={1000}
                autoComplete="off"
                aria-invalid={Boolean(errors.message)}
                {...form.register('message')}
              />
              <FieldError errors={[errors.message]} />
            </Field>

            <Field>
              <FieldLabel>Đối tượng nhận</FieldLabel>
              <Controller
                control={form.control}
                name="audience"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        id="audience-all"
                        value={ANNOUNCEMENT_AUDIENCES.AllActiveTenants}
                      />
                      <Label htmlFor="audience-all">Tất cả tổ chức đang hoạt động</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="audience-plan" value={ANNOUNCEMENT_AUDIENCES.ByPlan} />
                      <Label htmlFor="audience-plan">Theo gói dịch vụ</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        id="audience-tenants"
                        value={ANNOUNCEMENT_AUDIENCES.SpecificTenants}
                      />
                      <Label htmlFor="audience-tenants">Tổ chức cụ thể</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </Field>

            {audience === ANNOUNCEMENT_AUDIENCES.ByPlan && (
              <Field data-invalid={Boolean(errors.planIds)}>
                <FieldLabel>Gói dịch vụ</FieldLabel>
                <Controller
                  control={form.control}
                  name="planIds"
                  render={({ field }) => (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {plans.map((plan) => {
                        const checked = field.value.includes(plan.id)
                        return (
                          <div key={plan.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`plan-${plan.id}`}
                              checked={checked}
                              onCheckedChange={(next) =>
                                field.onChange(
                                  next
                                    ? [...field.value, plan.id]
                                    : field.value.filter((id) => id !== plan.id)
                                )
                              }
                            />
                            <Label htmlFor={`plan-${plan.id}`}>{plan.planName}</Label>
                          </div>
                        )
                      })}
                      {plansQuery.isLoading && (
                        <p className="text-muted-foreground text-sm">Đang tải danh sách gói…</p>
                      )}
                    </div>
                  )}
                />
                <FieldError errors={[errors.planIds]} />
              </Field>
            )}

            {audience === ANNOUNCEMENT_AUDIENCES.SpecificTenants && (
              <Field data-invalid={Boolean(errors.tenantIds)}>
                <FieldLabel htmlFor="announcement-tenant-search">Tổ chức</FieldLabel>
                <Input
                  id="announcement-tenant-search"
                  type="search"
                  placeholder="Tìm theo tên tổ chức…"
                  autoComplete="off"
                  value={tenantSearch}
                  onChange={(event) => setTenantSearch(event.target.value)}
                />
                <Controller
                  control={form.control}
                  name="tenantIds"
                  render={({ field }) => (
                    <>
                      <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                        {tenants.map((tenant) => (
                          <div key={tenant.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`tenant-${tenant.id}`}
                              checked={field.value.includes(tenant.id)}
                              onCheckedChange={(next) =>
                                field.onChange(
                                  next
                                    ? [...field.value, tenant.id]
                                    : field.value.filter((id) => id !== tenant.id)
                                )
                              }
                            />
                            <Label htmlFor={`tenant-${tenant.id}`}>{tenant.tenantName}</Label>
                          </div>
                        ))}
                        {tenantsQuery.isLoading && (
                          <p className="text-muted-foreground text-sm">Đang tải danh sách…</p>
                        )}
                        {!tenantsQuery.isLoading && tenants.length === 0 && (
                          <p className="text-muted-foreground text-sm">Không tìm thấy tổ chức.</p>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Đã chọn {field.value.length} tổ chức
                      </p>
                    </>
                  )}
                />
                <FieldError errors={[errors.tenantIds]} />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="announcement-action">Khi bấm vào thông báo</FieldLabel>
              <Controller
                control={form.control}
                name="action"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="announcement-action" className="w-full sm:w-72">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_ANNOUNCEMENT_ACTION}>Không chuyển trang</SelectItem>
                      {ANNOUNCEMENT_ACTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <div className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="sendEmail"
                render={({ field }) => (
                  <Checkbox
                    id="announcement-send-email"
                    checked={field.value}
                    onCheckedChange={(next) => field.onChange(next === true)}
                  />
                )}
              />
              <Label htmlFor="announcement-send-email">Gửi kèm email tới chủ tổ chức</Label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={sendMutation.isPending}>
                <Send aria-hidden="true" />
                Gửi thông báo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AnnouncementHistory />

      <AlertDialog
        open={pendingValues !== null}
        onOpenChange={(open) => {
          if (!open && !sendMutation.isPending) setPendingValues(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi thông báo?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingValues?.audience === ANNOUNCEMENT_AUDIENCES.ByPlan
                ? `Thông báo sẽ được gửi tới chủ các tổ chức thuộc ${pendingValues.planIds.length} gói đã chọn.`
                : pendingValues?.audience === ANNOUNCEMENT_AUDIENCES.SpecificTenants
                  ? `Thông báo sẽ được gửi tới chủ ${pendingValues.tenantIds.length} tổ chức đã chọn.`
                  : 'Thông báo sẽ được gửi tới chủ tất cả tổ chức đang hoạt động.'}
              {pendingValues?.sendEmail ? ' Email cũng sẽ được gửi.' : ''} Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={sendMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                void confirmSend()
              }}
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Đang gửi
                </>
              ) : (
                'Xác nhận gửi'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
