---
title: "ASP.NET Core"
---

# ASP.NET Core

Phần bị hỏi nhiều nhất trong vòng technical. Đối chiếu với Web Forms giúp bạn trả lời có chiều sâu thay vì chỉ đọc định nghĩa.

## App ASP.NET Core khởi động thế nào? {#startup}

::: tip Trả lời nhanh
`Program.cs` có hai phần. Phần 1: `WebApplication.CreateBuilder` dựng host, nạp config, logging, rồi đăng ký service vào DI. Phần 2: sau `builder.Build()`, dựng middleware pipeline và map endpoint, cuối cùng `app.Run()` để Kestrel bắt đầu nhận request.
:::

::: info Bản chất
```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký service (thay cho Application_Start + container ngoài)
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<IPayoutService, PayoutService>();

var app = builder.Build();

// 2. Pipeline (thay cho HttpModule + Global.asax events)
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

Bên dưới là **Generic Host**: thứ quản lý DI, config, logging và vòng đời của các `IHostedService`. Worker service hay console app dùng cùng host này, chỉ khác là không có web server. Mẫu cũ `Startup.cs` với `ConfigureServices`/`Configure` vẫn chạy được, chỉ là được gộp vào Program.cs từ .NET 6.
:::

## Middleware là gì? Thứ tự có quan trọng không? <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#middleware}

Note kèm hình: [Middleware pipeline](/aspnet-core/notes/middleware-pipeline).

::: tip Trả lời nhanh
Middleware là các bước nối tiếp nhau mà mọi request đi qua. Mỗi bước có thể xử lý trước, gọi bước kế tiếp (`next`), xử lý response sau khi bước kế tiếp xong, hoặc dừng luôn không gọi tiếp (short-circuit). Thứ tự đăng ký chính là thứ tự chạy, nên rất quan trọng: request đi xuôi, response đi ngược lại.
:::

::: info Bản chất
Thứ tự chuẩn (bỏ những cái app không dùng):

1. `UseExceptionHandler`: đứng đầu để bắt lỗi của mọi bước sau
2. `UseHsts`, `UseHttpsRedirection`
3. `UseStaticFiles`: trả file tĩnh sớm, không tốn công auth
4. `UseRouting`: xác định endpoint nào sẽ xử lý
5. `UseCors`
6. `UseAuthentication`: bạn là ai
7. `UseAuthorization`: bạn được làm gì (cần biết endpoint nên đứng sau routing)
8. `UseRateLimiter`, middleware tự viết
9. `MapControllers` / `MapGet`: endpoint, điểm cuối của pipeline

```csharp
public class CorrelationIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, ILogger<CorrelationIdMiddleware> logger)
    {
        var id = ctx.Request.Headers["X-Correlation-Id"].FirstOrDefault() ?? Guid.NewGuid().ToString();
        ctx.Response.Headers["X-Correlation-Id"] = id;
        using (logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = id }))
        {
            await next(ctx);   // phần trước: request; phần sau: response
        }
    }
}
app.UseMiddleware<CorrelationIdMiddleware>();
```
:::

::: details Ở dự án thật
Middleware là phiên bản hiện đại của HttpModule. `Application_BeginRequest` trong Global.asax hay một HttpModule ghi log hoặc kiểm tra IP giờ là một middleware. Khác biệt chính: HttpModule gắn vào các event cố định của IIS pipeline; middleware là chuỗi delegate do bạn tự sắp xếp, rõ ràng và test được.
:::

::: warning Bẫy & follow-up
**"Inject service scoped vào constructor của middleware được không?"**

Không. Middleware dạng thường chỉ được tạo một lần cho cả app, giống singleton. Service scoped phải nhận qua tham số của `InvokeAsync` như ví dụ trên, hoặc implement `IMiddleware` để được tạo theo từng request.

**"`Use`, `Run`, `Map` khác nhau thế nào?"**

`Use`: có `next`, gọi tiếp được. `Run`: điểm cuối, không gọi tiếp. `Map`/`MapWhen`: rẽ nhánh pipeline theo path hoặc điều kiện.

**"Sửa header sau khi đã gọi `next` được không?"**

Nếu response đã bắt đầu gửi về client thì không, sẽ ném lỗi. Kiểm tra `ctx.Response.HasStarted`, hoặc đăng ký `Response.OnStarting`.
:::

## Filter là gì? Khác middleware chỗ nào? {#filters}

::: tip Trả lời nhanh
Filter chạy **bên trong** MVC, quanh việc thực thi action, nên biết action nào, controller nào, model binding ra sao, ModelState hợp lệ không. Middleware chạy cho mọi request và chỉ thấy `HttpContext`. Logic chung cho cả app (log, correlation id) dùng middleware; logic cần ngữ cảnh action (validate, audit theo action) dùng filter.
:::

::: info Thứ tự chạy
1. **Authorization filter**
2. **Resource filter**: trước model binding, hợp cho cache
3. Model binding và validation
4. **Action filter**: trước và sau action
5. **Exception filter**: chỉ khi action hoặc filter trước nó ném lỗi
6. **Result filter**: trước và sau khi ghi kết quả

Minimal API không có MVC filter, thay vào đó là **endpoint filter** (`AddEndpointFilter`).
:::

::: warning Bẫy & follow-up
**"Exception filter có bắt được lỗi trong middleware không?"**

Không. Nó chỉ bắt lỗi trong phạm vi MVC. Lỗi toàn cục phải xử lý bằng `UseExceptionHandler`.
:::

## Controller hay Minimal API? {#controllers-vs-minimal}

::: tip Trả lời nhanh
Cả hai đều chạy trên cùng routing và DI. Minimal API (.NET 6+) gọn, nhẹ, khởi động nhanh, hợp với service nhỏ và endpoint đơn giản. Controller có sẵn nhiều thứ (filter, model binding phức tạp, conventions), quen thuộc với team lớn. Từ .NET 8, Minimal API đã đủ cho hầu hết trường hợp; chọn theo quy mô và thói quen của team.
:::

::: info Bản chất
```csharp
var payouts = app.MapGroup("/api/payouts").RequireAuthorization();

payouts.MapGet("/{id:int}", async (int id, IPayoutService svc, CancellationToken ct) =>
    await svc.GetAsync(id, ct) is { } p ? Results.Ok(p) : Results.NotFound());

payouts.MapPost("/", async (CreatePayoutRequest req, IPayoutService svc) =>
{
    var id = await svc.CreateAsync(req);
    return Results.Created($"/api/payouts/{id}", new { id });
});
```
:::

## Model binding, validation và xử lý lỗi {#validation-errors}

Note kèm hình: [Exception handling](/aspnet-core/notes/exception-handling).

::: tip Trả lời nhanh
Model binding lấy dữ liệu từ route, query, header, body, form và đổ vào tham số action. Với `[ApiController]`, nếu validation thất bại thì framework tự trả 400 kèm chi tiết lỗi theo chuẩn **ProblemDetails** (RFC 9457), không cần tự kiểm tra `ModelState.IsValid`. Lỗi không mong đợi thì để một chỗ xử lý toàn cục.
:::

::: info Bản chất
```csharp
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();  // .NET 8
app.UseExceptionHandler();

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch
        {
            NotFoundException       => (404, "Not found"),
            BusinessRuleException   => (409, ex.Message),
            _                       => (500, "Unexpected error"),
        };
        if (status == 500) logger.LogError(ex, "Unhandled exception");
        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = status, Title = title }, ct);
        return true;
    }
}
```
:::

::: warning Bẫy & follow-up
**"Có nên dùng exception cho lỗi nghiệp vụ không?"**

Đây là câu tranh luận. Exception đơn giản và đi xuyên qua các tầng, nhưng tốn chi phí và làm luồng code khó đoán. Cách khác là trả về kiểu Result (thành công hoặc lỗi kèm lý do). Nói được cả hai và chọn theo tần suất: lỗi xảy ra thường xuyên (validate) thì không nên dùng exception.

**"Có trả stack trace về client không?"**

Không bao giờ ở production: lộ cấu trúc code. Log đầy đủ phía server kèm trace id, client chỉ nhận thông báo chung và trace id đó để báo lại.
:::

## Thiết kế REST API: status code và các quy ước {#rest-design}

::: info Bản chất
| Code | Khi nào |
|---|---|
| 200 OK | Thành công, có body |
| 201 Created | Tạo mới thành công, kèm header `Location` |
| 204 No Content | Thành công, không có body (thường là DELETE, PUT) |
| 400 Bad Request | Dữ liệu gửi lên sai format hoặc không hợp lệ |
| 401 Unauthorized | Chưa xác thực (thiếu hoặc sai token) |
| 403 Forbidden | Đã xác thực nhưng không có quyền |
| 404 Not Found | Không có resource |
| 409 Conflict | Xung đột trạng thái: duyệt payout đã bị reject, sửa bản đã bị người khác sửa |
| 422 Unprocessable | Đúng format nhưng sai rule nghiệp vụ (có team dùng 400 cho trường hợp này) |
| 429 Too Many Requests | Vượt rate limit |
| 500 / 503 | Lỗi server / service tạm thời không phục vụ được |

- **Idempotent**: GET, PUT, DELETE gọi nhiều lần cho cùng kết quả. POST thì không, nên với thao tác nhạy cảm (tạo payout, thanh toán) dùng **idempotency key** gửi kèm request để retry không tạo bản ghi trùng.
- URL là danh từ số nhiều: `/payouts/42`, hành động nghiệp vụ đặc biệt có thể là `POST /payouts/42/approve`.
- Phân trang: `?page=2&pageSize=50`, hoặc cursor cho dữ liệu lớn. Versioning: qua URL `/v1/` hoặc header.
:::

::: warning Bẫy & follow-up
**"PUT và PATCH khác nhau thế nào?"**

PUT thay toàn bộ resource bằng nội dung gửi lên; PATCH chỉ sửa một phần.
:::

## Logging đúng cách {#logging}

::: tip Trả lời nhanh
Inject `ILogger<T>` và dùng **structured logging**: message template có placeholder, giá trị đi kèm thành field riêng để lọc và tìm kiếm trong hệ thống log (Seq, Elastic, Application Insights).
:::

::: info Bản chất
```csharp
// Đúng: PayoutId và Amount là field riêng, lọc được
logger.LogInformation("Payout {PayoutId} approved, amount {Amount}", payout.Id, payout.Amount);

// Sai: thành một chuỗi phẳng, không lọc theo PayoutId được, và luôn tốn công ghép chuỗi
logger.LogInformation($"Payout {payout.Id} approved, amount {payout.Amount}");
```
:::

::: warning Bẫy & follow-up
**"Cái gì không được log?"**

Mật khẩu, token, số thẻ, thông tin cá nhân nhạy cảm. Cẩn thận khi log nguyên object request.
:::

## Gọi API bên ngoài: `IHttpClientFactory` và resilience {#httpclientfactory}

::: tip Trả lời nhanh
`IHttpClientFactory` quản lý pool các handler bên dưới: tái sử dụng connection, nhưng vẫn xoay vòng định kỳ để cập nhật DNS. Đăng ký **typed client** để mỗi API bên ngoài có một class riêng, config base address, timeout và retry ở một chỗ.
:::

::: info Bản chất
```csharp
builder.Services.AddHttpClient<SeoDataClient>(c =>
{
    c.BaseAddress = new Uri("https://api.provider.com/");
    c.Timeout = TimeSpan.FromSeconds(30);
})
.AddStandardResilienceHandler();   // .NET 8: retry, circuit breaker, timeout có sẵn

public class SeoDataClient(HttpClient http)
{
    public Task<Ranking?> GetRankingAsync(string domain, CancellationToken ct) =>
        http.GetFromJsonAsync<Ranking>($"rankings?domain={domain}", ct);
}
```
:::

::: warning Bẫy & follow-up
**"Retry có nguy hiểm không?"**

Có, với request không idempotent (POST tạo đơn, chuyển tiền): retry có thể tạo bản ghi trùng. Chỉ retry tự động cho GET hoặc khi có idempotency key. Thêm backoff và jitter để không dồn dập vào service đang lỗi.

**"Circuit breaker để làm gì?"**

Khi service phía sau lỗi liên tục, ngắt mạch: fail ngay trong một khoảng thời gian thay vì tiếp tục chờ timeout, để không làm cạn thread và không đè thêm tải lên service đang lỗi. Hết thời gian thì thử lại vài request (half-open).
:::

## Caching trong ASP.NET Core {#caching}

::: tip Trả lời nhanh
| Loại | Dùng khi |
|---|---|
| `IMemoryCache` | Một instance, dữ liệu nhỏ, chấp nhận mỗi server một bản |
| `IDistributedCache` (Redis, SQL) | Nhiều instance cần thấy cùng dữ liệu, cache sống qua lần deploy |
| `HybridCache` (.NET 9) | Gộp cả hai tầng, có sẵn chống stampede |
| Output caching (.NET 7) | Cache nguyên response của endpoint phía server |
:::

::: warning Bẫy & follow-up
**"Cache stampede là gì?"**

Cache của một key nóng vừa hết hạn, hàng trăm request cùng lúc thấy miss và cùng query DB. Cách chống: chỉ cho một request nạp lại còn lại chờ (HybridCache làm sẵn), hoặc làm mới cache trước khi hết hạn.

**"Khó nhất của cache là gì?"**

Invalidation: khi dữ liệu gốc đổi thì xóa cache thế nào cho đúng và kịp. Trả lời thực tế: chọn TTL theo mức độ chấp nhận dữ liệu cũ của nghiệp vụ, và xóa chủ động ở luồng ghi với dữ liệu quan trọng.
:::

## "API chậm dần khi traffic tăng, bạn xử lý thế nào?" <Badge type="warning" text="câu tình huống" /> {#slow-api}

::: tip Trả lời nhanh
Đo trước, đoán sau. Xác định chậm ở đâu bằng dữ liệu, rồi mới sửa.
:::

::: info Các bước
1. **Khoanh vùng**: endpoint nào, từ lúc nào, có trùng với deploy hay đợt traffic nào không. Xem trace (Application Insights, OpenTelemetry) để biết thời gian nằm ở code, DB hay API ngoài.
2. **Database** là nghi phạm số một: query chậm, thiếu index, N+1, lock/blocking. Xem execution plan, Query Store.
3. **Thread pool starvation**: CPU thấp mà latency cao, queue length tăng. Tìm `.Result`/`.Wait()` và I/O đồng bộ.
4. **Dependency ngoài**: API bên thứ ba chậm kéo theo mình. Thêm timeout, circuit breaker, cache.
5. **Memory/GC**: % time in GC cao, cấp phát lớn.
6. Sau khi đã sửa được nút thắt: cache, phân trang, đẩy việc nặng ra background, rồi mới tới scale ngang.
:::

::: details Cách nói của senior
Kể một lần thật bạn đã điều tra chậm, kể cả trên Web Forms: dùng công cụ gì để tìm ra, nguyên nhân là gì, sửa ra sao, kết quả trước và sau. Một câu chuyện thật có số liệu ăn điểm hơn liệt kê đủ 6 bước.
:::
