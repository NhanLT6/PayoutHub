---
title: "Logging"
---

# Logging trong ASP.NET Core

Structured logging với `ILogger<T>`: log thành dữ liệu lọc được, không phải chuỗi để đọc bằng mắt. Liên quan: [Exception handling](/aspnet-core/exception-handling) (traceId trong ProblemDetails), [Middleware](/aspnet-core/middleware). [Câu hỏi phỏng vấn](#interview) ở cuối trang.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="lAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="lInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="lOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## 1. Message template và string interpolation {#message-template}

Với <T>structured logging</T>, mỗi dòng log là bản ghi có field, không chỉ là một chuỗi. Bạn viết một <T>message template</T> cố định, giá trị truyền kèm thành **field riêng** để hệ thống log (<T>Seq</T>, Elastic, <T>Application Insights</T>) index được.

```csharp
// Đúng: PayoutId và Amount là field riêng, lọc được
logger.LogInformation("Payout {PayoutId} approved, amount {Amount}", payout.Id, payout.Amount);

// Sai: chỉ còn một chuỗi phẳng, và luôn tốn công ghép chuỗi kể cả khi level bị tắt
logger.LogInformation($"Payout {payout.Id} approved, amount {payout.Amount}");
```

<Compare :labels="['Message template', 'String interpolation']" caption="Cùng một dòng chữ khi đọc bằng mắt. Khác nhau ở chỗ hệ thống log có field để lọc hay không.">
<template #a>
<svg viewBox="0 0 720 220" role="img" aria-label="Template: log có Message và State với field PayoutId, Amount có kiểu"><rect class="boxOk" x="20" y="16" width="440" height="190" rx="8"/><g font-size="12" class="mono"><text x="36" y="42">"Message": "Payout 42 approved, amount 1500"</text><text x="36" y="66">"State": {</text><text x="56" y="88" class="okT">"PayoutId": 42,</text><text x="56" y="108" class="okT">"Amount": 1500,</text><text x="56" y="128" class="muted">"{OriginalFormat}":</text><text x="76" y="146" class="muted">"Payout {PayoutId} approved, …"</text><text x="36" y="168">}</text></g><g font-size="12"><text x="480" y="60" class="okT">✓ lọc Amount &gt; 1000</text><text x="480" y="84" class="okT">✓ group/count theo PayoutId</text><text x="480" y="108" class="okT">✓ số vẫn là số</text><text x="480" y="132" class="okT">✓ gom mọi dòng cùng template</text><text x="480" y="156" class="muted">(theo {OriginalFormat})</text></g></svg>
</template>
<template #b>
<svg viewBox="0 0 720 220" role="img" aria-label="Interpolation: chỉ có Message là một chuỗi phẳng"><rect class="boxBad" x="20" y="16" width="440" height="110" rx="8"/><g font-size="12" class="mono"><text x="36" y="42">"Message": "Payout 42 approved, amount 1500"</text><text x="36" y="66">"State": {</text><text x="56" y="88" class="muted">"{OriginalFormat}": "Payout 42 approved, …"</text><text x="36" y="110">}</text></g><g font-size="12"><text x="480" y="60" class="badT">✗ chỉ full-text search / regex</text><text x="480" y="84" class="badT">✗ không so sánh số được</text><text x="480" y="108" class="badT">✗ mỗi payout là một "template" khác</text><text x="36" y="160" class="muted">Giá trị đã bị ghép vào chuỗi trước khi tới logger,</text><text x="36" y="178" class="muted">logger không còn biết đâu là PayoutId.</text></g></svg>
</template>
</Compare>

**Placeholder bind theo vị trí, không theo tên.** Tên trong `{}` chỉ là tên field. Đảo thứ tự tham số là log sai âm thầm: `{PayoutId}` mang giá trị của `Amount`. <T>Analyzer</T> **CA2017** báo khi số placeholder và số tham số lệch nhau, nhưng không bắt được đảo thứ tự.

**Kiểu dữ liệu giữ nguyên.** Truyền `decimal` thì field là số. Truyền chuỗi đọc từ `IConfiguration` thì field là string, và `MinAmount > 500` có thể so sánh sai.

`ILogger<T>` lấy tên đầy đủ của `T` làm <T k="log category">category</T> (`PayoutHub.Api.GlobalExceptionHandler`). `Logging:LogLevel` lọc theo **tiền tố** category. PayoutHub, `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "PayoutHub": "Debug"
    }
  }
}
```

Mọi category bắt đầu bằng `PayoutHub` ghi từ `Debug` trở lên; log của framework (`Microsoft.AspNetCore.*`) chỉ từ `Warning`. Prefix dài nhất khớp được thì thắng.

## 2. JSON console và log scope {#scopes}

PayoutHub ghi log ra console dạng JSON:

```csharp
// Program.cs
builder.Logging.AddJsonConsole(options =>
{
    options.IncludeScopes = true;   // mặc định false
});
```

`WebApplication.CreateBuilder` đã thêm sẵn console provider với formatter dạng text. `AddJsonConsole` đổi formatter của provider đó sang JSON, nên mỗi dòng log là một object JSON (đúng dạng mà Seq/Elastic nuốt thẳng).

Để mọi dòng log trong một đoạn code mang chung field (vd id của request), dùng <T>log scope</T>: mở bằng `logger.BeginScope(...)`, đóng khi `Dispose`, không phải truyền field vào từng lời gọi log.

<div class="fig">
<svg viewBox="0 0 720 270" role="img" aria-label="Scope của request chứa TraceId và RequestPath; scope tự mở chứa PayoutId; dòng log bên trong mang cả hai"><rect class="boxAcc" x="20" y="16" width="680" height="236" rx="10"/><text x="36" y="40" font-size="13" font-weight="600" class="accT">Scope do ASP.NET Core mở cho mỗi request</text><text x="36" y="60" font-size="12" class="mono">TraceId, SpanId, ParentId, RequestId, RequestPath</text><rect class="boxOk" x="48" y="80" width="624" height="96" rx="10"/><text x="64" y="104" font-size="13" font-weight="600" class="okT">using (logger.BeginScope("Payout {PayoutId}", 42))</text><rect class="box" x="76" y="118" width="568" height="44" rx="6"/><text x="92" y="137" font-size="12" class="mono">logger.LogInformation("Approved")</text><text x="92" y="153" font-size="12" class="muted">dòng log mang: TraceId, RequestPath, PayoutId</text><rect class="box" x="48" y="192" width="624" height="44" rx="6"/><text x="64" y="211" font-size="12" class="mono">logger.LogWarning("Slow request")</text><text x="64" y="227" font-size="12" class="muted">ngoài scope tự mở: chỉ mang TraceId, RequestPath</text></svg>
<p class="fig-caption">Scope lồng nhau như hàm gọi lồng nhau. Formatter chỉ in phần Scopes khi IncludeScopes = true; tắt thì các field này vẫn tồn tại nhưng không ra log.</p>
</div>

ASP.NET Core tự mở scope cho mỗi request. `TraceId`/`SpanId`/`ParentId` có mặt nhờ `ActivityTrackingOptions` mà host bật mặc định. Một dòng log JSON khi bật scopes (rút gọn):

```json
{
  "LogLevel": "Error",
  "Category": "PayoutHub.Api.GlobalExceptionHandler",
  "Message": "Error while processing request: GET /boom",
  "State": { "Method": "GET", "Path": "/boom" },
  "Scopes": [
    { "TraceId": "4bf92f3577b34da6a3ce929d0e0e4736", "SpanId": "00f067aa0ba902b7", "ParentId": "0000000000000000" },
    { "RequestId": "0HN7…:00000001", "RequestPath": "/boom" }
  ]
}
```

`MapGet("/boom", ...)` trong PayoutHub ném exception để thử đúng luồng này.

## 3. Tìm log cho một lỗi 500 user báo {#trace-a-500}

<div class="fig">
<svg viewBox="0 0 720 200" role="img" aria-label="Lấy traceId từ ProblemDetails, tách phần trace id 32 hex, tìm theo TraceId trong log"><g font-size="12" text-anchor="middle"><rect class="box" x="10" y="30" width="160" height="70" rx="8"/><text x="90" y="56" font-weight="600">User / client</text><text x="90" y="76" class="mono">"traceId": "00-4bf9…-00f0…-00"</text><rect class="boxAcc" x="210" y="30" width="270" height="70" rx="8"/><text x="345" y="56" font-weight="600" class="accT">tách traceparent (W3C)</text><text x="345" y="78" class="mono">00 - &lt;trace-id 32 hex&gt; - &lt;span 16 hex&gt; - 00</text><rect class="boxOk" x="520" y="30" width="190" height="70" rx="8"/><text x="615" y="56" font-weight="600" class="okT">Seq / Elastic</text><text x="615" y="76" class="mono">TraceId = 4bf92f35…</text></g><line class="ln" x1="170" y1="65" x2="206" y2="65" marker-end="url(#lInk)"/><line class="lnOk" x1="480" y1="65" x2="516" y2="65" marker-end="url(#lOk)"/><g font-size="12"><text x="20" y="140">Kết quả: mọi dòng log của request đó, gồm cả dòng LogError có stack trace.</text><text x="20" y="162" class="muted">Điều kiện: IncludeScopes = true. Tắt thì trong log không có TraceId để nối.</text><text x="20" y="184" class="muted">Gọi sang service khác (PayoutHub → FakeBank ở M4): HttpClient tự gửi header traceparent, cùng trace id nối cả chuỗi.</text></g></svg>
<p class="fig-caption">Response chỉ lộ id, không lộ chi tiết lỗi. Chi tiết nằm ở server log. Hình đầy đủ phía client/server ở <a :href="$withBase('/aspnet-core/exception-handling')">Exception handling</a>.</p>
</div>

Trong .NET, một span là một <T>Activity</T>. ASP.NET Core tạo Activity cho mỗi request; ProblemDetails mặc định ghi `traceId` từ Activity đó, scope của logger cũng lấy từ Activity đó, nên hai bên khớp nhau.

## 4. Dễ nhầm

| Cặp | Phân biệt |
|---|---|
| Message template và string interpolation | Template giữ giá trị thành field có kiểu. Interpolation ghép thành chuỗi trước khi logger thấy |
| Tên placeholder và thứ tự tham số | Bind theo **thứ tự**. Tên chỉ đặt tên field |
| `State` và `Scopes` | `State`: field của riêng dòng log đó (từ template). `Scopes`: field của đoạn code bao quanh, áp cho mọi dòng bên trong |
| `traceId` trong ProblemDetails và `TraceId` trong log | Response chứa cả traceparent (`00-…-…-00`). Log chỉ có phần trace id 32 hex ở giữa |
| `IncludeScopes = false` | Scope vẫn được mở, chỉ là formatter không in ra. Có id ở response mà không có gì để tìm |

## Câu hỏi phỏng vấn {#interview}

Ôn nhanh trước khi đi phỏng vấn. Mỗi câu có trả lời nhanh, bản chất, ví dụ thật và bẫy.

### Logging đúng cách: vì sao dùng message template thay vì string interpolation? <Badge type="warning" text="hay bị hỏi" /> {#logging}

::: tip Trả lời nhanh
Inject `ILogger<T>` và dùng **structured logging**: message template có placeholder, giá trị đi kèm thành field riêng. Hệ thống log index field đó, nên lọc `Amount > 1000` hay đếm theo `PayoutId` được. Interpolation chỉ để lại một chuỗi phẳng, và luôn tốn công ghép chuỗi kể cả khi level bị tắt.
:::

::: info Bản chất
Xem [hình so sánh](#message-template). Ba điểm hay bị hỏi tiếp:

- Placeholder bind **theo vị trí**. `{0}` thì field tên là `0`, vô dụng khi query.
- Kiểu được giữ: `decimal` vẫn là số trong log.
- `ILogger<T>`: `T` thành category, lọc level theo tiền tố namespace trong `Logging:LogLevel`.
:::

::: details Ở dự án thật
PayoutHub: `GlobalExceptionHandler` log bằng `LogError(exception, "Error while processing request: {Method} {Path}", ...)`: exception là tham số **đầu tiên** (để logger giữ stack trace thành field riêng), template là chuỗi cố định, không nhét `exception.Message` vào template. `Program.cs` log config lúc start bằng `"Payout config: {MinAmount} {Currency}"`.
:::

::: warning Bẫy & follow-up
**"Log nhiều thì có chậm không? Mức senior làm gì?"**

`[LoggerMessage]` <T>source generator</T>: khai báo method `partial`, compiler sinh code check `IsEnabled` trước, không <T>boxing</T>, không parse template lúc chạy, và báo lỗi compile nếu placeholder không khớp tham số. <T>Analyzer</T> CA1848 gợi ý chuyển sang cách này.

```csharp
public static partial class PayoutLog
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Payout {PayoutId} approved, amount {Amount}")]
    public static partial void PayoutApproved(this ILogger logger, int payoutId, decimal amount);
}

// dùng: logger.PayoutApproved(payout.Id, payout.Amount);
```

**"Cái gì không được log?"**

Mật khẩu, token, số thẻ, số tài khoản ngân hàng của affiliate và mọi <T>PII</T>. Cẩn thận khi log nguyên object request.
:::

### User báo lỗi 500, bạn tìm log tương ứng thế nào? {#find-log-500}

::: tip Trả lời nhanh
ProblemDetails trả về `traceId` (W3C <T>traceparent</T>). User gửi id đó khi báo lỗi; mình lấy phần trace id 32 hex ở giữa và tìm theo field `TraceId` trong hệ thống log. Điều kiện: logger phải in scopes (`IncludeScopes = true`, mặc định tắt), vì `TraceId` nằm trong scope của request.
:::

::: info Bản chất
Xem [hình các bước](#trace-a-500). Cấu trúc traceparent: `00-<trace-id 32 hex>-<span-id 16 hex>-<flags>`. Một trace id dùng chung cho cả chuỗi gọi; mỗi bước (span) có span id riêng.
:::

::: details Ở dự án thật
PayoutHub: `AddJsonConsole(o => o.IncludeScopes = true)` trong `Program.cs`, gọi `/boom` là thấy cùng một trace id ở response và ở dòng log của `GlobalExceptionHandler`. Ở M4, `HttpClient` gọi FakeBank tự gửi header `traceparent`, nên một trace id nối log của PayoutHub với FakeBank (<T>distributed tracing</T>).
:::

::: warning Bẫy & follow-up
**"Sao không trả luôn exception message cho user, đỡ phải tìm log?"**

Message có thể chứa connection string, tên bảng, dữ liệu khách hàng. Response chỉ lộ id; chi tiết ở server log, xem [title, detail và log](/aspnet-core/exception-handling).

**"User không gửi được traceId (chỉ chụp màn hình lỗi chung, hoặc gọi từ app không hiện ProblemDetails) thì sao?"**

Khoanh vùng bằng thứ khác: thời điểm (± vài phút), path và method (`RequestPath` trong scope), user id hoặc payout id nếu đã log làm field, rồi lọc level `Error`. Thấy dòng lỗi thì lấy `TraceId` của nó để kéo ra mọi dòng còn lại của request đó. Bài học thiết kế: cho UI hiện traceId kèm thông báo lỗi để user copy được.

**"Bật scopes rồi mà log vẫn không có TraceId?"**

Kiểm tra formatter đang dùng có thật là formatter đã bật `IncludeScopes` không (mỗi formatter: simple, json, systemd có options riêng), và có ai tắt `ActivityTrackingOptions` không.
:::

## Hỏi đáp

::: details "Chọn log level thế nào?"
`Trace`/`Debug`: chi tiết để debug, tắt ở Production. `Information`: sự kiện nghiệp vụ đáng ghi (payout approved). `Warning`: bất thường nhưng tự xử lý được (retry lần 2). `Error`: một thao tác thất bại cần người xem. `Critical`: cả app hoặc một phần lớn ngừng hoạt động. Quy tắc thực tế: Production mặc định `Information`, framework `Warning`.
:::

::: details "BeginScope dùng khi nào trong code mình?"
Khi một đoạn xử lý dài cần mọi dòng log mang cùng một id: một lần `generate` payout cho một kỳ (`PeriodId`), một job nền xử lý một payout (`PayoutId`). Không phải truyền id vào từng lời gọi log, và log của service bên dưới (repository, gateway) cũng tự mang id đó.
:::

## Tự kiểm tra

::: details 1. Đảo thứ tự tham số trong LogInformation("Payout {PayoutId} amount {Amount}", amount, id) thì sao?
Log ghi sai âm thầm: field `PayoutId` mang giá trị amount. Không có lỗi compile; CA2017 chỉ bắt lệch số lượng.
:::

::: details 2. IncludeScopes = false. Scope của request có còn được mở không?
Còn. Chỉ là formatter không in phần Scopes, nên dòng log không có `TraceId`.
:::

::: details 3. "PayoutHub": "Debug" và "Default": "Information". Category PayoutHub.Api.GlobalExceptionHandler ghi từ level nào?
`Debug`: prefix `PayoutHub` khớp và dài hơn `Default`.
:::
