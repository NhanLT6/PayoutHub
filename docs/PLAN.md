<!--suppress LanguageDetectionInspection -->
# Kế hoạch PayoutHub

Ngân sách: khoảng 4 tuần, tối đa khoảng 3 giờ mỗi ngày, có thể ngắt quãng.
Mỗi milestone kết thúc bằng `/mock Mx` (10–15 phút), rồi `/wrap`.

**Cách đọc:** mỗi bước có dòng `→` giải thích làm gì và vì sao. Lab là phần **cố tình làm sai** để thấy lỗi tận mắt, vì đó là chất liệu tốt nhất để kể khi phỏng vấn. "Ôn" là mã mục trong sổ tay (`handbook-index.md`).

## Domain

| Khái niệm | Mô tả |
|---|---|
| **Merchant** | Thương hiệu trả commission cho affiliate |
| **Affiliate** | Người giới thiệu đơn hàng, nhận commission. Có một phương thức nhận tiền: Bank, PayPal hoặc Wise, kèm thông tin tương ứng |
| **Conversion** | Một đơn hàng được ghi nhận. Có `CommissionAmount`, `Currency`. Trạng thái: `Pending → Approved` hoặc `Declined` (merchant duyệt) |
| **Payout** | Gom các Conversion đã `Approved` của một affiliate trong một kỳ. Trạng thái: `Draft → PendingApproval → Approved → Processing → Paid` hoặc `Failed` |
| **FakeBank** | API giả lập nhà cung cấp: `POST /transfers` (nhận header `Idempotency-Key`), độ trễ và tỷ lệ lỗi cấu hình được, gọi webhook về PayoutHub khi xử lý xong |

**Rule nghiệp vụ:**
- Chỉ role `Finance` được duyệt payout.
- Một conversion chỉ thuộc tối đa một payout.
- Payout dưới `MinAmount` (đọc từ config) thì không tạo; số dư dồn sang kỳ sau.
- Không có payout nào được chuyển tiền hai lần.

**Luồng tổng thể:** merchant duyệt conversion → Finance chạy *generate* gom thành payout theo kỳ → Finance *approve* → worker nền gọi FakeBank chuyển tiền → FakeBank gọi webhook báo `Paid`/`Failed` → báo cáo, export.

## Lịch

| Tuần | Milestone |
|---|---|
| 1 | M1, M2 |
| 2 | M3 |
| 3 | M4, M5 |
| 4 | M6, M7, phỏng vấn tổng |

Nếu bị trễ: M5 bỏ phần outbox; M7 chỉ làm export dạng streaming. Không cắt M3 và M4, vì đây là phần quan trọng nhất cho phỏng vấn.

---

## M1: Khung solution (khoảng 1–2 ngày)

**Mục tiêu:** solution chạy được, có các thành phần nền mà mọi API thật đều cần. Chưa có nghiệp vụ.
**Xong khi:** app khởi động được; config sai thì app **không** khởi động; lỗi bất kỳ trả về JSON ProblemDetails thay vì stack trace; `/health` trả `Healthy`.

- [x] Tạo solution, các project và reference đúng chiều như trong `CLAUDE.md`
  → Core không biết gì về EF hay ASP.NET; Core khai báo interface, Infrastructure implement (DIP).
- [ ] `Program.cs`: đăng ký service, dựng middleware pipeline
  → Bước này hoàn thiện dần qua các bước dưới. Xong khi bạn giải thích được vì sao từng `Use...` đứng ở vị trí đó.
- [x] Options pattern: `PayoutOptions` (`MinAmount`, `DefaultCurrency`) đọc từ `appsettings.json`, có validate khi khởi động
  → Thay cho `ConfigurationManager.AppSettings["..."]` kiểu Web.config: config thành class có kiểu, inject qua DI. Validate lúc start để config sai thì chết ngay khi deploy, không phải lúc chạy payout đầu tiên. Biết phân biệt `IOptions` / `IOptionsSnapshot` / `IOptionsMonitor`.
- [x] Structured logging với `ILogger<T>`
  → Log dạng message template (`"Approved payout {PayoutId}"`), không dùng string interpolation, để log tìm/lọc được theo field. Cấu hình log level theo namespace trong `appsettings`.
- [ ] Xử lý lỗi toàn cục: `IExceptionHandler` + ProblemDetails
  → Một chỗ duy nhất bắt exception chưa xử lý, log lại và trả JSON chuẩn (RFC 7807). Không lộ stack trace ra ngoài. Sau này map exception nghiệp vụ sang 404/409 cũng ở đây.
- [ ] Health check endpoint
  → `/health` cho load balancer hoặc Kubernetes biết app còn sống. Tạm thời chỉ kiểm tra app; check DB thêm sau khi có DB ở M2.

**Lab:**
1. Đặt `UseExceptionHandler` **sau** một middleware ném lỗi: lỗi không được bắt, vì middleware chỉ bọc được những gì đứng sau nó.
2. (Có thể dời sang M3 khi đã có JWT) Đảo thứ tự `UseAuthentication` / `UseAuthorization`: authorization chạy khi chưa biết user là ai → luôn 401.

**Ôn:** 1.3–1.6, 7.1, 7.2, 7.5, 7.7

## M2: Domain + EF Core (khoảng 3 ngày)

**Mục tiêu:** domain có encapsulation thật, có dữ liệu đủ lớn để thấy vấn đề hiệu năng.
**Xong khi:** không thể đổi trạng thái entity ngoài method nghiệp vụ; DB tạo được bằng migration; endpoint phân trang trả nhanh trên 100.000 dòng.

- [ ] Entity với `private set` và method nghiệp vụ (`Approve`, `Decline`...), không để public setter
  → Rule nằm trong entity (vd `Approve()` chỉ hợp lệ khi đang `Pending`, sai thì ném exception), không rải trong controller. Đây là ví dụ thật cho Encapsulation (2.1).
- [ ] Value object `Money` (amount + currency) dạng `record`
  → Không cộng nhầm USD với EUR; so sánh theo giá trị nhờ record (2.5). Map vào EF bằng owned type / complex type.
- [ ] `DbContext` cấu hình bằng Fluent API, migration
  → Cấu hình (độ dài cột, precision của `decimal`, index, quan hệ) đặt ở Infrastructure, không gắn attribute vào entity của Core. Migration thay cho việc chạy script SQL bằng tay.
- [ ] Seed: khoảng 50 merchant, 2.000 affiliate, 100.000 conversion
  → Đủ lớn để thấy N+1 và query chậm. Insert theo lô, không `SaveChanges` từng dòng.
- [ ] `GET /affiliates/{id}/conversions` có phân trang và projection sang DTO
  → `Select` thẳng sang DTO để SQL chỉ lấy các cột cần, không load cả entity. Biết offset (`Skip/Take`) chậm ở trang sâu và keyset pagination là gì.

**Lab:**
1. Tạo N+1 (truy vấn trong vòng lặp), bật log SQL để đếm số query. Sửa bằng `Include` hoặc projection.
2. Gọi `AsEnumerable()` quá sớm rồi đo thời gian và bộ nhớ: phần `Where` sau đó chạy trong RAM thay vì trong SQL (6.4).
3. So sánh tracking với `AsNoTracking`: query chỉ đọc không cần change tracker.

**Ôn:** 2.1, 2.5, 2.6, 6.4, 6.5, 6.7

## M3: Tạo và duyệt payout (khoảng 3–4 ngày)

**Mục tiêu:** phần nghiệp vụ chính, có auth và concurrency.
**Xong khi:** đủ rule nghiệp vụ ở trên; sai role → 403; duyệt trùng cùng lúc → chỉ một request thành công, request kia nhận 409.

- [ ] `POST /payouts/generate?period=2026-10`: gom conversion đã duyệt thành payout cho từng affiliate
  → Chạy lại cùng kỳ không được tạo trùng (conversion đã thuộc payout thì bỏ qua). Tổng dưới `MinAmount` thì không tạo. Gom bằng query trong SQL, không kéo 100.000 dòng lên RAM.
- [ ] `POST /payouts/{id}/approve`, `POST /payouts/{id}/reject`
  → Controller mỏng, gọi method nghiệp vụ trên entity. Chuyển trạng thái không hợp lệ (vd approve một payout đã `Paid`) → 409.
- [ ] JWT: endpoint cấp token cho môi trường dev, role `Finance` và `Ops`, policy-based authorization
  → Phân biệt authentication (bạn là ai) với authorization (bạn được làm gì). Dùng policy (`[Authorize(Policy = "CanApprovePayout")]`) thay vì rải tên role khắp nơi.
- [ ] `IPayoutMethod` cho Bank / PayPal / Wise (phí + validate) theo Open/Closed
  → Thêm phương thức mới = thêm một class, không sửa `switch`. Chọn implementation qua DI (nhiều implementation hoặc keyed service, 8.4).
- [ ] Trả đúng status code: 400, 403, 404, 409
  → 400 dữ liệu vào sai; 401 chưa đăng nhập; 403 đăng nhập rồi nhưng không đủ quyền; 404 không tồn tại; 409 xung đột trạng thái hoặc concurrency.

**Lab:**
1. Bắn 2 request duyệt cùng lúc để thấy payout bị duyệt 2 lần, rồi sửa bằng `rowversion` (optimistic concurrency) và trả 409.
2. Đăng ký một singleton giữ `DbContext` (captive dependency). Ở môi trường Development, `ValidateScopes`/`ValidateOnBuild` đã bật sẵn nên app báo lỗi ngay; chạy thử với Production để thấy lỗi lọt qua.

**Ôn:** 2.8, 2.9, 4.11, 7.3, 7.6, 8.1–8.4

## M4: Thực thi payout (khoảng 4 ngày)

**Mục tiêu:** xử lý nền, gọi hệ thống ngoài, async đúng cách.
**Xong khi:** approve trả về ngay, việc chuyển tiền chạy nền; FakeBank lỗi hoặc chậm thì có retry, timeout, circuit breaker; retry không làm chuyển tiền 2 lần; tắt app thì job dừng gọn.

- [ ] Tạo project `FakeBank.Api`
  → Minimal API giả lập ngân hàng: `POST /transfers`, độ trễ và tỷ lệ lỗi chỉnh qua config, nhớ `Idempotency-Key` đã xử lý.
- [ ] Hàng đợi `Channel<int>` + `BackgroundService`; mỗi job tự tạo scope riêng
  → Request approve chỉ đẩy id vào channel rồi trả 202. Worker là singleton nên không inject `DbContext` (scoped) trực tiếp được; mỗi job tạo scope qua `IServiceScopeFactory`.
- [ ] Typed `HttpClient` + resilience handler (retry, timeout, circuit breaker)
  → `IHttpClientFactory` tránh cạn socket khi `new HttpClient()` liên tục. Retry cho lỗi tạm thời; circuit breaker ngừng gọi khi bên kia đang sập.
- [ ] Idempotency key = id của payout
  → Retry `POST` mà bên kia đã xử lý rồi thì FakeBank trả lại kết quả cũ, không chuyển lần nữa. Đây là cách bảo đảm rule "không chuyển tiền hai lần".
- [ ] `CancellationToken` đi xuyên suốt các tầng
  → Từ controller/worker → service → EF/HttpClient. Client huỷ request hoặc app tắt thì công việc dừng thay vì chạy tiếp vô ích.
- [ ] Chạy cả batch bằng `Parallel.ForEachAsync` có giới hạn số luồng đồng thời
  → `MaxDegreeOfParallelism` để không bắn 2.000 request cùng lúc vào FakeBank. Phân biệt concurrency với parallelism (4.4).

**Lab:**
1. Dùng `.Result` dưới tải để thấy thread pool starvation, quan sát bằng `dotnet-counters`. ASP.NET Core không có `SynchronizationContext` nên không deadlock như ASP.NET cũ, nhưng vẫn chết vì cạn thread (4.5, 4.6).
2. Retry `POST` khi không có idempotency key, để FakeBank chuyển tiền 2 lần.
3. FakeBank trả lời chậm, để quan sát timeout và circuit breaker.

**Ôn:** 4.1–4.11, 7.8

## M5: Webhook và độ tin cậy (khoảng 3 ngày)

**Mục tiêu:** nhận kết quả từ hệ thống ngoài một cách an toàn, chịu được gửi trùng và gửi sai thứ tự.
**Xong khi:** webhook giả mạo bị từ chối; cùng một event gửi 2 lần chỉ xử lý 1 lần; event cũ đến muộn không ghi đè trạng thái mới.

- [ ] FakeBank gọi webhook về PayoutHub khi chuyển xong hoặc thất bại
  → Payout chuyển `Processing → Paid` hoặc `Failed` dựa trên webhook, không dựa trên response của `POST /transfers`.
- [ ] Verify chữ ký HMAC của webhook
  → FakeBank ký body bằng secret chung; PayoutHub tính lại và so sánh bằng hàm so sánh constant-time. Không có thì ai cũng gọi được endpoint để đánh dấu `Paid`.
- [ ] Xử lý trùng: lưu id các event đã xử lý, có unique index
  → Webhook thường gửi "ít nhất một lần". Unique index trong DB là chốt chặn cuối, kể cả khi 2 request trùng đến cùng lúc.
- [ ] (Tuỳ chọn) Bảng outbox để gửi thông báo "payout đã trả"
  → Ghi thông báo vào bảng trong **cùng transaction** với việc cập nhật payout, worker gửi sau. Tránh trường hợp DB đã lưu mà thông báo bị mất, hoặc ngược lại.
- [ ] `IMemoryCache` cho phần tra cứu affiliate, có invalidation khi dữ liệu đổi
  → Cache giảm tải DB, nhưng phải xoá cache khi affiliate đổi thông tin nhận tiền, nếu không sẽ chuyển tiền vào tài khoản cũ.

**Lab:** gửi cùng một webhook 2 lần; gửi sai thứ tự (`Failed` đến sau `Paid`).
**Ôn:** 7.9, 7.10

## M6: Test (khoảng 2–3 ngày)

**Mục tiêu:** có lưới an toàn cho các rule quan trọng, chứng minh được bằng test rằng bug concurrency đã được sửa.
**Xong khi:** `dotnet test` xanh; test bắt được lỗi duyệt 2 lần khi revert phần sửa ở M3.

- [ ] Unit test state machine của `Payout` và phần tính phí
  → Test thuần Core, không DB, chạy rất nhanh: mọi chuyển trạng thái hợp lệ/không hợp lệ, phí của từng `IPayoutMethod`.
- [ ] Integration test bằng `WebApplicationFactory` cho luồng duyệt, có cả case concurrency
  → Dựng cả app trong memory, gọi HTTP thật qua pipeline (auth, filter, EF). Dùng SQL Server local với database test riêng, tạo lại mỗi lần chạy.
- [ ] Fake gateway thay cho FakeBank khi test
  → Thay implementation gateway qua DI trong test, nhờ Core chỉ phụ thuộc interface (DIP giúp test được).

**Lab:** tạm revert phần sửa ở M3, viết test bắt được lỗi duyệt 2 lần, rồi khôi phục lại phần sửa.
**Ôn:** 2.8 (DIP và testability)

## M7: Báo cáo và hiệu năng (khoảng 2–3 ngày)

**Mục tiêu:** query báo cáo nặng chạy trong SQL, xuất file lớn mà bộ nhớ không phình.
**Xong khi:** báo cáo đúng số liệu; export 100.000 dòng mà bộ nhớ gần như không tăng theo số dòng.

- [ ] `GET /reports/commissions?month=`: top affiliate theo từng merchant và running total, dùng window function trong SQL
  → `ROW_NUMBER()/RANK() OVER (PARTITION BY merchant ...)` và `SUM(...) OVER (ORDER BY ...)`. Viết SQL tay và map kết quả qua EF, vì LINQ không diễn đạt tốt phần này.
- [ ] Export CSV với 100.000 dòng
  → Đọc từ DB và ghi thẳng ra response theo từng dòng, không gom cả file vào RAM rồi mới trả.

**Lab:** so sánh `string +=`, `StringBuilder` và streaming thẳng ra `Response.Body` bằng `IAsyncEnumerable`. Đo bằng `dotnet-counters` và `dotnet-gcdump`, quan sát LOH và số lần GC (3.4–3.8).
**Ôn:** 3.4–3.8, 6.7

## Kết thúc

- [ ] `/mock full`: phỏng vấn tổng 45–60 phút
- [ ] Chuyển sổ tay thành cheatsheet, mỗi mục kèm ví dụ lấy từ PayoutHub

---

## Parking lot

Những ý tưởng hay nhưng không phục vụ mục tiêu học hiện tại. Xem lại sau khi xong M7.

-
