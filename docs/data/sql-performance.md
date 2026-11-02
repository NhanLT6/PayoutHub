---
title: "SQL chậm: tìm nguyên nhân và thêm index"
---

# SQL chậm: tìm nguyên nhân và thêm index

Trang này là một quy trình làm được ngay khi gặp query chậm: **đo** xem thời gian đi đâu, **đọc** execution plan để biết DB đang làm gì thừa, **sửa** bằng đúng index, rồi **đo lại**. Ví dụ xuyên suốt là trang finance của PayoutHub, câu `SELECT * FROM Payouts WHERE Status = 'Pending' ORDER BY CreatedAt` trên bảng 5 triệu dòng. Ví dụ dùng SQL Server; chỗ nào PostgreSQL khác thì có một dòng riêng. Phía EF Core (N+1, projection) nằm ở [EF Core](/data/ef-core).

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="eAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="eInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="eOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="eBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 536" role="img" aria-label="Bản đồ chủ đề SQL chậm: đo, đọc plan, sửa bằng index, đo lại; ORDER BY Id và giá của index"><rect class="box dash" x="10" y="8" width="226" height="392" rx="10"/><text x="22" y="28" font-size="12.5" font-weight="600" class="muted">Bước 1 · Đo: thời gian đi đâu</text><a href="#ef-log" style="text-decoration:none"><rect class="box" x="10" y="48" width="226" height="74" rx="8"/><circle cx="30" cy="70" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="30" cy="70" r="12"/><text x="30" y="75" font-size="13" text-anchor="middle" font-weight="700" class="accT">1</text><text x="50" y="75" font-size="13" font-weight="600">Query nào chậm?</text><text x="24" y="98" font-size="11.5">log EF: Executed DbCommand (ms)</text><text x="24" y="114" font-size="11.5">production: Query Store</text></a><line class="ln" x1="123" y1="122" x2="123" y2="134" marker-end="url(#eInk)"/><a href="#statistics-io" style="text-decoration:none"><rect class="boxAcc" x="10" y="136" width="226" height="74" rx="8"/><circle cx="30" cy="158" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="30" cy="158" r="12"/><text x="30" y="163" font-size="13" text-anchor="middle" font-weight="700" class="accT">2</text><text x="50" y="163" font-size="13" font-weight="600" class="accT">Logical reads</text><text x="24" y="186" font-size="11.5">SET STATISTICS IO, TIME ON</text><text x="24" y="202" font-size="11.5">số page đọc: ổn định hơn giây</text></a><rect class="box dash" x="247" y="8" width="226" height="392" rx="10"/><text x="259" y="28" font-size="12.5" font-weight="600" class="muted">Bước 2 · Đọc execution plan</text><a href="#plan-direction" style="text-decoration:none"><rect class="box" x="247" y="48" width="226" height="74" rx="8"/><circle cx="267" cy="70" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="267" cy="70" r="12"/><text x="267" y="75" font-size="13" text-anchor="middle" font-weight="700" class="accT">3</text><text x="287" y="75" font-size="13" font-weight="600">Đọc từ phải sang trái</text><text x="261" y="98" font-size="11.5">tìm mũi tên dày nhất,</text><text x="261" y="114" font-size="11.5">operator có cost cao nhất</text></a><line class="ln" x1="360" y1="122" x2="360" y2="134" marker-end="url(#eInk)"/><a href="#red-flags" style="text-decoration:none"><rect class="boxBad" x="247" y="136" width="226" height="74" rx="8"/><circle cx="267" cy="158" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="267" cy="158" r="12"/><text x="267" y="163" font-size="13" text-anchor="middle" font-weight="700" class="accT">4</text><text x="287" y="163" font-size="13" font-weight="600" class="badT">Bốn cờ đỏ</text><text x="261" y="186" font-size="11.5">Scan · Sort · Key Lookup</text><text x="261" y="202" font-size="11.5">ước lượng ≠ thực tế</text></a><line class="ln" x1="360" y1="210" x2="360" y2="222" marker-end="url(#eInk)"/><a href="#missing-index-hint" style="text-decoration:none"><rect class="box" x="247" y="224" width="226" height="74" rx="8"/><circle cx="267" cy="246" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="267" cy="246" r="12"/><text x="267" y="251" font-size="13" text-anchor="middle" font-weight="700" class="accT">5</text><text x="287" y="251" font-size="13" font-weight="600">Missing index hint</text><text x="261" y="274" font-size="11.5">gợi ý cho 1 query,</text><text x="261" y="290" font-size="11.5">không áp dụng mù</text></a><rect class="boxOk dash" x="484" y="8" width="226" height="392" rx="10"/><text x="496" y="28" font-size="12.5" font-weight="600" class="muted">Bước 3 · Sửa bằng index</text><a href="#btree" style="text-decoration:none"><rect class="boxOk" x="484" y="48" width="226" height="74" rx="8"/><circle cx="504" cy="70" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="504" cy="70" r="12"/><text x="504" y="75" font-size="13" text-anchor="middle" font-weight="700" class="accT">6</text><text x="524" y="75" font-size="13" font-weight="600" class="okT">Danh bạ đã sắp xếp</text><text x="498" y="98" font-size="11.5">(Status, CreatedAt): seek tới</text><text x="498" y="114" font-size="11.5">Pending, đọc ra đã đúng thứ tự</text></a><line class="ln" x1="597" y1="122" x2="597" y2="134" marker-end="url(#eInk)"/><a href="#column-order" style="text-decoration:none"><rect class="boxOk" x="484" y="136" width="226" height="74" rx="8"/><circle cx="504" cy="158" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="504" cy="158" r="12"/><text x="504" y="163" font-size="13" text-anchor="middle" font-weight="700" class="accT">7</text><text x="524" y="163" font-size="13" font-weight="600" class="okT">Bằng trước, sắp xếp sau</text><text x="498" y="186" font-size="11.5">cột so sánh = đứng đầu,</text><text x="498" y="202" font-size="11.5">cột range / ORDER BY đứng sau</text></a><line class="ln" x1="597" y1="210" x2="597" y2="222" marker-end="url(#eInk)"/><a href="#covering" style="text-decoration:none"><rect class="boxOk" x="484" y="224" width="226" height="74" rx="8"/><circle cx="504" cy="246" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="504" cy="246" r="12"/><text x="504" y="251" font-size="13" text-anchor="middle" font-weight="700" class="accT">8</text><text x="524" y="251" font-size="13" font-weight="600" class="okT">INCLUDE, bỏ SELECT *</text><text x="498" y="274" font-size="11.5">index trả đủ cột</text><text x="498" y="290" font-size="11.5">→ hết Key Lookup</text></a><line class="ln" x1="597" y1="298" x2="597" y2="310" marker-end="url(#eInk)"/><a href="#filtered-index" style="text-decoration:none"><rect class="box" x="484" y="312" width="226" height="74" rx="8"/><circle cx="504" cy="334" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="504" cy="334" r="12"/><text x="504" y="339" font-size="13" text-anchor="middle" font-weight="700" class="accT">9</text><text x="524" y="339" font-size="13" font-weight="600">Filtered index · keyset</text><text x="498" y="362" font-size="11.5">WHERE Status = 'Pending';</text><text x="498" y="378" font-size="11.5">TOP + WHERE CreatedAt &gt; @last</text></a><line class="lnAcc" x1="236" y1="85" x2="245" y2="85" marker-end="url(#eAcc)"/><line class="lnAcc" x1="473" y1="85" x2="482" y2="85" marker-end="url(#eAcc)"/><a href="#re-measure" style="text-decoration:none"><rect class="boxAcc" x="10" y="414" width="700" height="44" rx="8"/><circle cx="30" cy="436" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="30" cy="436" r="12"/><text x="30" y="441" font-size="13" text-anchor="middle" font-weight="700" class="accT">10</text><text x="52" y="441" font-size="13" font-weight="600" class="accT">Đo lại</text><text x="110" y="441" font-size="11.5">so logical reads trước / sau: 62.500 → khoảng 100. Không giảm thì quay lại bước 2.</text></a><path class="lnAcc dash" d="M597 400 L597 412" marker-end="url(#eAcc)"/><path class="lnAcc dash" d="M123 414 L123 402" marker-end="url(#eAcc)"/><a href="#order-by-id" style="text-decoration:none"><rect class="boxBad" x="10" y="470" width="344" height="58" rx="8"/><circle cx="30" cy="492" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="30" cy="492" r="12"/><text x="30" y="497" font-size="13" text-anchor="middle" font-weight="700" class="accT">11</text><text x="52" y="497" font-size="13" font-weight="600" class="badT">ORDER BY Id cho khỏi Sort?</text><text x="24" y="518" font-size="11.5">hết Sort, nhưng vẫn quét tìm Pending và đổi nghĩa query</text></a><a href="#index-cost" style="text-decoration:none"><rect class="box" x="366" y="470" width="344" height="58" rx="8"/><circle cx="386" cy="492" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="386" cy="492" r="12"/><text x="386" y="497" font-size="13" text-anchor="middle" font-weight="700" class="accT">12</text><text x="408" y="497" font-size="13" font-weight="600">Giá của index</text><text x="380" y="518" font-size="11.5">mỗi INSERT / UPDATE ghi thêm vào từng index</text></a></svg>
<p class="fig-caption">Ba bước trái sang phải, rồi đo lại. Hai thẻ dưới đứng riêng: một ý tưởng hay gặp và cái giá phải trả. Ôn lại: nhìn từng ô, tự nói được "làm gì, vì sao"; ô nào không nói được thì bấm vào.</p>
</div>

## 1. Vấn đề: một query, 5 triệu dòng {#problem}

Bảng `Payouts` có khoá chính `Id` (identity, clustered index, mặc định khi EF tạo khoá chính trên SQL Server) và chưa có index nào khác. Trong 5 triệu dòng, khoảng 20.000 dòng đang `Pending` (0,4%), phần lớn là payout mới tạo gần đây.

```sql
SELECT *
FROM Payouts
WHERE Status = 'Pending'
ORDER BY CreatedAt;
```

Trên máy dev với 1.000 dòng, query trả về tức thì. Trên production nó mất hơn 1 giây, và chậm hơn nữa lúc nhiều người mở trang cùng lúc. Không có index nào giúp tìm `Pending`, nên DB làm ba việc thừa:

1. **Đọc cả bảng** (5 triệu dòng) để lọc ra 20.000 dòng `Pending`.
2. **Sắp xếp** 20.000 dòng đó theo `CreatedAt` trong bộ nhớ, vì không có gì cho sẵn thứ tự.
3. **Trả về mọi cột**, kể cả `Note` dài mà màn hình không hiện.

Ba mục tiếp theo đi đúng thứ tự bạn sẽ làm khi gặp chuyện này: đo, đọc plan, sửa.

## 2. Bước 1: đo xem thời gian đi đâu {#measure}

**Phần lớn thời gian của một query đọc dữ liệu là đọc page.** SQL Server lưu dữ liệu thành các page 8 KB; query đọc càng nhiều page thì càng chậm. Vì vậy con số cần theo dõi là **số page đọc** (logical reads), không chỉ số giây: số giây đổi theo việc page đã nằm sẵn trong RAM hay chưa (cache "nóng" hay "nguội") và theo tải của server, còn số page đọc thì gần như không đổi giữa các lần chạy.

### Từ app: query nào chậm {#ef-log}

EF Core ghi mỗi câu SQL kèm thời gian chạy (mức Information, category `Microsoft.EntityFrameworkCore.Database.Command`; với `appsettings.json` hiện tại của PayoutHub là `Default: Information` thì dòng này hiện ra khi đã đăng ký `DbContext`):

```
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (1,234ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      SELECT p.Id, p.AffiliateId, p.Amount, p.CreatedAt, p.Note, p.Status
      FROM Payouts AS p
      WHERE p.Status = N'Pending'
      ORDER BY p.CreatedAt
```

Copy **đúng câu SQL này** (không phải câu bạn nghĩ EF sẽ sinh) sang SSMS để đo tiếp. Có tham số thì giá trị chỉ hiện khi bật `EnableSensitiveDataLogging()`, chỉ bật ở Development.

### Trong SSMS: logical reads và actual plan {#statistics-io}

Trong <T>SSMS</T>, bật **Include Actual Execution Plan** (Ctrl+M), rồi chạy:

```sql
SET STATISTICS IO, TIME ON;

SELECT * FROM Payouts WHERE Status = 'Pending' ORDER BY CreatedAt;
```

Tab **Messages** cho ra (số minh hoạ):

```
Table 'Payouts'. Scan count 1, logical reads 62500, physical reads 0, read-ahead reads 0, ...
 SQL Server Execution Times:
   CPU time = 1450 ms,  elapsed time = 1234 ms.
```

- **logical reads 62500**: đọc 62.500 page (khoảng 490 MB) từ <T>buffer pool</T>. Đây là con số bạn sẽ so trước/sau khi sửa.
- **physical reads**: page phải đọc từ đĩa vì chưa có trong RAM. Chạy lần hai thường về 0, đó là lý do số giây lần đầu và lần sau khác nhau.
- Tab **Execution plan** là thứ đọc ở bước 2.

### Trên production: Query Store {#query-store}

Không ai ngồi chạy SSMS trên production để tìm query chậm. <T>Query Store</T> tự ghi lại mọi query, plan đã dùng, thời gian và logical reads theo thời gian. Nó bật mặc định với database mới trên SQL Server 2022 và Azure SQL Database; bản cũ hơn phải bật (`ALTER DATABASE ... SET QUERY_STORE = ON`). Trong SSMS: database → **Query Store** → **Top Resource Consuming Queries**, sắp theo logical reads hoặc duration. Nó còn cho thấy một query **đổi plan** từ hôm nào (vd sau khi thống kê cập nhật), là manh mối khi "hôm qua còn nhanh".

::: info PostgreSQL
`EXPLAIN (ANALYZE, BUFFERS) SELECT ...` chạy query và in plan kèm thời gian thật và số buffer (`shared hit` = trong RAM, `read` = từ đĩa), tương đương actual plan + STATISTICS IO. Trên production dùng extension `pg_stat_statements` thay cho Query Store.
:::

## 3. Bước 2: đọc execution plan {#read-plan}

**<T>Execution plan</T> là một cây operator; dữ liệu đi từ lá (đọc bảng, đọc index) lên gốc (`SELECT`).** SSMS vẽ gốc ở bên trái, nên đọc từ **phải sang trái**: operator bên phải nhất là chỗ dữ liệu được đọc ra, mỗi mũi tên là dòng chảy sang operator kế tiếp.

### Cách đọc: mũi tên dày và cost cao {#plan-direction}

<div class="fig">
<svg viewBox="0 0 720 250" role="img" aria-label="Execution plan của query: Clustered Index Scan đọc 5 triệu dòng, Sort có cảnh báo spill, rồi SELECT; gợi ý missing index ở trên">
<text x="20" y="22" font-size="10.5" class="mono okT">Missing Index (Impact 97.8): CREATE NONCLUSTERED INDEX [&lt;Name of Missing Index&gt;]</text>
<text x="20" y="38" font-size="10.5" class="mono okT">ON [dbo].[Payouts] ([Status]) INCLUDE ([AffiliateId],[Amount],[CreatedAt],[Note])</text>
<rect class="box" x="20" y="74" width="100" height="70" rx="6"/>
<text x="70" y="114" font-size="13" font-weight="600" text-anchor="middle">SELECT</text>
<rect class="boxBad" x="224" y="64" width="170" height="90" rx="6"/>
<text x="238" y="88" font-size="13" font-weight="600">Sort</text>
<text x="238" y="108" font-size="11.5">Cost: 78 %</text>
<text x="238" y="126" font-size="11" class="mono">ORDER BY CreatedAt</text>
<path d="M362 74 L380 104 L344 104 Z" style="fill:var(--vp-c-warning-soft);stroke:var(--vp-c-warning-1);stroke-width:1.5"/>
<text x="362" y="100" font-size="13" font-weight="700" text-anchor="middle">!</text>
<text x="238" y="146" font-size="10.5" class="badT">spill xuống tempdb</text>
<rect class="boxBad" x="490" y="64" width="210" height="90" rx="6"/>
<text x="504" y="88" font-size="12.5" font-weight="600">Clustered Index Scan</text>
<text x="504" y="108" font-size="11" class="mono">Payouts.PK_Payouts</text>
<text x="504" y="126" font-size="11.5">Cost: 22 %</text>
<text x="504" y="146" font-size="10.5" class="badT">Rows read: 5.000.000</text>
<path class="boxAcc" d="M484 102 L410 102 L410 96 L398 109 L410 122 L410 116 L484 116 Z"/>
<path class="boxAcc" d="M218 102 L136 102 L136 96 L124 109 L136 122 L136 116 L218 116 Z"/>
<text x="442" y="90" font-size="10.5" text-anchor="middle" class="accT">20.000</text>
<text x="176" y="90" font-size="10.5" text-anchor="middle" class="accT">20.000</text>
<text x="309" y="174" font-size="11" text-anchor="middle" class="badT">20.000 of 1.200 (1666%)</text>
<text x="595" y="174" font-size="11" text-anchor="middle" class="badT">20.000 of 1.200 (1666%)</text>
<line class="lnAcc" x1="690" y1="204" x2="40" y2="204" marker-end="url(#eAcc)"/>
<text x="365" y="226" font-size="12" text-anchor="middle" class="accT">đọc từ phải sang trái: dữ liệu được đọc ở bên phải, chảy về SELECT</text>
</svg>
<p class="fig-caption">Plan thật của query ví dụ (rút gọn). Hai ô đỏ là hai cờ đỏ: Scan đọc cả bảng, Sort tự sắp xếp và tràn xuống tempdb. Dòng "20.000 of 1.200" là số dòng thật / số dòng ước lượng.</p>
</div>

Ba thứ để nhìn, theo thứ tự:

1. **Mũi tên dày nhất**: độ dày tỉ lệ với số dòng đi qua. Một mũi tên dày đi vào một operator rồi ra mũi tên mảnh là chỗ DB đọc nhiều mà dùng ít. Rê chuột vào operator để xem thêm `Number of Rows Read`: ở đây Scan **đọc** 5 triệu dòng để **trả ra** 20.000.
2. **Operator có cost % cao nhất**: Sort 78%. Lưu ý cost % là con số **ước lượng** của optimizer, kể cả trong actual plan; nếu ước lượng sai (xem cờ đỏ 4) thì cost % cũng sai. Mũi tên và số dòng thật mới là số đo.
3. **Icon cảnh báo** (tam giác vàng): spill, implicit conversion, thiếu thống kê.

### Bốn cờ đỏ {#red-flags}

**Cờ 1: Clustered Index Scan / Table Scan, nghĩa là đọc cả bảng.** Clustered index chính là bảng (dữ liệu sắp theo `Id`); "scan" nó là đọc từ đầu tới cuối. Table Scan là cùng chuyện trên bảng không có clustered index (heap). Xảy ra khi không có index nào bắt đầu bằng cột trong `WHERE`. Scan không phải lúc nào cũng xấu: bảng nhỏ, hoặc query cần phần lớn các dòng, thì scan là cách rẻ nhất. Nó là cờ đỏ khi đọc 5 triệu để lấy 20.000.

**Cờ 2: Sort, nghĩa là không có index nào cho sẵn thứ tự.** Dữ liệu ra khỏi Scan theo thứ tự `Id`, nên muốn `ORDER BY CreatedAt` thì phải sắp lại. Sort cần một vùng nhớ (memory grant) được cấp **trước khi chạy**, dựa trên số dòng ước lượng. Ước lượng 1.200 dòng mà thật là 20.000 thì không đủ chỗ, Sort tràn ra <T>tempdb</T> trên đĩa: đó là tam giác vàng "Operator used tempdb to spill data".

**Cờ 3: Key Lookup, nghĩa là index tìm được dòng nhưng thiếu cột.** Index phụ (nonclustered) chỉ chứa các cột của nó cộng với `Id`. `SELECT *` cần thêm `Note`, `Amount`... nên với **mỗi dòng** tìm được, DB phải nhảy sang clustered index theo `Id` để lấy phần còn lại (khoảng 3 page mỗi lần). 20.000 dòng là 20.000 lần nhảy, khoảng 60.000 logical reads, ngang với đọc cả bảng. Khi đó optimizer thường bỏ luôn index và quay về Scan. Sửa ở [INCLUDE và covering](#covering).

**Cờ 4: số dòng ước lượng lệch xa số dòng thật.** Optimizer chọn plan (dùng index nào, join kiểu gì, cấp bao nhiêu RAM) dựa trên **thống kê** (statistics): bảng phân bố giá trị của cột. Thống kê cũ thì ước lượng sai, plan sai theo. SSMS in dưới mỗi operator dạng `20.000 of 1.200 (1666%)`: thật 20.000, ước lượng 1.200. Thống kê tự cập nhật khi đủ nhiều dòng đổi; với bảng 5 triệu dòng, ngưỡng là khoảng 70.000 dòng (SQL Server 2016+, compatibility level 130+), nên vừa insert 18.000 payout `Pending` thì thống kê chưa kịp biết. Sửa ngay: `UPDATE STATISTICS dbo.Payouts;`. Ước lượng lệch còn có thể do <T>parameter sniffing</T>: plan được dựng cho giá trị tham số lần đầu và dùng lại cho giá trị khác hẳn.

### Missing index hint: gợi ý, không phải đáp án {#missing-index-hint}

Dòng chữ xanh trên plan là gợi ý của optimizer, kèm sẵn câu `CREATE INDEX`. Nó được sinh khi optimizer thấy một index sẽ giúp **riêng query này**, và có ba giới hạn:

- **Không xét `ORDER BY`**: gợi ý ở hình trên chỉ có `(Status)` làm khoá và đẩy `CreatedAt` vào INCLUDE. Tạo đúng như vậy thì vẫn còn Sort.
- **Hay nhét mọi cột vào INCLUDE** (vì `SELECT *`), thành một bản sao gần bằng cả bảng.
- **Không biết các index đã có** hay các query khác: áp từng gợi ý một sẽ sinh ra nhiều index trùng nhau.

Dùng nó như manh mối "cột nào đang thiếu index", rồi tự thiết kế theo bước 3.

## 4. Bước 3: sửa bằng index {#fix}

### Index là một danh bạ đã sắp xếp {#btree}

**Index là một bản sao của vài cột, được sắp theo thứ tự các cột khoá, lưu dạng cây <T>B-tree</T>.** Vì đã sắp xếp, DB không phải đọc từ đầu: nó đi từ gốc cây xuống (3–4 page với 5 triệu dòng) để tới đúng chỗ giá trị cần tìm bắt đầu (**seek**), rồi đọc tiếp tuần tự ở tầng lá. Giống danh bạ điện thoại sắp theo họ rồi tới tên: tìm họ "Nguyễn" thì mở thẳng tới chữ N, và các "Nguyễn" nằm liền nhau, **đã sắp sẵn theo tên**.

Áp vào query: index sắp theo `(Status, CreatedAt)` thì toàn bộ `Pending` nằm thành **một khối liền nhau**, và trong khối đó các dòng **đã sắp theo `CreatedAt`**. Một lần seek tới đầu khối, đọc tới cuối khối, xong: hết Scan, hết Sort.

<div class="fig">
<svg viewBox="0 0 720 360" role="img" aria-label="So sánh index (Status, CreatedAt): Pending liền một khối đã sắp theo CreatedAt; index (CreatedAt, Status): Pending rải khắp index">
<text x="20" y="22" font-size="13" font-weight="600" class="okT">Index (Status, CreatedAt)</text>
<text x="380" y="22" font-size="13" font-weight="600" class="badT">Index (CreatedAt, Status)</text>
<g font-size="10.5" font-weight="600" class="muted"><text x="60" y="44">Status</text><text x="150" y="44">CreatedAt</text><text x="262" y="44">Id</text><text x="420" y="44">CreatedAt</text><text x="530" y="44">Status</text><text x="622" y="44">Id</text></g>
<g font-size="11" class="mono">
<text x="60" y="66">Approved</text><text x="150" y="66">2024-03-05</text><text x="262" y="66">17</text>
<text x="60" y="86" class="muted">…  2,9 triệu dòng</text>
<text x="60" y="106">Paid</text><text x="150" y="106">2026-10-30</text><text x="262" y="106">4.978.112</text>
</g>
<rect class="boxOk" x="54" y="114" width="286" height="122" rx="4"/>
<g font-size="11" class="mono">
<text x="60" y="130">Pending</text><text x="150" y="130">2026-01-04</text><text x="262" y="130">3.201.540</text>
<text x="60" y="150">Pending</text><text x="150" y="150">2026-09-30</text><text x="262" y="150">4.950.002</text>
<text x="60" y="170">Pending</text><text x="150" y="170">2026-10-01</text><text x="262" y="170">4.951.877</text>
<text x="60" y="190" class="muted">…  20.000 dòng, đã theo ngày</text>
<text x="60" y="210">Pending</text><text x="150" y="210">2026-11-02</text><text x="262" y="210">4.999.998</text>
<text x="60" y="230">Pending</text><text x="150" y="230">2026-11-02</text><text x="262" y="230">4.999.999</text>
<text x="60" y="254">Rejected</text><text x="150" y="254">2024-02-11</text><text x="262" y="254">902</text>
<text x="60" y="274" class="muted">…  Rejected tiếp</text>
</g>
<path class="lnOk" d="M22 52 C 22 100, 30 124, 50 125" marker-end="url(#eOk)"/>
<text x="18" y="296" font-size="11.5" class="okT">seek: 3–4 page là tới dòng Pending đầu tiên,</text>
<text x="18" y="314" font-size="11.5" class="okT">đọc liền một khối, ra đúng thứ tự CreatedAt</text>
<text x="18" y="332" font-size="11.5" class="okT">→ không Scan, không Sort</text>
<line class="lnMuted" x1="362" y1="30" x2="362" y2="340"/>
<g font-size="11" class="mono">
<text x="420" y="66">2024-02-11</text><text x="530" y="66">Rejected</text><text x="622" y="66">902</text>
<text x="420" y="86">2024-03-05</text><text x="530" y="86">Approved</text><text x="622" y="86">17</text>
</g>
<rect class="boxBad" x="414" y="94" width="286" height="18" rx="3"/>
<g font-size="11" class="mono">
<text x="420" y="107">2026-01-04</text><text x="530" y="107">Pending</text><text x="622" y="107">3.201.540</text>
<text x="420" y="127">2026-01-04</text><text x="530" y="127">Paid</text><text x="622" y="127">3.201.541</text>
<text x="420" y="147" class="muted">…  vài triệu dòng</text>
</g>
<rect class="boxBad" x="414" y="155" width="286" height="18" rx="3"/>
<g font-size="11" class="mono">
<text x="420" y="168">2026-09-30</text><text x="530" y="168">Pending</text><text x="622" y="168">4.950.002</text>
<text x="420" y="188">2026-09-30</text><text x="530" y="188">Approved</text><text x="622" y="188">4.950.003</text>
</g>
<rect class="boxBad" x="414" y="196" width="286" height="18" rx="3"/>
<g font-size="11" class="mono">
<text x="420" y="209">2026-10-01</text><text x="530" y="209">Pending</text><text x="622" y="209">4.951.877</text>
<text x="420" y="229">2026-10-01</text><text x="530" y="229">Paid</text><text x="622" y="229">4.951.878</text>
<text x="420" y="249" class="muted">…</text>
</g>
<text x="380" y="296" font-size="11.5" class="badT">Pending rải khắp index (ô đỏ): đọc theo</text>
<text x="380" y="314" font-size="11.5" class="badT">CreatedAt thì không cần Sort, nhưng phải</text>
<text x="380" y="332" font-size="11.5" class="badT">quét gần hết index để lọc ra Pending</text>
</svg>
<p class="fig-caption">Cùng hai cột, khác thứ tự. Bên trái: cột so sánh bằng (Status) đứng đầu gom Pending thành một khối, cột sắp xếp (CreatedAt) đứng sau nên trong khối đã đúng thứ tự. Bên phải: CreatedAt đứng đầu làm Pending rải rác.</p>
</div>

Nhìn cột `Id` bên trái: trong cùng `Status` và `CreatedAt`, dòng vẫn được sắp theo `Id`. Đó là vì trên SQL Server, index phụ không unique luôn mang theo khoá của clustered index (`Id`) như cột khoá cuối. Chi tiết này có ích ở [phân trang keyset](#keyset).

### Thứ tự cột: so sánh bằng trước, khoảng và sắp xếp sau {#column-order}

Suy ra từ hình: **cột đứng đầu quyết định dòng khớp có nằm liền nhau hay không; chỉ khi cột trước là một giá trị cố định thì cột sau mới được sắp liên tục.** Nên:

1. Cột so sánh **bằng** (`Status = 'Pending'`, `AffiliateId = @id`) đứng đầu. Có nhiều cột bằng thì đặt cạnh nhau, thứ tự giữa chúng ít quan trọng.
2. Sau đó tới **một** cột dùng cho **khoảng** (`CreatedAt >= @from`) hoặc **`ORDER BY`**.
3. Cột range đứng trước thì mọi cột sau nó không còn được sắp liên tục nữa, như bên phải hình.

| Query | Index |
|---|---|
| `WHERE Status = @s ORDER BY CreatedAt` | `(Status, CreatedAt)` |
| `WHERE Status = @s AND CreatedAt >= @from ORDER BY CreatedAt` | `(Status, CreatedAt)` |
| `WHERE AffiliateId = @a AND Status = @s ORDER BY CreatedAt DESC` | `(AffiliateId, Status, CreatedAt)`; DESC đọc ngược được, không cần index riêng |

Một index `(Status, CreatedAt)` cũng phục vụ luôn query chỉ lọc `WHERE Status = @s` (dùng phần đầu của khoá), nên không cần thêm index riêng cho `(Status)`.

### INCLUDE: index trả lời được cả câu hỏi (covering) {#covering}

**Tầng lá của index phụ chỉ chứa các cột khoá cộng với `Id`. Cột nào query cần mà không có ở đó thì phải [Key Lookup](#red-flags) về bảng, từng dòng một.** `INCLUDE` thêm cột vào tầng lá (không sắp theo chúng, không đưa lên các tầng trên của cây), nên index chứa đủ mọi cột query cần: đó là **covering index**, không còn Key Lookup.

Muốn index phủ được thì query không được đòi mọi cột. `SELECT *` cần cả `Note` (chuỗi dài), nên index phủ được nó sẽ to gần bằng bảng. Màn hình list chỉ hiện 4 cột, nên chỉ lấy 4 cột:

```sql
CREATE NONCLUSTERED INDEX IX_Payouts_Status_CreatedAt
    ON dbo.Payouts (Status, CreatedAt)
    INCLUDE (AffiliateId, Amount);

SELECT Id, AffiliateId, Amount, CreatedAt     -- Id có sẵn trong index
FROM Payouts
WHERE Status = 'Pending'
ORDER BY CreatedAt;
```

Phía EF Core, "chỉ lấy 4 cột" chính là [Select sang DTO](/data/ef-core#projection), còn index khai báo trong cấu hình entity để migration tạo ra:

```csharp
// PayoutConfiguration : IEntityTypeConfiguration<Payout> (Infrastructure)
builder.HasIndex(p => new { p.Status, p.CreatedAt })
       .IncludeProperties(p => new { p.AffiliateId, p.Amount });   // SQL Server và Npgsql đều có
```

### Filtered index: chỉ index phần nhỏ cần tìm {#filtered-index}

**Filtered index chỉ chứa những dòng khớp điều kiện `WHERE` của nó.** `Pending` chỉ là 0,4% bảng, nên index chỉ chứa 20.000 dòng thay vì 5 triệu: nhỏ hơn khoảng 250 lần, và INSERT/UPDATE các dòng không phải `Pending` không phải động tới nó.

```sql
CREATE NONCLUSTERED INDEX IX_Payouts_Pending_CreatedAt
    ON dbo.Payouts (CreatedAt)
    INCLUDE (AffiliateId, Amount)
    WHERE Status = 'Pending';
```

```csharp
builder.HasIndex(p => p.CreatedAt)
       .IncludeProperties(p => new { p.AffiliateId, p.Amount })
       .HasFilter("[Status] = 'Pending'");
```

Điều kiện để SQL Server dùng được nó: điều kiện trong query phải **là hằng số khớp với filter**. `WHERE Status = @status` (tham số) thì không dùng được, vì plan phải đúng cho mọi giá trị của `@status`. Với EF, viết `p.Status == PayoutStatus.Pending` (hằng số ngay trong biểu thức) thì EF đưa thẳng `N'Pending'` vào SQL; gán vào biến rồi so `p.Status == status` thì EF sinh tham số và filtered index bị bỏ qua. PostgreSQL gọi đây là partial index, cú pháp `CREATE INDEX ... WHERE status = 'Pending'`.

Dùng khi giá trị cần tìm là phần nhỏ và cố định (`Pending`, `IsDeleted = 0`). Nếu màn hình còn lọc `Approved`, `Rejected` thì index `(Status, CreatedAt)` thường gọn hơn là mỗi trạng thái một filtered index.

### Phân trang: TOP và keyset thay vì OFFSET sâu {#keyset}

**Index cho ra dòng đã sắp xếp, nên DB dừng được ngay khi đủ số dòng cần.** `TOP 50` trên index `(Status, CreatedAt)` đọc đúng 50 dòng đầu khối `Pending`, vài page. Nhưng `OFFSET 10000 ROWS FETCH NEXT 50` vẫn phải **đọc rồi bỏ** 10.000 dòng trước đó, trang càng sâu càng chậm.

**Keyset pagination** (seek method) nhớ dòng cuối của trang trước và seek thẳng tới sau nó:

```sql
SELECT TOP (50) Id, AffiliateId, Amount, CreatedAt
FROM Payouts
WHERE Status = 'Pending'
  AND (CreatedAt > @lastCreatedAt
       OR (CreatedAt = @lastCreatedAt AND Id > @lastId))   -- Id phá hoà khi trùng CreatedAt
ORDER BY CreatedAt, Id;
```

```csharp
var page = await db.Payouts
    .Where(p => p.Status == PayoutStatus.Pending
             && (p.CreatedAt > lastCreatedAt || (p.CreatedAt == lastCreatedAt && p.Id > lastId)))
    .OrderBy(p => p.CreatedAt).ThenBy(p => p.Id)
    .Select(p => new PayoutRow(p.Id, p.Amount, p.CreatedAt, p.AffiliateId))
    .Take(50)
    .ToListAsync(ct);
```

`Id` có mặt vì `CreatedAt` có thể trùng; thiếu nó thì dòng trùng thời điểm ở ranh giới trang bị mất hoặc lặp. Index `(Status, CreatedAt)` đã mang sẵn `Id` ở cuối khoá (như hình danh bạ), nên câu này vẫn là một lần seek. Đổi lại: không nhảy thẳng tới "trang 37" được, chỉ "trang sau". Hợp với cuộn vô hạn và API; màn hình cần số trang thì giữ `OFFSET` cho vài trang đầu.

### Đo lại {#re-measure}

Chạy lại với `SET STATISTICS IO ON` sau mỗi thay đổi, so **logical reads**. Đây là chuyện của query ví dụ qua từng nấc (số minh hoạ, cỡ độ lớn; máy bạn sẽ khác):

| Nấc | Thay đổi | Plan | Logical reads |
|---|---|---|---|
| 0 | Chưa có index | Clustered Index Scan + Sort | ~62.500 |
| 1 | Index `(Status)`, vẫn `SELECT *` | Seek + Key Lookup × 20.000 + Sort; optimizer thường bỏ index, quay về Scan | ~60.000 |
| 2 | Index `(Status, CreatedAt)`, vẫn `SELECT *` | Seek + Key Lookup, **hết Sort** | ~60.000 |
| 3 | Thêm `INCLUDE (AffiliateId, Amount)`, chỉ lấy 4 cột | Index Seek, hết Lookup | ~120 |
| 4 | Thêm `TOP 50` / keyset | Index Seek, dừng sau 50 dòng | ~4 |

Hai nấc 1 và 2 cho thấy vì sao "đã thêm index mà không nhanh hơn": index đúng thứ tự nhưng chưa phủ cột, Key Lookup ăn hết phần lợi. Logical reads không giảm thì quay lại đọc plan, đừng đoán.

## 5. "ORDER BY Id cho khỏi Sort?" {#order-by-id}

Ý tưởng: clustered index trên `Id` vốn đã sắp xếp, `Id` identity tăng dần theo lúc insert, vậy `ORDER BY Id` thay cho `ORDER BY CreatedAt` là hết Sort mà không cần index mới.

**Phần đúng:** clustered index chính là bảng sắp theo `Id`, nên đọc nó theo thứ tự là ra đúng `ORDER BY Id`, operator Sort biến mất. Và với dữ liệu insert theo thời gian thực, thứ tự `Id` gần trùng thứ tự `CreatedAt`.

**Phần sai:** nó chỉ chữa cờ đỏ Sort, không chữa cờ đỏ Scan.

<div class="fig">
<svg viewBox="0 0 720 270" role="img" aria-label="Clustered index theo Id: Pending nằm gần cuối, ORDER BY Id phải đi từ đầu bảng; đoạn Id import có CreatedAt cũ làm thứ tự Id khác thứ tự CreatedAt">
<text x="20" y="22" font-size="12.5" font-weight="600">Clustered index = cả bảng, sắp theo Id (mỗi ô ≈ 125.000 dòng)</text>
<g>
<rect class="box" x="20" y="36" width="16" height="30"/><rect class="box" x="36" y="36" width="16" height="30"/><rect class="box" x="52" y="36" width="16" height="30"/><rect class="box" x="68" y="36" width="16" height="30"/><rect class="box" x="84" y="36" width="16" height="30"/><rect class="box" x="100" y="36" width="16" height="30"/><rect class="box" x="116" y="36" width="16" height="30"/><rect class="box" x="132" y="36" width="16" height="30"/><rect class="box" x="148" y="36" width="16" height="30"/><rect class="box" x="164" y="36" width="16" height="30"/>
<rect class="box" x="180" y="36" width="16" height="30"/><rect class="box" x="196" y="36" width="16" height="30"/><rect class="box" x="212" y="36" width="16" height="30"/><rect class="box" x="228" y="36" width="16" height="30"/><rect class="box" x="244" y="36" width="16" height="30"/><rect class="box" x="260" y="36" width="16" height="30"/><rect class="box" x="276" y="36" width="16" height="30"/><rect class="box" x="292" y="36" width="16" height="30"/><rect class="box" x="308" y="36" width="16" height="30"/><rect class="box" x="324" y="36" width="16" height="30"/>
<rect class="box" x="340" y="36" width="16" height="30"/><rect class="box" x="356" y="36" width="16" height="30"/><rect class="box" x="372" y="36" width="16" height="30"/><rect class="box" x="388" y="36" width="16" height="30"/><rect class="box" x="404" y="36" width="16" height="30"/><rect class="box" x="420" y="36" width="16" height="30"/><rect class="box" x="436" y="36" width="16" height="30"/><rect class="box" x="452" y="36" width="16" height="30"/><rect class="box" x="468" y="36" width="16" height="30"/><rect class="box" x="484" y="36" width="16" height="30"/>
<rect class="box" x="500" y="36" width="16" height="30"/><rect class="box" x="516" y="36" width="16" height="30"/><rect class="box" x="532" y="36" width="16" height="30"/><rect class="box" x="548" y="36" width="16" height="30"/><rect class="box" x="564" y="36" width="16" height="30"/><rect class="box" x="580" y="36" width="16" height="30"/><rect class="boxAcc" x="596" y="36" width="16" height="30"/><rect class="boxAcc" x="612" y="36" width="16" height="30"/><rect class="box" x="628" y="36" width="16" height="30"/><rect class="boxBad" x="644" y="36" width="16" height="30"/>
</g>
<text x="20" y="84" font-size="11" class="mono">Id 1</text>
<text x="660" y="84" font-size="11" class="mono" text-anchor="end">Id 5.000.000</text>
<text x="652" y="30" font-size="11" text-anchor="middle" class="badT">Pending</text>
<text x="612" y="30" font-size="11" text-anchor="end" class="accT">import</text>
<line class="lnBad" x1="20" y1="104" x2="624" y2="104" marker-end="url(#eBad)"/>
<text x="20" y="124" font-size="12" class="badT">WHERE Status = 'Pending' ORDER BY Id: đi từ Id 1, đọc từng dòng và lọc.</text>
<text x="20" y="142" font-size="12" class="badT">TOP 50 cũng chỉ dừng khi gặp đủ 50 Pending, tức là gần cuối bảng: vẫn ~4,8 triệu dòng.</text>
<rect class="boxAcc" x="20" y="166" width="680" height="88" rx="8"/>
<text x="34" y="188" font-size="12.5" font-weight="600" class="accT">Id order ≠ CreatedAt order</text>
<text x="34" y="208" font-size="11.5">Ô xanh: 250.000 dòng import từ hệ thống cũ tuần trước, Id lớn nhưng CreatedAt = 2023.</text>
<text x="34" y="226" font-size="11.5">ORDER BY Id xếp chúng sau payout tháng trước; ORDER BY CreatedAt xếp chúng lên đầu.</text>
<text x="34" y="244" font-size="11.5">CreatedAt là giờ nghiệp vụ (client gửi, sửa tay, backfill) cũng làm lệch như vậy.</text>
</svg>
<p class="fig-caption">Ô đỏ là vùng có gần hết các dòng Pending, dồn về cuối vì là payout mới. Không có index trên Status thì không có cách nào nhảy thẳng tới chúng.</p>
</div>

- **Vẫn phải quét để tìm `Pending`**: không có index bắt đầu bằng `Status` thì DB đi clustered index theo thứ tự `Id` và lọc từng dòng. Không có `TOP` thì vẫn đọc cả 5 triệu. Có `TOP 50` thì dừng khi đủ 50 dòng `Pending`, nhưng `Pending` là payout mới nên nằm ở cuối: vẫn đọc gần hết bảng. (Nếu đã có index `(Status)` thì `ORDER BY Id` mới thật sự hết Sort và hết Scan, vì index đó mang `Id` ở cuối khoá. Nhưng lúc đó index `(Status, CreatedAt)` cũng tốn y như vậy.)
- **Thứ tự `Id` không phải thứ tự `CreatedAt`**: dữ liệu import, backfill, `CreatedAt` là thời điểm nghiệp vụ do client gửi hoặc bị sửa tay, nhiều nguồn insert song song. Chỉ cần một đợt import là thứ tự lệch.
- **Đổi nghĩa query một cách lặng lẽ**: yêu cầu là "sắp theo ngày tạo", code thành "sắp theo thứ tự insert". Test với dữ liệu seed thì kết quả giống hệt, nên lỗi lộ ra trên production khi đã có dữ liệu import, và người review không thấy gì khác thường.

Chấp nhận được khi đó là **quyết định có chủ đích**: hai thứ tự thật sự tương đương (bảng chỉ insert, `CreatedAt` do server gán `= now`, không bao giờ import), hoặc yêu cầu thật sự là "thứ tự vào hệ thống"; và ghi lại lý do trong code. Còn mục tiêu là "query nhanh" thì sửa bằng index, không bằng đổi ý nghĩa.

## 6. Giá của index {#index-cost}

**Mỗi index là một bản sao đã sắp xếp mà DB phải giữ cho đúng ở mọi lần ghi.** Từ đó:

- **INSERT** một payout phải ghi vào bảng **và** vào từng index. 6 index là 7 chỗ ghi, cộng log cho từng chỗ.
- **UPDATE** cột nằm trong index thì entry trong index phải chuyển chỗ. Approve một payout đổi `Status` từ `Pending` sang `Approved`: với index `(Status, CreatedAt)`, entry bị xoá khỏi khối `Pending` và chèn vào khối `Approved`. Với filtered index `Pending`, entry rời khỏi index. Update cột không nằm trong index nào (`Note`) thì không tốn thêm gì.
- **Dung lượng và RAM**: index chiếm đĩa, và khi được dùng thì chiếm <T>buffer pool</T>, tranh chỗ với dữ liệu khác.
- **Index trùng nhau**: `(Status)` thừa khi đã có `(Status, CreatedAt)`, vì index sau dùng được phần đầu khoá.

Nên chỉ tạo index cho query **thật sự chạy thường xuyên và thật sự chậm** (Query Store cho biết là query nào), và định kỳ xem index nào không ai đọc:

```sql
-- Index được đọc bao nhiêu lần, bị ghi bao nhiêu lần, từ lần khởi động SQL Server gần nhất
SELECT i.name, s.user_seeks, s.user_scans, s.user_lookups, s.user_updates
FROM sys.dm_db_index_usage_stats s
JOIN sys.indexes i ON i.object_id = s.object_id AND i.index_id = s.index_id
WHERE s.database_id = DB_ID() AND s.object_id = OBJECT_ID('dbo.Payouts');
```

`user_updates` cao mà seek/scan/lookup gần 0 là index chỉ tốn tiền.

**Cột ít giá trị khác nhau (selectivity thấp) không đáng index một mình.** `Status` chỉ có 4 giá trị. Index `(Status)` để tìm `Approved` (4,9 triệu dòng) thì vẫn là đọc gần cả bảng cộng Key Lookup, optimizer sẽ chọn Scan. Nhưng làm **cột đầu so sánh bằng** của index ghép thì nó tốt: nó gom các dòng cần tìm thành một khối, cột sau (`CreatedAt`) lo thứ tự và giới hạn. Câu hỏi đúng không phải "cột này có selective không" mà là "index này có đưa query tới một khối nhỏ, đúng thứ tự không".

## Câu hỏi phỏng vấn {#interview}

### Một query chậm trên production. Bạn điều tra thế nào? <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#slow-query}

::: tip Trả lời nhanh
Đo trước, sửa sau. Tìm query chậm (Query Store, log `Executed DbCommand`), chạy lại đúng câu SQL đó với `SET STATISTICS IO, TIME ON` và actual execution plan. Đọc plan từ phải sang trái, tìm mũi tên dày và bốn cờ đỏ: Scan cả bảng, Sort, Key Lookup, số dòng ước lượng lệch thật. Sửa bằng index đúng thứ tự cột, INCLUDE cột cần, bỏ `SELECT *`, hoặc cập nhật thống kê. Đo lại bằng logical reads. Xem [Đo](#measure), [Đọc plan](#read-plan), [Sửa](#fix).
:::

::: details Câu trả lời mẫu (English)
I measure before I change anything. First I find which query is slow, from Query Store in production or from the EF Core command log, which shows the SQL and its duration. Then I run that exact SQL in SSMS with `SET STATISTICS IO, TIME ON` and the actual execution plan. I care most about logical reads, because seconds depend on whether the pages are already cached. I read the plan from right to left and look for the thickest arrows and four red flags: a clustered index scan that reads the whole table, a sort because no index provides the order, key lookups because the index doesn't cover the columns, and a big gap between estimated and actual rows, which usually means stale statistics. For example, on our payouts table, a query for pending payouts ordered by creation date scanned 5 million rows and sorted 20,000. A composite index on status and created date, with the displayed columns included, turned it into a single index seek with no sort, and logical reads went from about 62,000 to about a hundred. Then I check that the write cost of the new index is acceptable.
:::

::: warning Bẫy & follow-up
**"Missing index hint trong plan gợi ý index rồi, tạo luôn được không?"**

Không nên tạo nguyên văn: nó không xét `ORDER BY`, hay nhét mọi cột vào INCLUDE, và không biết các index đã có. Xem [Missing index hint](#missing-index-hint).

**"Thêm index rồi mà vẫn chậm?"**

Xem lại plan: có thể còn Key Lookup cho từng dòng (index chưa phủ cột), optimizer bỏ index vì quá nhiều lookup, filtered index không khớp vì query dùng tham số, hoặc thống kê cũ. Xem [Đo lại](#re-measure).

**"Lúc nhanh lúc chậm với cùng một query?"**

Cache nóng/nguội (so logical reads thay vì giây), blocking do transaction khác giữ khoá, hoặc parameter sniffing. Query Store cho thấy plan có đổi không. Ở mức API, xem thêm [API chậm dần khi tải tăng](/aspnet-core/questions#slow-api).
:::

### `WHERE Status = 'Pending' ORDER BY CreatedAt`: tạo index gì? {#index-where-order-by}

::: tip Trả lời nhanh
Index ghép `(Status, CreatedAt)`: cột so sánh bằng đứng trước, cột sắp xếp đứng sau. Vì index sắp theo `Status` rồi tới `CreatedAt`, các dòng `Pending` nằm thành một khối đã đúng thứ tự: một lần seek, không Sort. Thêm `INCLUDE` các cột màn hình cần và bỏ `SELECT *` để hết Key Lookup. `Pending` chỉ là phần nhỏ thì có thể dùng filtered index `WHERE Status = 'Pending'`. Xem [Danh bạ](#btree), [Thứ tự cột](#column-order), [INCLUDE](#covering).
:::

::: details Câu trả lời mẫu (English)
A composite index on `(Status, CreatedAt)`. An index is a sorted copy of its key columns, so with status first, all pending rows sit together, and within that block they're already sorted by `CreatedAt`. The engine seeks to the first pending row and reads forward, with no full scan and no sort. The rule is equality columns first, then the range or sort column. If I put `CreatedAt` first, pending rows would be scattered across the whole index. To avoid key lookups, I include the columns the screen needs, like amount and affiliate id, and I stop selecting star so the index can cover the query. If pending is a small fraction of the table, a filtered index with `WHERE Status = 'Pending'` is much smaller, but the query has to use the literal value, not a parameter. For paging I use `TOP` with keyset pagination on `CreatedAt` and `Id` instead of a deep `OFFSET`.
:::

::: warning Bẫy & follow-up
**"Đảo thành `(CreatedAt, Status)` có được không?"**

Không cần Sort nhưng `Pending` rải khắp index, phải quét gần hết để lọc. Xem [hình danh bạ](#btree).

**"Đổi sang `ORDER BY Id` vì clustered index đã sắp sẵn?"**

Hết Sort nhưng vẫn phải quét tìm `Pending`, và `Id` không phải `CreatedAt` khi có import/backfill: đổi nghĩa query. Xem [ORDER BY Id](#order-by-id).

**"Index riêng trên `Status` và riêng trên `CreatedAt` có thay được không?"**

Không tốt bằng: mỗi index chỉ giải một nửa (tìm hoặc sắp xếp), optimizer thường chỉ dùng một rồi Sort hoặc Lookup phần còn lại.
:::

### Sao không index hết các cột cho nhanh? {#too-many-indexes}

::: tip Trả lời nhanh
Mỗi index là một bản sao đã sắp xếp phải cập nhật ở mọi INSERT, UPDATE cột của nó, và DELETE; thêm dung lượng, RAM, log. Bảng ghi nhiều như `Payouts` (tạo, duyệt, trả) sẽ chậm ghi. Index cột ít giá trị như `Status` một mình gần như vô dụng. Chỉ index query thường xuyên và chậm, gộp index trùng, và xoá index không ai đọc (`sys.dm_db_index_usage_stats`). Xem [Giá của index](#index-cost).
:::

::: details Câu trả lời mẫu (English)
Because every index is another sorted copy that the database has to keep in sync. Each insert writes to the table and to every index, and an update moves the entry in every index that contains the changed column. For example, approving a payout changes its status, so the entry moves from the pending block to the approved block. Indexes also cost disk, buffer pool memory and log volume. On a write-heavy table that adds up. And many single-column indexes don't help much anyway: an index on status alone has four distinct values, so the optimizer usually prefers a scan. I add indexes for queries that are frequent and slow, based on Query Store, I design composite indexes that serve several queries, I avoid duplicates where one index is a prefix of another, and I periodically check index usage stats to drop indexes that are written but never read.
:::

::: warning Bẫy & follow-up
**"Vậy cột selectivity thấp không bao giờ nên index?"**

Một mình thì yếu, nhưng làm cột đầu so sánh bằng của index ghép thì tốt: `(Status, CreatedAt)`. Xem [Giá của index](#index-cost).

**"Index có làm chậm SELECT không?"**

Không trực tiếp; nhưng nhiều index tương tự làm optimizer tốn thời gian chọn hơn, và chiếm RAM của buffer pool mà dữ liệu khác cần.
:::

## Hỏi đáp

### Vì sao số giây không đáng tin bằng logical reads {#seconds-vs-reads}

::: details "Chạy lần đầu 3 giây, lần hai 0,2 giây. Index có tác dụng chưa?"
Chưa biết. Lần đầu page phải đọc từ đĩa (physical reads), lần hai đã nằm trong buffer pool. Nhìn logical reads: nếu cả hai lần đều 62.500 thì query vẫn đọc cả bảng, chỉ là đọc từ RAM. Production có lúc RAM bị dữ liệu khác chiếm, khi đó lại về 3 giây. Index có tác dụng khi logical reads giảm.
:::

::: details "Clustered index có phải luôn là khoá chính không?"
Mặc định trên SQL Server thì khoá chính được tạo thành clustered index, và EF Core làm theo mặc định đó. Nhưng hai thứ độc lập: có thể đặt clustered index lên cột khác và để khoá chính là nonclustered. Bảng chỉ có một clustered index vì dữ liệu chỉ sắp được theo một thứ tự. Khoá `Id` identity tăng dần là lựa chọn an toàn vì insert luôn nối vào cuối, không phải chen giữa.
:::

## Tự kiểm tra {#self-check}

::: details 1. Vì sao so logical reads chứ không so số giây?
Số giây đổi theo cache nóng/nguội và tải của server; logical reads là số page query cần đọc, gần như cố định giữa các lần chạy.
:::

::: details 2. Plan có Index Seek nhưng vẫn chậm, kèm Nested Loops và Key Lookup. Chuyện gì xảy ra, sửa thế nào?
Index tìm được dòng nhưng thiếu cột, nên mỗi dòng nhảy về clustered index lấy phần còn lại. Thêm cột cần vào `INCLUDE` và bỏ `SELECT *` để index phủ được query.
:::

::: details 3. Index (CreatedAt, Status) cho query WHERE Status = 'Pending' ORDER BY CreatedAt: có Sort không? Có nhanh không?
Không Sort, vì đọc index theo `CreatedAt` là đúng thứ tự. Nhưng không nhanh: `Pending` rải khắp index nên phải quét gần hết để lọc.
:::

::: details 4. Có filtered index WHERE Status = 'Pending', query EF viết p.Status == status (biến). Có dùng được index không?
Không: biến thành tham số SQL, plan phải đúng với mọi giá trị nên không dùng được index chỉ chứa `Pending`. Viết hằng số `PayoutStatus.Pending` trong biểu thức thì EF đưa literal vào SQL.
:::

::: details 5. Đổi ORDER BY CreatedAt thành ORDER BY Id: được gì, mất gì?
Được: hết Sort (clustered index đã sắp theo `Id`). Mất: vẫn quét tìm `Pending`; thứ tự sai khi có dữ liệu import hoặc `CreatedAt` là giờ nghiệp vụ; nghĩa query đổi mà không ai thấy.
:::

::: details 6. Index (Status) và index (Status, CreatedAt) cùng tồn tại. Nên làm gì?
Xoá `(Status)`: index sau dùng được phần đầu khoá cho mọi query chỉ lọc `Status`, còn index trước chỉ làm chậm ghi.
:::
