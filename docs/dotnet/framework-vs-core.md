---
title: ".NET Framework vs .NET"
---

# .NET Framework vs .NET

CV của bạn là Web Forms 4.8, nên interviewer sẽ thử xem bạn còn bắt nhịp được .NET hiện đại không. Đây là phần cần nói trôi nhất.

## Bản đồ phiên bản {#version-map}

- **.NET Framework 4.8.1** là bản cuối. Chỉ còn sửa lỗi bảo mật, chỉ chạy Windows, cài chung toàn máy và đi theo OS.
- **.NET Core 1.0 → 3.1**, sau đó đổi tên thành **.NET 5** (2020) và bỏ chữ "Core". Riêng tên _ASP.NET Core_ và _EF Core_ vẫn giữ.
- Mỗi tháng 11 ra một bản. Số chẵn là <T>LTS</T>, số lẻ là <T>STS</T>.
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
| Unity / Autofac / tự `new` | <T>DI</T> container dựng sẵn |
| log4net / NLog trực tiếp | `ILogger<T>` (log4net/Serilog chỉ còn là provider phía sau) |
| <T>IIS</T> + `System.Web` | <T>Kestrel</T>, có hoặc không có IIS/Nginx phía trước |
| ASMX / WCF service | Web API, <T>gRPC</T>, CoreWCF (bản cộng đồng) |
| `packages.config`, csproj kiểu cũ | <T>SDK-style</T> csproj + `PackageReference` |
| AppDomain, Remoting | `AssemblyLoadContext`; Remoting bị bỏ hẳn |

## .NET Framework và .NET (Core) khác nhau thế nào? <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#framework-vs-core}

::: tip Trả lời nhanh
.NET Framework chỉ chạy Windows, cài chung toàn máy và gắn chặt với <T>IIS</T> qua `System.Web`. .NET là bản viết lại: cross-platform, mỗi app mang runtime và version riêng, modular qua <T>NuGet</T>, có sẵn <T>DI</T>, config, logging, và nhanh hơn đáng kể. Framework 4.8 vẫn được support nhưng không còn tính năng mới.
:::

::: info Bản chất
- **Side-by-side**: nhiều app trên cùng server có thể chạy .NET 8 và .NET 10 song song. Framework thì nâng lên là ảnh hưởng mọi app trên máy.
- **Deploy**: framework-dependent hoặc self-contained (đóng gói luôn runtime), chạy trên Docker/Linux được.
- **Không còn `System.Web`**: đây là lý do gốc khiến Web Forms không port sang được.
- **Hiệu năng**: <T>Kestrel</T>, `Span<T>`, tiered <T>JIT</T>, Dynamic <T>PGO</T>; framework cũng được tối ưu lại từ đầu với async.
- Open-source và phát hành mỗi năm một bản.
:::

::: details Ở dự án thật
Có thể nói: "Ở dự án hiện tại, app chạy Framework 4.8 trên IIS. Muốn nâng runtime là phải tính tới Windows Server, và các app khác trên cùng máy. Với .NET hiện đại, app tự mang runtime, nâng version theo từng service và chạy trong container được. Khác biệt lớn nhất khi chuyển không nằm ở C#, mà ở chỗ phải bỏ những thứ dựa vào `System.Web`: `HttpContext.Current`, Session, page lifecycle."
:::

::: warning Bẫy & follow-up
**"Web Forms có chạy trên .NET 8 được không?"**

Không. `System.Web` không tồn tại trên .NET hiện đại. Phần UI phải viết lại; business logic tách ra được thì mang theo.

**"Thư viện viết cho Framework có dùng lại được không?"**

Nếu target **.NET Standard 2.0** thì dùng được ở cả hai bên, đây là cách chuẩn khi migrate từng bước. Thư viện target thẳng `net48` thì .NET có thể load nhờ compatibility shim, nhưng sẽ lỗi lúc chạy nếu nó gọi API không còn (<T>System.Web</T>, WCF server, AppDomain).

**".NET Standard là gì, giờ còn cần không?"**

Là một "hợp đồng API" chung để thư viện chạy được trên nhiều runtime. Từ .NET 5 thì không còn version mới. Nay chỉ còn dùng .NET Standard 2.0 cho thư viện phải chia sẻ với Framework; code mới thì target thẳng `net8.0`/`net10.0`.
:::

## Kestrel là gì? Có còn cần IIS không? {#kestrel}

::: tip Trả lời nhanh
Kestrel là web server cross-platform dựng sẵn trong ASP.NET Core. App luôn có server bên trong nó; <T>IIS</T> hoặc Nginx chỉ là <T>reverse proxy</T> tùy chọn đặt phía trước, lo <T>TLS</T>, load balancing, chia port 80/443 cho nhiều app và quản lý process.
:::

::: info Bản chất
Trên IIS, ASP.NET Core chạy qua <T k="ancm">ASP.NET Core Module (ANCM)</T> theo 2 kiểu:

- **In-process** (mặc định): app chạy ngay trong <T k="w3wp">worker process</T> `w3wp.exe` của IIS, dùng IIS HTTP Server thay cho Kestrel. Nhanh hơn vì không qua thêm một hop.
- **Out-of-process**: IIS chỉ forward request tới Kestrel đang chạy trong process riêng.

Trên Linux/container: thường là Kestrel, đặt sau Nginx, load balancer hoặc ingress.
:::

::: warning Bẫy & follow-up
**"Expose Kestrel thẳng ra internet được không?"**

Được, Kestrel đủ ổn định để làm edge server. Nhưng thực tế vẫn hay đặt sau proxy để terminate TLS tập trung, có <T>WAF</T>, và gom nhiều app về một port.

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

Không: nó là scoped, sẽ lỗi scope validation. Singleton cần giá trị mới nhất thì dùng `IOptionsMonitor`. Chi tiết và timeline ở [Options pattern](/aspnet-core/options-pattern#options-interfaces).
:::

## Migrate một app .NET Framework lên .NET 8 thế nào? <Badge type="warning" text="cả 2 job hỏi" /> {#migration-strategy}

::: tip Trả lời nhanh
Không <T>big-bang</T>. Chuyển dần theo <T>strangler fig</T>: dựng một app ASP.NET Core mới đứng trước (reverse proxy bằng <T>YARP</T>); route nào đã chuyển thì vào app mới, còn lại proxy về app cũ. Thứ tự: thư viện dùng chung sang <T k="net standard">.NET Standard 2.0</T> / multi-target trước, rồi data access (<T>EF6</T> → <T>EF Core</T>), rồi từng nhóm endpoint. Cần chia sẻ session/auth giữa hai app thì dùng <T>System.Web adapters</T>. Bước nào cũng phải deploy được và rollback được.
:::

::: info Bản chất
```
Giai đoạn 1            Giai đoạn 2                 Giai đoạn 3
client                 client                      client
  │                      │                           │
YARP (ASP.NET Core)    YARP                        ASP.NET Core app
  │ mọi route            ├─ /payouts → app mới        (app cũ đã tắt)
  ▼                      └─ còn lại  → app cũ
app cũ (IIS)
```

**Thay gì:**

| .NET Framework | .NET 8 |
|---|---|
| `System.Web`, `HttpContext.Current` | `HttpContext` được truyền vào / `IHttpContextAccessor` ([chi tiết](/dotnet/framework-vs-core#httpcontext-current)) |
| `Web.config` | `appsettings.json` + Options pattern ([chi tiết](/dotnet/framework-vs-core#configuration)) |
| `Global.asax`, HTTP modules | `Program.cs` + middleware |
| MVC 5 / Web API 2 | ASP.NET Core MVC (controller MVC và API đã gộp làm một) |
| EF6 (EDMX) | EF Core: code-first, hoặc `dotnet ef dbcontext scaffold` từ DB có sẵn |
| WCF server | <T>gRPC</T> / REST, hoặc CoreWCF nếu client không đổi được |
| Session, Forms auth | Cookie auth; chia sẻ với app cũ qua System.Web adapters |

**Tool**: **.NET Upgrade Assistant** (extension Visual Studio / CLI) chuyển csproj sang SDK-style, đổi package, và dựng sẵn project ASP.NET Core + YARP cho kiểu migrate từng bước.

**Dễ nhầm: EF6 → EF Core không phải đổi namespace là xong**

| EF6 | EF Core |
|---|---|
| Lazy loading bật mặc định | Tắt; muốn có phải cài Proxies và bật tay. Thiếu `Include` là navigation bị null |
| Có EDMX designer | Không có EDMX; model nằm trong code |
| Query không dịch được sang SQL thì có thể lặng lẽ chạy trên memory | Từ EF Core 3: ném exception (chỉ cho phép ở projection cuối) |
| `GroupBy` tương đối thoải mái | `GroupBy` chỉ dịch tốt khi đi kèm aggregate (`Count`, `Sum`...) |
:::

::: details Ở dự án thật
Nói thật về phạm vi: cả hai lần đều mới ở giai đoạn đầu.

- **Jabil**: chuyển data layer của một project từ SQL Server sang **PostgreSQL** bằng EF Core. Reverse-engineer schema có sẵn bằng `dotnet ef dbcontext scaffold`, chỉnh config (tên kiểu snake_case qua `EFCore.NamingConventions`, `UseSnakeCaseNamingConvention()`, sửa nhỏ schema cho hợp Postgres), rồi tạo DB Postgres mới từ model đó bằng **EF Core migrations**. Stored procedure nhỏ viết lại thành method C#/LINQ; SP lớn giữ nguyên logic, port sang Postgres và gọi bằng `FromSql`, map vào class kết quả **keyless** (`HasNoKey()`).
- **Commission Factory**: nghiên cứu kế hoạch migrate từng bước (strangler) và Vue cho front end, chưa triển khai. Phần làm thật là một app .NET Core nhỏ, mới từ đầu, cho các trang legal notice.

```text
In my last projects the migrations were at an early stage, so I'll be honest about scope.
At Jabil I moved the data layer of one project from SQL Server to PostgreSQL with EF Core:
I scaffolded the existing schema, switched to snake_case naming, and created the new
database from that model with migrations. My rule for stored procedures was simple:
small ones became C# and LINQ so they are testable, large ones stayed in the database,
ported to Postgres and called through FromSql into keyless result types.
To continue, I'd use the strangler pattern: put YARP in front, move shared libraries to
netstandard2.0, migrate endpoint by endpoint, and verify data with counts and parallel reports.
```
:::

::: warning Bẫy & follow-up
**"Sao không viết lại một lần cho nhanh?"**

Big-bang rủi ro cao: phải đóng băng tính năng hàng tháng, lỗi dồn hết vào một ngày go-live, và gần như không rollback được. Strangler thì mỗi bước nhỏ, lỗi ở route nào trả route đó về app cũ.

**"Kiểm tra data migration đúng thế nào?"**

So số dòng và checksum từng bảng giữa hai DB; chạy song song hai hệ thống một thời gian và so các report quan trọng (vd tổng payout theo tháng).

**"Từ SQL Server sang Postgres hay vấp gì?"**

- Tên không quote bị chuyển thành chữ thường; tên PascalCase phải quote khắp nơi → dùng snake_case.
- `datetime` → `timestamp` / `timestamptz`; Npgsql map `DateTime` UTC vào `timestamptz`, lẫn `Kind` là lỗi.
- `IDENTITY` → identity column / sequence; sau khi copy data phải reset giá trị sequence.
- SQL Server thường không phân biệt hoa thường khi so sánh, Postgres thì có → `citext`, `ILIKE` hoặc collation.
- `nvarchar` → `text` / `varchar`.
- Procedure Postgres không trả result set như SP SQL Server; SP trả dữ liệu thường port thành **function** `RETURNS TABLE`.

**"Session/auth chia sẻ giữa app cũ và app mới thế nào?"**

System.Web adapters có **remote app session** và **remote authentication**: app mới gọi sang app cũ để đọc session và user đã login, nên người dùng không phải login lại khi route chuyển sang app mới.
:::
