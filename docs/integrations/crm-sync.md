---
title: "Đồng bộ sang CRM qua queue"
---

# Đồng bộ sang CRM qua queue

Đội sales làm việc trên một <T>CRM</T> (HubSpot, Salesforce), còn dữ liệu thật nằm trong app nội bộ. **Đồng bộ một chiều** là đẩy dữ liệu từ app sang CRM (công ty, deal) để sales khỏi nhập hai lần. Trang này lấy HubSpot làm ví dụ, nhưng mẫu và bẫy áp dụng cho mọi API bên ngoài: lưu nội bộ trước rồi đồng bộ qua queue, giữ ID của bên kia, đọc body lỗi, và các bẫy dữ liệu (dropdown, null, nhiều đường ghi, sai thứ tự).

Đọc trước: [Messaging](/architecture/messaging) (queue, retry, idempotent). Con số rate limit của HubSpot đổi theo gói và theo thời gian, kiểm tra tài liệu hiện hành.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="crInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="crBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 300" role="img" aria-label="Bản đồ chủ đề. Luồng đọc 1 đến 4: user lưu vào DB nội bộ, đẩy item vào queue, worker gọi CRM, lưu CRM ID cạnh bản ghi. Bẫy đỏ: rollback local khi sync lỗi, dropdown thiếu option trả 400, đọc lỗi không có body, hai lần lưu đến sai thứ tự, nhiều màn hình cùng ghi một field.">
<a href="#save-first" style="text-decoration:none">
<rect class="box" x="20" y="40" width="150" height="100" rx="8"/>
<circle class="boxAcc" cx="36" cy="40" r="11"/><text x="36" y="44.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">1</text>
<path class="box" d="M75 64 V92 A20 5.5 0 0 0 115 92 V64"/><ellipse class="boxOk" cx="95" cy="64" rx="20" ry="5.5"/><path class="lnOk" d="M86 80 l6 6 l11 -12"/>
<text x="95" y="126" font-size="11.5" text-anchor="middle">Lưu nội bộ trước</text>
</a>
<line class="ln" x1="170" y1="90" x2="191" y2="90" marker-end="url(#crInk)"/>
<a href="#save-first" style="text-decoration:none">
<rect class="box" x="195" y="40" width="150" height="100" rx="8"/>
<circle class="boxAcc" cx="211" cy="40" r="11"/><text x="211" y="44.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">2</text>
<rect class="box" x="230" y="70" width="80" height="26" rx="4"/><rect class="boxAcc" x="236" y="75" width="14" height="16" rx="2"/><rect class="boxAcc" x="254" y="75" width="14" height="16" rx="2"/><rect class="box" x="272" y="75" width="14" height="16" rx="2"/>
<text x="270" y="126" font-size="11.5" text-anchor="middle">Đẩy item vào queue</text>
</a>
<line class="ln" x1="345" y1="90" x2="366" y2="90" marker-end="url(#crInk)"/>
<a href="#errors" style="text-decoration:none">
<rect class="boxAcc" x="370" y="40" width="150" height="100" rx="8"/>
<circle class="boxAcc" cx="386" cy="40" r="11"/><text x="386" y="44.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">3</text>
<circle class="box" cx="425" cy="80" r="14"/><path class="ln" d="M425 70 v10 l7 5"/>
<line class="ln" x1="442" y1="80" x2="470" y2="80" marker-end="url(#crInk)"/><text x="490" y="84" font-size="11" font-weight="600" class="mono">CRM</text>
<text x="445" y="126" font-size="11.5" text-anchor="middle">Worker gọi CRM</text>
</a>
<line class="ln" x1="520" y1="90" x2="541" y2="90" marker-end="url(#crInk)"/>
<a href="#crm-id" style="text-decoration:none">
<rect class="box" x="545" y="40" width="150" height="100" rx="8"/>
<circle class="boxAcc" cx="561" cy="40" r="11"/><text x="561" y="44.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">4</text>
<rect class="box" x="575" y="66" width="90" height="34" rx="4"/><line class="lnMuted" x1="620" y1="66" x2="620" y2="100"/>
<text x="597" y="88" font-size="10" text-anchor="middle" class="mono muted">Id</text><text x="642" y="88" font-size="10" text-anchor="middle" class="mono accT">CrmId</text>
<text x="620" y="126" font-size="11.5" text-anchor="middle">Giữ ID bên kia</text>
</a>
<a href="#save-first" style="text-decoration:none"><circle class="dotBad" cx="28" cy="158" r="4"/><text x="37" y="162" font-size="11" class="badT">sync lỗi ≠ rollback local</text></a>
<a href="#errors" style="text-decoration:none"><circle class="dotBad" cx="378" cy="158" r="4"/><text x="387" y="162" font-size="11" class="badT">"(400) Bad Request" không body</text></a>
<!-- data traps row -->
<a href="#enum-options" style="text-decoration:none">
<rect class="box" x="20" y="195" width="215" height="80" rx="8"/>
<rect class="box" x="40" y="212" width="70" height="18" rx="3"/><path class="ln" d="M100 219 l4 4 l4 -4"/>
<line class="lnBad" x1="120" y1="221" x2="150" y2="221" marker-end="url(#crBad)"/><text x="170" y="225" font-size="12" font-weight="700" class="badT">400</text>
<text x="127" y="262" font-size="11.5" text-anchor="middle">Dropdown thiếu option</text>
</a>
<a href="#ordering" style="text-decoration:none">
<rect class="box" x="252" y="195" width="215" height="80" rx="8"/>
<rect class="box" x="275" y="210" width="22" height="18" rx="3"/><text x="286" y="223" font-size="10" text-anchor="middle" class="mono">A</text>
<rect class="box" x="305" y="210" width="22" height="18" rx="3"/><text x="316" y="223" font-size="10" text-anchor="middle" class="mono">B</text>
<path class="lnBad" d="M327 219 C 360 205, 380 205, 400 214" marker-end="url(#crBad)"/><path class="ln" d="M297 228 C 340 245, 380 245, 400 226" marker-end="url(#crInk)"/>
<text x="425" y="224" font-size="10" class="mono badT">A?</text>
<text x="360" y="262" font-size="11.5" text-anchor="middle">Đến sai thứ tự</text>
</a>
<a href="#write-paths" style="text-decoration:none">
<rect class="box" x="485" y="195" width="215" height="80" rx="8"/>
<rect class="box" x="505" y="206" width="26" height="14" rx="2"/><rect class="box" x="505" y="226" width="26" height="14" rx="2"/><rect class="boxBad dash" x="505" y="246" width="26" height="0.1"/>
<line class="ln" x1="531" y1="213" x2="590" y2="225" marker-end="url(#crInk)"/><line class="ln" x1="531" y1="233" x2="590" y2="229" marker-end="url(#crInk)"/>
<rect class="boxAcc" x="595" y="218" width="40" height="18" rx="3"/><text x="615" y="231" font-size="10" text-anchor="middle" class="mono">field</text>
<text x="592" y="262" font-size="11.5" text-anchor="middle">Nhiều đường ghi</text>
</a>
</svg>
<p class="fig-caption">Hàng trên đọc 1 đến 4; hàng dưới là ba bẫy dữ liệu. Tự hỏi: vì sao không rollback bản ghi nội bộ khi gọi CRM lỗi? Thêm một gói dịch vụ mới vào app thì việc gì phải làm bên CRM trước khi release?</p>
</div>

## 1. Vấn đề: gọi thẳng CRM trong request của user {#problem}

Cách viết đầu tiên thường là gọi CRM ngay trong action lưu dữ liệu:

```csharp
db.Companies.Update(company);
await db.SaveChangesAsync();
await hubspot.UpdateCompanyAsync(company);   // CRM chậm hoặc lỗi thì sao?
```

Vì hai hệ thống không chung transaction, dòng thứ ba hỏng thì có hai lựa chọn đều tệ: báo lỗi cho user dù dữ liệu đã lưu, hoặc rollback dữ liệu của user chỉ vì CRM đang bảo trì. Thêm nữa, request của user giờ chậm theo CRM và chết theo rate limit của CRM.

## 2. Lưu nội bộ trước, đồng bộ qua queue {#save-first}

**Code nghiệp vụ không gọi CRM; nó đẩy một item "cần đồng bộ company 42" vào queue, worker xử lý sau.** Từ một quyết định đó suy ra mọi hệ quả:

- Lỗi CRM không làm hỏng thao tác của user. Dữ liệu nội bộ là nguồn sự thật; CRM là bản sao trễ vài giây.
- Vì thao tác nội bộ **đã commit**, sync lỗi thì không rollback local. Cần một đường báo lỗi (dead-letter, bảng lỗi, alert) để sửa hoặc chạy lại.
- Worker không chạy thì CRM không nhận gì, mà không ai thấy lỗi. Khi test "sao HubSpot không đổi", kiểm worker đang chạy trước.
- Đẩy item vào queue và lưu DB vẫn là hai hệ thống; muốn không mất item thì dùng [Outbox](/architecture/messaging#outbox).

Item nên mang **ID** ("company 42") chứ không mang cả dữ liệu. Worker đọc trạng thái mới nhất từ DB lúc xử lý, nên hai item cho cùng company luôn gửi đi giá trị mới nhất. Điều này chữa luôn một nửa bẫy [sai thứ tự](#ordering).

## 3. Giữ ID của bên kia {#crm-id}

**Mỗi object trong CRM có ID riêng; không lưu nó thì lần sau chỉ tạo mới được, không update được.** Vì vậy:

- Lưu `HubSpotCompanyId`, `HubSpotDealId` cạnh bản ghi nội bộ ngay khi tạo thành công. Lần sau thấy có ID thì update, chưa có thì tạo.
- Property gửi lên dùng **internal name** (`annual_revenue`), không dùng label hiển thị ("Annual Revenue"): label do admin CRM đổi được bất cứ lúc nào.
- **Owner** (người phụ trách) là ID owner của HubSpot, không phải user ID của app. Cần bảng map.
- Deal thuộc một **pipeline** và một **stage**, mỗi cái có ID riêng. Deal tạo vào pipeline không mặc định thì **không hiện ở board mặc định**; khi test, tìm theo deal ID.

## 4. Đọc body lỗi {#errors}

**Lý do thật của một lỗi HTTP nằm trong response body, không nằm ở status code.** HubSpot trả JSON có `message`, `category`, `correlationId` và lỗi theo từng field. Nhưng `HttpWebRequest` (.NET Framework) ném `WebException` với message chỉ có "(400) Bad Request", và `EnsureSuccessStatusCode()` của `HttpClient` cũng vứt body đi. Phải tự đọc:

```csharp
var res = await http.PatchAsJsonAsync(url, payload, ct);
if (!res.IsSuccessStatusCode)
{
    var body = await res.Content.ReadAsStringAsync(ct);
    throw new CrmSyncException($"HubSpot {(int)res.StatusCode}: {body}");
}
```

Log luôn `correlationId`: support của nhà cung cấp tra lỗi bằng nó.

Rate limit: HubSpot giới hạn theo khoảng ngắn (burst) và theo ngày, vượt thì `429`. Batch API có trần số bản ghi mỗi request (từng là 100). Job đồng bộ hàng loạt ban đêm nên giới hạn số bản ghi mỗi batch, backoff khi `429`, và ghi lại bản ghi lỗi để chạy lại.

## 5. Bẫy dữ liệu {#data-traps}

### Dropdown thiếu option trả 400 {#enum-options}

**Property dạng enumeration (dropdown) của CRM chỉ nhận giá trị đã có trong danh sách option.** App thêm một gói dịch vụ mới mà CRM chưa có option tương ứng thì **mọi** lần sync có field đó đều trả 400.

- Thêm option (bằng tay hoặc API cập nhật property) **trước khi** release. Đưa vào checklist release cho mọi enum phía app có map sang CRM.
- Cùng một khái niệm nằm ở company và ở deal là **hai property khác nhau**, hai danh sách option khác nhau, phải thêm cả hai.
- Code thêm option qua API nên có whitelist property được phép và ném lỗi rõ cho property lạ, đừng viết hàm nhận tên property tuỳ ý.

### Null và xoá giá trị {#nulls}

Đọc `.Value` của một nullable khi bản ghi chưa có giá trị (chưa chọn gói) sẽ ném exception và làm hỏng cả lần sync. Quyết định rõ cho từng field: bỏ qua, gửi chuỗi rỗng, hay chặn từ nguồn. Muốn **xoá** giá trị trên HubSpot thì gửi chuỗi rỗng; gửi `null` thường bị bỏ qua.

### Đến sai thứ tự {#ordering}

**Queue không đảm bảo hai item cho cùng một bản ghi được xử lý đúng thứ tự** khi có nhiều worker hoặc có retry. Hai lần lưu gần nhau tới CRM ngược thứ tự thì <T>last write wins</T> ghi giá trị cũ đè giá trị mới. Hai cách chữa đã có ở trên: item chỉ mang ID và worker đọc trạng thái mới nhất; hoặc chia queue theo khoá (ví dụ theo company) để một company luôn được một worker xử lý tuần tự.

Một biến thể khó thấy: sync lấy số liệu từ một **job khác** (ví dụ cache báo cáo chạy ban đêm). Hai job không có thứ tự bắt buộc, nên job cache chạy lâu hoặc lỗi thì sync gửi số cũ mà không báo gì.

### Nhiều đường ghi {#write-paths}

Một field (tên tổ chức) có thể được sửa từ màn admin, màn user, import file, API. Chỉ gắn "đẩy item sync" vào một đường thì CRM bị cũ mỗi khi sửa từ đường khác. **Trước khi làm sync, liệt kê hết đường ghi** của mỗi field; tốt hơn là đặt việc đẩy item ở một chỗ mà mọi đường đều đi qua (method của entity, hoặc domain event, xem [DDD](/architecture/ddd)).

## 6. Quy tắc sinh dữ liệu cho sales {#business-rules}

Tên deal có cấu trúc (`<Khách> - <Loại> - <Gói>`) giúp sales tìm và lọc. **Loại deal** sinh từ một quy tắc có thứ tự, và thứ tự đó phải viết rõ vì nó là logic nghiệp vụ:

1. Nâng cấp: gói mới có bậc cao hơn.
2. Hạ cấp: bậc thấp hơn.
3. Giữ chân (retention): cùng bậc nhưng phí tháng thấp hơn.
4. Còn lại: gia hạn (renewal).

Điểm cần chốt với business: thêm một gói vào giữa thang bậc thì mọi chuyển đổi từ và sang gói đó đổi loại theo số bậc. Hỏi sales có hiểu đúng như vậy không trước khi code.

## 7. Biến thể và trade-off {#trade-offs}

- **Gọi thẳng trong request** chấp nhận được khi user cần thấy kết quả CRM ngay và lỗi thì cho user thử lại. Vì nó buộc hai hệ thống sống chết cùng nhau, hiếm khi đáng.
- **Item mang ID** thay vì dữ liệu: đúng thứ tự tự nhiên, nhưng mỗi item tốn một lần đọc DB. Dữ liệu cần đúng "tại thời điểm" (một snapshot hoá đơn) thì phải mang dữ liệu.
- **Đồng bộ hai chiều** (sales sửa trên CRM, app nhận lại qua webhook) khó hơn nhiều: cần quyết định field nào ai làm chủ, nếu không hai bên ghi đè nhau mãi. Bắt đầu một chiều.
- **iPaaS** (Zapier, Make, connector có sẵn của CRM) đủ cho đồng bộ đơn giản; tự viết khi có quy tắc nghiệp vụ như [loại deal](#business-rules).

Checklist:

- [ ] Lưu CRM ID cạnh bản ghi nội bộ; dùng internal name của property
- [ ] Mọi enum phía app map sang dropdown CRM đã có option trước release
- [ ] Đọc và log body lỗi kèm `correlationId`
- [ ] Biết deal rơi vào pipeline và stage nào
- [ ] Liệt kê đủ đường ghi cho mỗi field được sync
- [ ] Sync lỗi có đường báo và chạy lại, không rollback local
- [ ] Xử lý null và xoá giá trị
- [ ] Test an toàn: portal sandbox, hoặc bản ghi test tìm theo ID

## Câu hỏi phỏng vấn {#interview}

### Đồng bộ dữ liệu sang một hệ thống bên ngoài, bạn thiết kế thế nào? <Badge type="warning" text="câu senior" /> {#design-sync}

::: tip Trả lời nhanh
Lưu nội bộ trước (nguồn sự thật), đẩy item mang **ID** vào queue qua outbox, worker đọc trạng thái mới nhất rồi gọi API ngoài, lưu ID bên kia để update lần sau. Lỗi thì retry có backoff rồi dead-letter, **không rollback local**. Xem [Lưu nội bộ trước](#save-first).
:::

::: details Câu trả lời mẫu (English)
- Our DB is the source of truth; the external system is an eventually consistent copy.
- Business code enqueues "sync company 42" (via an outbox so it's not lost); a worker reads the latest state and calls the API.
- Store the external ID next to our record so later syncs update instead of creating duplicates.
- Failures: read the error body, retry with backoff on 429/5xx, dead-letter the rest with an alert. Never roll back the user's change because sync failed.
- Watch for ordering (carry IDs, not payloads) and for every code path that writes a synced field.
:::

::: warning Bẫy & follow-up
- "Bọc cả hai trong một transaction": không có transaction chung giữa DB và HTTP API. Nói [dual write](/architecture/messaging#dual-write).
- Follow-up: "Hai lần lưu đến sai thứ tự?" Item mang ID, hoặc chia queue theo khoá.
- Follow-up: "Release thêm một gói mới thì sync vỡ toàn bộ, vì sao?" [Dropdown thiếu option](#enum-options).
:::

## Tự kiểm tra {#self-check}

1. Worker sync báo lỗi "(400) Bad Request" và không gì hơn. Bạn sửa code thế nào để biết lý do?
2. Vì sao item trong queue nên mang "company 42" thay vì toàn bộ dữ liệu company? Khi nào thì ngược lại?
3. Sales nói deal mới không thấy trên HubSpot dù log báo tạo thành công. Bạn kiểm gì đầu tiên?
4. Thêm gói "Pro Plus" vào app, ngày release mọi lần sync company đều lỗi. Vì sao, và ngăn lần sau bằng gì?
5. Tên tổ chức trên CRM cứ bị cũ dù sync chạy tốt. Bạn tìm nguyên nhân ở đâu?
