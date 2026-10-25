# Learning log

Mỗi phiên một mục, mới nhất ở cuối. Tối đa khoảng 15 dòng mỗi mục.

<!--
Mẫu:

## YYYY-MM-DD · M2
- **Đã làm:** ...
- **Khái niệm đã chạm:** [IEnumerable vs IQueryable](/dotnet/collections-linq#ienumerable-vs-iqueryable), [Deferred execution](/dotnet/collections-linq#deferred-execution), ...
- **Chỗ yếu:** ... (ôn lại ở đầu phiên sau)
- **Câu phỏng vấn đáng nhớ:** ...
- **Quiz / mock:** 4/5, sai câu về ...
- **Tiếp theo:** ...
-->

## Bối cảnh trước khi bắt đầu

- Đã đọc sổ tay tới khoảng mục [SOLID](/dotnet/oop-fundamentals#solid). Đã thảo luận kỹ các phần:
  - `new` (method hiding)
  - static được khởi tạo lúc nào
  - `readonly` chỉ khóa tham chiếu
  - `IReadOnlyList` vs `ReadOnlyCollection`
  - vì sao string là reference type
  - struct mutable
  - Tuple vs ValueTuple
  - so sánh bằng của record
  - `Distinct` / `IEqualityComparer`
  - Big-O
  - SRP (một lý do để thay đổi), OCP (ví dụ thêm Wise)
- Mục 3–8 mới đọc lướt hoặc chưa đọc.
- Đọc tài liệu dài thì buồn ngủ, nên chuyển sang học qua project, kết hợp quiz và phỏng vấn thử.

## 2026-10-17 · M1
- **Đã làm:** dựng solution `.slnx` với `src/` `tests/` `tools/` thật trên đĩa, reference đúng chiều; FakeBank là Minimal API. `PayoutOptions` ở Core + `BindConfiguration` / `ValidateDataAnnotations` / `ValidateOnStart`, đã thử config sai thì app dừng lúc start.
- **Khái niệm đã chạm:** [Configuration](/dotnet/framework-vs-core#configuration), [Nullable reference types](/dotnet/modern-csharp#nullable), [Primary constructor](/dotnet/modern-csharp#primary-ctor), [Controller vs Minimal API](/aspnet-core/questions#controllers-vs-minimal), [Captive dependency](/aspnet-core/dependency-injection#captive-dependency), [Quá nhiều dependency](/aspnet-core/dependency-injection#too-many-dependencies); Options pattern; Native AOT ([CLR, IL, JIT](/runtime/memory#clr-il-jit)).
- **Chỗ yếu:**
  - Nhầm `IOptionsSnapshot` "đọc lại mỗi lần có caller dùng"; đúng là mỗi scope/request một lần. Chưa tự nghĩ ra `IOptionsMonitor` dùng cho singleton.
  - Câu "đổi `MinAmount` không restart": trả lời "data bị hỏng" chung chung, chưa chỉ ra được rủi ro cụ thể (một kỳ chạy với hai giá trị) và cách đọc giá trị một lần.
  - Không biết `[Range]` cần `typeof(decimal)` vì attribute không nhận `decimal`; định dùng `string?` để tắt warning nullable.
  - Câu khởi động "vì sao Core không reference Infrastructure, Core lưu DB bằng cách nào" **chưa trả lời**.
- **Câu phỏng vấn đáng nhớ:** Finance đổi `MinAmount` không restart khi `generate` đang chạy (đã ghi ở [Options pattern](/aspnet-core/options-pattern#options-runtime-change)); Controllers vs Minimal API cho app lớn; controller nhiều dependency.
- **Quiz / mock:** câu `MinAmount` không restart: Gần đúng.
- **Tiếp theo:** xoá `TestController` + `/`, `/test2`; commit lần đầu; M1 bước 4 structured logging.

## 2026-10-18 · M1
- **Đã làm:** bước 4 structured logging: so sánh template vs interpolation qua `AddJsonConsole` (thấy `State.MinAmount`), cấu hình `Logging:LogLevel` theo namespace, lấy `IOptions<PayoutOptions>` từ `app.Services` để log config lúc start. Bước 5 mới có khung: `AddProblemDetails` + `AddExceptionHandler<GlobalExceptionHandler>` trong `Program.cs`, `GlobalExceptionHandler.cs` còn rỗng (chỉ có comment TODO). Sửa `handbook.html` thiếu `<meta charset="utf-8">`.
- **Khái niệm đã chạm:** [SOLID](/dotnet/oop-fundamentals#solid) (DIP, composition root), [Logging](/aspnet-core/logging#logging), [Captive dependency](/aspnet-core/dependency-injection#captive-dependency) (root provider vs scope), [Quá nhiều dependency](/aspnet-core/dependency-injection#too-many-dependencies) (service locator).
- **Chỗ yếu:**
  - Câu "Core lưu DB thế nào": đúng ý interface + DI, nhưng không biết **Api** là nơi nối interface với implement (composition root); không nêu được lợi ích chính là unit test Core bằng fake repository; coi circular reference là lý do thay vì hệ quả.
  - Nghĩ placeholder trong template bind **theo tên**; thực tế bind theo **vị trí**, tên chỉ là tên field.
  - Chưa biết cách hệ thống log (Seq/Elastic) lọc theo field.
  - Đọc config thô `app.Configuration["Payout:MinAmount"]` (ra `string`) dù đã có `PayoutOptions`; không biết lấy options trong `Program.cs` qua `app.Services.GetRequiredService`.
  - Đặt `"Payout": "Debug"` trong `appsettings.json` (production cũng Debug, key không khớp namespace `PayoutHub`).
- **Câu phỏng vấn đáng nhớ:** vì sao message template thay vì interpolation (đã ghi ở [Logging](/aspnet-core/logging#logging), kèm `[LoggerMessage]`).
- **Quiz / mock:** câu khởi động "Core lưu DB thế nào": Gần đúng.
- **Tiếp theo:** (máy khác) tiếp bước 5: điền `GlobalExceptionHandler` (log kèm exception, status code, ProblemDetails không lộ message, `TryWriteAsync`, ý nghĩa `return true/false`), đặt `app.UseExceptionHandler()` đúng chỗ, test bằng `/boom`; nhớ bẫy .NET 10 handler trả `true` thì middleware không tự log. Sau đó lab 1 của M1.

## 2026-10-19 · M1
- **Đã làm:** onboard máy mới (.NET 10.0.402 có sẵn, LocalDB có, chưa có Docker và `dotnet-ef`). Điền `GlobalExceptionHandler`: log kèm exception + `{Method} {Path}`, `await TryWriteAsync` và return kết quả của nó, `Detail` chỉ hiện message ở Development. `UseExceptionHandler()` lên đầu pipeline, thêm `/boom`. Bật `IncludeScopes` cho JSON console để log có `TraceId`. Thêm `docs/README.md` (mục lục chung), `docs/notes/exception-handling.md`.
- **Khái niệm đã chạm:** [Middleware](/aspnet-core/middleware#middleware), [Validation và xử lý lỗi](/aspnet-core/exception-handling#validation-errors), [Logging](/aspnet-core/logging#logging), [Captive dependency](/aspnet-core/dependency-injection#captive-dependency); ProblemDetails, `IExceptionHandler` true/false, W3C `traceparent` (trace / span / flags).
- **Chỗ yếu:**
  - Lần đầu quên `await` `TryWriteAsync` (fire-and-forget); sau đó viết `return await ValueTask.FromResult(true)`: chưa chắc `async` tự bọc giá trị return.
  - Che message ở `Title` nhưng vẫn lộ ở `Detail`.
  - Dùng `exception.Message` làm log template.
  - Không biết trace id nằm trong log scope, `AddJsonConsole` mặc định không in scopes.
- **Câu phỏng vấn đáng nhớ:** "User báo lỗi 500, tìm log thế nào?" (đã ghi ở [Logging](/aspnet-core/logging#find-log-500)).
- **Quiz / mock:** câu ôn "placeholder bind theo tên hay vị trí": Đúng.
- **Tiếp theo:** chạy `/boom`, so `TraceId` trong log với `traceId` trong response (phần 32 hex giữa). Lab 1 M1 (middleware ném lỗi đặt trước `UseExceptionHandler`). Câu còn mở: `AddExceptionHandler<T>` đăng ký lifetime gì, inject `DbContext` vào thì sao (note câu 4). Sau đó health check, rồi tick bước 5.

## 2026-10-22 → 23 · M1
- **Đã làm:** chuyển sang học qua project (cloud thread, Claude đọc repo trên máy). Lab 1 M1: middleware ném lỗi đặt trước `UseExceptionHandler` → Developer Exception Page, sau → ProblemDetails. Đã so `TraceId` ở `/boom`. Tick bước 5. Dựng site document VitePress (`pnpm docs:dev`), home mới thay `docs/README.md`, handbook cũ chuyển sang `docs/public/`. Note mới/viết lại theo format hình + Q&A: middleware-pipeline, health-checks, exception-handling. Thêm `.gitattributes` (CRLF/LF).
- **Khái niệm đã chạm:** [Middleware](/aspnet-core/middleware#middleware), [Filter](/aspnet-core/middleware#filters), [Captive dependency](/aspnet-core/dependency-injection#captive-dependency); pipeline = các hàm gọi lồng nhau; exception vs short-circuit; HSTS vs HttpsRedirection; CORS; vị trí `UseRateLimiter`; convention class vs `IMiddleware`; closure.
- **Chỗ yếu:**
  - Hiểu nhầm CORS lâu nay là filter chặn request ở server; đúng là server dặn browser, browser thực thi, không bảo vệ API.
  - Gộp exception với short-circuit thành một khái niệm; exception bỏ qua code sau `next` cho tới chỗ có `catch`.
  - Lab 1: gọi chung là "default exception của ASP.NET"; đúng là Developer Exception Page, chỉ có ở Development.
- **Câu phỏng vấn đáng nhớ:** liveness vs readiness, vì sao không đưa DB vào liveness (note health-checks).
- **Quiz / mock:** chưa.
- **Tiếp theo:** xoá middleware Lab 1 trong `Program.cs`, làm health check theo note health-checks mục 4, rồi giải thích thứ tự từng `Use...` trong `Program.cs` (tick bước 2), sau đó `/mock M1`. Đầu phiên: hỏi nhanh 1 câu về CORS hoặc exception vs short-circuit.

## 2026-10-24 · M1 (đọc tài liệu, chưa code)
- **Đã làm:** chuyển handbook cũ thành các trang VitePress theo chủ đề, bỏ mã mục (7.3...) và thay bằng link. Tổ chức lại `docs/` theo kiểu folder = URL = sidebar. Note mới: [DI hoạt động thế nào](/aspnet-core/dependency-injection), [Result pattern](/aspnet-core/result-pattern). Viết lại ví dụ trong [Exception handling](/aspnet-core/exception-handling) thành class đầy đủ. Thêm bài Aspire (tuỳ chọn) vào cuối M4.
- **Khái niệm đã chạm:** IoC / DI / DIP / container, [Service lifetime](/aspnet-core/dependency-injection#lifetimes); Result pattern và exception; `StatusCodeSelector`; rich và anemic domain model; C# 15 union types; F#; Aspire.
- **Chỗ yếu:** chưa có (phiên đọc và hỏi đáp).
- **Câu phỏng vấn đáng nhớ:** "IoC khác DI thế nào?", "Dùng exception hay Result cho lỗi nghiệp vụ?" (câu trả lời mẫu nằm trong 2 trang trên).
- **Quiz / mock:** chưa.
- **Tiếp theo:** đọc tiếp [Health check](/aspnet-core/health-checks) từ mục 4 "Áp dụng vào PayoutHub", rồi xoá middleware Lab 1 trong `Program.cs` và làm health check. Sau đó giải thích thứ tự từng `Use...` (tick bước 2) và `/mock M1`. Đầu phiên: hỏi nhanh 1 câu "IoC khác DI thế nào".

## 2026-10-24 (tối) · M1
- **Đã làm:** tự thêm health check (`AddHealthChecks()` + `MapHealthChecks("/health")`), middleware Lab 1 đã gỡ. Chưa commit code, chưa tick plan (chờ review). Tổ chức lại site: **mỗi chủ đề một trang** (bài học ở trên, câu phỏng vấn ở dưới), bỏ folder `notes/`. Các câu ASP.NET Core chưa có bài nằm tạm ở [Câu hỏi khác](/aspnet-core/questions). Quy ước giáo trình adaptive ghi trong `CLAUDE.md`.
- **Khái niệm đã chạm:** status health check do code check trả về, không do độ chậm ([Status đổi theo thời gian](/aspnet-core/health-checks)); startup probe; [Service lifetime](/aspnet-core/dependency-injection#lifetimes); atomic.
- **Chỗ yếu:**
  - Chọn lifetime theo "code chạy lúc nào" (exception xảy ra trong request nên handler là scoped). Đúng là theo việc object có giữ dữ liệu riêng của request không: `GlobalExceptionHandler` là singleton, `DbContext` là scoped.
  - Nghĩ "chưa ready" và Degraded được phân biệt bằng độ chậm.
- **Câu phỏng vấn đáng nhớ:** "Handler chạy trong request, vậy có phải scoped?" (khối Bẫy ở [Lifetimes](/aspnet-core/dependency-injection#lifetimes)).
- **Quiz / mock:** chưa. Còn treo 2 câu tự kiểm tra lifetime: (1) `PayoutApprovalService` chỉ phụ thuộc `IPayoutRepository` (dùng `DbContext`) thì lifetime gì; (2) `GlobalExceptionHandler` inject `DbContext` thì sao.
- **Tiếp theo:**
  1. Đầu phiên: trả lời 2 câu lifetime ở trên.
  2. Review diff health check (có một `using Microsoft.Extensions.Logging.Configuration` thừa), tự trả lời câu ở bước 3 mục M1 trong [Health check](/aspnet-core/health-checks), rồi tick bước "Health check endpoint".
  3. Giải thích thứ tự từng `Use...` trong `Program.cs` (tick bước 2), commit code M1.
  4. `/mock M1`.

## 2026-10-25 · M1 (xong code, mock M1)
- **Đã làm:** trả lời 2 câu lifetime treo (`PayoutApprovalService` scoped; inject `DbContext` vào `GlobalExceptionHandler` singleton là captive dependency, Development báo lỗi lúc start). Dọn `using` thừa, commit code M1 (`655b945`: health check `/health` + format `GlobalExceptionHandler`). Tick bước `Program.cs` và Health check. Tổ chức lại docs: trang mới [Options pattern](/aspnet-core/options-pattern), [Logging](/aspnet-core/logging); bỏ `interview-notes.md` (câu hỏi về đúng trang chủ đề); `classic-questions` → [OOP & C# cơ bản](/dotnet/oop-fundamentals). Thêm "Kubernetes trong 1 phút" vào [Health check](/aspnet-core/health-checks) và milestone **M8** (container, Kubernetes local, khái niệm microservices) vì chưa từng dùng K8s; ngân sách thành khoảng 4,5 tuần.
- **Khái niệm đã chạm:** [Options validation](/aspnet-core/options-pattern#options-validation), [IOptions / Snapshot / Monitor](/aspnet-core/options-pattern#options-interfaces), [Luồng exception](/aspnet-core/exception-handling#exception-flow), [Liveness và readiness](/aspnet-core/health-checks#liveness-vs-readiness), [Instance middleware](/aspnet-core/middleware#middleware-lifetime), [Tìm log cho lỗi 500](/aspnet-core/logging#find-log-500), [Route table](/aspnet-core/middleware#routing).
- **Chỗ yếu** (đã gài "Nhắc lại từ mock M1" vào bước code M2–M4 trong plan):
  - Đặt `DbContext` vào constructor của convention middleware; chưa biết `IMiddleware` tạo mới mỗi request và phải đăng ký DI. (→ M2 middleware audit)
  - Tìm log 500: chưa gọi tên W3C traceparent / trace-id, chưa có cách khi user không có traceId. (→ M3)
  - Luồng `/boom`: nghĩ các `IExceptionHandler` là các lớp pipeline; quên logic `detail` Dev/Prod của chính mình; `traceId` do `AddProblemDetails` tự thêm. (→ M3)
  - Options: thiếu lifetime của từng interface và cách sửa bẫy vòng lặp (đọc `CurrentValue` một lần). (→ M4 worker)
  - Liveness/readiness: đúng ý chính, thiếu readiness làm gì khi DB sập. (→ M2 health check)
  - Nghĩ thứ tự `Map...` quan trọng (thật ra route table + precedence); nghĩ scope validation bật ở mọi môi trường (chỉ Development). (→ M3, M2)
- **Câu phỏng vấn đáng nhớ:** "Finance đổi MinAmount khi generate đang chạy"; "DB sập thì mọi pod cùng not-ready, khác gì app sập?".
- **Quiz / mock:** `/mock M1`: Q1 validation 7, Q2 Options 8, Q3 luồng exception 6, Q4 DB trong liveness 8, Q5 DbContext trong middleware 3, Q6 tìm log 500 5.
- **Tiếp theo:** bắt đầu M2 (entity, `Money`, `DbContext` + migration). Đầu phiên: hỏi nhanh "convention middleware cần `PayoutDbContext` thì inject ở đâu, vì sao?".
