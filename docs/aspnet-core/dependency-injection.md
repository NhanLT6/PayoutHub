---
title: "Dependency Injection"
---

# Dependency Injection

Phần đầu là bài học kèm hình. [Câu hỏi phỏng vấn](#interview) nằm ở cuối, để ôn nhanh. Liên quan: [SOLID](/dotnet/oop-fundamentals#solid) (chữ D).

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="dAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="dInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="dOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="dBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## 1. Bốn khái niệm hay bị trộn

Mỗi khái niệm trả lời **một câu hỏi khác nhau**. Nhớ câu hỏi là không bị lẫn.

- **IoC (Inversion of Control)**: _ai điều khiển luồng chạy?_ Đảo ngược: framework gọi code của bạn, không phải bạn gọi framework. "Don't call us, we'll call you."
- **DI (Dependency Injection)**: _ai tạo dependency?_ Không phải class tự `new`, mà được **đưa từ ngoài vào**, thường qua constructor. DI là một dạng IoC: đảo quyền _tạo object_.
- **DI container**: _ai làm việc đưa vào đó?_ Công cụ đọc constructor, tự tạo cả cây object, quản lý lifetime và dispose. Không có container vẫn làm DI được.
- **DIP (Dependency Inversion Principle)**: _mũi tên phụ thuộc trong source code trỏ về đâu?_ Code nghiệp vụ phụ thuộc interface do chính nó định nghĩa, không phụ thuộc class hạ tầng cụ thể. Là nguyên tắc thiết kế, không phải cơ chế chạy.

<div class="fig">
<svg viewBox="0 0 720 300" role="img" aria-label="IoC chứa DI, DI chứa container; DIP là nguyên tắc nằm riêng"><rect class="box" x="20" y="20" width="440" height="262" rx="10"/><text x="38" y="48" font-size="15" font-weight="600">IoC · ý tưởng</text><text x="38" y="68" font-size="12" class="muted">framework gọi code của bạn (controller, event, Page_Load)</text><rect class="boxAcc" x="48" y="88" width="384" height="176" rx="10"/><text x="66" y="116" font-size="15" font-weight="600" class="accT">DI · kỹ thuật</text><text x="66" y="136" font-size="12">IoC áp vào việc tạo object: dependency được đưa vào</text><rect class="boxOk" x="78" y="160" width="324" height="86" rx="10"/><text x="96" y="188" font-size="15" font-weight="600" class="okT">DI container · công cụ</text><text x="96" y="208" font-size="12">tự đọc constructor, tạo cả cây object,</text><text x="96" y="224" font-size="12">giữ lifetime, dispose đúng lúc</text><rect class="box" x="500" y="88" width="200" height="110" rx="10"/><text x="600" y="116" font-size="15" font-weight="600" text-anchor="middle">DIP · nguyên tắc</text><text x="600" y="140" font-size="12" text-anchor="middle">code nghiệp vụ phụ thuộc</text><text x="600" y="156" font-size="12" text-anchor="middle">interface, không phụ thuộc</text><text x="600" y="172" font-size="12" text-anchor="middle">class hạ tầng cụ thể</text><line class="lnAcc dash" x1="498" y1="150" x2="436" y2="150" marker-end="url(#dAcc)"/><text x="600" y="224" font-size="12" text-anchor="middle" class="accT">DI là cách phổ biến nhất</text><text x="600" y="240" font-size="12" text-anchor="middle" class="accT">để hiện thực DIP</text></svg>
<p class="fig-caption">Vòng ngoài là ý tưởng, vòng trong là cách làm cụ thể hơn. DIP nằm riêng vì nó nói về hướng phụ thuộc, không nói ai tạo object.</p>
</div>

### Trước và sau khi có DI

<Compare :labels="['Class tự new', 'Được inject']" caption="Tự new: PayoutService vừa dùng vừa tạo dependency. Được inject: chỉ dùng; việc tạo dồn về một chỗ là Program.cs.">
<template #a>
<svg viewBox="0 0 720 300" role="img" aria-label="PayoutService tự tạo repository và connection"><g font-size="13" class="mono" text-anchor="middle"><rect class="box" x="220" y="24" width="240" height="44" rx="8"/><text x="340" y="51">PayoutService</text><rect class="boxBad" x="220" y="128" width="240" height="44" rx="8"/><text x="340" y="155">SqlPayoutRepository</text><rect class="boxBad" x="220" y="232" width="240" height="44" rx="8"/><text x="340" y="259">SqlConnection("Server=…")</text></g><line class="lnBad" x1="340" y1="68" x2="340" y2="124" marker-end="url(#dBad)"/><line class="lnBad" x1="340" y1="172" x2="340" y2="228" marker-end="url(#dBad)"/><g font-size="12"><text x="352" y="96" class="mono badT">new SqlPayoutRepository()</text><text x="352" y="200" class="mono badT">new SqlConnection(…)</text><text x="480" y="146" class="badT">✗ test phải có DB thật</text><text x="480" y="162" class="badT">✗ đổi sang Dapper = sửa PayoutService</text><text x="200" y="146" text-anchor="end" class="muted">biết và tạo</text><text x="200" y="162" text-anchor="end" class="muted">class cụ thể</text></g></svg>
</template>
<template #b>
<svg viewBox="0 0 720 300" role="img" aria-label="PayoutService phụ thuộc interface, Program.cs tạo và đưa vào"><g font-size="13" class="mono" text-anchor="middle"><rect class="boxAcc" x="20" y="24" width="190" height="44" rx="8"/><text x="115" y="44">Program.cs</text><text x="115" y="60" font-size="11" class="muted">composition root</text><rect class="box" x="260" y="24" width="220" height="44" rx="8"/><text x="370" y="51">PayoutService</text><rect class="boxOk" x="260" y="138" width="220" height="44" rx="8"/><text x="370" y="165">IPayoutRepository</text><rect class="box" x="520" y="138" width="180" height="44" rx="8"/><text x="610" y="165">SqlPayoutRepository</text><rect class="box dash" x="520" y="232" width="180" height="44" rx="8"/><text x="610" y="259">FakeRepository</text></g><line class="lnAcc dash" x1="210" y1="46" x2="256" y2="46" marker-end="url(#dAcc)"/><line class="ln" x1="370" y1="68" x2="370" y2="134" marker-end="url(#dInk)"/><line class="lnOk" x1="520" y1="160" x2="484" y2="160" marker-end="url(#dOk)"/><path class="lnOk dash" d="M520 254 C 500 254, 500 186, 484 176" marker-end="url(#dOk)"/><g font-size="12"><text x="115" y="96" text-anchor="middle" class="accT">tạo object và truyền vào</text><text x="115" y="112" text-anchor="middle" class="accT">(nơi duy nhất biết class cụ thể)</text><text x="382" y="106">chỉ biết interface</text><text x="610" y="128" text-anchor="middle" class="okT">implement</text><text x="610" y="296" text-anchor="middle" class="muted">trong unit test</text></g></svg>
</template>
</Compare>

```csharp
// Trước: tự tạo, dính chặt vào SQL
public class PayoutService
{
    private readonly SqlPayoutRepository _repo = new(); // [!code highlight]
}

// Sau: nhận từ ngoài vào, chỉ biết interface
public class PayoutService(IPayoutRepository repo) { } // [!code highlight]
```

## 2. DI không cần container

Container chỉ **tự động hoá** việc dưới đây. Tự viết tay một lần là hiểu container làm gì (gọi là **Pure DI**):

```csharp
// Composition root viết tay: Main tự new cả cây, từ lá lên gốc
var db      = new PayoutDbContext(options);
var repo    = new SqlPayoutRepository(db);
var service = new PayoutService(repo, TimeProvider.System);
var job     = new GeneratePayoutsJob(service);
await job.RunAsync();
```

Với 5 class thì viết tay được. Với 200 class, lifetime khác nhau và cần dispose đúng lúc, thì cần container.

## 3. Container bên trong làm gì

<div class="fig">
<svg viewBox="0 0 720 170" role="img" aria-label="Ba giai đoạn: đăng ký, build, resolve"><g text-anchor="middle"><rect class="box" x="20" y="30" width="200" height="96" rx="8"/><text x="120" y="56" font-size="14" font-weight="600">1 · Register</text><text x="120" y="78" font-size="12" class="mono">IServiceCollection</text><text x="120" y="96" font-size="12">danh sách ServiceDescriptor</text><text x="120" y="112" font-size="12" class="muted">(type, implementation, lifetime)</text><rect class="boxAcc" x="260" y="30" width="200" height="96" rx="8"/><text x="360" y="56" font-size="14" font-weight="600">2 · Build</text><text x="360" y="78" font-size="12" class="mono">IServiceProvider</text><text x="360" y="96" font-size="12">ValidateOnBuild: đủ đăng ký,</text><text x="360" y="112" font-size="12">lifetime không sai</text><rect class="boxOk" x="500" y="30" width="200" height="96" rx="8"/><text x="600" y="56" font-size="14" font-weight="600">3 · Resolve</text><text x="600" y="78" font-size="12" class="mono">GetService(T)</text><text x="600" y="96" font-size="12">tạo object theo cây</text><text x="600" y="112" font-size="12">constructor, cache theo lifetime</text><g font-size="12" class="mono muted"><text x="120" y="152">builder.Services.Add…</text><text x="360" y="152">builder.Build()</text><text x="600" y="152">mỗi request</text></g></g><line class="ln" x1="220" y1="78" x2="256" y2="78" marker-end="url(#dInk)"/><line class="ln" x1="460" y1="78" x2="496" y2="78" marker-end="url(#dInk)"/></svg>
<p class="fig-caption">Sau Build, danh sách đăng ký bị đóng băng: thêm đăng ký sau đó không có tác dụng.</p>
</div>

**ServiceDescriptor**: một dòng đăng ký, gồm 3 thứ: _hỏi type nào_ (`IPayoutRepository`), _trả gì_ (class, factory hoặc instance có sẵn), _sống bao lâu_ (lifetime).

**Resolve** là đệ quy: muốn tạo `PayoutsController` thì đọc constructor, thấy cần `IPayoutService`, đi resolve cái đó, cứ thế xuống tới lá. Tạo object từ lá ngược lên gốc.

<div class="fig">
<svg viewBox="0 0 720 350" role="img" aria-label="Cây resolve PayoutsController, số là thứ tự tạo object"><g font-size="13" class="mono" text-anchor="middle"><rect class="box" x="250" y="16" width="220" height="48" rx="8"/><text x="360" y="37">PayoutsController</text><text x="360" y="55" font-size="11" class="muted">mỗi request</text><rect class="boxAcc" x="90" y="106" width="230" height="48" rx="8"/><text x="205" y="127">PayoutService</text><text x="205" y="145" font-size="11" class="accT">scoped · giữ trong scope</text><rect class="boxOk" x="400" y="106" width="230" height="48" rx="8"/><text x="515" y="127">ILogger&lt;PayoutsController&gt;</text><text x="515" y="145" font-size="11" class="okT">singleton · giữ ở root</text><rect class="boxAcc" x="20" y="196" width="220" height="48" rx="8"/><text x="130" y="217">SqlPayoutRepository</text><text x="130" y="235" font-size="11" class="accT">scoped</text><rect class="boxOk" x="260" y="196" width="170" height="48" rx="8"/><text x="345" y="217">TimeProvider</text><text x="345" y="235" font-size="11" class="okT">singleton</text><rect class="boxAcc" x="20" y="286" width="220" height="48" rx="8"/><text x="130" y="307">PayoutDbContext</text><text x="130" y="325" font-size="11" class="accT">scoped</text></g><g class="ln"><line x1="320" y1="64" x2="230" y2="102" marker-end="url(#dInk)"/><line x1="400" y1="64" x2="490" y2="102" marker-end="url(#dInk)"/><line x1="170" y1="154" x2="140" y2="192" marker-end="url(#dInk)"/><line x1="240" y1="154" x2="320" y2="192" marker-end="url(#dInk)"/><line x1="130" y1="244" x2="130" y2="282" marker-end="url(#dInk)"/></g><g font-size="12" font-weight="600" text-anchor="middle"><circle class="boxAcc" cx="252" cy="310" r="11"/><text x="252" y="314">1</text><circle class="boxAcc" cx="252" cy="220" r="11"/><text x="252" y="224">2</text><circle class="boxAcc" cx="442" cy="220" r="11"/><text x="442" y="224">3</text><circle class="boxAcc" cx="332" cy="130" r="11"/><text x="332" y="134">4</text><circle class="boxAcc" cx="642" cy="130" r="11"/><text x="642" y="134">5</text><circle class="boxAcc" cx="482" cy="40" r="11"/><text x="482" y="44">6</text></g><g font-size="12"><text x="470" y="270">Đi xuống: đọc constructor,</text><text x="470" y="286">hỏi tiếp từng tham số.</text><text x="470" y="310">Đi lên: đủ tham số thì new.</text><text x="470" y="326" class="muted">Số tròn = thứ tự object được tạo.</text></g></svg>
<p class="fig-caption">Nếu PayoutService đã có trong scope (request này đã tạo rồi) thì container trả lại luôn, không đi xuống nhánh đó nữa.</p>
</div>

### Container nhớ instance ở đâu

**Root provider**: provider gốc, sống cả đời app, giữ **singleton**. **Scope**: provider con, trong web là một scope cho mỗi request (`HttpContext.RequestServices`), giữ **scoped**. **Transient** không được nhớ, mỗi lần hỏi là một object mới.

<div class="fig">
<svg viewBox="0 0 720 300" role="img" aria-label="Root provider giữ singleton, mỗi request có scope riêng giữ scoped"><rect class="boxOk" x="20" y="16" width="680" height="84" rx="10"/><text x="38" y="42" font-size="14" font-weight="600" class="okT">Root provider · sống cả đời app</text><g font-size="12" class="mono" text-anchor="middle"><rect class="box" x="38" y="56" width="150" height="30" rx="6"/><text x="113" y="76">IMemoryCache</text><rect class="box" x="200" y="56" width="150" height="30" rx="6"/><text x="275" y="76">TimeProvider</text><rect class="box" x="362" y="56" width="150" height="30" rx="6"/><text x="437" y="76">ILogger&lt;T&gt;</text></g><text x="528" y="76" font-size="12" class="muted">singleton: dùng chung</text><g><rect class="boxAcc" x="20" y="140" width="320" height="140" rx="10"/><text x="36" y="164" font-size="13" font-weight="600" class="accT">Scope của request A</text><rect class="boxAcc" x="380" y="140" width="320" height="140" rx="10"/><text x="396" y="164" font-size="13" font-weight="600" class="accT">Scope của request B</text></g><g font-size="12" class="mono" text-anchor="middle"><rect class="box" x="36" y="176" width="140" height="28" rx="6"/><text x="106" y="195">DbContext #A</text><rect class="box" x="186" y="176" width="140" height="28" rx="6"/><text x="256" y="195">PayoutService #A</text><rect class="box" x="396" y="176" width="140" height="28" rx="6"/><text x="466" y="195">DbContext #B</text><rect class="box" x="546" y="176" width="140" height="28" rx="6"/><text x="616" y="195">PayoutService #B</text><rect class="box dash" x="36" y="214" width="290" height="28" rx="6"/><text x="181" y="233">transient: mới mỗi lần hỏi</text><rect class="box dash" x="396" y="214" width="290" height="28" rx="6"/><text x="541" y="233">transient: mới mỗi lần hỏi</text></g><g font-size="12"><text x="36" y="266" class="muted">hết request: Dispose ngược thứ tự tạo</text><text x="396" y="266" class="muted">hết request: Dispose ngược thứ tự tạo</text></g><line class="lnAcc dash" x1="180" y1="138" x2="180" y2="104" marker-end="url(#dAcc)"/><line class="lnAcc dash" x1="540" y1="138" x2="540" y2="104" marker-end="url(#dAcc)"/><text x="190" y="126" font-size="12" class="accT">hỏi singleton → lấy ở root</text><text x="550" y="126" font-size="12" class="accT">hỏi singleton → lấy ở root</text></svg>
<p class="fig-caption">Hai request không bao giờ thấy DbContext của nhau. Singleton giữ một scoped service là kéo nó ra khỏi hộp của nó: đó là captive dependency.</p>
</div>

## 4. Ai gọi container: IoC trong ASP.NET Core

Trong code của bạn **không có chỗ nào gọi `GetService`**. Framework tạo scope cho request, tìm controller, nhờ container dựng controller kèm toàn bộ dependency, rồi gọi action. Đó là IoC: bạn chỉ khai báo "tôi cần gì" ở constructor.

<Compare :labels="['DI: được đưa vào', 'Service locator: tự đi xin']" caption="Cùng dùng container, khác nhau ở chỗ ai chủ động. Service locator đảo ngược lại IoC.">
<template #a>
<svg viewBox="0 0 720 240" role="img" aria-label="Container đưa dependency vào constructor"><g font-size="13" class="mono" text-anchor="middle"><rect class="boxOk" x="40" y="30" width="200" height="44" rx="8"/><text x="140" y="57">Container (scope)</text><rect class="box" x="40" y="150" width="200" height="44" rx="8"/><text x="140" y="177">PayoutsController</text></g><line class="lnOk" x1="140" y1="74" x2="140" y2="146" marker-end="url(#dOk)"/><text x="152" y="116" font-size="12" class="okT">đưa vào lúc tạo</text><g font-size="12"><text x="280" y="52" class="mono">PayoutsController(IPayoutService svc)</text><text x="280" y="90" class="okT">✓ nhìn constructor là biết class cần gì</text><text x="280" y="112" class="okT">✓ thiếu đăng ký → lỗi ngay lúc start (ValidateOnBuild)</text><text x="280" y="134" class="okT">✓ test: new PayoutsController(fake)</text></g></svg>
</template>
<template #b>
<svg viewBox="0 0 720 240" role="img" aria-label="Controller tự xin dependency từ container"><g font-size="13" class="mono" text-anchor="middle"><rect class="boxOk" x="40" y="30" width="200" height="44" rx="8"/><text x="140" y="57">Container (scope)</text><rect class="boxBad" x="40" y="150" width="200" height="44" rx="8"/><text x="140" y="177">PayoutsController</text></g><line class="lnBad" x1="140" y1="146" x2="140" y2="78" marker-end="url(#dBad)"/><text x="152" y="116" font-size="12" class="badT">tự xin khi chạy tới</text><g font-size="12"><text x="280" y="52" class="mono">PayoutsController(IServiceProvider sp)</text><text x="280" y="70" class="mono muted">sp.GetRequiredService&lt;IPayoutService&gt;()</text><text x="280" y="100" class="badT">✗ dependency thật bị giấu trong thân method</text><text x="280" y="122" class="badT">✗ thiếu đăng ký → lỗi lúc chạy tới đúng dòng đó</text><text x="280" y="144" class="badT">✗ test phải dựng cả container</text></g></svg>
</template>
</Compare>

## 5. Dễ nhầm

| Cặp | Phân biệt |
|---|---|
| **IoC** và **DI** | IoC là ý tưởng chung (ai điều khiển). DI là một dạng IoC, chỉ về việc tạo dependency. Event handler là IoC nhưng không phải DI |
| **DI** và **DIP** | DI: ai tạo object (cơ chế lúc chạy). DIP: mũi tên phụ thuộc trỏ về đâu (thiết kế source code). Inject class cụ thể là có DI mà không có DIP |
| **DI** và **DI container** | DI là kỹ thuật, làm tay được. Container là công cụ tự động hoá nó |
| **DI** và **Service locator** | Cùng có container. DI: được đưa vào. Service locator: tự đi xin `GetService`, dependency bị giấu |
| `IServiceCollection` và `IServiceProvider` | Collection: danh sách đăng ký, dùng trước `Build()`. Provider: thứ tạo object, dùng sau `Build()` |
| **Composition root** và **container** | Composition root là _chỗ_ ghép object (Program.cs). Container là _công cụ_ dùng ở chỗ đó |

## Câu hỏi phỏng vấn {#interview}

Ôn nhanh trước khi đi phỏng vấn. Mỗi câu có trả lời nhanh, bản chất, ví dụ thật và bẫy.

### Transient, Scoped, Singleton <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#lifetimes}

::: tip Trả lời nhanh
**Transient**: tạo mới mỗi lần được yêu cầu. **Scoped**: một instance cho mỗi scope, trong web là mỗi request. **Singleton**: một instance cho cả vòng đời app, nên phải thread-safe.
:::

::: info Bản chất
Lifetime trả lời câu hỏi: **container tạo bao nhiêu object, và mỗi object được dùng lại trong phạm vi nào**.

```
Singleton : [ 1 object ]──────────── dùng chung cho cả app ────────────
Scoped    : [obj A] request 1   [obj B] request 2   [obj C] request 3
Transient : mỗi lần xin là 1 object mới, kể cả trong cùng 1 request
```

| Lifetime | Ví dụ hợp lý | Lưu ý |
|---|---|---|
| Transient | Service nhỏ, không state, rẻ để tạo | Cùng một request có thể có nhiều instance khác nhau |
| Scoped | `DbContext`, unit of work, thông tin user hiện tại | Mọi service trong cùng request dùng chung một instance, nên chung một DbContext và một transaction |
| Singleton | Cache, config đã nạp, client tốn chi phí khởi tạo | Có state thì phải thread-safe; không được giữ service scoped |
:::

::: details Ở dự án thật
Ví dụ dễ kể: đặt `DbContext` scoped để mọi repository trong một request dùng chung context, gọi `SaveChanges` một lần là ghi hết trong một transaction. Nếu lỡ để transient, mỗi repository một context, việc ghi bị chia ra nhiều transaction và không còn **atomic** nữa: có thể phần này đã ghi xong mà phần kia thì lỗi, dữ liệu dở dang.
:::

::: warning Bẫy & follow-up
**"`GlobalExceptionHandler` chỉ chạy khi đang xử lý request, vậy nó là scoped?"**

Không. Gần như mọi thứ đều chạy trong request: `ILogger` cũng vậy nhưng vẫn là singleton. "Chạy lúc nào" không quyết định lifetime. Điều quyết định là **object có giữ dữ liệu riêng của request không**:

- `DbContext` giữ change tracker và connection của request đó, request khác dùng chung sẽ lẫn dữ liệu, nên mỗi request cần một object riêng: **scoped**.
- `GlobalExceptionHandler` nhận request qua tham số `httpContext` chứ không lưu lại, nên một object dùng chung cho cả app vẫn an toàn: **singleton**. `AddExceptionHandler<T>()` đăng ký nó là singleton.

Thêm một ràng buộc: phụ thuộc vào service scoped thì bản thân cũng phải scoped trở xuống, xem [Captive dependency](#captive-dependency).
:::

### Captive dependency: inject lifetime nào vào lifetime nào được? {#captive-dependency}

::: tip Trả lời nhanh
Quy tắc: **service sống lâu không được giữ service sống ngắn hơn**. Singleton giữ một scoped service thì service đó bị "giam" và sống suốt đời app: DbContext bị dùng chung cho mọi request, sai dữ liệu và không thread-safe. Đó gọi là captive dependency.
:::

::: info Bản chất
| Inject ↓ vào → | Transient | Scoped | Singleton |
|---|---|---|---|
| **Transient** | OK | OK | Chạy được, nhưng bị kéo dài thành singleton. Chỉ ổn nếu nó không state và thread-safe |
| **Scoped** | OK | OK | **Sai**. Bị chặn khi bật scope validation |
| **Singleton** | OK | OK | OK |

```csharp
// Singleton (hoặc BackgroundService) cần dùng DbContext: tự tạo scope
public class DailyReportJob(IServiceScopeFactory scopes) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // ... dùng db, scope dispose thì db dispose theo
    }
}
```
:::

::: warning Bẫy & follow-up
**"Làm sao phát hiện captive dependency sớm?"**

`ValidateScopes` (mặc định bật ở môi trường Development) ném lỗi khi resolve scoped từ root. Bật thêm `ValidateOnBuild` để kiểm tra toàn bộ đăng ký ngay lúc khởi động thay vì đợi tới lúc resolve.

**"Scoped inject transient có sao không?"**

Không sao. Transient sống theo scoped đã giữ nó. Câu "scoped không được dùng transient" trong bản cheatsheet trước là sai.

**"Singleton cần config mới nhất thì inject `IOptionsSnapshot` được không?"**

Không: Snapshot là scoped, đúng loại captive dependency ở bảng trên. Dùng `IOptionsMonitor`: nó là singleton và không giữ service scoped nào, xem [Options pattern](/aspnet-core/options-pattern#options-interfaces).
:::

### Container dispose service thế nào? {#disposal}

::: tip Trả lời nhanh
Container chỉ dispose những object **nó tự tạo**, vào lúc scope chứa object đó kết thúc: scoped và transient theo request, singleton khi app tắt. Object bạn tự `new` rồi đăng ký bằng instance thì container không dispose.
:::

::: warning Bẫy & follow-up
**"Resolve transient `IDisposable` từ root provider thì sao?"**

Container giữ tham chiếu để dispose lúc app tắt, nghĩa là mỗi lần resolve lại giữ thêm một object tới cuối đời app: memory leak. Luôn resolve trong một scope.
:::

### Nhiều implementation cho một interface, keyed services, decorator {#multiple-implementations}

::: tip Trả lời nhanh
Đăng ký nhiều lần cùng một interface: inject `T` thì nhận bản đăng ký **cuối cùng**; inject `IEnumerable<T>` thì nhận tất cả. Từ .NET 8 có **keyed services** để chọn theo key. Container có sẵn không hỗ trợ decorator, phải tự đăng ký bằng factory hoặc dùng thư viện như Scrutor.
:::

::: info Bản chất
```csharp
// Keyed services (.NET 8): Strategy theo phương thức payout
builder.Services.AddKeyedScoped<IPayoutMethod, BankTransferPayout>("bank");
builder.Services.AddKeyedScoped<IPayoutMethod, PayPalPayout>("paypal");

public class PayoutRunner(IServiceProvider sp)
{
    public Task RunAsync(Payout p) => sp.GetRequiredKeyedService<IPayoutMethod>(p.Method).SendAsync(p);
}

// Decorator không cần thư viện: bọc cache quanh repository
builder.Services.AddScoped<MerchantRepository>();
builder.Services.AddScoped<IMerchantRepository>(sp =>
    new CachedMerchantRepository(
        sp.GetRequiredService<MerchantRepository>(),
        sp.GetRequiredService<IMemoryCache>()));
```
:::

::: details Ở dự án thật
Cách decorator bằng factory ở trên hợp với môi trường hạn chế thêm package bên ngoài như công ty hiện tại của bạn: đủ dùng, ai đọc cũng hiểu, không thêm dependency.
:::

::: warning Bẫy & follow-up
**"Inject `IServiceProvider` rồi tự `GetService` có ổn không?"**

Đó là service locator, thường bị coi là anti-pattern vì che giấu dependency thật. Chấp nhận được ở tầng hạ tầng (factory, chọn theo key lúc runtime như trên), không nên rải trong business logic.

**"`TryAdd` để làm gì?"**

Chỉ đăng ký nếu chưa có ai đăng ký interface đó. Thư viện dùng nó để app vẫn ghi đè được bằng implementation riêng.
:::

### Constructor có quá nhiều dependency {#too-many-dependencies}

::: tip Trả lời nhanh
Khoảng 5–6 dependency trở lên thường là dấu hiệu class đang làm quá nhiều việc (SRP). Cách xử lý là tách class theo trách nhiệm, không phải gom các dependency vào một object "bao tải" để constructor trông ngắn lại.
:::

::: info Bản chất
Theo thứ tự nên làm:

1. **Tách controller theo trách nhiệm (SRP)**: sửa gốc rễ.
2. **Inject vào tham số action** cho dependency chỉ một action dùng (`[FromServices]`; từ .NET 7 với `[ApiController]` không cần ghi attribute).
3. **Gom vào service có nghiệp vụ thật** (`PayoutApprovalService`), không phải class "bao tải" chỉ để chứa service.

Hai cách nghe hợp lý nhưng không giải quyết được:

- **Constructor overloading**: chạy được nhưng vô dụng. Container chọn constructor **trước khi** action chạy, không biết request gọi action nào; nó lấy constructor nhiều tham số nhất mà resolve được hết, hai constructor ngang nhau thì ném exception.
- **Property injection**: container mặc định không hỗ trợ (cần Autofac); ẩn dependency, dễ null.
:::

::: details Ở dự án thật
Web Forms ngày trước không có constructor injection cho page, nên code hay tự `new` service ngay trong page. Từ .NET Framework 4.7.2 đã có thể bật DI cho Web Forms qua `HttpRuntime.WebObjectActivator`. Biết chi tiết này cho thấy bạn hiểu cả hai thế giới, và nó là bước đệm hợp lý trước khi migrate: đưa logic về các service được inject, sau này mang sang .NET mới gần như nguyên vẹn.
:::

::: warning Bẫy & follow-up
**"Inject `IServiceProvider` rồi tự lấy service trong action cho gọn constructor?"**

Không: `HttpContext.RequestServices` trong action là service locator, dependency bị giấu chứ không mất đi.

**"Chuyển sang Minimal API, mỗi handler chỉ inject thứ nó cần, vậy là hết vấn đề?"**

Chỉ **giấu triệu chứng**. Một feature cần 10 dependency vẫn là thiết kế có vấn đề, dù chúng nằm ở tham số handler thay vì constructor.
:::

## Hỏi đáp

### Khái niệm

::: details "IoC và DI khác nhau thế nào?" (câu hay bị hỏi nhất)
Trả lời mẫu: "IoC là nguyên lý đảo quyền điều khiển: framework gọi code của mình, như ASP.NET Core tự gọi controller hay Web Forms gọi `Page_Load`. DI là một cách cụ thể để làm IoC cho việc tạo dependency: class không tự `new` mà nhận qua constructor, ai đó bên ngoài tạo giúp. Container chỉ là công cụ tự động hoá DI."

Follow-up hay gặp: "Cho ví dụ IoC mà không phải DI?" → event handler, template method (`BackgroundService.ExecuteAsync` do framework gọi), middleware `InvokeAsync`.
:::

::: details "Không có container thì có DI không?"
Có. Truyền dependency qua constructor và tự `new` ở `Main` là DI (Pure DI). Container chỉ giải quyết phần lặp lại: dựng cây lớn, quản lý lifetime, dispose. Câu này dùng để kiểm tra bạn có hiểu DI là kỹ thuật chứ không phải thư viện.
:::

::: details "Có DI rồi thì có cần DIP không? Ngược lại?"
Độc lập với nhau. Inject `SqlPayoutRepository` (class cụ thể) là DI nhưng vi phạm DIP: PayoutService vẫn phụ thuộc hạ tầng. Ngược lại, có interface do Core định nghĩa nhưng tự `new` qua factory là có DIP mà không DI. Hay dùng chung vì DI là cách gọn nhất để đưa implementation vào chỗ chỉ biết interface.
:::

::: details "Composition root là gì? Ở PayoutHub nằm đâu?"
Là **một chỗ duy nhất** biết mọi class cụ thể và ghép chúng lại. Ở PayoutHub là `Program.cs` của project Api: `AddScoped<IPayoutRepository, SqlPayoutRepository>()`. Core chỉ có interface, Infrastructure có implementation, Api là nơi nối hai bên. Đây là lý do Api được reference Infrastructure còn Core thì không.
:::

::: details "Interface cho mọi class có cần không?"
Không. Container đăng ký class cụ thể được (`AddScoped<PayoutCalculator>()`). Tạo interface khi có lý do: ranh giới với hạ tầng (DB, HTTP, clock), cần thay bằng fake khi test, hoặc có nhiều implementation. Interface chỉ có một implementation và không bao giờ bị thay là chi phí không có lợi.
:::

### Bên trong container

::: details "Class có nhiều constructor thì container chọn cái nào?"
Container của Microsoft chọn constructor có **nhiều tham số nhất mà nó resolve được hết**. Nếu có hai constructor ngang nhau mà không cái nào chứa tham số của cái kia, nó ném lỗi vì mơ hồ. Lời khuyên: mỗi service chỉ một constructor public.
:::

::: details "Circular dependency thì sao?"
A cần B, B cần A: container phát hiện lúc resolve và ném `InvalidOperationException` ("A circular dependency was detected"). Gặp lỗi này là dấu hiệu thiết kế: thường tách phần dùng chung ra class thứ ba. Dùng `Lazy<T>` hay inject `IServiceProvider` để lách chỉ là giấu vấn đề.
:::

::: details "Container dùng reflection, vậy có chậm không?"
Lần resolve đầu tiên của mỗi service, container dùng reflection để đọc constructor rồi dựng sẵn một "công thức tạo" (call site). Các lần sau nó dùng công thức đã biên dịch, gần bằng tự `new`. Singleton và scoped còn được cache. Chi phí thật thường nằm ở lúc start, nên ValidateOnBuild chỉ chạy một lần là đáng.
:::

::: details "Sao container của Microsoft không có property injection như Autofac?"
Cố ý giữ tối giản: chỉ constructor injection. Property injection làm dependency trông như tuỳ chọn, object có thể ở trạng thái thiếu dependency. Ngoài constructor, ASP.NET Core còn có **method injection** ở vài chỗ framework gọi: tham số `InvokeAsync` của middleware, `[FromServices]` trong action, tham số lambda của Minimal API.
:::

::: details "Đăng ký sau Build() có tác dụng không?"
Không. `Build()` chụp lại danh sách đăng ký, sau đó collection bị khoá (ASP.NET Core ném lỗi nếu bạn sửa `builder.Services` sau `Build()`). Mọi `Add…` phải nằm trước `var app = builder.Build();`.
:::

### Trong ASP.NET Core

::: details "Controller có được đăng ký trong container không?"
Mặc định **không**. Controller activator dùng `ActivatorUtilities`: tự gọi constructor của controller, lấy từng tham số từ `HttpContext.RequestServices`. Nên controller không cần `AddScoped` mà vẫn được inject. Gọi `AddControllersAsServices()` nếu muốn controller thật sự nằm trong container (vd để decorate). Biết chi tiết này là điểm cộng khi bị hỏi sâu.
:::

::: details "HttpContext.RequestServices là gì?"
Là **scope của request hiện tại**. Framework tạo scope khi request vào và dispose khi request xong. Mọi service scoped trong request đó đều lấy từ đây, nên cùng một request dùng chung một `DbContext`. Dùng thẳng nó trong action là service locator; dùng ở chỗ framework không inject được (vd `IExceptionHandler` singleton cần service scoped) thì chấp nhận được.
:::

::: details "Web Forms có IoC không? Có DI không?"
Có IoC: ASP.NET tạo page và gọi `Page_Load`, `Button_Click`, bạn không gọi chúng. Nhưng gần như không có DI: page do framework tạo bằng constructor không tham số, nên code tự `new` service. Từ .NET Framework 4.7.2 mới có `HttpRuntime.WebObjectActivator` để cắm container vào. Câu này giúp bạn nối kinh nghiệm Web Forms với .NET hiện đại.
:::

## Tự kiểm tra

::: details 1. Một câu phân biệt IoC, DI, DIP.
IoC: framework gọi code mình. DI: dependency được đưa vào thay vì tự `new`. DIP: code nghiệp vụ phụ thuộc interface, không phụ thuộc class hạ tầng.
:::

::: details 2. Resolve PayoutsController thì object nào được tạo đầu tiên? Vì sao?
Lá sâu nhất của cây, ở đây là `PayoutDbContext`: muốn new một class thì mọi tham số constructor của nó phải có trước.
:::

::: details 3. Hai request song song có dùng chung PayoutService (scoped) không? ILogger thì sao?
PayoutService: không, mỗi request một scope, mỗi scope một bản. ILogger singleton: có, cả app dùng chung một bản ở root.
:::

::: details 4. Inject IServiceProvider vào service rồi gọi GetService có phải DI không?
Không, đó là service locator. Container vẫn dùng nhưng class tự đi xin, dependency bị giấu và lỗi thiếu đăng ký chỉ lộ lúc chạy.
:::
