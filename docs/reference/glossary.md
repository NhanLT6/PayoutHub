# Từ viết tắt và thuật ngữ

Tra nhanh, mỗi dòng một ý. Xếp theo nhóm, trong nhóm theo ABC. Mã trong ngoặc là mục sổ tay.

## Runtime & build

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| AOT | Ahead-of-Time (Native AOT) | Biên dịch thẳng ra mã máy lúc publish; khởi động nhanh, ít RAM; hạn chế reflection ([CLR, IL, JIT](/runtime/memory#clr-il-jit)) |
| BCL | Base Class Library | Thư viện chuẩn có sẵn của .NET (`System.*`), vd `System.ComponentModel.DataAnnotations` |
| CLR | Common Language Runtime | Môi trường chạy code .NET: JIT, GC, quản lý thread ([CLR, IL, JIT](/runtime/memory#clr-il-jit)) |
| GC | Garbage Collector | Bộ thu gom bộ nhớ tự động ([GC](/runtime/memory#gc)) |
| IL | Intermediate Language | Mã trung gian do compiler C# sinh ra, JIT dịch sang mã máy ([CLR, IL, JIT](/runtime/memory#clr-il-jit)) |
| JIT | Just-in-Time | Dịch IL sang mã máy lúc chạy ([CLR, IL, JIT](/runtime/memory#clr-il-jit)) |
| LOH | Large Object Heap | Vùng heap cho object ≥ 85 KB, GC dọn ít hơn; hay gặp khi build chuỗi/mảng lớn ([GC](/runtime/memory#gc)) |
| SDK | Software Development Kit | Bộ công cụ build .NET (`dotnet` CLI); khác runtime chỉ để chạy |

## Thiết kế & nguyên tắc

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| DI | Dependency Injection | Dependency được đưa từ ngoài vào (thường qua constructor) thay vì class tự `new` ([DI hoạt động thế nào](/aspnet-core/notes/how-di-works)) |
| DIP | Dependency Inversion Principle | Phụ thuộc vào abstraction; Core khai báo interface, Infrastructure implement ([SOLID](/dotnet/classic-questions#solid)) |
| DTO | Data Transfer Object | Object chỉ chứa dữ liệu để trả ra/nhận vào API, tách khỏi entity |
| DRY / KISS / YAGNI | Don't Repeat Yourself / Keep It Simple, Stupid / You Aren't Gonna Need It | ([DRY, KISS, YAGNI](/dotnet/classic-questions#dry-kiss-yagni)) |
| IoC | Inversion of Control | Framework gọi code của bạn thay vì ngược lại; DI là một dạng IoC ([DI hoạt động thế nào](/aspnet-core/notes/how-di-works)) |
| OCP | Open/Closed Principle | Mở để mở rộng, đóng để sửa; thêm Wise = thêm class, không sửa `switch` ([SOLID](/dotnet/classic-questions#solid)) |
| REPR | Request–Endpoint–Response | Mỗi endpoint một file gồm Request, handler, Response; hay dùng với Minimal API |
| SOLID | SRP, OCP, LSP, ISP, DIP | 5 nguyên tắc thiết kế hướng đối tượng ([SOLID](/dotnet/classic-questions#solid)) |
| SRP | Single Responsibility Principle | Mỗi class chỉ có một lý do để thay đổi ([SOLID](/dotnet/classic-questions#solid)) |

## Web & API

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| HMAC | Hash-based Message Authentication Code | Chữ ký tạo từ nội dung + secret chung; dùng verify webhook (M5) |
| JWT | JSON Web Token | Token chứa claim (user, role) có chữ ký; dùng cho authentication (M3) |
| OpenAPI | (trước đây gọi là Swagger) | Chuẩn mô tả API dạng JSON; sinh tài liệu, client |
| ProblemDetails | RFC 7807 / RFC 9457 | Format JSON chuẩn cho lỗi HTTP: `type`, `title`, `status`, `detail` ([Validation và xử lý lỗi](/aspnet-core/questions#validation-errors)) |
| REST | Representational State Transfer | Kiểu thiết kế API theo resource + HTTP method + status code ([Thiết kế REST](/aspnet-core/questions#rest-design)) |
| Span | (OpenTelemetry) | Một bước công việc trong một trace (xử lý request, gọi DB, gọi FakeBank); .NET gọi là `Activity` |
| Trace | (distributed tracing) | Toàn bộ hành trình của một thao tác, có thể đi qua nhiều service; gồm nhiều span lồng nhau |
| traceparent | W3C Trace Context | Header/chuỗi `version-traceId-spanId-flags`, mang trace id đi giữa các service |

## Dữ liệu

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| EF Core | Entity Framework Core | ORM của .NET hiện đại |
| ISO 4217 | — | Chuẩn mã tiền tệ 3 chữ cái: VND, USD, EUR |
| ORM | Object-Relational Mapper | Map bảng DB ↔ class C# |

## Quy trình & khác

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| CI/CD | Continuous Integration / Continuous Delivery | Tự động build, test, deploy khi push code |
| NFC / NFD | Normalization Form Composed / Decomposed | Unicode dựng sẵn vs tổ hợp; NFD làm dấu tiếng Việt bị tách |
| PO / BA | Product Owner / Business Analyst | Vai trò nắm nghiệp vụ, viết yêu cầu |
| PR | Pull Request | Yêu cầu merge code, kèm review |
