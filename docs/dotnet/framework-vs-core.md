---
title: ".NET Framework vs .NET"
---

# .NET Framework vs .NET

CV của bạn là Web Forms 4.8, nên interviewer sẽ thử xem bạn còn bắt nhịp được .NET hiện đại không. Đây là phần cần nói trôi nhất.

## Bản đồ phiên bản {#version-map}

- **.NET Framework 4.8.1** là bản cuối. Chỉ còn sửa lỗi bảo mật, chỉ chạy Windows, cài chung toàn máy và đi theo OS.
- **.NET Core 1.0 → 3.1**, sau đó đổi tên thành **.NET 5** (2020) và bỏ chữ "Core". Riêng tên _ASP.NET Core_ và _EF Core_ vẫn giữ.
- Mỗi tháng 11 ra một bản. Số chẵn là LTS (3 năm), số lẻ là STS (từ .NET 9 được kéo lên 2 năm).
- **.NET 8** LTS (11/2023, hết hỗ trợ 11/2026) và **.NET 10** LTS (11/2025). Khi phỏng vấn, nói theo .NET 8/10 là an toàn.

## Bảng đối chiếu: thứ bạn dùng hằng ngày → thứ thay thế {#framework-to-core-map}

| Web Forms / Framework 4.8 | ASP.NET Core / .NET |
|---|---|
| `Web.config` + transforms | `appsettings.json`, `appsettings.{Env}.json`, env vars, user secrets → `IConfiguration` / `IOptions<T>` |
| `Global.asax` (`Application_Start`, `BeginRequest`) | `Program.cs`: đăng ký service + dựng middleware pipeline |
| HttpModule / HttpHandler | Middleware / endpoint |
| `HttpContext.Current` (static) | `HttpContext` được truyền vào; `IHttpContextAccessor` khi thật sự cần |
| Page lifecycle, ViewState, postback, server controls | Không có tương đương. Gần nhất về mô hình là Razor Pages; hoặc API + React/Vue |
| Session in-proc mặc định | Phải bật `AddSession()`, lưu qua `IDistributedCache`, chỉ lưu byte/string |
| Forms Authentication | Cookie authentication / ASP.NET Core Identity / JWT |
| `System.Web.Caching.Cache` | `IMemoryCache`, `IDistributedCache`, `HybridCache` (.NET 9) |
| Unity / Autofac / tự `new` | DI container dựng sẵn |
| log4net / NLog trực tiếp | `ILogger<T>` (log4net/Serilog chỉ còn là provider phía sau) |
| IIS + `System.Web` | Kestrel, có hoặc không có IIS/Nginx phía trước |
| ASMX / WCF service | Web API, gRPC, CoreWCF (bản cộng đồng) |
| `packages.config`, csproj kiểu cũ | SDK-style csproj + `PackageReference` |
| AppDomain, Remoting | `AssemblyLoadContext`; Remoting bị bỏ hẳn |

## .NET Framework và .NET (Core) khác nhau thế nào? <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#framework-vs-core}

::: tip Trả lời nhanh
.NET Framework chỉ chạy Windows, cài chung toàn máy và gắn chặt với IIS qua `System.Web`. .NET là bản viết lại: cross-platform, mỗi app mang runtime và version riêng, modular qua NuGet, có sẵn DI, config, logging, và nhanh hơn đáng kể. Framework 4.8 vẫn được support nhưng không còn tính năng mới.
:::

::: info Bản chất
- **Side-by-side**: nhiều app trên cùng server có thể chạy .NET 8 và .NET 10 song song. Framework thì nâng lên là ảnh hưởng mọi app trên máy.
- **Deploy**: framework-dependent hoặc self-contained (đóng gói luôn runtime), chạy trên Docker/Linux được.
- **Không còn `System.Web`**: đây là lý do gốc khiến Web Forms không port sang được.
- **Hiệu năng**: Kestrel, `Span<T>`, tiered JIT, Dynamic PGO; framework cũng được tối ưu lại từ đầu với async.
- Open-source và phát hành mỗi năm một bản.
:::

::: details Ở dự án thật
Có thể nói: "Ở dự án hiện tại, app chạy Framework 4.8 trên IIS. Muốn nâng runtime là phải tính tới Windows Server, và các app khác trên cùng máy. Với .NET hiện đại, app tự mang runtime, nâng version theo từng service và chạy trong container được. Khác biệt lớn nhất khi chuyển không nằm ở C#, mà ở chỗ phải bỏ những thứ dựa vào `System.Web`: `HttpContext.Current`, Session, page lifecycle."
:::

::: warning Bẫy & follow-up
**"Web Forms có chạy trên .NET 8 được không?"**

Không. `System.Web` không tồn tại trên .NET hiện đại. Phần UI phải viết lại; business logic tách ra được thì mang theo.

**"Thư viện viết cho Framework có dùng lại được không?"**

Nếu target **.NET Standard 2.0** thì dùng được ở cả hai bên, đây là cách chuẩn khi migrate từng bước. Thư viện target thẳng `net48` thì .NET có thể load nhờ compatibility shim, nhưng sẽ lỗi lúc chạy nếu nó gọi API không còn (System.Web, WCF server, AppDomain).

**".NET Standard là gì, giờ còn cần không?"**

Là một "hợp đồng API" chung để thư viện chạy được trên nhiều runtime. Từ .NET 5 thì không còn version mới. Nay chỉ còn dùng .NET Standard 2.0 cho thư viện phải chia sẻ với Framework; code mới thì target thẳng `net8.0`/`net10.0`.
:::

## Kestrel là gì? Có còn cần IIS không? {#kestrel}

::: tip Trả lời nhanh
Kestrel là web server cross-platform dựng sẵn trong ASP.NET Core. App luôn có server bên trong nó; IIS hoặc Nginx chỉ là reverse proxy tùy chọn đặt phía trước, lo TLS, load balancing, chia port 80/443 cho nhiều app và quản lý process.
:::

::: info Bản chất
Trên IIS, ASP.NET Core chạy qua **ASP.NET Core Module (ANCM)** theo 2 kiểu:

- **In-process** (mặc định): app chạy ngay trong `w3wp.exe`, dùng IIS HTTP Server thay cho Kestrel. Nhanh hơn vì không qua thêm một hop.
- **Out-of-process**: IIS chỉ forward request tới Kestrel đang chạy trong process riêng.

Trên Linux/container: thường là Kestrel, đặt sau Nginx, load balancer hoặc ingress.
:::

::: warning Bẫy & follow-up
**"Expose Kestrel thẳng ra internet được không?"**

Được, Kestrel đủ ổn định để làm edge server. Nhưng thực tế vẫn hay đặt sau proxy để terminate TLS tập trung, có WAF, và gom nhiều app về một port.

**"Đặt sau proxy thì cần chú ý gì?"**

Bật Forwarded Headers middleware để app biết scheme (https) và IP thật của client. Không có nó, redirect sang http sai và log IP toàn là IP của proxy.
:::

## Tại sao không còn `HttpContext.Current`? {#httpcontext-current}

::: tip Trả lời nhanh
Vì truy cập static ngầm như vậy khó test, che giấu dependency, và trong Framework nó phải dựa vào SynchronizationContext để "đi theo" request qua các thread. ASP.NET Core truyền `HttpContext` vào một cách tường minh: controller có sẵn property, middleware nhận làm tham số. Service ở tầng dưới mà thật sự cần thì dùng `IHttpContextAccessor`.
:::

::: details Ở dự án thật
Code Web Forms hay có helper static gọi `HttpContext.Current.Session["UserId"]` ở tầng business. Khi migrate đây là chỗ đau nhất. Cách xử lý sạch là đẩy thông tin cần (user id, tenant, culture) lên thành tham số, hoặc gom vào một service kiểu `ICurrentUser` được inject. Business logic như vậy cũng test được mà không cần web.
:::

::: warning Bẫy & follow-up
**"Dùng `IHttpContextAccessor` trong singleton có sao không?"**

Inject accessor thì được, vì nó đọc qua `AsyncLocal` nên luôn ra đúng request hiện tại. Nhưng không được lưu `HttpContext` vào field, và không dùng ở background thread chạy sau khi request đã xong: lúc đó context là null hoặc đã bị tái sử dụng.
:::

## Config hoạt động thế nào? Thay `Web.config` bằng gì? {#configuration}

::: tip Trả lời nhanh
Config là nhiều nguồn chồng lên nhau theo thứ tự, nguồn sau ghi đè nguồn trước: `appsettings.json` → `appsettings.{Environment}.json` → user secrets (chỉ Development) → environment variables → command-line. Đọc qua `IConfiguration`, hoặc tốt hơn là bind vào class bằng Options pattern.
:::

::: info Bản chất
```csharp
// appsettings.json: { "Payout": { "MinAmount": 50, "Currency": "AUD" } }
public sealed class PayoutOptions { public decimal MinAmount { get; init; } public string Currency { get; init; } = ""; }

builder.Services.Configure<PayoutOptions>(builder.Configuration.GetSection("Payout"));

public class PayoutService(IOptions<PayoutOptions> options) { /* options.Value.MinAmount */ }
```

| Interface | Lifetime | Reload khi file đổi |
|---|---|---|
| `IOptions<T>` | Singleton | Không, đọc 1 lần |
| `IOptionsSnapshot<T>` | Scoped | Có, mỗi request đọc lại |
| `IOptionsMonitor<T>` | Singleton | Có, kèm callback `OnChange` |
:::

::: details Ở dự án thật
`Web.Release.config` transform tương ứng với `appsettings.Production.json` cộng env vars được set trong pipeline deploy. Connection string và API key không commit vào repo: dev dùng user secrets, môi trường thật dùng env vars hoặc Key Vault.
:::

::: warning Bẫy & follow-up
**"Set key lồng nhau bằng environment variable thế nào?"**

Dùng hai dấu gạch dưới: `Payout__MinAmount=100`, `ConnectionStrings__Default=...`.

**"Inject `IOptionsSnapshot` vào singleton được không?"**

Không: nó là scoped, sẽ lỗi scope validation. Singleton cần giá trị mới nhất thì dùng `IOptionsMonitor`.
:::
