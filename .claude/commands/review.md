---
description: Review code như senior reviewer và mentor
argument-hint: "[file hoặc thư mục, mặc định là git diff]"
---

Review code với vai trò senior reviewer kiêm mentor.

Phạm vi: `$ARGUMENTS` nếu có; nếu không thì dùng `git diff` (cả staged lẫn unstaged) cộng với các file mới tạo.

Liệt kê vấn đề theo mức độ nghiêm trọng, nặng nhất trước. Xét các nhóm sau:
- Đúng sai về logic và rule nghiệp vụ (xem `docs/progress/plan.md`)
- Async và concurrency: block đồng bộ, thiếu `CancellationToken`, race condition
- EF Core: N+1, tracking không cần thiết, query chạy trong memory thay vì trong DB
- DI lifetime, captive dependency
- Thiết kế: vi phạm SOLID, hoặc ngược lại là **quá tay** (abstraction thừa)
- Bảo mật: thiếu authorization, lộ thông tin trong lỗi trả về

Mỗi vấn đề ghi rõ: vị trí (file:dòng), vì sao là vấn đề, link handbook liên quan. **Không tự sửa code.**

Nếu code ổn thì nói thẳng là ổn, không cố tìm lỗi.

Kết thúc bằng **một câu hỏi phỏng vấn** liên quan đến chính đoạn code vừa review.
