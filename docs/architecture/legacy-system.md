---
title: "Hệ thống legacy nhiều host: đọc, gia cố, migrate"
---

# Hệ thống legacy nhiều host: đọc, gia cố, migrate

Rất nhiều hệ thống .NET đang tạo doanh thu có cùng một hình dạng: một dashboard <T>WebForms</T>, một Web API 2, vài endpoint chịu tải cao, vài Windows Service xử lý hàng đợi <T>MSMQ</T>, một console app chạy theo lịch, và **một shared library khổng lồ** mà mọi host cùng dùng. Trang này mô tả kiểu hệ thống đó như một bản mẫu: request đi qua đâu, thiết kế nào đáng giữ, điểm yếu nào là rủi ro thật (mất message, `BinaryFormatter`), cái gì sửa được ngay khi vẫn ở .NET Framework 4.8, và nếu migrate thì chọn gì cho từng thành phần, vì sao.

Đọc kèm: [.NET Framework vs .NET](/dotnet/framework-vs-core) cho chiến lược strangler fig và chạy song song, [Messaging](/architecture/messaging) cho queue bền, retry, dead-letter, [LINQ to SQL](/data/linq-to-sql) cho tầng dữ liệu.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="lgInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="lgBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 400" role="img" aria-label="Bản đồ chủ đề. Hàng trên: bốn host là dashboard WebForms, API, tracking endpoint, scheduler CLI, cùng trỏ xuống một shared library lớn. Shared library nối SQL Server và MSMQ cục bộ; MSMQ đẩy sang các Windows Service. Bẫy đỏ: message mất khi lỗi, BinaryFormatter, queue cục bộ buộc web và worker cùng máy, mỗi queue xử lý tuần tự, lỗi chỉ báo qua email. Bên phải: gia cố tại chỗ, migrate từng thành phần.">
<!-- hosts -->
<a href="#dashboard" style="text-decoration:none"><rect class="box" x="20" y="20" width="110" height="52" rx="6"/><text x="75" y="42" font-size="11" text-anchor="middle" font-weight="600">Dashboard</text><text x="75" y="58" font-size="9.5" text-anchor="middle" class="muted">WebForms</text></a>
<a href="#api" style="text-decoration:none"><rect class="box" x="145" y="20" width="110" height="52" rx="6"/><text x="200" y="42" font-size="11" text-anchor="middle" font-weight="600">API</text><text x="200" y="58" font-size="9.5" text-anchor="middle" class="muted">Web API 2</text></a>
<a href="#hot-path" style="text-decoration:none"><rect class="boxAcc" x="270" y="20" width="110" height="52" rx="6"/><text x="325" y="42" font-size="11" text-anchor="middle" font-weight="600">Endpoint nóng</text><text x="325" y="58" font-size="9.5" text-anchor="middle" class="muted">validate + queue</text></a>
<a href="#background" style="text-decoration:none"><rect class="box" x="395" y="20" width="90" height="52" rx="6"/><text x="440" y="42" font-size="11" text-anchor="middle" font-weight="600">CLI</text><text x="440" y="58" font-size="9.5" text-anchor="middle" class="muted">theo lịch</text></a>
<line class="ln" x1="75" y1="72" x2="200" y2="112" marker-end="url(#lgInk)"/><line class="ln" x1="200" y1="72" x2="230" y2="112" marker-end="url(#lgInk)"/><line class="ln" x1="325" y1="72" x2="270" y2="112" marker-end="url(#lgInk)"/><line class="ln" x1="440" y1="72" x2="310" y2="112" marker-end="url(#lgInk)"/>
<!-- shared lib -->
<a href="#problem" style="text-decoration:none">
<rect class="box" x="60" y="116" width="400" height="56" rx="8" stroke-width="3"/>
<g class="lnMuted"><line x1="90" y1="132" x2="200" y2="132"/><line x1="90" y1="144" x2="260" y2="144"/><line x1="90" y1="156" x2="230" y2="156"/><line x1="280" y1="132" x2="430" y2="132"/><line x1="280" y1="144" x2="400" y2="144"/><line x1="280" y1="156" x2="420" y2="156"/></g>
<text x="260" y="190" font-size="11.5" text-anchor="middle">Shared library: nghiệp vụ + DAL + UI + bot</text>
</a>
<!-- db and queue -->
<line class="ln" x1="150" y1="198" x2="120" y2="228" marker-end="url(#lgInk)"/><line class="ln" x1="370" y1="198" x2="370" y2="228" marker-end="url(#lgInk)"/>
<path class="box" d="M90 236 V268 A30 7 0 0 0 150 268 V236"/><ellipse class="box" cx="120" cy="236" rx="30" ry="7"/>
<text x="120" y="296" font-size="11" text-anchor="middle">SQL Server</text>
<a href="#queue" style="text-decoration:none">
<rect class="box" x="320" y="232" width="100" height="36" rx="5"/><rect class="boxAcc" x="330" y="240" width="16" height="20" rx="2"/><rect class="boxAcc" x="352" y="240" width="16" height="20" rx="2"/><rect class="box" x="374" y="240" width="16" height="20" rx="2"/>
<text x="370" y="286" font-size="10" text-anchor="middle" class="mono muted">.\Private$</text>
</a>
<line class="ln" x1="420" y1="250" x2="470" y2="250" marker-end="url(#lgInk)"/>
<a href="#background" style="text-decoration:none"><rect class="box" x="474" y="228" width="96" height="44" rx="6"/><text x="522" y="248" font-size="10.5" text-anchor="middle">Windows</text><text x="522" y="262" font-size="10.5" text-anchor="middle">Service</text></a>
<!-- traps -->
<a href="#queue" style="text-decoration:none"><circle class="dotBad" cx="28" cy="322" r="4"/><text x="37" y="326" font-size="11" class="badT">lỗi = mất message</text></a>
<a href="#binaryformatter" style="text-decoration:none"><circle class="dotBad" cx="168" cy="322" r="4"/><text x="177" y="326" font-size="11" class="badT">BinaryFormatter</text></a>
<a href="#local-queue" style="text-decoration:none"><circle class="dotBad" cx="298" cy="322" r="4"/><text x="307" y="326" font-size="11" class="badT">web và worker cùng máy</text></a>
<a href="#local-queue" style="text-decoration:none"><circle class="dotBad" cx="28" cy="348" r="4"/><text x="37" y="352" font-size="11" class="badT">mỗi queue một message một lúc</text></a>
<a href="#observability" style="text-decoration:none"><circle class="dotBad" cx="298" cy="348" r="4"/><text x="307" y="352" font-size="11" class="badT">lỗi chỉ báo qua email</text></a>
<!-- right column -->
<a href="#prepare" style="text-decoration:none">
<rect class="boxOk" x="590" y="20" width="110" height="150" rx="8" fill-opacity="0.2"/>
<path class="ln" d="M625 70 l20 -20 l12 12 l-20 20 z"/><line class="ln" x1="625" y1="70" x2="615" y2="95"/>
<text x="645" y="120" font-size="11" text-anchor="middle">Gia cố tại chỗ</text><text x="645" y="136" font-size="9.5" text-anchor="middle" class="muted">vẫn .NET 4.8</text>
</a>
<a href="#migrate" style="text-decoration:none">
<rect class="boxAcc" x="590" y="190" width="110" height="170" rx="8"/>
<rect class="box" x="605" y="215" width="34" height="50" rx="4"/><rect class="boxAcc" x="651" y="215" width="34" height="50" rx="4"/>
<path class="ln" d="M639 240 h10" marker-end="url(#lgInk)"/>
<text x="645" y="292" font-size="11" text-anchor="middle">Migrate từng</text><text x="645" y="308" font-size="11" text-anchor="middle">thành phần</text><text x="645" y="326" font-size="9.5" text-anchor="middle" class="muted">strangler + YARP</text>
</a>
</svg>
<p class="fig-caption">Trái: hình dạng hệ thống, bẫy đỏ ở dưới. Phải: hai hướng xử lý, gia cố trước rồi migrate. Tự hỏi: vì sao một lỗi DB timeout trong worker có thể làm mất hẳn một giao dịch? Vì sao queue có đường dẫn <code>.\Private$</code> buộc web server và worker phải cùng máy?</p>
</div>

## 1. Vấn đề: một khối mà ai cũng phụ thuộc {#problem}

**Mọi host (web, API, endpoint nóng, worker, CLI) dùng chung một shared library.** Đó là điểm mạnh lẫn điểm yếu lớn nhất, và hầu hết các mục sau suy ra từ nó:

- Logic nghiệp vụ chỉ có một nơi, nên các host không bao giờ tính khác nhau.
- Nhưng mọi thay đổi nhỏ build lại toàn bộ và deploy lại mọi host.
- Khó test từng phần, vì mọi thứ nối thẳng vào DAL cụ thể và `ConfigurationManager`.
- Khó chuyển dần sang .NET mới, vì một dependency cũ (LINQ to SQL, MSMQ) kéo theo cả thư viện.
- Thư viện thường phình ra chứa cả thứ không phải nghiệp vụ: template, layout engine, helper UI, bot, chatbot.

## 2. Request đi qua những đâu {#request-flow}

### Một trang dashboard {#dashboard}

```text
IIS
 -> Global.asax              (đăng ký bundle CSS/JS)
 -> Session module           (session lưu SQL Server)
 -> Master page theo role    (Page_Init chạy trước mọi trang con)
      1. Có user id trong session không? Không thì redirect đăng nhập
      2. Đọc user trong DB, so token mật khẩu với token trong session
      3. Lấy id tài khoản từ URL (/Owner/{id}/...), kiểm user có thuộc tài khoản đó, nạp bitmask quyền
      4. Dựng menu theo quyền
 -> Page (code-behind)       LINQ to SQL hoặc SQL thô, đọc thẳng web control, gọi Handler trong shared library
 -> Render HTML (hoặc UpdatePanel trả một phần)
```

Ba điều cần nhớ khi đọc code kiểu này:

1. **Kiểm đăng nhập và quyền nằm ở master page**, không ở từng trang. Trang con được miễn phí, nhưng trang **nằm ngoài** master page (callback, endpoint đặc biệt) phải tự lo, và đó là chỗ hay sót.
2. Quyền là enum **bit flag**. Hàm kiểm tra nên ném lỗi khi nhận giá trị 0, vì gộp quyền bằng `&` thay vì `|` cho ra 0 và "không cần quyền gì" luôn đúng.
3. Trang gần như không tách tầng: truy vấn, nghiệp vụ, hiển thị chung một code-behind hàng nghìn dòng. Nghiệp vụ dùng lại nằm trong lớp Handler. Đổi mật khẩu ở nơi khác làm token trong session lệch, nên phiên cũ tự mất hiệu lực: một thiết kế đáng giữ.

### Một lời gọi API {#api}

Web API 2 với controller selector tự viết (chọn controller theo role và phiên bản), formatter JSON tự viết, exception filter tự viết, rồi gọi Handler trong shared library. **Mỗi phiên bản (v1, v1.1) và mỗi role có bộ controller và model riêng.** Thêm một field phải sửa nhiều chỗ, nhưng chính cách tách đó giữ hợp đồng cũ không đổi với khách bên ngoài; khi migrate phải giữ điều này (contract test).

### Endpoint nóng: chỉ validate rồi xếp hàng {#hot-path}

**Endpoint chịu tải cao nhất (click, pixel, webhook) không làm việc nặng trong request**: kiểm đầu vào, lọc bot, đẩy một item vào queue, trả ngay. Việc nặng (ghi giao dịch, tính tiền) làm ở worker. Đây là thiết kế đúng, cùng nguyên lý với [ack nhanh ở callback](/integrations/interactive-notifications#ack). Chi tiết luồng tracking: [Tracking pixel](/web/tracking-pixel#pixel-server).

Queue cho luồng nóng được **chia theo khoá** (account id mod N chọn queue): vừa xử lý song song giữa các account, vừa giữ thứ tự trong một account. Webhook của nền tảng ngoài cũng vậy, kèm lợi ích cô lập tải: nền tảng đó bùng traffic thì không chặn việc khác.

### Việc nền: service item {#background}

```text
Web / API / Worker
  -> QueueServiceItem(item)
       1. Serialize bằng BinaryFormatter
       2. Vượt ngưỡng kích thước: lưu nội dung vào bảng "oversized", chỉ gửi item nhỏ chứa id
       3. Gửi vào MSMQ private queue của máy hiện tại, tên queue theo loại item
  -> Windows Service (mỗi queue một vòng BeginReceive)
       nhận message -> item.Process()
       lỗi: bắt exception, gửi email cho dev, nhận message kế tiếp
```

Mỗi service item là một class có `Process()`, `Type` (vào queue nào) và `Priority`: ghi giao dịch, gửi notification, đồng bộ CRM, tạo hoá đơn, đẩy dữ liệu sang kho hằng đêm. Console app theo lịch (Task Scheduler gọi với tham số như "process billing") chỉ đẩy item tương ứng vào queue; **lịch nằm ngoài code** nên không thấy trong repo.

## 3. Thiết kế đáng giữ {#good-parts}

Những điểm sau đúng và nên mang sang hệ thống mới:

- Endpoint nóng chỉ validate rồi xếp hàng; chia queue theo khoá để vừa song song vừa giữ thứ tự.
- Cô lập tải: luồng nóng, mail, webhook ngoài có service riêng.
- Message quá lớn: lưu nội dung vào DB, gửi tham chiếu (claim-check pattern).
- Connection string chỉ đọc riêng cho báo cáo và chatbot.
- Hash mật khẩu **có version** và tự nâng cấp lên thuật toán mạnh hơn khi user đăng nhập; có throttle đăng nhập và TOTP.
- Phiên bản API tách bạch, giữ hợp đồng cũ.
- Service có chế độ chạy console (`Environment.UserInteractive`) để debug.
- Culture cố định ở entry point, tránh lỗi định dạng ngày và số theo máy.
- Endpoint đọc cấu hình theo account có cache vài phút.

## 4. Điểm yếu và cách chữa {#weak-parts}

### Hàng đợi không bền, lỗi là mất {#queue}

**MSMQ mặc định gửi message ở chế độ express: nằm trong bộ nhớ, mất khi dịch vụ MSMQ hoặc máy khởi động lại.** Chỉ khi đặt `Recoverable = true` (hoặc dùng queue transactional) message mới được ghi xuống đĩa. Phía nhận còn tệ hơn: `EndReceive` đã **lấy message khỏi queue** trước khi `Process()` chạy, nên `Process()` ném exception thì message không quay lại, chỉ còn email lỗi.

Hệ quả: một giao dịch hay một lần đồng bộ gặp lỗi tạm (DB timeout, API ngoài chập chờn) là mất hẳn, dữ liệu phải sửa tay. Đây đúng là vấn đề "đọc là mất việc" mà [PeekLock](/architecture/messaging#peek-lock) giải. Cách chữa, từ rẻ đến đắt:

1. `Recoverable = true` khi gửi, queue transactional, nhận và xử lý trong `MessageQueueTransaction`: lỗi thì rollback, message quay lại.
2. Retry có giới hạn (3 lần, backoff), quá thì chuyển sang queue lỗi để xem và chạy lại ([dead-letter](/architecture/messaging#dead-letter)).
3. Làm `Process()` idempotent, vì có retry là có thể chạy hai lần ([idempotent consumer](/architecture/messaging#idempotent-consumer)).
4. Dài hạn: broker có sẵn retry và dead-letter ([mục migrate](#migrate)).

### BinaryFormatter {#binaryformatter}

**<T>BinaryFormatter</T> đọc tên type từ chính payload rồi dựng object đó, nên payload độc có thể khiến deserialize chạy mã tuỳ ý.** Microsoft coi nó không an toàn với dữ liệu không tin cậy và đã loại khỏi .NET 9. Với queue nội bộ, bề mặt tấn công là bất kỳ tiến trình nào có quyền ghi vào queue. Thêm rủi ro version: đổi hình dạng class trong khi queue còn message cũ thì deserialize lỗi.

Chữa: serialize DTO bằng JSON (thường Newtonsoft đã có sẵn) kèm trường `version`, siết quyền ghi queue chỉ cho tài khoản cần dùng. Đây là điều kiện bắt buộc trước khi lên .NET 9 trở lên.

### Queue cục bộ và xử lý tuần tự {#local-queue}

**Đường dẫn `.\Private$\...` nghĩa là queue trên chính máy đó**, nên web server nào gửi thì gửi vào MSMQ của chính nó, và worker phải chạy cùng máy. Hệ quả: không nhân web server thành nhiều máy dùng chung một nhóm worker được, trừ khi máy nào cũng có đủ worker.

Mỗi queue chỉ có một vòng nhận (xử lý xong mới `BeginReceive` tiếp), nên một item chậm (gọi API ngoài vài chục giây) chặn mọi item sau nó trong cùng queue. Giảm bằng nhiều queue theo loại, nhiều consumer song song cho queue đông, hoặc broker có concurrency và prefetch.

### Quan sát hệ thống {#observability}

**Lỗi chỉ đi qua email cho dev**, không có log có cấu trúc, metric hay tracing. Với ba tầng (web, queue, worker) và việc chạy bất đồng bộ, câu "item này vào queue chưa, xử lý chưa, lỗi gì" gần như không trả lời được. Chữa: log có cấu trúc (`ILogger` hoặc Serilog) kèm **correlation id đi theo item** từ request tới worker, đẩy vào nơi tìm được (Application Insights, Seq), thêm metric độ sâu queue và thời gian xử lý mỗi loại item ([Logging](/aspnet-core/logging)).

### Điểm nóng hiệu năng và SQL thô {#hotspots}

- Master page đọc bảng user **mỗi request** để so token: cache vài chục giây theo user id, hoặc đặt token vào cookie đã ký.
- Endpoint nóng truy vấn DB mỗi request trong khi endpoint tương tự đã cache: áp cùng cách, vô hiệu khi đổi trạng thái.
- Throttle đăng nhập trong `HashSet` tĩnh: mất khi restart, không dùng chung giữa nhiều tiến trình. Ổn với một máy, sai khi nhân bản.
- SQL thô trong code-behind có tham số hoá, nhưng **điều kiện lọc động và hướng sắp xếp** hay được ghép chuỗi theo web control. Rà bằng phân tích tĩnh (tìm `ExecuteQuery(` với chuỗi được ghép), đưa truy vấn lặp lại vào một lớp riêng có test.

## 5. Gia cố khi vẫn ở .NET Framework 4.8 {#prepare}

**Các việc sau không phụ thuộc quyết định migrate, và việc nào cũng làm migrate dễ hơn về sau:**

| Việc | Công cụ | Lợi ích |
|---|---|---|
| JSON thay BinaryFormatter cho service item | Newtonsoft.Json | Bỏ rủi ro bảo mật, điều kiện cho .NET 9+ |
| Queue bền, retry, queue lỗi | `Recoverable`, `MessageQueueTransaction` | Không mất giao dịch |
| Log có cấu trúc + correlation id | `ILogger`/Serilog + App Insights/Seq | Truy vết từ request tới worker |
| Cache truy vấn nóng | `MemoryCache` | Giảm tải DB |
| Tách shared library thành vài project (lõi nghiệp vụ, data, tích hợp ngoài, UI helper, bot) | Di chuyển file, sửa namespace, không đổi hành vi | Điều kiện để multi-target |
| Bọc truy cập dữ liệu sau interface hẹp cho truy vấn lặp lại | Tự viết | Đổi LINQ to SQL sang EF Core không đụng nghiệp vụ |
| Đưa nghiệp vụ ra khỏi code-behind sang Handler, khi chạm vào trang | Refactor dần | Test được, dùng lại khi viết trang mới |
| <T>Characterization test</T> cho luồng tiền (ghi công, hoá đơn, billing) | xUnit/NUnit + DB test | Lưới an toàn cho migrate |
| Secret ra khỏi file cấu hình | Azure Key Vault | An toàn hơn |

Tách shared library là bước **rẻ nhất mà giá trị nhất**: chỉ di chuyển file, nhưng mở đường cho mọi pha sau. Thiếu test là **rủi ro lớn nhất** của migrate: không có lưới thì không biết sau khi chuyển hành vi còn đúng không.

## 6. Migrate: chọn gì cho từng thành phần {#migrate}

**.NET Framework 4.8 vẫn được hỗ trợ như một phần của Windows, nên không có hạn chót cứng.** Lý do thật để migrate: SDK mới (Azure, bot, AI) dần chỉ nhắm .NET hiện đại; `BinaryFormatter` bị loại từ .NET 9; Linux và container rẻ hơn; khó tuyển người; LINQ to SQL và WebForms không có tương lai. Đích nên chọn là **.NET 10 (LTS)**, phát hành 11/2025, hỗ trợ tới 11/2028; .NET 8 và .NET 9 cùng hết hỗ trợ ngày 10/11/2026 nên không chọn làm đích.

Chiến lược là **strangler fig**, không viết lại một lần: app ASP.NET Core mới đứng trước với <T>YARP</T>, route đã chuyển xử lý ở app mới, route chưa chuyển proxy về app cũ, System.Web adapters chia session và auth trong giai đoạn chuyển tiếp. Chi tiết và hình: [Vì sao strangler fig](/dotnet/framework-vs-core#why-strangler), [chạy song song](/dotnet/framework-vs-core#side-by-side). ASP.NET Core không hỗ trợ mô hình WebForms, nên giao diện phải **viết lại**, không "convert" được.

| Thành phần | Hiện tại | Chọn | Vì sao | Cân nhắc khác |
|---|---|---|---|---|
| Dữ liệu | LINQ to SQL | EF Core cho entity và CRUD; Dapper hoặc `FromSql` cho báo cáo nặng và SQL thô | EF Core là chuẩn, scaffold được từ DB có sẵn; SQL thô sẵn có chuyển sang Dapper ít phải viết lại | **linq2db**: API gần LINQ to SQL nhất, ít sửa query, nhưng hệ sinh thái nhỏ. Thử trên vài query thật ([LINQ to SQL lên EF Core](/data/linq-to-sql#migrate)) |
| Giao diện | WebForms | Razor Pages, Blazor cho phần tương tác phức tạp | Một trang một URL, PageModel tương ứng code-behind; phần lớn trang là bảng, form, báo cáo | MVC tương đương. SPA (Vue, React) chỉ khi cần trải nghiệm mà server-rendered không đáp ứng |
| API công khai | Web API 2 | ASP.NET Core controllers + Asp.Versioning | Giữ cấu trúc controller và hợp đồng v1, v1.1 | Minimal API nhẹ hơn nhưng đổi cách tổ chức |
| Endpoint nóng | Trang aspx không giao diện | Minimal API | Ít UI, cần độ trễ thấp; ứng viên chuyển **sớm nhất** | Chạy cạnh app cũ qua YARP |
| Hàng đợi | MSMQ + BinaryFormatter | Azure Service Bus (hoặc Storage Queue) + JSON | Có retry, dead-letter, concurrency, giám sát, không buộc web và worker cùng máy | Hangfire/Quartz (bền nhờ DB, không thêm hạ tầng), RabbitMQ, MassTransit/Wolverine ([Công cụ](/architecture/tooling)) |
| Worker | Windows Service | Worker Service (`BackgroundService`), vẫn chạy được như Windows Service | Mô hình host chuẩn, test được, chạy được trong container | |
| Lịch | Task Scheduler + CLI | Quartz.NET hoặc Hangfire | Lịch nằm trong code, có UI, có retry | Giữ Task Scheduler nếu đang ổn |
| Xác thực | Tự viết + session SQL | Cookie authentication; hash cũ bọc thành `IPasswordHasher` | Giữ hash cũ nên user không phải đặt lại mật khẩu | ASP.NET Core Identity nếu cần tính năng của nó |
| Phân quyền | Bit flag kiểm tay | Policy-based authorization, giữ enum quyền | Kiểm ở một chỗ thay vì rải trong trang ([Authorization](/aspnet-core/authorization)) | |
| Cấu hình | `ConfigurationManager` | `IConfiguration` + Key Vault | Chuẩn mới, tách secret | |
| Quan sát | Email lỗi | `ILogger` + OpenTelemetry | Trace xuyên request, queue, worker | |
| Bot Teams | Bot Framework | Teams SDK hoặc M365 Agents SDK | Bot Framework hết hỗ trợ ([Teams](/integrations/interactive-notifications#teams-sdk)) | |
| Chatbot | SDK trực tiếp, vòng lặp tự viết | `Microsoft.Extensions.AI` | Có sẵn vòng lặp tool, trần số vòng ([Thiết kế tool](/ai/llm-tools)) | |

### Thứ tự các pha {#phases}

| Pha | Việc | Xong khi |
|---|---|---|
| 0. Chuẩn bị | [Mục 5](#prepare) | Test xanh cho luồng tiền, queue không mất message |
| 1. Thư viện | Multi-target shared library (.NET Framework + .NET 10), hoặc tách lõi thành .NET Standard 2.0; gỡ LINQ to SQL và MSMQ khỏi lõi bằng interface | Lõi build được ở cả hai nền |
| 2. Dữ liệu | EF Core chạy cạnh LINQ to SQL trên cùng DB, chuyển từng module | Lõi không còn LINQ to SQL |
| 3. Cạnh biên | App Core + YARP; chuyển endpoint nóng trước, rồi API công khai (kiểm bằng contract test) | Endpoint nóng và API do app mới phục vụ |
| 4. Dashboard | Theo khu vực, bắt đầu từ khu vực ít trang và ít rủi ro; trang lớn tách nghiệp vụ trước khi viết lại | Mỗi khu vực xong thì bỏ route ở app cũ |
| 5. Nền | Worker sang Worker Service, queue sang broker, lịch sang Quartz/Hangfire | Tắt MSMQ |
| 6. Kết thúc | Tắt app .NET Framework, bỏ System.Web adapters | |

Pha 4 chiếm phần lớn công sức. Đừng ước lượng theo số dòng: lấy mẫu vài trang thuộc các cỡ khác nhau (nhỏ, vừa, lớn nhất), chuyển thử, đo thời gian thật, rồi nhân theo số trang mỗi cỡ.

### Rủi ro chính {#risks}

| Rủi ro | Giảm bằng |
|---|---|
| LINQ dịch khác nhau giữa LINQ to SQL và EF Core (null, chuỗi, thứ tự) | Characterization test, so kết quả hai bên trên cùng DB |
| Trang mới khác trang cũ ở chi tiết ngầm (ViewState, thứ tự sự kiện, encode HTML) | So ảnh chụp, kịch bản thủ công theo checklist |
| Mất hợp đồng API | Contract test từ phản hồi thật của API cũ, chạy song song |
| Mất message khi đổi queue | Chạy song song, cắt dần theo loại item, công cụ chạy lại item lỗi |
| Hai hệ thống cùng ghi một dữ liệu | Mỗi tính năng đúng một nơi sở hữu tại mỗi thời điểm, đổi chủ bằng cờ cấu hình |

## 7. Lần theo một request khi debug {#trace-request}

1. **Bắt đầu từ URL**: khu vực role nào, controller API nào (theo role và phiên bản), hay endpoint nóng nào.
2. **Đọc `Page_Init` của master page** tương ứng: ai được vào, tài khoản nào được nạp, quyền nào.
3. **Mở code-behind**: tìm truy vấn (LINQ hoặc `ExecuteQuery`), lời gọi Handler, chỗ đọc web control.
4. **Theo Handler** vào shared library để thấy nghiệp vụ thật.
5. **Gặp `QueueServiceItem`**: mở class item, xem `Type` (queue nào), `Process()`, và nhớ nó chạy ở **tiến trình khác, lúc khác**.
6. **Thấy mất dữ liệu**: kiểm email lỗi, queue còn message không, service có đang chạy không.

## Câu hỏi phỏng vấn {#interview}

### Hệ thống của bạn có điểm yếu kiến trúc nào, và bạn sẽ cải thiện gì trước? <Badge type="warning" text="câu senior" /> {#legacy-weaknesses}

::: tip Trả lời nhanh
Chọn theo **rủi ro dữ liệu** trước, công nghệ sau: queue không bền và lỗi là mất message (sửa: recoverable + transaction + retry + queue lỗi + idempotent), `BinaryFormatter` (sửa: JSON có version), không có log tập trung (sửa: log có cấu trúc + correlation id). Rồi mới tới tách shared library và characterization test để chuẩn bị migrate. Xem [Điểm yếu](#weak-parts) và [Gia cố](#prepare).
:::

::: details Câu trả lời mẫu (English)
- I'd rank by data risk, not by how old the tech is.
- First: the queue. Express messages and receive-then-process means a transient DB error loses a transaction. Fix with recoverable messages, transactional receive, bounded retries, an error queue, idempotent handlers.
- Second: BinaryFormatter, a deserialization RCE risk and removed in .NET 9; switch to versioned JSON.
- Third: observability; structured logs with a correlation id that follows the item from request to worker.
- Then prepare for migration: split the shared library, characterization tests on money flows.
:::

::: warning Bẫy & follow-up
- Mở đầu bằng "viết lại bằng .NET 10 + microservices": nghe như chưa hiểu rủi ro. Interviewer muốn thấy bạn ưu tiên.
- Follow-up: "Sao không migrate luôn mà còn sửa MSMQ?" Vì migrate mất nhiều tháng, mất tiền thì xảy ra ngay hôm nay; và sửa này nhỏ.
- Follow-up: "Message xử lý hai lần sau khi thêm retry?" [Idempotent consumer](/architecture/messaging#idempotent-consumer).
:::

### Migrate một hệ thống WebForms nhiều host lên .NET 10: bạn bắt đầu từ đâu? {#legacy-migration-start}

::: tip Trả lời nhanh
Gia cố và tạo lưới an toàn trước (test luồng tiền, tách shared library), rồi strangler với YARP: chuyển **endpoint nóng** trước (ít UI, lợi ích hiệu năng rõ), API công khai sau (có contract test), dashboard theo từng khu vực, worker và queue cuối. Xem [Thứ tự các pha](#phases).
:::

::: details Câu trả lời mẫu (English)
- Phase 0 is safety: characterization tests on money flows, durable queue, structured logs, split the shared library.
- Make the core library multi-target, push LINQ to SQL and MSMQ behind interfaces.
- Put an ASP.NET Core app with YARP in front; move the hot endpoints first, then the public API guarded by contract tests.
- Rewrite WebForms pages area by area as Razor Pages; there's no automatic conversion.
- Workers and the broker last; one owner per feature at any time to avoid dual writes.
:::

::: warning Bẫy & follow-up
- "Convert WebForms sang Razor Pages bằng tool": không có, phải viết lại.
- Chọn .NET 8 làm đích: đã hết hỗ trợ 10/11/2026.
:::

## Tự kiểm tra {#self-check}

1. Worker gọi `EndReceive` rồi `Process()`, `Process()` ném vì DB timeout. Message ở đâu sau đó? Hai thay đổi nào để nó còn đó?
2. Bạn muốn thêm web server thứ hai sau load balancer. Vì sao queue `.\Private$` làm việc này khó?
3. Vì sao `BinaryFormatter` vẫn nguy hiểm dù chỉ đọc message do chính code của mình gửi?
4. Hàm kiểm quyền bit flag nhận 0 thì trả `true`. Một dev viết `Permission.Read & Permission.Write`. Chuyện gì xảy ra?
5. Vì sao endpoint nóng được chuyển sang ASP.NET Core trước dashboard?
