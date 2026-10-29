---
title: "Collections & LINQ"
---

# Collections & LINQ

Câu hỏi ở đây thường không dừng ở "khác nhau thế nào" mà hỏi tiếp "bên trong nó cài đặt ra sao" và "<T k="big-o">độ phức tạp</T> bao nhiêu".

## Độ phức tạp cần thuộc {#complexity}

| Collection | Truy cập | Tìm | Thêm | Xóa | Bên trong |
|---|---|---|---|---|---|
| `T[]` | O(1) | O(n) | không đổi kích thước | không | Vùng nhớ liên tục |
| `List<T>` | O(1) | O(n) | O(1)* cuối, O(n) giữa | O(n) | Array, đầy thì cấp mảng gấp đôi và copy |
| `Dictionary<K,V>` | O(1)* theo key | O(1)* | O(1)* | O(1)* | <T>Hash table</T>: bucket theo `GetHashCode`, so khớp bằng `Equals` |
| `HashSet<T>` | không | O(1)* | O(1)* | O(1)* | Như Dictionary nhưng chỉ có key |
| `SortedDictionary` | O(log n) | O(log n) | O(log n) | O(log n) | Cây đỏ đen, luôn có thứ tự |
| `LinkedList<T>` | O(n) | O(n) | O(1) nếu có node | O(1) nếu có node | Danh sách liên kết đôi |
| `Queue` / `Stack` | chỉ phần tử đầu/đỉnh | O(1)* | O(1) | Array vòng / array |

* trung bình hoặc <T>amortized</T>. Dictionary/HashSet tệ nhất là O(n) khi hash bị trùng nhiều.

## Dictionary hoạt động bên trong thế nào? {#dictionary}

::: tip Trả lời nhanh
Gọi `GetHashCode()` của key để chọn <T>bucket</T>, rồi dùng `Equals()` để tìm đúng key trong bucket đó. Vì vậy tra cứu trung bình là O(1). Nếu nhiều key có cùng hash, chúng dồn vào cùng một chuỗi và tra cứu chậm dần tới O(n).
:::

::: warning Bẫy & follow-up
**"Dùng object tự định nghĩa làm key cần gì?"**

Override cả `Equals` và `GetHashCode` (hoặc dùng record), và key phải bất biến. Sửa field tham gia vào hash sau khi đã thêm vào Dictionary thì key coi như "biến mất".

**"Dictionary có giữ thứ tự thêm vào không?"**

Không được đảm bảo, dù thực tế thường thấy đúng thứ tự khi chưa xóa phần tử nào. Đừng dựa vào nó.

**"Dữ liệu tra cứu nạp một lần rồi đọc rất nhiều thì dùng gì?"**

`FrozenDictionary` (.NET 8): tạo chậm hơn nhưng đọc nhanh hơn, và không sửa được.
:::

## Nên nhận và trả về kiểu collection nào? {#collection-types}

::: tip Trả lời nhanh
Tham số: nhận kiểu **tổng quát nhất** mà method cần (`IEnumerable<T>` nếu chỉ duyệt). Giá trị trả về: trả kiểu **cụ thể vừa đủ** để caller dùng thuận tiện, thường là `IReadOnlyList<T>` hoặc `IReadOnlyCollection<T>` khi dữ liệu đã nạp xong.
:::

::: warning Bẫy & follow-up
**"Trả về `IEnumerable<T>` từ repository có vấn đề gì?"**

Caller không biết dữ liệu đã nạp hay chưa. Nếu bên dưới là query chưa chạy, mỗi lần duyệt lại là một lần query DB, và có thể chạy sau khi <T>DbContext</T> đã bị <T>dispose</T>. Trả `IReadOnlyList` sau khi `ToListAsync()` thì rõ ràng hơn.
:::

## `IEnumerable` vs `IQueryable` <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#ienumerable-vs-iqueryable}

::: tip Trả lời nhanh
`IEnumerable` chạy <T>LINQ</T> trong memory, nhận <T>delegate</T> (`Func<T,bool>`). `IQueryable` nhận <T>expression tree</T> (`Expression<Func<T,bool>>`), một cấu trúc dữ liệu mô tả biểu thức, để provider như <T k="ef core">EF</T> dịch sang SQL và lọc ngay trong database.
:::

::: info Bản chất
```csharp
// Lọc trong SQL: WHERE Amount > 100
var a = await db.Payouts.Where(p => p.Amount > 100).ToListAsync();

// AsEnumerable() chuyển sang LINQ to Objects:
// kéo TOÀN BỘ bảng về rồi mới lọc trong memory
var b = db.Payouts.AsEnumerable().Where(p => p.Amount > 100).ToList();
```
:::

::: details Ở dự án thật
Bạn đang dùng LINQ to SQL nên khái niệm này quen: cũng là `IQueryable` dịch sang SQL. Lỗi hay gặp khi review code là có một bước `.ToList()` hoặc `AsEnumerable()` đặt quá sớm, sau đó mới `Where`/`Take`. Chạy dev với dữ liệu nhỏ không sao, lên production với hàng triệu dòng thì chậm.
:::

::: warning Bẫy & follow-up
**"Gọi method C# của mình bên trong `Where` của `IQueryable` thì sao?"**

EF không dịch được sang SQL. Từ EF Core 3.0 nó ném lỗi thay vì âm thầm kéo dữ liệu về lọc trong memory như EF Core 2.x từng làm.

**"Repository có nên trả `IQueryable` không?"**

Linh hoạt cho caller, nhưng làm rò rỉ chi tiết EF ra ngoài: caller có thể viết query không dịch được, và không còn chỗ tập trung để tối ưu query. Đây là trade-off, nói rõ bạn chọn bên nào và vì sao.
:::

## Deferred execution và multiple enumeration {#deferred-execution}

::: tip Trả lời nhanh
Phần lớn toán tử LINQ (`Where`, `Select`, `OrderBy`) chỉ dựng ra một "công thức", chưa chạy gì. Query chạy khi được duyệt: `foreach`, `ToList`, `Count`, `First`... Và **mỗi lần duyệt là chạy lại từ đầu**.
:::

::: info Bản chất
```csharp
var pending = payouts.Where(p => p.Status == Pending);  // chưa chạy

if (pending.Any())                  // chạy lần 1
    foreach (var p in pending) {}   // chạy lần 2: với IQueryable là 2 lần query DB

var list = pending.ToList();        // chạy 1 lần, dùng lại list

int min = 100;
var big = orders.Where(o => o.Amount > min);
min = 1000;                         // query dùng giá trị LÚC CHẠY, không phải lúc khai báo
var n = big.Count();                // lọc với 1000
```

`yield return` cũng tạo ra deferred execution: compiler sinh một <T>state machine</T> iterator, mỗi lần `MoveNext()` mới chạy tới `yield` kế tiếp.
:::

::: warning Bẫy & follow-up
**"Rider/ReSharper báo 'Possible multiple enumeration' nghĩa là gì?"**

Biến `IEnumerable` đó đang bị duyệt nhiều lần. Nếu nguồn đắt (DB, file, generator) thì vật hóa một lần bằng `ToList()`.
:::

## Các cặp toán tử LINQ hay bị hỏi {#linq-pairs}

::: info Bản chất
| Cặp | Khác nhau |
|---|---|
| `First` / `Single` | `First` lấy phần tử đầu, dừng ngay khi gặp. `Single` khẳng định có đúng 1, phải quét tiếp để chắc không có cái thứ 2 (SQL dùng `TOP 2`). Không có phần tử: cả hai ném lỗi; bản `OrDefault` trả default. |
| `Any()` / `Count() > 0` | `Any` dừng ở phần tử đầu tiên (SQL `EXISTS`); `Count` phải đếm hết. |
| `Select` / `SelectMany` | `Select` biến mỗi phần tử thành 1 giá trị; `SelectMany` trải phẳng danh sách con (merchant → tất cả transaction). |
| `GroupBy` / `ToLookup` | `GroupBy` <T k="deferred execution">deferred</T>; `ToLookup` chạy ngay và cho tra cứu theo key nhiều lần. |
| `Distinct` / `DistinctBy` | `DistinctBy(x => x.Email)` (.NET 6) lọc trùng theo một thuộc tính. |
:::

::: details Live coding hay gặp
```csharp
// Group anagrams: ["eat","tea","tan","ate","nat","bat"]
var groups = words
    .GroupBy(w => new string(w.Order().ToArray()))
    .Select(g => g.ToList())
    .ToList();

// Đếm tần suất từ
var freq = text.Split(' ', StringSplitOptions.RemoveEmptyEntries)
    .GroupBy(w => w.ToLowerInvariant())
    .ToDictionary(g => g.Key, g => g.Count());

// Ký tự lặp đầu tiên: dùng HashSet, O(n)
var seen = new HashSet<char>();
char? firstRepeat = s.FirstOrDefault(c => !seen.Add(c));
```

Khi live coding, nói độ phức tạp ngay sau khi viết xong: group anagram là O(n · k log k) với k là độ dài từ.
:::

::: warning Bẫy & follow-up
**"LINQ có chậm không?"**

Có overhead (delegate, iterator, cấp phát) so với vòng lặp tay. Với code business thì không đáng kể so với một lần gọi DB, nên ưu tiên đọc dễ. Chỉ thay bằng vòng lặp ở hot path sau khi đã đo.
:::

## Big-O và các bẫy O(n²) ẩn trong code business {#hidden-on2}

::: tip Trả lời nhanh
<T>Big-O</T> đo số bước tăng theo kích thước dữ liệu n, bỏ qua hằng số. Nó trả lời câu hỏi "dữ liệu tăng gấp 10 thì code chậm đi bao nhiêu lần". Khi n = 10.000: O(1) ≈ 1, O(log n) ≈ 14, O(n) = 10.000, O(n log n) ≈ 130.000, O(n²) = 100 triệu.
:::

::: info Bản chất: vì sao ghép string trong vòng lặp là O(n²)
Mỗi lần `+=` tạo string mới và copy toàn bộ phần đã có. Tổng lượng copy là 1 + 2 + … + n ≈ n²/2. Export 10.000 dòng, file cuối 1MB, thì tổng copy khoảng 5GB. `StringBuilder` ghi tiếp vào buffer, đầy thì nhân đôi, nên tổng copy chưa tới 2 lần kích thước cuối: O(n).
:::

::: details Ở dự án thật
O(n²) hiếm khi là hai vòng `for` rõ ràng. Thường nó là một method LINQ nằm trong vòng lặp:

```csharp
// O(n × m): mỗi payout quét lại cả danh sách merchant
foreach (var p in payouts)
    var m = merchants.First(x => x.Id == p.MerchantId);

// O(n + m): dựng Dictionary một lần, tra O(1)
var byId = merchants.ToDictionary(x => x.Id);
foreach (var p in payouts)
    var m = byId[p.MerchantId];
```

| Bên trong vòng lặp | Thay bằng |
|---|---|
| `Contains`, `Any`, `First`, `Where` trên List | `HashSet`, `Dictionary`, `ToLookup` dựng trước vòng lặp |
| `list.Remove`, `Insert(0, …)` | `RemoveAll`, hoặc lọc một lần |
| `str += …` | `StringBuilder`, `string.Join` |
| `Count()`, `ElementAt(i)` trên `IEnumerable` | `ToList()` một lần trước vòng lặp |
| SQL join trên cột không có index | Thêm index |
:::

::: warning Bẫy & follow-up
**Sau khi viết xong lời giải, nói luôn cả time lẫn space**

"Time O(n + m), space O(m) cho Dictionary; cách dùng `First` trong vòng lặp là O(n × m)." Đổi bộ nhớ lấy tốc độ là đánh đổi bình thường, nhưng nên nói rõ ra.

**"Lúc nào O(n²) vẫn chấp nhận được?"**

Khi n nhỏ và cố định, ví dụ vài chục currency. Chỉ tối ưu khi n lớn lên theo dữ liệu thật: số merchant, số transaction, số dòng export.
:::
