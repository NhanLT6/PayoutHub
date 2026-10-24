---
title: "Dependency Injection"
---

# Dependency Injection

Câu về service lifetime gần như vòng nào cũng có. Bản cheatsheet cũ có một chỗ sai ở đây, phần này viết lại cho đúng.

## Transient, Scoped, Singleton <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#lifetimes}

Note kèm hình: [DI hoạt động thế nào](/aspnet-core/notes/how-di-works).

::: tip Trả lời nhanh
**Transient**: tạo mới mỗi lần được yêu cầu. **Scoped**: một instance cho mỗi scope, trong web là mỗi request. **Singleton**: một instance cho cả vòng đời app, nên phải thread-safe.
:::

::: info Bản chất
| Lifetime | Ví dụ hợp lý | Lưu ý |
|---|---|---|
| Transient | Service nhỏ, không state, rẻ để tạo | Cùng một request có thể có nhiều instance khác nhau |
| Scoped | `DbContext`, unit of work, thông tin user hiện tại | Mọi service trong cùng request dùng chung một instance, nên chung một DbContext và một transaction |
| Singleton | Cache, config đã nạp, client tốn chi phí khởi tạo | Có state thì phải thread-safe; không được giữ service scoped |
:::

::: details Ở dự án thật
Ví dụ dễ kể: đặt `DbContext` scoped để mọi repository trong một request dùng chung context, gọi `SaveChanges` một lần là ghi hết trong một transaction. Nếu lỡ để transient, mỗi repository một context, việc ghi bị chia ra và không còn nguyên tử.
:::

## Captive dependency: inject lifetime nào vào lifetime nào được? {#captive-dependency}

::: tip Trả lời nhanh
Quy tắc: **service sống lâu không được giữ service sống ngắn hơn**. Singleton giữ một scoped service thì service đó bị "giam" và sống suốt đời app: DbContext bị dùng chung cho mọi request, sai dữ liệu và không thread-safe. Đó gọi là captive dependency.
:::

::: info Bản chất
| Inject ↓ vào → | Transient | Scoped | Singleton |
|---|---|---|---|
| **Transient** | OK | OK | Chạy được, nhưng bị kéo dài thành singleton. Chỉ ổn nếu nó không state và thread-safe |
| **Scoped** | OK | OK | **Sai**. Bị chặn khi bật scope validation |
| **Singleton** | OK | OK | OK |

```csharp
// Singleton (hoặc BackgroundService) cần dùng DbContext: tự tạo scope
public class DailyReportJob(IServiceScopeFactory scopes) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // ... dùng db, scope dispose thì db dispose theo
    }
}
```
:::

::: warning Bẫy & follow-up
**"Làm sao phát hiện captive dependency sớm?"**

`ValidateScopes` (mặc định bật ở môi trường Development) ném lỗi khi resolve scoped từ root. Bật thêm `ValidateOnBuild` để kiểm tra toàn bộ đăng ký ngay lúc khởi động thay vì đợi tới lúc resolve.

**"Scoped inject transient có sao không?"**

Không sao. Transient sống theo scoped đã giữ nó. Câu "scoped không được dùng transient" trong bản cheatsheet trước là sai.
:::

## Container dispose service thế nào? {#disposal}

::: tip Trả lời nhanh
Container chỉ dispose những object **nó tự tạo**, vào lúc scope chứa object đó kết thúc: scoped và transient theo request, singleton khi app tắt. Object bạn tự `new` rồi đăng ký bằng instance thì container không dispose.
:::

::: warning Bẫy & follow-up
**"Resolve transient `IDisposable` từ root provider thì sao?"**

Container giữ tham chiếu để dispose lúc app tắt, nghĩa là mỗi lần resolve lại giữ thêm một object tới cuối đời app: memory leak. Luôn resolve trong một scope.
:::

## Nhiều implementation cho một interface, keyed services, decorator {#multiple-implementations}

::: tip Trả lời nhanh
Đăng ký nhiều lần cùng một interface: inject `T` thì nhận bản đăng ký **cuối cùng**; inject `IEnumerable<T>` thì nhận tất cả. Từ .NET 8 có **keyed services** để chọn theo key. Container có sẵn không hỗ trợ decorator, phải tự đăng ký bằng factory hoặc dùng thư viện như Scrutor.
:::

::: info Bản chất
```csharp
// Keyed services (.NET 8): Strategy theo phương thức payout
builder.Services.AddKeyedScoped<IPayoutMethod, BankTransferPayout>("bank");
builder.Services.AddKeyedScoped<IPayoutMethod, PayPalPayout>("paypal");

public class PayoutRunner(IServiceProvider sp)
{
    public Task RunAsync(Payout p) => sp.GetRequiredKeyedService<IPayoutMethod>(p.Method).SendAsync(p);
}

// Decorator không cần thư viện: bọc cache quanh repository
builder.Services.AddScoped<MerchantRepository>();
builder.Services.AddScoped<IMerchantRepository>(sp =>
    new CachedMerchantRepository(
        sp.GetRequiredService<MerchantRepository>(),
        sp.GetRequiredService<IMemoryCache>()));
```
:::

::: details Ở dự án thật
Cách decorator bằng factory ở trên hợp với môi trường hạn chế thêm package bên ngoài như công ty hiện tại của bạn: đủ dùng, ai đọc cũng hiểu, không thêm dependency.
:::

::: warning Bẫy & follow-up
**"Inject `IServiceProvider` rồi tự `GetService` có ổn không?"**

Đó là service locator, thường bị coi là anti-pattern vì che giấu dependency thật. Chấp nhận được ở tầng hạ tầng (factory, chọn theo key lúc runtime như trên), không nên rải trong business logic.

**"`TryAdd` để làm gì?"**

Chỉ đăng ký nếu chưa có ai đăng ký interface đó. Thư viện dùng nó để app vẫn ghi đè được bằng implementation riêng.
:::

## Constructor có quá nhiều dependency {#too-many-dependencies}

::: tip Trả lời nhanh
Khoảng 5–6 dependency trở lên thường là dấu hiệu class đang làm quá nhiều việc (SRP). Cách xử lý là tách class theo trách nhiệm, không phải gom các dependency vào một object "bao tải" để constructor trông ngắn lại.
:::

::: details Ở dự án thật
Web Forms ngày trước không có constructor injection cho page, nên code hay tự `new` service ngay trong page. Từ .NET Framework 4.7.2 đã có thể bật DI cho Web Forms qua `HttpRuntime.WebObjectActivator`. Biết chi tiết này cho thấy bạn hiểu cả hai thế giới, và nó là bước đệm hợp lý trước khi migrate: đưa logic về các service được inject, sau này mang sang .NET mới gần như nguyên vẹn.
:::
