import type { TermDef } from './types'

const web = 'Web & API' as const
const design = 'Thiết kế & nguyên tắc' as const

const terms: Record<string, TermDef> = {
  httpcontext: {
    title: 'HttpContext',
    group: web,
    def: 'Object gói mọi thứ của **một** request: `Request`, `Response`, `User`, `RequestServices`. Mỗi middleware nhận nó và có thể đọc hoặc gắn thêm dữ liệu cho lớp sau.',
  },
  'short-circuit': {
    title: 'Short-circuit',
    full: 'ngắt mạch',
    group: web,
    def: 'Một middleware **chủ động không gọi** `next`, tự ghi response rồi `return`. Các lớp phía trong không chạy; đường về vẫn bình thường.',
    link: '/aspnet-core/middleware#_2-exception-va-short-circuit',
  },
  preflight: {
    title: 'Preflight',
    full: 'request OPTIONS hỏi trước',
    group: web,
    def: 'Với một số request cross-origin, browser gửi trước một request `OPTIONS` để hỏi server "tôi có được gọi không?". Request này **không mang token**, nên CORS phải đứng trước auth.',
  },
  'rate limiting': {
    title: 'Rate limiting',
    full: 'giới hạn tần suất',
    group: web,
    def: 'Giới hạn số request một bên gọi được gửi trong một khoảng thời gian. Vượt mức thì bị từ chối (đúng nghĩa là 429), để một client không làm cạn tài nguyên của người khác.',
  },
  'partition key': {
    title: 'Partition key',
    full: 'khoá chia nhóm',
    group: web,
    def: 'Giá trị (IP, user, API key...) mà rate limiter dùng để chia request thành các nhóm, mỗi nhóm có quota riêng. Nếu key chưa có lúc limiter chạy (vd `User` khi chưa authenticate) thì mọi request rơi chung một nhóm.',
  },
  reflection: {
    title: 'Reflection',
    group: 'Runtime & build',
    def: 'Chương trình **đọc cấu trúc của chính nó lúc chạy**: tên method, tham số, attribute. Linh hoạt nhưng chậm hơn gọi trực tiếp, và sai chữ ký chỉ lộ lúc chạy chứ không phải lúc compile.',
  },
  delegate: {
    title: 'Delegate',
    full: 'kiểu "tham chiếu tới hàm"',
    group: 'Runtime & build',
    def: 'Kiểu cho phép giữ một method trong biến rồi gọi sau. `RequestDelegate` là delegate "nhận `HttpContext`, trả `Task`": mỗi middleware nhận delegate của lớp kế tiếp làm `next`.',
  },
  'hot path': {
    title: 'Hot path',
    group: design,
    def: 'Đoạn code chạy cho **mọi** request hoặc rất nhiều lần mỗi giây, nên vài micro giây tiết kiệm được cũng đáng kể.',
  },
  httpmodule: {
    title: 'HttpModule',
    group: web,
    def: 'Thành phần của ASP.NET cũ (.NET Framework) gắn vào các event cố định của pipeline IIS (vd `BeginRequest`) để xử lý chung cho mọi request. Middleware là bản thay thế hiện đại.',
  },
  'captive dependency': {
    title: 'Captive dependency',
    group: design,
    def: 'Object sống lâu (singleton) giữ một dependency sống ngắn (scoped), nên dependency đó bị **giam** quá vòng đời đáng lẽ của nó và bị dùng chung giữa các request.',
    link: '/aspnet-core/dependency-injection#captive-dependency',
  },
  problemdetails: {
    title: 'ProblemDetails',
    full: 'RFC 9457',
    group: web,
    def: 'Format JSON chuẩn để API báo lỗi: `type`, `title`, `status`, `detail`, `instance`. RFC (Request for Comments) 9457 là tài liệu chuẩn mô tả format này. ASP.NET Core có sẵn class `ProblemDetails`.',
    link: '/aspnet-core/exception-handling#traceid',
  },
  'fail-fast': {
    title: 'Fail-fast',
    full: 'lỗi sớm',
    group: design,
    def: 'Phát hiện cấu hình sai ngay lúc app khởi động (ném exception khi start) thay vì để tới khi có request mới lộ ra.',
  },
  traceid: {
    title: 'traceId',
    full: 'trace id',
    group: web,
    def: 'Mã định danh một request, đi cùng nó qua mọi tầng và mọi service, theo chuẩn W3C `traceparent` (`00-<trace id 32 hex>-<span id>-<flags>`). Client báo mã này, bạn tìm đúng log của request đó.',
    link: '/aspnet-core/exception-handling#traceid',
  },
  ocp: {
    title: 'OCP',
    full: 'Open/Closed Principle',
    group: design,
    def: 'Một trong 5 nguyên tắc [SOLID](/dotnet/oop-fundamentals#solid): thêm hành vi mới bằng **code mới** (class mới), không sửa code cũ đang chạy tốt.',
    link: '/dotnet/oop-fundamentals#solid',
  },
  mvc: {
    title: 'MVC',
    full: 'Model-View-Controller',
    group: web,
    def: 'Kiểu tổ chức web app theo controller và action. Trong ASP.NET Core, "MVC" thường chỉ cả `[ApiController]`: có model binding, validation và filter riêng.',
  },
  'minimal api': {
    title: 'Minimal API',
    group: web,
    def: 'Cách khai báo endpoint bằng lambda (`app.MapGet("/x", ...)`) thay vì class controller. Ít nghi lễ hơn, tham số của lambda được inject tự động.',
  },
  'web farm': {
    title: 'Web farm',
    group: 'Quy trình & khác',
    def: 'Nhóm nhiều server cùng chạy một app (thường là IIS) đứng sau một [[load balancer]].',
  },
  orchestrator: {
    title: 'Orchestrator',
    full: 'bộ điều phối',
    group: 'Quy trình & khác',
    def: 'Phần mềm chạy và trông coi nhiều bản app thay cho người vận hành: khởi động, restart, chia traffic, scale. Phổ biến nhất là [[kubernetes]].',
  },
  kubernetes: {
    title: 'Kubernetes',
    full: 'K8s',
    group: 'Quy trình & khác',
    def: 'Orchestrator mã nguồn mở cho container. Bạn khai báo trạng thái mong muốn ("luôn chạy 3 bản"), nó tự giữ cho đúng. Các khái niệm hay gặp: [[pod]], [[deployment]], [[k8s service]], [[probe]].',
    link: '/aspnet-core/health-checks#kubernetes-trong-1-phut',
  },
  pod: {
    title: 'Pod',
    group: 'Quy trình & khác',
    def: 'Một bản app đang chạy trong Kubernetes (ở đây là một container chứa PayoutHub.Api). Giống một server trong web farm IIS.',
  },
  deployment: {
    title: 'Deployment',
    group: 'Quy trình & khác',
    def: 'Khai báo trong Kubernetes kiểu "luôn giữ 3 pod". Pod chết thì tự tạo pod mới thay.',
  },
  'k8s service': {
    title: 'Service (Kubernetes)',
    group: 'Quy trình & khác',
    def: 'Một địa chỉ chung đứng trước các pod, chia traffic **chỉ cho pod đang ready**. Giống load balancer trước web farm.',
  },
  probe: {
    title: 'Probe',
    group: 'Quy trình & khác',
    def: 'Kubernetes tự gọi `/health/...` của từng pod định kỳ: mỗi `periodSeconds` (mặc định 10s) một lần, fail **liên tiếp** `failureThreshold` lần (mặc định 3) mới hành động, tức khoảng **30 giây** từ lúc hỏng tới lúc bị xử lý. Mỗi lần gọi có `timeoutSeconds` (mặc định 1s), quá thời gian là tính fail.',
    link: '/aspnet-core/health-checks#kubernetes-trong-1-phut',
  },
  'warm-up': {
    title: 'Warm-up',
    full: 'khởi động nóng',
    group: 'Quy trình & khác',
    def: 'Giai đoạn sau khi process chạy nhưng chưa sẵn sàng phục vụ: load cache, mở connection, JIT compile code.',
  },
  'cold start': {
    title: 'Cold start',
    group: 'Quy trình & khác',
    def: 'Lần khởi động từ trạng thái nguội (chưa có cache, chưa JIT, chưa có connection), thường chậm hơn nhiều so với lúc app đã chạy ổn định.',
  },
  'graceful shutdown': {
    title: 'Graceful shutdown',
    full: 'tắt êm',
    group: 'Quy trình & khác',
    def: 'Khi bị tắt, app ngừng nhận request mới nhưng cho các request đang chạy dở hoàn tất, rồi mới thoát.',
  },
  'circuit breaker': {
    title: 'Circuit breaker',
    full: 'cầu dao',
    group: design,
    def: 'Sau nhiều lần gọi một dependency thất bại liên tiếp, tạm **ngừng gọi** một lúc thay vì tiếp tục dồn request vào chỗ đang hỏng, rồi thử lại sau.',
  },
  invariant: {
    title: 'Invariant',
    full: 'điều kiện luôn đúng',
    group: design,
    def: 'Quy tắc mà object phải luôn thoả sau mỗi thao tác (vd payout đã `Approved` thì không duyệt lần nữa). Entity tự bảo vệ invariant của nó.',
  },
  bcl: {
    title: 'BCL',
    full: 'Base Class Library',
    group: 'Runtime & build',
    def: 'Thư viện chuẩn đi kèm .NET: `string`, `List<T>`, `File`, `HttpClient`... Không cần cài thêm package.',
  },
}

export default terms
