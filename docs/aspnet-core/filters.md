---
title: "Filter"
---

# Filter (MVC)

[Middleware](/aspnet-core/middleware) bọc **mọi** request. Filter là một pipeline nhỏ hơn, nằm **bên trong** endpoint MVC: nó chỉ chạy khi request đã được chọn tới một action, nên biết action nào, tham số ra sao, `ModelState` hợp lệ không.

## 1. Filter nằm ở đâu {#where}

<FilterMap />

- Số trên hình khớp cột **Thứ tự** ở [bảng mục 2](#order). Nhãn tròn dưới đường đi là những gì request mang theo ở mỗi chặng: tới phòng **3** đã có `id = 42` và `ModelState`, nên action filter làm được việc mà middleware không làm được. Nhánh **4** nét đứt: Exception filter chỉ chạy khi action hoặc action filter ném lỗi; nếu nó xử lý lỗi bằng một kết quả thì kết quả đó được ghi ra luôn, Result filter không chạy.
- Request tới `/health`, file tĩnh hay một URL không khớp route thì **chỉ đi qua middleware**, không chạm filter nào.
- Filter có cùng hình củ hành với middleware: mỗi filter có code **trước** và **sau** lời gọi `next`.
- <T>Minimal API</T> không có <T>MVC</T> filter; thay vào đó là **endpoint filter** ([mục 5](#endpoint-filter)).

## 2. Năm loại filter, theo thứ tự chạy {#order}

| Thứ tự | Loại | Chạy lúc | Thường dùng cho |
|---|---|---|---|
| 1 | **Authorization** | Đầu tiên | Hiếm khi tự viết: `[Authorize]` ngày nay do middleware `UseAuthorization` kiểm |
| 2 | **Resource** | Trước model binding, và lúc ra cuối cùng | Cache response, chặn sớm trước khi tốn công bind |
| | _Model binding + validation_ | | Tạo tham số action, điền `ModelState` |
| 3 | **Action** | Ngay trước và sau action | Validate, audit, đọc hoặc sửa tham số |
| 4 | **Exception** | Khi action hoặc action filter ném lỗi | Đổi exception thành response, chỉ trong phạm vi MVC |
| 5 | **Result** | Trước và sau khi ghi `IActionResult` ra response | Thêm header, bọc kết quả |

**Short-circuit:** filter gán `context.Result = ...` và không gọi `next`, các bước bên trong không chạy. Ví dụ một action filter thấy `ModelState` không hợp lệ thì trả `400` luôn, action không bao giờ được gọi.

**Phạm vi đăng ký** cũng là thứ tự bọc: filter **toàn cục** ở ngoài cùng, rồi tới filter trên **controller**, trong cùng là filter trên **action**.

### Khi nào thật sự cần từng loại {#when}

Authorization và exception thì middleware đã lo phần lớn, nên trong app mới bạn **hiếm khi tự viết** hai loại này. Nhưng chính framework vẫn dùng cả 5 loại: nhiều attribute quen thuộc thật ra là filter.

| Loại | Ví dụ tiêu biểu | Vì sao là filter, không phải middleware | Ngày nay |
|---|---|---|---|
| **1. Authorization** | `[ValidateAntiForgeryToken]` (chống [CSRF](/aspnet-core/authentication-jwt#csrf)) là một authorization filter có sẵn. Code cũ từ ASP.NET MVC 5 hay có class kế thừa `AuthorizeAttribute` | Chỉ cần chạy cho vài action POST của form, và phải chặn trước khi bind | Kiểm quyền tự viết: dùng **policy** + `UseAuthorization`, không viết authorization filter. Khi migrate từ MVC 5, `AuthorizeAttribute` tự viết được đổi thành policy + `AuthorizationHandler` |
| **2. Resource** | **Idempotency-Key** cho `POST /payouts/42/approve`: key đã xử lý rồi thì trả lại response cũ, không duyệt lần hai | Chạy **trước model binding**, nên chặn được trước khi tốn công đọc body; chỉ gắn lên action có `[Idempotent]` | Vẫn hợp lý. Cache response thì nay dùng **OutputCache middleware** (.NET 7) |
| **3. Action** | `[ApiController]` tự trả `400` khi `ModelState` sai: đó là một action filter có sẵn. Audit duyệt payout ([mục 4](#write)) | Cần tham số **đã bind** và `ModelState` | Loại được tự viết **nhiều nhất** |
| **4. Exception** | Một controller cũ (API v1) phải trả lỗi theo định dạng riêng mà client cũ đang đọc, khác phần còn lại của app | Chỉ áp cho một controller, biết action nào đang lỗi | Lỗi toàn cục: `UseExceptionHandler` + `IExceptionHandler` (.NET 8), xem [Exception handling](/aspnet-core/exception-handling) |
| **5. Result** | Bọc kết quả của các action v1 thành `{ data, meta }`, hoặc thêm header `ETag` từ object trả về | Cần `IActionResult` và object kết quả **trước khi** ghi ra response; middleware lúc đó chỉ còn thấy byte | Vẫn hợp lý, nhưng ít gặp |

Câu nhớ: **action filter là loại chính**; resource và result dùng khi cần chặn sớm trước binding hoặc sửa kết quả trước khi ghi; authorization và exception phần lớn đã chuyển sang middleware.

## 3. Middleware hay filter? {#vs-middleware}

::: info Dễ nhầm: middleware và filter
| | Middleware | Filter |
|---|---|---|
| Chạy cho | **Mọi** request: cả health check, file tĩnh, 404 | Chỉ request vào **action MVC** (minimal API: endpoint filter) |
| Thấy gì | Chỉ `HttpContext` | Thêm action nào (`ActionDescriptor`), tham số **đã bind** (`ActionArguments`), `ModelState`, kết quả (`IActionResult`) |
| Đăng ký | `app.Use…` trong `Program.cs`; thứ tự dòng code = thứ tự chạy | Attribute trên action/controller, hoặc toàn cục trong `AddControllers(o => o.Filters.Add<...>())` |
| Bắt lỗi | `UseExceptionHandler` bắt lỗi của mọi request | Exception filter chỉ bắt lỗi trong action MVC |
| Dùng cho | Log mọi request, correlation id, CORS, auth, bắt lỗi toàn cục | Validate `ModelState`, audit theo action, cache theo action |
:::

Câu hỏi để chọn: **việc này có cần biết action nào không?** Cần thì filter, không cần thì middleware.

## 4. Viết và đăng ký một filter {#write}

Có hai bước tách biệt: **viết** class filter (code chạy gì), rồi **đăng ký** (chạy cho action nào, ai tạo object filter). Viết xong mà chưa đăng ký thì không action nào chạy nó.

### Viết: audit mỗi lần duyệt payout {#write-code}

Việc này middleware cũng làm được, nhưng phải tự làm những thứ filter có sẵn. So hai tab:

::: code-group

```cs [Filter]
public class AuditApproveFilter(ILogger<AuditApproveFilter> log) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext ctx, ActionExecutionDelegate next)
    {
        var id = ctx.ActionArguments["id"];   // int đã bind và validate
        var done = await next();              // chạy action (và các filter bên trong)

        log.LogInformation("{Action} payout {Id} by {User} → {Result}",
            ctx.ActionDescriptor.DisplayName, id,
            ctx.HttpContext.User.Identity?.Name,
            done.Result?.GetType().Name);     // OkResult, NotFoundResult…
    }
}

// Controller: chỉ action này chạy filter
[HttpPost("{id:int}/approve")]
[ServiceFilter(typeof(AuditApproveFilter))]
public async Task<IActionResult> Approve(int id) { ... }
```

```cs [Middleware (làm được, nhưng vòng)]
public class AuditApproveMiddleware(RequestDelegate next, ILogger<AuditApproveMiddleware> log)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        // 1. Chạy cho MỌI request, nên phải tự lọc ra đúng action
        var action = ctx.GetEndpoint()?.Metadata.GetMetadata<ControllerActionDescriptor>();
        if (action is not { ControllerName: "Payouts", ActionName: "Approve" })
        {
            await next(ctx);
            return;
        }

        // 2. Chưa có model binding: id chỉ là chuỗi thô trong URL
        var id = ctx.GetRouteValue("id");

        await next(ctx);

        // 3. Không thấy IActionResult, chỉ còn status code đã ghi
        log.LogInformation("{Action} payout {Id} by {User} → {Status}",
            action.DisplayName, id, ctx.User.Identity?.Name, ctx.Response.StatusCode);
    }
}

// Program.cs: phải đặt SAU UseAuthentication, nếu không User còn trống
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<AuditApproveMiddleware>();
```

:::

::: info Dễ nhầm: cùng một việc audit, hai cách
| | Filter | Middleware |
|---|---|---|
| Chạy cho action nào | Gắn attribute lên đúng action | Chạy cho mọi request, tự `if` theo tên controller/action (đổi tên action là quên sửa) |
| Lấy `id` | `ActionArguments["id"]`: `int` đã bind, đã validate | `GetRouteValue("id")`: chuỗi thô, có thể là `"abc"` |
| Thấy kết quả | `IActionResult` (`OkResult`, `NotFoundResult`…) | Chỉ status code |
| Thứ tự | Framework lo: luôn sau auth, sau binding | Bạn lo: đặt sai dòng trong `Program.cs` là `User` trống |
:::

Đó là nghĩa của "middleware không làm gọn được": làm được, nhưng phải tự lọc, tự parse, và mất thông tin MVC đã có sẵn.

::: details Cách middleware gọn hơn: đọc metadata thay vì so tên
Gắn một attribute đánh dấu `[Audit]` lên action, rồi middleware hỏi `ctx.GetEndpoint()?.Metadata.GetMetadata<AuditAttribute>() is not null`. Hết phải so tên controller/action, nhưng `id` vẫn là chuỗi thô và vẫn không thấy `IActionResult`. Cách này hợp khi việc cần làm **không cần** tham số đã bind, ví dụ đo thời gian các endpoint có đánh dấu.
:::

### Đăng ký: chạy cho action nào, ai tạo filter {#register}

Đăng ký trả lời hai câu:

- **Chạy cho action nào?** Một action, cả controller, hay mọi action trong app.
- **Ai tạo object filter?** Quyết định filter có nhận được service qua constructor không (ví dụ `ILogger`, `DbContext`).

::: code-group

```cs [ServiceFilter (hay dùng)]
// Program.cs: DI container tạo filter, nên phải đăng ký nó
builder.Services.AddScoped<AuditApproveFilter>();

// Controller
[ServiceFilter(typeof(AuditApproveFilter))]
public async Task<IActionResult> Approve(int id) { ... }
```

```cs [TypeFilter]
// Không cần đăng ký trong DI: framework tự new, lấy tham số ctor từ DI
[TypeFilter(typeof(AuditApproveFilter))]
public async Task<IActionResult> Approve(int id) { ... }
```

```cs [Global]
// Chạy cho MỌI action MVC trong app
builder.Services.AddControllers(o => o.Filters.Add<AuditApproveFilter>());
```

```cs [Attribute tự viết]
// Filter chính là attribute: C# tạo nó, không qua DI, nên ctor không inject được
public class AuditApproveAttribute : ActionFilterAttribute
{
    public override async Task OnActionExecutionAsync(ActionExecutingContext ctx, ActionExecutionDelegate next)
    {
        // Muốn dùng service thì phải tự lấy (service locator): kém sạch
        var log = ctx.HttpContext.RequestServices.GetRequiredService<ILogger<AuditApproveAttribute>>();
        ...
    }
}

[AuditApprove]
public async Task<IActionResult> Approve(int id) { ... }
```

:::

| Cách | Chạy cho | Ai tạo filter | Inject qua ctor |
|---|---|---|---|
| `[ServiceFilter]` | Action hoặc controller có attribute | DI container | Có; phải `AddScoped<...>()` |
| `[TypeFilter]` | Action hoặc controller có attribute | Framework, lấy tham số ctor từ DI | Có; không cần đăng ký |
| `Filters.Add<T>()` | **Mọi** action MVC | Framework, lấy từ DI | Có |
| Attribute tự viết | Action hoặc controller có attribute | C#, lúc đọc attribute | **Không** |

::: info Dễ nhầm: ServiceFilter và TypeFilter
Cả hai đều cho filter nhận service qua constructor. Khác nhau ở chỗ **ai tạo object filter**:

```text
ServiceFilter:  request ──► "DI ơi, đưa tao AuditApproveFilter"   ──► DI tạo theo lifetime đã đăng ký
TypeFilter:     request ──► framework tự new AuditApproveFilter(…)  ──► hỏi DI từng tham số ctor
                                                         + tham số tay qua Arguments
```

| | `ServiceFilter` | `TypeFilter` |
|---|---|---|
| Filter có phải là service trong DI không | **Có**: phải `AddScoped<AuditApproveFilter>()`, quên là lỗi lúc chạy | **Không**: không cần đăng ký |
| Lifetime của filter | Theo đăng ký DI (scoped, singleton…) | Tạo mới mỗi request |
| Truyền tham số không có trong DI | **Không** được | **Được**: `[TypeFilter(typeof(AuditFilter), Arguments = ["approve"])]` |
| Dùng khi | Filter có dependency, muốn quản lý lifetime ở một chỗ | Filter cần thêm tham số cấu hình theo từng action |

Bẫy: đăng ký filter là `AddSingleton` nhưng nó nhận `DbContext` (scoped) qua ctor là lỗi **captive dependency**, giống service thường ([DI lifetimes](/aspnet-core/dependency-injection#lifetimes)).
:::

Chọn nhanh: cần cho mọi action thì **global**; cho vài action và cần service thì **`ServiceFilter`**; filter không cần service (chỉ đọc `ctx`) thì attribute tự viết là gọn nhất. Gắn attribute lên **controller** thì mọi action trong controller đó đều chạy filter.

## 5. Minimal API: endpoint filter {#endpoint-filter}

Minimal API chỉ có **một** loại filter, gắn bằng `AddEndpointFilter`. Nó chạy sau khi tham số đã bind, có code trước và sau `next`, và đọc được giá trị trả về: gần giống action filter gộp với result filter.

```csharp
app.MapPost("/payouts/{id:int}/approve", ApprovePayout)
   .AddEndpointFilter(async (ctx, next) =>
   {
       var id = ctx.GetArgument<int>(0);           // tham số đã bind
       if (id <= 0) return Results.BadRequest();   // short-circuit

       return await next(ctx);                     // giá trị handler trả về
   });
```

### Vì sao không còn 5 loại {#why-one}

5 loại filter của MVC gắn với **5 chặng** trong pipeline MVC. Minimal API không có các chặng đó, nên không có chỗ để gắn:

| Chặng trong MVC | Minimal API |
|---|---|
| Authorization filter | Đã có `UseAuthorization` middleware và `.RequireAuthorization()` |
| Resource filter, trước một bước model binding riêng | Không có bước binding riêng: lúc khởi động, framework sinh sẵn một hàm vừa bind tham số vừa gọi handler |
| Action filter quanh action | **Endpoint filter** đứng đúng chỗ này |
| Exception filter | Đã có `UseExceptionHandler` |
| Result filter quanh việc ghi `IActionResult` | Handler trả `IResult`, nó tự ghi ra response; endpoint filter đã đọc được giá trị trả về |

Minimal API (.NET 6) được thiết kế nhẹ và nhanh ngay từ đầu, không mang theo `ActionDescriptor`, `ModelState` hay bước thực thi kết quả của MVC. Endpoint filter chỉ được thêm ở .NET 7, đặt đúng một chỗ còn thiếu: quanh lời gọi handler, sau khi đã bind. Hai việc auth và bắt lỗi thì từ lâu đã nằm ở middleware.

## Câu hỏi phỏng vấn {#interview}

### Filter là gì? Khác middleware chỗ nào? <Badge type="warning" text="hay gặp" /> {#filters-vs-middleware}

::: tip Trả lời nhanh
Middleware chạy cho mọi request và chỉ thấy `HttpContext`. Filter chạy bên trong MVC, quanh action, nên biết action nào, tham số đã bind, `ModelState`. Việc chung cho cả app (log, correlation id, auth) dùng middleware; việc cần ngữ cảnh action (validate, audit theo action) dùng filter. Xem [bảng so sánh](#vs-middleware).
:::

::: details Câu trả lời mẫu (English)
Middleware runs for every request and only sees the `HttpContext`, so I use it for cross-cutting concerns like logging, correlation IDs, CORS and authentication. Filters run inside the MVC pipeline around a specific action, after routing and model binding, so they know which action is running, its bound arguments and the `ModelState`. I use them for action-specific concerns such as validation or auditing. The order is authorization, resource, action, exception and result filters. For minimal APIs the equivalent is an endpoint filter.
:::

::: warning Bẫy & follow-up
**"Exception filter có bắt được lỗi trong middleware không?"**

Không. Nó chỉ bắt lỗi trong phạm vi MVC. Lỗi toàn cục phải xử lý bằng `UseExceptionHandler` ([Exception handling](/aspnet-core/exception-handling)).

**"Filter cần inject service thì làm sao?"**

Dùng `ServiceFilter` (filter đăng ký trong DI), `TypeFilter`, hoặc đăng ký toàn cục `Filters.Add<T>()`. Attribute thường không inject qua constructor được. Xem [Đăng ký](#register).

**"Minimal API có filter không?"**

Có endpoint filter (`AddEndpointFilter`), một loại duy nhất, không chia 5 loại như MVC.
:::
