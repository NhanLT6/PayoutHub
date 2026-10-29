import type { TermDef } from './types'

const design = 'Thiết kế & nguyên tắc' as const
const runtime = 'Runtime & build' as const
const web = 'Web & API' as const
const other = 'Quy trình & khác' as const

const terms: Record<string, TermDef> = {
  // Dependency Injection
  'di container': {
    title: 'DI container',
    full: 'bộ chứa DI',
    group: design,
    def: 'Công cụ đọc constructor, tự dựng cả cây object, quản lý lifetime và dispose. Trong ASP.NET Core là `IServiceProvider` dựng từ `IServiceCollection`.',
    link: '/aspnet-core/dependency-injection',
  },
  'pure di': {
    title: 'Pure DI',
    group: design,
    def: 'Làm [[DI]] bằng tay, không dùng container: `Main` tự `new` cả cây object từ lá lên gốc.',
    link: '/aspnet-core/dependency-injection',
  },
  'composition root': {
    title: 'Composition root',
    group: design,
    def: '**Một chỗ duy nhất** biết mọi class cụ thể và ghép chúng lại. Trong PayoutHub là `Program.cs` của project Api.',
    link: '/aspnet-core/dependency-injection',
  },
  'service locator': {
    title: 'Service locator',
    group: design,
    def: 'Class tự đi xin dependency bằng `GetService` thay vì được đưa vào. Đảo ngược lại [[IoC]]: dependency bị giấu, thiếu đăng ký chỉ lộ lúc chạy.',
    link: '/aspnet-core/dependency-injection',
  },
  'anti-pattern': {
    title: 'Anti-pattern',
    group: design,
    def: 'Cách làm nghe hợp lý, hay gặp, nhưng thường gây hại về lâu dài (khó test, khó đọc, giấu lỗi).',
  },
  poco: {
    title: 'POCO',
    full: 'Plain Old CLR Object',
    group: design,
    def: 'Class thường, chỉ chứa dữ liệu (property), không kế thừa class đặc biệt của framework nào.',
  },
  'thread-safe': {
    title: 'Thread-safe',
    group: runtime,
    def: 'Nhiều thread dùng chung một object cùng lúc mà không làm hỏng dữ liệu. Singleton có state bắt buộc phải thread-safe vì mọi request đều dùng chung nó.',
  },
  atomic: {
    title: 'Atomic',
    group: 'Dữ liệu',
    def: 'Một nhóm thao tác hoặc thành công cả nhóm, hoặc không cái nào được ghi. Không bao giờ dừng ở trạng thái dở dang.',
  },
  'memory leak': {
    title: 'Memory leak',
    full: 'rò rỉ bộ nhớ',
    group: runtime,
    def: 'Object không còn cần nhưng vẫn bị giữ tham chiếu nên [[GC]] không thu hồi được. Bộ nhớ của app tăng dần theo thời gian.',
  },
  scrutor: {
    title: 'Scrutor',
    group: other,
    def: 'Thư viện bên ngoài thêm cho container của Microsoft hai thứ: quét assembly để đăng ký hàng loạt, và `Decorate<>()` để bọc decorator.',
  },
  decorator: {
    title: 'Decorator',
    group: design,
    def: 'Class bọc quanh một class khác cùng interface để thêm hành vi (cache, log) mà không sửa class gốc.',
  },
  'method injection': {
    title: 'Method injection',
    group: design,
    def: 'Dependency được đưa vào qua tham số của method thay vì constructor: tham số `InvokeAsync` của middleware, `[FromServices]` trong action, tham số lambda của Minimal API.',
  },
  'unit of work': {
    title: 'Unit of work',
    group: design,
    def: 'Gom nhiều thay đổi dữ liệu của một nghiệp vụ rồi ghi một lần trong một transaction. `DbContext` chính là một unit of work.',
  },

  // Options pattern
  'options pattern': {
    title: 'Options pattern',
    group: design,
    def: 'Bind một section của `IConfiguration` vào một class có kiểu, validate nó, rồi inject qua [[DI]] dưới dạng `IOptions<T>`.',
    link: '/aspnet-core/options-pattern',
  },
  iconfiguration: {
    title: 'IConfiguration',
    group: runtime,
    def: 'Cây key/value dạng chuỗi gom từ nhiều nguồn (appsettings, env var, command line). Đọc bằng `config["Payout:MinAmount"]`.',
    link: '/dotnet/framework-vs-core#configuration',
  },
  'web.config': {
    title: 'Web.config',
    group: runtime,
    def: 'File cấu hình XML của ASP.NET trên .NET Framework. Đọc qua `ConfigurationManager.AppSettings["key"]`, luôn ra chuỗi, tự parse.',
  },
  'magic string': {
    title: 'Magic string',
    group: design,
    def: 'Chuỗi cố định rải trong code (tên key config, tên route) mà gõ sai chính tả thì compiler không báo.',
  },
  'data annotations': {
    title: 'Data annotations',
    group: web,
    def: 'Attribute đặt trên property để khai báo rule validate: `[Required]`, `[Range]`, `[StringLength]`.',
  },
  validateonstart: {
    title: 'ValidateOnStart',
    group: runtime,
    def: 'Kéo thời điểm validate options về lúc host khởi động. Config sai thì app không lên được, thay vì đợi tới lần đầu có code đọc `.Value`.',
    link: '/aspnet-core/options-pattern#validation-timing',
  },
  idempotent: {
    title: 'Idempotent',
    full: 'luỹ đẳng',
    group: web,
    def: 'Gọi một thao tác nhiều lần cho cùng kết quả như gọi một lần. GET, PUT, DELETE là idempotent; POST thì không. Handler bị gọi lặp (retry, event bắn đôi) cũng cần idempotent.',
  },
  'idempotency key': {
    title: 'Idempotency key',
    group: web,
    def: 'Mã duy nhất client gửi kèm request (thường qua header). Server thấy key đã xử lý thì trả lại kết quả cũ, nên retry không tạo bản ghi hay chuyển tiền hai lần.',
  },

  // Logging
  'structured logging': {
    title: 'Structured logging',
    group: runtime,
    def: 'Mỗi dòng log là một bản ghi có field (`PayoutId`, `Amount`) mà hệ thống log lọc và đếm được, không chỉ là một chuỗi đọc bằng mắt.',
    link: '/aspnet-core/logging#message-template',
  },
  'message template': {
    title: 'Message template',
    group: runtime,
    def: 'Chuỗi log cố định có placeholder như `{PayoutId}`. Giá trị truyền kèm thành field riêng, bind theo **vị trí** chứ không theo tên.',
    link: '/aspnet-core/logging#message-template',
  },
  seq: {
    title: 'Seq',
    group: other,
    def: 'Server nhận và tìm kiếm log có cấu trúc. Cùng nhóm với Elastic (ELK) và Application Insights: nuốt trực tiếp log dạng JSON.',
  },
  'log category': {
    title: 'Category',
    group: runtime,
    def: 'Tên nhóm của một logger. `ILogger<T>` lấy tên đầy đủ của `T` (vd `PayoutHub.Api.GlobalExceptionHandler`); `Logging:LogLevel` lọc theo **tiền tố** category.',
    link: '/aspnet-core/logging#message-template',
  },
  'log scope': {
    title: 'Log scope',
    group: runtime,
    def: 'Bộ field gắn vào **mọi** dòng log trong một đoạn code mà không phải truyền vào từng lời gọi. Mở bằng `BeginScope`, đóng khi `Dispose`.',
    link: '/aspnet-core/logging#scopes',
  },
  activity: {
    title: 'Activity',
    full: 'System.Diagnostics.Activity',
    group: runtime,
    def: 'Đối tượng .NET đại diện cho một span trong trace. ASP.NET Core tạo một Activity cho mỗi request; `traceId` trong ProblemDetails và `TraceId` trong log scope cùng lấy từ đó.',
    link: '/aspnet-core/logging#trace-a-500',
  },
  traceparent: {
    title: 'traceparent',
    full: 'W3C Trace Context',
    group: web,
    def: 'Header chuẩn dạng `00-<trace-id 32 hex>-<span-id 16 hex>-<flags>`. Trace id dùng chung cả chuỗi gọi; mỗi bước (span) có span id riêng.',
    link: '/aspnet-core/logging#trace-a-500',
  },
  'distributed tracing': {
    title: 'Distributed tracing',
    full: 'truy vết phân tán',
    group: runtime,
    def: 'Theo một request đi qua nhiều service bằng cùng một trace id, để nối log của các service lại với nhau.',
  },
  'source generator': {
    title: 'Source generator',
    group: runtime,
    def: 'Thành phần chạy lúc compile, sinh thêm code C# từ code bạn viết. `[LoggerMessage]` dùng nó để sinh method log nhanh, không boxing, không parse template lúc chạy.',
  },
  analyzer: {
    title: 'Analyzer',
    group: runtime,
    def: 'Công cụ phân tích code lúc compile, cảnh báo lỗi hoặc gợi ý cải thiện với mã như `CA2017`, `CA1848`.',
  },

  // Câu hỏi ASP.NET Core khác
  'generic host': {
    title: 'Generic Host',
    group: runtime,
    def: 'Lớp nền quản lý [[DI]], config, logging và vòng đời của các `IHostedService`. Web app, worker service và console app dùng chung host này; web app chỉ thêm Kestrel.',
    link: '/aspnet-core/questions#startup',
  },
  repr: {
    title: 'REPR',
    full: 'Request-Endpoint-Response',
    group: design,
    def: 'Mẫu tổ chức Minimal API: mỗi endpoint một file, chứa request, handler và response của riêng nó.',
  },
  sigterm: {
    title: 'SIGTERM',
    group: runtime,
    def: 'Tín hiệu hệ điều hành yêu cầu process tắt gọn. Docker, Kubernetes gửi nó khi deploy; .NET host đáp lại bằng cách cancel `stoppingToken`.',
  },
  backoff: {
    title: 'Backoff và jitter',
    group: design,
    def: '**Backoff**: mỗi lần retry chờ lâu hơn lần trước. **Jitter**: cộng thêm độ lệch ngẫu nhiên để nhiều client không retry cùng một lúc.',
  },
  'cache stampede': {
    title: 'Cache stampede',
    group: design,
    def: 'Cache của một key nóng hết hạn, hàng trăm request cùng thấy miss và cùng query DB. Chống bằng cách chỉ cho một request nạp lại, còn lại chờ.',
    link: '/aspnet-core/questions#caching',
  },
  ttl: {
    title: 'TTL',
    full: 'Time To Live',
    group: design,
    def: 'Thời gian một mục cache được giữ trước khi tự hết hạn.',
  },
  redis: {
    title: 'Redis',
    group: 'Dữ liệu',
    def: 'Kho key/value chạy trong bộ nhớ, dùng làm cache dùng chung giữa nhiều instance.',
  },
  'n+1': {
    title: 'N+1 query',
    group: 'Dữ liệu',
    def: '1 query lấy danh sách rồi N query nữa, mỗi dòng một query, để lấy dữ liệu liên quan. Gộp lại bằng `Include` hoặc projection.',
  },
  'execution plan': {
    title: 'Execution plan',
    full: 'kế hoạch thực thi',
    group: 'Dữ liệu',
    def: 'Các bước SQL Server chọn để chạy một query (dùng index nào, join kiểu gì). Xem nó để biết vì sao query chậm.',
  },
  opentelemetry: {
    title: 'OpenTelemetry',
    group: other,
    def: 'Chuẩn mở để thu trace, metric và log từ app rồi gửi tới hệ thống quan sát như Application Insights, Jaeger.',
  },
  'application insights': {
    title: 'Application Insights',
    group: other,
    def: 'Dịch vụ giám sát của Azure: gom log, trace, metric và hiển thị thời gian request nằm ở code, DB hay API ngoài.',
  },
}

export default terms
