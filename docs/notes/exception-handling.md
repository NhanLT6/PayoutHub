# Exception handling trong ASP.NET Core

Note ngắn để ôn. Lý thuyết nền: sổ tay **7.2** (middleware, thứ tự), **7.3** (filter), **7.5** (xử lý lỗi), **8.2** (lifetime).

## 1. Bài toán

Code ở đâu đó ném exception mà không ai bắt. Nếu không xử lý gì:
- Client nhận 500 với body rỗng, hoặc (ở Development) cả trang stack trace.
- Mỗi controller lại tự `try/catch` một kiểu, format lỗi không thống nhất.

Mục tiêu: **một chỗ duy nhất** bắt mọi exception chưa xử lý, log đầy đủ ở server, trả cho client JSON chuẩn mà không lộ chi tiết nội bộ.

So với Web Forms: tương đương `Application_Error` trong `Global.asax` cộng với `customErrors` trong `Web.config`, nhưng nằm trong pipeline và test được.

## 2. Ba mảnh ghép

| Mảnh | Đăng ký | Vai trò |
|---|---|---|
| `ExceptionHandlerMiddleware` | `app.UseExceptionHandler()` | Cái `try/catch` lớn bọc phần pipeline phía sau nó |
| `IExceptionHandler` | `builder.Services.AddExceptionHandler<T>()` | Code của bạn: quyết định log gì, trả status gì |
| `IProblemDetailsService` | `builder.Services.AddProblemDetails()` | Biết cách ghi ProblemDetails JSON ra response, tự thêm `traceId` |

`UseExceptionHandler()` không tham số mà thiếu cả handler lẫn `AddProblemDetails()` → app **ném lỗi lúc start**. Đây là fail-fast giống `ValidateOnStart`.

## 3. Luồng chạy

```
Request
  │
  ▼
UseExceptionHandler ── try {
  │                       next(context)  ──►  middleware khác ──► endpoint ──► throw!
  │                    } catch (ex) {                                            │
  │                       ◄──────────────── exception bay ngược lên ─────────────┘
  │                       1. Response đã bắt đầu gửi? → không làm gì được, ném tiếp
  │                       2. Xoá response, set status 500
  │                       3. Gọi lần lượt từng IExceptionHandler (theo thứ tự đăng ký)
  │                            handler trả true  → dừng, coi như xong
  │                            handler trả false → thử handler kế tiếp
  │                       4. Không ai trả true → IProblemDetailsService ghi response mặc định
  │                    }
  ▼
Response
```

Những điểm hay bị hỏi:

- **Middleware chỉ bắt được lỗi của những gì đứng sau nó.** Vì vậy `UseExceptionHandler` đặt **gần đầu pipeline nhất**. Lab 1 của M1 chứng minh điều này.
- **`Response.HasStarted`**: một khi header đã gửi đi (ví dụ đang stream file) thì không đổi status code được nữa. Middleware chỉ còn cách ném tiếp và kết nối bị cắt.
- **Chỉ áp dụng cho HTTP request.** Exception trong `BackgroundService` (M4) hay task fire-and-forget **không** đi qua đây; phải tự `try/catch` và log trong đó.
- **Ở Development**, `WebApplication` tự thêm Developer Exception Page ở ngoài cùng. Vì `UseExceptionHandler` nằm bên trong nên nó bắt trước; trang stack trace chỉ hiện nếu handler của bạn không xử lý.

## 4. Hợp đồng của `IExceptionHandler`

```csharp
ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken ct);
```

- **`true`** = "tôi đã xử lý xong và đã ghi response". Middleware dừng, không gọi handler khác.
- **`false`** = "không phải việc của tôi". Middleware thử handler kế tiếp, cuối cùng là response mặc định.
- Nếu handler ghi response bằng `TryWriteAsync`, hãy **return kết quả của nó**: ghi không được thì để fallback lo, đừng nói dối là `true`.
- Method là async: mọi lời gọi async bên trong phải được `await`. Không `await` = fire-and-forget, response có thể chưa ghi xong khi request đã kết thúc.

**Bẫy .NET 10:** khi handler trả `true`, middleware **không tự log** exception nữa (trước .NET 10 thì có, dẫn tới log trùng). Muốn đổi hành vi thì cấu hình `ExceptionHandlerOptions.SuppressDiagnosticsCallback`. Hệ quả thực tế: handler global **phải tự log**.

## 5. Log thế nào cho đúng

- Dùng overload có `Exception` làm tham số **đầu tiên**: `LogError(exception, "template", args...)`. Stack trace và inner exception đi kèm theo object exception.
- Template phải là **chuỗi cố định**. Không đưa `exception.Message` vào làm template:
  - mỗi lỗi một template khác nhau → hệ thống log không gom nhóm được;
  - message chứa `{` hoặc `}` sẽ bị hiểu nhầm là placeholder.
- Thêm field có ích cho việc tra cứu: HTTP method, path, `TraceIdentifier`. Xem 7.7.

## 6. Response trả về client

ProblemDetails (RFC 7807, nay là RFC 9457) là format JSON chuẩn cho lỗi HTTP:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.6.1",
  "title": "An error occurred while processing your request.",
  "status": 500,
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
}
```

- `title`: mô tả ngắn, **cố định** theo loại lỗi.
- `detail`: chi tiết cho lần xảy ra này. Ở Production **không** chứa `exception.Message`, vì message có thể chứa connection string, tên bảng, dữ liệu khách hàng.
- `traceId`: client báo lỗi kèm id này, bạn tìm lại đúng dòng log ở server. Đây là cầu nối giữa "client thấy ít" và "server log đủ".
  - Log chỉ mang trace id khi logger bật **scopes** (`IncludeScopes = true` cho console formatter; Seq/OpenTelemetry thường bật sẵn). Không bật thì log không có gì để nối.
  - `traceId` trong response là W3C `traceparent` đầy đủ: `00-<trace-id 32 hex>-<span-id 16 hex>-<flags>`. Trong log, field `TraceId` chỉ là **phần giữa** (32 hex). Tìm theo phần đó.
- `type`: để `null` thì `AddProblemDetails` tự điền link RFC theo status code.
- Muốn thêm field chung cho mọi lỗi (ví dụ `instance`), dùng `AddProblemDetails(o => o.CustomizeProblemDetails = ctx => ...)`.

## 7. Nhiều handler: map exception nghiệp vụ sang status code (M3)

Mỗi loại lỗi một handler nhỏ, đăng ký **từ cụ thể đến chung**:

```
AddExceptionHandler<NotFoundExceptionHandler>()     // NotFoundException      → 404, return true; còn lại → false
AddExceptionHandler<ConflictExceptionHandler>()     // InvalidStateException → 409, return true; còn lại → false
AddExceptionHandler<GlobalExceptionHandler>()       // mọi thứ còn lại       → 500, luôn xử lý
```

- Đây là **OCP** (2.8): thêm loại lỗi mới bằng một class mới, không sửa handler cũ.
- Thứ tự đăng ký chính là thứ tự chạy. Đặt global lên đầu thì các handler sau không bao giờ được gọi.
- Trade-off: dùng exception để báo lỗi nghiệp vụ (không tìm thấy, sai trạng thái) thì đơn giản nhưng exception tốn chi phí và ẩn luồng điều khiển. Cách thay thế là Result pattern (method trả `Result<T>`). Với project này, exception + handler là đủ; nhắc trade-off khi phỏng vấn.

## 8. Middleware hay exception filter?

| | `IExceptionHandler` (middleware) | `IExceptionFilter` (MVC filter) |
|---|---|---|
| Phạm vi | Mọi request: controller, Minimal API, middleware khác | Chỉ lỗi trong action/filter của MVC |
| Biết action nào | Không (chỉ có `HttpContext`) | Có (`ActionDescriptor`, `ModelState`) |
| Dùng khi | Xử lý lỗi toàn cục (mặc định nên chọn) | Cần xử lý riêng cho một nhóm controller |

Chi tiết: 7.3.

## 9. Lỗi không phải exception

404 do sai route, 405 sai method... không có exception nào được ném, nên `IExceptionHandler` không chạy. Muốn chúng cũng trả ProblemDetails thì thêm `app.UseStatusCodePages()` (đi cùng `AddProblemDetails`). Lỗi validation của `[ApiController]` thì đã tự trả `ValidationProblemDetails` (400).

## 10. Tự kiểm tra

1. Vì sao `UseExceptionHandler` phải đứng gần đầu pipeline?
2. `TryHandleAsync` trả `true` / `false` khác nhau thế nào? Khi nào nên trả `false`?
3. Ở .NET 10, nếu handler trả `true` mà không tự log thì chuyện gì xảy ra?
4. `AddExceptionHandler<T>` đăng ký `T` với lifetime nào? Inject `DbContext` vào handler thì sao?
5. Client báo "tôi bị lỗi 500", bạn tìm log tương ứng bằng cách nào?
6. Exception ném trong `BackgroundService` có đi qua handler này không?

<details>
<summary>Đáp án</summary>

1. Middleware chỉ bọc được phần pipeline đứng sau nó; lỗi ở middleware đứng trước sẽ không bị bắt.
2. `true`: đã xử lý và đã ghi response, dừng chuỗi handler. `false`: bỏ qua, để handler kế tiếp hoặc response mặc định lo. Trả `false` khi exception không thuộc loại handler này phụ trách, hoặc khi ghi response thất bại.
3. Exception biến mất khỏi log: client nhận 500 nhưng server không có dấu vết gì.
4. **Singleton.** Inject `DbContext` (scoped) vào singleton là captive dependency (8.2): ở Development, scope validation làm app lỗi lúc start; nếu tắt validation thì một `DbContext` bị dùng chung giữa mọi request, không thread-safe. Nếu thật sự cần service scoped thì lấy qua `httpContext.RequestServices`.
5. Lấy phần trace id (32 hex ở giữa) của `traceId` trong response, tìm theo field `TraceId` trong hệ thống log. Điều kiện: logger phải bật scopes, nếu không log không chứa trace id.
6. Không. Middleware chỉ bọc HTTP request; background work phải tự `try/catch` và log.

</details>
