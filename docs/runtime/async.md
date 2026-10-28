---
title: "Async & Concurrency"
---

# Async & Concurrency

Chủ đề hỏi sâu nhất và cũng có nhiều chỗ liên quan trực tiếp tới Web Forms 4.8, nên kinh nghiệm hiện tại của bạn là lợi thế ở phần này.

## Async/await giải quyết vấn đề gì? {#why-async}

::: tip Trả lời nhanh
Giải phóng thread trong lúc chờ I/O (DB, HTTP, file), để thread đó phục vụ request khác. Nó **không làm một request nhanh hơn**; nó giúp server chịu được nhiều request đồng thời hơn với cùng số thread. Với việc nặng CPU thì async không giúp gì; đó là bài toán parallelism.
:::

::: info Bản chất
|  | I/O-bound | CPU-bound |
|---|---|---|
| Ví dụ | Query DB, gọi API, đọc file | Tính toán, nén, resize ảnh, parse lớn |
| Thời gian đi đâu | Chờ thiết bị/mạng trả lời | CPU đang tính |
| Công cụ | `async`/`await` với API async thật | `Parallel`, PLINQ, `Task.Run` (ở app UI) |

Trong lúc chờ một I/O async, **không có thread nào bị block** để chờ cả. Hệ điều hành báo lại khi dữ liệu về (I/O completion port), lúc đó mới cần một thread để chạy tiếp phần code sau `await`.
:::

::: details Ở dự án thật
Một page Web Forms đồng bộ gọi API bên ngoài mất 3 giây giữ nguyên một thread của IIS trong 3 giây. Lúc đông người, request phải xếp hàng dù CPU gần như rảnh. Đây là triệu chứng điển hình nên dùng async.
:::

## `await` thực sự chạy thế nào? <Badge type="warning" text="câu &quot;under the hood&quot;" /> {#how-await-works}

::: tip Trả lời nhanh
Compiler biến method `async` thành một state machine. Tại mỗi `await`, nếu task chưa xong, method lưu lại trạng thái, đăng ký "phần còn lại" làm continuation rồi trả về một Task chưa hoàn thành cho caller, trả thread lại. Khi task xong, continuation được lên lịch chạy tiếp từ đúng chỗ đã dừng.
:::

::: info Bản chất: từng bước
1. Compiler sinh một struct implement `IAsyncStateMachine`; biến local trở thành field của nó.
2. Method chạy **đồng bộ** trên thread của caller cho tới `await` đầu tiên.
3. Tại `await`: lấy awaiter của task. Nếu `IsCompleted` đã là true thì chạy tiếp luôn, không đổi thread (fast path).
4. Nếu chưa xong: lưu số state, đăng ký continuation, return. Lúc này state machine mới bị đưa lên heap.
5. Khi task xong: continuation được post về **SynchronizationContext** đã capture (UI thread, ASP.NET Framework); nếu không có thì chạy trên thread pool.
6. State machine nhảy tới đúng state, chạy tiếp; cuối cùng set kết quả hoặc exception vào Task đã trả về cho caller.
:::

::: warning Bẫy & follow-up
**"Method async có luôn chạy trên thread khác không?"**

Không. Nó có thể chạy từ đầu tới cuối trên cùng một thread nếu mọi thứ đã xong sẵn (ví dụ đọc từ cache). `async` không tạo thread.

**"Có `async` mà không có `await` thì sao?"**

Compiler cảnh báo CS1998, method chạy đồng bộ hoàn toàn mà vẫn tốn chi phí state machine.

**"Return thẳng Task thay vì `return await` được không?"**

Được và nhẹ hơn, nhưng nguy hiểm khi đang trong `using` hoặc `try/catch`: object bị dispose trước khi task xong, và exception không được catch ở đó. Mặc định cứ `await`; chỉ bỏ ở method một dòng chuyển tiếp đơn giản.
:::

## Task vs Thread. Khi nào dùng `Task.Run`? {#task-vs-thread}

::: tip Trả lời nhanh
**Thread** là thread thật của OS: tốn bộ nhớ stack, tạo và hủy đắt. **Task** đại diện cho một việc sẽ xong trong tương lai (giống promise); nó không nhất thiết gắn với thread nào, và thường chạy trên thread pool. `Task.Run` đẩy việc CPU sang thread pool.
:::

::: info Bản chất
- Ở app UI: `Task.Run` để việc nặng không làm đơ UI thread. Hợp lý.
- Ở ASP.NET Core: request vốn đã chạy trên thread pool. Bọc `Task.Run` quanh I/O hay "cho nhanh" chỉ là đổi thread này lấy thread khác cộng thêm overhead.
- Thread pool thêm thread khá chậm khi bị thiếu. Đây là gốc của chuyện thread pool starvation (xem câu deadlock bên dưới).
:::

::: warning Bẫy & follow-up
**"Muốn trả response ngay rồi xử lý tiếp phía sau (fire-and-forget) thì làm thế nào?"**

Đừng `_ = Task.Run(...)` trong controller: exception bị nuốt, và DbContext/scoped service đã bị dispose khi request kết thúc. Cách đúng: đẩy job vào một queue (`Channel<T>` trong process, hoặc message queue), một `BackgroundService` đọc ra xử lý và tự tạo scope riêng cho mỗi job.

```csharp
public class PayoutWorker(Channel<int> queue, IServiceScopeFactory scopes) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await foreach (var payoutId in queue.Reader.ReadAllAsync(ct))
        {
            using var scope = scopes.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<IPayoutService>();
            await svc.ProcessAsync(payoutId, ct);
        }
    }
}
```
:::

## Concurrency vs parallelism {#concurrency-vs-parallelism}

::: tip Trả lời nhanh
**Concurrency**: nhiều việc cùng đang dở dang, có thể xen kẽ nhau trên ít thread (thường là chờ I/O). **Parallelism**: nhiều việc thật sự chạy cùng lúc trên nhiều core (việc CPU). Parallelism là một dạng của concurrency, nhưng không phải ngược lại.
:::

::: info Bản chất
```csharp
// Tuần tự: tổng = 3 lần chờ
var merchant = await GetMerchantAsync(id);
var stats    = await GetStatsAsync(id);
var payouts  = await GetPayoutsAsync(id);

// Concurrent: tổng ≈ lần chờ lâu nhất (khi 3 việc độc lập nhau)
var mTask = GetMerchantAsync(id);
var sTask = GetStatsAsync(id);
var pTask = GetPayoutsAsync(id);
await Task.WhenAll(mTask, sTask, pTask);

// Nhiều I/O có giới hạn đồng thời
await Parallel.ForEachAsync(merchantIds,
    new ParallelOptions { MaxDegreeOfParallelism = 8, CancellationToken = ct },
    async (id, token) => await SyncMerchantAsync(id, token));
```
:::

::: warning Bẫy & follow-up
**"Dùng `Parallel.ForEach` để gọi 100 API được không?"**

Sai công cụ: nó dành cho việc CPU, và với code async bên trong sẽ thành `async void` hoặc block thread. Dùng `Parallel.ForEachAsync` có giới hạn, hoặc `SemaphoreSlim` + `Task.WhenAll`.

**"Chạy 3 query song song trên cùng một DbContext?"**

Lỗi "A second operation was started on this context". DbContext không thread-safe. Mỗi task phải có context riêng (qua `IDbContextFactory`), hoặc chạy tuần tự.
:::

## SynchronizationContext và `ConfigureAwait(false)` {#configureawait}

::: tip Trả lời nhanh
SynchronizationContext quyết định phần code sau `await` chạy ở đâu. App UI (WinForms, WPF) và ASP.NET Framework có context riêng; ASP.NET Core và console app thì không có. `ConfigureAwait(false)` nghĩa là "không cần quay lại context cũ", chạy tiếp trên thread pool là được.
:::

::: info Bản chất
| Môi trường | Có context? | Có cần `ConfigureAwait(false)`? |
|---|---|---|
| WinForms / WPF / MAUI | Có: UI thread | Trong library: có. Code UI: không, vì cần quay về UI thread để cập nhật control |
| ASP.NET Framework (Web Forms, MVC 5) | Có: `AspNetSynchronizationContext`, giữ `HttpContext.Current`, culture | Trong library: có. Nhưng sau nó thì `HttpContext.Current` là null |
| ASP.NET Core | Không | Code app: không cần. Library: vẫn nên dùng, vì không biết ai sẽ gọi nó |
| Console | Không | Không ảnh hưởng |
:::

::: details Ở dự án thật
Bug dễ gặp trong Web Forms: helper async có `ConfigureAwait(false)`, sau đó code đọc `HttpContext.Current.User` và gặp NullReferenceException, vì phần sau await đang chạy trên thread pool, ngoài request context. Cách nhìn đúng: library thuần (gọi API, truy DB) thì dùng `ConfigureAwait(false)`; code nào cần HttpContext thì lấy giá trị ra trước `await`.
:::

::: warning Bẫy & follow-up
**"Chỉ cần đặt `ConfigureAwait(false)` ở `await` đầu tiên là đủ?"**

Không. Nếu task đó đã xong sẵn, code chạy tiếp đồng bộ và vẫn đang ở context cũ; các `await` sau lại capture context. Trong library phải đặt ở mọi `await`.

**"Có gì mới không?"**

.NET 8 có `ConfigureAwait(ConfigureAwaitOptions)`, ví dụ `SuppressThrowing` để chờ một task mà không ném exception, `ForceYielding` để luôn chạy tiếp bất đồng bộ.
:::

## Deadlock xảy ra khi nào? <Badge type="warning" text="câu kinh điển" /> {#deadlock}

::: tip Trả lời nhanh
Cần đủ 3 điều kiện cùng lúc:

1. Có một SynchronizationContext chỉ cho **một thread chạy tại một thời điểm** (UI, ASP.NET Framework).
2. Code **block đồng bộ** để chờ một async method: `.Result`, `.Wait()`, `.GetAwaiter().GetResult()`.
3. Bên trong async method đó có `await` **không** có `ConfigureAwait(false)`, nên continuation muốn quay về đúng context đó.

Thread đang chờ task xong; task lại chờ thread đó rảnh để chạy tiếp. Không bên nào nhường.
:::

::: info Bản chất
```csharp
// Web Forms 4.8: treo vĩnh viễn
protected void Page_Load(object sender, EventArgs e)
{
    var report = _service.GetReportAsync().Result;  // (1) block request thread
}

public async Task<Report> GetReportAsync()
{
    var data = await _http.GetStringAsync(url);     // (2) xong rồi, muốn quay về request context
    return Parse(data);                             // (3) không bao giờ chạy tới: context đang bị (1) giữ
}
```

**Cách sửa**, theo thứ tự nên dùng:

1. **Async từ đầu tới cuối.** Với Web Forms: `<%@ Page Async="true" %>` và `RegisterAsyncTask(new PageAsyncTask(LoadAsync))`.
2. `ConfigureAwait(false)` ở mọi await trong library: hết deadlock, nhưng vẫn đang block một thread.
3. `Task.Run(() => GetReportAsync()).Result`: chữa cháy, tốn thêm một thread và mất `HttpContext.Current` bên trong.
:::

::: details Ở dự án thật
Đây là câu bạn có thể kể từ chính codebase Web Forms: gọi một thư viện chỉ có API async (SDK mới, `HttpClient`) từ page đồng bộ. Nêu được cả nguyên nhân lẫn cách làm page async đúng chuẩn là điểm cộng rõ.
:::

::: warning Bẫy & follow-up
**"ASP.NET Core có bị deadlock kiểu này không?"**

Không, vì không có SynchronizationContext. Nhưng `.Result` vẫn xấu: nó block một thread pool thread. Dưới tải, nhiều request cùng block gây **thread pool starvation**: latency tăng vọt, request timeout, trong khi CPU thấp. Nhận biết qua `dotnet-counters`: _ThreadPool Queue Length_ tăng, _ThreadPool Thread Count_ tăng dần đều.

**"`.GetAwaiter().GetResult()` khác `.Result` chỗ nào?"**

Cùng block, cùng deadlock. Khác duy nhất: ném exception gốc thay vì bọc trong `AggregateException`.
:::

## `async void` có vấn đề gì? {#async-void}

::: tip Trả lời nhanh
Chỉ dùng cho event handler. Caller không await được nên không biết khi nào xong, và exception bên trong không bắt được từ phía caller: nó bị ném lên SynchronizationContext hoặc thread pool, có thể làm sập process.
:::

::: details Ở dự án thật
Web Forms cho phép `protected async void Page_Load` khi page có `Async="true"`, vì `AspNetSynchronizationContext` đếm các thao tác async void đang chạy và chờ chúng xong trước khi render. Thiếu `Async="true"` thì gặp lỗi "An asynchronous operation cannot be started at this time". Dù chạy được, Microsoft vẫn khuyên dùng `RegisterAsyncTask`.
:::

::: warning Bẫy & follow-up
**"Lambda async truyền vào chỗ nhận `Action` thì sao?"**

Nó thành `async void` ngầm. Ví dụ `list.ForEach(async x => await SaveAsync(x))`: vòng lặp xong ngay, các lần save chạy lung tung, lỗi bị mất. Dùng `foreach` + `await`.
:::

## Exception trong async và `Task.WhenAll` {#async-exceptions}

::: tip Trả lời nhanh
`await` ném lại exception gốc. Với `Task.WhenAll`, `await` chỉ ném **exception đầu tiên**; muốn xem hết thì đọc `task.Exception.InnerExceptions`.
:::

::: info Bản chất
```csharp
var all = Task.WhenAll(tasks);
try { await all; }
catch
{
    foreach (var ex in all.Exception!.InnerExceptions)
        _logger.LogError(ex, "Sync failed");
}
```

Task bị fire-and-forget mà lỗi sẽ không làm sập app (từ .NET 4.5); lỗi chỉ đi vào sự kiện `TaskScheduler.UnobservedTaskException`, nghĩa là bị nuốt im lặng nếu không ai log.
:::

**Await từng cái vs `Task.WhenAll`:** khác nhau trước hết ở **thời gian**.

```
await trong vòng lặp:  A████ ──▶ B████ ──▶ C████     tổng = A + B + C  (tuần tự)
Task.WhenAll:          A████
                       B████                          tổng ≈ max(A, B, C) (đồng thời)
                       C████
```

Task (C#) và Promise (JS) đều **hot**: chạy ngay khi được tạo. Vì vậy kết quả phụ thuộc vào *lúc tạo task*:

```csharp
// (a) tạo + await trong vòng lặp → tuần tự; A lỗi thì B, C chưa bao giờ chạy
foreach (var id in ids) await CallAsync(id);

// (b) tạo trước, await từng cái → đã chạy đồng thời; A lỗi thì vòng lặp dừng,
//     nhưng B, C vẫn chạy tiếp và lỗi của chúng không ai đọc
var tasks = ids.Select(CallAsync).ToList();
foreach (var t in tasks) await t;
```

| Dễ nhầm | C# | JS/TS |
|---|---|---|
| Chờ tất cả | `Task.WhenAll`: **chờ tất cả xong** rồi mới ném lỗi đầu tiên | `Promise.all`: **fail-fast**, reject ngay ở lỗi đầu tiên |
| Lấy kết quả từng cái kể cả lỗi | đọc `task.Status` / `task.Exception` sau `WhenAll` | `Promise.allSettled` |

::: warning Bẫy
Không `Task.WhenAll` nhiều query trên **cùng một `DbContext`**: DbContext không thread-safe, EF ném *"A second operation was started on this context"*.
:::

## `CancellationToken` {#cancellation}

::: tip Trả lời nhanh
Cơ chế hủy hợp tác: bên gọi phát tín hiệu, bên làm việc tự kiểm tra và dừng. Phải truyền token xuyên qua mọi tầng (controller → service → EF/HttpClient). Trong ASP.NET Core, thêm tham số `CancellationToken` vào action là nhận được `HttpContext.RequestAborted`: token bị hủy khi client đóng kết nối.
:::

::: info Bản chất
```csharp
using var cts = CancellationTokenSource.CreateLinkedTokenSource(requestToken);
cts.CancelAfter(TimeSpan.FromSeconds(10));        // timeout riêng, vẫn hủy theo request

try { await _api.FetchAsync(cts.Token); }
catch (OperationCanceledException) when (requestToken.IsCancellationRequested)
{
    // client bỏ đi: không phải lỗi, đừng log Error
}
```
:::

::: warning Bẫy & follow-up
**"Hủy giữa chừng một luồng ghi dữ liệu thì sao?"**

Có thể để lại dữ liệu ghi dở. Với bước commit cuối hoặc thao tác không được dừng giữa chừng (đã trừ tiền, đã gọi provider), đừng truyền token của request; hoặc bọc trong transaction để hủy thì rollback. Đây là câu hỏi về nghiệp vụ hơn là kỹ thuật.
:::

## `ValueTask` vs `Task` {#valuetask}

::: tip Trả lời nhanh
`ValueTask` tránh cấp phát một object Task khi kết quả thường có sẵn ngay (ví dụ cache hit). Mặc định vẫn dùng `Task`; `ValueTask` chỉ cho hot path hoặc library.
:::

::: warning Bẫy & follow-up
**"Có gì phải cẩn thận?"**

Chỉ được await **một lần**; không await từ hai nơi cùng lúc; không gọi `.Result` khi chưa xong. Cần dùng nhiều lần thì gọi `.AsTask()`.
:::

## Thread safety: race condition và các công cụ đồng bộ {#thread-safety}

::: tip Trả lời nhanh
Race condition xảy ra khi nhiều thread đọc-sửa-ghi cùng dữ liệu và kết quả phụ thuộc vào thứ tự chạy. Dạng hay gặp nhất là "kiểm tra rồi mới làm" (check-then-act).
:::

::: info Bản chất
```csharp
// Hai thread cùng thấy "chưa có" và cùng Load
if (!_cache.ContainsKey(key)) _cache[key] = Load(key);

// ConcurrentDictionary: an toàn khi ghi, NHƯNG factory vẫn có thể chạy nhiều lần
var v = _cache.GetOrAdd(key, k => Load(k));

// Muốn Load đúng một lần: lưu Lazy
var v2 = _lazyCache.GetOrAdd(key, k => new Lazy<Data>(() => Load(k))).Value;
```

| Công cụ | Dùng khi | Lưu ý |
|---|---|---|
| `lock` | Đoạn code đồng bộ ngắn | Không được `await` bên trong (lỗi compile). .NET 9 có kiểu `System.Threading.Lock` riêng |
| `SemaphoreSlim(1,1)` | Cần "lock" quanh code async | `await WaitAsync()`, luôn `Release()` trong `finally` |
| `Interlocked` | Tăng giảm, đổi giá trị một biến | Nhanh nhất, không lock |
| `ConcurrentDictionary`, `ConcurrentQueue` | Collection dùng chung | Từng thao tác an toàn, nhưng ghép nhiều thao tác thì không |
| `Channel<T>` | Producer/consumer | Thay cho `BlockingCollection` trong code async |
| Immutable collection, record | Dữ liệu chia sẻ chỉ đọc | Không cần lock nếu không ai sửa |
:::

::: details Ở dự án thật
Hai người cùng bấm duyệt một payout. `lock` trong code không giải quyết được, vì app chạy trên nhiều server hoặc nhiều process. Phải xử lý ở database: `UPDATE Payouts SET Status = 'Approved' WHERE Id = @id AND Status = 'Pending'` rồi kiểm tra số dòng bị ảnh hưởng, hoặc dùng concurrency token (rowversion) của EF. Interviewer rất thích câu trả lời nhận ra rằng lock trong memory không đủ cho hệ thống nhiều instance.
:::

::: warning Bẫy & follow-up
**"`volatile` có thay được `lock` không?"**

Không. `volatile` chỉ đảm bảo đọc giá trị mới nhất và chặn sắp xếp lại lệnh; nó không làm `count++` thành thao tác **atomic** (đọc, cộng, ghi trong một bước không bị thread khác chen vào). Cần thì dùng `Interlocked.Increment`. Hiếm khi cần trong code business.
:::

## `Task.Yield()` dùng để làm gì? {#task-yield}

::: tip Trả lời nhanh
Buộc phần code sau nó luôn chạy như một continuation bất đồng bộ, kể cả khi không có gì để chờ. Method trả control về cho caller ngay tại đó. Dùng hiếm: ở app UI để nhường UI thread trước một đoạn xử lý dài, hoặc khi cần chắc chắn method trả về trước khi làm tiếp.
:::

::: warning Bẫy & follow-up
**"Có giúp tăng hiệu năng hay chống thread pool starvation không?"**

Không. Trên ASP.NET Core nó chỉ đưa phần còn lại vào hàng đợi của thread pool. Nguyên nhân thật của starvation là block đồng bộ, cách sửa là bỏ block.
:::
