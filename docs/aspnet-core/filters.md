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

Ví dụ: ghi audit mỗi lần duyệt payout. Middleware không làm việc này gọn được, vì lúc đó chưa biết action nào và chưa có `id` (chưa model binding).

```csharp
public class AuditApproveFilter(ILogger<AuditApproveFilter> log) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext ctx, ActionExecutionDelegate next)
    {
        var id = ctx.ActionArguments["id"];   // đã model binding: middleware không có
        var done = await next();              // chạy action (và các filter bên trong)

        log.LogInformation("{Action} payout {Id} by {User} → {Result}",
            ctx.ActionDescriptor.DisplayName, id,
            ctx.HttpContext.User.Identity?.Name, done.Result?.GetType().Name);
    }
}
```

Có 4 cách gắn filter vào action, khác nhau ở chỗ **filter được tạo ra thế nào**:

| Cách gắn | Filter được tạo bởi | Inject service qua ctor? |
|---|---|---|
| `[AuditApprove]` (filter kế thừa `ActionFilterAttribute`) | Chính attribute, một lần | Không |
| `[ServiceFilter(typeof(AuditApproveFilter))]` | DI container | Có, nhưng phải đăng ký `AddScoped<AuditApproveFilter>()` |
| `[TypeFilter(typeof(AuditApproveFilter))]` | `ActivatorUtilities`, lấy tham số từ DI | Có, không cần đăng ký |
| `AddControllers(o => o.Filters.Add<AuditApproveFilter>())` | Framework, cho **mọi** action | Có |

## 5. Minimal API: endpoint filter {#endpoint-filter}

Minimal API không có 5 loại filter ở trên. Chỉ có một loại, gắn bằng `AddEndpointFilter`, cũng có code trước và sau `next`:

```csharp
app.MapPost("/payouts/{id:int}/approve", ApprovePayout)
   .AddEndpointFilter(async (ctx, next) =>
   {
       var id = ctx.GetArgument<int>(0);           // tham số đã bind
       if (id <= 0) return Results.BadRequest();   // short-circuit
       return await next(ctx);
   });
```

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

Dùng `ServiceFilter` (filter đăng ký trong DI), `TypeFilter`, hoặc đăng ký toàn cục `Filters.Add<T>()`. Attribute thường không inject qua constructor được. Xem [mục 4](#write).

**"Minimal API có filter không?"**

Có endpoint filter (`AddEndpointFilter`), một loại duy nhất, không chia 5 loại như MVC.
:::
