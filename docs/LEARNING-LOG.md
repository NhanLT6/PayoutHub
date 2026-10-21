# Learning log

Mỗi phiên một mục, mới nhất ở cuối. Tối đa khoảng 15 dòng mỗi mục.

<!--
Mẫu:

## YYYY-MM-DD · M2
- **Đã làm:** ...
- **Khái niệm đã chạm:** 6.4, 6.5, ...
- **Chỗ yếu:** ... (ôn lại ở đầu phiên sau)
- **Câu phỏng vấn đáng nhớ:** ...
- **Quiz / mock:** 4/5, sai câu về ...
- **Tiếp theo:** ...
-->

## Bối cảnh trước khi bắt đầu

- Đã đọc sổ tay tới khoảng mục 2.8. Đã thảo luận kỹ các phần:
  - `new` (method hiding)
  - static được khởi tạo lúc nào
  - `readonly` chỉ khóa tham chiếu
  - `IReadOnlyList` vs `ReadOnlyCollection`
  - vì sao string là reference type
  - struct mutable
  - Tuple vs ValueTuple
  - so sánh bằng của record
  - `Distinct` / `IEqualityComparer`
  - Big-O
  - SRP (một lý do để thay đổi), OCP (ví dụ thêm Wise)
- Mục 3–8 mới đọc lướt hoặc chưa đọc.
- Đọc tài liệu dài thì buồn ngủ, nên chuyển sang học qua project, kết hợp quiz và phỏng vấn thử.

## 2026-10-17 · M1
- **Đã làm:** dựng solution `.slnx` với `src/` `tests/` `tools/` thật trên đĩa, reference đúng chiều; FakeBank là Minimal API. `PayoutOptions` ở Core + `BindConfiguration` / `ValidateDataAnnotations` / `ValidateOnStart`, đã thử config sai thì app dừng lúc start.
- **Khái niệm đã chạm:** 1.6, 5.2, 5.4, 7.4, 8.2, 8.5; Options pattern; Native AOT (3.1).
- **Chỗ yếu:**
  - Nhầm `IOptionsSnapshot` "đọc lại mỗi lần có caller dùng"; đúng là mỗi scope/request một lần. Chưa tự nghĩ ra `IOptionsMonitor` dùng cho singleton.
  - Câu "đổi `MinAmount` không restart": trả lời "data bị hỏng" chung chung, chưa chỉ ra được rủi ro cụ thể (một kỳ chạy với hai giá trị) và cách đọc giá trị một lần.
  - Không biết `[Range]` cần `typeof(decimal)` vì attribute không nhận `decimal`; định dùng `string?` để tắt warning nullable.
  - Câu khởi động "vì sao Core không reference Infrastructure, Core lưu DB bằng cách nào" **chưa trả lời**.
- **Câu phỏng vấn đáng nhớ:** Finance đổi `MinAmount` không restart khi `generate` đang chạy (đã ghi ở `INTERVIEW-NOTES.md`); Controllers vs Minimal API cho app lớn; controller nhiều dependency.
- **Quiz / mock:** câu `MinAmount` không restart: Gần đúng.
- **Tiếp theo:** xoá `TestController` + `/`, `/test2`; commit lần đầu; M1 bước 4 structured logging.

## 2026-10-18 · M1
- **Đã làm:** bước 4 structured logging: so sánh template vs interpolation qua `AddJsonConsole` (thấy `State.MinAmount`), cấu hình `Logging:LogLevel` theo namespace, lấy `IOptions<PayoutOptions>` từ `app.Services` để log config lúc start. Bước 5 mới có khung: `AddProblemDetails` + `AddExceptionHandler<GlobalExceptionHandler>` trong `Program.cs`, `GlobalExceptionHandler.cs` còn rỗng (chỉ có comment TODO). Sửa `handbook.html` thiếu `<meta charset="utf-8">`.
- **Khái niệm đã chạm:** 2.8 (DIP, composition root), 7.7, 8.2 (root provider vs scope), 8.5 (service locator).
- **Chỗ yếu:**
  - Câu "Core lưu DB thế nào": đúng ý interface + DI, nhưng không biết **Api** là nơi nối interface với implement (composition root); không nêu được lợi ích chính là unit test Core bằng fake repository; coi circular reference là lý do thay vì hệ quả.
  - Nghĩ placeholder trong template bind **theo tên**; thực tế bind theo **vị trí**, tên chỉ là tên field.
  - Chưa biết cách hệ thống log (Seq/Elastic) lọc theo field.
  - Đọc config thô `app.Configuration["Payout:MinAmount"]` (ra `string`) dù đã có `PayoutOptions`; không biết lấy options trong `Program.cs` qua `app.Services.GetRequiredService`.
  - Đặt `"Payout": "Debug"` trong `appsettings.json` (production cũng Debug, key không khớp namespace `PayoutHub`).
- **Câu phỏng vấn đáng nhớ:** vì sao message template thay vì interpolation (đã ghi `INTERVIEW-NOTES.md` › Logging, kèm `[LoggerMessage]`).
- **Quiz / mock:** câu khởi động "Core lưu DB thế nào": Gần đúng.
- **Tiếp theo:** (máy khác) tiếp bước 5: điền `GlobalExceptionHandler` (log kèm exception, status code, ProblemDetails không lộ message, `TryWriteAsync`, ý nghĩa `return true/false`), đặt `app.UseExceptionHandler()` đúng chỗ, test bằng `/boom`; nhớ bẫy .NET 10 handler trả `true` thì middleware không tự log. Sau đó lab 1 của M1.

## 2026-10-19 · M1
- **Đã làm:** onboard máy mới (.NET 10.0.402 có sẵn, LocalDB có, chưa có Docker và `dotnet-ef`). Điền `GlobalExceptionHandler`: log kèm exception + `{Method} {Path}`, `await TryWriteAsync` và return kết quả của nó, `Detail` chỉ hiện message ở Development. `UseExceptionHandler()` lên đầu pipeline, thêm `/boom`. Bật `IncludeScopes` cho JSON console để log có `TraceId`. Thêm `docs/README.md` (mục lục chung), `docs/notes/exception-handling.md`.
- **Khái niệm đã chạm:** 7.2, 7.5, 7.7, 8.2; ProblemDetails, `IExceptionHandler` true/false, W3C `traceparent` (trace / span / flags).
- **Chỗ yếu:**
  - Lần đầu quên `await` `TryWriteAsync` (fire-and-forget); sau đó viết `return await ValueTask.FromResult(true)`: chưa chắc `async` tự bọc giá trị return.
  - Che message ở `Title` nhưng vẫn lộ ở `Detail`.
  - Dùng `exception.Message` làm log template.
  - Không biết trace id nằm trong log scope, `AddJsonConsole` mặc định không in scopes.
- **Câu phỏng vấn đáng nhớ:** "User báo lỗi 500, tìm log thế nào?" (đã ghi `INTERVIEW-NOTES.md` › Logging).
- **Quiz / mock:** câu ôn "placeholder bind theo tên hay vị trí": Đúng.
- **Tiếp theo:** chạy `/boom`, so `TraceId` trong log với `traceId` trong response (phần 32 hex giữa). Lab 1 M1 (middleware ném lỗi đặt trước `UseExceptionHandler`). Câu còn mở: `AddExceptionHandler<T>` đăng ký lifetime gì, inject `DbContext` vào thì sao (note câu 4). Sau đó health check, rồi tick bước 5.
