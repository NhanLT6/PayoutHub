---
title: "OOP & C# cơ bản"
---

# OOP & C# cơ bản

Loại câu "X là gì, khác Y thế nào". Đáp ngắn, đúng, rồi chuyển sang ví dụ. Ở đây ưu tiên những chỗ người ta hay trả lời sai.

## 4 tính chất của OOP {#oop}

::: tip Trả lời nhanh
- **Encapsulation**: giấu trạng thái bên trong, chỉ cho thay đổi qua method có kiểm soát, để object luôn ở trạng thái hợp lệ.
- **Abstraction**: chỉ lộ ra cái người dùng cần biết, giấu cách làm.
- **Inheritance**: class con kế thừa hành vi và dữ liệu của class cha (quan hệ "is-a").
- **Polymorphism**: cùng một lời gọi, hành vi khác nhau tùy kiểu thật của object.
:::

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="oA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="oBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker><marker id="oMut" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path style="fill:var(--vp-c-text-3)" d="M0 0L10 5L0 10z"/></marker></defs></svg>

<div class="fig">
<svg viewBox="0 0 720 592" role="img" aria-label="Bốn tính chất OOP trên ví dụ Payout: hộp kín có nút bấm, một mặt interface che máy phía sau, khuôn cha truyền xuống con, một lời gọi rẽ theo object thật">
<!-- 1. Encapsulation -->
<rect class="box" x="6" y="6" width="348" height="284" rx="10"/>
<text x="20" y="30" font-size="14" font-weight="700">Encapsulation</text>
<rect class="boxOk" x="150" y="48" width="190" height="176" rx="18" style="stroke-width:4"/>
<text x="268" y="70" font-size="12" font-weight="600" text-anchor="middle" class="okT">Payout</text>
<line class="lnAcc" x1="186" y1="100" x2="230" y2="113"/>
<line class="lnAcc" x1="186" y1="136" x2="230" y2="119"/>
<rect class="boxAcc" x="104" y="88" width="82" height="24" rx="12"/>
<text x="145" y="104" font-size="10.5" text-anchor="middle" class="mono">Approve()</text>
<rect class="boxAcc" x="104" y="124" width="82" height="24" rx="12"/>
<text x="145" y="140" font-size="10.5" text-anchor="middle" class="mono">MarkPaid()</text>
<path class="boxAcc" d="M246 100 L262 116 L246 132 L230 116 Z"/>
<text x="246" y="120" font-size="10" text-anchor="middle" font-weight="700" class="accT">?</text>
<text x="270" y="120" font-size="10" class="muted">kiểm luật</text>
<line class="lnAcc" x1="246" y1="132" x2="246" y2="162" marker-end="url(#oA)"/>
<rect class="box" x="160" y="166" width="50" height="20" rx="10"/>
<text x="185" y="180" font-size="9.5" text-anchor="middle">Pending</text>
<rect class="boxAcc" x="218" y="166" width="56" height="20" rx="10"/>
<text x="246" y="180" font-size="9.5" text-anchor="middle" font-weight="600" class="accT">Approved</text>
<rect class="box" x="282" y="166" width="46" height="20" rx="10"/>
<text x="305" y="180" font-size="9.5" text-anchor="middle">Paid</text>
<text x="245" y="208" font-size="9.5" text-anchor="middle" class="muted">trạng thái bên trong</text>
<text x="22" y="182" font-size="10.5" class="mono badT">p.Status = Paid</text>
<line class="lnBad" x1="22" y1="194" x2="138" y2="194" marker-end="url(#oBad)"/>
<line class="lnBad" x1="140" y1="186" x2="156" y2="202" style="stroke-width:3"/>
<line class="lnBad" x1="156" y1="186" x2="140" y2="202" style="stroke-width:3"/>
<text x="22" y="214" font-size="9.5" class="muted">lỗi compile: private set</text>
<line class="lnMuted" x1="20" y1="242" x2="340" y2="242"/>
<text x="180" y="266" font-size="11.5" text-anchor="middle">Chỉ đổi Status qua method; method kiểm luật trước.</text>

<!-- 2. Abstraction -->
<rect class="box" x="366" y="6" width="348" height="284" rx="10"/>
<text x="380" y="30" font-size="14" font-weight="700">Abstraction</text>
<rect class="box" x="380" y="110" width="100" height="36" rx="6"/>
<text x="430" y="132" font-size="10.5" text-anchor="middle">PayoutProcessor</text>
<text x="430" y="164" font-size="9.5" text-anchor="middle" class="muted">chỉ thấy một mặt</text>
<line class="lnAcc" x1="480" y1="128" x2="566" y2="128" marker-end="url(#oA)"/>
<text x="523" y="119" font-size="10" text-anchor="middle" class="mono accT">SendAsync()</text>
<text x="577" y="46" font-size="10" text-anchor="middle" class="mono accT">IPayoutGateway</text>
<g opacity="0.6">
<rect class="box dash" x="592" y="56" width="110" height="168" rx="6"/>
<text x="647" y="76" font-size="9.5" text-anchor="middle" class="muted">phía sau, bị che</text>
<circle cx="610" cy="100" r="6" fill="none" style="stroke:var(--vp-c-text-2);stroke-width:4;stroke-dasharray:2.4 2"/>
<text x="624" y="104" font-size="10" class="muted">HTTP</text>
<circle cx="610" cy="128" r="6" fill="none" style="stroke:var(--vp-c-text-2);stroke-width:4;stroke-dasharray:2.4 2"/>
<text x="624" y="132" font-size="10" class="muted">ký HMAC</text>
<circle cx="610" cy="156" r="6" fill="none" style="stroke:var(--vp-c-text-2);stroke-width:4;stroke-dasharray:2.4 2"/>
<text x="624" y="160" font-size="10" class="muted">retry</text>
<circle cx="610" cy="184" r="6" fill="none" style="stroke:var(--vp-c-text-2);stroke-width:4;stroke-dasharray:2.4 2"/>
<text x="624" y="188" font-size="10" class="muted">mã lỗi bank</text>
</g>
<rect class="boxAcc" x="570" y="52" width="14" height="176" rx="3"/>
<circle class="boxAcc" cx="577" cy="128" r="5" style="fill:var(--vp-c-brand-1)"/>
<line class="lnMuted" x1="380" y1="242" x2="700" y2="242"/>
<text x="540" y="266" font-size="11.5" text-anchor="middle">Chỉ lộ một mặt interface; cách làm phía sau bị che.</text>

<!-- 3. Inheritance -->
<rect class="box" x="6" y="302" width="348" height="284" rx="10"/>
<text x="20" y="326" font-size="14" font-weight="700">Inheritance</text>
<rect class="box" x="100" y="338" width="160" height="54" rx="6" style="stroke:var(--vp-c-text-2)"/>
<text x="180" y="355" font-size="11" text-anchor="middle" font-weight="600">Payout</text>
<rect class="box" x="108" y="364" width="40" height="18" rx="3"/>
<text x="128" y="377" font-size="9" text-anchor="middle">Amount</text>
<rect class="box" x="152" y="364" width="38" height="18" rx="3"/>
<text x="171" y="377" font-size="9" text-anchor="middle">Status</text>
<rect class="box" x="194" y="364" width="60" height="18" rx="3"/>
<text x="224" y="377" font-size="9" text-anchor="middle" class="mono">Approve()</text>
<path class="box" d="M180 393 L188 405 L172 405 Z" style="stroke:var(--vp-c-text-1)"/>
<polyline class="ln" points="180,405 180,424"/>
<polyline class="ln" points="100,446 100,424 260,424 260,446"/>
<text x="188" y="418" font-size="9.5" class="muted">is-a</text>
<rect class="box" x="30" y="446" width="140" height="54" rx="6"/>
<text x="100" y="463" font-size="11" text-anchor="middle" font-weight="600">BankPayout</text>
<rect class="box" x="40" y="472" width="14" height="18" rx="3"/>
<rect class="box" x="58" y="472" width="14" height="18" rx="3"/>
<rect class="box" x="76" y="472" width="14" height="18" rx="3"/>
<rect class="boxAcc" x="96" y="472" width="64" height="18" rx="3"/>
<text x="128" y="485" font-size="9" text-anchor="middle" class="accT">AccountNo</text>
<rect class="box" x="190" y="446" width="140" height="54" rx="6"/>
<text x="260" y="463" font-size="11" text-anchor="middle" font-weight="600">PayPalPayout</text>
<rect class="box" x="200" y="472" width="14" height="18" rx="3"/>
<rect class="box" x="218" y="472" width="14" height="18" rx="3"/>
<rect class="box" x="236" y="472" width="14" height="18" rx="3"/>
<rect class="boxAcc" x="256" y="472" width="64" height="18" rx="3"/>
<text x="288" y="485" font-size="9" text-anchor="middle" class="accT">Email</text>
<rect class="box" x="74" y="512" width="12" height="12" rx="2"/>
<text x="90" y="522" font-size="9.5" class="muted">có sẵn từ cha</text>
<rect class="boxAcc" x="186" y="512" width="12" height="12" rx="2"/>
<text x="202" y="522" font-size="9.5" class="muted">con tự thêm</text>
<line class="lnMuted" x1="20" y1="538" x2="340" y2="538"/>
<text x="180" y="562" font-size="11.5" text-anchor="middle">Con có sẵn phần chung của cha, chỉ thêm phần riêng.</text>

<!-- 4. Polymorphism -->
<rect class="box" x="366" y="302" width="348" height="284" rx="10"/>
<text x="380" y="326" font-size="14" font-weight="700">Polymorphism</text>
<rect class="boxAcc" x="470" y="346" width="140" height="28" rx="6"/>
<text x="540" y="364" font-size="10.5" text-anchor="middle" class="mono">gateway.SendAsync(p)</text>
<line class="lnAcc" x1="540" y1="374" x2="540" y2="406"/>
<text x="550" y="400" font-size="9.5" class="muted">object thật là gì?</text>
<line class="lnAcc" x1="540" y1="406" x2="432" y2="462" marker-end="url(#oA)"/>
<line class="lnMuted dash" x1="540" y1="406" x2="540" y2="462" marker-end="url(#oMut)"/>
<line class="lnMuted dash" x1="540" y1="406" x2="648" y2="462" marker-end="url(#oMut)"/>
<rect class="boxAcc" x="378" y="466" width="100" height="48" rx="6"/>
<text x="428" y="486" font-size="11" text-anchor="middle" font-weight="600" class="accT">BankTransfer</text>
<text x="428" y="503" font-size="9.5" text-anchor="middle">ký HMAC, gọi bank</text>
<rect class="box" x="490" y="466" width="100" height="48" rx="6"/>
<text x="540" y="486" font-size="11" text-anchor="middle" font-weight="600">PayPal</text>
<text x="540" y="503" font-size="9.5" text-anchor="middle" class="muted">gọi PayPal API</text>
<rect class="box" x="602" y="466" width="100" height="48" rx="6"/>
<text x="652" y="486" font-size="11" text-anchor="middle" font-weight="600">Fake (test)</text>
<text x="652" y="503" font-size="9.5" text-anchor="middle" class="muted">trả kết quả giả</text>
<line class="lnMuted" x1="380" y1="538" x2="700" y2="538"/>
<text x="540" y="562" font-size="11.5" text-anchor="middle">Một lời gọi; code chạy theo object thật lúc runtime.</text>
</svg>
<p class="fig-caption">Bốn ô, cùng ví dụ Payout. Nhìn từng ô, tự nói lại cơ chế trước khi đọc chữ bên dưới.</p>
</div>


::: info Bản chất
Encapsulation và abstraction hay bị nói lẫn. Encapsulation là _bảo vệ dữ liệu và <T>invariant</T>_; abstraction là _giấu độ phức tạp_. Polymorphism có 2 loại: compile-time (overloading) và runtime (`virtual`/`override`, gọi qua <T k="vtable">bảng virtual method</T>).
:::

### Ví dụ thật: một luồng trả tiền có đủ bốn tính chất {#oop-example}

Luồng: finance duyệt payout, rồi hệ thống chuyển tiền cho affiliate qua ngân hàng hoặc PayPal. Mỗi file dưới đây ứng với một ô trong hình:

- `Payout.cs`: **encapsulation** (`Status` chỉ đổi qua `Approve()`, `MarkPaid()`) và lớp cha cho **inheritance**.
- `BankPayout.cs`, `PayPalPayout.cs`: **inheritance**, lớp con có sẵn luật duyệt của cha, chỉ thêm nơi nhận tiền.
- `IPayoutGateway.cs`: **abstraction**, processor chỉ biết "gửi tiền", không biết HTTP, ký request, mã lỗi ngân hàng.
- `PayoutProcessor.cs`: **polymorphism**, một dòng `gateway.SendAsync(payout)` chạy code của ngân hàng hay PayPal tuỳ object thật lúc runtime.

::: code-group

```csharp [Payout.cs]
namespace PayoutHub.Core.Domain;

public enum PayoutStatus { Pending, Approved, Paid }

// Lớp cha trừu tượng: không có "payout chung chung", chỉ có payout qua bank hoặc PayPal
public abstract class Payout
{
    public int Id { get; private set; }
    public decimal Amount { get; private set; }
    public PayoutStatus Status { get; private set; } = PayoutStatus.Pending; // ENCAPSULATION
    public string? Reference { get; private set; }

    protected Payout(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentOutOfRangeException(nameof(amount));

        Amount = amount;
    }

    public void Approve()
    {
        EnsureStatus(PayoutStatus.Pending);
        Status = PayoutStatus.Approved;
    }

    public void MarkPaid(string reference)
    {
        EnsureStatus(PayoutStatus.Approved); // chưa duyệt thì không thể "đã trả"
        Status = PayoutStatus.Paid;
        Reference = reference;
    }

    private void EnsureStatus(PayoutStatus expected)
    {
        if (Status != expected)
            throw new InvalidOperationException($"Payout is {Status}, expected {expected}.");
    }
}
```

```csharp [BankPayout.cs]
namespace PayoutHub.Core.Domain;

// INHERITANCE: có sẵn Amount, Status, Approve(), MarkPaid() của Payout
public class BankPayout(decimal amount, string accountNo) : Payout(amount)
{
    public string AccountNo { get; } = accountNo; // chỉ thêm phần riêng
}
```

```csharp [PayPalPayout.cs]
namespace PayoutHub.Core.Domain;

public class PayPalPayout(decimal amount, string email) : Payout(amount)
{
    public string Email { get; } = email;
}
```

```csharp [IPayoutGateway.cs]
using PayoutHub.Core.Domain;

namespace PayoutHub.Core.Payments;

public record TransferResult(string Reference);

// ABSTRACTION: chỉ lộ "có gửi được payout này không" và "gửi đi"
public interface IPayoutGateway
{
    bool CanHandle(Payout payout);

    Task<TransferResult> SendAsync(Payout payout, CancellationToken ct);
}
```

```csharp [BankTransferGateway.cs]
using System.Net.Http.Json;
using PayoutHub.Core.Domain;
using PayoutHub.Core.Payments;

namespace PayoutHub.Infrastructure.Payments;

public class BankTransferGateway(HttpClient http) : IPayoutGateway
{
    public bool CanHandle(Payout payout) => payout is BankPayout;

    public async Task<TransferResult> SendAsync(Payout payout, CancellationToken ct)
    {
        var bank = (BankPayout)payout;

        // phần bị che sau interface: format request, ký, gọi API, dịch mã lỗi của ngân hàng
        var response = await http.PostAsJsonAsync("transfers", new { bank.AccountNo, bank.Amount }, ct);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<BankResponse>(ct);
        return new TransferResult(body!.TransactionId);
    }

    private record BankResponse(string TransactionId);
}
```

```csharp [PayPalGateway.cs]
using PayoutHub.Core.Domain;
using PayoutHub.Core.Payments;

namespace PayoutHub.Infrastructure.Payments;

public class PayPalGateway(HttpClient http) : IPayoutGateway
{
    public bool CanHandle(Payout payout) => payout is PayPalPayout;

    public async Task<TransferResult> SendAsync(Payout payout, CancellationToken ct)
    {
        var paypal = (PayPalPayout)payout;

        // cách gọi khác hẳn ngân hàng: OAuth token, API payouts của PayPal...
        await Task.Delay(10, ct);
        return new TransferResult($"PP-{paypal.Email}-{Guid.NewGuid():N}");
    }
}
```

```csharp [PayoutProcessor.cs]
using PayoutHub.Core.Domain;
using PayoutHub.Core.Payments;

namespace PayoutHub.Api.Payouts;

public class PayoutProcessor(IEnumerable<IPayoutGateway> gateways, IPayoutRepository repo)
{
    public async Task PayAsync(int payoutId, CancellationToken ct)
    {
        Payout payout = await repo.GetAsync(payoutId, ct); // object thật: BankPayout hoặc PayPalPayout

        IPayoutGateway gateway = gateways.First(g => g.CanHandle(payout));

        // POLYMORPHISM: cùng một dòng, chạy SendAsync của BankTransferGateway hay PayPalGateway
        // tuỳ object thật lúc runtime. Processor không có if/else theo loại.
        TransferResult result = await gateway.SendAsync(payout, ct);

        payout.MarkPaid(result.Reference); // ENCAPSULATION: không tự gán Status
        await repo.SaveAsync(payout, ct);
    }
}
```

```csharp [Program.cs]
builder.Services.AddHttpClient<BankTransferGateway>();
builder.Services.AddHttpClient<PayPalGateway>();
builder.Services.AddTransient<IPayoutGateway>(sp => sp.GetRequiredService<BankTransferGateway>());
builder.Services.AddTransient<IPayoutGateway>(sp => sp.GetRequiredService<PayPalGateway>());
builder.Services.AddScoped<PayoutProcessor>();
```

:::

**Polymorphism đáng giá ở đâu:** thiếu nó thì `PayoutProcessor` phải viết `if (payout is BankPayout) {...} else if (payout is PayPalPayout) {...}`, và thêm Wise là sửa processor cùng mọi chỗ có if/else đó. Có nó thì thêm Wise là thêm một class `WiseGateway` và một dòng đăng ký; processor không đổi (đây chính là [Open/Closed](#solid)). Đó là **runtime polymorphism**: lời gọi qua interface hoặc method `virtual` được quyết định lúc chạy theo kiểu thật của object. **Compile-time polymorphism** là overloading: `Log(string)` và `Log(Exception)` cùng tên, compiler chọn theo kiểu tham số.

**Câu để nói khi phỏng vấn:** "Encapsulation protects the inside: Payout only changes status through Approve and MarkPaid. Abstraction simplifies the outside: the processor only sees IPayoutGateway. Inheritance shares the approval rules between BankPayout and PayPalPayout. Polymorphism means one call, gateway.SendAsync, runs the bank or the PayPal code depending on the real object, so adding a new provider doesn't touch the processor."

**Phản ví dụ hay gặp ở Web Forms:** nút "Pay" trong code-behind vừa gọi thẳng API ngân hàng, vừa chạy `UPDATE Payouts SET Status = 'Paid'`, vừa `if` theo loại payout. Thiếu cả bốn: luật trạng thái rải khắp các page, page biết chi tiết ngân hàng, và thêm một nhà cung cấp là sửa mọi page.

Dùng EF Core vẫn giữ được encapsulation: private setter, private constructor, backing field. Xem [Entity giàu hành vi với EF Core](/data/ef-core#rich-entity).

::: warning Bẫy & follow-up
**"Composition over inheritance nghĩa là gì?"**

Inheritance tạo <T>coupling</T> chặt: đổi class cha là ảnh hưởng mọi class con, và C# chỉ cho kế thừa một class. Chỉ dùng khi thật sự là "is-a" và cần chia sẻ hành vi. Còn lại thì ghép các object nhỏ qua interface và <T>DI</T>.
:::

## Abstract class vs interface {#abstract-vs-interface}

::: tip Trả lời nhanh
Interface là hợp đồng "làm được gì", một class implement được nhiều interface. Abstract class là class cha dở dang, có thể chứa state, constructor và code dùng chung, nhưng chỉ kế thừa được một.
:::

::: info Bản chất
|  | Interface | Abstract class |
|---|---|---|
| Instance field / state | Không | Có |
| Constructor | Không | Có |
| Số lượng kế thừa | Nhiều | Một |
| Code có sẵn | Default method (C# 8+), static abstract (C# 11) | Có |
| Access modifier member | Mặc định public | Tùy ý |
:::

::: details Ở dự án thật
Interface: `IPaymentGateway` để đổi provider và <T>mock</T> khi test. Abstract class: `ReportBase` giữ luồng chung (lấy data, build header, xuất file) và để class con chỉ override phần tính toán riêng, chính là <T>Template Method</T>.
:::

::: warning Bẫy & follow-up
**"Interface có default method rồi thì khác gì abstract class?"**

Vẫn không có instance state và constructor. Default method sinh ra chủ yếu để thêm member vào interface đã public mà không làm vỡ các class đang implement, không phải để thay abstract class.
:::

## Overriding vs overloading vs `new` (method hiding) {#override-overload-new}

::: tip Trả lời nhanh
**Overloading**: cùng tên, khác tham số, chọn lúc compile. **Overriding**: class con viết lại method `virtual` của cha, chọn lúc runtime theo kiểu thật. **new**: class con che method của cha, chọn theo kiểu của biến khai báo.
:::

::: info Bản chất
```csharp
class Base    { public virtual string A() => "Base.A";   public string B() => "Base.B"; }
class Derived : Base
              { public override string A() => "Derived.A"; public new string B() => "Derived.B"; }

Base x = new Derived();
x.A();   // "Derived.A": override đi theo kiểu runtime
x.B();   // "Base.B":    new đi theo kiểu khai báo của biến
```

**`new` làm gì:** khai báo một method mới trùng tên chứ không thay thế method của cha, nên object có cả `Base.B` lẫn `Derived.B`. `override` ghi đè ô của method cha trong <T>vtable</T> nên được chọn lúc runtime theo object thật; method `new` được compiler chọn lúc compile theo kiểu biến. Vì vậy `((Base)d).B()` ra "Base.B" dù cùng một object. Chỉ nên dùng khi class cha (thường từ thư viện) thêm method trùng tên với method bạn đã có.
:::

::: warning Bẫy & follow-up
**Đây là câu "cho đoạn code, đoán output" rất hay gặp.**

Nhớ quy tắc: `override` theo object thật, `new` theo kiểu biến. Quên ghi `override` thì compiler cảnh báo và mặc định coi như `new`.

**"`sealed` dùng làm gì?"**

Chặn kế thừa (class) hoặc chặn override tiếp (method). <T>JIT</T> có thể tối ưu gọi method trên class sealed. Nhiều team để mặc định sealed cho class không thiết kế để kế thừa.
:::

## `const` vs `readonly` vs `static readonly` {#const-readonly}

::: tip Trả lời nhanh
`const` là hằng lúc compile, chỉ cho kiểu primitive và string. `readonly` gán được trong constructor, mỗi instance một giá trị. `static readonly` gán một lần cho cả type, lúc runtime, dùng được với mọi kiểu.
:::

::: info Bản chất: gán lúc nào
| Loại | Gán lúc nào | Số lần |
|---|---|---|
| `const` | Không gán lúc chạy: compiler chép giá trị vào chỗ dùng | 0 |
| `static` / `static readonly` | Ngay trước lần đầu dùng tới type (tạo instance hoặc truy cập static member): chạy static initializer rồi static constructor | 1 lần mỗi process |
| `readonly` | Mỗi lần `new` object, trong initializer hoặc constructor | 1 lần mỗi object |

Static dùng chung cho mọi request của mọi user trên process. Web Forms recycle <T>app pool</T> thì static khởi tạo lại; nhiều server thì mỗi server một bản.
:::

::: warning Bẫy & follow-up
**"Đổi `const` trong một library thì sao?"**

Giá trị const được copy thẳng vào <T>assembly</T> gọi nó lúc compile. Assembly khác không build lại vẫn dùng giá trị cũ. Giá trị có thể đổi theo version thì dùng `static readonly`.

**"`readonly List<int>` có thêm phần tử được không?"**

Được. `readonly` chỉ khóa tham chiếu, không khóa object. Muốn bất biến thật thì dùng `IReadOnlyList` hoặc immutable collection.

**"Static constructor ném exception thì sao?"**

`TypeInitializationException`, và <T>CLR</T> không thử lại: type hỏng tới khi process khởi động lại. Đừng gọi DB, file hay API trong static constructor.
:::

## `struct` vs `class` vs `record` {#struct-class-record}

::: tip Trả lời nhanh
`struct` là <T>value type</T>: gán là copy, không kế thừa, hợp với dữ liệu nhỏ và bất biến (tọa độ, tiền tệ). `class` là <T>reference type</T>: gán là copy tham chiếu. `record` (C# 9) là class có so sánh theo giá trị, có `with` để tạo bản sao, hợp với <T>DTO</T> và <T>value object</T>. `record struct` (C# 10) là bản value type của nó.
:::

::: info Bản chất
```csharp
public record Money(decimal Amount, string Currency);

var a = new Money(100, "AUD");
var b = new Money(100, "AUD");
a == b;                         // true: so sánh theo giá trị
var c = a with { Amount = 120 }; // bản sao mới, a không đổi
```
:::

::: warning Bẫy & follow-up
**"Struct mutable có vấn đề gì?"**

Vì mỗi lần lấy ra là một bản copy: `list[0].X = 5` không compile với `List<Point>`, còn sửa qua biến tạm thì chỉ sửa bản copy. Quy tắc: struct nên `readonly struct`.

**"Khi nào nên dùng struct?"**

Nhỏ (khoảng 16 byte trở xuống), bất biến, tạo rất nhiều, và không bị <T>boxing</T> thường xuyên. Không chắc thì dùng class hoặc record.

**"`Tuple` và `ValueTuple` khác nhau thế nào?"**

`System.Tuple` là class cũ, phần tử chỉ có tên `Item1`, `Item2`. `ValueTuple` `(int Id, string Name)` là struct, đặt tên được, nhưng tên chỉ tồn tại lúc compile và mất khi serialize. Dùng tuple cho giá trị trả về nội bộ; ở API public thì dùng record.
:::

## String immutable nghĩa là gì? `==` vs `Equals` vs `ReferenceEquals` {#string-equality}

::: tip Trả lời nhanh
String không bao giờ bị sửa tại chỗ; mọi phép "sửa" đều tạo string mới. Nhờ vậy nó an toàn khi dùng chung giữa các thread và làm key cho Dictionary. Ghép string trong vòng lặp là <T k="big-o">O(n²)</T> bộ nhớ, nên dùng `StringBuilder` hoặc `string.Join`.

`ReferenceEquals` luôn so tham chiếu. `==` và `Equals` mặc định cũng so tham chiếu với class, nhưng string, record và các kiểu tự override sẽ so nội dung.
:::

::: warning Bẫy & follow-up
**"Tại sao string là reference type chứ không phải value type như `int`?"**

Độ dài thay đổi nên không thể có kích thước cố định như value type, và copy toàn bộ nội dung mỗi lần gán thì quá đắt. Immutable cộng với overload `==` giúp nó dùng giống value type mà vẫn chỉ copy địa chỉ.

**"String là reference type mà sao `==` lại so nội dung?"**

Vì class `string` overload operator `==`.

**"Override `Equals` cần làm gì thêm?"**

Override cả `GetHashCode`: hai object bằng nhau phải có hash bằng nhau. Nếu hash dựa vào field có thể sửa, object sẽ "biến mất" khỏi Dictionary/HashSet sau khi sửa.
:::

## `ref` vs `out` vs `in` {#ref-out-in}

::: tip Trả lời nhanh
Cả ba đều truyền theo tham chiếu. `ref`: phải gán trước khi truyền, method được đọc và sửa. `out`: không cần gán trước, method bắt buộc gán (như `int.TryParse`). `in`: chỉ đọc, dùng để truyền struct lớn mà không copy.
:::

::: warning Bẫy & follow-up
**"Truyền object (class) vào method rồi sửa property, bên ngoài có thấy không?"**

Có, vì cả hai cùng trỏ tới một object. Nhưng gán `param = new Order()` thì bên ngoài không đổi, trừ khi dùng `ref`. Reference type được truyền bằng cách copy tham chiếu, không phải "truyền theo tham chiếu".

**"Async method có dùng `ref`/`out` được không?"**

Không. Trả về tuple hoặc object kết quả thay vào đó.
:::

## SOLID <Badge type="warning" text="hay bị hỏi sâu" /> {#solid}

::: tip Trả lời nhanh
5 nguyên tắc để code dễ thay đổi và dễ test: **S**ingle Responsibility, **O**pen/Closed, **L**iskov Substitution, **I**nterface Segregation, **D**ependency Inversion. Đây là heuristic, không phải luật; áp quá tay thì sinh ra interface và tầng lớp thừa.

Interviewer hiếm khi dừng ở định nghĩa. Họ thường đào theo 3 hướng: _cho ví dụ thật của từng nguyên tắc_, _đọc đoạn code này và chỉ ra vi phạm_, _khi nào không nên áp dụng_. Các block dưới đây chuẩn bị cho cả ba, dùng chung một domain là luồng payout cho affiliate.
:::

::: info S · Single Responsibility
**Định nghĩa chính xác:** một class chỉ nên có _một lý do để thay đổi_, tức là chỉ phục vụ một bên hay yêu cầu sửa nó. Ví dụ: chỉ Finance (rule phí), hoặc chỉ Ops (layout báo cáo), không phải cả hai.

Số method không phải thước đo. `Payout` có `Approve`, `Reject`, `MarkPaid`, `Cancel` vẫn đúng <T>SRP</T>, vì tất cả đều là luật trạng thái payout. Ngược lại, một class chỉ có mỗi `Run()` nhưng vừa tính phí, vừa dựng HTML, vừa gửi email thì sai. Tự kiểm tra: mô tả class trong một câu mà phải nối nhiều việc không liên quan bằng chữ "và" là dấu hiệu nên tách.

**Dấu hiệu vi phạm:** class tên `...Manager`/`...Helper` dài hàng nghìn dòng; một file bị sửa bởi các ticket từ nhiều phòng ban khác nhau; không <T>unit test</T> được vì logic dính DB, <T>SMTP</T>.

```csharp
// Trước: Finance, Ops và Marketing đều phải sửa chung class này
public class MonthlyStatementJob
{
    public void Run(int month)
    {
        var rows = _db.Query<Txn>("SELECT ... WHERE Month = @month", new { month });  // data
        foreach (var g in rows.GroupBy(r => r.MerchantId))
        {
            var fee  = g.Sum(r => r.Amount) * (g.First().Tier == "Gold" ? 0.08m : 0.10m); // rule của Finance
            var html = $"<h1>Statement {month}</h1>...";                             // layout của Ops
            _smtp.Send(g.First().Email, "Your monthly statement", html);                // nội dung của Marketing
        }
    }
}

// Sau: mỗi class một lý do để đổi, job chỉ điều phối
public class CommissionCalculator { public decimal Calculate(IEnumerable<Txn> txns, Tier tier) { ... } }
public class StatementRenderer    { public string Render(Statement s) { ... } }
public interface INotifier        { Task SendAsync(string to, string subject, string body); }

public class MonthlyStatementJob(ITxnRepository txns, CommissionCalculator calc,
                                 StatementRenderer renderer, INotifier notifier) { ... }
```

**Lợi ích nói được bằng nghiệp vụ:** Finance đổi tỷ lệ phí thì chỉ sửa và test `CommissionCalculator`, không cần DB hay SMTP, và không có rủi ro làm hỏng email.

**Quá tay khi:** chẻ một class 50 dòng thành 5 file, mỗi file một method. Nếu các phần luôn đổi cùng nhau thì để chung.
:::

::: info O · Open/Closed
**Định nghĩa:** thêm hành vi bằng cách viết code mới, không phải sửa code đang chạy ổn. "Đóng" với sửa đổi, "mở" để mở rộng.

**Tình huống:** hệ thống đang trả tiền cho affiliate qua Bank và PayPal. Business báo sprint sau thêm Wise.

**Trước:** hiểu biết về từng phương thức bị rải ra: mỗi việc một file, và trong mỗi file lại có một `switch` theo phương thức.

```csharp
// FeeCalculator.cs
public decimal Fee(Payout p) => p.Method switch
{
    "Bank"   => 1.5m,
    "PayPal" => p.Amount * 0.02m,
    _        => throw new NotSupportedException(p.Method)
};

// PayoutValidator.cs
public void Validate(Payout p)
{
    switch (p.Method)
    {
        case "Bank":   if (string.IsNullOrEmpty(p.Bsb)) throw new ValidationException("BSB required"); break;
        case "PayPal": if (!p.PayPalEmail.Contains('@')) throw new ValidationException("Invalid email"); break;
    }
}

// PayoutSender.cs
public Task<TransferResult> SendAsync(Payout p) => p.Method switch
{
    "Bank"   => _bankApi.TransferAsync(p.Bsb, p.AccountNo, p.Amount),
    "PayPal" => _payPalApi.PayoutAsync(p.PayPalEmail, p.Amount),
    _        => throw new NotSupportedException(p.Method)
};
```

Thêm Wise nghĩa là phải sửa cả 3 file. Quên một chỗ thì không có lỗi compile; nó nổ lúc chạy, ví dụ payout đã tính phí và validate xong, tới bước gửi tiền mới ném `NotSupportedException`. Mỗi lần mở 3 file này ra sửa cũng là một lần có nguy cơ làm hỏng luồng Bank và PayPal đang chạy tốt.

**Sau:** gom mọi thứ về _một_ phương thức vào _một_ class. Interface đóng vai trò bản checklist mà phương thức nào cũng phải trả lời đủ.

```csharp
// 1. Hợp đồng chung
public interface IPayoutMethod
{
    string Code { get; }        // "Bank", "PayPal": khớp với giá trị lưu trong DB
    decimal Fee(Payout p);
    void Validate(Payout p);
    Task<TransferResult> SendAsync(Payout p, CancellationToken ct);
}

// 2. Mỗi phương thức một class: mọi hiểu biết về Bank nằm ở đây
public class BankTransferMethod(IBankApi bank) : IPayoutMethod
{
    public string Code => "Bank";
    public decimal Fee(Payout p) => 1.5m;
    public void Validate(Payout p)
    {
        if (string.IsNullOrEmpty(p.Bsb)) throw new ValidationException("BSB required");
    }
    public Task<TransferResult> SendAsync(Payout p, CancellationToken ct) =>
        bank.TransferAsync(p.Bsb, p.AccountNo, p.Amount, ct);
}
public class PayPalMethod(IPayPalApi payPal) : IPayoutMethod { public string Code => "PayPal"; /* ... */ }

// 3. Tra cứu: đổi chuỗi "Bank" lấy từ DB thành đúng object xử lý
public class PayoutMethods(IEnumerable<IPayoutMethod> all)   // DI đưa vào TẤT CẢ implementation đã đăng ký
{
    private readonly Dictionary<string, IPayoutMethod> _byCode = all.ToDictionary(m => m.Code);

    public IPayoutMethod For(Payout p) =>
        _byCode.TryGetValue(p.Method, out var m) ? m : throw new NotSupportedException(p.Method);
}

// 4. Nơi dùng: không còn if/switch nào theo phương thức
public class PayoutProcessor(PayoutMethods methods, IPayoutRepository repo)
{
    public async Task PayAsync(int payoutId, CancellationToken ct)
    {
        var payout = await repo.GetAsync(payoutId, ct);
        var method = methods.For(payout);              // Bank hay PayPal, không cần biết
        method.Validate(payout);
        payout.SetFee(method.Fee(payout));
        var result = await method.SendAsync(payout, ct);
        payout.MarkPaid(result.Reference);
        await repo.SaveAsync(payout, ct);
    }
}

// 5. Đăng ký trong Program.cs
builder.Services.AddScoped<IPayoutMethod, BankTransferMethod>();
builder.Services.AddScoped<IPayoutMethod, PayPalMethod>();
builder.Services.AddScoped<PayoutMethods>();
```

**Sprint sau thêm Wise thì phải làm gì:**

|  | Trước | Sau |
|---|---|---|
| File cũ phải sửa | `FeeCalculator`, `PayoutValidator`, `PayoutSender`, và mọi chỗ khác có switch | Không file nào |
| File thêm mới | Không | `WiseMethod.cs` |
| Chỗ khác | Không | Thêm 1 dòng `AddScoped` |
| Quên một phần | Nổ lúc chạy, giữa luồng trả tiền | Lỗi compile: class chưa implement đủ interface |
| Phải test lại | Cả Bank lẫn PayPal | Chỉ `WiseMethod` |

"Đóng" là `PayoutProcessor`, `PayoutMethods`, `BankTransferMethod` và `PayPalMethod` không bị đụng tới. "Mở" là hệ thống vẫn nhận thêm phương thức mới. Về mặt pattern, đây chính là <T>Strategy</T> (2.9) kết hợp với <T>DI</T>.

**Quá tay khi:** switch chỉ ở một chỗ, 2–3 giá trị, gần như không đổi. Khi đó một switch expression rõ ràng hơn. Không có code nào "đóng" với mọi kiểu thay đổi; <T>OCP</T> là chọn đúng hướng mà nghiệp vụ hay thay đổi để mở. Ở đây hướng đó là "thêm phương thức thanh toán".
:::

::: info L · Liskov Substitution
**Định nghĩa:** chỗ nào dùng được kiểu cha thì thay kiểu con vào mà caller không bị bất ngờ. Cụ thể, class con không được: đòi điều kiện đầu vào chặt hơn, trả về ít hơn những gì đã hứa, hoặc ném loại exception mà cha không ném.

**Dấu hiệu vi phạm:** class con ném `NotSupportedException` hoặc override rỗng; caller phải viết `if (x is LoaiConDacBiet)` để né.

```csharp
// Trước: interface hứa mọi gateway đều refund được
public interface IPayoutGateway
{
    Task SendAsync(Payout p);
    Task RefundAsync(Payout p);
}
public class CryptoGateway : IPayoutGateway
{
    public Task RefundAsync(Payout p) => throw new NotSupportedException();  // phá hợp đồng
}
// Job refund hàng loạt chạy được nửa chừng thì nổ, nửa batch đã refund, nửa chưa

// Sau: chỉ hứa điều thật sự làm được (tách interface, cũng chính là ISP)
public interface IPayoutGateway     { Task SendAsync(Payout p); }
public interface IRefundableGateway : IPayoutGateway { Task RefundAsync(Payout p); }
// Luồng refund chỉ nhận IRefundableGateway, compiler chặn CryptoGateway từ đầu
```

**Ví dụ có sẵn trong .NET:** `ReadOnlyCollection<T>` implement `ICollection<T>.Add` rồi ném lỗi. Ví dụ kinh điển Square/Rectangle cũng nên biết, nhưng ví dụ từ nghiệp vụ ghi điểm hơn.
:::

::: info I · Interface Segregation
**Định nghĩa:** bên dùng không nên bị buộc phụ thuộc vào method nó không dùng. Thiết kế interface theo _vai trò của bên gọi_, không theo mọi thứ class làm được.

```csharp
// Trước: màn hình báo cáo chỉ đọc nhưng nhận cả interface 15 method, có cả Delete
public interface IMerchantRepository { GetById, Search, GetActive, Add, Update, Delete, UpdateBalance, ... }

// Sau: một class implement cả hai, mỗi bên gọi chỉ thấy phần nó cần
public interface IMerchantReader { Task<Merchant?> GetByIdAsync(int id); Task<IReadOnlyList<Merchant>> SearchAsync(MerchantQuery q); }
public interface IMerchantWriter { Task AddAsync(Merchant m); Task UpdateBalanceAsync(int id, decimal delta); }
public class MerchantRepository : IMerchantReader, IMerchantWriter { ... }
```

**Lợi ích:** <T>mock</T> trong test chỉ cần 2 method thay vì 15; code báo cáo không thể vô tình ghi dữ liệu. **Quá tay khi:** mỗi method một interface.
:::

::: info D · Dependency Inversion
**Định nghĩa đủ hai ý:** (1) tầng nghiệp vụ không phụ thuộc trực tiếp vào hạ tầng; cả hai phụ thuộc abstraction. (2) **Abstraction do tầng nghiệp vụ định nghĩa**, theo ngôn ngữ của nghiệp vụ. Ý thứ hai là chỗ phân biệt người hiểu sâu.

```csharp
// Sai 1: business gọi thẳng SDK
public class PayoutService { private readonly StripeClient _stripe = new(...); }

// Sai 2: có interface nhưng là bản sao của SDK, vẫn bị hạ tầng định hình
public interface IStripeClient { Task<StripeTransfer> CreateTransferAsync(StripeTransferOptions o); }

// Đúng: interface nằm trong project Core, nói ngôn ngữ nghiệp vụ
namespace Payouts.Core;
public interface IPayoutGateway { Task<TransferResult> SendAsync(Payout payout, CancellationToken ct); }

// Implementation nằm trong project Infrastructure, phụ thuộc NGƯỢC vào Core
namespace Payouts.Infrastructure;
public class StripePayoutGateway(StripeClient stripe) : IPayoutGateway { ... }
```

Mũi tên reference giữa các project: `Infrastructure → Core`, không bao giờ ngược lại. Đổi Stripe sang nhà cung cấp khác không chạm vào Core; test dùng `FakePayoutGateway`.

**Quá tay khi:** tạo interface cho mọi class. Class tính toán thuần, không I/O như `CommissionCalculator`, cứ `new` và test trực tiếp.
:::

::: details Bài tập kiểu phỏng vấn: chỉ ra vi phạm rồi refactor
```csharp
// Web Forms code-behind
protected void btnApprove_Click(object sender, EventArgs e)
{
    var id = int.Parse(hfPayoutId.Value);
    using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings["Main"].ConnectionString))
    {
        var p = conn.QuerySingle<Payout>("SELECT * FROM Payouts WHERE Id = @id", new { id });
        if (p.Status != "Pending") { lblError.Text = "Payout is not pending"; return; }

        if (p.Method == "Bank")        { /* gọi API ngân hàng */ }
        else if (p.Method == "PayPal") { /* gọi API PayPal */ }

        conn.Execute("UPDATE Payouts SET Status = 'Approved', ApprovedBy = @u WHERE Id = @id",
                     new { id, u = User.Identity.Name });
        new SmtpClient().Send("noreply@...", p.MerchantEmail, "Payout approved", "...");
    }
}
```

**Bước 1, gọi tên vi phạm:**

- **SRP:** một event handler làm 5 việc: đọc input UI, truy cập DB, rule nghiệp vụ, gọi cổng thanh toán, gửi email.
- **OCP:** `if/else` theo `Method`, chắc chắn lặp lại ở các màn hình khác.
- **<T>DIP</T>:** `new SqlConnection`, `new SmtpClient` ngay trong UI, nên không test được nếu không có DB và mail server thật.
- Bonus: rule "chỉ duyệt khi Pending" nằm ở UI, nên màn hình hoặc API khác có thể duyệt sai.

**Bước 2, refactor theo thứ tự rủi ro thấp lên cao, không làm một lần:**

1. Viết vài test bao quanh hành vi hiện tại (<T>characterization test</T>) để biết mình không làm hỏng gì.
2. Đưa rule vào domain: `payout.Approve(user)` tự kiểm tra trạng thái (xem ví dụ 2.1).
3. Tách data access ra `IPayoutRepository`, email ra `INotifier`.
4. Thay `if/else` bằng `IPayoutMethod` theo từng phương thức.
5. Gom luồng vào một use case `ApprovePayout`; Web Forms nhận nó qua DI (4.7.2+ có `WebObjectActivator`).

```csharp
protected void btnApprove_Click(object sender, EventArgs e)
{
    var result = _approvePayout.Execute(int.Parse(hfPayoutId.Value), User.Identity.Name);
    lblError.Text = result.Error;   // UI chỉ còn việc của UI
}
```

**Bước 3, nói trade-off:** không refactor toàn bộ codebase một lần. Làm dần theo các ticket có chạm vào chỗ đó. Phần `ApprovePayout` tách ra cũng chính là phần mang sang .NET mới được nguyên vẹn khi migrate.
:::

::: details Cách nói của senior
"Mình không ngồi check từng chữ cái khi code. Mình để ý xem khi requirement đổi thì phải sửa bao nhiêu chỗ, và có test được phần logic không. <T>SOLID</T> là tên gọi cho những thói quen đó. Ví dụ ở dự án cũ, logic tính phí nằm trong code-behind nên mỗi lần đổi rule phải test tay cả màn hình; tách ra một class riêng thì viết unit test được."
:::

::: warning Bẫy & follow-up
**"SOLID có mâu thuẫn với <T>KISS</T>/<T>YAGNI</T> không?"**

Có thể, nếu áp trước khi có lý do. Thực tế: viết đơn giản trước; khi thay đổi thứ hai hoặc thứ ba cùng loại xuất hiện (<T>rule of three</T>) thì mới tách abstraction. Abstraction đúng sinh ra từ thay đổi thật, không từ phỏng đoán.

**"SOLID liên quan gì tới testability?"**

SRP làm unit nhỏ, dễ test. DIP cho phép thay hạ tầng bằng fake. Code khó viết test gần như luôn vi phạm DIP: nó tự `new` DB, HTTP, clock (`DateTime.Now`) bên trong.

**"Nguyên tắc nào quan trọng nhất với bạn?"**

Không có đáp án đúng, nên trả lời có lý do. Ví dụ: "SRP và DIP, vì hai cái đó quyết định code có test được và có sửa được an toàn không. OCP thì mình chỉ áp khi thấy một trục thay đổi lặp lại."

**"DIP, DI và IoC khác nhau thế nào?"**

**IoC** là ý tưởng chung: framework gọi code của bạn chứ không phải ngược lại. **DIP** là nguyên tắc thiết kế: phụ thuộc abstraction do tầng nghiệp vụ định nghĩa. **DI** là kỹ thuật: dependency được truyền từ ngoài vào (thường qua constructor). DI container chỉ là công cụ tự động hóa DI. Có hình và câu hỏi sâu hơn: [DI hoạt động thế nào](/aspnet-core/dependency-injection).
:::

## Design pattern hay bị hỏi (và chỗ chúng có sẵn trong .NET) {#design-patterns}

::: tip Trả lời nhanh
Ba nhóm: **Creational** (tạo object), **Structural** (ghép object), **Behavioral** (cách object phối hợp). Mẹo trả lời: mỗi pattern nêu 1 ví dụ ngay trong .NET mà bạn đã dùng, nghe thực tế hơn nhiều so với ví dụ Pizza.
:::

::: info Bản chất
| Pattern | Dùng khi | Có sẵn trong .NET |
|---|---|---|
| Singleton | Cả app chỉ cần 1 instance | `AddSingleton`, `ArrayPool<T>.Shared` |
| Factory | Ẩn logic chọn và tạo object | `IHttpClientFactory`, `ILoggerFactory` |
| Builder | Dựng object nhiều bước, nhiều tùy chọn | `WebApplication.CreateBuilder`, `StringBuilder`, `UriBuilder` |
| Strategy | Đổi thuật toán lúc runtime | `IComparer<T>`, inject nhiều implementation của cùng interface |
| Decorator | Bọc thêm hành vi mà không sửa class gốc | `BufferedStream`, `GZipStream` bọc `Stream`; `DelegatingHandler` của HttpClient |
| Adapter | Đổi interface bên thứ ba cho khớp code mình | Wrapper quanh SDK của provider |
| Chain of Responsibility | Request đi qua chuỗi handler, mỗi handler xử lý hoặc chuyển tiếp | **Middleware pipeline** của ASP.NET Core |
| Observer | Thông báo cho nhiều bên khi có sự kiện | C# `event`, `IObservable<T>` |
| Template Method | Luồng cố định, các bước con cho override | `BackgroundService.ExecuteAsync` |
| Repository / Unit of Work | Tách data access khỏi business | `DbSet<T>` ≈ repository, `DbContext` ≈ unit of work |

```csharp
// Singleton thread-safe khi không dùng DI
public sealed class AppClock
{
    private static readonly Lazy<AppClock> _instance = new(() => new AppClock());
    public static AppClock Instance => _instance.Value;
    private AppClock() { }
}
```
:::

::: warning Bẫy & follow-up
**"Tại sao dùng Strategy thay vì if/else?"**

Khi số nhánh tăng dần, mỗi nhánh có logic riêng cần test riêng, và muốn thêm nhánh mà không sửa code cũ. Còn 2–3 nhánh ổn định thì if/switch đơn giản hơn: đó là <T>KISS</T>.

**"Singleton có nhược điểm gì?"**

Là global state: khó <T>mock</T>, ẩn dependency, phải thread-safe nếu có state thay đổi. Trong ASP.NET Core dùng `AddSingleton` thay cho static Instance để vẫn inject và test được.

**"Có nên viết Repository trên <T>EF Core</T> không?"**

Đây là câu tranh luận, trả lời theo trade-off: <T>DbContext</T> đã là UoW + repository, bọc thêm một lớp generic thường chỉ làm mất tính năng (`Include`, projection). Nên viết repository theo nghiệp vụ (`GetPendingPayouts`) khi cần gom query hoặc tách khỏi EF để test. Sẽ nói kỹ ở mục EF Core.
:::

## DRY, KISS, YAGNI {#dry-kiss-yagni}

::: tip Trả lời nhanh
**DRY**: mỗi kiến thức nghiệp vụ chỉ nằm ở một chỗ. **KISS**: chọn cách đơn giản nhất mà đủ đúng. **YAGNI**: không làm trước thứ chưa ai cần.
:::

::: warning Bẫy & follow-up
**"DRY có lúc nào sai không?"**

Có. Hai đoạn code giống nhau nhưng thay đổi vì hai lý do khác nhau mà bị gộp làm một, thì sau này mỗi bên đổi một kiểu, abstraction chung đầy cờ `if`. Lặp lại một chút rẻ hơn một abstraction sai. DRY là về kiến thức, không phải về ký tự trùng nhau.
:::
