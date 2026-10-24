---
title: "Result pattern"
---

# Result pattern

Cách thứ hai để báo lỗi, đặt cạnh exception. Đọc sau [Exception handling](/aspnet-core/exception-handling). PayoutHub theo plan vẫn dùng exception + handler; trang này để hiểu, so sánh và trả lời được khi bị hỏi "sao không dùng Result?".

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="rAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="rOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="rBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## 1. Ý tưởng

**Result pattern**: method **trả về** một object nói "thành công (kèm giá trị)" hoặc "thất bại (kèm lỗi)", thay vì `throw`. Lỗi là **một giá trị bình thường**, đi theo đường `return` như mọi giá trị khác.

**Exception**: lỗi **nhảy** ra khỏi luồng, bay ngược qua các tầng cho tới chỗ có `catch`. Các tầng ở giữa không thấy gì.

Bạn đã dùng Result pattern phiên bản mini trong BCL rồi: `int.TryParse`, `Dictionary.TryGetValue`. Chúng trả `bool` thay vì ném exception, vì "chuỗi không phải số" là chuyện bình thường, không phải sự cố.

<Compare :labels="['Exception', 'Result']" caption="Cùng một lỗi: duyệt một payout đã duyệt rồi. Với exception, lỗi nhảy qua các tầng; với Result, lỗi được trả về qua từng tầng.">
<template #a>
<svg viewBox="0 0 720 330" role="img" aria-label="Exception bay từ domain thẳng lên handler, bỏ qua service và controller"><g font-size="13" class="mono" text-anchor="middle"><rect class="boxOk" x="200" y="16" width="260" height="44" rx="8"/><text x="330" y="36">ExceptionHandler</text><text x="330" y="52" font-size="11" class="okT">map InvalidStateException → 409</text><rect class="box" x="200" y="104" width="260" height="44" rx="8"/><text x="330" y="131">PayoutsController.Approve</text><rect class="box" x="200" y="186" width="260" height="44" rx="8"/><text x="330" y="213">PayoutApprovalService</text><rect class="boxBad" x="200" y="268" width="260" height="44" rx="8"/><text x="330" y="288">Payout.Approve()</text><text x="330" y="304" font-size="11" class="badT">throw InvalidStateException</text></g><path class="lnBad dash" d="M470 290 C 560 290, 560 38, 464 38" marker-end="url(#rBad)"/><g font-size="12"><text x="572" y="150" class="badT">bay thẳng lên,</text><text x="572" y="166" class="badT">nhảy qua 2 tầng</text><text x="180" y="122" text-anchor="end" class="muted">không thấy lỗi,</text><text x="180" y="138" text-anchor="end" class="muted">code sau bị bỏ qua</text><text x="180" y="204" text-anchor="end" class="muted">không thấy lỗi,</text><text x="180" y="220" text-anchor="end" class="muted">code sau bị bỏ qua</text></g></svg>
</template>
<template #b>
<svg viewBox="0 0 720 330" role="img" aria-label="Result được trả về qua từng tầng, controller map sang HTTP"><g font-size="13" class="mono" text-anchor="middle"><rect class="boxOk" x="200" y="16" width="260" height="44" rx="8"/><text x="330" y="36">HTTP 409 + ProblemDetails</text><text x="330" y="52" font-size="11" class="okT">không exception nào xảy ra</text><rect class="boxAcc" x="200" y="104" width="260" height="44" rx="8"/><text x="330" y="124">PayoutsController.Approve</text><text x="330" y="140" font-size="11" class="accT">IsFailure → this.ToProblem(error)</text><rect class="boxAcc" x="200" y="186" width="260" height="44" rx="8"/><text x="330" y="206">PayoutApprovalService</text><text x="330" y="222" font-size="11" class="accT">IsFailure → return result</text><rect class="boxAcc" x="200" y="268" width="260" height="44" rx="8"/><text x="330" y="288">Payout.Approve()</text><text x="330" y="304" font-size="11" class="accT">return Error.Conflict(…)</text></g><g class="lnAcc"><line x1="330" y1="266" x2="330" y2="234" marker-end="url(#rAcc)"/><line x1="330" y1="184" x2="330" y2="152" marker-end="url(#rAcc)"/><line x1="330" y1="102" x2="330" y2="64" marker-end="url(#rAcc)"/></g><g font-size="12"><text x="480" y="252" class="accT">Result.Failure đi lên</text><text x="480" y="268" class="accT">bằng return thường</text><text x="480" y="170" class="muted">mỗi tầng thấy lỗi,</text><text x="480" y="186" class="muted">quyết định làm gì</text><text x="480" y="88" class="muted">tầng Api đổi lỗi</text><text x="480" y="104" class="muted">nghiệp vụ sang HTTP</text></g></svg>
</template>
</Compare>

## 2. Code đầy đủ

Bốn mảnh: kiểu **Error**, kiểu **Result**, domain/service trả Result, và tầng Api đổi Result thành HTTP. Copy cả bộ là chạy.

::: code-group

```cs [Core/Error.cs]
namespace PayoutHub.Core;

public enum ErrorType { NotFound, Conflict, Validation }

// Lỗi theo ý nghĩa nghiệp vụ, không có status code: Core không biết HTTP
public sealed record Error(string Code, string Message, ErrorType Type)
{
    public static Error NotFound(string code, string message) => new(code, message, ErrorType.NotFound);
    public static Error Conflict(string code, string message) => new(code, message, ErrorType.Conflict);
    public static Error Validation(string code, string message) => new(code, message, ErrorType.Validation);
}
```

```cs [Core/Result.cs]
namespace PayoutHub.Core;

public class Result
{
    protected Result(Error? error) => Error = error;

    public Error? Error { get; }
    public bool IsSuccess => Error is null;
    public bool IsFailure => !IsSuccess;

    public static Result Success() => new(null);
    public static Result Failure(Error error) => new(error);

    // Cho phép viết "return Error.Conflict(...)" trong method trả Result
    public static implicit operator Result(Error error) => Failure(error);
}

public sealed class Result<T> : Result
{
    private readonly T? _value;

    private Result(T value) : base(null) => _value = value;
    private Result(Error error) : base(error) { }

    // Đọc Value khi đang thất bại là lỗi lập trình, nên ném exception là đúng chỗ
    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Result is a failure; check IsSuccess first.");

    public static Result<T> Success(T value) => new(value);
    public static new Result<T> Failure(Error error) => new(error);

    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);
}
```

```cs [Core/Payout.cs]
namespace PayoutHub.Core;

public enum PayoutStatus { Pending, Approved, Paid, Rejected }

public class Payout
{
    public int Id { get; private set; }
    public PayoutStatus Status { get; private set; } = PayoutStatus.Pending;
    public string? ApprovedBy { get; private set; }

    public Result Approve(string approvedBy)
    {
        if (Status != PayoutStatus.Pending) // [!code highlight]
            return Error.Conflict("Payout.NotPending", // [!code highlight]
                $"Payout {Id} is {Status}; only Pending payouts can be approved."); // [!code highlight]

        Status = PayoutStatus.Approved;
        ApprovedBy = approvedBy;
        return Result.Success();
    }
}
```

```cs [Core/PayoutApprovalService.cs]
namespace PayoutHub.Core;

public interface IPayoutRepository
{
    Task<Payout?> FindAsync(int id, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

// Đăng ký: builder.Services.AddScoped<PayoutApprovalService>();
public class PayoutApprovalService(IPayoutRepository repo)
{
    public async Task<Result> ApproveAsync(int id, string approvedBy, CancellationToken ct)
    {
        Payout? payout = await repo.FindAsync(id, ct);
        if (payout is null)
            return Error.NotFound("Payout.NotFound", $"Payout {id} was not found.");

        Result result = payout.Approve(approvedBy);
        if (result.IsFailure) // [!code highlight]
            return result;    // [!code highlight]

        await repo.SaveChangesAsync(ct);
        return Result.Success();
    }
}
```

```cs [Api/ResultExtensions.cs]
using Microsoft.AspNetCore.Mvc;
using PayoutHub.Core;

namespace PayoutHub.Api;

// Chỗ duy nhất biết "loại lỗi nghiệp vụ nào thành status code nào"
public static class ResultExtensions
{
    public static IActionResult ToProblem(this ControllerBase controller, Error error)
    {
        int status = error.Type switch
        {
            ErrorType.NotFound   => StatusCodes.Status404NotFound,
            ErrorType.Conflict   => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            _                    => StatusCodes.Status500InternalServerError,
        };

        return controller.Problem(statusCode: status, title: error.Code, detail: error.Message);
    }
}
```

```cs [Api/Controllers/PayoutsController.cs]
using Microsoft.AspNetCore.Mvc;
using PayoutHub.Core;

namespace PayoutHub.Api.Controllers;

[ApiController]
[Route("api/payouts")]
public class PayoutsController(PayoutApprovalService approvals) : ControllerBase
{
    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, CancellationToken ct)
    {
        Result result = await approvals.ApproveAsync(id, approvedBy: "finance", ct);

        return result.IsSuccess ? NoContent() : this.ToProblem(result.Error!); // [!code highlight]
    }
}
```

:::

Bản dùng exception để so: `Approve` có kiểu trả `void` và `throw new InvalidStateException(...)`, service không cần `if`, controller chỉ một dòng `await approvals.ApproveAsync(...)`, còn việc đổi sang 409 nằm ở `IExceptionHandler`.

## 3. Khi nào dùng cái nào

Quy tắc dễ nhớ: **lỗi đoán trước được thì là Result, sự cố thì là exception.**

| Tình huống | Dùng | Vì sao |
|---|---|---|
| Payout không ở trạng thái Pending, không tìm thấy merchant, số tiền dưới `MinAmount` | **Result** (hoặc exception nghiệp vụ) | Chuyện bình thường của nghiệp vụ, người gọi nên xử lý |
| DB mất kết nối, timeout gọi FakeBank, bug `NullReferenceException` | **Exception** | Không ai ở giữa xử lý được, để global handler log và trả 500 |
| Lỗi lập trình: gọi sai thứ tự, tham số null không hợp lệ | **Exception** (`ArgumentException`, `InvalidOperationException`) | Phải sửa code, không phải xử lý lúc chạy |
| Validate input hàng loạt (import 10.000 dòng CSV) | **Result** | Muốn gom tất cả lỗi, và ném 10.000 exception thì chậm |

Thực tế hay **dùng cả hai**: Result cho lỗi nghiệp vụ, exception cho sự cố, global handler vẫn là lưới an toàn cuối cùng.

### Được và mất

| | Exception + handler | Result pattern |
|---|---|---|
| Nhìn chữ ký method | `Task Approve()`: không biết có thể lỗi gì | `Task<Result> Approve()`: biết ngay có thể thất bại |
| Code ở tầng giữa | Gọn, không `if` | Mỗi tầng phải `if (r.IsFailure) return r;` |
| Quên xử lý lỗi | Vẫn an toàn: exception tự bay lên handler | Có thể quên kiểm tra `IsFailure` mà đi tiếp |
| Hiệu năng khi lỗi xảy ra nhiều | `throw` tốn cỡ micro giây (dựng stack trace) | Như một lần `return` |
| Gom nhiều lỗi một lúc | Khó, exception dừng ở lỗi đầu tiên | Dễ, `Result` có thể chứa danh sách `Error` |

## 4. Dễ nhầm

| Cặp | Phân biệt |
|---|---|
| **Result** và **ProblemDetails** | Result là kiểu trong code C#, đi giữa các tầng. ProblemDetails là format JSON trả cho client. Tầng Api đổi cái này sang cái kia |
| **Result** và **TryXxx(out)** | Cùng ý tưởng. `TryParse` chỉ trả `bool`, không nói vì sao lỗi. Result mang theo `Error` |
| **Result** và **trả `null`** | `null` chỉ nói "không có", không nói vì sao, và dễ bị quên kiểm tra. Result bắt người gọi nhìn thấy lỗi |
| **Error** và **Exception** | `Error` là dữ liệu: code, message, loại. Exception là cơ chế điều khiển luồng, kèm stack trace |

## Hỏi đáp

### Thiết kế

::: details Có nên dùng thư viện thay vì tự viết Result?
Có vài thư viện phổ biến: **ErrorOr**, **FluentResults**, **Ardalis.Result**, **OneOf**. Chúng thêm sẵn `Match`, `Map`, nhiều lỗi một lúc, map sang `IResult` của Minimal API. Với PayoutHub, quy ước của project là không thêm package khi chưa cần, và tự viết khoảng 40 dòng như trên là đủ hiểu bản chất. Đi làm thì theo convention của team.
:::

::: details "Railway-oriented programming" là gì?
Cách nhìn chuỗi xử lý như hai đường ray: ray thành công và ray thất bại. Mỗi bước chạy khi đang ở ray thành công; lỗi một lần là chuyển sang ray thất bại và các bước sau bị bỏ qua. Trong code là các method nối nhau như `Bind`, `Map`:

```cs
// Với thư viện hoặc tự viết thêm Bind/Map:
return await FindPayout(id)
    .Bind(p => p.Approve(user))
    .Bind(_ => Save());
```

Gọn hơn chuỗi `if (IsFailure) return`, nhưng khó đọc với người chưa quen và khó debug. Trong C# phần lớn team chọn `if` cho rõ ràng.
:::

::: details Domain method (entity) nên trả Result hay throw?
Hai trường phái đều có lý. Throw: entity tự bảo vệ invariant, ai gọi sai là sự cố. Result: vi phạm rule nghiệp vụ là chuyện có thể xảy ra (user bấm Approve hai lần), nên là giá trị trả về. PayoutHub chọn throw theo [plan](/progress/plan) để luyện exception handler. Trả lời phỏng vấn: nêu cả hai, nói mình chọn gì và vì sao.
:::

::: details C# có sẵn kiểu union như F# hay Rust không?
Có từ **C# 15** (.NET 11, dự kiến ra tháng 11/2026, hiện đang preview): từ khoá `union` khai báo một giá trị là đúng một trong vài kiểu, và `switch` thiếu nhánh thì compiler cảnh báo.

```cs
public record Approved(int PayoutId);
public record NotFound(int PayoutId);
public record NotPending(string CurrentStatus);

public union PayoutResult(Approved, NotFound, NotPending);

string message = result switch
{
    Approved a   => "ok",
    NotFound n   => "404",
    NotPending p => "409",   // bỏ dòng này là compiler cảnh báo
};
```

BCL chưa có sẵn kiểu `Result<T, E>` dựng trên union; hiện vẫn tự viết hoặc dùng thư viện như trên.
:::

### Phỏng vấn

::: details "Bạn dùng exception hay Result cho lỗi nghiệp vụ?" (trả lời mẫu)
"Tuỳ loại lỗi. Sự cố ngoài ý muốn như mất kết nối DB thì luôn là exception, để global handler log và trả 500. Lỗi nghiệp vụ đoán trước được, như duyệt payout đã duyệt, thì mình nghiêng về Result vì chữ ký method nói rõ là có thể thất bại, và không tốn chi phí exception khi lỗi xảy ra thường xuyên. Nếu team đã quen exception + handler thì mình theo cách đó, miễn là thống nhất trong cả codebase. Cái tệ nhất là trộn lẫn mỗi chỗ một kiểu."
:::

::: details "Exception chậm thật không?"
Chậm hơn `return` nhiều lần vì phải dựng stack trace và tìm `catch`, cỡ micro giây cho mỗi lần `throw`. Với một request thỉnh thoảng lỗi thì không đáng kể. Thành vấn đề khi lỗi là **luồng thường xuyên**: validate hàng chục nghìn dòng, hay endpoint bị gọi sai liên tục. Lý do chính để chọn Result vẫn là thiết kế (lỗi hiện rõ), hiệu năng chỉ là lý do phụ.
:::

## Tự kiểm tra

::: details 1. Lỗi nào dưới đây nên là Result, lỗi nào là exception: (a) merchant không tồn tại, (b) SQL Server timeout, (c) tổng payout dưới MinAmount?
(a) và (c) là lỗi nghiệp vụ đoán trước được: Result (hoặc exception nghiệp vụ, nếu team chọn cách đó). (b) là sự cố hạ tầng: exception, để global handler lo.
:::

::: details 2. Vì sao Error không chứa status code HTTP?
Error nằm ở Core, mà Core không được biết HTTP. Tầng Api mới quyết định NotFound thành 404. Nhờ vậy cùng Core dùng được cho một background job, nơi không có HTTP.
:::

::: details 3. Điểm yếu lớn nhất của Result so với exception là gì?
Người gọi có thể quên kiểm tra `IsFailure` và chạy tiếp như thể thành công. Exception thì không quên được: không ai bắt là nó bay lên handler.
:::
