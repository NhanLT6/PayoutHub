---
title: "SOLID & design pattern"
---

# SOLID & design pattern

SOLID là năm thói quen để khi requirement đổi thì sửa ít chỗ và logic test được; design pattern là tên cho các cách ghép object hay gặp. Cả trang dùng một ví dụ: luồng trả payout qua Bank, PayPal, rồi thêm Wise.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="oA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="oBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker><marker id="oMut" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path style="fill:var(--vp-c-text-3)" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 352" role="img" aria-label="Bản đồ chủ đề SOLID và pattern: tám ô, mỗi ô một hình gợi nhớ: một class bị ba bên kéo, processor khoá kín nhận thêm Wise, Crypto không thay được cha, interface béo và gầy, mũi tên phụ thuộc về Core, nút Approve làm năm việc, ba pattern, rule of three">
<!-- S -->
<a href="#srp" style="text-decoration:none">
<rect class="box" x="5" y="6" width="170" height="165" rx="10"/>
<text x="19" y="30" font-size="13" font-weight="700">S · SRP</text>
<text x="165" y="30" font-size="9.5" text-anchor="end" class="badT">bẫy: đếm method</text>
<circle class="box" cx="30" cy="54" r="10"/><text x="30" y="58" font-size="10" text-anchor="middle">F</text>
<circle class="box" cx="30" cy="84" r="10"/><text x="30" y="88" font-size="10" text-anchor="middle">O</text>
<circle class="box" cx="30" cy="114" r="10"/><text x="30" y="118" font-size="10" text-anchor="middle">M</text>
<rect class="boxBad" x="100" y="64" width="58" height="40" rx="6"/>
<text x="129" y="88" font-size="10.5" text-anchor="middle" class="badT">Job</text>
<line class="lnBad" x1="40" y1="56" x2="96" y2="74" marker-end="url(#oBad)"/>
<line class="lnBad" x1="40" y1="84" x2="96" y2="84" marker-end="url(#oBad)"/>
<line class="lnBad" x1="40" y1="112" x2="96" y2="94" marker-end="url(#oBad)"/>
<text x="129" y="118" font-size="9.5" text-anchor="middle" class="badT">3 lý do đổi</text>
<line class="lnMuted" x1="17" y1="132" x2="163" y2="132"/>
<text x="90" y="154" font-size="11" text-anchor="middle">1 class, 1 lý do đổi</text>
</a>
<!-- O -->
<a href="#ocp" style="text-decoration:none">
<rect class="box" x="185" y="6" width="170" height="165" rx="10"/>
<text x="199" y="30" font-size="13" font-weight="700">O · OCP</text>
<rect class="box" x="198" y="62" width="70" height="40" rx="6"/>
<text x="233" y="86" font-size="9.5" text-anchor="middle">Processor</text>
<rect class="box" x="258" y="52" width="16" height="12" rx="2" style="stroke:var(--vp-c-text-2)"/>
<path d="M261 52 V47 a5 5 0 0 1 10 0 V52" fill="none" style="stroke:var(--vp-c-text-2);stroke-width:1.5"/>
<rect class="box" x="290" y="50" width="56" height="22" rx="11"/>
<text x="318" y="65" font-size="9.5" text-anchor="middle">Bank</text>
<rect class="box" x="290" y="80" width="56" height="22" rx="11"/>
<text x="318" y="95" font-size="9.5" text-anchor="middle">PayPal</text>
<rect class="boxAcc dash" x="290" y="110" width="56" height="22" rx="11"/>
<text x="318" y="125" font-size="9.5" text-anchor="middle" class="accT">+ Wise</text>
<line class="ln" x1="268" y1="74" x2="288" y2="62"/>
<line class="ln" x1="268" y1="84" x2="288" y2="91"/>
<line class="lnAcc dash" x1="268" y1="94" x2="288" y2="120"/>
<line class="lnMuted" x1="197" y1="140" x2="343" y2="140"/>
<text x="270" y="160" font-size="11" text-anchor="middle">Thêm Wise = thêm class</text>
</a>
<!-- L -->
<a href="#lsp" style="text-decoration:none">
<rect class="box" x="365" y="6" width="170" height="165" rx="10"/>
<text x="379" y="30" font-size="13" font-weight="700">L · LSP</text>
<rect class="box dash" x="394" y="44" width="112" height="26" rx="5"/>
<text x="450" y="61" font-size="9.5" text-anchor="middle" class="mono muted">IPayoutGateway</text>
<rect class="boxOk" x="382" y="96" width="58" height="24" rx="12"/>
<text x="411" y="112" font-size="10" text-anchor="middle" class="okT">Bank</text>
<rect class="boxBad" x="460" y="96" width="62" height="24" rx="12"/>
<text x="491" y="112" font-size="10" text-anchor="middle" class="badT">Crypto</text>
<line class="lnOk" x1="414" y1="94" x2="428" y2="74"/>
<line class="lnBad" x1="488" y1="94" x2="474" y2="74"/>
<line class="lnBad" x1="476" y1="78" x2="488" y2="90" style="stroke-width:2.5"/>
<line class="lnBad" x1="488" y1="78" x2="476" y2="90" style="stroke-width:2.5"/>
<text x="491" y="134" font-size="9" text-anchor="middle" class="badT">Refund: throw</text>
<line class="lnMuted" x1="377" y1="140" x2="523" y2="140"/>
<text x="450" y="160" font-size="11" text-anchor="middle">Con thay cha, không bất ngờ</text>
</a>
<!-- I -->
<a href="#isp" style="text-decoration:none">
<rect class="box" x="545" y="6" width="170" height="165" rx="10"/>
<text x="559" y="30" font-size="13" font-weight="700">I · ISP</text>
<rect class="box" x="562" y="42" width="54" height="80" rx="5"/>
<g style="stroke:var(--vp-c-text-3);stroke-width:2">
<line x1="570" y1="54" x2="608" y2="54"/><line x1="570" y1="64" x2="604" y2="64"/><line x1="570" y1="74" x2="608" y2="74"/><line x1="570" y1="84" x2="600" y2="84"/><line x1="570" y1="94" x2="608" y2="94"/><line x1="570" y1="104" x2="604" y2="104"/>
</g>
<line class="lnBad" x1="570" y1="114" x2="608" y2="114" style="stroke-width:2"/>
<text x="589" y="134" font-size="9" text-anchor="middle" class="badT">có cả Delete</text>
<rect class="boxAcc" x="648" y="54" width="48" height="32" rx="5"/>
<g style="stroke:var(--vp-c-brand-1);stroke-width:2"><line x1="656" y1="65" x2="688" y2="65"/><line x1="656" y1="75" x2="682" y2="75"/></g>
<line class="lnAcc" x1="672" y1="112" x2="672" y2="90" marker-end="url(#oA)"/>
<text x="672" y="126" font-size="9.5" text-anchor="middle">Report</text>
<line class="lnMuted" x1="557" y1="140" x2="703" y2="140"/>
<text x="630" y="160" font-size="11" text-anchor="middle">Interface theo bên gọi</text>
</a>
<!-- D -->
<a href="#dip" style="text-decoration:none">
<rect class="box" x="5" y="181" width="170" height="165" rx="10"/>
<text x="19" y="205" font-size="13" font-weight="700">D · DIP</text>
<text x="165" y="205" font-size="9.5" text-anchor="end" class="badT">bẫy: chép SDK</text>
<rect class="boxAcc" x="30" y="216" width="120" height="28" rx="6"/>
<text x="90" y="234" font-size="10" text-anchor="middle" class="accT">Core: IPayoutGateway</text>
<rect class="box" x="30" y="276" width="120" height="28" rx="6"/>
<text x="90" y="294" font-size="10" text-anchor="middle">Infrastructure</text>
<line class="lnAcc" x1="66" y1="274" x2="66" y2="248" marker-end="url(#oA)"/>
<line class="lnBad" x1="116" y1="246" x2="116" y2="272" marker-end="url(#oBad)"/>
<line class="lnBad" x1="110" y1="253" x2="122" y2="265" style="stroke-width:2.5"/>
<line class="lnBad" x1="122" y1="253" x2="110" y2="265" style="stroke-width:2.5"/>
<line class="lnMuted" x1="17" y1="314" x2="163" y2="314"/>
<text x="90" y="334" font-size="11" text-anchor="middle">Mũi tên chỉ về Core</text>
</a>
<!-- exercise -->
<a href="#solid-exercise" style="text-decoration:none">
<rect class="box" x="185" y="181" width="170" height="165" rx="10"/>
<text x="199" y="205" font-size="13" font-weight="700">Bài tập</text>
<rect class="boxBad" x="232" y="246" width="76" height="26" rx="13"/>
<text x="270" y="263" font-size="9.5" text-anchor="middle" class="mono badT">btnApprove</text>
<g class="lnBad"><line class="lnBad" x1="248" y1="246" x2="226" y2="230"/><line class="lnBad" x1="270" y1="246" x2="270" y2="228"/><line class="lnBad" x1="292" y1="246" x2="314" y2="230"/><line class="lnBad" x1="248" y1="272" x2="226" y2="288"/><line class="lnBad" x1="292" y1="272" x2="314" y2="288"/></g>
<text x="216" y="226" font-size="9.5" text-anchor="middle">DB</text>
<text x="270" y="222" font-size="9.5" text-anchor="middle">luật</text>
<text x="326" y="226" font-size="9.5" text-anchor="middle">bank</text>
<text x="218" y="300" font-size="9.5" text-anchor="middle">email</text>
<text x="322" y="300" font-size="9.5" text-anchor="middle">UI</text>
<line class="lnMuted" x1="197" y1="314" x2="343" y2="314"/>
<text x="270" y="334" font-size="11" text-anchor="middle">1 handler, 5 việc</text>
</a>
<!-- patterns -->
<a href="#patterns" style="text-decoration:none">
<rect class="box" x="365" y="181" width="170" height="165" rx="10"/>
<text x="379" y="205" font-size="13" font-weight="700">Pattern</text>
<rect class="box" x="374" y="236" width="12" height="16" rx="2"/><rect class="box" x="392" y="236" width="12" height="16" rx="2"/><rect class="boxAcc" x="410" y="236" width="12" height="16" rx="2"/>
<line class="ln" x1="386" y1="244" x2="392" y2="244"/><line class="ln" x1="404" y1="244" x2="410" y2="244"/>
<text x="398" y="276" font-size="9.5" text-anchor="middle">Chain</text>
<text x="398" y="290" font-size="8.5" text-anchor="middle" class="muted">middleware</text>
<rect class="box" x="436" y="229" width="40" height="30" rx="4"/>
<rect class="boxAcc" x="444" y="236" width="24" height="16" rx="3"/>
<text x="456" y="276" font-size="9.5" text-anchor="middle">Decorator</text>
<text x="456" y="290" font-size="8.5" text-anchor="middle" class="muted">handler</text>
<circle class="boxAcc" cx="498" cy="244" r="5"/>
<line class="ln" x1="503" y1="244" x2="522" y2="230"/><line class="ln" x1="503" y1="244" x2="522" y2="244"/><line class="ln" x1="503" y1="244" x2="522" y2="258"/>
<circle class="box" cx="526" cy="230" r="4"/><circle class="box" cx="526" cy="244" r="4"/><circle class="box" cx="526" cy="258" r="4"/>
<text x="506" y="276" font-size="9.5" text-anchor="middle">Strategy</text>
<text x="506" y="290" font-size="8.5" text-anchor="middle" class="muted">nhiều impl</text>
<line class="lnMuted" x1="377" y1="314" x2="523" y2="314"/>
<text x="450" y="334" font-size="11" text-anchor="middle">Có sẵn trong .NET</text>
</a>
<!-- trade-off -->
<a href="#tradeoffs" style="text-decoration:none">
<rect class="box" x="545" y="181" width="170" height="165" rx="10"/>
<text x="559" y="205" font-size="13" font-weight="700">Trade-off</text>
<rect class="box" x="562" y="232" width="24" height="24" rx="4"/><text x="574" y="248" font-size="10" text-anchor="middle">1</text>
<rect class="box" x="596" y="232" width="24" height="24" rx="4"/><text x="608" y="248" font-size="10" text-anchor="middle">2</text>
<rect class="boxAcc" x="630" y="232" width="24" height="24" rx="4"/><text x="642" y="248" font-size="10" text-anchor="middle" class="accT">3</text>
<line class="lnAcc" x1="654" y1="244" x2="680" y2="244" marker-end="url(#oA)"/>
<rect class="boxAcc" x="684" y="222" width="10" height="44" rx="3"/>
<text x="628" y="278" font-size="9" text-anchor="middle" class="muted">lần 3 mới tách interface</text>
<text x="630" y="300" font-size="9.5" text-anchor="middle" class="badT">bẫy: DRY không phải trùng chữ</text>
<line class="lnMuted" x1="557" y1="314" x2="703" y2="314"/>
<text x="630" y="334" font-size="11" text-anchor="middle">Rule of three</text>
</a>
</svg>
<p class="fig-caption">Nhìn từng ô, tự nói lại nguyên tắc bằng ví dụ payout; chữ đỏ là bẫy hay bị hỏi. Quên ô nào thì bấm vào ô đó.</p>
</div>

## 1. SOLID: năm câu hỏi khi requirement đổi {#solid-lesson}

**SOLID là năm thói quen trả lời một câu hỏi: khi requirement đổi, phải sửa bao nhiêu chỗ, và phần logic có test được không.** Nút Pay ở [mục 1](/dotnet/oop-fundamentals#problem) trả lời tệ cả hai, và mỗi nguyên tắc dưới đây gọi tên một kiểu tệ. Đây là heuristic, không phải luật: áp trước khi có lý do thì sinh interface và tầng lớp thừa ([khi nào không cần](#tradeoffs)).

### S · Single Responsibility {#srp}

**Một class chỉ nên có một lý do để thay đổi**, tức là chỉ phục vụ một bên hay yêu cầu sửa nó (chỉ Finance với rule phí, hoặc chỉ Ops với layout báo cáo). Số method không phải thước đo: `Payout` có `Approve`, `MarkPaid`, `Cancel` vẫn đúng <T>SRP</T> vì tất cả là luật trạng thái payout. Ngược lại một class chỉ có `Run()` nhưng vừa tính phí, vừa dựng HTML, vừa gửi email thì sai. Tự kiểm tra: mô tả class mà phải nối nhiều việc không liên quan bằng chữ "và" là dấu hiệu nên tách.

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

Finance đổi tỷ lệ phí thì chỉ sửa và test `CommissionCalculator`, không cần DB hay <T>SMTP</T>, không có rủi ro làm hỏng email. Quá tay khi chẻ một class 50 dòng thành 5 file mỗi file một method: phần nào luôn đổi cùng nhau thì để chung.

### O · Open/Closed {#ocp}

**Thêm hành vi bằng cách viết code mới, không sửa code đang chạy ổn.** [Bước 4](/dotnet/oop-fundamentals#polymorphism) đã làm điều này cho việc gửi tiền. Trong hệ thống thật, mỗi kênh trả tiền còn có phí và luật validate riêng; nếu mỗi việc là một file có `switch` theo kênh, hiểu biết về một kênh bị rải ra nhiều nơi:

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

Thêm Wise phải sửa cả ba file. Quên một chỗ không có lỗi compile; nó nổ giữa luồng trả tiền, khi payout đã tính phí và validate xong mà bước gửi ném `NotSupportedException`. Và mỗi lần mở ba file ra sửa là một lần có thể làm hỏng Bank và PayPal đang chạy tốt.

Chữa: gom mọi hiểu biết về **một** kênh vào **một** class. Interface là checklist mà kênh nào cũng phải trả lời đủ:

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

Bây giờ thêm Wise chỉ là thêm `WiseMethod.cs` và một dòng `AddScoped`; không file cũ nào bị sửa, chỉ phải test `WiseMethod`, và quên một method thì là lỗi compile chứ không nổ lúc chạy. Về pattern, đây là <T>Strategy</T> kết hợp <T>DI</T>. Không code nào "đóng" với mọi kiểu thay đổi; <T>OCP</T> là chọn đúng hướng nghiệp vụ hay đổi để mở, ở đây là "thêm kênh trả tiền". `switch` chỉ ở một chỗ, 2–3 giá trị, gần như không đổi thì cứ để `switch`.

### L · Liskov Substitution {#lsp}

**Chỗ nào dùng được kiểu cha thì thay kiểu con vào mà bên gọi không bị bất ngờ.** Cụ thể, class con không được đòi đầu vào chặt hơn, trả về ít hơn điều đã hứa, hay ném loại exception mà cha không ném. Dấu hiệu vi phạm: con ném `NotSupportedException` hoặc override rỗng, bên gọi phải viết `if (x is LoaiDacBiet)` để né.

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

Ví dụ có sẵn trong .NET: `ReadOnlyCollection<T>` implement `ICollection<T>.Add` rồi ném lỗi. Ví dụ Square/Rectangle nên biết, nhưng ví dụ từ nghiệp vụ ghi điểm hơn.

### I · Interface Segregation {#isp}

**Bên dùng không nên bị buộc phụ thuộc vào method nó không dùng**, nên thiết kế interface theo vai trò của bên gọi, không theo mọi thứ class làm được.

```csharp
// Trước: màn hình báo cáo chỉ đọc nhưng nhận cả interface 15 method, có cả Delete
public interface IMerchantRepository { GetById, Search, GetActive, Add, Update, Delete, UpdateBalance, ... }

// Sau: một class implement cả hai, mỗi bên gọi chỉ thấy phần nó cần
public interface IMerchantReader { Task<Merchant?> GetByIdAsync(int id); Task<IReadOnlyList<Merchant>> SearchAsync(MerchantQuery q); }
public interface IMerchantWriter { Task AddAsync(Merchant m); Task UpdateBalanceAsync(int id, decimal delta); }
public class MerchantRepository : IMerchantReader, IMerchantWriter { ... }
```

<T>Mock</T> trong test chỉ cần 2 method thay vì 15, và code báo cáo không thể vô tình ghi dữ liệu. Quá tay khi mỗi method một interface.

### D · Dependency Inversion {#dip}

**Tầng nghiệp vụ không phụ thuộc trực tiếp hạ tầng; cả hai phụ thuộc một abstraction, và abstraction đó do tầng nghiệp vụ định nghĩa bằng ngôn ngữ nghiệp vụ.** Ý thứ hai là chỗ phân biệt người hiểu sâu: một interface sao chép nguyên SDK thì vẫn bị hạ tầng định hình.

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

Mũi tên reference giữa các project là `Infrastructure → Core`, không bao giờ ngược lại. Đổi Stripe sang nhà cung cấp khác không chạm Core; test dùng `FakePayoutGateway`. Code khó viết test gần như luôn vi phạm DIP: nó tự `new` DB, HTTP, clock (`DateTime.Now`) bên trong. DIP là nguyên tắc; **DI** là kỹ thuật truyền dependency từ ngoài vào; **IoC** là ý tưởng framework gọi code của bạn. Chi tiết: [DI hoạt động thế nào](/aspnet-core/dependency-injection).

### Bài tập: chỉ ra vi phạm trong nút Approve {#solid-exercise}

Dạng phỏng vấn hay gặp: cho một đoạn code, chỉ ra vi phạm rồi nói cách refactor.

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

**Vi phạm:**

- **SRP**: một handler làm năm việc: đọc input UI, truy cập DB, luật nghiệp vụ, gọi cổng thanh toán, gửi email.
- **OCP**: `if/else` theo `Method`, chắc chắn lặp lại ở màn hình khác.
- **<T>DIP</T>**: `new SqlConnection`, `new SmtpClient` ngay trong UI, không test được nếu thiếu DB và mail server thật.
- Thêm nữa: luật "chỉ duyệt khi Pending" nằm ở UI, màn hình hoặc API khác có thể duyệt sai (thiếu [encapsulation](/dotnet/oop-fundamentals#encapsulation)).

**Refactor theo thứ tự rủi ro thấp lên cao, không làm một lần:**

1. Viết vài test bao quanh hành vi hiện tại (<T>characterization test</T>) để biết mình không làm hỏng gì.
2. Đưa luật vào domain: `payout.Approve(user)` tự kiểm trạng thái, như [bước 1](/dotnet/oop-fundamentals#encapsulation).
3. Tách data access ra `IPayoutRepository`, email ra `INotifier`.
4. Thay `if/else` bằng `IPayoutMethod` theo từng kênh, như [Open/Closed](#ocp).
5. Gom luồng vào một use case `ApprovePayout`; Web Forms nhận nó qua DI (4.7.2+ có `WebObjectActivator`).

```csharp
protected void btnApprove_Click(object sender, EventArgs e)
{
    var result = _approvePayout.Execute(int.Parse(hfPayoutId.Value), User.Identity.Name);
    lblError.Text = result.Error;   // UI chỉ còn việc của UI
}
```

Làm dần theo các ticket có chạm vào chỗ đó. Phần `ApprovePayout` tách ra cũng là phần mang sang .NET mới nguyên vẹn khi migrate.

## 2. Design pattern: tên cho những cách ghép đã thấy {#patterns}

**Pattern là tên đặt cho một cách ghép object lặp đi lặp lại, để nói ngắn với nhau.** Trang này đã dùng vài cái mà không gọi tên: bước 4 là Strategy, `Payout` abstract với luồng chung là Template Method, `PayoutMethods` tra theo code là một Factory. Khi trả lời, nêu chỗ pattern có sẵn trong .NET mà bạn đã dùng, nghe thực tế hơn ví dụ Pizza. Ba nhóm: **Creational** (tạo object), **Structural** (ghép object), **Behavioral** (object phối hợp thế nào).

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

Singleton không dùng DI thì viết thread-safe bằng `Lazy<T>`:

```csharp
// Singleton thread-safe khi không dùng DI
public sealed class AppClock
{
    private static readonly Lazy<AppClock> _instance = new(() => new AppClock());
    public static AppClock Instance => _instance.Value;
    private AppClock() { }
}
```


## 3. Trade-off: khi nào không áp {#tradeoffs}

Vì interface chỉ đáng giá khi có nhiều implementation hoặc cần thay khi test, class tính toán thuần, không I/O như `CommissionCalculator` cứ `new` và test trực tiếp. Vì Strategy chỉ đáng khi số nhánh tăng và mỗi nhánh cần test riêng, 2–3 nhánh ổn định thì `switch` rõ hơn. Thực tế: viết đơn giản trước, khi thay đổi cùng loại xuất hiện lần thứ hai, thứ ba (<T>rule of three</T>) mới tách abstraction. Abstraction đúng sinh ra từ thay đổi thật, không từ phỏng đoán.

Singleton (static `Instance`) là global state: khó <T>mock</T>, ẩn dependency, phải thread-safe nếu có state thay đổi. Trong ASP.NET Core dùng `AddSingleton` để vẫn inject và test được. Repository bọc <T>EF Core</T>: <T>DbContext</T> đã là unit of work và `DbSet` đã là repository, bọc thêm một lớp generic thường làm mất `Include` và projection; chỉ viết repository theo nghiệp vụ (`GetPendingPayouts`) khi cần gom query hoặc tách khỏi EF để test.

### DRY, KISS, YAGNI {#principles}

**DRY**: mỗi **kiến thức nghiệp vụ** chỉ nằm một chỗ. **KISS**: chọn cách đơn giản nhất mà đủ đúng. **YAGNI**: không làm trước thứ chưa ai cần. DRY nói về kiến thức, không về ký tự trùng nhau: hai đoạn code giống nhau nhưng đổi vì hai lý do khác nhau mà bị gộp làm một, sau này mỗi bên đổi một kiểu, abstraction chung đầy cờ `if`. Lặp lại một chút rẻ hơn một abstraction sai. Đây cũng là lý do SOLID áp quá sớm mâu thuẫn với <T>KISS</T>/<T>YAGNI</T>.


## Câu hỏi phỏng vấn {#interview}

### SOLID <Badge type="warning" text="hay bị hỏi sâu" /> {#solid}

::: tip Trả lời nhanh
Năm thói quen để requirement đổi thì sửa ít chỗ và logic test được: **S**ingle Responsibility, **O**pen/Closed, **L**iskov Substitution, **I**nterface Segregation, **D**ependency Inversion. Interviewer thường đào tiếp: ví dụ thật từng nguyên tắc, chỉ ra vi phạm trong đoạn code, khi nào không nên áp. Xem [SOLID](#solid-lesson) và [bài tập nút Approve](#solid-exercise).
:::

::: details Câu trả lời mẫu (English)
I don't check the five letters one by one while coding; I ask how many places I'd have to change when a requirement changes, and whether the logic can be unit tested. SOLID names those habits. Single responsibility: one reason to change, so the fee rules live in a CommissionCalculator that Finance changes without touching email. Open/closed: adding Wise as a payout method means adding a WiseMethod class and one DI registration, not editing switches in three files. Liskov: a gateway that throws NotSupportedException on Refund breaks the contract, so refund gets its own interface. Interface segregation: a read-only report gets a reader interface, not a fifteen-method repository. Dependency inversion: the core defines IPayoutGateway in business terms and infrastructure implements it. I apply them when a second or third change of the same kind shows up, not upfront.
:::

::: warning Bẫy & follow-up
**"SOLID có mâu thuẫn với KISS/YAGNI không?"** Có thể, nếu áp trước khi có lý do. Xem [khi nào không cần](#tradeoffs).

**"SOLID liên quan gì tới testability?"** SRP làm unit nhỏ; DIP cho thay hạ tầng bằng fake. Code khó test gần như luôn vi phạm DIP.

**"Nguyên tắc nào quan trọng nhất với bạn?"** Không có đáp án đúng, trả lời có lý do: "SRP và DIP, vì chúng quyết định code test được và sửa an toàn được. OCP thì chỉ áp khi thấy một trục thay đổi lặp lại."

**"DIP, DI và IoC khác nhau thế nào?"** Xem [Dependency Inversion](#dip).
:::

### Design pattern hay bị hỏi (và chỗ chúng có sẵn trong .NET) {#design-patterns}

::: tip Trả lời nhanh
Creational (tạo object), Structural (ghép object), Behavioral (phối hợp). Mỗi pattern nêu một chỗ có sẵn trong .NET: Factory là `IHttpClientFactory`, Decorator là `DelegatingHandler`, Chain of Responsibility là middleware pipeline, Template Method là `BackgroundService`. Xem [design pattern](#patterns).
:::

::: details Câu trả lời mẫu (English)
I think of patterns as names for arrangements I already use in .NET. Strategy is injecting several implementations of one interface, like payout methods for bank and PayPal. Factory is IHttpClientFactory. Decorator is a DelegatingHandler wrapping an HttpClient, or GZipStream wrapping a Stream. Chain of responsibility is the ASP.NET Core middleware pipeline. Template method is BackgroundService, where I only implement ExecuteAsync. And singleton today is usually AddSingleton in the container rather than a static Instance, so it stays injectable and testable.
:::

::: warning Bẫy & follow-up
**"Tại sao dùng Strategy thay vì if/else?"** Khi số nhánh tăng, mỗi nhánh cần test riêng và muốn thêm nhánh không sửa code cũ. 2–3 nhánh ổn định thì `switch` đơn giản hơn.

**"Singleton có nhược điểm gì?"** Global state: khó <T>mock</T>, ẩn dependency, phải thread-safe. Dùng `AddSingleton` thay static `Instance`.

**"Có nên viết Repository trên EF Core không?"** Trả lời theo trade-off, xem [khi nào không cần](#tradeoffs).
:::

### DRY, KISS, YAGNI {#dry-kiss-yagni}

::: tip Trả lời nhanh
**DRY**: mỗi kiến thức nghiệp vụ một chỗ. **KISS**: cách đơn giản nhất mà đủ đúng. **YAGNI**: không làm trước thứ chưa ai cần. Xem [DRY, KISS, YAGNI](#principles).
:::

::: details Câu trả lời mẫu (English)
DRY means every piece of business knowledge lives in one place, for example the rule that only approved payouts can be paid lives in Payout.MarkPaid, not in every page. KISS means picking the simplest design that is correct. YAGNI means not building things nobody needs yet. DRY is about knowledge, not identical-looking code: two similar blocks that change for different reasons should stay separate, because a wrong shared abstraction ends up full of flags.
:::

::: warning Bẫy & follow-up
**"DRY có lúc nào sai không?"** Có: gộp hai đoạn giống nhau nhưng đổi vì hai lý do khác nhau. Lặp lại một chút rẻ hơn một abstraction sai.
:::


## Tự kiểm tra

1. Thêm kênh Wise: với code `switch` ở ba file, rủi ro là gì? Với `IPayoutMethod`, quên một method thì chuyện gì xảy ra?
2. Khi nào bạn **không** tạo interface cho một class?
