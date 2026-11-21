// Thuật ngữ của nhóm Azure: Azure Functions, Durable Functions.
import type { TermDef } from './types'

const runtime = 'Runtime & build' as const
const design = 'Thiết kế & nguyên tắc' as const

const terms: Record<string, TermDef> = {
  'azure functions': {
    title: 'Azure Functions',
    group: runtime,
    def: 'Dịch vụ serverless của Azure: viết một method gắn trigger (HTTP, Timer, Queue, Service Bus), Functions host gọi nó và tự scale số instance. Mỗi lần chạy bị giới hạn bởi `functionTimeout` (Consumption: tối đa 10 phút).',
    link: '/azure/durable-functions#functions-basics',
  },
  'function binding': {
    title: 'Binding',
    full: 'Azure Functions binding',
    group: runtime,
    def: 'Input/output khai báo bằng attribute trên function (đọc blob, ghi queue) thay vì tự gọi SDK. Trigger là một binding đặc biệt: cái kích hoạt function.',
    link: '/azure/durable-functions#functions-basics',
  },
  'isolated worker': {
    title: 'Isolated worker model',
    group: runtime,
    def: 'Cách chạy Azure Functions .NET mà code nằm trong một process riêng, nói chuyện với Functions host qua [[grpc]]. Chọn version .NET tự do, có DI và middleware như ASP.NET Core. Model in-process cũ hết hỗ trợ ngày 10/11/2026.',
    link: '/azure/durable-functions#isolated-worker',
  },
  'durable functions': {
    title: 'Durable Functions',
    group: runtime,
    def: 'Phần mở rộng của Azure Functions để viết workflow dài, có trạng thái, thành code async tuần tự. Dựng trên [[durable task framework]]: ghi history và [[replay]] để sống qua restart.',
    link: '/azure/durable-functions',
  },
  'durable task framework': {
    title: 'Durable Task Framework',
    group: runtime,
    def: 'Thư viện nền của Durable Functions (và Dapr Workflow): lưu mỗi bước của orchestration thành sự kiện trong history, chạy lại code để dựng trạng thái. Backend: Azure Storage (mặc định), MSSQL, Netherite, Durable Task Scheduler.',
    link: '/azure/durable-functions#replay',
  },
  'orchestrator function': {
    title: 'Orchestrator function',
    group: design,
    def: 'Function `[OrchestrationTrigger]` chỉ điều phối: gọi activity, chờ timer và external event. Bị [[replay]] nhiều lần nên phải deterministic, không làm I/O trực tiếp.',
    link: '/azure/durable-functions#determinism',
  },
  'activity function': {
    title: 'Activity function',
    group: design,
    def: 'Function `[ActivityTrigger]` làm việc thật (HTTP, DB). Chạy theo message nên at-least-once, phải idempotent; không bị luật deterministic.',
    link: '/azure/durable-functions#activities',
  },
  replay: {
    title: 'Replay',
    group: design,
    def: 'Durable chạy lại orchestrator từ dòng đầu mỗi khi có kết quả mới; các `await` đã xong lấy kết quả từ history thay vì chạy lại. Vì vậy code orchestrator phải ra cùng chuỗi lệnh ở mọi lần chạy.',
    link: '/azure/durable-functions#replay',
  },
  'event sourcing': {
    title: 'Event sourcing',
    group: design,
    def: 'Lưu trạng thái dưới dạng chuỗi sự kiện chỉ thêm (append-only) thay vì chỉ lưu giá trị hiện tại; trạng thái dựng lại bằng cách đọc lần lượt các sự kiện. Durable Functions dùng nó cho history của orchestration.',
    link: '/azure/durable-functions#replay',
  },
  'task hub': {
    title: 'Task hub',
    group: runtime,
    def: 'Không gian lưu trữ logic của Durable Functions (bảng history, bảng instance, các queue) cho một app. Hai app chung storage account phải khác tên task hub; deploy song song sang task hub mới là một cách xử lý versioning.',
    link: '/azure/durable-functions#replay',
  },
  'durable timer': {
    title: 'Durable timer',
    group: runtime,
    def: '`context.CreateTimer(fireAt, token)`: hẹn giờ được ghi vào history, sống qua restart, không giữ thread. Thay cho `Task.Delay` trong orchestrator.',
    link: '/azure/durable-functions#human-interaction',
  },
  'continue-as-new': {
    title: 'ContinueAsNew',
    group: runtime,
    def: 'Kết thúc lần chạy hiện tại của orchestrator và bắt đầu lại cùng instance id với input mới, history rỗng. Dùng cho orchestration chạy mãi (monitor, agent nhiều vòng) để history không phình.',
    link: '/azure/durable-functions#monitor',
  },
  'durable entity': {
    title: 'Durable entity',
    group: design,
    def: 'Object nhỏ có id và state bền trong Durable Functions, nhận operation tuần tự từng cái một nên không race. Hợp cho bộ đếm, hạn mức, khoá phân tán nhỏ.',
    link: '/azure/durable-functions#durable-entities',
  },
}

export default terms
