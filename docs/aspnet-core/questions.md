---
title: "Câu hỏi ASP.NET Core khác"
---

# Câu hỏi ASP.NET Core khác

Các câu ASP.NET Core chưa có bài học riêng. Khi học tới chủ đề nào, câu đó được chuyển sang trang chủ đề của nó (như [Middleware](/aspnet-core/middleware), [Logging](/aspnet-core/logging) hay [Options pattern](/aspnet-core/options-pattern)).

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

## Controller hay Minimal API? Minimal API có dùng cho app lớn được không? {#controllers-vs-minimal}

::: tip Trả lời nhanh
Cả hai chạy trên cùng routing, middleware và DI, đều dùng được cho app lớn. Khác nhau ở chỗ ai đặt cấu trúc: **Controllers áp sẵn cấu trúc** (convention, filter, model binding); **Minimal API phải tự đặt** (chia theo feature, `MapGroup`, `IEndpointFilter`, `TypedResults`). Minimal API bắt buộc khi cần Native AOT.
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

| Controllers | Minimal API |
|---|---|
| `[Route]`, `[Authorize]` ở cấp class | `MapGroup()` + `.RequireAuthorization()` |
| Action filter | `IEndpointFilter` + `.AddEndpointFilter<T>()` |
| Inject qua constructor, dùng chung mọi action | Inject qua tham số từng handler |
| `IActionResult` | `Results<Ok<T>, NotFound>` + `TypedResults` (OpenAPI biết chính xác kiểu trả về) |
| `[ApiController]` tự trả 400 khi model sai | `AddValidation()` (.NET 10) |
| Không hỗ trợ Native AOT | Hỗ trợ AOT (dùng source generator) |
:::

::: details Ở dự án thật
PayoutHub: API chính dùng Controllers để luyện filter và model binding; FakeBank chỉ vài endpoint nên dùng Minimal API.

Câu trả lời mẫu: "Team lớn, nhiều người mới, chưa có convention → Controllers, vì framework áp cấu trúc thay team. Minimal API khi team đã thống nhất cách tổ chức, hoặc cần AOT."
:::

::: warning Bẫy & follow-up
**"Minimal API ở app lớn thì tổ chức thế nào cho khỏi loạn?"**

Chia theo feature, mỗi feature một extension method `MapXxxEndpoints`. Feature nhỏ: một file chứa cả route lẫn handler. Feature lớn: mỗi endpoint một file theo REPR. Giữ trật tự bằng convention viết thành tài liệu, code mẫu, review chặt; có thể thêm architecture test hoặc dùng FastEndpoints.

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

**"Vậy Controllers an toàn hơn?"**

Không hẳn: Controllers cũng xuống cấp được, kiểu controller phình to vài nghìn dòng. Minimal API linh hoạt hơn nhưng không có convention thì loạn nhanh khi team đông. Chọn theo team, không theo độ "mới".
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
