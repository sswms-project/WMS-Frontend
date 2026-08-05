import type {
  DashboardMetric,
  WarehouseStats,
  QuickAction,
  StaffTask,
  AppNotification,
  RecentOperation,
  MetricTrendPoint,
} from '../types'

const CURRENT_YEAR = new Date().getFullYear()
const MONTH_LABELS = [
  'Th1',
  'Th2',
  'Th3',
  'Th4',
  'Th5',
  'Th6',
  'Th7',
  'Th8',
  'Th9',
  'Th10',
  'Th11',
  'Th12',
]

function buildMonthlyTrend(values: number[]): MetricTrendPoint[] {
  return values.map((value, index) => ({
    date: new Date(CURRENT_YEAR, index, 1),
    label: MONTH_LABELS[index] ?? `Th${index + 1}`,
    value,
  }))
}

export const tenantOwnerMetrics: DashboardMetric[] = [
  {
    label: 'Tổng sản phẩm',
    value: 12482,
    change: 5.2,
    changeLabel: 'so với tháng trước',
    monthlyTrend: buildMonthlyTrend([
      10200, 10450, 10680, 10900, 11150, 11400, 11650, 11900, 12080, 12220, 12350, 12482,
    ]),
  },
  {
    label: 'Tổng tồn kho',
    value: 489201,
    change: 12.5,
    changeLabel: 'so với tháng trước',
    monthlyTrend: buildMonthlyTrend([
      420000, 428000, 435000, 441000, 448000, 455000, 461000, 468000, 474000, 480000, 485000,
      489201,
    ]),
  },
  {
    label: 'Đơn chờ xử lý',
    value: 84,
    change: 8.3,
    changeLabel: 'so với tháng trước',
    monthlyTrend: buildMonthlyTrend([62, 58, 65, 70, 68, 75, 80, 77, 82, 79, 88, 84]),
  },
  {
    label: 'Doanh thu hôm nay',
    value: '142,5 triệu ₫',
    change: 15.2,
    changeLabel: 'so với tháng trước',
    monthlyTrend: buildMonthlyTrend([98, 102, 105, 110, 108, 115, 120, 118, 125, 130, 138, 142.5]),
  },
]

export const warehouseManagerMetrics: DashboardMetric[] = [
  {
    label: 'Tổng sản phẩm',
    value: 3245,
    change: 4.8,
    changeLabel: 'so với tuần trước',
    monthlyTrend: buildMonthlyTrend([
      2800, 2850, 2900, 2950, 3000, 3050, 3080, 3120, 3150, 3180, 3210, 3245,
    ]),
  },
  {
    label: 'Sức chứa kho',
    value: 8950,
    change: 2.1,
    changeLabel: 'so với tuần trước',
    monthlyTrend: buildMonthlyTrend([
      8200, 8300, 8400, 8500, 8550, 8600, 8650, 8700, 8750, 8820, 8880, 8950,
    ]),
  },
  {
    label: 'Đơn đang xử lý',
    value: 234,
    change: 12,
    changeLabel: 'so với tuần trước',
    monthlyTrend: buildMonthlyTrend([180, 190, 185, 200, 195, 210, 205, 215, 220, 225, 230, 234]),
  },
  {
    label: 'Độ chính xác lấy hàng',
    value: '99,2%',
    change: 0.5,
    changeLabel: 'so với tuần trước',
    monthlyTrend: buildMonthlyTrend([
      97.5, 97.8, 98.0, 98.2, 98.4, 98.5, 98.6, 98.8, 98.9, 99.0, 99.1, 99.2,
    ]),
  },
]

export const recentOperations: RecentOperation[] = [
  {
    id: '1',
    type: 'inbound',
    title: 'Đã nhận phiếu nhập kho #MF-9021-X',
    description: 'SKU: LT-0245 | Đã nhận 5.000 đơn vị',
    timestamp: '14:23',
    status: 'completed',
  },
  {
    id: '2',
    type: 'transfer',
    title: 'Chuyển kho nội bộ: Zone C → Zone A',
    description: 'SKU: 3421 | Đã chuyển 800 đơn vị',
    timestamp: '11:08',
    status: 'processing',
  },
  {
    id: '3',
    type: 'alert',
    title: 'Đã ghi nhận sai lệch tồn kho',
    description: 'Bin B 402 | SKU 102 | Chênh lệch 5 đơn vị',
    timestamp: '11:12',
    status: 'flagged',
  },
  {
    id: '4',
    type: 'audit',
    title: 'AI khởi tạo kiểm kê tồn kho',
    description: 'Lịch kiểm đếm định kỳ lúc 18:00',
    timestamp: '11:45',
    status: 'scheduled',
  },
]

export const chartData = [
  { day: 'T2', inbound: 4000, outbound: 2400 },
  { day: 'T3', inbound: 3000, outbound: 1398 },
  { day: 'T4', inbound: 2000, outbound: 9800 },
  { day: 'T5', inbound: 2780, outbound: 3908 },
  { day: 'T6', inbound: 1890, outbound: 4800 },
  { day: 'T7', inbound: 2390, outbound: 3800 },
  { day: 'CN', inbound: 2490, outbound: 4300 },
]

export const warehouseStats: WarehouseStats[] = [
  {
    id: 'wh-001',
    name: 'Kho Chính',
    totalCapacity: 10000,
    usedCapacity: 8200,
    activeOrders: 45,
    staffCount: 24,
    revenue: 620,
    revenueTarget: 700,
  },
  {
    id: 'wh-002',
    name: 'Trung tâm phân phối A',
    totalCapacity: 5000,
    usedCapacity: 3200,
    activeOrders: 28,
    staffCount: 12,
    revenue: 310,
    revenueTarget: 350,
  },
  {
    id: 'wh-003',
    name: 'Trung tâm phân phối B',
    totalCapacity: 5000,
    usedCapacity: 4100,
    activeOrders: 35,
    staffCount: 15,
    revenue: 275,
    revenueTarget: 320,
  },
]

export const lowStockItems = [
  {
    id: '1',
    sku: 'ABC-123',
    name: 'Sản phẩm A',
    quantity: 15,
    threshold: 50,
    location: 'Zone A - Bin 12',
  },
  {
    id: '2',
    sku: 'XYZ-456',
    name: 'Sản phẩm B',
    quantity: 8,
    threshold: 30,
    location: 'Zone B - Bin 05',
  },
  {
    id: '3',
    sku: 'DEF-789',
    name: 'Sản phẩm C',
    quantity: 22,
    threshold: 40,
    location: 'Zone C - Bin 18',
  },
]

export const staffMetrics: DashboardMetric[] = [
  {
    label: 'Nhiệm vụ được giao hôm nay',
    value: 18,
    change: 3,
    changeLabel: 'so với hôm qua',
    monthlyTrend: buildMonthlyTrend([12, 14, 13, 15, 14, 16, 15, 17, 16, 17, 18, 18]),
  },
  {
    label: 'Nhiệm vụ đã hoàn thành',
    value: 12,
    change: 9.1,
    changeLabel: 'so với hôm qua',
    monthlyTrend: buildMonthlyTrend([8, 9, 8, 10, 9, 10, 11, 10, 11, 11, 12, 12]),
  },
  {
    label: 'Nhiệm vụ đang chờ',
    value: 6,
    change: -2,
    changeLabel: 'so với hôm qua',
    monthlyTrend: buildMonthlyTrend([9, 8, 9, 7, 8, 7, 6, 7, 6, 6, 5, 6]),
  },
  {
    label: 'Độ chính xác của tôi',
    value: '98,7%',
    change: 0.3,
    changeLabel: 'so với tuần trước',
    monthlyTrend: buildMonthlyTrend([
      96.5, 96.8, 97.0, 97.2, 97.5, 97.7, 97.9, 98.0, 98.2, 98.4, 98.5, 98.7,
    ]),
  },
]

export const myTasks: StaffTask[] = [
  {
    id: '1',
    type: 'Picking',
    sku: 'LT-0245',
    location: 'Zone B - Bin 12',
    dueTime: '14:50',
    status: 'in_progress',
  },
  {
    id: '2',
    type: 'Packing',
    sku: 'XYZ-456',
    location: 'Zone A - Pack Station 2',
    dueTime: '15:10',
    status: 'pending',
  },
  {
    id: '3',
    type: 'Putaway',
    sku: 'DEF-789',
    location: 'Zone C - Bin 18',
    dueTime: '15:30',
    status: 'pending',
  },
  {
    id: '4',
    type: 'Picking',
    sku: 'ABC-123',
    location: 'Zone A - Bin 05',
    dueTime: '13:45',
    status: 'completed',
  },
]

export const staffQuickActions: QuickAction[] = [
  {
    id: '1',
    label: 'Bắt đầu nhiệm vụ',
    icon: 'play',
    href: '/tasks/next',
    description: 'Bắt đầu công việc được giao tiếp theo',
  },
  {
    id: '2',
    label: 'Quét mã',
    icon: 'scan-barcode',
    href: '/scan',
    description: 'Quét mã vạch hoặc SKU',
  },
  {
    id: '3',
    label: 'Báo cáo sự cố',
    icon: 'flag',
    href: '/report-issue',
    description: 'Báo cáo sai lệch hoặc sự cố',
  },
  {
    id: '4',
    label: 'Lịch làm việc',
    icon: 'calendar',
    href: '/my-schedule',
    description: 'Xem lịch ca làm việc của bạn',
  },
]

export const notifications: AppNotification[] = [
  {
    id: '1',
    title: 'Cảnh báo sắp hết hàng',
    description: 'SKU ABC-123 đã xuống dưới ngưỡng tối thiểu tại Zone A',
    timestamp: '10 phút trước',
    read: false,
  },
  {
    id: '2',
    title: 'Nhiệm vụ được giao',
    description: 'Phiếu lấy hàng mới #PT-4521 được giao cho bạn',
    timestamp: '32 phút trước',
    read: false,
  },
  {
    id: '3',
    title: 'Đã lên lịch kiểm kê tồn kho',
    description: 'AI đã lên lịch kiểm đếm định kỳ lúc 18:00 hôm nay',
    timestamp: '1 giờ trước',
    read: false,
  },
  {
    id: '4',
    title: 'Giao hàng hoàn tất',
    description: 'Đơn hàng #ORD-2024-001240 đã giao thành công',
    timestamp: '6 giờ trước',
    read: true,
  },
]

export const tenantOwnerQuickActions: QuickAction[] = [
  {
    id: '1',
    label: 'Tạo đơn hàng',
    icon: 'package',
    href: '/orders/create',
    description: 'Tạo đơn hàng mới',
    readOnlyWrite: true,
  },
  {
    id: '2',
    label: 'Xem báo cáo',
    icon: 'bar-chart-3',
    href: '/reports',
    description: 'Truy cập báo cáo và phân tích',
  },
  {
    id: '3',
    label: 'Quản lý nhân sự',
    icon: 'users',
    href: '/staff',
    description: 'Quản lý thành viên nhóm',
  },
  {
    id: '4',
    label: 'Cài đặt',
    icon: 'settings',
    href: '/settings',
    description: 'Cấu hình tài khoản của bạn',
  },
]

export const warehouseManagerQuickActions: QuickAction[] = [
  {
    id: '1',
    label: 'Tạo phiếu lấy hàng',
    icon: 'clipboard',
    href: '/picking-tasks/create',
    description: 'Tạo phiếu lấy hàng mới',
  },
  {
    id: '2',
    label: 'Kiểm kê tồn kho',
    icon: 'search',
    href: '/inventory/check',
    description: 'Thực hiện kiểm tra tồn kho',
  },
  {
    id: '3',
    label: 'Lịch làm việc nhân viên',
    icon: 'calendar',
    href: '/schedule',
    description: 'Xem và quản lý lịch làm việc nhân viên',
  },
  {
    id: '4',
    label: 'Sơ đồ kho',
    icon: 'map',
    href: '/warehouse-map',
    description: 'Xem bố trí mặt bằng kho',
  },
]
