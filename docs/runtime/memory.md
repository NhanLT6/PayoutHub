---
title: "Runtime & Memory"
---

# Runtime & Memory

Phần "đánh đố" nhiều nhất. Phân biệt mid với senior nằm ở chỗ biết những câu trả lời phổ biến bị đơn giản hóa sai ở đâu.

## Code C# chạy như thế nào? CLR, IL, JIT {#clr-il-jit}

::: tip Trả lời nhanh
Compiler (Roslyn) dịch C# ra **IL** kèm metadata trong file .dll. Lúc chạy, **CLR** load assembly, và **JIT** dịch IL ra mã máy ở lần đầu một method được gọi. CLR còn lo GC, type safety, exception handling và thread pool.
:::

::: info Bản chất
- **Tiered compilation**: lần đầu JIT nhanh nhưng tối ưu ít (tier 0); method nào gọi nhiều thì được JIT lại tối ưu hơn (tier 1). Từ .NET 8, **Dynamic PGO** bật mặc định: JIT dùng dữ liệu chạy thật để tối ưu.
- **ReadyToRun**: biên dịch sẵn một phần ra mã máy để khởi động nhanh hơn, vẫn có JIT.
- **Native AOT** (.NET 7+): biên dịch hết ra mã máy lúc publish, không có IL + JIT lúc chạy. Lợi: khởi động gần như tức thì, ít RAM, không cần cài runtime → hợp serverless, container cần scale nhanh, CLI. Giá: hạn chế reflection và sinh code động (trimming cắt code không thấy được dùng).
:::

::: warning Bẫy & follow-up
**"Vì sao lần gọi API đầu tiên sau khi deploy chậm?"**

JIT, load assembly, khởi tạo DI, mở connection pool, warm cache. Giảm bằng ReadyToRun, warm-up endpoint hoặc health check trước khi nhận traffic.

**"ASP.NET Core app nào cũng publish Native AOT được?"**

Không. MVC Controllers **không** hỗ trợ AOT vì dựa nhiều vào reflection. Minimal API hỗ trợ, nhờ source generator sinh code binding lúc compile. Đây là một lý do để chọn [Minimal API](/aspnet-core/questions#controllers-vs-minimal).
:::

## Value type vs reference type, stack vs heap <Badge type="warning" text="hay bị trả lời sai" /> {#value-vs-reference}

::: tip Trả lời nhanh
Value type chứa dữ liệu trực tiếp, gán là copy. Reference type chứa tham chiếu tới object trên managed heap, gán là copy tham chiếu. **Value type nằm ở đâu là tùy chỗ nó được khai báo**: biến local thường nằm trên stack, nhưng là field của class hoặc phần tử của array thì nằm trên heap, bên trong object đó.
:::

::: info Bản chất
```csharp
class Order { public int Id; public decimal Amount; } // Id, Amount nằm TRONG object Order, trên heap

void Handle()
{
    int count = 5;               // local value type: stack (hoặc thanh ghi)
    var order = new Order();     // biến 'order' (tham chiếu) trên stack, object trên heap
    int[] ids = new int[3];      // array là reference type: cả 3 int nằm trên heap
    Func<int> f = () => count;   // 'count' bị closure capture: chuyển lên heap
}
```

Stack: mỗi thread một vùng nhỏ (mặc định khoảng 1MB), cấp phát và giải phóng bằng cách dịch con trỏ, tự dọn khi method kết thúc. Heap: dùng chung, do GC quản lý.
:::

::: details Cách nói của senior
"Câu 'value type nằm trên stack' là cách nói đơn giản hóa. Vị trí lưu là chi tiết cài đặt; cái quan trọng khi code là ngữ nghĩa copy. Ví dụ trong async method, các biến local bị đưa thành field của state machine, nên chúng cũng có thể lên heap."
:::

::: warning Bẫy & follow-up
**"Struct luôn nằm trên stack đúng không?"**

Không. Field của class, phần tử array, biến bị closure hoặc async capture, hoặc bị boxing đều nằm trên heap. Chỉ `ref struct` (như `Span<T>`) là bị ép chỉ được nằm trên stack.

**"StackOverflowException khi nào?"**

Gần như luôn do đệ quy không có điểm dừng (kể cả property gọi lại chính nó). Không catch được: process chết luôn.
:::

## Boxing / unboxing {#boxing}

::: tip Trả lời nhanh
Boxing là bọc một value type vào object trên heap để dùng nó như `object` hoặc interface. Unboxing là lấy giá trị ra, cần ép đúng kiểu. Tốn chi phí vì cấp phát heap, copy dữ liệu và tạo việc cho GC.
:::

::: info Bản chất: boxing hay ẩn ở đâu
- Collection không generic: `ArrayList`, `Hashtable`, `DataTable` (code cũ hay gặp).
- Gán struct cho biến kiểu interface: `IComparable c = 5;`
- `string.Format("{0}", count)` và tham số `params object[]`. String interpolation từ .NET 6 dùng interpolated string handler nên không còn box.
- Gọi method của `object` mà struct không override (`ToString`, `GetHashCode`, `Equals`).

```csharp
object o = 5;          // box một int
long l = (long)o;      // InvalidCastException: phải unbox về đúng int trước
long ok = (int)o;      // unbox về int rồi mới đổi sang long
```
:::

::: warning Bẫy & follow-up
**"Generic giúp tránh boxing thế nào?"**

Với value type, JIT sinh code riêng cho từng kiểu (`List<int>` có code riêng), nên phần tử được lưu thẳng là `int`, không cần bọc vào object.
:::

## GC hoạt động thế nào? <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#gc}

::: tip Trả lời nhanh
Managed heap được chia thành 3 generation. Object mới vào Gen0; sống sót qua một lần GC thì được đẩy lên Gen1, rồi Gen2. Khi GC chạy, nó tìm các object còn được tham chiếu từ các **root** (biến local đang dùng, static field, thanh ghi CPU, GC handle), đánh dấu chúng, phần còn lại là rác. Sau đó nó **compact**: dồn object còn sống lại cho heap liền mạch. Thu Gen0 rất thường xuyên và rẻ; Gen2 (full GC) hiếm và đắt.
:::

::: info Bản chất
- **Giả thuyết generation**: phần lớn object chết trẻ (biến tạm trong một request). Nên chỉ quét vùng nhỏ chứa object mới là đủ dọn phần lớn rác.
- **LOH** (Large Object Heap): object từ **85.000 byte** trở lên (thường là array lớn, string lớn). Chỉ được dọn cùng Gen2 và mặc định không compact, nên dễ bị phân mảnh.
- **POH** (.NET 5+): vùng riêng cho object bị pin (truyền buffer cho native code), để chúng không cản việc compact.
- Lúc GC chạy, các thread của app có thể bị tạm dừng. **Background GC** cho phép Gen2 chạy song song với app.
:::

::: details Ở dự án thật
Ví dụ dễ kể: export báo cáo bằng cách load cả bảng vào `List` rồi build một string CSV khổng lồ. Mỗi lần export sinh ra nhiều object trên LOH, đẩy Gen2 chạy liên tục, server giật lúc có nhiều người export. Cách sửa: đọc theo trang hoặc stream (`IAsyncEnumerable`, ghi thẳng ra response stream) thay vì giữ hết trong bộ nhớ.
:::

::: warning Bẫy & follow-up
**"C# khác C++ về quản lý bộ nhớ thế nào?"**

C++ tự `new`/`delete` (hoặc smart pointer, RAII): giải phóng ngay, xác định được thời điểm, nhưng dễ leak và dangling pointer. C# có GC: an toàn hơn, nhưng không biết chính xác lúc nào bộ nhớ được thu và có thể có pause.
:::

## GC chạy khi nào? Làm sao biết nó đang chạy và có vấn đề? {#gc-diagnostics}

::: tip Trả lời nhanh
GC tự quyết định. Các trigger chính:

- **Hết allocation budget của Gen0**: nguyên nhân phổ biến nhất. Budget không phải số cố định; runtime tự điều chỉnh theo cache CPU và tỷ lệ object sống sót.
- Cấp phát trên LOH vượt ngưỡng, có thể kéo theo Gen2.
- Hệ điều hành báo thiếu memory, hoặc process gần chạm memory limit của container.
- Code gọi `GC.Collect()`.
:::

::: info Bản chất: cách quan sát
- `dotnet-counters monitor -p <pid>`: xem _gen-0/1/2-gc-count_, _% Time in GC_, _GC Heap Size_, _Allocation Rate_ theo thời gian thực.
- `GC.CollectionCount(0|1|2)`, `GC.GetGCMemoryInfo()` trong code.
- `dotnet-trace` / PerfView để xem từng lần GC; `dotnet-gcdump` hoặc dotMemory (Rider) để xem object nào chiếm heap.
- Production: metric GC xuất qua OpenTelemetry/Application Insights.

Dấu hiệu có vấn đề: % time in GC cao kéo dài, Gen2 count tăng nhanh, heap size tăng mãi không giảm (leak).
:::

::: warning Bẫy & follow-up
**"Có nên gọi `GC.Collect()` không?"**

Hầu như không. Nó phá heuristic của runtime, và còn đẩy object đang sống lên generation cao hơn, làm GC sau đắt hơn. Ngoại lệ: benchmark, test, hoặc ngay sau khi giải phóng một lượng lớn dữ liệu một lần và biết chắc app sắp rảnh.

**"Workstation GC và Server GC khác nhau thế nào?"**

Workstation: một heap, ưu tiên pause ngắn, ít memory, mặc định cho app desktop. Server: mỗi core một heap và một GC thread, throughput cao hơn nhưng tốn memory hơn, mặc định cho ASP.NET Core. Từ .NET 9, chế độ **DATAS** bật mặc định với Server GC để tự co giãn số heap theo tải, hợp với container.
:::

## `IDisposable`, `using`, finalizer {#idisposable}

::: tip Trả lời nhanh
GC chỉ dọn managed memory. Tài nguyên bên ngoài (DB connection, file handle, socket) phải được giải phóng chủ động qua `Dispose()`, thường bằng `using`. Finalizer chỉ là lưới an toàn cuối cho unmanaged resource: không biết lúc nào chạy, và làm object sống thêm ít nhất một vòng GC.
:::

::: info Bản chất
```csharp
using var conn = new SqlConnection(cs);        // using declaration: Dispose khi ra khỏi scope
await using var stream = File.OpenWrite(path);  // IAsyncDisposable: DisposeAsync

// Dispose pattern đầy đủ chỉ cần khi class TỰ giữ unmanaged resource.
// Thực tế: bọc handle trong SafeHandle, class của bạn chỉ cần Dispose bình thường.
```
:::

::: warning Bẫy & follow-up
**"Dispose có giải phóng memory không?"**

Không trực tiếp. Dispose trả tài nguyên bên ngoài (đóng connection, trả về pool). Bộ nhớ của chính object vẫn chờ GC thu.

**"Gọi Dispose hai lần thì sao?"**

Phải an toàn: Dispose cần idempotent.

**"HttpClient có nên bọc trong `using` cho mỗi request không?"**

Không. Mỗi lần dispose là đóng connection; socket kẹt ở TIME_WAIT, tải cao sẽ hết socket. Dùng `IHttpClientFactory`, hoặc một `HttpClient` dùng chung với `SocketsHttpHandler.PooledConnectionLifetime` để vẫn cập nhật DNS.

**"DbContext có tự dispose không?"**

Lấy từ DI thì container dispose khi hết scope (hết request). Tự `new` hoặc lấy qua `IDbContextFactory` thì phải tự `using`.
:::

## Có GC rồi sao vẫn bị memory leak? {#memory-leak}

::: tip Trả lời nhanh
GC chỉ thu object không còn ai tham chiếu. Leak trong .NET nghĩa là vô tình giữ tham chiếu lâu hơn cần thiết.
:::

::: info Nguồn hay gặp
- Static collection hoặc cache tự viết, chỉ thêm không bao giờ xóa.
- Đăng ký `event` mà không hủy: publisher sống lâu giữ luôn subscriber.
- Singleton giữ object scoped (captive dependency).
- `Timer` chưa dispose; closure capture object lớn.
- Resource unmanaged chưa dispose.
:::

::: details Ở dự án thật
App Web Forms hay có `static Dictionary` làm cache tra cứu (danh sách merchant, tỷ giá) mà không có hết hạn. Memory của w3wp tăng dần cho tới khi app pool recycle. Cách đúng: `MemoryCache` có expiration và `SizeLimit`. Cách tìm: chụp 2 bản heap cách nhau một khoảng thời gian rồi so sánh xem loại object nào tăng.
:::

## `Span<T>`, `Memory<T>`, `ArrayPool` <Badge type="warning" text="điểm cộng senior" /> {#span-memory}

::: tip Trả lời nhanh
`Span<T>` là một "cửa sổ" nhìn vào vùng nhớ liên tục (array, stack, native) mà không copy. Nó là `ref struct` nên chỉ sống trên stack: không làm field của class, không giữ qua `await`. Cần giữ lâu hơn thì dùng `Memory<T>`. `ArrayPool<T>.Shared` cho mượn và trả lại buffer để không cấp phát mảng mới mỗi lần.
:::

::: info Bản chất
```csharp
// Cắt chuỗi không tạo string mới
ReadOnlySpan<char> line = "AU,merchant-42,120.50";
int i = line.IndexOf(',');
ReadOnlySpan<char> country = line[..i];     // không cấp phát
decimal amount = decimal.Parse(line[(line.LastIndexOf(',') + 1)..]);
```
:::

::: warning Bẫy & follow-up
**"Bạn có dùng mấy thứ này ở code business không?"**

Câu trả lời thật: hiếm. Chúng đáng dùng ở hot path (parse file lớn, xử lý luồng dữ liệu nhiều). Code business thường bị chậm vì query và I/O trước, nên đo trước rồi mới tối ưu ở mức này.
:::
