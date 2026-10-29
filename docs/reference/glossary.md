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
| DI | Dependency Injection | Dependency được đưa từ ngoài vào (thường qua constructor) thay vì class tự `new` ([DI hoạt động thế nào](/aspnet-core/dependency-injection)) |
| DIP | Dependency Inversion Principle | Phụ thuộc vào abstraction; Core khai báo interface, Infrastructure implement ([SOLID](/dotnet/oop-fundamentals#solid)) |
| DTO | Data Transfer Object | Object chỉ chứa dữ liệu để trả ra/nhận vào API, tách khỏi entity |
| DRY / KISS / YAGNI | Don't Repeat Yourself / Keep It Simple, Stupid / You Aren't Gonna Need It | ([DRY, KISS, YAGNI](/dotnet/oop-fundamentals#dry-kiss-yagni)) |
| IoC | Inversion of Control | Framework gọi code của bạn thay vì ngược lại; DI là một dạng IoC ([DI hoạt động thế nào](/aspnet-core/dependency-injection)) |
| OCP | Open/Closed Principle | Mở để mở rộng, đóng để sửa; thêm Wise = thêm class, không sửa `switch` ([SOLID](/dotnet/oop-fundamentals#solid)) |
| REPR | Request–Endpoint–Response | Mỗi endpoint một file gồm Request, handler, Response; hay dùng với Minimal API |
| SOLID | SRP, OCP, LSP, ISP, DIP | 5 nguyên tắc thiết kế hướng đối tượng ([SOLID](/dotnet/oop-fundamentals#solid)) |
| SRP | Single Responsibility Principle | Mỗi class chỉ có một lý do để thay đổi ([SOLID](/dotnet/oop-fundamentals#solid)) |

## Web & API

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| HMAC | Hash-based Message Authentication Code | Chữ ký tạo từ nội dung + secret chung; dùng verify webhook (M5) |
| JWT | JSON Web Token | Token `header.payload.signature` chứa claim (user, role), **ký nhưng không mã hoá**; dùng cho authentication (M3) ([Authentication](/aspnet-core/api-security#step-7)) |
| NAT | Network Address Translation | Router dùng một IP public cho nhiều máy bên trong; muốn vào từ ngoài phải mở port forwarding ([Lớp chặn trước Kestrel](/runtime/async-flow#step-3)) |
| OpenAPI | (trước đây gọi là Swagger) | Chuẩn mô tả API dạng JSON; sinh tài liệu, client |
| ProblemDetails | RFC 7807 / RFC 9457 | Format JSON chuẩn cho lỗi HTTP: `type`, `title`, `status`, `detail` ([Validation và xử lý lỗi](/aspnet-core/exception-handling#validation-errors)) |
| REST | Representational State Transfer | Kiểu thiết kế API theo resource + HTTP method + status code ([Thiết kế REST](/aspnet-core/questions#rest-design)) |
| Span | (OpenTelemetry) | Một bước công việc trong một trace (xử lý request, gọi DB, gọi FakeBank); .NET gọi là `Activity` |
| TLS | Transport Layer Security | Lớp mã hoá của HTTPS; Kestrel hoặc reverse proxy giải mã; chỉ bảo vệ dữ liệu trên đường truyền ([HTTPS / TLS](/aspnet-core/api-security#step-1)) |
| Trace | (distributed tracing) | Toàn bộ hành trình của một thao tác, có thể đi qua nhiều service; gồm nhiều span lồng nhau |
| traceparent | W3C Trace Context | Header/chuỗi `version-traceId-spanId-flags`, mang trace id đi giữa các service |
| WAF | Web Application Firewall | Firewall hiểu HTTP, soi URL/header/body tìm pattern tấn công (SQL injection, XSS); không thay validation trong code ([WAF](/aspnet-core/api-security#step-3)) |

## Bảo mật

Xem cả luồng: [Bảo mật API: một request đi qua những lớp nào](/aspnet-core/api-security).

| Viết tắt | Đầy đủ | Nghĩa ngắn |
|---|---|---|
| APIM | Azure API Management | API gateway của Azure: auth, rate limit, routing cho nhiều API ([Gateway](/aspnet-core/api-security#step-4)) |
| BAA | Business Associate Agreement | Hợp đồng bắt buộc với bên xử lý PHI cho khách hàng y tế (HIPAA) ([HIPAA](/aspnet-core/api-security#hipaa)) |
| BOLA / IDOR | Broken Object Level Authorization / Insecure Direct Object Reference | Đổi id trong URL để truy cập object của người khác; số 1 OWASP API Top 10 ([IDOR](/aspnet-core/api-security#step-9)) |
| CA | Certificate Authority | Tổ chức được browser tin, ký certificate cho tên miền ([HTTPS / TLS](/aspnet-core/api-security#step-1)) |
| CDN | Content Delivery Network | Mạng server ở edge, gần user; cache file tĩnh, đứng trước app để lọc traffic ([CDN và DDoS](/aspnet-core/api-security#step-2)) |
| CORS | Cross-Origin Resource Sharing | Server cho phép origin khác đọc response; luật của browser, **không** bảo vệ server ([CORS](/aspnet-core/api-security#step-6)) |
| CSP | Content-Security-Policy | Header giới hạn nguồn script/style browser được chạy; lớp thứ hai chống XSS ([Injection, CSRF, XSS](/aspnet-core/api-security#step-10)) |
| CSRF | Cross-Site Request Forgery | Site khác gửi request kèm cookie tự động của user; chặn bằng SameSite, antiforgery token ([Injection, CSRF, XSS](/aspnet-core/api-security#step-10)) |
| DDoS | Distributed Denial of Service | Nhiều máy cùng gửi traffic rác để làm sập server ([CDN và DDoS](/aspnet-core/api-security#step-2)) |
| DLP | Data Loss Prevention | Phát hiện và chặn dữ liệu nhạy cảm đi ra ngoài (email, upload, công cụ AI) ([Data security](/aspnet-core/api-security#data-controls)) |
| DNS | Domain Name System | Đổi tên miền thành địa chỉ IP ([HTTPS / TLS](/aspnet-core/api-security#step-1)) |
| Entra ID | Microsoft Entra ID (trước đây Azure AD) | IdP của Microsoft: đăng nhập, MFA, cấp JWT ([Authentication](/aspnet-core/api-security#step-7)) |
| HIPAA | Health Insurance Portability and Accountability Act | Luật Mỹ bảo vệ dữ liệu sức khoẻ (PHI) ([HIPAA](/aspnet-core/api-security#hipaa)) |
| HSTS | HTTP Strict Transport Security | Header bắt browser chỉ gọi domain này bằng HTTPS ([HTTPS / TLS](/aspnet-core/api-security#step-1)) |
| IdP | Identity Provider | Hệ thống quản lý đăng nhập và cấp token (Entra ID, Auth0, Keycloak) ([Authentication](/aspnet-core/api-security#step-7)) |
| Key Vault | Azure Key Vault | Dịch vụ lưu secret, khoá, certificate, có phân quyền và audit ([DB và secret](/aspnet-core/api-security#step-11)) |
| Managed identity | — | Danh tính Azure cấp cho app để vào Key Vault, Azure SQL mà không cần mật khẩu trong config ([DB và secret](/aspnet-core/api-security#step-11)) |
| MFA | Multi-Factor Authentication | Đăng nhập cần thêm yếu tố ngoài mật khẩu ([Authentication](/aspnet-core/api-security#step-7)) |
| MITM | Man-in-the-Middle | Kẻ đứng giữa đường đọc/sửa traffic; TLS chặn ([HTTPS / TLS](/aspnet-core/api-security#step-1)) |
| OAuth 2.0 | — | Chuẩn để app xin access token gọi API thay mặt user ([Authentication](/aspnet-core/api-security#step-7)) |
| OIDC | OpenID Connect | Lớp đăng nhập trên OAuth 2.0, trả ID token mô tả user ([Authentication](/aspnet-core/api-security#step-7)) |
| OWASP | Open Worldwide Application Security Project | Tổ chức công bố danh sách lỗ hổng phổ biến (Top 10, API Top 10) ([OWASP API Top 10](/aspnet-core/api-security#owasp-api-top-10)) |
| PCI DSS | Payment Card Industry Data Security Standard | Tiêu chuẩn bắt buộc khi lưu, xử lý số thẻ ([Phân loại dữ liệu](/aspnet-core/api-security#data-classification)) |
| PHI | Protected Health Information | Thông tin sức khoẻ gắn với một người; HIPAA bảo vệ ([Phân loại dữ liệu](/aspnet-core/api-security#data-classification)) |
| PII | Personally Identifiable Information | Thông tin nhận diện được một người: tên, email, số tài khoản ([Phân loại dữ liệu](/aspnet-core/api-security#data-classification)) |
| RBAC | Role-Based Access Control | Phân quyền theo role (Finance được approve) ([Authorization](/aspnet-core/api-security#step-8)) |
| SIEM | Security Information and Event Management | Gom log nhiều nguồn để phát hiện tấn công, tạo alert (Microsoft Sentinel) ([Audit log](/aspnet-core/api-security#step-13)) |
| SQLi | SQL injection | Input bị nối chuỗi vào SQL thành lệnh; chặn bằng parameterized query ([Injection, CSRF, XSS](/aspnet-core/api-security#step-10)) |
| SSRF | Server-Side Request Forgery | Server bị lừa gọi URL do kẻ tấn công chọn ([OWASP API Top 10](/aspnet-core/api-security#owasp-api-top-10)) |
| TDE | Transparent Data Encryption | Mã hoá file database và backup trên đĩa (encryption at rest); Azure SQL bật mặc định ([DB và secret](/aspnet-core/api-security#step-11)) |
| VNet | Azure Virtual Network | Mạng riêng trên Azure; app và DB nằm trong, không có IP public ([Gateway](/aspnet-core/api-security#step-4)) |
| XSS | Cross-Site Scripting | Script do kẻ tấn công chèn chạy trong browser người xem; chặn bằng output encoding, CSP ([Injection, CSRF, XSS](/aspnet-core/api-security#step-10)) |

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
