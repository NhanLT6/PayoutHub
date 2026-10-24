---
title: "Exception handling"
---

# Exception handling

Nên đọc [Middleware](/aspnet-core/middleware) trước. [Câu hỏi phỏng vấn](#interview) nằm ở cuối. Liên quan: [Captive dependency](/aspnet-core/dependency-injection#captive-dependency), [Result pattern](/aspnet-core/result-pattern).

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="eAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="eInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="eOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="eBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## 1. Bài toán

Code ở đâu đó ném exception mà không ai bắt. Không xử lý gì thì client nhận 500 body rỗng (hoặc cả trang stack trace ở Development), và mỗi controller tự `try/catch` một kiểu.

**Global exception handling**: **một chỗ duy nhất** bắt mọi exception chưa xử lý, **log đầy đủ ở server**, trả cho client **JSON chuẩn không lộ chi tiết nội bộ**.

So với Web Forms: tương đương `Application_Error` trong `Global.asax` cộng `customErrors` trong `Web.config`, nhưng nằm trong pipeline và test được.

## 2. Ba mảnh ghép

<div class="fig">
<svg viewBox="0 0 720 220" role="img" aria-label="Ba mảnh: middleware gọi handler của bạn, handler dùng ProblemDetailsService để ghi response"><g font-size="13" font-weight="600" text-anchor="middle"><rect class="boxAcc" x="20" y="60" width="200" height="90" rx="8"/><text x="120" y="88" class="mono">UseExceptionHandler()</text><text x="120" y="110" font-weight="400" font-size="12">middleware: try/catch lớn</text><text x="120" y="127" font-weight="400" font-size="12">bọc phần pipeline phía sau</text><rect class="boxOk" x="260" y="60" width="200" height="90" rx="8"/><text x="360" y="88" class="mono">IExceptionHandler</text><text x="360" y="110" font-weight="400" font-size="12">code của bạn: log gì,</text><text x="360" y="127" font-weight="400" font-size="12">trả status nào</text><rect class="boxAcc" x="500" y="60" width="200" height="90" rx="8"/><text x="600" y="88" class="mono">IProblemDetailsService</text><text x="600" y="110" font-weight="400" font-size="12">ghi JSON ProblemDetails,</text><text x="600" y="127" font-weight="400" font-size="12">tự thêm traceId</text></g><line class="ln" x1="220" y1="105" x2="256" y2="105" marker-end="url(#eInk)"/><line class="ln" x1="460" y1="105" x2="496" y2="105" marker-end="url(#eInk)"/><g font-size="12" text-anchor="middle" class="muted"><text x="120" y="180" class="mono muted">app.UseExceptionHandler()</text><text x="360" y="180" class="mono muted">AddExceptionHandler&lt;T&gt;()</text><text x="600" y="180" class="mono muted">AddProblemDetails()</text><text x="238" y="96" class="muted">gọi</text><text x="478" y="96" class="muted">dùng</text></g></svg>
<p class="fig-caption">Dòng dưới là chỗ đăng ký. Gọi UseExceptionHandler() không tham số mà thiếu cả handler lẫn AddProblemDetails() thì app ném lỗi lúc start (fail-fast, giống ValidateOnStart).</p>
</div>

## 3. Luồng chạy khi có exception

<div class="fig">
<svg viewBox="0 0 720 330" role="img" aria-label="Luồng xử lý trong ExceptionHandlerMiddleware"><g font-size="13" text-anchor="middle"><rect class="boxBad" x="250" y="10" width="220" height="40" rx="8"/><text x="360" y="35" font-weight="600">exception bay lên tới middleware</text><rect class="box" x="250" y="76" width="220" height="44" rx="8"/><text x="360" y="103">Response đã bắt đầu gửi?</text><rect class="boxBad" x="520" y="76" width="180" height="44" rx="8"/><text x="610" y="96" font-size="12">ném tiếp,</text><text x="610" y="112" font-size="12">kết nối bị cắt</text><rect class="box" x="250" y="146" width="220" height="44" rx="8"/><text x="360" y="166" font-size="12">xoá response, set 500,</text><text x="360" y="182" font-size="12">gọi handler theo thứ tự đăng ký</text><rect class="boxOk" x="250" y="216" width="220" height="44" rx="8"/><text x="360" y="243" class="mono">handler.TryHandleAsync</text><rect class="boxOk" x="520" y="216" width="180" height="44" rx="8"/><text x="610" y="236" font-size="12" class="okT" font-weight="600">true: xong, dừng</text><text x="610" y="252" font-size="12">không gọi handler khác</text><rect class="box" x="250" y="282" width="220" height="40" rx="8"/><text x="360" y="300" font-size="12">hết handler mà không ai true</text><text x="360" y="315" font-size="12">→ ProblemDetails mặc định</text></g><line class="ln" x1="360" y1="50" x2="360" y2="72" marker-end="url(#eInk)"/><line class="lnBad" x1="470" y1="98" x2="516" y2="98" marker-end="url(#eBad)"/><text x="492" y="90" font-size="11" text-anchor="middle" class="badT">có</text><line class="ln" x1="360" y1="120" x2="360" y2="142" marker-end="url(#eInk)"/><text x="372" y="136" font-size="11" class="muted">không</text><line class="ln" x1="360" y1="190" x2="360" y2="212" marker-end="url(#eInk)"/><line class="lnOk" x1="470" y1="238" x2="516" y2="238" marker-end="url(#eOk)"/><line class="ln" x1="360" y1="260" x2="360" y2="278" marker-end="url(#eInk)"/><path class="lnAcc dash" d="M250 238 C 180 238, 180 168, 246 168" marker-end="url(#eAcc)"/><text x="150" y="200" font-size="12" text-anchor="middle" class="accT">false: thử</text><text x="150" y="215" font-size="12" text-anchor="middle" class="accT">handler kế tiếp</text></svg>
<p class="fig-caption">Response.HasStarted: header đã gửi đi (vd đang stream file) thì không đổi được status code nữa.</p>
</div>

### true và false

**`TryHandleAsync` trả `true`**: "tôi đã xử lý và **đã ghi response**". Middleware dừng.

**Trả `false`**: "không phải việc của tôi". Middleware thử handler kế tiếp, cuối cùng là response mặc định.

Ghi response bằng `TryWriteAsync` thì **return kết quả của nó**: ghi không được thì để fallback lo, đừng nói dối là `true`.

### Ví dụ handler global

`GlobalExceptionHandler.cs` trong project Api, copy là chạy:

```cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace PayoutHub.Api;

// Đăng ký: builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
// Lifetime: singleton, nên chỉ inject service singleton (logger, IProblemDetailsService, IHostEnvironment)
public class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IProblemDetailsService problemDetailsService,
    IHostEnvironment hostEnvironment
) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Error while processing {Method} {Path}",   // [!code highlight]
            httpContext.Request.Method, httpContext.Request.Path);

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext  // [!code highlight]
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = hostEnvironment.IsDevelopment() ? exception.Message : "Something went wrong",
            },
        });
    }
}
```

Phần đăng ký trong `Program.cs`:

```cs
builder.Services.AddProblemDetails();                              // IProblemDetailsService
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();

app.UseExceptionHandler();                                         // đặt đầu pipeline
```

::: warning Bẫy .NET 10
Handler trả `true` thì middleware **không tự log** exception nữa (trước .NET 10 thì có, dẫn tới log trùng). Hệ quả: handler global **phải tự log**, nếu không exception biến mất khỏi log. Đổi hành vi bằng `ExceptionHandlerOptions.SuppressDiagnosticsCallback`.
:::

## 4. Server biết nhiều, client biết ít, traceId là cầu nối

<div class="fig">
<svg viewBox="0 0 720 250" role="img" aria-label="Client nhận ProblemDetails ít thông tin, server log đầy đủ, nối bằng trace id"><g font-size="13" font-weight="600" text-anchor="middle"><rect class="box" x="20" y="20" width="290" height="150" rx="8"/><text x="165" y="44">Client nhận (ProblemDetails)</text><rect class="box" x="410" y="20" width="290" height="150" rx="8"/><text x="555" y="44">Server log</text></g><g font-size="12" class="mono"><text x="36" y="72">"title": "Internal Server Error"</text><text x="36" y="92">"status": 500</text><text x="36" y="112" class="accT" font-weight="600">"traceId": "00-4bf9…4736-00f0…-01"</text><text x="36" y="132" class="muted">không có message, stack trace</text><text x="426" y="72">exception + stack trace</text><text x="426" y="92">Method: GET, Path: /boom</text><text x="426" y="112" class="accT" font-weight="600">TraceId: 4bf9…4736</text><text x="426" y="132" class="muted">cần IncludeScopes = true</text></g><path class="lnAcc" d="M300 108 L 420 108" marker-end="url(#eAcc)"/><text x="360" y="100" font-size="11" text-anchor="middle" class="accT">tìm theo</text><g font-size="12" class="mono" text-anchor="middle"><rect class="boxAcc" x="90" y="196" width="540" height="40" rx="6"/><text x="180" y="221" class="muted">00</text><text x="190" y="221">-</text><text x="300" y="221" class="accT" font-weight="600">4bf92f35…0e4736 (trace id)</text><text x="410" y="221">-</text><text x="480" y="221">00f067aa… (span)</text><text x="555" y="221">-</text><text x="580" y="221" class="muted">01</text></g></svg>
<p class="fig-caption">traceId trong response là W3C traceparent đầy đủ. Field TraceId trong log chỉ là phần giữa (32 hex). Log chỉ mang trace id khi logger bật scopes.</p>
</div>

### title, detail và log

**`title`**: mô tả ngắn, **cố định** theo loại lỗi. **`detail`**: chi tiết cho lần xảy ra này; ở Production **không** chứa `exception.Message`, vì message có thể chứa connection string, tên bảng, dữ liệu khách hàng.

**Log đúng cách**: overload có `Exception` làm tham số **đầu tiên** (`LogError(exception, "template", args)`), và template là **chuỗi cố định**, không đưa `exception.Message` vào template.

## 5. Nhiều handler: map lỗi nghiệp vụ sang status code (M3)

<div class="fig">
<svg viewBox="0 0 720 170" role="img" aria-label="Chuỗi handler từ cụ thể đến chung"><g font-size="12" text-anchor="middle"><rect class="boxBad" x="10" y="60" width="110" height="50" rx="8"/><text x="65" y="82" font-weight="600">exception</text><text x="65" y="99" class="muted">bất kỳ</text><rect class="box" x="160" y="60" width="150" height="50" rx="8"/><text x="235" y="82" class="mono" font-weight="600">NotFound</text><text x="235" y="99">Handler</text><rect class="box" x="350" y="60" width="150" height="50" rx="8"/><text x="425" y="82" class="mono" font-weight="600">Conflict</text><text x="425" y="99">Handler</text><rect class="box" x="540" y="60" width="160" height="50" rx="8"/><text x="620" y="82" class="mono" font-weight="600">Global</text><text x="620" y="99">ExceptionHandler</text><rect class="boxOk" x="175" y="130" width="120" height="30" rx="15"/><text x="235" y="150" class="okT" font-weight="600">404, true</text><rect class="boxOk" x="365" y="130" width="120" height="30" rx="15"/><text x="425" y="150" class="okT" font-weight="600">409, true</text><rect class="boxOk" x="560" y="130" width="120" height="30" rx="15"/><text x="620" y="150" class="okT" font-weight="600">500, luôn true</text></g><line class="ln" x1="120" y1="85" x2="156" y2="85" marker-end="url(#eInk)"/><line class="lnAcc dash" x1="310" y1="85" x2="346" y2="85" marker-end="url(#eAcc)"/><line class="lnAcc dash" x1="500" y1="85" x2="536" y2="85" marker-end="url(#eAcc)"/><text x="328" y="74" font-size="11" text-anchor="middle" class="accT">false</text><text x="518" y="74" font-size="11" text-anchor="middle" class="accT">false</text><line class="lnOk" x1="235" y1="110" x2="235" y2="126" marker-end="url(#eOk)"/><line class="lnOk" x1="425" y1="110" x2="425" y2="126" marker-end="url(#eOk)"/><line class="lnOk" x1="620" y1="110" x2="620" y2="126" marker-end="url(#eOk)"/><text x="360" y="30" font-size="12" text-anchor="middle" class="muted">thứ tự đăng ký = thứ tự chạy: từ cụ thể đến chung</text></svg>
<p class="fig-caption">Đây là <a href="/dotnet/classic-questions#solid">OCP</a>: thêm loại lỗi mới bằng một class mới, không sửa handler cũ. Đặt Global lên đầu thì các handler sau không bao giờ được gọi.</p>
</div>

### Đăng ký

```cs
builder.Services.AddExceptionHandler<NotFoundExceptionHandler>();   // NotFoundException     → 404
builder.Services.AddExceptionHandler<ConflictExceptionHandler>();   // InvalidStateException → 409
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();     // còn lại              → 500
```

### Một handler riêng trông thế nào

Khác handler global đúng một chỗ: **không phải loại lỗi của mình thì `return false`** để handler kế tiếp xử lý.

::: code-group

```cs [Api/NotFoundExceptionHandler.cs]
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using PayoutHub.Core;

namespace PayoutHub.Api;

public class NotFoundExceptionHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not NotFoundException notFound)   // [!code highlight]
            return false;                                  // [!code highlight]

        httpContext.Response.StatusCode = StatusCodes.Status404NotFound;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found",
                Detail = notFound.Message,   // message do mình tự viết, an toàn để trả ra
            },
        });
    }
}
```

```cs [Core/NotFoundException.cs]
namespace PayoutHub.Core;

// Exception nghiệp vụ nằm ở Core: Core không biết HTTP, chỉ nói "không tìm thấy".
// Api mới quyết định nó thành 404.
public class NotFoundException(string resource, object key)
    : Exception($"{resource} '{key}' was not found.");
```

:::

Lỗi 404 là chuyện bình thường nên handler này **không log Error**. Handler global mới log, vì lỗi tới được đó là lỗi chưa lường trước.

### Dễ nhầm

| Dễ nhầm | Khác nhau ở đâu |
|---|---|
| `IExceptionHandler` và `IExceptionFilter` | Middleware bắt lỗi của **mọi** request, chỉ có `HttpContext`. Filter chỉ bắt lỗi trong action MVC, biết action nào, có `ModelState` ([Filter](/aspnet-core/middleware#filters)). Mặc định chọn middleware |
| `title` và `detail` | `title` cố định theo loại lỗi; `detail` cho lần xảy ra này, không lộ thông tin nội bộ ở Production |
| ExceptionHandler và Developer Exception Page | Trang stack trace chỉ có ở Development, nằm ngoài cùng; handler của bạn nằm trong nên bắt trước |
| Lỗi có exception và lỗi không có exception | 404 sai route, 405 sai method không ném exception nên handler không chạy. Muốn chúng cũng trả ProblemDetails thì thêm `app.UseStatusCodePages()` |

## Câu hỏi phỏng vấn {#interview}

Ôn nhanh trước khi đi phỏng vấn. Mỗi câu có trả lời nhanh, bản chất, ví dụ thật và bẫy.

### Model binding, validation và xử lý lỗi {#validation-errors}

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

## Hỏi đáp

::: details Handler đăng ký bằng AddExceptionHandler sống bao lâu? Inject DbContext vào được không?
**Singleton.** Inject `DbContext` (scoped) vào là [captive dependency](/aspnet-core/dependency-injection#captive-dependency): ở Development, scope validation làm app lỗi lúc start; nếu tắt validation thì một `DbContext` bị dùng chung giữa mọi request, không thread-safe. Thật sự cần service scoped thì lấy qua `httpContext.RequestServices`.
:::

::: details Exception ném trong BackgroundService có đi qua handler này không?
**Không.** Middleware chỉ bọc HTTP request. Exception trong `BackgroundService` (M4) hay task fire-and-forget phải tự `try/catch` và log trong đó.
:::

::: details Vì sao không đưa exception.Message vào log template?
Mỗi lỗi một template khác nhau nên hệ thống log (Seq, Elastic) không gom nhóm được; và message chứa `{` hoặc `}` sẽ bị hiểu nhầm là placeholder. Truyền exception làm tham số đầu tiên, message và stack trace đi kèm object exception.
:::

::: details .NET không có sẵn NotFoundException và handler cho nó sao? Phải tự viết ở mỗi app?
Đúng, phải tự viết, vì loại lỗi nghiệp vụ là của domain bạn: framework không biết "payout đã duyệt rồi" là 409 hay 422. Thứ .NET cho sẵn là **khung**: middleware, `IExceptionHandler`, ProblemDetails. Vài lỗi của chính framework đã được map sẵn, vd `BadHttpRequestException` (body sai, thiếu tham số bắt buộc) thành 400.

Không cần mỗi loại lỗi một handler. Có 3 mức, chọn theo độ phức tạp:

1. **Chỉ đổi status code** (.NET 9+): cấu hình option, không cần handler riêng.
   ```cs
   app.UseExceptionHandler(new ExceptionHandlerOptions
   {
       StatusCodeSelector = ex => ex switch
       {
           NotFoundException     => StatusCodes.Status404NotFound,
           InvalidStateException => StatusCodes.Status409Conflict,
           _                     => StatusCodes.Status500InternalServerError,
       },
   });
   ```
   Selector chạy trước các `IExceptionHandler`, nên handler global lúc đó đừng gán cứng 500 nữa mà dùng status đã có sẵn trong `httpContext.Response.StatusCode`.
2. **Một handler global có `switch`** khi cần đổi cả title, detail hay log khác nhau.
3. **Nhiều handler** như ở trên khi mỗi loại có logic riêng đáng kể. PayoutHub dùng cách này để luyện, app thật thường chỉ cần 1 hoặc 2.

Số exception cũng ít: thường chỉ 3–4 loại theo **ý nghĩa** (NotFound, Conflict, Validation, Forbidden), không phải một loại cho mỗi entity. Không đặt status code vào exception ở Core, vì Core không được biết HTTP.
:::

::: details Dùng exception cho lỗi nghiệp vụ hay Result pattern?
**Trade-off nên nhắc khi phỏng vấn.** Exception + handler thì đơn giản, controller mỏng, nhưng exception tốn chi phí và ẩn luồng điều khiển. Result pattern (method trả `Result<T>`) thì luồng lỗi hiện rõ trong chữ ký, nhưng code dài hơn ở mọi tầng. Với PayoutHub, exception + handler là đủ. Chi tiết, code và so sánh: [Result pattern](/aspnet-core/result-pattern).
:::

::: details Muốn thêm field chung cho mọi ProblemDetails (vd instance) thì làm ở đâu?
`builder.Services.AddProblemDetails(o => o.CustomizeProblemDetails = ctx => { ... })`. Chạy cho mọi ProblemDetails, kể cả lỗi validation 400 của `[ApiController]`.
:::

## Tự kiểm tra

::: details 1. Vì sao UseExceptionHandler phải đứng gần đầu pipeline?
Middleware chỉ bọc được phần pipeline đứng sau nó; lỗi ở middleware đứng trước sẽ không bị bắt (Lab 1 của M1).
:::

::: details 2. Ở .NET 10, nếu handler trả true mà không tự log thì chuyện gì xảy ra?
Exception biến mất khỏi log: client nhận 500 nhưng server không có dấu vết gì.
:::

::: details 3. Client báo "tôi bị lỗi 500", bạn tìm log tương ứng bằng cách nào?
Lấy phần trace id (32 hex ở giữa) của `traceId` trong response, tìm theo field `TraceId` trong hệ thống log. Điều kiện: logger phải bật scopes.
:::

::: details 4. Khi nào handler nên trả false?
Khi exception không thuộc loại handler đó phụ trách, hoặc khi ghi response thất bại (`TryWriteAsync` trả false).
:::
