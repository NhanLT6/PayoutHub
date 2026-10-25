---
title: "Options pattern"
---

# Options pattern

Config thành class có kiểu, được validate và inject qua DI. Đọc trước: [Config hoạt động thế nào](/dotnet/framework-vs-core#configuration) (các nguồn config chồng lên nhau), [Service lifetime](/aspnet-core/dependency-injection#lifetimes). [Câu hỏi phỏng vấn](#interview) ở cuối trang.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="oAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="oInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="oOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="oBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## 1. Từ section config tới class có kiểu

**Options pattern**: bind một **section** của `IConfiguration` vào một class (POCO), rồi inject class đó qua DI dưới dạng `IOptions<T>` (hoặc Snapshot / Monitor). Thay cho `ConfigurationManager.AppSettings["MinAmount"]` kiểu Web.config: không còn chuỗi magic, không tự parse, có validate.

<div class="fig">
<svg viewBox="0 0 720 150" role="img" aria-label="Section Payout trong appsettings được bind vào PayoutOptions, validate, rồi inject vào service"><g font-size="13" class="mono" text-anchor="middle"><rect class="box" x="10" y="30" width="150" height="70" rx="8"/><text x="85" y="56">appsettings.json</text><text x="85" y="76" font-size="12" class="muted">"Payout": { … }</text><rect class="boxAcc" x="200" y="30" width="150" height="70" rx="8"/><text x="275" y="56">PayoutOptions</text><text x="275" y="76" font-size="12" class="accT">bind theo tên property</text><rect class="boxOk" x="390" y="30" width="150" height="70" rx="8"/><text x="465" y="56">validate</text><text x="465" y="76" font-size="12" class="okT">[Range], [Required]</text><rect class="box" x="580" y="30" width="130" height="70" rx="8"/><text x="645" y="56">PayoutService</text><text x="645" y="76" font-size="11" class="muted">IOptions&lt;PayoutOptions&gt;</text></g><line class="ln" x1="160" y1="65" x2="196" y2="65" marker-end="url(#oInk)"/><line class="ln" x1="350" y1="65" x2="386" y2="65" marker-end="url(#oInk)"/><line class="ln" x1="540" y1="65" x2="576" y2="65" marker-end="url(#oInk)"/><g font-size="12" text-anchor="middle" class="mono muted"><text x="180" y="128">BindConfiguration</text><text x="370" y="128">ValidateDataAnnotations</text><text x="560" y="128">inject qua DI</text></g></svg>
<p class="fig-caption">Bind và validate xảy ra khi options được tạo lần đầu, không phải lúc gọi AddOptions. Có ValidateOnStart thì "lần đầu" bị kéo lên lúc khởi động.</p>
</div>

Code thật của PayoutHub:

::: code-group
```csharp [PayoutOptions.cs]
using System.ComponentModel.DataAnnotations;

namespace PayoutHub.Core;

public class PayoutOptions
{
    public const string SectionName = "Payout";

    [Range(typeof(decimal), "0", "100000000000", MinimumIsExclusive = true)]
    public decimal MinAmount { get; set; }

    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string DefaultCurrency { get; set; } = string.Empty;
}
```

```csharp [Program.cs]
builder.Services
    .AddOptions<PayoutOptions>()                     // OptionsBuilder<PayoutOptions>
    .BindConfiguration(PayoutOptions.SectionName)    // bind section "Payout"
    .ValidateDataAnnotations()                       // chạy các attribute validation
    .ValidateOnStart();                              // validate lúc host start, không đợi lần đọc đầu
```

```json [appsettings.json]
{
  "Payout": {
    "MinAmount": 1000,
    "DefaultCurrency": "VND"
  }
}
```
:::

Từng mắt xích:

- **`AddOptions<T>()`**: đăng ký hạ tầng options, trả về **`OptionsBuilder<T>`** để nối tiếp cấu hình.
- **`BindConfiguration(section)`**: lấy `IConfiguration` từ DI, bind section vào `T` theo tên property (không phân biệt hoa thường). Key thiếu thì property giữ giá trị mặc định; sai kiểu (`"MinAmount": "abc"`) thì ném lỗi lúc bind.
- **`ValidateDataAnnotations()`**: chạy `[Range]`, `[Required]`... trên object vừa bind.
- **`ValidateOnStart()`**: chuyển thời điểm validate về lúc khởi động. Xem mục 2.

`[Range]` không nhận `decimal` trực tiếp vì tham số của attribute không được là `decimal`, nên phải viết `Range(typeof(decimal), "min", "max")`. `MinimumIsExclusive = true` (.NET 8+) loại trừ cận dưới: `MinAmount = 0` bị từ chối. Cận trên đặt hợp lý (không phải `decimal.MaxValue`) để chặn gõ thừa số 0.

## 2. Validation fail lúc nào {#validation-timing}

Câu hỏi thật sự không phải "có validate không" mà là **ai là người đầu tiên thấy lỗi**: pipeline deploy hay user thật.

<div class="fig">
<svg viewBox="0 0 720 270" role="img" aria-label="Có ValidateOnStart: app dừng ngay lúc start. Không có: app chạy, lỗi nổ ở request đầu tiên đọc options"><text x="20" y="30" font-size="14" font-weight="600" class="okT">Có ValidateOnStart</text><g font-size="12" text-anchor="middle"><rect class="box" x="20" y="44" width="120" height="44" rx="8"/><text x="80" y="70">deploy config sai</text><rect class="boxBad" x="190" y="44" width="200" height="44" rx="8"/><text x="290" y="63" class="badT">host start → validate</text><text x="290" y="79" class="badT">OptionsValidationException</text><rect class="boxOk" x="440" y="44" width="260" height="44" rx="8"/><text x="570" y="63" class="okT">process thoát, chưa nhận request nào</text><text x="570" y="79" class="okT">deploy báo đỏ, bản cũ vẫn phục vụ</text></g><line class="ln" x1="140" y1="66" x2="186" y2="66" marker-end="url(#oInk)"/><line class="lnOk" x1="390" y1="66" x2="436" y2="66" marker-end="url(#oOk)"/><text x="20" y="150" font-size="14" font-weight="600" class="badT">Không có ValidateOnStart</text><g font-size="12" text-anchor="middle"><rect class="box" x="20" y="164" width="120" height="44" rx="8"/><text x="80" y="190">deploy config sai</text><rect class="box" x="170" y="164" width="130" height="44" rx="8"/><text x="235" y="183">start OK</text><text x="235" y="199" class="muted">/health: Healthy</text><rect class="box dash" x="330" y="164" width="120" height="44" rx="8"/><text x="390" y="183">vài giờ sau…</text><text x="390" y="199" class="muted">chưa ai đọc .Value</text><rect class="boxBad" x="480" y="164" width="220" height="44" rx="8"/><text x="590" y="183" class="badT">request đầu đọc .Value</text><text x="590" y="199" class="badT">→ exception → 500 cho user thật</text></g><line class="ln" x1="140" y1="186" x2="166" y2="186" marker-end="url(#oInk)"/><line class="ln" x1="300" y1="186" x2="326" y2="186" marker-end="url(#oInk)"/><line class="lnBad" x1="450" y1="186" x2="476" y2="186" marker-end="url(#oBad)"/><text x="20" y="244" font-size="12" class="muted">Cùng một lỗi, cùng một exception. Chỉ khác thời điểm: lúc deploy (rẻ, có người đang nhìn) hay giữa kỳ chạy payout (đắt).</text></svg>
<p class="fig-caption">Không có ValidateOnStart thì validate vẫn chạy, nhưng lười: ở lần đầu tiên có code đọc .Value / .CurrentValue.</p>
</div>

Lỗi trông dạng: `OptionsValidationException: DataAnnotation validation failed for 'PayoutOptions' members: 'DefaultCurrency' with the error: 'The DefaultCurrency field is required.'`. Thiếu hẳn section `Payout` cũng bị bắt: `MinAmount` về `0` (vi phạm cận dưới loại trừ), `DefaultCurrency` rỗng (`[Required]` mặc định từ chối chuỗi rỗng).

::: details PayoutHub: bỏ ValidateOnStart thì app có còn fail lúc start không?
Có, nhưng vì lý do khác. `Program.cs` có dòng log đọc `IOptions<PayoutOptions>.Value` trước `app.Run()`, chính lần đọc đó kích hoạt validate. Đừng dựa vào nó: xoá dòng log là mất luôn "lưới an toàn". `ValidateOnStart` nói rõ ý định, không phụ thuộc thứ tự code.
:::

## 3. Ba interface: đọc giá trị lúc nào {#three-interfaces}

Cả ba cùng đọc một `PayoutOptions`. Khác nhau ở **lifetime** và **thời điểm tính lại giá trị**. Hình dưới: file config đổi `MinAmount` từ 1000 sang 500 **giữa** request 1.

<div class="fig">
<svg viewBox="0 0 720 300" role="img" aria-label="Timeline: IOptions giữ 1000 mãi, IOptionsSnapshot cố định trong từng request, IOptionsMonitor đổi ngay ở lần đọc sau"><g font-size="12" text-anchor="middle"><rect class="boxAcc" x="190" y="20" width="290" height="26" rx="6"/><text x="335" y="38" class="accT">request 1</text><rect class="boxAcc" x="510" y="20" width="190" height="26" rx="6"/><text x="605" y="38" class="accT">request 2</text></g><line class="lnBad dash" x1="400" y1="14" x2="400" y2="262"/><text x="400" y="282" font-size="12" text-anchor="middle" class="badT">file đổi: MinAmount 1000 → 500</text><g font-size="13" class="mono"><text x="20" y="92">IOptions</text><text x="20" y="162">IOptionsSnapshot</text><text x="20" y="232">IOptionsMonitor</text></g><g font-size="11" class="muted"><text x="20" y="108">singleton · tính 1 lần</text><text x="20" y="178">scoped · 1 lần mỗi request</text><text x="20" y="248">singleton · mỗi lần đọc</text></g><rect class="box" x="190" y="76" width="510" height="34" rx="6"/><g font-size="12" text-anchor="middle" class="mono"><text x="290" y="98">1000</text><text x="560" y="98" class="badT">vẫn 1000 tới khi restart</text></g><rect class="boxOk" x="190" y="146" width="290" height="34" rx="6"/><rect class="boxOk" x="510" y="146" width="190" height="34" rx="6"/><g font-size="12" text-anchor="middle" class="mono"><text x="335" y="168">1000 suốt request 1</text><text x="605" y="168">500</text></g><line class="lnMuted" x1="190" y1="226" x2="700" y2="226"/><g class="boxAcc"><circle cx="230" cy="226" r="7"/><circle cx="300" cy="226" r="7"/><circle cx="370" cy="226" r="7"/><circle cx="450" cy="226" r="7"/><circle cx="560" cy="226" r="7"/><circle cx="650" cy="226" r="7"/></g><g font-size="12" text-anchor="middle" class="mono"><text x="230" y="210">1000</text><text x="300" y="210">1000</text><text x="370" y="210">1000</text><text x="450" y="210" class="badT">500</text><text x="560" y="210">500</text><text x="650" y="210">500</text></g><text x="335" y="252" font-size="11" text-anchor="middle" class="badT">request 1 thấy cả 1000 lẫn 500</text></svg>
<p class="fig-caption">Cùng kiểu hình với lifetime trong DI: singleton một bản cả đời app, scoped một bản mỗi request. Monitor là singleton nhưng mỗi lần đọc CurrentValue lấy bản mới nhất.</p>
</div>

| | Lifetime | Giá trị tính khi nào | Nhận config mới khi file đổi? |
|---|---|---|---|
| `IOptions<T>` | Singleton | Một lần, lần đầu đọc `.Value` | Không, tới khi restart |
| `IOptionsSnapshot<T>` | Scoped | Một lần mỗi scope (mỗi request), cố định trong scope đó | Có, từ request sau |
| `IOptionsMonitor<T>` | Singleton | Mỗi lần đọc `.CurrentValue` | Có, ngay lập tức; có callback `OnChange` |

**Lifetime quyết định ai inject được ai.** `IOptionsSnapshot` là scoped, nên singleton (`BackgroundService`, `IExceptionHandler`, middleware dạng convention) **không** inject được: đó là [captive dependency](/aspnet-core/dependency-injection#captive-dependency), Development báo lỗi lúc start nhờ scope validation. Singleton cần giá trị mới thì dùng `IOptionsMonitor`, nó cũng là singleton và không giữ service scoped nào.

```csharp
using Microsoft.Extensions.Options;
using PayoutHub.Core;

namespace PayoutHub.Api;

// BackgroundService là singleton: dùng IOptionsMonitor, không dùng IOptionsSnapshot
public class PayoutWorker(IOptionsMonitor<PayoutOptions> options, ILogger<PayoutWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            PayoutOptions current = options.CurrentValue;   // đọc một lần cho cả vòng xử lý
            logger.LogInformation("Run with MinAmount {MinAmount}", current.MinAmount);
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
```

```csharp
// Program.cs
builder.Services.AddHostedService<PayoutWorker>();
```

**Reload cần nguồn config hỗ trợ.** `WebApplication.CreateBuilder` thêm `appsettings.json` và `appsettings.{Environment}.json` với `reloadOnChange: true` **mặc định**, nên sửa file là Snapshot/Monitor thấy. Environment variables và command-line chỉ đọc một lần lúc start: đổi chúng thì phải restart, interface nào cũng vậy.

## 4. Bẫy khi config đổi lúc đang chạy {#runtime-change-pitfalls}

**Đọc `CurrentValue` trong vòng lặp** = một lần chạy dùng hai bộ quy tắc. Đúng như chấm `request 1` trong hình trên.

::: code-group
```csharp [Sai: đọc trong vòng lặp]
foreach (var affiliate in affiliates)
{
    // file đổi giữa vòng lặp: nửa đầu xét 1000, nửa sau xét 500
    if (affiliate.Balance < options.CurrentValue.MinAmount) continue;
    payouts.Add(CreatePayout(affiliate));
}
```

```csharp [Đúng: chụp một lần]
decimal minAmount = options.CurrentValue.MinAmount;   // một giá trị cho cả lần generate

foreach (var affiliate in affiliates)
{
    if (affiliate.Balance < minAmount) continue;
    payouts.Add(CreatePayout(affiliate));
}
```
:::

**Lưu `CurrentValue` vào field trong constructor** = tự biến `IOptionsMonitor` thành `IOptions`: field giữ bản lúc tạo object, không bao giờ đổi.

**Tham số nghiệp vụ không nằm ở appsettings.** `MinAmount` là quyết định của Finance, không phải của dev. Mức senior: lưu trong DB theo kỳ hiệu lực (`EffectiveFrom`), Finance tự đổi qua màn hình, có audit, chạy lại kỳ cũ vẫn ra đúng kết quả cũ. `appsettings` dành cho tham số **kỹ thuật**: timeout, URL, số lần retry. PayoutHub đọc `MinAmount` từ config chỉ vì M1 chưa có DB.

## 5. Dễ nhầm

| Cặp | Phân biệt |
|---|---|
| `IConfiguration` và `IOptions<T>` | `IConfiguration`: cây key/value chuỗi, đọc bằng `config["Payout:MinAmount"]`. `IOptions<T>`: class có kiểu, đã bind và validate. Code nghiệp vụ chỉ nên thấy cái sau |
| Validate và `ValidateOnStart` | Validate luôn chạy khi options được tạo. `ValidateOnStart` chỉ đổi **thời điểm** sang lúc khởi động |
| `IOptionsSnapshot` và `IOptionsMonitor` | Snapshot: cố định trong một request, scoped. Monitor: mới nhất ở mỗi lần đọc, singleton |
| Reload và restart | Reload chỉ áp cho nguồn có `reloadOnChange` (file JSON). Env var đổi thì phải restart |
| `Configure<T>(section)` và `AddOptions<T>().BindConfiguration(...)` | Cùng bind. Cách sau trả `OptionsBuilder<T>` để nối `ValidateDataAnnotations().ValidateOnStart()` |

## Câu hỏi phỏng vấn {#interview}

Ôn nhanh trước khi đi phỏng vấn. Mỗi câu có trả lời nhanh, bản chất, ví dụ thật và bẫy.

### Validate config khi khởi động thế nào? {#options-validation}

::: tip Trả lời nhanh
Bind section vào class bằng `AddOptions<T>().BindConfiguration(section)`, đặt rule bằng data annotations và gọi `.ValidateDataAnnotations().ValidateOnStart()`. Config sai thì app không khởi động được, kèm message nói rõ property nào sai: deploy hỏng bị phát hiện ngay, không đợi user thật gặp lỗi.
:::

::: info Bản chất
Validate chạy trong lúc tạo options (`OptionsFactory`). Không có `ValidateOnStart` thì lần tạo đầu tiên là lần đầu có code đọc `.Value`, có thể là giữa lần chạy payout đầu tiên. `ValidateOnStart` kéo lần tạo đó về lúc host start, trước khi Kestrel nhận request. Xem [hình timeline](#validation-timing).
:::

::: details Ở dự án thật
PayoutHub: `PayoutOptions` có `[Range(typeof(decimal), "0", "100000000000", MinimumIsExclusive = true)]` cho `MinAmount` và `[Required]`, `[StringLength(3, MinimumLength = 3)]` cho `DefaultCurrency`. Deploy thiếu section `Payout` thì app dừng ngay với `OptionsValidationException`, pipeline deploy báo đỏ, bản cũ vẫn chạy.
:::

::: warning Bẫy & follow-up
**"Rule phức tạp hơn attribute (so sánh hai field, gọi service khác) thì sao?"**

`.Validate(o => ..., "message")` cho rule ngắn; `IValidateOptions<T>` cho rule dài hoặc cần inject dependency. Cả hai đều chạy cùng `ValidateOnStart`.

**"Sao `[Range]` cho `decimal` phải viết `typeof(decimal)` với chuỗi?"**

Tham số attribute chỉ nhận hằng số kiểu nguyên thuỷ, `decimal` không nằm trong số đó. Overload `Range(Type, string, string)` parse chuỗi sang `decimal` lúc chạy.
:::

### `IOptions` vs `IOptionsSnapshot` vs `IOptionsMonitor` <Badge type="warning" text="hay bị hỏi" /> {#options-interfaces}

::: tip Trả lời nhanh
`IOptions`: singleton, tính một lần, giữ tới khi restart. `IOptionsSnapshot`: scoped, tính lại mỗi request và cố định trong request đó. `IOptionsMonitor`: singleton, mỗi lần đọc `CurrentValue` là giá trị mới nhất, có `OnChange`.
:::

::: info Bản chất
Xem [bảng và timeline](#three-interfaces). Hai hệ quả hay bị hỏi tiếp:

- Singleton không inject được `IOptionsSnapshot` ([captive dependency](/aspnet-core/dependency-injection#captive-dependency)) → dùng `IOptionsMonitor`.
- Reload chỉ xảy ra khi nguồn config hỗ trợ: `appsettings*.json` có `reloadOnChange: true` mặc định với `WebApplication.CreateBuilder`; env var thì không.
:::

::: details Ở dự án thật
PayoutHub: `PayoutOptions` dùng `IOptions` vì chưa có yêu cầu đổi lúc chạy. FakeBank đọc `FailureRate` bằng `IOptionsMonitor` để đổi tỷ lệ lỗi khi đang chạy lab (M4) mà không restart.
:::

::: warning Bẫy & follow-up
**"Lấy `CurrentValue` trong constructor rồi lưu vào field có được không?"**

Chạy được, nhưng mất tác dụng: field giữ giá trị lúc tạo object, y như `IOptions`. Đọc `CurrentValue` ở đầu mỗi thao tác.

**"Snapshot có đắt không?"**

Mỗi request tạo lại options (bind + validate). Với vài property thì không đáng kể; nhưng không có lý do gì để dùng Snapshot cho config không bao giờ đổi lúc chạy.
:::

### Finance muốn đổi `MinAmount` mà không restart. Nếu `generate` đang chạy dở thì sao? {#options-runtime-change}

::: tip Trả lời nhanh
Code phải đọc qua `IOptionsSnapshot` hoặc `IOptionsMonitor` thì mới thấy giá trị mới. Rủi ro thật là lần chạy dở dùng hai giá trị: đọc `CurrentValue` trong vòng lặp thì nửa số affiliate xét theo 1000, nửa sau theo 500. Sửa: chụp giá trị **một lần** ở đầu thao tác. Mức senior: `MinAmount` là tham số nghiệp vụ, nên nằm trong DB theo kỳ hiệu lực.
:::

::: info Bản chất
Xem [Bẫy khi config đổi lúc đang chạy](#runtime-change-pitfalls). Nếu code hiện đang dùng `IOptions` thì không có cách đổi mà không restart; mà deploy code mới để đổi sang Monitor thì vốn đã là restart.
:::

::: details Ở dự án thật
Lưu `MinAmount` trong bảng có `EffectiveFrom`: Finance tự đổi, có audit ai đổi lúc nào, và chạy lại kỳ tháng trước vẫn dùng đúng giá trị của tháng trước. `appsettings` chỉ giữ tham số kỹ thuật (timeout, URL FakeBank, retry).
:::

::: warning Bẫy & follow-up
**"`OnChange` có bị gọi hai lần không?"**

Có thể: file watcher của hệ điều hành hay bắn nhiều event cho một lần lưu file. Handler trong `OnChange` phải chịu được bị gọi lặp (idempotent), không gửi email hay ghi DB mỗi lần gọi.
:::

## Hỏi đáp

::: details "Configure khác AddOptions().BindConfiguration() thế nào?"
Cùng kết quả bind. `Configure` là cách cũ, nhận thẳng `IConfigurationSection` từ `builder.Configuration`, không trả builder nên khó nối validate. `AddOptions<T>()` trả `OptionsBuilder<T>`, `BindConfiguration` tự lấy `IConfiguration` từ DI, và nối được `ValidateDataAnnotations().ValidateOnStart()` trên cùng một chuỗi.
:::

::: details "Đổi MinAmount bằng environment variable thế nào?"
`Payout__MinAmount=500` (hai dấu gạch dưới thay cho `:`). Env var đứng sau appsettings trong thứ tự nguồn nên ghi đè được, xem [Config hoạt động thế nào](/dotnet/framework-vs-core#configuration). Nhưng env var không reload: đổi xong phải restart.
:::

::: details "Named options là gì?"
Nhiều bộ cấu hình cùng kiểu, phân biệt bằng tên: `AddOptions<BankOptions>("wise")`, `AddOptions<BankOptions>("paypal")`, đọc bằng `IOptionsMonitor<BankOptions>.Get("wise")` hoặc `IOptionsSnapshot<BankOptions>.Get(...)`. `IOptions<T>` chỉ đọc được bản không tên.
:::

## Tự kiểm tra

::: details 1. Bỏ ValidateOnStart thì config sai có còn bị phát hiện không? Khi nào?
Có, ở lần đầu tiên có code đọc `.Value` / `.CurrentValue`. Có thể là request của user thật, vài giờ sau deploy.
:::

::: details 2. BackgroundService cần MinAmount mới nhất. Inject interface nào? Vì sao không phải Snapshot?
`IOptionsMonitor`. `BackgroundService` là singleton, Snapshot là scoped: inject vào là captive dependency, Development báo lỗi lúc start.
:::

::: details 3. Sửa appsettings.json trên server khi app đang chạy. Interface nào thấy giá trị mới, và từ lúc nào?
Snapshot: từ request sau. Monitor: ngay lần đọc `CurrentValue` kế tiếp. `IOptions`: không, tới khi restart. Điều kiện: file được nạp với `reloadOnChange: true` (mặc định của `CreateBuilder`).
:::

::: details 4. Vì sao MinAmount không nên nằm lâu dài trong appsettings?
Là tham số nghiệp vụ: Finance cần tự đổi, cần audit, và chạy lại kỳ cũ phải dùng giá trị của kỳ đó. DB với `EffectiveFrom` làm được cả ba; appsettings không.
:::
