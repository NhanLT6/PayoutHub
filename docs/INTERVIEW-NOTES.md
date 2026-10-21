# Câu hỏi phỏng vấn đáng nhớ

Ghi ngắn gọn các câu hỏi phát sinh trong lúc làm PayoutHub. Mỗi câu: ý chính + ví dụ từ project. Mới nhất ở cuối từng nhóm.
Mã trong ngoặc là mục sổ tay (`handbook-index.md`).

---

## Configuration & Options

### `IOptions` vs `IOptionsSnapshot` vs `IOptionsMonitor`? (M1)

| | Lifetime | Giá trị tính khi nào | Nhận config mới khi file đổi? |
|---|---|---|---|
| `IOptions<T>` | Singleton | Một lần, lần đầu được đọc | Không, tới khi restart |
| `IOptionsSnapshot<T>` | Scoped | Mỗi scope (mỗi request) một lần; cố định trong suốt request | Có, từ request sau |
| `IOptionsMonitor<T>` | Singleton | Mỗi lần đọc `.CurrentValue` | Có, ngay lập tức; có `OnChange` |

- Singleton (vd `BackgroundService`) không inject được `IOptionsSnapshot` (captive dependency) → dùng `IOptionsMonitor`.
- Bẫy: đọc `CurrentValue` một lần trong constructor rồi lưu vào field thì chẳng khác gì `IOptions`.
- **PayoutHub:** `PayoutOptions` dùng `IOptions` vì chưa có yêu cầu đổi lúc chạy. FakeBank đọc `FailureRate` bằng `IOptionsMonitor` để đổi tỷ lệ lỗi khi đang chạy lab (M4).

### Finance muốn đổi `MinAmount` mà không restart. Nếu `generate` đang chạy dở thì sao? (M1)

- Code phải dùng sẵn `IOptionsSnapshot`/`IOptionsMonitor`. Deploy code mới thì vốn đã là restart.
- Rủi ro thật: đọc `CurrentValue` trong vòng lặp thì nửa số affiliate xét theo giá trị cũ, nửa theo giá trị mới → một kỳ chạy với hai quy tắc. Sửa: đọc **một lần** ở đầu thao tác, hoặc dùng `IOptionsSnapshot` (cố định trong request).
- Mức senior: `MinAmount` là **tham số nghiệp vụ** → nên lưu trong DB theo kỳ hiệu lực (`EffectiveFrom`): Finance tự đổi, có audit, chạy lại kỳ cũ vẫn ra đúng kết quả. `appsettings` dành cho tham số **kỹ thuật** (timeout, URL, retry).

### Validate config khi khởi động? (M1)

- `AddOptions<T>().BindConfiguration(...).ValidateDataAnnotations().ValidateOnStart()`. Thiếu `ValidateOnStart` thì lỗi chỉ lộ ra ở lần đầu đọc options, có thể là lúc chạy payout thật.
- `[Range]` không nhận `decimal` trực tiếp vì tham số attribute không được là `decimal` → `Range(typeof(decimal), "min", "max")`. Muốn loại trừ cận: `MinimumIsExclusive = true` (.NET 8+). Rule phức tạp: `.Validate(lambda)` hoặc `IValidateOptions<T>`.
- Cận trên hợp lý (không phải `MaxValue`) để chặn gõ nhầm số 0.

---

## Dependency Injection

### Captive dependency là gì? (8.2)

- Service sống lâu giữ dependency sống ngắn → dependency bị "giam", sống lâu hơn dự kiến.
- Kinh điển: singleton giữ `DbContext` (scoped) → một `DbContext` dùng chung mọi request, không thread-safe, change tracker phình, dữ liệu cũ.
- Quy tắc: chỉ inject lifetime **bằng hoặc dài hơn**. Development tự bật `ValidateScopes` để phát hiện.
- `IOptionsMonitor` inject vào singleton được vì chính nó là singleton và không giữ service scoped nào.

---

## C# & Runtime

### `string?` hay `string = string.Empty` cho field bắt buộc? (5.2)

- `string?` nói null là trạng thái hợp lệ → sai ý nghĩa, mọi chỗ dùng phải check null vô ích.
- Field luôn có giá trị: `string X { get; set; } = string.Empty;` + `[Required]`. `[Required]` mặc định từ chối cả chuỗi rỗng.

### Native AOT là gì? (3.1)

- Biên dịch thẳng ra mã máy lúc publish, thay vì IL + JIT lúc chạy.
- Lợi: khởi động gần như tức thì, ít RAM, không cần cài runtime → serverless, container scale nhanh, CLI.
- Giá: hạn chế reflection và sinh code động (trimming). MVC Controllers **không** hỗ trợ AOT; Minimal API hỗ trợ (dùng source generator).

---

## ASP.NET Core

### Controllers hay Minimal API? Minimal API có dùng cho app lớn được không? (7.4)

- Cả hai cùng chạy trên routing và middleware của ASP.NET Core, đều dùng được cho app lớn.
- Controllers **áp sẵn cấu trúc** (convention, filter, model binding). Minimal API thì **phải tự đặt cấu trúc**: chia theo feature, `MapGroup`, `IEndpointFilter`, `TypedResults`.
- Minimal API bắt buộc khi cần Native AOT.
- Trade-off: Minimal API linh hoạt hơn nhưng không có convention thì dễ loạn nhanh khi team đông; Controllers cũng xuống cấp được (controller phình to).
- Câu trả lời mẫu: "Team lớn, nhiều người mới, chưa có convention → Controllers, vì framework áp cấu trúc thay team. Minimal API khi team đã thống nhất cách tổ chức, hoặc cần AOT."
- **PayoutHub:** API chính dùng Controllers để luyện filter và model binding; FakeBank vài endpoint nên dùng Minimal API.

### Tổ chức Minimal API ở app lớn thế nào? (7.4)

```
src/PayoutHub.Api/
├── Program.cs                  ← đăng ký service, gọi app.MapPayoutEndpoints()
├── Endpoints/
│   └── Payouts/
│       ├── PayoutEndpoints.cs  ← khai báo các route của /payouts, gắn auth/filter chung
│       ├── GeneratePayouts.cs  ← POST /payouts/generate: gom conversion thành payout theo kỳ
│       └── ApprovePayout.cs    ← POST /payouts/{id}/approve: Finance duyệt một payout
└── Filters/
    └── AuditFilter.cs          ← ghi log ai đã gọi endpoint nào (IEndpointFilter)
```

- Chia theo feature, mỗi feature một extension method `MapXxxEndpoints`. Feature nhỏ: một file chứa cả route lẫn handler. Feature lớn: mỗi endpoint một file theo REPR.
- Giữ trật tự: viết convention thành tài liệu, có code mẫu, review chặt; có thể thêm architecture test hoặc dùng FastEndpoints.

| Controllers | Minimal API |
|---|---|
| `[Route]`, `[Authorize]` ở cấp class | `MapGroup()` + `.RequireAuthorization()` |
| Action filter | `IEndpointFilter` + `.AddEndpointFilter<T>()` |
| Inject qua constructor, dùng chung mọi action | Inject qua tham số từng handler |
| `IActionResult` | `Results<Ok<T>, NotFound>` + `TypedResults` (OpenAPI biết chính xác kiểu trả về) |
| `[ApiController]` tự trả 400 khi model sai | `AddValidation()` (.NET 10) |

### Controller có quá nhiều dependency trong constructor thì xử lý thế nào? (8.5)

- **Constructor overloading:** chạy được nhưng vô dụng. Container chọn constructor trước khi action chạy, không biết request gọi action nào; nó lấy constructor nhiều tham số nhất mà resolve được hết, hai constructor ngang nhau thì ném exception.
- **Property injection:** container mặc định không hỗ trợ (cần Autofac); ẩn dependency, dễ null.
- **Cách đúng:**
  1. Inject vào tham số action (`[FromServices]`; từ .NET 7 với `[ApiController]` không cần ghi attribute).
  2. **Tách controller theo trách nhiệm (SRP)**: sửa gốc rễ. Khoảng 5–6 dependency trở lên là dấu hiệu làm quá nhiều việc.
  3. Gom vào service có nghiệp vụ thật (`PayoutApprovalService`), không phải class "bao tải" chứa service.
- **Không** dùng `HttpContext.RequestServices` trong action (service locator).
- Minimal API chỉ **giấu triệu chứng**: feature cần 10 dependency vẫn là thiết kế có vấn đề.

---

## Logging

### Vì sao dùng message template thay vì string interpolation? (7.7)

- Template giữ giá trị thành **field riêng** (`State.MinAmount`). Hệ thống log (Seq, Elastic, App Insights) index field đó → lọc `MinAmount > 500`, group/count theo `PayoutId`. Interpolation chỉ còn một chuỗi phẳng → chỉ full-text search hoặc regex, không so sánh số được.
- Bẫy: placeholder bind theo **vị trí**, không theo tên. Tên chỉ là tên field trong log → đảo thứ tự tham số là log sai âm thầm. `{0}` thì field tên là `0`, vô dụng khi query. Analyzer CA2017 báo lệch số lượng.
- Kiểu dữ liệu giữ nguyên: truyền `decimal` thì field là số; truyền chuỗi từ `IConfiguration` thì là string, so sánh số có thể sai.
- Hiệu năng: interpolation luôn ghép chuỗi kể cả khi level bị tắt. Mức senior: `[LoggerMessage]` source generator, sinh code lúc compile, check `IsEnabled`, không boxing, kiểm tra placeholder khớp tham số (CA1848 gợi ý).
- `ILogger<T>`: `T` thành **category** (tên đầy đủ của class), dùng để lọc level theo tiền tố namespace trong `Logging:LogLevel`.

### User báo lỗi 500, bạn tìm log tương ứng thế nào? (7.5, 7.7)

- ProblemDetails trả `traceId` (W3C `traceparent`: `00-<trace-id 32 hex>-<span-id 16 hex>-<flags>`). Client gửi id đó khi báo lỗi.
- Log phải mang trace id: ASP.NET Core đặt `TraceId`/`SpanId` vào **log scope** của request; formatter phải in scopes (`AddJsonConsole(o => o.IncludeScopes = true)`, mặc định tắt). Tìm theo phần trace-id 32 hex trong Seq/Elastic.
- Mở rộng: `HttpClient` tự gửi header `traceparent` sang service khác (PayoutHub → FakeBank ở M4), nên một trace-id nối log của cả chuỗi gọi (distributed tracing). Trong .NET, span = `System.Diagnostics.Activity`.
- Trade-off/bẫy: response chỉ lộ id, không lộ chi tiết lỗi; chi tiết nằm ở server log. Quên bật scopes thì có id mà không có gì để nối.
