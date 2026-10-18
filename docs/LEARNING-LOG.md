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
