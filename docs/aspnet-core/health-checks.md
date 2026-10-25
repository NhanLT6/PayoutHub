---
title: "Health check"
---

# Health check

Đọc trước khi làm bước cuối của M1. Liên quan: [Middleware](/aspnet-core/middleware), [Service lifetime](/aspnet-core/dependency-injection#lifetimes), [Exception handling](/aspnet-core/exception-handling).

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="hAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="hInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="hOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="hBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## 1. Health check là gì

**Health check** là một URL (thường là `/health`) mà máy khác gọi định kỳ để hỏi app: **"còn làm việc được không?"**. App trả `200` là ổn, `503` là đang có vấn đề.

**Ai gọi:** load balancer, Kubernetes, công cụ giám sát. Không phải người dùng.

**Vì sao cần:** app vẫn đang chạy chưa có nghĩa là dùng được. Ví dụ app chạy nhưng mất kết nối DB, hoặc đang khởi động dở. Health check giúp phát hiện những lúc đó để ngừng gửi request vào app, hoặc khởi động lại app.

**So với Web Forms:** giống trang `ping.aspx` tự viết trả về "OK". Khác ở chỗ ASP.NET Core có sẵn: kiểm tra được nhiều thứ cùng lúc (DB, API bên ngoài...) và tách được thành nhiều URL, mỗi URL cho một mục đích.

## 2. Liveness, readiness, startup

Ba câu hỏi khác nhau. Khác nhau quan trọng nhất là **orchestrator làm gì khi câu trả lời là "không"**. **Orchestrator**: phần mềm chạy và trông coi nhiều bản app thay cho người vận hành; phổ biến nhất là Kubernetes. Bạn không cần đã chạy Kubernetes để hiểu phần này, chỉ cần hình dưới. Phần probe này sẽ được làm thật trên Kubernetes local ở [M8](/progress/plan#m8).

### Kubernetes trong 1 phút

- **Pod**: một bản app đang chạy (một container chứa PayoutHub.Api). Giống một server trong web farm IIS.
- **Deployment**: khai báo "luôn giữ 3 pod". Pod chết thì tự tạo pod mới.
- **Service**: một địa chỉ chung đứng trước các pod, chia traffic **chỉ cho pod đang ready**. Giống load balancer trước web farm.
- **Probe**: Kubernetes tự gọi `/health/...` của từng pod định kỳ. Cứ mỗi `periodSeconds` (mặc định 10s) gọi một lần, fail **liên tiếp** `failureThreshold` lần (mặc định 3) mới hành động: khoảng **30 giây** từ lúc hỏng tới lúc bị xử lý. Mỗi lần gọi có `timeoutSeconds` (mặc định 1s), quá thời gian là tính fail.

<div class="fig">
<svg viewBox="0 0 720 250" role="img" aria-label="Service chỉ chia traffic cho pod ready; pod fail readiness bị gỡ khỏi Service; pod fail liveness bị restart"><g font-size="13" font-weight="600" text-anchor="middle"><rect class="box" x="20" y="100" width="120" height="50" rx="8"/><text x="80" y="122">Client</text><text x="80" y="139" font-size="11" font-weight="400" class="muted">request</text><rect class="boxAcc" x="190" y="100" width="130" height="50" rx="8"/><text x="255" y="122">Service</text><text x="255" y="139" font-size="11" font-weight="400" class="accT">chỉ chia cho pod ready</text><rect class="boxOk" x="400" y="20" width="160" height="50" rx="8"/><text x="480" y="42">Pod 1</text><text x="480" y="60" font-size="11" font-weight="400" class="okT">live ✓ · ready ✓</text><rect class="box" x="400" y="100" width="160" height="50" rx="8"/><text x="480" y="122">Pod 2</text><text x="480" y="140" font-size="11" font-weight="400" class="muted">live ✓ · ready ✗</text><rect class="boxBad" x="400" y="180" width="160" height="50" rx="8"/><text x="480" y="202">Pod 3</text><text x="480" y="220" font-size="11" font-weight="400" class="badT">live ✗ (3 lần liền)</text></g><line class="ln" x1="140" y1="125" x2="186" y2="125" marker-end="url(#hInk)"/><line class="lnOk" x1="320" y1="115" x2="396" y2="48" marker-end="url(#hOk)"/><line class="lnMuted dash" x1="320" y1="125" x2="396" y2="125"/><g font-size="12"><text x="578" y="50" class="okT">nhận traffic</text><text x="578" y="122">bị gỡ khỏi Service,</text><text x="578" y="138">không restart; ready lại</text><text x="578" y="154">→ tự được thêm vào</text><text x="578" y="202" class="badT">container bị kill</text><text x="578" y="218" class="badT">và chạy lại</text></g></svg>
<p class="fig-caption">Ai gọi probe: Kubernetes, không phải load balancer bên ngoài và không phải người dùng. App chỉ cần trả 200 hoặc 503 đúng lúc.</p>
</div>

<div class="fig">
<svg viewBox="0 0 720 260" role="img" aria-label="Ba loại probe và hành động khi fail"><g font-size="13" font-weight="600" text-anchor="middle"><rect class="box" x="20" y="90" width="130" height="80" rx="8"/><text x="85" y="125">Kubernetes /</text><text x="85" y="143">load balancer</text><rect class="boxAcc" x="250" y="20" width="200" height="56" rx="8"/><text x="350" y="43" class="mono">liveness</text><text x="350" y="62" font-weight="400" font-size="12">process còn sống, không treo?</text><rect class="boxAcc" x="250" y="102" width="200" height="56" rx="8"/><text x="350" y="125" class="mono">readiness</text><text x="350" y="144" font-weight="400" font-size="12">lúc này phục vụ được không?</text><rect class="boxAcc" x="250" y="184" width="200" height="56" rx="8"/><text x="350" y="207" class="mono">startup</text><text x="350" y="226" font-weight="400" font-size="12">khởi động xong chưa?</text><rect class="boxBad" x="530" y="20" width="170" height="56" rx="8"/><text x="615" y="43" class="badT">fail → RESTART</text><text x="615" y="62" font-weight="400" font-size="12">tắt container, tạo cái mới</text><rect class="box" x="530" y="102" width="170" height="56" rx="8"/><text x="615" y="125">fail → rút khỏi LB</text><text x="615" y="144" font-weight="400" font-size="12" class="muted">không restart</text><rect class="box" x="530" y="184" width="170" height="56" rx="8"/><text x="615" y="207">chưa xong → chờ</text><text x="615" y="226" font-weight="400" font-size="12" class="muted">chưa chạy 2 probe kia</text></g><line class="ln" x1="150" y1="115" x2="246" y2="50" marker-end="url(#hInk)"/><line class="ln" x1="150" y1="130" x2="246" y2="130" marker-end="url(#hInk)"/><line class="ln" x1="150" y1="145" x2="246" y2="210" marker-end="url(#hInk)"/><line class="lnBad" x1="450" y1="48" x2="526" y2="48" marker-end="url(#hBad)"/><line class="ln" x1="450" y1="130" x2="526" y2="130" marker-end="url(#hInk)"/><line class="ln" x1="450" y1="212" x2="526" y2="212" marker-end="url(#hInk)"/></svg>
<p class="fig-caption">Quy tắc ngắn: liveness chỉ hỏi về chính process; readiness mới hỏi về dependency.</p>
</div>

**Liveness**: process có bị hỏng mà không tự hồi phục được không. Fail thì bị **restart**. Gần như không kiểm tra gì: trả lời được là sống.

**Readiness**: lúc này có phục vụ được request không. Fail thì **ngừng nhận traffic**, không restart. Đây là chỗ kiểm tra dependency bắt buộc như DB.

**Startup**: đã khởi động xong chưa (migration, warm-up). Chưa xong thì orchestrator chờ.

### Bẫy kinh điển: DB trong liveness

<Compare :labels="['DB trong liveness', 'DB trong readiness']" caption="Restart không sửa được DB. Lỗi của dependency phải làm instance ngừng nhận traffic, không phải bị tắt rồi khởi động lại.">
<template #a>
<svg viewBox="0 0 720 230" role="img" aria-label="DB chập chờn làm mọi pod fail liveness và bị restart đồng loạt"><g font-size="13" font-weight="600" text-anchor="middle"><rect class="boxBad" x="20" y="90" width="120" height="50" rx="8"/><text x="80" y="112">DB</text><text x="80" y="129" font-weight="400" font-size="12" class="badT">chập chờn 30s</text><rect class="boxBad" x="230" y="20" width="150" height="44" rx="8"/><text x="305" y="47">Pod 1: live ✗</text><rect class="boxBad" x="230" y="93" width="150" height="44" rx="8"/><text x="305" y="120">Pod 2: live ✗</text><rect class="boxBad" x="230" y="166" width="150" height="44" rx="8"/><text x="305" y="193">Pod 3: live ✗</text><rect class="boxBad" x="490" y="80" width="210" height="70" rx="8"/><text x="595" y="105" class="badT">restart cả 3 cùng lúc</text><text x="595" y="125" font-weight="400" font-size="12">app sập hoàn toàn,</text><text x="595" y="141" font-weight="400" font-size="12">kể cả khi DB đã hồi</text></g><line class="lnBad dash" x1="140" y1="110" x2="226" y2="42"/><line class="lnBad dash" x1="140" y1="115" x2="226" y2="115"/><line class="lnBad dash" x1="140" y1="120" x2="226" y2="188"/><line class="lnBad" x1="380" y1="42" x2="486" y2="100" marker-end="url(#hBad)"/><line class="lnBad" x1="380" y1="115" x2="486" y2="115" marker-end="url(#hBad)"/><line class="lnBad" x1="380" y1="188" x2="486" y2="130" marker-end="url(#hBad)"/></svg>
</template>
<template #b>
<svg viewBox="0 0 720 230" role="img" aria-label="DB chập chờn làm pod fail readiness, bị rút khỏi LB rồi tự vào lại"><g font-size="13" font-weight="600" text-anchor="middle"><rect class="boxBad" x="20" y="90" width="120" height="50" rx="8"/><text x="80" y="112">DB</text><text x="80" y="129" font-weight="400" font-size="12" class="badT">chập chờn 30s</text><rect class="boxAcc" x="230" y="20" width="150" height="44" rx="8"/><text x="305" y="47">Pod 1: ready ✗</text><rect class="boxAcc" x="230" y="93" width="150" height="44" rx="8"/><text x="305" y="120">Pod 2: ready ✗</text><rect class="boxAcc" x="230" y="166" width="150" height="44" rx="8"/><text x="305" y="193">Pod 3: ready ✗</text><rect class="boxOk" x="490" y="80" width="210" height="70" rx="8"/><text x="595" y="105" class="okT">tạm rút khỏi LB, vẫn sống</text><text x="595" y="125" font-weight="400" font-size="12">DB hồi → ready ✓</text><text x="595" y="141" font-weight="400" font-size="12">→ tự nhận traffic lại</text></g><line class="lnBad dash" x1="140" y1="110" x2="226" y2="42"/><line class="lnBad dash" x1="140" y1="115" x2="226" y2="115"/><line class="lnBad dash" x1="140" y1="120" x2="226" y2="188"/><line class="lnOk" x1="380" y1="42" x2="486" y2="100" marker-end="url(#hOk)"/><line class="lnOk" x1="380" y1="115" x2="486" y2="115" marker-end="url(#hOk)"/><line class="lnOk" x1="380" y1="188" x2="486" y2="130" marker-end="url(#hOk)"/></svg>
</template>
</Compare>

## 3. Health check trong ASP.NET Core

<div class="fig">
<svg viewBox="0 0 720 230" role="img" aria-label="Endpoint gọi HealthCheckService, chạy song song các check, lấy trạng thái tệ nhất và map ra HTTP status"><g font-size="13" font-weight="600" text-anchor="middle"><rect class="box" x="10" y="85" width="120" height="56" rx="8"/><text x="70" y="109" class="mono">GET /health</text><text x="70" y="127" font-size="12" font-weight="400" class="muted">MapHealthChecks</text><rect class="boxAcc" x="170" y="85" width="150" height="56" rx="8"/><text x="245" y="109" class="mono">HealthCheck-</text><text x="245" y="127" class="mono">Service</text><rect class="box" x="370" y="14" width="150" height="40" rx="8"/><text x="445" y="39" class="mono">self</text><rect class="box" x="370" y="93" width="150" height="40" rx="8"/><text x="445" y="118" class="mono">database</text><rect class="box" x="370" y="172" width="150" height="40" rx="8"/><text x="445" y="197" class="mono">…</text></g><line class="ln" x1="130" y1="113" x2="166" y2="113" marker-end="url(#hInk)"/><line class="ln" x1="320" y1="105" x2="366" y2="38" marker-end="url(#hInk)"/><line class="ln" x1="320" y1="113" x2="366" y2="113" marker-end="url(#hInk)"/><line class="ln" x1="320" y1="121" x2="366" y2="190" marker-end="url(#hInk)"/><text x="300" y="165" font-size="11" class="muted" text-anchor="middle">chạy song song</text><g font-size="12"><text x="545" y="30" font-weight="600">lấy trạng thái tệ nhất</text><rect class="boxOk" x="545" y="44" width="165" height="34" rx="6"/><text x="556" y="66">Healthy → <tspan class="mono" font-weight="600">200</tspan></text><rect class="boxOk" x="545" y="94" width="165" height="34" rx="6"/><text x="556" y="116">Degraded → <tspan class="mono" font-weight="600">200</tspan></text><rect class="boxBad" x="545" y="144" width="165" height="34" rx="6"/><text x="556" y="166">Unhealthy → <tspan class="mono" font-weight="600">503</tspan></text></g></svg>
<p class="fig-caption">Không cần package nào: tất cả có sẵn trong Microsoft.AspNetCore.App.</p>
</div>

### Các thành phần

**`AddHealthChecks()`**: đăng ký `HealthCheckService`, trả về builder để thêm check.

**`IHealthCheck`**: một check, trả `HealthCheckResult` (`Healthy` / `Degraded` / `Unhealthy`). Thêm bằng `.AddCheck<T>(...)` hoặc lambda `.AddCheck("name", () => ...)`.

**`MapHealthChecks("/health")`**: một **endpoint** (giống `MapControllers`, không phải middleware chen vào giữa), gọi service rồi ghi status code.

### Tag và Predicate {#tag-predicate}

**Tag + Predicate**: gắn tag khi đăng ký check, lọc bằng `Predicate` khi map. Cách tách liveness/readiness trên cùng một app:

```csharp
// Program.cs (M2, khi đã có DatabaseHealthCheck)
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database", tags: ["ready"]);

// live: không chạy check nào. Trả lời được là process còn sống → 200
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });

// ready: chỉ chạy check có tag "ready"
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = c => c.Tags.Contains("ready") });
```

`HealthCheckOptions` nằm trong namespace `Microsoft.AspNetCore.Diagnostics.HealthChecks`. `Predicate = _ => false` là cách gọn nhất cho liveness: không có check nào chạy, kết quả là `Healthy`, nên endpoint chỉ còn đo "process có trả lời HTTP được không".

<div class="fig">
<svg viewBox="0 0 720 170" role="img" aria-label="Hai endpoint lọc check theo tag"><g font-size="13" font-weight="600" text-anchor="middle"><rect class="boxAcc" x="20" y="20" width="200" height="44" rx="8"/><text x="120" y="47" class="mono">/health/live</text><rect class="boxAcc" x="20" y="106" width="200" height="44" rx="8"/><text x="120" y="133" class="mono">/health/ready</text><rect class="box" x="400" y="20" width="300" height="44" rx="8"/><text x="550" y="47"><tspan font-weight="400" class="muted">không chạy check nào → Healthy</tspan></text><rect class="box" x="400" y="106" width="300" height="44" rx="8"/><text x="550" y="133"><tspan class="mono">database</tspan> <tspan font-weight="400" class="muted">tag: ready (M2)</tspan></text></g><line class="ln" x1="220" y1="42" x2="396" y2="42" marker-end="url(#hInk)"/><line class="ln" x1="220" y1="128" x2="396" y2="128" marker-end="url(#hInk)"/><text x="308" y="34" font-size="12" text-anchor="middle" class="muted mono">Predicate = _ =&gt; false</text><text x="308" y="120" font-size="12" text-anchor="middle" class="muted">Predicate: tag "ready"</text></svg>
<p class="fig-caption">Biến thể khác: template ServiceDefaults của .NET Aspire đăng ký một check "self" có tag live, /alive chỉ chạy tag đó, /health chạy tất cả. Cùng ý: liveness không đụng dependency.</p>
</div>

### Hành vi mặc định

| Hành vi mặc định | Điều kiện |
|---|---|
| Chưa đăng ký check nào | Trả `200 Healthy` (`text/plain`) |
| Body | Chỉ có chữ trạng thái, không có chi tiết từng check. Muốn JSON phải tự viết `ResponseWriter` |
| Cache | Có header chống cache (`AllowCachingResponses = false`) |
| Mỗi lần gọi | Chạy lại **tất cả** check, song song, không cache kết quả |
| Exception trong check | Không làm sập endpoint: check đó tính là `failureStatus` (mặc định `Unhealthy`) |
| Lifetime | Mỗi lần chạy check có **DI scope riêng**, inject `DbContext` được |

### Status đổi theo thời gian

**Status không đo bằng độ chậm.** Bên gọi không tự đoán "app chậm nên chưa ready" hay "app chậm nên Degraded". Status là thứ **code check của bạn trả về**. Một vòng đời điển hình:

```
                 app vừa start ──► đang warm-up ──► sẵn sàng ──► FakeBank chậm
/health/live          200              200            200           200
/health/ready         503              503            200           200 (Degraded)
```

- **Live** không check gì bên ngoài, nên kể cả lúc warm-up vẫn trả 200 rất nhanh.
- **Ready** trả `Unhealthy` cho tới khi warm-up xong, ví dụ một cờ được bật sau khi load cache và kết nối được DB. Load balancer thấy 503 nên chưa gửi traffic vào.
- **Degraded** là lúc app đã ready nhưng một phần phụ đang yếu, ví dụ check FakeBank thấy phản hồi quá 2s. Vẫn trả 200 nên traffic vẫn vào.

Còn "chậm" thật sự là chuyện **timeout của bên gọi**. Nếu live probe bị timeout (quá `timeoutSeconds`) đủ `failureThreshold` lần lúc cold start, orchestrator như Kubernetes sẽ khởi động lại app. Đó là lý do có **startup probe** (hoặc `initialDelaySeconds`): cho app thời gian khởi động trước khi bắt đầu check live.

### Dễ nhầm

| Dễ nhầm | Khác nhau ở đâu |
|---|---|
| Liveness và readiness | Fail thì bị restart, hay chỉ bị rút khỏi load balancer |
| Degraded và Unhealthy | Vẫn phục vụ được dù thiếu phần phụ (200), hay không phục vụ được (503). Cả hai do check của bạn trả về, không phải do bên gọi đo độ chậm |
| `IHealthCheck` và `IExceptionHandler` | Đều là class bạn đăng ký, nhưng health check chạy trong scope riêng, exception handler là singleton |
| Health check và monitoring | Health check trả lời có/không cho máy ra quyết định; monitoring (metrics, log) giúp người tìm nguyên nhân |

## 4. Áp dụng vào PayoutHub

### M1: làm ngay

**M1 (bây giờ):** chưa có DB, nên chỉ cần app tự trả lời.

1. Đăng ký health checks trong `Program.cs`.
2. Map endpoint `/health`, gọi thử bằng `PayoutHub.Api.http` hoặc browser, thấy `200 Healthy`.
3. Tự trả lời: endpoint này đang đóng vai liveness hay readiness? Vì sao lúc này hai cái là một?

### M2: khi có DbContext

**M2 (khi có DbContext):** viết `DatabaseHealthCheck` gọi `db.Database.CanConnectAsync(ct)`, gắn tag `ready`, tách `/health/live` và `/health/ready`. Có package `AddDbContextCheck<T>()` làm sẵn việc này, nhưng theo quy ước project thì viết tay trước.

::: warning Nên tránh
- Check DB hay FakeBank trong liveness.
- Check nặng (`COUNT(*)` trên 100.000 dòng) hoặc không có timeout. Check bị gọi vài giây một lần, nhân với số instance.
- Trả JSON chi tiết (tên DB, exception message) ra ngoài mà không giới hạn truy cập.
:::

## Câu hỏi phỏng vấn {#interview}

Ôn nhanh trước khi đi phỏng vấn. Mỗi câu có trả lời nhanh, bản chất, ví dụ thật và bẫy.

### Liveness và readiness khác nhau thế nào? Check DB đặt ở đâu? <Badge type="warning" text="hay bị hỏi" /> {#liveness-vs-readiness}

::: tip Trả lời nhanh
Liveness hỏi "process còn sống không", fail thì orchestrator **restart**. Readiness hỏi "lúc này phục vụ được không", fail thì instance bị **gỡ khỏi traffic**, không restart, khỏe lại thì tự được đưa vào lại. Check DB đặt ở readiness, không bao giờ ở liveness: restart không sửa được DB.
:::

::: info Bản chất
- **DB sập → readiness fail**: sau khoảng `periodSeconds × failureThreshold` (mặc định 10s × 3 ≈ 30s) pod bị gỡ khỏi Service, process vẫn chạy, connection pool và cache còn nguyên. DB hồi → probe pass → pod nhận traffic lại, không ai phải làm gì.
- **Code**: `MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false })` (không chạy check nào) và `/health/ready` lọc check có tag `"ready"`. Xem [Tag và Predicate](#tag-predicate).
- **Thời gian phản ứng** là trade-off: `periodSeconds` ngắn, `failureThreshold` thấp thì phát hiện nhanh nhưng dễ "rút nhầm" khi DB chỉ chậm một nhịp.
:::

::: details Ở dự án thật
PayoutHub M1: chưa có DB nên `/health` chỉ là liveness, và lúc này liveness với readiness là một. M2: thêm `DatabaseHealthCheck` gắn tag `ready`, tách `/health/live` và `/health/ready`. FakeBank **không** vào readiness: thiếu nó PayoutHub vẫn xem và duyệt payout được.

**Nói trung thực khi chưa từng chạy Kubernetes:** "Tôi chưa vận hành Kubernetes trên production, nhưng tôi hiểu probe hoạt động thế này: …" rồi trả lời như trên, kèm ví dụ PayoutHub. Interviewer chấm hiểu biết và sự trung thực; bịa kinh nghiệm thì follow-up thứ hai là lộ. Nối được với kinh nghiệm thật càng tốt: "ở công ty hiện tại, web farm IIS sau load balancer cũng có trang ping, và tôi thấy vấn đề tương tự khi…".
:::

::: warning Bẫy & follow-up
**"DB sập thì mọi pod cùng not-ready. Vậy khác gì app sập?"**

Với user thì giống: Service không còn pod nào ready, request nhận lỗi. Khác ở chỗ **phục hồi**: pod không bị restart nên DB hồi là cả hệ thống tự quay lại trong một chu kỳ probe, không có cold start đồng loạt, không có vòng restart liên tục. Trung thực về trade-off: nếu check DB chập chờn thì cả fleet cùng chập chờn ra vào, nên check phải nhẹ, có timeout, và chỉ đưa dependency mà thiếu nó instance vô dụng hoàn toàn.

**"Sao không bỏ hẳn readiness, để request tự lỗi?"**

Lúc khởi động (warm-up, chưa có connection) và lúc tắt (graceful shutdown), readiness là cách duy nhất báo "đừng gửi request vào tôi" mà không bị restart.
:::

## Hỏi đáp

::: details Có nên đưa FakeBank vào readiness check không?
**Không.** Thiếu FakeBank thì PayoutHub vẫn xem payout, vẫn duyệt được, và worker ở M4 có retry/circuit breaker lo phần chuyển tiền. Đưa vào readiness thì FakeBank sập kéo theo PayoutHub ngừng nhận **mọi** request. Chỉ check dependency mà thiếu nó thì instance vô dụng hoàn toàn. Đây là câu hỏi thiết kế hay khi phỏng vấn.
:::

::: details Vì sao Degraded vẫn trả 200?
Degraded nghĩa là vẫn phục vụ được dù chậm hoặc thiếu phần phụ. Trả 503 sẽ làm load balancer rút instance và dồn tải sang instance khác, dễ làm tình hình tệ hơn. Muốn đổi thì cấu hình `HealthCheckOptions.ResultStatusCodes`.
:::

::: details Check ném exception thì GlobalExceptionHandler có chạy không?
**Không.** `HealthCheckService` tự bắt exception trong check và ghi nhận check đó là `Unhealthy`, nên endpoint trả 503 bình thường. Exception không bao giờ bay tới middleware.
:::

::: details Bảo mật: endpoint health check có cần giới hạn không?
Response mặc định chỉ có chữ trạng thái nên an toàn. Nếu trả JSON chi tiết thì coi như công khai tên DB, host, lỗi nội bộ, cùng lý do với việc không đưa `exception.Message` vào ProblemDetails. Endpoint trả về `IEndpointConventionBuilder` nên giới hạn được như mọi endpoint: `.RequireHost("*:8081")` (chỉ trả lời trên port nội bộ) hoặc `.RequireAuthorization(...)`. Probe của Kubernetes không gửi token, nên thường chọn port nội bộ.

Thêm một bẫy ở M3: khi có fallback policy "mọi endpoint đều cần đăng nhập", health check bắt đầu trả 401 cho probe. Cần `.AllowAnonymous()` cho nó.
:::

::: details Timeout cho check gọi ra ngoài đặt thế nào?
`AddCheck<T>(name, tags: ..., timeout: TimeSpan.FromSeconds(2))` và truyền `CancellationToken` xuống. Probe của orchestrator có timeout riêng; check treo lâu hơn thế thì probe coi là fail mà bạn không biết vì sao.
:::

## Tự kiểm tra

::: details 1. Liveness và readiness khác nhau ở hành động của orchestrator khi fail như thế nào?
Liveness fail thì container bị restart. Readiness fail thì chỉ bị rút khỏi danh sách nhận traffic, hồi lại thì được đưa vào lại.
:::

::: details 2. Vì sao đặt check DB vào liveness là nguy hiểm?
Dependency chập chờn làm mọi instance fail cùng lúc, bị restart đồng loạt, nên một sự cố nhỏ ở DB thành sập toàn bộ app. Restart cũng không sửa được DB.
:::

::: details 3. Inject DbContext vào một IHealthCheck có bị captive dependency như với IExceptionHandler không?
Không. Mỗi lần chạy check được tạo trong scope riêng, `DbContext` được tạo mới và dispose sau mỗi lần check.
:::
