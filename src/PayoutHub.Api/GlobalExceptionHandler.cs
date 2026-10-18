using Microsoft.AspNetCore.Diagnostics;

namespace PayoutHub.Api;

public class GlobalExceptionHandler : IExceptionHandler
{
    public ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception,
        CancellationToken cancellationToken)
    {
        // 1. log exception: dùng overload nào để log kèm stack trace?
        // 2. set status code của response
        // 3. tạo ProblemDetails: Title, Status. KHÔNG đưa exception.Message ra ngoài ở Production
        // 4. ghi response qua problemDetailsService.TryWriteAsync(new ProblemDetailsContext { ??? })
        // 5. return ???  — true/false nghĩa là gì?

        return ValueTask.FromResult(true);
    }
}