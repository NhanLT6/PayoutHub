---
title: "C# hiện đại"
---

# C# hiện đại

Những gì đã thay đổi trong lúc bạn ở với C# 7.3 của .NET Framework. Interviewer hay hỏi "bạn dùng tính năng mới nào", và đọc code mẫu toàn cú pháp mới, nên cần nhìn quen mắt.

## Bản đồ theo version {#csharp-versions}

| C# | .NET | Tính năng đáng nhớ |
|---|---|---|
| 8 | Core 3.x | Nullable reference types, switch expression, `using` declaration, `IAsyncEnumerable` / `await foreach`, default interface method, index/range `^1` `..` |
| 9 | 5 | `record`, `init`, top-level statements, pattern `and`/`or`/`not`, target-typed `new()` |
| 10 | 6 | `record struct`, file-scoped namespace, `global using`, implicit usings |
| 11 | 7 | `required`, raw string literal `"""`, list pattern, static abstract trong interface |
| 12 | 8 | Primary constructor cho class, collection expression `[1, 2, 3]` |
| 13 | 9 | `params` cho collection bất kỳ, kiểu `Lock`, escape `\e` |
| 14 | 10 | Từ khóa `field` trong property, extension members, gán qua null-conditional `a?.B = x` |

## Nullable reference types {#nullable}

::: tip Trả lời nhanh
Bật `<Nullable>enable</Nullable>` thì compiler coi reference type mặc định là không được null; muốn cho phép null phải ghi `string?`. Compiler phân tích luồng code và cảnh báo khi có thể <T>dereference</T> null. Mục tiêu là bắt <T>NullReferenceException</T> lúc compile thay vì lúc chạy.
:::

::: info Bản chất
```csharp
public string? FindMerchantName(int id) { ... }

var name = FindMerchantName(42);
Console.WriteLine(name.Length);     // cảnh báo CS8602: có thể null
if (name is not null)
    Console.WriteLine(name.Length); // ok: compiler biết đã kiểm tra
Console.WriteLine(name!.Length);    // '!' = "tin tôi đi", tắt cảnh báo
```
:::

::: details Ở dự án thật
Với codebase cũ, không bật một lần cho cả project vì sẽ ra hàng nghìn cảnh báo. Bật theo từng file bằng `#nullable enable`, bắt đầu từ code mới và các model ở biên (<T>DTO</T>, API contract).
:::

::: warning Bẫy & follow-up
**"Bật nullable rồi thì runtime có kiểm tra null không?"**

Không. Đây chỉ là chú thích và cảnh báo lúc compile. Dữ liệu từ JSON, DB, hay caller chưa bật nullable vẫn có thể là null, nên ở biên hệ thống vẫn phải validate.

**"Dùng `!` nhiều có sao không?"**

Mỗi chỗ `!` là một chỗ tắt bảo vệ. Dùng nhiều là dấu hiệu model chưa phản ánh đúng thực tế; nên sửa kiểu dữ liệu hoặc thêm kiểm tra.

**"Field bắt buộc thì khai `string?` hay `string = string.Empty`?"**

`string?` nói null là trạng thái hợp lệ: sai ý nghĩa, và mọi chỗ dùng phải check null vô ích. Field luôn có giá trị thì khai `string X { get; set; } = string.Empty;` kèm `[Required]` (mặc định từ chối cả chuỗi rỗng). PayoutHub: `PayoutOptions.DefaultCurrency`, xem [Options pattern](/aspnet-core/options-pattern).
:::

## Pattern matching và switch expression {#pattern-matching}

::: tip Trả lời nhanh
Switch expression trả về giá trị và kết hợp được với type pattern, property pattern, relational pattern (`>`, `<=`), `and`/`or`/`not`. Viết logic phân nhánh theo nghiệp vụ gọn hơn nhiều so với chuỗi if/else, và compiler cảnh báo khi thiếu nhánh.
:::

::: info Bản chất
```csharp
decimal CommissionRate(Merchant m) => m switch
{
    { Tier: Tier.Enterprise }                  => 0.05m,
    { MonthlySales: >= 100_000 }                => 0.08m,
    { MonthlySales: >= 10_000 and < 100_000 }  => 0.10m,
    { IsActive: false }                        => 0m,
    _                                          => 0.12m,
};

if (result is { Status: PayoutStatus.Failed, Error: var err }) Log(err);
```
:::

::: warning Bẫy & follow-up
**"Thứ tự các nhánh có quan trọng không?"**

Có. Nhánh đầu tiên khớp sẽ thắng. Trong ví dụ trên, merchant Enterprise mà không active vẫn ra 0.05 vì nhánh Tier đứng trước. Compiler báo lỗi nếu một nhánh không bao giờ tới được, nhưng không bắt được sai về nghiệp vụ.

**"Khi nào vẫn nên dùng <T>Strategy</T> thay vì switch?"**

Khi mỗi nhánh là một khối logic lớn, cần dependency riêng, hoặc cần thêm nhánh mà không sửa chỗ này. Switch expression hợp với ánh xạ ngắn từ dữ liệu ra giá trị.
:::

## Primary constructor, `required`, `init` {#primary-ctor}

::: tip Trả lời nhanh
`init`: property chỉ gán được lúc khởi tạo. `required`: bắt buộc caller phải gán property đó trong <T>object initializer</T>. Primary constructor (C# 12): khai báo tham số ngay trên tên class, dùng được trong toàn bộ class; rất hợp với <T>constructor injection</T>.
:::

::: info Bản chất
```csharp
public class PayoutService(IPayoutRepository repo, ILogger<PayoutService> logger)
{
    public async Task ApproveAsync(int id) { var p = await repo.GetAsync(id); ... }
}

public class CreatePayoutRequest
{
    public required int MerchantId { get; init; }
    public required decimal Amount { get; init; }
    public string? Note { get; init; }
}
var req = new CreatePayoutRequest { MerchantId = 1, Amount = 50 }; // thiếu field required là lỗi compile
```
:::

::: warning Bẫy & follow-up
**"Tham số primary constructor có phải là field readonly không?"**

Không. Nó là biến được capture, và **gán lại được** bên trong class. Muốn đảm bảo không đổi thì khai báo field rõ ràng: `private readonly IPayoutRepository _repo = repo;`. Với `record` thì khác: tham số positional trở thành property public.
:::

## Mấy cú pháp nhỏ hay gặp trong code mẫu {#small-syntax}

::: info Nhận diện nhanh
```csharp
namespace Billing;                        // file-scoped namespace, bớt một tầng thụt lề
global using System.Text.Json;            // dùng cho cả project
int[] ids = [1, 2, 3];                    // collection expression
int[] more = [..ids, 4];                  // spread
var last = ids[^1];                       // phần tử cuối
var firstTwo = ids[..2];                  // range
Order o = new();                          // target-typed new
var sql = """
    SELECT * FROM Payouts WHERE Status = 'Pending'
    """;                                  // raw string, không cần escape
await foreach (var row in ReadRowsAsync()) { }   // IAsyncEnumerable

public string Name { get; set => field = value.Trim(); }  // C# 14: 'field' là backing field tự sinh
```
:::

::: warning Bẫy & follow-up
**"Có nên dùng record làm entity cho <T>EF Core</T> không?"**

Không nên. Record so sánh theo giá trị và khuyến khích bất biến, trong khi entity có identity (Id) và được EF track rồi sửa tại chỗ. Record hợp với <T>DTO</T>, request/response và <T>value object</T>.
:::
