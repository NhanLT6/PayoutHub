---
title: "Dependency Injection"
---

# Dependency Injection

**Dependency Injection** là cách để class chỉ *dùng* dependency, còn việc *tạo* dependency nào thì dồn về một chỗ. Nhờ vậy logic nghiệp vụ test được không cần DB thật, và hạ tầng thay được mà không đụng nghiệp vụ. Trang này đi từ cái đau khi chưa có DI, suy ra các khái niệm, rồi mở container ra xem bên trong và tự viết lại một bản nhỏ. Liên quan: <T>SOLID</T> (chữ D).

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="dAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="dInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="dOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="dBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## 1. DI giải quyết vấn đề gì {#why}

Bắt đầu từ code chưa có DI. `PayoutService` cần đọc payout từ DB nên tự `new` repository:

```csharp
public class PayoutService
{
    private readonly SqlPayoutRepository _repo = new(); // [!code highlight]

    public decimal TotalPending(int merchantId) =>
        _repo.GetPending(merchantId).Sum(p => p.Amount);
}
```

Một dòng `new` này gây ra 3 cái đau:

- **Không test riêng được**: muốn test phép `Sum` thì phải có SQL Server thật, vì không có cách nào thay repository bằng bản giả.
- **Đổi hạ tầng là sửa nghiệp vụ**: chuyển sang Dapper hay gọi API thì phải mở `PayoutService` ra sửa, dù cách tính tiền không đổi.
- **Không ai điều phối việc dùng chung**: mỗi class tự `new` thì mỗi class một `DbContext`, không chung transaction; connection string và cấu hình rải khắp nơi.

Gốc chung của cả 3: **class vừa dùng dependency, vừa tự quyết định tạo dependency nào**. DI tách hai việc đó ra: class chỉ dùng, việc tạo dồn về một chỗ.

<Compare :labels="['Class tự new', 'Được inject']" caption="Tự new: PayoutService vừa dùng vừa tạo dependency. Được inject: chỉ dùng; việc tạo dồn về một chỗ là Program.cs.">
<template #a>
<svg viewBox="0 0 720 300" role="img" aria-label="PayoutService tự tạo repository và connection"><g font-size="13" class="mono" text-anchor="middle"><rect class="box" x="220" y="24" width="240" height="44" rx="8"/><text x="340" y="51">PayoutService</text><rect class="boxBad" x="220" y="128" width="240" height="44" rx="8"/><text x="340" y="155">SqlPayoutRepository</text><rect class="boxBad" x="220" y="232" width="240" height="44" rx="8"/><text x="340" y="259">SqlConnection("Server=…")</text></g><line class="lnBad" x1="340" y1="68" x2="340" y2="124" marker-end="url(#dBad)"/><line class="lnBad" x1="340" y1="172" x2="340" y2="228" marker-end="url(#dBad)"/><g font-size="12"><text x="352" y="96" class="mono badT">new SqlPayoutRepository()</text><text x="352" y="200" class="mono badT">new SqlConnection(…)</text><text x="480" y="146" class="badT">✗ test phải có DB thật</text><text x="480" y="162" class="badT">✗ đổi sang Dapper = sửa PayoutService</text><text x="200" y="146" text-anchor="end" class="muted">biết và tạo</text><text x="200" y="162" text-anchor="end" class="muted">class cụ thể</text></g></svg>
</template>
<template #b>
<svg viewBox="0 0 720 300" role="img" aria-label="PayoutService phụ thuộc interface, Program.cs tạo và đưa vào"><g font-size="13" class="mono" text-anchor="middle"><rect class="boxAcc" x="20" y="24" width="190" height="44" rx="8"/><text x="115" y="44">Program.cs</text><text x="115" y="60" font-size="11" class="muted">composition root</text><rect class="box" x="260" y="24" width="220" height="44" rx="8"/><text x="370" y="51">PayoutService</text><rect class="boxOk" x="260" y="138" width="220" height="44" rx="8"/><text x="370" y="165">IPayoutRepository</text><rect class="box" x="520" y="138" width="180" height="44" rx="8"/><text x="610" y="165">SqlPayoutRepository</text><rect class="box dash" x="520" y="232" width="180" height="44" rx="8"/><text x="610" y="259">FakeRepository</text></g><line class="lnAcc dash" x1="210" y1="46" x2="256" y2="46" marker-end="url(#dAcc)"/><line class="ln" x1="370" y1="68" x2="370" y2="134" marker-end="url(#dInk)"/><line class="lnOk" x1="520" y1="160" x2="484" y2="160" marker-end="url(#dOk)"/><path class="lnOk dash" d="M520 254 C 500 254, 500 186, 484 176" marker-end="url(#dOk)"/><g font-size="12"><text x="115" y="96" text-anchor="middle" class="accT">tạo object và truyền vào</text><text x="115" y="112" text-anchor="middle" class="accT">(nơi duy nhất biết class cụ thể)</text><text x="382" y="106">chỉ biết interface</text><text x="610" y="128" text-anchor="middle" class="okT">implement</text><text x="610" y="296" text-anchor="middle" class="muted">trong unit test</text></g></svg>
</template>
</Compare>

## 2. Từ một đoạn code tới bốn khái niệm {#concepts}

Không cần thuộc định nghĩa. Lấy `PayoutService` ở trên, chữa từng cái đau một; chữa xong nấc nào thì nấc đó được dán một cái tên.

<div class="fig">
<svg viewBox="0 0 720 400" role="img" aria-label="Năm bước tiến hoá của PayoutService: tự new, DI, DIP, composition root, container">
<rect class="boxBad" x="20" y="10" width="680" height="62" rx="8"/>
<text x="36" y="34" font-size="14" font-weight="600" class="badT">Nấc 0 · Tự new</text>
<text x="36" y="57" font-size="11.5" class="mono">_repo = new SqlPayoutRepository();</text>
<text x="470" y="36" font-size="12">đau: unit test cần DB thật</text>
<text x="470" y="56" font-size="12" class="muted">đau: đổi sang Dapper = sửa class này</text>
<line class="ln" x1="560" y1="72" x2="560" y2="85" marker-end="url(#dInk)"/>
<rect class="boxAcc" x="20" y="88" width="680" height="62" rx="8"/>
<text x="36" y="112" font-size="14" font-weight="600" class="accT">Nấc 1 · DI: nhận từ ngoài vào</text>
<text x="36" y="135" font-size="11.5" class="mono">PayoutService(SqlPayoutRepository repo)</text>
<text x="470" y="114" font-size="12">hết: không còn tự new bên trong</text>
<text x="470" y="134" font-size="12" class="muted">còn: Core vẫn biết class SQL</text>
<line class="ln" x1="560" y1="150" x2="560" y2="163" marker-end="url(#dInk)"/>
<rect class="boxOk" x="20" y="166" width="680" height="62" rx="8"/>
<text x="36" y="190" font-size="14" font-weight="600" class="okT">Nấc 2 · DIP: phụ thuộc interface của Core</text>
<text x="36" y="213" font-size="11.5" class="mono">PayoutService(IPayoutRepository repo)</text>
<text x="470" y="192" font-size="12">hết: Core không biết gì về SQL</text>
<text x="470" y="212" font-size="12" class="muted">còn: vậy ai new cả cây object?</text>
<line class="ln" x1="560" y1="228" x2="560" y2="241" marker-end="url(#dInk)"/>
<rect class="box" x="20" y="244" width="680" height="62" rx="8"/>
<text x="36" y="268" font-size="14" font-weight="600">Nấc 3 · Composition root (Pure DI)</text>
<text x="36" y="291" font-size="11.5" class="mono">new PayoutService(new SqlPayoutRepository(db), clock)</text>
<text x="470" y="270" font-size="12">hết: chỉ một chỗ biết class cụ thể</text>
<text x="470" y="290" font-size="12" class="muted">còn: 200 class, lifetime, dispose</text>
<line class="ln" x1="560" y1="306" x2="560" y2="319" marker-end="url(#dInk)"/>
<rect class="boxAcc" x="20" y="322" width="680" height="62" rx="8"/>
<text x="36" y="346" font-size="14" font-weight="600" class="accT">Nấc 4 · DI container</text>
<text x="36" y="369" font-size="11.5" class="mono">AddScoped&lt;IPayoutRepository, SqlPayoutRepository&gt;()</text>
<text x="470" y="348" font-size="12">hết: công cụ tự new, giữ, dispose</text>
<text x="470" y="368" font-size="12" class="muted">IoC: từ giờ framework gọi code bạn</text>
</svg>
<p class="fig-caption">Đọc từ trên xuống: mỗi nấc sinh ra để chữa cái "còn đau" của nấc trước. Tên khái niệm chỉ là nhãn dán lên từng bước.</p>
</div>

Đọc lại hình là suy ra được từng khái niệm:

- **DI** (Nấc 1) chỉ trả lời _ai tạo dependency_: không phải class. Chưa nói gì tới interface.
- **<T>DIP</T>** (Nấc 2) trả lời _class biết tới cái gì_: chỉ biết interface do Core định nghĩa, mũi tên phụ thuộc giữa project bị lật ngược, xem [cách đọc mũi tên](#dip-arrow). Nấc 1 đã có DI mà chưa có DIP, nên hai thứ độc lập với nhau.
- **Composition root** (Nấc 3) trả lời _ghép object **ở đâu**_: một chỗ duy nhất viết `new` cho class cụ thể, gần điểm khởi động; ở PayoutHub là `Program.cs` của Api. "Root" ở đây là gốc của code: chỗ bắt đầu ghép cả cây (khác với _root provider_ ở [mục 3](#lifetime-cache)). Làm tay như vậy gọi là <T>Pure DI</T>.
- **DI container** (Nấc 4) trả lời _ghép **bằng gì**_: công cụ làm hộ Nấc 3. Ngoài thực tế hai nấc này gộp làm một: `Program.cs` có `builder.Services.Add…` chính là composition root dùng container. Tách ra để thấy hai trường hợp lệch nhau: **có nấc 3 mà không có nấc 4** là unit test tự viết `new PayoutService(fakeRepo, fakeClock)`; **có nấc 4 mà mất nấc 3** là `GetService` rải khắp code, tức service locator.
- **IoC** không phải một bước riêng mà là hệ quả: khi container tạo object thì bạn cũng không tự gọi controller nữa, framework gọi. IoC là ý tưởng "framework gọi bạn"; DI là IoC áp vào việc tạo object.
- **Service locator** là đi ngược Nấc 1: class nhận `IServiceProvider` rồi tự `GetService`, tức là lại tự đi lấy dependency. Có container nhưng không còn là DI, xem [Service locator](#service-locator).

### Nấc 2: đọc mũi tên phụ thuộc thế nào {#dip-arrow}

Mũi tên `A ──► B` nghĩa là **A biết B tồn tại**: trong code A có `using` tới B, project A reference project B. Hệ quả: **B đổi thì A có thể phải sửa và build lại**. Mũi tên này **không phải chiều gọi hàm lúc chạy**.

<div class="fig">
<svg viewBox="0 0 720 300" role="img" aria-label="Không DIP: Core trỏ xuống Infrastructure. Có DIP: interface nằm trong Core, Infrastructure trỏ lên Core, nhưng lúc chạy Core vẫn gọi xuống"><g font-size="14" font-weight="600" text-anchor="middle"><text x="185" y="28">Không DIP</text><text x="535" y="28">Có DIP</text></g><rect class="box" x="40" y="50" width="290" height="70" rx="8"/><text x="56" y="74" font-size="13" font-weight="600">Core</text><text x="56" y="102" font-size="12" class="mono">PayoutService</text><rect class="boxBad" x="40" y="180" width="290" height="60" rx="8"/><text x="56" y="204" font-size="13" font-weight="600">Infrastructure</text><text x="56" y="228" font-size="12" class="mono">SqlPayoutRepository</text><line class="lnBad" x1="185" y1="120" x2="185" y2="176" marker-end="url(#dBad)"/><text x="196" y="144" font-size="11.5" class="mono badT">using Infrastructure;</text><text x="196" y="162" font-size="12" class="badT">Core biết class SQL</text><text x="185" y="270" font-size="12" text-anchor="middle" class="badT">SqlPayoutRepository đổi → PayoutService bị ảnh hưởng</text><rect class="boxOk" x="390" y="50" width="290" height="100" rx="8"/><text x="406" y="74" font-size="13" font-weight="600" class="okT">Core</text><text x="406" y="98" font-size="12" class="mono">PayoutService</text><rect class="boxOk dash" x="406" y="108" width="258" height="30" rx="6"/><text x="535" y="128" font-size="12" class="mono" text-anchor="middle">IPayoutRepository (Core đặt ra)</text><rect class="box" x="390" y="200" width="290" height="60" rx="8"/><text x="406" y="224" font-size="13" font-weight="600">Infrastructure</text><text x="406" y="248" font-size="11.5" class="mono">SqlPayoutRepository : IPayoutRepository</text><line class="lnOk" x1="620" y1="198" x2="620" y2="142" marker-end="url(#dOk)"/><text x="628" y="176" font-size="11.5" class="mono okT">using Core;</text><line class="lnAcc dash" x1="440" y1="140" x2="440" y2="196" marker-end="url(#dAcc)"/><text x="450" y="176" font-size="11.5" class="accT">lúc chạy vẫn gọi xuống</text><text x="535" y="286" font-size="12" text-anchor="middle" class="okT">Core không biết Infrastructure tồn tại</text></svg>
<p class="fig-caption">Chiều gọi hàm lúc chạy không đổi (nét đứt): PayoutService vẫn gọi SqlPayoutRepository. Chỉ chiều "ai biết ai" trong source code bị lật lên: đó là chữ Inversion.</p>
</div>

Điểm chính không phải "có interface" mà là **interface nằm ở đâu, do ai đặt ra**: nó nằm trong Core và mang hình dạng Core cần, nên Infrastructure phải chạy theo Core. Nếu đặt `IPayoutRepository` trong Infrastructure thì mũi tên vẫn trỏ xuống như bên trái, có interface mà vẫn không có DIP.

::: info Nếu hệ thống dính chặt SQL Server thì có cần interface không?
"Sau này đổi DB" là lý do **yếu nhất** cho DIP: gần như không ai đổi DB. Cái giá thật khi Core gọi thẳng SQL/EF là **test logic tiền phải có DB thật** và rule nghiệp vụ trộn với chi tiết SQL. Nhiều team cố ý không làm repository interface trên EF Core: coi `DbContext` là lớp trừu tượng và test bằng DB thật (SQLite, Testcontainers). Hợp lệ. Chỗ DIP thật sự đáng làm là ranh giới **chậm hoặc không ổn định**: gọi FakeBank qua HTTP, `TimeProvider`, message bus, email; không có bản giả thì không test được "bank trả 500".
:::

### Nấc 3 viết tay trông thế nào {#pure-di}

```csharp
// Composition root viết tay: Main tự new cả cây, từ lá lên gốc
var db      = new PayoutDbContext(options);
var repo    = new SqlPayoutRepository(db);
var service = new PayoutService(repo, TimeProvider.System);
var job     = new GeneratePayoutsJob(service);
await job.RunAsync();
```

Với 5 class thì viết tay được. Với 200 class, lifetime khác nhau và phải dispose đúng lúc, thì cần container: đó là mục tiếp theo.

## 3. Container hoạt động thế nào {#how-container-works}

Theo một request `GET /payouts/42` đi qua 4 bước. Mỗi mục bên dưới phóng to một bước.

<div class="fig">
<svg viewBox="0 0 720 240" role="img" aria-label="Bốn bước của container: Register, Build lúc khởi động; Resolve, Dispose lặp lại cho mỗi request"><g text-anchor="middle"><rect class="box" x="20" y="30" width="160" height="140" rx="8"/><text x="100" y="56" font-size="14" font-weight="600">Bước 1 · Register</text><text x="100" y="80" font-size="11" class="mono">builder.Services.Add…</text><text x="100" y="102" font-size="12">ghi công thức vào list</text><text x="100" y="120" font-size="12" class="muted">chưa tạo object nào</text><rect class="boxAcc" x="195" y="30" width="160" height="140" rx="8"/><text x="275" y="56" font-size="14" font-weight="600">Bước 2 · Build</text><text x="275" y="80" font-size="11" class="mono">builder.Build()</text><text x="275" y="102" font-size="12">khoá list, tạo root</text><text x="275" y="120" font-size="12">kiểm tra đăng ký</text><text x="275" y="138" font-size="12">và captive (Dev)</text><rect class="boxOk" x="370" y="30" width="160" height="140" rx="8"/><text x="450" y="56" font-size="14" font-weight="600">Bước 3 · Resolve</text><text x="450" y="80" font-size="11" class="mono">GET /payouts/42</text><text x="450" y="102" font-size="12">tạo scope cho request</text><text x="450" y="120" font-size="12">dựng cây constructor</text><text x="450" y="138" font-size="12">cache theo lifetime</text><rect class="box" x="545" y="30" width="160" height="140" rx="8"/><text x="625" y="56" font-size="14" font-weight="600">Bước 4 · Dispose</text><text x="625" y="80" font-size="11" class="mono">scope.Dispose()</text><text x="625" y="102" font-size="12">request xong</text><text x="625" y="120" font-size="12">dispose ngược thứ tự</text><text x="625" y="138" font-size="12" class="muted">singleton: lúc app tắt</text></g><g class="ln"><line x1="180" y1="100" x2="191" y2="100" marker-end="url(#dInk)"/><line x1="355" y1="100" x2="366" y2="100" marker-end="url(#dInk)"/><line x1="530" y1="100" x2="541" y2="100" marker-end="url(#dInk)"/></g><line class="ln" x1="20" y1="196" x2="355" y2="196"/><line class="lnAcc" x1="370" y1="196" x2="705" y2="196"/><g font-size="12" text-anchor="middle"><text x="187" y="218" class="muted">1 lần, lúc app khởi động</text><text x="537" y="218" class="accT">lặp lại cho mỗi request</text></g></svg>
<p class="fig-caption">Bạn chỉ viết Bước 1. Ba bước sau framework và container tự làm.</p>
</div>

| Bước | Container làm gì | Mục |
|---|---|---|
| **1** Register | Ghi công thức vào một list | [Đăng ký](#register) |
| **2** Build | Khoá list, tạo root provider, kiểm tra | [Đăng ký](#register), [Captive](#captive-rule) |
| **3** Resolve | Dựng cây constructor, dùng lại object theo lifetime | [Resolve](#resolve), [Lifetime](#lifetime-cache) |
| **4** Dispose | Dispose object nó đã tạo khi scope kết thúc | [Dispose](#dispose) |

### Bước 1–2: đăng ký là một list công thức {#register}

**ServiceDescriptor**: một dòng đăng ký, gồm 3 thứ: _hỏi type nào_ (`IPayoutRepository`), _trả gì_ (class, factory hoặc instance có sẵn), _sống bao lâu_ (lifetime). **`IServiceCollection`** chỉ là một list các dòng này.

<div class="fig">
<svg viewBox="0 0 720 230" role="img" aria-label="IServiceCollection là một list ServiceDescriptor; đăng ký trùng thì inject T lấy bản cuối, IEnumerable lấy tất cả"><g font-size="12"><rect class="box" x="20" y="16" width="420" height="30" rx="4"/><text x="30" y="36" font-weight="600">Service type</text><text x="190" y="36" font-weight="600">Implementation</text><text x="350" y="36" font-weight="600">Lifetime</text><g class="mono"><text x="30" y="68">IClock</text><text x="190" y="68">SystemClock</text><text x="350" y="68">Singleton</text><text x="30" y="100">IPayoutRepository</text><text x="190" y="100">SqlPayoutRepository</text><text x="350" y="100">Scoped</text><text x="30" y="132">IPayoutMethod</text><text x="190" y="132">BankTransferPayout</text><text x="350" y="132">Scoped</text><text x="30" y="164">IPayoutMethod</text><text x="190" y="164">PayPalPayout</text><text x="350" y="164">Scoped</text><text x="30" y="196">ILogger&lt;&gt;</text><text x="190" y="196">Logger&lt;&gt;</text><text x="350" y="196">Singleton</text></g></g><rect class="boxAcc dash" x="20" y="114" width="420" height="64" rx="4"/><rect class="boxOk dash" x="20" y="180" width="420" height="26" rx="4"/><g font-size="12"><text x="456" y="128" class="accT">inject IPayoutMethod</text><text x="456" y="144" class="accT">→ PayPalPayout (bản cuối)</text><text x="456" y="164" class="accT">inject IEnumerable&lt;IPayoutMethod&gt;</text><text x="456" y="180" class="accT">→ cả hai</text><text x="456" y="198" class="okT">open generic: hỏi ILogger&lt;X&gt;</text><text x="456" y="214" class="okT">→ container đóng thành Logger&lt;X&gt;</text></g></svg>
<p class="fig-caption">Mỗi dòng là một ServiceDescriptor. Đây là danh sách công thức, chưa có object nào được tạo.</p>
</div>

- **Là list, không phải dictionary**: đăng ký trùng không ghi đè. Inject `T` nhận **bản cuối**, inject `IEnumerable<T>` nhận **tất cả**. `TryAdd…` chỉ thêm nếu chưa ai đăng ký type đó (thư viện dùng để app vẫn ghi đè được).
- **Open generic**: một dòng `typeof(ILogger<>) → typeof(Logger<>)` phục vụ mọi `ILogger<X>`; container đóng generic lúc resolve.
- **Build** (`builder.Build()`) chụp lại list thành **`IServiceProvider`**, sau đó list bị khoá: thêm đăng ký sau `Build()` thì ASP.NET Core ném lỗi. Ở Development, `ValidateOnBuild` + `ValidateScopes` kiểm tra luôn: thiếu đăng ký, [captive dependency](#captive-rule).

### Bước 3: resolve là đệ quy {#resolve}

Muốn tạo `PayoutsController` thì đọc constructor, thấy cần `IPayoutService`, đi resolve cái đó, cứ thế xuống tới lá. **Tạo object từ lá ngược lên gốc.** Container dùng <T>reflection</T> để đọc constructor ở lần resolve đầu, các lần sau dùng công thức đã biên dịch và cache (call site), gần bằng tự `new`.

<div class="fig">
<svg viewBox="0 0 720 350" role="img" aria-label="Cây resolve PayoutsController, số là thứ tự tạo object"><g font-size="13" class="mono" text-anchor="middle"><rect class="box" x="250" y="16" width="220" height="48" rx="8"/><text x="360" y="37">PayoutsController</text><text x="360" y="55" font-size="11" class="muted">mỗi request</text><rect class="boxAcc" x="90" y="106" width="230" height="48" rx="8"/><text x="205" y="127">PayoutService</text><text x="205" y="145" font-size="11" class="accT">scoped · giữ trong scope</text><rect class="boxOk" x="400" y="106" width="230" height="48" rx="8"/><text x="515" y="127">ILogger&lt;PayoutsController&gt;</text><text x="515" y="145" font-size="11" class="okT">singleton · giữ ở root</text><rect class="boxAcc" x="20" y="196" width="220" height="48" rx="8"/><text x="130" y="217">SqlPayoutRepository</text><text x="130" y="235" font-size="11" class="accT">scoped</text><rect class="boxOk" x="260" y="196" width="170" height="48" rx="8"/><text x="345" y="217">TimeProvider</text><text x="345" y="235" font-size="11" class="okT">singleton</text><rect class="boxAcc" x="20" y="286" width="220" height="48" rx="8"/><text x="130" y="307">PayoutDbContext</text><text x="130" y="325" font-size="11" class="accT">scoped</text></g><g class="ln"><line x1="320" y1="64" x2="230" y2="102" marker-end="url(#dInk)"/><line x1="400" y1="64" x2="490" y2="102" marker-end="url(#dInk)"/><line x1="170" y1="154" x2="140" y2="192" marker-end="url(#dInk)"/><line x1="240" y1="154" x2="320" y2="192" marker-end="url(#dInk)"/><line x1="130" y1="244" x2="130" y2="282" marker-end="url(#dInk)"/></g><g font-size="12" font-weight="600" text-anchor="middle"><circle class="boxAcc" cx="252" cy="310" r="11"/><text x="252" y="314">1</text><circle class="boxAcc" cx="252" cy="220" r="11"/><text x="252" y="224">2</text><circle class="boxAcc" cx="442" cy="220" r="11"/><text x="442" y="224">3</text><circle class="boxAcc" cx="332" cy="130" r="11"/><text x="332" y="134">4</text><circle class="boxAcc" cx="642" cy="130" r="11"/><text x="642" y="134">5</text><circle class="boxAcc" cx="482" cy="40" r="11"/><text x="482" y="44">6</text></g><g font-size="12"><text x="470" y="270">Đi xuống: đọc constructor,</text><text x="470" y="286">hỏi tiếp từng tham số.</text><text x="470" y="310">Đi lên: đủ tham số thì new.</text><text x="470" y="326" class="muted">Số tròn = thứ tự object được tạo.</text></g></svg>
<p class="fig-caption">Nếu PayoutService đã có trong scope (request này đã tạo rồi) thì container trả lại luôn, không đi xuống nhánh đó nữa.</p>
</div>

Ba luật của bước này:

- **Nhiều constructor**: chọn cái có **nhiều tham số nhất mà resolve được hết**; hai cái ngang nhau thì ném lỗi vì mơ hồ. Nên mỗi service chỉ một constructor public.
- **Vòng tròn** (A cần B, B cần A): ném `InvalidOperationException` "A circular dependency was detected". Sửa bằng cách tách phần dùng chung ra class thứ ba; `Lazy<T>` hay inject `IServiceProvider` chỉ là giấu vấn đề.
- **Chỉ constructor injection**: container của Microsoft chỉ tự làm constructor injection, xem [Ba cách đưa dependency vào](#injection-types).

### Bước 3: lifetime quyết định object được dùng lại ở đâu {#lifetime-cache}

Lifetime trả lời: **container tạo bao nhiêu object, và giữ lại để dùng lại trong phạm vi nào**.

```
Singleton : [ 1 object ]──────────── dùng chung cho cả app ────────────
Scoped    : [obj A] request 1   [obj B] request 2   [obj C] request 3
Transient : mỗi lần xin là 1 object mới, kể cả trong cùng 1 request
```

**Root provider**: provider gốc do `Build()` tạo ra, mọi scope là con của nó; sống cả đời app, giữ **singleton**. (Không liên quan tới _composition root_: đó là chỗ trong code, còn đây là một object lúc chạy.) **Scope**: provider con, trong web là một scope cho mỗi request (`HttpContext.RequestServices`), giữ **scoped**. **Transient** không được giữ.

<div class="fig">
<svg viewBox="0 0 720 300" role="img" aria-label="Root provider giữ singleton, mỗi request có scope riêng giữ scoped"><rect class="boxOk" x="20" y="16" width="680" height="84" rx="10"/><text x="38" y="42" font-size="14" font-weight="600" class="okT">Root provider · sống cả đời app</text><g font-size="12" class="mono" text-anchor="middle"><rect class="box" x="38" y="56" width="150" height="30" rx="6"/><text x="113" y="76">IMemoryCache</text><rect class="box" x="200" y="56" width="150" height="30" rx="6"/><text x="275" y="76">TimeProvider</text><rect class="box" x="362" y="56" width="150" height="30" rx="6"/><text x="437" y="76">ILogger&lt;T&gt;</text></g><text x="528" y="76" font-size="12" class="muted">singleton: dùng chung</text><g><rect class="boxAcc" x="20" y="140" width="320" height="140" rx="10"/><text x="36" y="164" font-size="13" font-weight="600" class="accT">Scope của request A</text><rect class="boxAcc" x="380" y="140" width="320" height="140" rx="10"/><text x="396" y="164" font-size="13" font-weight="600" class="accT">Scope của request B</text></g><g font-size="12" class="mono" text-anchor="middle"><rect class="box" x="36" y="176" width="140" height="28" rx="6"/><text x="106" y="195">DbContext #A</text><rect class="box" x="186" y="176" width="140" height="28" rx="6"/><text x="256" y="195">PayoutService #A</text><rect class="box" x="396" y="176" width="140" height="28" rx="6"/><text x="466" y="195">DbContext #B</text><rect class="box" x="546" y="176" width="140" height="28" rx="6"/><text x="616" y="195">PayoutService #B</text><rect class="box dash" x="36" y="214" width="290" height="28" rx="6"/><text x="181" y="233">transient: mới mỗi lần hỏi</text><rect class="box dash" x="396" y="214" width="290" height="28" rx="6"/><text x="541" y="233">transient: mới mỗi lần hỏi</text></g><g font-size="12"><text x="36" y="266" class="muted">hết request: Dispose ngược thứ tự tạo</text><text x="396" y="266" class="muted">hết request: Dispose ngược thứ tự tạo</text></g><line class="lnAcc dash" x1="180" y1="138" x2="180" y2="104" marker-end="url(#dAcc)"/><line class="lnAcc dash" x1="540" y1="138" x2="540" y2="104" marker-end="url(#dAcc)"/><text x="190" y="126" font-size="12" class="accT">hỏi singleton → lấy ở root</text><text x="550" y="126" font-size="12" class="accT">hỏi singleton → lấy ở root</text></svg>
<p class="fig-caption">Hai request không bao giờ thấy DbContext của nhau. Singleton giữ một scoped service là kéo nó ra khỏi hộp của nó: đó là captive dependency.</p>
</div>

| Lifetime | Ví dụ hợp lý | Lưu ý |
|---|---|---|
| Transient | Validator, mapper: nhỏ, không state, rẻ để tạo | Cùng một request có thể có nhiều instance khác nhau |
| Scoped | `DbContext`, <T>unit of work</T>, user hiện tại | Mọi service trong request dùng chung một `DbContext`, nên `SaveChanges` một lần là ghi hết trong một transaction. Để transient thì mỗi repository một context, mất <T>atomic</T> |
| Singleton | Cache, config đã nạp, `IHttpClientFactory`, `ILogger<T>` | Có state thì phải <T>thread-safe</T>; không được giữ service scoped |

**Chọn lifetime theo câu hỏi "object có giữ dữ liệu riêng của request không?"**, không theo "nó chạy lúc nào". `GlobalExceptionHandler` chỉ chạy trong request nhưng nhận `httpContext` qua tham số, không lưu lại, nên singleton vẫn an toàn (`AddExceptionHandler<T>()` đăng ký nó là singleton). `DbContext` giữ change tracker và connection của request nên phải scoped.

### Captive dependency: sống lâu không được giữ sống ngắn {#captive-rule}

Object được tạo ra sống theo **chỗ giữ nó**. Singleton giữ một scoped service thì service đó bị kéo ra khỏi scope và sống suốt đời app: một `DbContext` dùng chung cho mọi request, sai dữ liệu và không thread-safe. Đó là <T>captive dependency</T>.

| Inject ↓ vào → | Transient | Scoped | Singleton |
|---|---|---|---|
| **Transient** | OK | OK | Chạy được nhưng bị kéo dài thành singleton; chỉ ổn nếu không state và thread-safe |
| **Scoped** | OK | OK | **Sai**. Bị chặn khi bật `ValidateScopes` |
| **Singleton** | OK | OK | OK |

Singleton (hoặc `BackgroundService`) cần scoped thì **tự tạo scope**, không resolve từ root:

```csharp
public class DailyReportJob(IServiceScopeFactory scopes) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // ... dùng db; scope dispose thì db dispose theo
    }
}
```

Config cũng vậy: singleton cần giá trị mới nhất thì dùng `IOptionsMonitor` (singleton), không dùng `IOptionsSnapshot` (scoped), xem [Options pattern](/aspnet-core/options-pattern#three-interfaces).

### Bước 4: ai tạo thì người đó dispose {#dispose}

```
tạo:      1 DbContext   2 Repository   3 PayoutService   4 Controller
dispose:  4 → 3 → 2 → 1        (ngược thứ tự tạo, lúc scope kết thúc)
```

- Container chỉ dispose object **nó tự tạo**: scoped và transient khi scope của chúng kết thúc, singleton khi app tắt.
- Object bạn tự `new` rồi đăng ký bằng instance (`AddSingleton(myObj)`) thì container **không** dispose.
- Transient `IDisposable` resolve từ **root** bị root giữ tham chiếu tới lúc app tắt: mỗi lần resolve lại giữ thêm một object, thành <T>memory leak</T>. Luôn resolve trong scope.

## 4. Tự viết một mini container {#mini-container}

Khoảng 80 dòng là đủ cả 4 bước. Đọc theo số bước trong comment.

::: code-group

```csharp [MiniContainer.cs]
namespace MiniDi;

public enum Lifetime { Transient, Scoped, Singleton }

// Một dòng đăng ký: ServiceDescriptor thu nhỏ
public sealed record Registration(Type ServiceType, Type ImplType, Lifetime Lifetime);

// Bước 1: IServiceCollection thu nhỏ, chỉ là một list
public sealed class MiniServices
{
    private readonly List<Registration> _list = [];

    public MiniServices Add<TService, TImpl>(Lifetime lifetime) where TImpl : TService
    {
        _list.Add(new Registration(typeof(TService), typeof(TImpl), lifetime));
        return this;
    }

    // Bước 2: chụp lại list, tạo root provider
    public MiniProvider Build() => new([.. _list], root: null);
}

// IServiceProvider thu nhỏ: root và scope dùng chung một class
public sealed class MiniProvider : IDisposable
{
    private readonly List<Registration> _registrations;
    private readonly MiniProvider _root;
    private readonly Dictionary<Type, object> _cache = [];   // root: singleton, scope: scoped
    private readonly List<IDisposable> _disposables = [];
    private readonly HashSet<Type> _resolving = [];          // phát hiện vòng tròn

    internal MiniProvider(List<Registration> registrations, MiniProvider? root)
    {
        _registrations = registrations;
        _root = root ?? this;
    }

    public MiniProvider CreateScope() => new(_registrations, _root);

    public T Get<T>() => (T)Get(typeof(T));

    // Bước 3: resolve
    public object Get(Type serviceType)
    {
        var reg = _registrations.LastOrDefault(r => r.ServiceType == serviceType)   // trùng: lấy bản cuối
            ?? throw new InvalidOperationException($"Chưa đăng ký {serviceType.Name}");

        return reg.Lifetime switch
        {
            Lifetime.Singleton => _root.GetOrCreate(reg),             // luôn cache ở root
            Lifetime.Scoped when this == _root =>                     // giống ValidateScopes
                throw new InvalidOperationException($"Resolve scoped {serviceType.Name} từ root"),
            Lifetime.Scoped => GetOrCreate(reg),                      // cache ở scope này
            _ => Create(reg),                                         // transient: không cache
        };
    }

    private object GetOrCreate(Registration reg)
    {
        if (!_cache.TryGetValue(reg.ServiceType, out var obj))
        {
            obj = Create(reg);
            _cache[reg.ServiceType] = obj;
        }
        return obj;
    }

    private object Create(Registration reg)
    {
        if (!_resolving.Add(reg.ImplType))
            throw new InvalidOperationException($"Vòng tròn tại {reg.ImplType.Name}");
        try
        {
            var ctor = reg.ImplType.GetConstructors()
                .OrderByDescending(c => c.GetParameters().Length)
                .First();
            // ĐỆ QUY: resolve từng tham số trước, rồi mới new
            var args = ctor.GetParameters().Select(p => Get(p.ParameterType)).ToArray();
            var obj = ctor.Invoke(args);
            if (obj is IDisposable d) _disposables.Add(d);            // ai tạo thì người đó dispose
            return obj;
        }
        finally
        {
            _resolving.Remove(reg.ImplType);
        }
    }

    // Bước 4: dispose ngược thứ tự tạo
    public void Dispose()
    {
        for (var i = _disposables.Count - 1; i >= 0; i--)
            _disposables[i].Dispose();
    }
}
```

```csharp [Program.cs]
using MiniDi;

var services = new MiniServices()
    .Add<IClock, SystemClock>(Lifetime.Singleton)
    .Add<AppDb, AppDb>(Lifetime.Scoped)
    .Add<IPayoutRepository, SqlPayoutRepository>(Lifetime.Scoped)
    .Add<PayoutService, PayoutService>(Lifetime.Scoped);

using var root = services.Build();

using (var scopeA = root.CreateScope())          // request A
{
    var s1 = scopeA.Get<PayoutService>();
    var s2 = scopeA.Get<PayoutService>();
    Console.WriteLine(ReferenceEquals(s1, s2));  // True: scoped, cùng scope
}                                                // in "AppDb disposed"

using var scopeB = root.CreateScope();           // request B
Console.WriteLine(ReferenceEquals(
    scopeB.Get<IClock>(), root.Get<IClock>()));  // True: singleton dùng chung

// root.Get<AppDb>();  → lỗi "Resolve scoped AppDb từ root"

public interface IClock { DateTime UtcNow { get; } }
public class SystemClock : IClock { public DateTime UtcNow => DateTime.UtcNow; }
public class AppDb : IDisposable { public void Dispose() => Console.WriteLine("AppDb disposed"); }
public interface IPayoutRepository { }
public class SqlPayoutRepository(AppDb db) : IPayoutRepository { }
public class PayoutService(IPayoutRepository repo, IClock clock) { }
```

:::

Bản thật khác bản mini ở đâu:

| Mini | `Microsoft.Extensions.DependencyInjection` |
|---|---|
| `Registration` chỉ có type | `ServiceDescriptor` còn có factory (`sp => …`) và instance có sẵn, keyed service |
| `LastOrDefault` | Cũng lấy bản cuối cho `T`, thêm `IEnumerable<T>` và open generic |
| Reflection mỗi lần tạo | Reflection lần đầu, sau đó dùng call site đã biên dịch |
| Không lock | Thread-safe: hai request cùng tạo một singleton vẫn chỉ ra một object |
| Kiểm tra lúc resolve | `ValidateOnBuild` kiểm tra cả cây ngay lúc start |

## 5. Ba cách đưa dependency vào {#injection-types}

Ba cách khác nhau ở một điểm: **lúc object vừa được tạo xong, nó đã có đủ dependency chưa**.

::: code-group

```csharp [Constructor (mặc định)]
public class PayoutService(IPayoutRepository repo)   // thiếu repo thì không new được
{
    public Task<decimal> TotalPendingAsync(int merchantId) => repo.SumPendingAsync(merchantId);
}
```

```csharp [Method]
// Middleware convention là singleton; DbContext là scoped nên đi vào tham số của lần gọi
public class AuditMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, PayoutDbContext db)   // db chỉ sống trong lần gọi này
    {
        await next(ctx);
        db.AuditLogs.Add(new AuditLog(ctx.Request.Path));
        await db.SaveChangesAsync();
    }
}
```

```csharp [Property (Autofac)]
public class PayoutService
{
    public IPayoutRepository Repo { get; set; } = null!;   // null cho tới khi container gán

    public Task<decimal> TotalPendingAsync(int merchantId) => Repo.SumPendingAsync(merchantId);
}
```

:::

```
Constructor:  new PayoutService(repo) ──────────────────── đủ đồ ngay, suốt đời
Method:       new() ── InvokeAsync(ctx, db) ── db chỉ có trong lần gọi đó
Property:     new() ── [ Repo == null ] ── container gán Repo ── dùng được
                         └ khoảng hở: ai gọi method lúc này → NullReferenceException
```

Container của Microsoft chỉ tự làm **constructor injection**; method injection chỉ có ở chỗ framework gọi (`InvokeAsync`, `[FromServices]` trong action, tham số lambda Minimal API).

### Vì sao Microsoft không làm property injection {#why-no-property-injection}

Cả ba lý do đều suy ra từ cái khoảng hở ở hình trên:

1. **Object có lúc thiếu đồ**: unit test `new PayoutService()` mà quên gán `Repo` thì compile vẫn qua, chạy mới nổ `NullReferenceException`. Thiếu tham số constructor thì compile báo lỗi ngay.
2. **Dependency bị giấu**: đọc constructor không biết class cần gì; property public thì ai cũng gán lại được.
3. **Container mặc định cố tình tối giản**: nó là mẫu số chung để Autofac, Lamar... cắm vào thay thế (`builder.Host.UseServiceProviderFactory(...)`). Cần thêm tính năng thì cắm container khác.

### Autofac: khi nào cần, và nó inject lúc nào {#autofac}

**Autofac inject lúc nào?** Constructor thì luôn luôn, giống container của Microsoft. Property thì **không tự động**, chỉ có hai trường hợp:

```csharp
// 1. Bật cho một đăng ký: gán mọi property public có setter
builder.RegisterType<PayoutService>().PropertiesAutowired();

// 2. Từ Autofac 7: property có từ khoá `required` luôn được inject, như tham số constructor
public class PayoutService
{
    public required IPayoutRepository Repo { get; init; }   // thiếu đăng ký → lỗi lúc resolve
}
```

`required` vá đúng lý do 1 ở trên: compiler bắt `new PayoutService()` phải gán `Repo`, còn container thiếu đăng ký thì báo lỗi lúc resolve chứ không để null. Vì vậy tài liệu Autofac khuyên property bắt buộc thì đánh dấu `required`, và vẫn ưu tiên constructor.

**Đã có DI rồi, sao còn cần Autofac?** Bạn nói đúng: với app .NET 8 mới, container có sẵn thường là đủ. Autofac cần ở 2 hoàn cảnh:

- **App .NET Framework (Web Forms, MVC 5, Web API 2)**: Framework **không có container có sẵn**. Muốn DI thì phải chọn một container: Autofac, Unity, Ninject... Nếu bạn gặp Autofac ở công ty thì gần như chắc là vì lý do này.
- **Cần tính năng container có sẵn không có**: quét assembly để đăng ký hàng loạt, decorator, interceptor (bọc mọi method để log thời gian), module đăng ký theo từng project, multi-tenant. Hai thứ đầu bây giờ có thể dùng <T>Scrutor</T> bổ sung cho container có sẵn, nên ít ai thêm Autofac chỉ vì chúng.

Ví dụ cụ thể:

::: code-group

```csharp [Web Forms: property injection]
// ASP.NET tự new PayoutReport() bằng constructor rỗng, Autofac không được gọi constructor.
// PropertyInjectionModule (khai báo trong web.config) chạy trước Page_Load và gán property.
public partial class PayoutReport : System.Web.UI.Page
{
    public IPayoutService PayoutService { get; set; }

    protected void Page_Load(object sender, EventArgs e)
    {
        grid.DataSource = PayoutService.GetPending();
        grid.DataBind();
    }
}
```

```csharp [Quét assembly]
// Đăng ký mọi class *Handler trong project Core, mỗi class theo interface của nó
builder.RegisterAssemblyTypes(typeof(ApprovePayoutHandler).Assembly)
       .Where(t => t.Name.EndsWith("Handler"))
       .AsImplementedInterfaces()
       .InstancePerLifetimeScope();   // = scoped
```

```csharp [Decorator]
// Bọc mọi ICommandHandler<T> bằng một lớp log, không sửa từng handler
builder.RegisterGenericDecorator(typeof(LoggingHandler<>), typeof(ICommandHandler<>));
```

:::

Cần tránh khi dùng property injection của Autofac:

- Bật `PropertiesAutowired()` cho dependency **bắt buộc** mà không có `required`: thiếu đăng ký thì im lặng để null.
- Dùng để **giấu constructor quá dài**: 10 dependency vẫn là 10, xem [quá nhiều dependency](#too-many-dependencies).
- Dùng để **lách vòng tròn** A cần B, B cần A: lỗi thiết kế vẫn còn, chỉ chuyển sang lúc chạy.

## 6. Ai gọi container: IoC trong ASP.NET Core {#who-calls}

Trong code của bạn **không có chỗ nào gọi `GetService`**. Khi request vào, framework tạo scope (`HttpContext.RequestServices`), tìm controller, dựng controller kèm toàn bộ dependency, gọi action, rồi dispose scope. Đó là <T>IoC</T>: bạn chỉ khai báo "tôi cần gì" ở constructor.

Controller mặc định **không** nằm trong container: controller activator dùng `ActivatorUtilities` gọi constructor và lấy từng tham số từ `RequestServices`. Vì vậy controller không cần `AddScoped` mà vẫn được inject. Muốn controller thật sự nằm trong container (vd để decorate) thì gọi `AddControllersAsServices()`.

<Compare :labels="['DI: được đưa vào', 'Service locator: tự đi xin']" caption="Cùng dùng container, khác nhau ở chỗ ai chủ động. Service locator đảo ngược lại IoC.">
<template #a>
<svg viewBox="0 0 720 240" role="img" aria-label="Container đưa dependency vào constructor"><g font-size="13" class="mono" text-anchor="middle"><rect class="boxOk" x="40" y="30" width="200" height="44" rx="8"/><text x="140" y="57">Container (scope)</text><rect class="box" x="40" y="150" width="200" height="44" rx="8"/><text x="140" y="177">PayoutsController</text></g><line class="lnOk" x1="140" y1="74" x2="140" y2="146" marker-end="url(#dOk)"/><text x="152" y="116" font-size="12" class="okT">đưa vào lúc tạo</text><g font-size="12"><text x="280" y="52" class="mono">PayoutsController(IPayoutService svc)</text><text x="280" y="90" class="okT">✓ nhìn constructor là biết class cần gì</text><text x="280" y="112" class="okT">✓ thiếu đăng ký → lỗi ngay lúc start (ValidateOnBuild)</text><text x="280" y="134" class="okT">✓ test: new PayoutsController(fake)</text></g></svg>
</template>
<template #b>
<svg viewBox="0 0 720 240" role="img" aria-label="Controller tự xin dependency từ container"><g font-size="13" class="mono" text-anchor="middle"><rect class="boxOk" x="40" y="30" width="200" height="44" rx="8"/><text x="140" y="57">Container (scope)</text><rect class="boxBad" x="40" y="150" width="200" height="44" rx="8"/><text x="140" y="177">PayoutsController</text></g><line class="lnBad" x1="140" y1="146" x2="140" y2="78" marker-end="url(#dBad)"/><text x="152" y="116" font-size="12" class="badT">tự xin khi chạy tới</text><g font-size="12"><text x="280" y="52" class="mono">PayoutsController(IServiceProvider sp)</text><text x="280" y="70" class="mono muted">sp.GetRequiredService&lt;IPayoutService&gt;()</text><text x="280" y="100" class="badT">✗ dependency thật bị giấu trong thân method</text><text x="280" y="122" class="badT">✗ thiếu đăng ký → lỗi lúc chạy tới đúng dòng đó</text><text x="280" y="144" class="badT">✗ test phải dựng cả container</text></g></svg>
</template>
</Compare>

### Service locator là gì, sao không nên dùng {#service-locator}

**Service locator**: class nhận "cái kho" (`IServiceProvider`) rồi tự lấy thứ nó cần khi chạy tới, thay vì khai báo thứ nó cần ở constructor.

```csharp
public class PayoutService(IServiceProvider sp)        // constructor không nói gì về nhu cầu thật
{
    public async Task ApproveAsync(int id)
    {
        var repo  = sp.GetRequiredService<IPayoutRepository>();   // nhu cầu thật nằm rải trong method
        var clock = sp.GetRequiredService<TimeProvider>();
        // ...
    }
}
```

Bốn cái giá, đều do dependency bị giấu khỏi constructor:

1. **Đọc không biết class cần gì**: phải đọc hết thân method.
2. **Lỗi thiếu đăng ký nổ muộn**: `ValidateOnBuild` không thấy nhu cầu nằm trong method, nên lỗi chỉ hiện khi chạy tới đúng dòng đó, có khi là trên production.
3. **Test khó**: không `new PayoutService(fakeRepo, fakeClock)` được, phải dựng cả container giả.
4. **Dễ dính captive**: `sp` trong một singleton là root provider, lấy service scoped từ đó chính là [captive dependency](#captive-rule).

Chấp nhận được khi **chính framework không inject được** hoặc **chỉ biết cần gì lúc chạy**: factory chọn implementation theo key (`GetRequiredKeyedService`), `IServiceScopeFactory` trong `BackgroundService`. Giữ những chỗ này ở tầng hạ tầng, không rải trong nghiệp vụ.


## 7. Nhiều implementation, keyed services, decorator {#multiple-registrations}

Từ luật "list, bản cuối thắng" ở [Đăng ký](#register) có ba cách dùng nhiều implementation:

```csharp
// 1. Lấy tất cả: chạy mọi rule
public class PayoutValidator(IEnumerable<IPayoutRule> rules) { }

// 2. Keyed services (.NET 8): Strategy theo phương thức payout
builder.Services.AddKeyedScoped<IPayoutMethod, BankTransferPayout>("bank");
builder.Services.AddKeyedScoped<IPayoutMethod, PayPalPayout>("paypal");

public class PayoutRunner(IServiceProvider sp)
{
    public Task RunAsync(Payout p) => sp.GetRequiredKeyedService<IPayoutMethod>(p.Method).SendAsync(p);
}

// 3. Decorator không cần thư viện: bọc cache quanh repository bằng factory
builder.Services.AddScoped<MerchantRepository>();
builder.Services.AddScoped<IMerchantRepository>(sp =>
    new CachedMerchantRepository(
        sp.GetRequiredService<MerchantRepository>(),
        sp.GetRequiredService<IMemoryCache>()));
```

Container có sẵn không có API decorator; cách factory ở trên đủ dùng và không thêm package, hoặc dùng thư viện như <T>Scrutor</T>.

## Câu hỏi phỏng vấn {#interview}

### DI container hoạt động thế nào? Tự viết thì sao? <Badge type="warning" text="câu &quot;under the hood&quot;" /> {#container-internals}

::: tip Trả lời nhanh
Bốn bước: **register** công thức vào một list (type, implementation, lifetime) → **build** thành provider và kiểm tra → **resolve** đệ quy: đọc constructor, resolve từng tham số, new từ lá lên gốc, giữ lại object theo lifetime (singleton ở root, scoped ở scope) → **dispose** object nó tạo khi scope kết thúc. Xem [Container hoạt động thế nào](#how-container-works) và [mini container](#mini-container).
:::

::: details Câu trả lời mẫu (English)
At startup we register services into `IServiceCollection`, which is just a list of descriptors: service type, implementation and lifetime. `Build()` turns it into an `IServiceProvider`, and in Development it validates missing registrations and captive dependencies. When a request comes in, the framework creates a scope and asks it for the controller. The container reads the constructor, resolves each parameter recursively, and creates objects from the leaves up. Singletons are cached in the root provider, scoped services in the request scope, and transients are never cached. When the scope ends, it disposes what it created in reverse order. If I wrote one myself, it would be a list of registrations, a cache dictionary per scope, a recursive resolve using reflection on the constructor, cycle detection, and a list of disposables.
:::

::: warning Bẫy & follow-up
**"Vậy container là một dictionary interface → implementation?"**

Chỉ đúng phần đăng ký, và nó là list chứ không phải dictionary: đăng ký trùng thì `T` nhận bản cuối, `IEnumerable<T>` nhận tất cả. Phần quan trọng hơn là resolve đệ quy, cache theo lifetime và dispose. Xem [Đăng ký](#register).

**"Dùng reflection thì có chậm không?"**

Chỉ lần đầu. Sau đó container dùng call site đã biên dịch, gần bằng tự `new`. Xem [Resolve](#resolve).

**"A cần B, B cần A thì sao?"**

Container ném lỗi circular dependency lúc resolve. Sửa thiết kế, tách phần chung ra class thứ ba.
:::

### IoC và DI khác nhau thế nào? {#ioc-vs-di}

::: tip Trả lời nhanh
IoC là nguyên lý: framework gọi code của mình. DI là một cách làm IoC cho việc tạo dependency: class nhận dependency từ ngoài thay vì tự `new`. Container chỉ là công cụ tự động hoá DI. Xem [Bốn khái niệm](#concepts).
:::

::: details Câu trả lời mẫu (English)
Inversion of Control is the general idea that the framework calls my code, for example ASP.NET Core calling a controller action or Web Forms calling `Page_Load`. Dependency Injection is one specific form of IoC applied to object creation: a class receives its dependencies through the constructor instead of creating them. A DI container just automates that wiring, so I can do DI without a container. And DI is different from the Dependency Inversion Principle, which is about depending on abstractions.
:::

::: warning Bẫy & follow-up
**"Ví dụ IoC mà không phải DI?"** Event handler, template method (`BackgroundService.ExecuteAsync` do framework gọi), middleware `InvokeAsync`.

**"Không có container thì có DI không?"** Có, đó là [Pure DI](#pure-di).
:::

### Transient, Scoped, Singleton <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#lifetimes}

::: tip Trả lời nhanh
**Transient**: object mới mỗi lần resolve. **Scoped**: một object cho mỗi scope, trong web là mỗi request. **Singleton**: một object cho cả app, nên phải thread-safe. Chọn theo "object có giữ dữ liệu riêng của request không". Xem [Lifetime](#lifetime-cache).
:::

::: details Câu trả lời mẫu (English)
Lifetime decides how many instances the container creates and where it reuses them. Transient means a new instance every time it is resolved, good for small stateless services like validators. Scoped means one instance per scope, which in ASP.NET Core is one per request, so `DbContext` is scoped and all repositories in a request share the same context and transaction. Singleton is one instance for the whole app, like a cache or `IHttpClientFactory`, so it must be thread-safe and must not hold scoped services.
:::

::: warning Bẫy & follow-up
**"Transient là trả giá trị mới mỗi lần gọi method?"**

Không. Transient là **object mới mỗi lần resolve**, không liên quan gì tới giá trị method trả về.

**"`GlobalExceptionHandler` chỉ chạy trong request, vậy nó là scoped?"**

Không. "Chạy lúc nào" không quyết định lifetime; nó không giữ dữ liệu của request nên singleton. Xem [Lifetime](#lifetime-cache).
:::

### Captive dependency: inject lifetime nào vào lifetime nào được? {#captive-dependency}

::: tip Trả lời nhanh
Service sống lâu không được giữ service sống ngắn hơn. Singleton giữ `DbContext` scoped thì nó bị giam suốt đời app, dùng chung cho mọi request. Singleton cần scoped thì inject `IServiceScopeFactory` và tự `CreateScope()`. Xem [bảng và code](#captive-rule).
:::

::: details Câu trả lời mẫu (English)
A captive dependency is when a longer-lived service holds a shorter-lived one, like a singleton holding a scoped `DbContext`. The `DbContext` then lives for the whole app and is shared across requests, which gives wrong data and is not thread-safe. In Development, scope validation throws at startup, so you catch it early. If a singleton or a `BackgroundService` needs a scoped service, I inject `IServiceScopeFactory`, create a scope for each unit of work and resolve from `scope.ServiceProvider`.
:::

::: warning Bẫy & follow-up
**"Gọi `GetRequiredService` trong singleton là được?"**

Không, nếu gọi trên root provider thì vẫn là resolve scoped từ root. Phải tạo scope trước.

**"Scoped inject transient có sao không?"**

Không sao: transient sống theo scoped đã giữ nó.

**"Singleton cần config mới nhất thì inject `IOptionsSnapshot`?"**

Không, Snapshot là scoped. Dùng `IOptionsMonitor`, xem [Options pattern](/aspnet-core/options-pattern#options-interfaces).
:::

### Container dispose service thế nào? {#disposal}

::: tip Trả lời nhanh
Ai tạo thì người đó dispose: container dispose object nó tạo khi scope chứa object đó kết thúc, ngược thứ tự tạo; singleton khi app tắt. Instance bạn tự `new` rồi đăng ký thì container không dispose. Xem [Dispose](#dispose).
:::

::: warning Bẫy & follow-up
**"Resolve transient `IDisposable` từ root provider thì sao?"**

Root giữ tham chiếu tới lúc app tắt, mỗi lần resolve thêm một object: memory leak. Luôn resolve trong scope.
:::

### Nhiều implementation cho một interface, keyed services, decorator {#multiple-implementations}

::: tip Trả lời nhanh
Inject `T` nhận bản đăng ký **cuối cùng**, `IEnumerable<T>` nhận tất cả. .NET 8 có **keyed services** để chọn theo key. Decorator không có sẵn: tự đăng ký bằng factory hoặc dùng Scrutor. Xem [mục 5](#multiple-registrations).
:::

::: warning Bẫy & follow-up
**"Inject `IServiceProvider` rồi tự `GetService` có ổn không?"**

Đó là service locator, che giấu dependency thật. Chấp nhận ở tầng hạ tầng (factory, chọn theo key lúc runtime), không rải trong business logic.
:::

### Có mấy cách inject? Sao container của Microsoft không có property injection? {#injection-types-q}

::: tip Trả lời nhanh
Ba cách: constructor (mặc định), method (tham số `InvokeAsync`, `[FromServices]`, lambda Minimal API), property. Microsoft bỏ property injection vì object có khoảng thời gian thiếu dependency (null), dependency bị giấu, và container mặc định cố tình tối giản để container khác cắm vào được. Xem [Ba cách đưa dependency vào](#injection-types).
:::

::: details Câu trả lời mẫu (English)
There are three kinds: constructor, method and property injection. Constructor injection is the default because the object is complete the moment it is created, the dependencies are visible in the signature and can be readonly. Method injection is for things the framework calls, like a middleware's `InvokeAsync`, when the object lives longer than the dependency. Microsoft's container leaves out property injection on purpose: a property can be null until someone sets it, it hides required dependencies, and the built-in container is kept minimal so Autofac or others can replace it. I'd use Autofac's property injection only where the framework creates the object for me, like Web Forms pages or attributes, or for optional dependencies with a safe default.
:::

::: warning Bẫy & follow-up
**"Vậy property injection của Autofac dùng cho gì?"**

Object không do container gọi constructor (page Web Forms, attribute) và dependency tuỳ chọn có mặc định. Không dùng để giấu constructor dài hay lách vòng tròn. Xem [Autofac](#autofac).
:::

### Constructor có quá nhiều dependency {#too-many-dependencies}

::: tip Trả lời nhanh
Khoảng 5–6 dependency trở lên thường là dấu hiệu class làm quá nhiều việc (<T>SRP</T>). Theo thứ tự: tách class theo trách nhiệm; dependency chỉ một action dùng thì inject vào tham số action; gom vào một service có nghiệp vụ thật (`PayoutApprovalService`), không phải class "bao tải".
:::

::: warning Bẫy & follow-up
**"Thêm constructor overload cho mỗi action?"**

Vô dụng: container chọn constructor **trước khi** action chạy, không biết request gọi action nào. Xem luật chọn constructor ở [Resolve](#resolve).

**"Dùng property injection hoặc `HttpContext.RequestServices` cho gọn constructor?"**

Container mặc định không có property injection; còn `RequestServices` là service locator. Dependency bị giấu chứ không mất đi.

**"Chuyển sang Minimal API, mỗi handler chỉ inject thứ nó cần?"**

Chỉ giấu triệu chứng. Một feature cần 10 dependency vẫn là thiết kế có vấn đề.
:::

## Hỏi đáp

::: details "Interface cho mọi class có cần không?"
Không. Container đăng ký class cụ thể được (`AddScoped<PayoutCalculator>()`). Tạo interface khi có lý do: ranh giới với hạ tầng (DB, HTTP, clock), cần thay bằng fake khi test, hoặc có nhiều implementation. Interface chỉ có một implementation và không bao giờ bị thay là chi phí không có lợi.
:::

::: details "Web Forms có IoC không? Có DI không?"
Có IoC: ASP.NET tạo page và gọi `Page_Load`, `Button_Click`, bạn không gọi chúng. Nhưng gần như không có DI: page được tạo bằng constructor không tham số, nên code tự `new` service. Từ .NET Framework 4.7.2 có `HttpRuntime.WebObjectActivator` để cắm container vào. Đưa logic về các service được inject trước là bước đệm tốt cho migration: sau này mang sang .NET mới gần như nguyên vẹn.
:::

## Tự kiểm tra

::: details 1. Một câu phân biệt IoC, DI, DIP.
IoC: framework gọi code mình. DI: dependency được đưa vào thay vì tự `new`. DIP: code nghiệp vụ phụ thuộc interface, không phụ thuộc class hạ tầng.
:::

::: details 2. "Container là dictionary interface → implementation + lifetime." Thiếu gì?
Đó mới là phần đăng ký (và là list, không phải dictionary). Thiếu: resolve đệ quy theo constructor, giữ object theo lifetime ở root/scope, dispose khi scope kết thúc, kiểm tra thiếu đăng ký / vòng tròn / captive.
:::

::: details 3. Resolve PayoutsController thì object nào được tạo đầu tiên? Vì sao?
Lá sâu nhất của cây, ở đây là `PayoutDbContext`: muốn new một class thì mọi tham số constructor của nó phải có trước.
:::

::: details 4. Hai request song song có dùng chung PayoutService (scoped) không? ILogger thì sao?
PayoutService: không, mỗi request một scope, mỗi scope một bản. ILogger singleton: có, cả app dùng chung một bản ở root.
:::

::: details 5. Trong mini container, vì sao singleton phải gọi `_root.GetOrCreate` chứ không phải `GetOrCreate` của scope hiện tại?
Nếu cache ở scope thì mỗi request có một bản riêng, thành scoped. Cache ở root mới là một bản cho cả app; và vì nó được tạo ở root, tham số scoped của nó sẽ bị chặn, đúng như captive check.
:::

::: details 6. Inject IServiceProvider vào service rồi gọi GetService có phải DI không?
Không, đó là service locator. Container vẫn dùng nhưng class tự đi xin, dependency bị giấu và lỗi thiếu đăng ký chỉ lộ lúc chạy.
:::
