# Từ viết tắt và thuật ngữ

Tra nhanh, mỗi dòng một ý. Xếp theo nhóm, trong nhóm theo ABC. Mã trong ngoặc là mục sổ tay.

## Runtime & build

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| AOT | Ahead-of-Time (Native AOT) | Biên dịch thẳng ra mã máy lúc publish; khởi động nhanh, ít RAM; hạn chế reflection (3.1) |
| BCL | Base Class Library | Thư viện chuẩn có sẵn của .NET (`System.*`), vd `System.ComponentModel.DataAnnotations` |
| CLR | Common Language Runtime | Môi trường chạy code .NET: JIT, GC, quản lý thread (3.1) |
| GC | Garbage Collector | Bộ thu gom bộ nhớ tự động (3.4) |
| IL | Intermediate Language | Mã trung gian do compiler C# sinh ra, JIT dịch sang mã máy (3.1) |
| JIT | Just-in-Time | Dịch IL sang mã máy lúc chạy (3.1) |
| LOH | Large Object Heap | Vùng heap cho object ≥ 85 KB, GC dọn ít hơn; hay gặp khi build chuỗi/mảng lớn (3.4) |
| SDK | Software Development Kit | Bộ công cụ build .NET (`dotnet` CLI); khác runtime chỉ để chạy |

## Thiết kế & nguyên tắc

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| DI | Dependency Injection | Container tạo và đưa dependency vào class thay vì class tự `new` (8.1) |
| DIP | Dependency Inversion Principle | Phụ thuộc vào abstraction; Core khai báo interface, Infrastructure implement (2.8) |
| DTO | Data Transfer Object | Object chỉ chứa dữ liệu để trả ra/nhận vào API, tách khỏi entity |
| DRY / KISS / YAGNI | Don't Repeat Yourself / Keep It Simple, Stupid / You Aren't Gonna Need It | (2.10) |
| OCP | Open/Closed Principle | Mở để mở rộng, đóng để sửa; thêm Wise = thêm class, không sửa `switch` (2.8) |
| REPR | Request–Endpoint–Response | Mỗi endpoint một file gồm Request, handler, Response; hay dùng với Minimal API |
| SOLID | SRP, OCP, LSP, ISP, DIP | 5 nguyên tắc thiết kế hướng đối tượng (2.8) |
| SRP | Single Responsibility Principle | Mỗi class chỉ có một lý do để thay đổi (2.8) |

## Web & API

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| HMAC | Hash-based Message Authentication Code | Chữ ký tạo từ nội dung + secret chung; dùng verify webhook (M5) |
| JWT | JSON Web Token | Token chứa claim (user, role) có chữ ký; dùng cho authentication (M3) |
| OpenAPI | (trước đây gọi là Swagger) | Chuẩn mô tả API dạng JSON; sinh tài liệu, client |
| ProblemDetails | RFC 7807 / RFC 9457 | Format JSON chuẩn cho lỗi HTTP: `type`, `title`, `status`, `detail` (7.5) |
| REST | Representational State Transfer | Kiểu thiết kế API theo resource + HTTP method + status code (7.6) |

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
