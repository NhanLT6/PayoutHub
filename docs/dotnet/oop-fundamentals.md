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

::: info Bản chất
Encapsulation và abstraction hay bị nói lẫn. Encapsulation là _bảo vệ dữ liệu và invariant_; abstraction là _giấu độ phức tạp_. Polymorphism có 2 loại: compile-time (overloading) và runtime (`virtual`/`override`, gọi qua bảng virtual method).
:::

::: details Ở dự án thật
```csharp
public class Payout
{
    public PayoutStatus Status { get; private set; } = PayoutStatus.Pending;

    public void Approve(string approvedBy)
    {
        if (Status != PayoutStatus.Pending)
            throw new InvalidOperationException($"Cannot approve a {Status} payout");
        Status = PayoutStatus.Approved;
        ApprovedBy = approvedBy;
    }
}
```

Không ai set thẳng `Status = Approved` được, nên không có chuyện duyệt một payout đã bị reject. Đây là encapsulation giữ đúng luồng business.
:::

::: details Ví dụ có cả encapsulation và abstraction
Mở rộng ví dụ trên thành luồng trả tiền cho affiliate. Hai khái niệm nằm ở hai chỗ khác nhau trong cùng một luồng:

```csharp
// ABSTRACTION: service chỉ cần biết "gửi tiền cho payout này",
// không cần biết phía sau là bank API hay PayPal, ký request ra sao, retry thế nào
public interface IPayoutGateway
{
    Task<TransferResult> SendAsync(Payout payout, CancellationToken ct);
}

public class BankTransferGateway(HttpClient http) : IPayoutGateway
{
    public async Task<TransferResult> SendAsync(Payout payout, CancellationToken ct)
    {
        // build request, ký HMAC, gọi API, dịch mã lỗi của ngân hàng...
        // mọi chi tiết này bị giấu sau interface
    }
}

// ENCAPSULATION: Payout tự bảo vệ trạng thái của nó
public class Payout
{
    private readonly List<PayoutEvent> _history = [];

    public decimal Amount { get; private set; }
    public PayoutStatus Status { get; private set; } = PayoutStatus.Pending;
    public string? BankReference { get; private set; }
    public IReadOnlyList<PayoutEvent> History => _history;   // đọc được, không sửa được

    public void Approve(string by)
    {
        EnsureStatus(PayoutStatus.Pending);
        Status = PayoutStatus.Approved;
        _history.Add(new PayoutEvent("Approved", by));
    }

    public void MarkPaid(string bankReference)
    {
        EnsureStatus(PayoutStatus.Approved);   // chưa duyệt thì không thể "đã trả"
        Status = PayoutStatus.Paid;
        BankReference = bankReference;
        _history.Add(new PayoutEvent("Paid", "system"));
    }

    private void EnsureStatus(PayoutStatus expected)
    {
        if (Status != expected)
            throw new InvalidOperationException($"Payout is {Status}, expected {expected}");
    }
}

// Nơi hai thứ gặp nhau
public class PayoutProcessor(IPayoutGateway gateway, IPayoutRepository repo)
{
    public async Task PayAsync(int payoutId, CancellationToken ct)
    {
        var payout = await repo.GetAsync(payoutId, ct);
        var result = await gateway.SendAsync(payout, ct);  // abstraction: không biết gửi bằng cách nào
        payout.MarkPaid(result.Reference);                 // encapsulation: không tự set Status
        await repo.SaveAsync(payout, ct);
    }
}
```

|  | Encapsulation | Abstraction |
|---|---|---|
| Trả lời câu hỏi | Ai được sửa dữ liệu này, và sửa bằng cách nào? | Bên dùng cần biết gì để dùng được cái này? |
| Trong ví dụ | `private set`, `EnsureStatus`, `History` chỉ đọc | `IPayoutGateway` giấu toàn bộ chi tiết ngân hàng |
| Nếu thiếu | Code ở đâu đó set `Status = Paid` cho payout chưa được duyệt | Đổi từ chuyển khoản sang PayPal phải sửa `PayoutProcessor` và mọi chỗ gọi |
| Công cụ C# | Access modifier, `private set`, `init`, method có kiểm tra điều kiện | Interface, abstract class, API public gọn |

**Câu để nói khi phỏng vấn:** "Encapsulation bảo vệ bên trong, abstraction đơn giản hóa bên ngoài. Payout tự giữ luật chuyển trạng thái của nó, nên không ai đánh dấu đã trả cho payout chưa duyệt. Còn service chỉ thấy `IPayoutGateway`, nên chuyển từ chuyển khoản sang PayPal không phải sửa luồng trả tiền."

**Phản ví dụ hay gặp ở Web Forms:** nút "Pay" trong code-behind vừa gọi thẳng API ngân hàng, vừa chạy `UPDATE Payouts SET Status = 'Paid'`. Thiếu cả hai: luật chuyển trạng thái bị rải ở mọi page có thao tác với payout, và page biết quá nhiều chi tiết của ngân hàng.
:::

::: warning Bẫy & follow-up
**"Composition over inheritance nghĩa là gì?"**

Inheritance tạo coupling chặt: đổi class cha là ảnh hưởng mọi class con, và C# chỉ cho kế thừa một class. Chỉ dùng khi thật sự là "is-a" và cần chia sẻ hành vi. Còn lại thì ghép các object nhỏ qua interface và DI.
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
Interface: `IPaymentGateway` để đổi provider và mock khi test. Abstract class: `ReportBase` giữ luồng chung (lấy data, build header, xuất file) và để class con chỉ override phần tính toán riêng, chính là Template Method.
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

**`new` làm gì:** khai báo một method mới trùng tên chứ không thay thế method của cha, nên object có cả `Base.B` lẫn `Derived.B`. `override` ghi đè ô của method cha trong vtable nên được chọn lúc runtime theo object thật; method `new` được compiler chọn lúc compile theo kiểu biến. Vì vậy `((Base)d).B()` ra "Base.B" dù cùng một object. Chỉ nên dùng khi class cha (thường từ thư viện) thêm method trùng tên với method bạn đã có.
:::

::: warning Bẫy & follow-up
**Đây là câu "cho đoạn code, đoán output" rất hay gặp.**

Nhớ quy tắc: `override` theo object thật, `new` theo kiểu biến. Quên ghi `override` thì compiler cảnh báo và mặc định coi như `new`.

**"`sealed` dùng làm gì?"**

Chặn kế thừa (class) hoặc chặn override tiếp (method). JIT có thể tối ưu gọi method trên class sealed. Nhiều team để mặc định sealed cho class không thiết kế để kế thừa.
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

Static dùng chung cho mọi request của mọi user trên process. Web Forms recycle app pool thì static khởi tạo lại; nhiều server thì mỗi server một bản.
:::

::: warning Bẫy & follow-up
**"Đổi `const` trong một library thì sao?"**

Giá trị const được copy thẳng vào assembly gọi nó lúc compile. Assembly khác không build lại vẫn dùng giá trị cũ. Giá trị có thể đổi theo version thì dùng `static readonly`.

**"`readonly List<int>` có thêm phần tử được không?"**

Được. `readonly` chỉ khóa tham chiếu, không khóa object. Muốn bất biến thật thì dùng `IReadOnlyList` hoặc immutable collection.

**"Static constructor ném exception thì sao?"**

`TypeInitializationException`, và CLR không thử lại: type hỏng tới khi process khởi động lại. Đừng gọi DB, file hay API trong static constructor.
:::

## `struct` vs `class` vs `record` {#struct-class-record}

::: tip Trả lời nhanh
`struct` là value type: gán là copy, không kế thừa, hợp với dữ liệu nhỏ và bất biến (tọa độ, tiền tệ). `class` là reference type: gán là copy tham chiếu. `record` (C# 9) là class có so sánh theo giá trị, có `with` để tạo bản sao, hợp với DTO và value object. `record struct` (C# 10) là bản value type của nó.
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

Nhỏ (khoảng 16 byte trở xuống), bất biến, tạo rất nhiều, và không bị boxing thường xuyên. Không chắc thì dùng class hoặc record.

**"`Tuple` và `ValueTuple` khác nhau thế nào?"**

`System.Tuple` là class cũ, phần tử chỉ có tên `Item1`, `Item2`. `ValueTuple` `(int Id, string Name)` là struct, đặt tên được, nhưng tên chỉ tồn tại lúc compile và mất khi serialize. Dùng tuple cho giá trị trả về nội bộ; ở API public thì dùng record.
:::

## String immutable nghĩa là gì? `==` vs `Equals` vs `ReferenceEquals` {#string-equality}

::: tip Trả lời nhanh
String không bao giờ bị sửa tại chỗ; mọi phép "sửa" đều tạo string mới. Nhờ vậy nó an toàn khi dùng chung giữa các thread và làm key cho Dictionary. Ghép string trong vòng lặp là O(n²) bộ nhớ, nên dùng `StringBuilder` hoặc `string.Join`.

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

Số method không phải thước đo. `Payout` có `Approve`, `Reject`, `MarkPaid`, `Cancel` vẫn đúng SRP, vì tất cả đều là luật trạng thái payout. Ngược lại, một class chỉ có mỗi `Run()` nhưng vừa tính phí, vừa dựng HTML, vừa gửi email thì sai. Tự kiểm tra: mô tả class trong một câu mà phải nối nhiều việc không liên quan bằng chữ "và" là dấu hiệu nên tách.

**Dấu hiệu vi phạm:** class tên `...Manager`/`...Helper` dài hàng nghìn dòng; một file bị sửa bởi các ticket từ nhiều phòng ban khác nhau; không unit test được vì logic dính DB, SMTP.

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

"Đóng" là `PayoutProcessor`, `PayoutMethods`, `BankTransferMethod` và `PayPalMethod` không bị đụng tới. "Mở" là hệ thống vẫn nhận thêm phương thức mới. Về mặt pattern, đây chính là Strategy (2.9) kết hợp với DI.

**Quá tay khi:** switch chỉ ở một chỗ, 2–3 giá trị, gần như không đổi. Khi đó một switch expression rõ ràng hơn. Không có code nào "đóng" với mọi kiểu thay đổi; OCP là chọn đúng hướng mà nghiệp vụ hay thay đổi để mở. Ở đây hướng đó là "thêm phương thức thanh toán".
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

**Lợi ích:** mock trong test chỉ cần 2 method thay vì 15; code báo cáo không thể vô tình ghi dữ liệu. **Quá tay khi:** mỗi method một interface.
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
- **DIP:** `new SqlConnection`, `new SmtpClient` ngay trong UI, nên không test được nếu không có DB và mail server thật.
- Bonus: rule "chỉ duyệt khi Pending" nằm ở UI, nên màn hình hoặc API khác có thể duyệt sai.

**Bước 2, refactor theo thứ tự rủi ro thấp lên cao, không làm một lần:**

1. Viết vài test bao quanh hành vi hiện tại (characterization test) để biết mình không làm hỏng gì.
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
"Mình không ngồi check từng chữ cái khi code. Mình để ý xem khi requirement đổi thì phải sửa bao nhiêu chỗ, và có test được phần logic không. SOLID là tên gọi cho những thói quen đó. Ví dụ ở dự án cũ, logic tính phí nằm trong code-behind nên mỗi lần đổi rule phải test tay cả màn hình; tách ra một class riêng thì viết unit test được."
:::

::: warning Bẫy & follow-up
**"SOLID có mâu thuẫn với KISS/YAGNI không?"**

Có thể, nếu áp trước khi có lý do. Thực tế: viết đơn giản trước; khi thay đổi thứ hai hoặc thứ ba cùng loại xuất hiện (rule of three) thì mới tách abstraction. Abstraction đúng sinh ra từ thay đổi thật, không từ phỏng đoán.

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

Khi số nhánh tăng dần, mỗi nhánh có logic riêng cần test riêng, và muốn thêm nhánh mà không sửa code cũ. Còn 2–3 nhánh ổn định thì if/switch đơn giản hơn: đó là KISS.

**"Singleton có nhược điểm gì?"**

Là global state: khó mock, ẩn dependency, phải thread-safe nếu có state thay đổi. Trong ASP.NET Core dùng `AddSingleton` thay cho static Instance để vẫn inject và test được.

**"Có nên viết Repository trên EF Core không?"**

Đây là câu tranh luận, trả lời theo trade-off: DbContext đã là UoW + repository, bọc thêm một lớp generic thường chỉ làm mất tính năng (`Include`, projection). Nên viết repository theo nghiệp vụ (`GetPendingPayouts`) khi cần gom query hoặc tách khỏi EF để test. Sẽ nói kỹ ở mục EF Core.
:::

## DRY, KISS, YAGNI {#dry-kiss-yagni}

::: tip Trả lời nhanh
**DRY**: mỗi kiến thức nghiệp vụ chỉ nằm ở một chỗ. **KISS**: chọn cách đơn giản nhất mà đủ đúng. **YAGNI**: không làm trước thứ chưa ai cần.
:::

::: warning Bẫy & follow-up
**"DRY có lúc nào sai không?"**

Có. Hai đoạn code giống nhau nhưng thay đổi vì hai lý do khác nhau mà bị gộp làm một, thì sau này mỗi bên đổi một kiểu, abstraction chung đầy cờ `if`. Lặp lại một chút rẻ hơn một abstraction sai. DRY là về kiến thức, không phải về ký tự trùng nhau.
:::
