---
title: "Legacy: hướng dẫn cũ còn giá trị tra cứu"
---

# Legacy: hướng dẫn cũ còn giá trị tra cứu

Nhóm này chứa các hướng dẫn **đã lỗi thời nhưng còn giá trị tra cứu**. Quy ước cho mọi tài liệu ở đây:

- **Giữ nguyên nội dung gốc**, không sửa cho hiện đại. Mỗi file có khung ghi chú ở đầu: vì sao lỗi thời, phần nào còn đúng, và **bây giờ nên dùng gì thay thế**.
- Viết tài liệu mới thì bắt đầu từ phần "thay thế", và chỉ mượn phần giải thích hành vi còn đúng.
- Khi có thời gian (hoặc model đủ mạnh), viết lại thành trang chủ đề bình thường thay vì giữ bản Legacy. Trước lúc đó, tra bản Legacy nhanh hơn tìm hiểu lại từ đầu.

Mọi link, nhận định về SDK và chính sách trong các file này có thể đã đổi; kiểm tra lại với tài liệu hiện hành khi dùng.

## Teams bot {#teams-bot}

Bot Framework SDK **hết hỗ trợ từ 31/12/2025**, repo đã archive. Bot đang chạy trên Azure Bot Service vẫn chạy, nhưng không còn bản vá. Phần giải thích hành vi của Teams (định tuyến qua Azure Bot Service, manifest, task module `task/fetch` và `task/submit`, lưu conversation reference, cập nhật message gốc) trong hai bản dưới **vẫn đúng**; tên class, package và code mẫu thì không nên chép. Bản tóm tắt còn dùng được nằm ở [Notification tương tác: Teams](/integrations/interactive-notifications#teams).

| Hướng dẫn | Nội dung | Thay thế hiện nay |
|---|---|---|
| <a :href="$withBase('/legacy/teams-bot-dotnet-framework-guide.html')" target="_blank">Teams bot trên .NET Framework</a> | Bot Teams là Web API controller đặt cạnh app WebForms, gói thế hệ Bot Builder v3 (`Microsoft.Bot.Connector.Teams`) | Tách bot thành service ASP.NET Core riêng gọi vào app cũ qua API, dùng Teams SDK hoặc Microsoft 365 Agents SDK (SDK mới chỉ host bằng ASP.NET Core, cần .NET 8+) |
| <a :href="$withBase('/legacy/teams-bot-dotnet-core-bot-framework-v4-guide.html')" target="_blank">Teams bot trên ASP.NET Core, Bot Framework v4</a> | `TeamsActivityHandler`, `CloudAdapter`, gửi chủ động, task module | Teams SDK (có gói tương thích giữ handler cũ, chỉ đổi adapter) hoặc Microsoft 365 Agents SDK (đổi namespace, package, serialization sang System.Text.Json) |

Hai file mở trong tab mới, là trang HTML độc lập (không theo giao diện của site này).
