---
title: "Lộ trình cốt lõi: kiến trúc và trade-off"
---

# Lộ trình cốt lõi: kiến trúc và trade-off

Lập ngày 13/11/2026, thay cho mục "Ôn theo 2 job" trong [Plan](/progress/plan). Đây là **nguồn sự thật về thứ tự học**. Checklist code của PayoutHub vẫn nằm ở [Plan](/progress/plan), nhật ký từng buổi ở [Learning log](/progress/learning-log).

Trang này viết cho hai người đọc: Nhân (để biết mình đang ở đâu) và model chạy từng buổi (để biết phải làm gì mà không cần hỏi lại định hướng).

## 1. Vì sao có lộ trình này {#why}

Nhận xét sau một vòng phỏng vấn gần đây (11/2026): làm tính năng tốt, nhưng yếu **architectural thinking**, **performance optimization**, và khả năng **tự thiết kế rồi dẫn dắt một giải pháp kỹ thuật**. Chỗ hổng không nằm ở kỹ năng code. Nó nằm ở việc lập luận về lực tác động và cái giá của từng lựa chọn, rồi nói ra được lập luận đó.

Nhận xét đó chỉ là đánh giá của một bên, dùng để **tham khảo**, không phải sự thật tuyệt đối. Lộ trình dựa vào nó vì nó trùng với hai nguồn khác: trọng số trong các JD (nhóm nào cũng cần kiến trúc và hiệu năng) và mong muốn của chính Nhân là hiểu bản chất để tự chỉnh pattern cho use case của mình.

Quan điểm của Nhân: giữ dự án đơn giản, bám nghiệp vụ, code tốt là code giải quyết được vấn đề. Lộ trình này **không** nhằm đổi quan điểm đó. "Đơn giản" là một quyết định kiến trúc hợp lệ. Mục tiêu là sau khi học, Nhân:

1. Nhìn một hệ thống và chỉ ra được nó đang chịu **áp lực** nào (requirement đổi, dữ liệu lớn, nhiều người cùng sửa, thứ bên ngoài lỗi).
2. Với mỗi áp lực, biết các **phương án**, mỗi phương án chữa gì và **trả giá** gì.
3. **Tự chỉnh** pattern có sẵn cho vừa use case của mình, kể cả quyết định không dùng.
4. Bảo vệ được lựa chọn đó bằng lời, với ví dụ từ dự án thật.

Nhân muốn có kiến thức thật, không học lý thuyết để trả bài. Vì vậy mỗi buổi phải kết thúc bằng một thứ Nhân **tự làm ra**: một quyết định được viết lại, một đoạn code tự gõ, hoặc một thay đổi thật trong Talksum.

## 2. Dữ kiện đã chốt (13/11/2026) {#facts}

| Việc | Đã chốt |
|---|---|
| Thời lượng | **2 giờ mỗi buổi, dừng cứng.** Các buổi trước hay trôi tới 4–5 giờ vì hỏi đáp giữa chừng |
| Ưu tiên | Năng lực thật trước. Khi có job cần ôn gấp, Nhân báo và soạn plan riêng cho job đó, lộ trình này tạm dừng |
| Vị trí nhắm tới | Senior Full-stack hoặc Product Engineer (.NET + React/Vue). Chưa từng lead team, không trình bày như lead |
| Frontend | Ôn ở mức cơ bản, **ưu tiên thấp**, để cuối cùng sau khi xong backend ([chặng 7](#stage-7)). Nhân đã dùng cả React và Vue, thích Vue hơn; phỏng vấn ở Việt Nam hiếm khi hỏi sâu. Quyết định frontend cũ được dùng làm **câu chuyện** (xem [kho chuyện](#stories)) |
| CI/CD | Học thật ở [chặng 4](#stage-4): hay bị hỏi và Nhân cần cho dự án cá nhân. Trước giờ Nhân nhờ AI làm rồi kiểm tra kết quả, nên lần này tự đọc và tự viết. Doppler (quản lý secret cho nhiều dự án cá nhân) làm khi còn thời gian |
| Microservices | **Mức cơ bản** ([chặng 5](#stage-5)). JD ít ghi nhưng phỏng vấn đôi lúc hỏi, nên không bỏ qua, cũng không đi sâu |
| DDD và spec-driven | Không có buổi riêng. DDD (cho dev) nói qua ở buổi 1.3 và 5.1; spec-driven development (cho AI) nói qua ở buổi 3.4 |
| Tiếng Anh | Không luyện nói trong buổi học. Buổi học dùng tiếng Việt. Cuối buổi chỉ cần **3–5 ý chính bằng tiếng Anh** để Nhân bám vào khi nói |
| Hai project | **Talksum** là bài toán thật để lập luận và áp dụng. **PayoutHub** là chỗ gõ C#. Chi tiết ở [mục 4](#projects) |
| Azure | Nhân có tài khoản. Học bằng cách tự deploy, ở [chặng 4](#stage-4) |
| Docker, Kubernetes, Angular | Để sau cùng, chỉ làm khi một JD cụ thể cần |

**Trọng số từ 32 JD đã lưu** (InterviewTracker đếm, chi tiết trong Google Doc "Ghi chú phỏng vấn"):

- Mặc định ở mọi JD: C#, ASP.NET Core, SQL Server, REST, tiếng Anh. Phần này chỉ cần giữ ấm bằng [câu hỏi lại](#recall).
- Cả hai nhóm JD đều cần: kiến trúc trong một ứng dụng, hiệu năng.
- Nhóm đúng hướng (11 JD full-stack): nặng React, Azure, test, dùng AI để code. Trách nhiệm hay được nhắc: làm với PO, code review, mentor, sở hữu tính năng từ đầu tới cuối.
- Nhóm còn lại (21 JD backend): nặng microservices, messaging, observability. Người phỏng vấn ở Việt Nam hay xoáy vào microservices, kể cả với vị trí full-stack.
- Không JD nào nêu con số cụ thể. Loại số liệu đáng có: thời gian phản hồi trước và sau khi tối ưu (kèm số dòng dữ liệu), quy mô hệ thống (có nguồn), số dev trong team, thời gian từ ticket tới release.

## 3. Cách chạy một buổi {#session}

### Khung 2 giờ {#timebox}

| Phút | Làm gì | Ai làm chính |
|---|---|---|
| 0–10 | **Hỏi lại** 2 câu từ [danh sách chỗ yếu](#recall), chấm thẳng | Model hỏi, Nhân trả lời |
| 10–30 | **Khảo sát**: Nhân giải thích một quyết định thật (trong Talksum hoặc dự án cũ) theo cách hiểu hiện tại. Model chưa dạy gì | Nhân |
| 30–65 | **Cơ chế**: gọi tên chỗ hổng, rồi đi một ví dụ theo đường *cách đơn giản nhất → thêm một áp lực → đau ở đâu → pattern chữa gì → trả giá gì → khi nào không dùng*. Có hình | Model |
| 65–105 | **Thực hành**: Nhân tự gõ C# trên PayoutHub, hoặc tự sửa Talksum. Model chỉ gợi ý và review | Nhân |
| 105–120 | **Chốt**: Nhân viết một ADR ngắn; model rút 3–5 ý chính tiếng Anh từ lời của Nhân; ghi learning log | Cả hai |

### Luật giữ giờ {#time-rules}

Đây là phần quan trọng nhất của khung, vì các buổi trước trễ ở đúng chỗ này.

- **Câu hỏi phát sinh**: nếu nó chặn bước đang làm, trả lời tối đa 3 câu rồi đi tiếp. Nếu không chặn, ghi vào "Bãi đỗ câu hỏi" của buổi và nói một câu "đã ghi lại". Cuối buổi còn giờ thì trả lời, không thì trả lời bằng tin nhắn riêng trong ngày, **ngoài** 2 giờ.
- **Một buổi một mục tiêu.** Mỗi buổi trong lộ trình có một câu hỏi đích. Thứ không phục vụ câu đó thì để buổi khác.
- **Hết 2 giờ thì dừng**, kể cả khi phần thực hành chưa xong. Phần dở mang sang đầu buổi sau, không kéo dài buổi này.
- **Viết trang docs nằm ngoài 2 giờ.** Model viết hoặc sửa trang sau buổi, Nhân đọc lúc rảnh. Trong buổi chỉ dùng hình và ví dụ ngắn ngay trong chat.
- Model nói mốc thời gian khi chuyển phần ("hết 30 phút, sang cơ chế").

### Luật dạy {#teach-rules}

Các luật trong `CLAUDE.md` vẫn áp dụng (mentor, không làm thay; kiểm tra cách hiểu của Nhân trước; hình trước chữ). Thêm cho lộ trình này:

- **Khảo sát trước, dạy sau.** Không chấm điểm rồi đưa đáp án ngay. Câu khảo sát là để biết Nhân đang hiểu tới đâu.
- **Cơ chế trước, công cụ sau.** Dạy vì sao đau trước khi nói tên pattern hay thư viện. Nếu Nhân nói "hai cách trông như nhau" thì ví dụ đang sai: đổi ví dụ, không thêm giải pháp.
- **Luôn có phần "khi nào không dùng".** Mỗi pattern phải đi kèm trường hợp nó thừa. Đây là thứ Nhân cần để tự chỉnh cho use case của mình.
- **Giữ lập trường.** Khi Nhân phản biện, tách phần đúng và phần chưa đúng. Không gật theo cho xong.
- **Đọc code thật trước buổi.** Model phải đọc các file Talksum và PayoutHub ghi trong buổi đó trước khi hỏi. Các đường dẫn trong trang này được đọc ngày 13/11/2026 (commit `893aa31` của Talksum); nếu code đã đổi thì tin code.
- **Không bịa số liệu, không thổi phồng vai trò.** Chuyện nhỏ thì kể là chuyện nhỏ.

### Sản phẩm mỗi buổi {#outputs}

1. **Một ADR ngắn do Nhân viết** (ADR là bản ghi một quyết định kiến trúc). Khung 5 dòng: bối cảnh và áp lực; các phương án; chọn gì và vì sao; cái giá đã chấp nhận; khi nào sẽ đổi. ADR về Talksum đặt ở `docs/adr/` trong repo Talksum. ADR về PayoutHub đặt ở `docs/decisions/` trong repo này (buổi đầu tiên viết ADR thì tạo folder và thêm nhóm sidebar).
2. **3–5 ý chính tiếng Anh**, ghi vào `docs/progress/talking-points.md` dưới tên chủ đề. Ý ngắn, không viết thành đoạn văn.
3. **Một mục learning log**: làm gì, chỗ yếu mới, bãi đỗ câu hỏi còn lại, buổi sau bắt đầu từ đâu.
4. Tick checklist ở [mục 6](#stages) và ở [Plan](/progress/plan) nếu có làm lab.

## 4. Hai project làm ví dụ {#projects}

### Talksum: bài toán thật {#talksum}

Repo `NhanLT6/monetai_flutter` (tên sản phẩm là Talksum). App Flutter ghi chi tiêu bằng giọng nói. Phần `api/` viết bằng TypeScript: Hono trên Cloudflare Workers, Drizzle + Neon Postgres, better-auth, zod, vitest, Sentry.

Vì sao dùng: đây là sản phẩm của chính Nhân, là nơi duy nhất Nhân được tự quyết và áp dụng điều đã học. Nó nhỏ nhưng đã chứa nhiều quyết định kiến trúc thật.

**Điều cần biết về cách Talksum được làm:** Nhân lên ý tưởng và chọn hướng, AI kiểm tra, tìm hiểu rồi viết code. Nhân dùng app và kiểm tra trên UI, **chưa đọc code từng dòng** như với C#. Nghĩa là nhiều quyết định ở mức cấu trúc code là do AI đề xuất. Vì vậy với Talksum, việc đầu tiên luôn là **Nhân tự đọc và giải thích lại**, rồi mới tới đánh giá và sửa.

Phạm vi đọc: tập trung vào `api/` (khoảng 5.300 dòng TypeScript, đọc được). Phần Flutter chỉ đọc ở mức cấu trúc: `lib/data/` (repository, sync) và cách chia `lib/features/`. Không đọc widget.

Áp dụng vào Talksum: mỗi chặng chọn **một thay đổi nhỏ có thật** để Nhân tự làm trong `api/`. Thay đổi phải xuất phát từ một điểm yếu tìm thấy khi đọc, không tự nghĩ ra cho có. Talksum là app đang chạy thật với dữ liệu tài chính, nên theo đúng quy trình của repo đó (`CLAUDE.md` của Talksum, test, PR) và không gộp việc học vào một thay đổi lớn.

### PayoutHub: chỗ gõ C# {#payouthub}

Mọi JD đều là .NET, và người phỏng vấn hỏi bằng C#. Mỗi ý học ở Talksum được làm lại bằng .NET trên PayoutHub để tay quen.

Hiện trạng (13/11/2026): M1 xong. M2 có entity (`Affiliate`, `Conversion`, `Merchant`, `Money`) và cấu hình `DbContext`. Chưa có controller nghiệp vụ, chưa có test, `FakeBank` mới là khung.

Lộ trình này **không đi theo thứ tự M2 → M8 nữa**. Các mục trong [Plan](/progress/plan) được gọi ra theo từng buổi, đúng lúc nó minh hoạ cho điều đang học. Mục nào không được buổi nào gọi thì để sau. M8 (Docker, Kubernetes) để sau cùng.

Cặp `PayoutHub.Api` và `FakeBank` là **hai service thật gọi nhau qua mạng**. Đây là chỗ Nhân có kinh nghiệm tay về hệ phân tán mà không cần giả vờ đã làm microservices.

## 5. Kho chuyện thật {#stories}

Mỗi buổi gắn với ít nhất một chuyện dưới đây, để điều vừa học có chỗ bám trong kinh nghiệm của Nhân. Chi tiết từng dự án nằm trong Google Doc "Ghi chú phỏng vấn". Chuyện nào còn thiếu chi tiết thì hỏi Nhân, không đoán.

| Chuyện | Dùng cho |
|---|---|
| **My Fertility Health**: hai dev khác gọi thẳng plugin Ionic, không bọc wrapper, nên khó xử lý lỗi. Phần logic thuần của Nhân có unit test, QA không tìm ra lỗi | Chiều phụ thuộc, bọc thứ bên ngoài, test |
| **RTK Query sinh code từ OpenAPI của C#** (Altsource): một nguồn sự thật cho hợp đồng API, không viết lại tay | Một nguồn sự thật, hợp đồng giữa hai phía |
| **Vuetify ở Websparks**: đưa cả team sang một bộ UI thay cho nhiều thư viện lẻ | Dẫn dắt một quyết định, nhất quán |
| **Trang Legal ở CF**: dựng một project ASP.NET Core nhỏ trước để thử đường migrate. Kết quả gần như không có vấn đề kỹ thuật, team chủ yếu cần thời gian thích nghi. Chuyện nhỏ, kể đúng cỡ | Migrate dần thay vì viết lại, giảm rủi ro |
| **MSMQ ở CF**: xử lý nền, lỗi thì chỉ log, không retry | Messaging, at-least-once, dead-letter |
| **Job nền Quartz ở Jabil**: gom dữ liệu mỗi 15 phút cho dashboard sản xuất | Việc nền, lịch chạy, báo cáo |
| **Trợ lý AI ở CF**: xếp hạng merchant bằng LLM không ổn nên quay về luật SQL; đề xuất thiết kế tool kiểu semantic layer nhưng lead không chọn | Khi nào không dùng AI, bất đồng kỹ thuật |
| **Slack/Teams ở CF**: đề xuất v1 chỉ gửi thông báo chính, đo mức dùng rồi mới làm v2; không được chọn | Phạm vi, MVP |
| **WorkCtx**: bỏ luồng tự động hoàn toàn vì tốn usage, chuyển sang người kiểm từng bước | Mức tự động hoá, chi phí AI |
| **Talksum: bảng đo token các lần chạy agent** (`docs/wiki/process/how-we-work.md`): cách làm đầy đủ tốn khoảng 4,7 triệu token, cách gọn khoảng 1,15 triệu cho cùng cỡ việc | Đo chi phí AI bằng số thật |
| **CF**: khoảng 100.000 affiliate, khoảng 200 merchant (CTO nói trong daily, chưa kiểm chứng) | Quy mô, nói rõ nguồn |

## 6. Các chặng {#stages}

Thứ tự là thứ tự ưu tiên. **Ưu tiên 1** (chặng 0 đến 2, 11 buổi) là phần cả hai nhóm JD đều cần và là chỗ nhận xét phỏng vấn gần đây nêu ra. **Ưu tiên 2** là chặng 3 (test, AI), chặng 4 (CI/CD, Azure) và chặng 5 (hệ phân tán ở mức cơ bản), 11 buổi. **Ưu tiên 3** là chặng 6 (system design). **Cuối cùng** là chặng 7 (frontend cơ bản) và buổi Doppler tuỳ chọn. Tổng 27 buổi; với 5 buổi mỗi tuần là khoảng 5 đến 6 tuần, ưu tiên 1 xong trong hơn 2 tuần.

Mỗi buổi ghi: **câu đích** (thứ Nhân phải tự trả lời được khi hết buổi), chỗ đọc trong Talksum, lab trên PayoutHub, chuyện thật, và trang trên site.

### Chặng 0: Vẽ lại hệ thống của mình (1 buổi) {#stage-0}

- [ ] **Buổi 0. Một request đi từ đâu tới đâu.**
  - Câu đích: "Mô tả cấu trúc dự án của bạn và đường đi của một thao tác từ UI tới DB." Đây là câu mở đầu rất hay gặp ở vòng kỹ thuật.
  - Khảo sát: Nhân vẽ (bằng chữ hoặc mermaid) đường đi của một câu nói trong Talksum: app → Worker → AI → DB → app. Chưa mở code.
  - Talksum: `api/src/index.ts` (thứ tự middleware: CORS, kiểm tra env, auth, route), `api/src/middleware/`, `api/src/routes/ai.ts`. So hình Nhân vẽ với code thật.
  - Làm tiếp: vẽ cùng kiểu hình đó cho CF (Web Forms, MSMQ, SQL Server) từ trí nhớ, và cho PayoutHub (`Api → Infrastructure → Core`).
  - Sản phẩm: ba hình, và ADR đầu tiên: "Vì sao Talksum chỉ có một Worker cho cả API và AI."
  - Trang: [Middleware](/aspnet-core/middleware), [API security](/aspnet-core/api-security). Buổi này không cần trang mới.

### Chặng 1: Tổ chức code trong một ứng dụng (5 buổi) {#stage-1}

Nguyên lý xuyên suốt: **thứ gì đổi cùng nhau thì ở gần nhau, thứ gì đổi vì lý do khác nhau thì cách nhau bằng một đường ranh.** Mọi kiểu kiến trúc là một cách vẽ đường ranh đó, và mỗi đường ranh đều tốn công.

Trang còn thiếu, model viết sau buổi 1.1 và bổ sung dần: `architecture/app-architecture.md` (các kiểu tổ chức code trong một ứng dụng: một ví dụ tiến hoá từ code-behind tới layered, ports and adapters, vertical slice).

- [ ] **Buổi 1.1. Coupling, cohesion, chiều phụ thuộc.**
  - Câu đích: "Vì sao `Core` của PayoutHub không phụ thuộc project nào? Đổi lại được gì, mất gì? Dự án nào thì không cần làm vậy?"
  - Khảo sát: ở CF (Web Forms code-behind), khi đổi một rule tính hoa hồng thì phải sửa những chỗ nào? Vì sao?
  - Talksum: so `api/src/routes/` (nhận request), `api/src/lib/` (logic), `api/src/lib/db/` (dữ liệu). Route nào chứa cả logic lẫn truy vấn (`routes/ai.ts` dài 552 dòng)? Đó có phải vấn đề không, với một API cỡ này?
  - Lab: không gõ code mới. Nhân đọc lại `PayoutHub.Core`, `Infrastructure`, `Api` và chỉ ra mỗi reference giữa project đang chặn loại thay đổi nào.
  - Trang: [SOLID và pattern](/dotnet/solid-patterns), [Dependency injection](/aspnet-core/dependency-injection).

- [ ] **Buổi 1.2. Bọc thứ bên ngoài: interface đáng giá khi nào.**
  - Câu đích: "Khi nào đặt interface trước một thứ bên ngoài, khi nào interface chỉ là thủ tục thừa?"
  - Talksum: `api/src/lib/ai/ai-provider.ts` và `api/src/lib/ai/index.ts` (đổi Groq sang Workers AI bằng một biến env), registry `SpeechEngine` trong `lib/features/recording/`, `TransactionRepository` trừu tượng trong `lib/data/repositories/`. Hỏi Nhân: trong ba cái đó, cái nào đã thật sự đổi implementation, cái nào chỉ có một?
  - Chuyện: My Fertility Health không bọc plugin Ionic.
  - Lab (M3 trong Plan): `IPayoutMethod` cho Bank, PayPal, Wise (phí và validate). Nhân tự viết. Sau đó thêm một phương thức thứ tư để thấy chỗ nào phải sửa.
  - Trang: [SOLID và pattern](/dotnet/solid-patterns), [Dependency injection](/aspnet-core/dependency-injection).

- [ ] **Buổi 1.3. Luật nghiệp vụ nằm ở đâu.**
  - Câu đích: "Rule nghiệp vụ nên nằm trong entity, trong service, hay trong handler? Dấu hiệu nào cho thấy cần domain model, dấu hiệu nào cho thấy transaction script là đủ?"
  - Talksum: `api/src/lib/usage.ts` (hạn mức theo ngày, theo streak) và `api/src/lib/validate.ts`. Luật ở đây viết kiểu hàm thuần. Vì sao kiểu đó hợp với Worker không giữ state?
  - Lab (M2 trong Plan): entity `Payout` với `private set` và method `Approve`, `Reject`; chuyển trạng thái sai thì ném lỗi. Nhân tự viết, vì đây cũng là chỗ yếu cũ (constructor so với object initializer, entity luôn hợp lệ).
  - Nói qua **DDD ở mức dev** ngay trên entity vừa viết: ubiquitous language (tên trong code trùng với lời của nghiệp vụ), entity và value object (`Money`), aggregate là ranh giới giữ một luật luôn đúng. Không đi sâu hơn mức đó.
  - Trang: [DDD](/architecture/ddd) (mục entity, aggregate, và "khi nào thừa").

- [ ] **Buổi 1.4. Chia theo tầng hay theo tính năng; đọc và ghi.**
  - Câu đích: "Chia thư mục theo layer hay theo feature? Repository có cần không khi đã có `DbContext`? Khi nào tách đường đọc khỏi đường ghi?"
  - Talksum: `lib/features/*` chia theo tính năng, còn `lib/data/` lại chia theo tầng. Vì sao một app dùng cả hai? `api/` thì chia theo loại file. Cỡ nào thì cách chia đó bắt đầu đau?
  - Lab (M2 trong Plan): `GET /affiliates/{id}/conversions` có phân trang và projection sang DTO, viết thẳng trên `DbContext`, không qua repository. So với đường ghi ở buổi 1.3. Nhân quyết định PayoutHub có cần repository không và viết ADR.
  - Chuyện: RTK Query sinh code từ OpenAPI.
  - Trang: [EF Core](/data/ef-core), [DDD](/architecture/ddd) (mục repository).

- [ ] **Buổi 1.5. Việc cắt ngang: pipeline. Kiểm tra chặng 1.**
  - Câu đích: "Auth, phân quyền, validate, xử lý lỗi nên đặt ở đâu trong đường đi của request, và vì sao không đặt trong từng handler?"
  - Talksum: `require-auth.ts`, `require-feature.ts`, `parse-auth.ts`, đoạn chặn env trong `index.ts`. Talksum dùng session của better-auth (token tra trong DB) thay cho JWT tự xác thực. Hỏi Nhân: hai cách khác nhau ở điểm nào khi cần thu hồi quyền ngay?
  - Lab (M3 trong Plan): endpoint approve với policy `Finance`, trả đúng 401, 403, 404, 409. Dùng dịp này hỏi lại trọn luồng access token và refresh token (câu đã bị hỏi ở phỏng vấn thật).
  - **Kiểm tra chặng (30 phút cuối):** Nhân trả lời lại câu đích của buổi 0 cho cả ba hệ thống, lần này phải có lý do và cái giá cho từng đường ranh. Model chấm thẳng, ghi chỗ còn yếu vào learning log.
  - Trang: [Middleware](/aspnet-core/middleware), [Filters](/aspnet-core/filters), [JWT](/aspnet-core/authentication-jwt), [Authorization](/aspnet-core/authorization).

### Chặng 2: Dữ liệu, nhất quán, hiệu năng (5 buổi) {#stage-2}

Nguyên lý xuyên suốt: **dữ liệu chỉ đúng khi nói rõ được "đúng tại thời điểm nào, theo ai".** Hai người cùng sửa, một request chạy hai lần, một bước chết giữa chừng: mỗi tình huống cần một cơ chế riêng, và cơ chế nào cũng chậm đi hoặc phức tạp lên.

Trang còn thiếu: `data/transactions.md` (transaction, isolation, ranh giới atomic) và `data/caching.md`. Model viết sau buổi tương ứng.

- [ ] **Buổi 2.1. Ranh giới "tất cả hoặc không gì".**
  - Câu đích: "Trong một thao tác nhiều bước, những bước nào phải thành công cùng nhau? Chuyện gì xảy ra nếu chết giữa chừng?"
  - Talksum: `api/src/lib/sync/engine.ts`: cả một lần push chạy trong **một** transaction Postgres. `api/src/lib/holds.ts`: đọc hold mà không tiêu, chỉ nhả khi đã trả xong, để chết giữa chừng vẫn đổi lại được. Hỏi Nhân: nếu đọc là xoá luôn thì hỏng ở đâu?
  - Lab (M3 trong Plan): `POST /payouts/generate`. Gom conversion đã duyệt thành payout, đảm bảo một conversion chỉ thuộc một payout. Nhân quyết định ranh giới transaction.
  - Trang: [EF Core](/data/ef-core); trang mới `data/transactions.md`.

- [ ] **Buổi 2.2. Hai người cùng sửa.**
  - Câu đích: "Last-write-wins mất gì? Khi nào chấp nhận được, khi nào phải dùng optimistic concurrency?"
  - Talksum: `api/src/lib/sync/statements.ts`: bản ghi nào có `updated_at` mới hơn thì thắng, server kẹp lại giờ của máy chạy nhanh (`clampedInstant`), bản thua nhận về bản thắng để tự gộp. Hỏi Nhân: với sổ chi tiêu cá nhân, lựa chọn này hợp lý không? Với payout thì sao?
  - Lab (M3 trong Plan): hai Finance cùng approve một payout. Thêm `RowVersion`, bắt `DbUpdateConcurrencyException`, trả 409. Đây là chỗ yếu đã sai nhiều lần.
  - Trang: [EF Core](/data/ef-core) (mục concurrency), [REST API](/aspnet-core/rest-api).

- [ ] **Buổi 2.3. Một request chạy hai lần.**
  - Câu đích: "Vì sao phải giả định mọi request có thể tới hai lần? Làm sao để lần thứ hai vô hại?"
  - Talksum: client offline đẩy lại hàng đợi (`lib/features/offline_queue/`), push dùng upsert theo `id` nên gửi lại không tạo trùng; con trỏ `change_seq` khi pull. Hỏi Nhân: thao tác nào trong Talksum **chưa** an toàn khi gửi lại?
  - Lab (M4 trong Plan): `FakeBank` nhận `Idempotency-Key`; PayoutHub dùng id của payout làm key. Unique constraint là lớp chặn cuối.
  - Trang: [REST API](/aspnet-core/rest-api), [Messaging](/architecture/messaging) (mục idempotent consumer).

- [ ] **Buổi 2.4. Hiệu năng: đo trước, sửa sau.** (Buổi này tạo ra số liệu thật đầu tiên.)
  - Câu đích: "Production chậm. Bạn làm gì, theo thứ tự nào?"
  - Lab (M2 và M7 trong Plan): seed khoảng 100.000 conversion. Đo endpoint danh sách conversion và báo cáo commission. Tìm N+1, thiếu projection, thiếu index bằng log của EF và execution plan. Sửa từng thứ một, đo lại sau mỗi lần. Ghi bảng trước và sau (ms, số dòng, số query).
  - Cùng lúc hỏi lại: sargable, thứ tự cột trong composite index, `AsNoTracking`.
  - Talksum: `PULL_PAGE_SIZE` 500 và `MAX_PUSH_ROWS` 1000 trong `engine.ts`. Vì sao phải có giới hạn, và con số đó từ đâu ra?
  - Sản phẩm thêm: câu trả lời cho "kể một lần bạn tối ưu hiệu năng", dùng số đo thật này, nói rõ đây là project cá nhân. Kèm thói quen thiết kế cho hiệu năng từ đầu ở CF (không bịa chuyện "sửa cái chậm").
  - Trang: [SQL chậm và index](/data/sql-performance), [EF Core](/data/ef-core).

- [ ] **Buổi 2.5. Cache và việc nền. Kiểm tra chặng 2.**
  - Câu đích: "Khi nào cache, cache ở đâu, và làm sao biết dữ liệu cache đã cũ? Việc nào nên đẩy ra khỏi request?"
  - Talksum: `api/src/lib/rates.ts` (tỷ giá, có nguồn chính và nguồn dự phòng). Model đọc trước để xem nó lấy và giữ tỷ giá thế nào. Worker không có bộ nhớ sống lâu, vậy cache nằm ở đâu?
  - Chuyện: job Quartz ở Jabil.
  - Lab (M4 và M5 trong Plan): `Channel` + `BackgroundService` cho việc chuyển tiền, mỗi job tự tạo scope (chỗ yếu cũ); `IMemoryCache` cho tra cứu affiliate có invalidation. Chọn một trong hai nếu thiếu giờ, ưu tiên việc nền.
  - **Kiểm tra chặng (30 phút cuối):** một bài nhỏ: "Thiết kế tính năng xuất báo cáo lớn" (dạng bài hay gặp ở vòng kỹ thuật). Nhân tự dẫn, model chỉ hỏi.
  - Trang: [Async](/runtime/async), [Async flow](/runtime/async-flow); trang mới `data/caching.md`.

### Chặng 3: Test và làm việc với AI (4 buổi) {#stage-3}

Nguyên lý xuyên suốt: **test là thứ cho phép thay đổi mà không sợ, và là thứ cho phép giao việc cho agent.** Không có test thì người phải kiểm bằng mắt, nên mức tự động hoá bị chặn ở đó.

Trang còn thiếu: nhóm `testing/` (một trang về chọn tầng test, một trang về `WebApplicationFactory`) và một trang `ai-workflow`. Model viết sau buổi tương ứng.

- [ ] **Buổi 3.1. Test cái gì, ở tầng nào.**
  - Câu đích: "Với một tính năng, bạn chọn unit test, integration test hay kiểm bằng tay? Dựa vào đâu?"
  - Talksum: `api/test/` (khoảng 32 file): test nào chạm DB thật (`*-db.test.ts`), test nào dùng dữ liệu giả. `FakeSpeechEngine` trong app. Hỏi Nhân: test nào trong số đó đã từng bắt được lỗi thật?
  - Chuyện: My Fertility Health, phần logic thuần có unit test.
  - Lab (M6 trong Plan): xUnit cho state machine của `Payout` và phần tính phí. Nhân tự viết, nói to test case trước khi gõ (chỗ yếu khi live coding).

- [ ] **Buổi 3.2. Integration test và một vòng TDD.**
  - Câu đích: "Integration test của API nên dựng thật tới đâu, giả từ đâu? TDD đáng khi nào?"
  - Lab (M6 trong Plan): `WebApplicationFactory` cho luồng approve, có case concurrency; fake gateway thay `FakeBank`. Rồi làm một vòng TDD nhỏ cho một rule mới (payout dưới `MinAmount` thì dồn sang kỳ sau), có nói Big-O và test case.

- [ ] **Buổi 3.3. AI trong sản phẩm: đo được mới sửa được.**
  - Câu đích: "Làm sao biết một thay đổi prompt là tốt hơn? Khi nào không nên dùng LLM?"
  - Talksum: `api/eval/` (bộ case, kết quả `baseline.json` và các lần sau), `api/src/lib/ai/prompts.ts`, `record-kinds.ts` (làm sạch output của model), tách prompt hệ thống khỏi lời người dùng trong `ai-provider.ts`. Nhân đọc và giải thích bộ eval đo cái gì.
  - Chuyện: xếp hạng merchant bằng LLM rồi quay về luật SQL; thiết kế tool kiểu semantic layer.
  - Áp dụng vào Talksum: Nhân tự thêm vài case eval cho một lỗi parse đã gặp khi dùng app, chạy và đọc kết quả.

- [ ] **Buổi 3.4. AI để viết code: mức tự động và chi phí. Kiểm tra chặng 3.**
  - Câu đích: ba câu đã bị hỏi ở phỏng vấn thật. "Bạn đo chi phí dùng AI thế nào?" "Vì sao không cho AI quét cả project một lần?" "Vì sao không tự động hoá hết?"
  - Talksum: `docs/wiki/process/how-we-work.md` (bảng Measured: token của từng lần chạy, cách làm đầy đủ so với cách gọn), các luật "enforced, never remembered" trong `CLAUDE.md` của Talksum, các lệnh audit trong Makefile. Đây là số liệu thật của chính Nhân.
  - Nói qua **spec-driven development**: viết spec và plan trước, agent làm theo, người duyệt ở spec thay vì ở từng dòng code. Talksum đang làm đúng kiểu này (`docs/superpowers/specs/`, `docs/superpowers/plans/`). Nhân nêu: spec giúp gì, tốn gì, việc cỡ nào thì viết spec là thừa. Liên hệ với DDD: cả hai đều bắt đầu bằng việc thống nhất từ ngữ và luật nghiệp vụ trước khi viết code.
  - Chuyện: WorkCtx.
  - Sản phẩm: câu chuyện AI hoàn chỉnh, gồm mức tự động hiện tại và vì sao, test và audit là hàng rào, số token thật, cách sẽ đo "chi phí trên mỗi thay đổi được chấp nhận". Chỗ nào chưa đo thì nói là chưa đo.
  - **Kiểm tra chặng:** Nhân trả lời 9 câu AI trong job #25 của bảng job (InterviewTracker giữ), model chấm.

### Chặng 4: Đưa code lên production: CI/CD, secret, Azure (4 buổi, thêm 1 buổi tuỳ chọn) {#stage-4}

Nguyên lý xuyên suốt: **pipeline là một chuỗi cổng tự động giữa "code trên máy mình" và "code đang chạy cho người dùng"; mỗi cổng chặn một loại lỗi và tốn một khoản thời gian.** Thiết kế pipeline là chọn cổng nào đáng tiền.

Vì sao có chặng này: CI/CD có trong gần nửa số JD đúng hướng và hay bị hỏi. Nhân cũng cần nó cho các dự án cá nhân. Tới giờ phần này Nhân thường nhờ AI viết rồi kiểm tra kết quả, nên **chưa phải kiến thức của mình**. Vì vậy ở chặng này Nhân tự đọc từng dòng pipeline đang có và tự viết pipeline mới từ file trắng; model chỉ giải thích và review.

Trước khi tạo tài nguyên Azure, model kiểm tra gói miễn phí hiện hành và nói rõ thứ nào có thể tốn tiền. Xong chặng thì xoá hoặc tắt tài nguyên.

Trang còn thiếu, model viết sau buổi tương ứng: nhóm `delivery/` gồm một trang CI/CD (một commit đi qua những cổng nào) và một trang Azure (một app đi lên cloud, mỗi chặng dùng dịch vụ nào).

- [ ] **Buổi 4.1. CI: cái gì chặn một bản lỗi.**
  - Câu đích: "Từ lúc push tới lúc code sẵn sàng deploy, những gì chạy, theo thứ tự nào, và mỗi bước chặn loại lỗi gì?"
  - Khảo sát: Nhân kể lại, chưa mở file, chuyện gì xảy ra khi merge vào `main` của Talksum.
  - Talksum: `.github/workflows/deploy.yml` (63 dòng). Nhân đọc từng khối và giải thích: trigger và `paths-ignore`, `concurrency` (vì sao hai lần deploy không được chạy đè nhau), `permissions`, vì sao chỉ có một job, `make verify` gồm những gì. File này cố ý **không** chạy trên pull request để tiết kiệm phút chạy của GitHub Actions: Nhân nêu cái giá của lựa chọn đó.
  - Lab: PayoutHub hiện chỉ có `deploy-docs.yml`. Nhân tự viết `ci.yml` từ file trắng: restore, build, test, chạy trên pull request, có cache NuGet. Rồi cố ý làm hỏng một test để thấy pipeline đỏ. Cần test của [chặng 3](#stage-3) đã có.
  - Khái niệm cần gọi đúng tên: trigger, job, step, runner, cache, artifact, required check.

- [ ] **Buổi 4.2. CD lên Azure; cấu hình và secret theo môi trường.**
  - Câu đích: "Cấu hình và secret đi từ đâu tới app ở mỗi môi trường? Deploy xong mới thấy lỗi thì quay lại thế nào?"
  - Talksum: secret nằm ở ba nơi (`api/.dev.vars`, `wrangler secret`, GitHub Actions); `scripts/secrets-audit.sh` so cả ba với `envSchema`; `make prod-deploy` chạy `prod-secrets-audit` trước và `prod-check` sau; trong `deploy.yml` secret chỉ được nạp ở đúng step deploy. Nhân giải thích vì sao từng cổng tồn tại.
  - Lab: App Service + Azure SQL cho PayoutHub. Nhân tự viết workflow deploy: đăng nhập Azure từ GitHub Actions (model kiểm tra tài liệu hiện hành, ưu tiên cách không lưu mật khẩu dài hạn trong GitHub), publish, deploy. Connection string đặt ở app settings, không nằm trong repo. Nhân quyết định EF migration chạy ở bước nào của pipeline và viết ADR (chạy trước app mới thì schema và code cũ phải sống chung được một lúc).
  - Key Vault: chỉ ở mức biết nó giải quyết gì và khi nào app settings là đủ.

- [ ] **Buổi 4.3. Vận hành: nhìn thấy app đang chạy, và chọn dịch vụ. Kiểm tra chặng 4.**
  - Câu đích: "Có lỗi ở production. Bạn tìm nguyên nhân bằng gì, và đưa bản cũ quay lại thế nào?"
  - Talksum: `api/src/routes/health.ts`, Sentry và `telemetry-scrub.ts` (lọc dữ liệu nhạy cảm trước khi gửi đi).
  - Lab: gây một lỗi 500 thật trên bản đã deploy, lấy `traceId` trong ProblemDetails và tìm lại đúng request trong Application Insights. Thử deployment slot nếu gói đang dùng có hỗ trợ (model kiểm tra trước). Scale up so với scale out.
  - Bản đồ "việc này thì dùng gì": App Service, Functions, Service Bus, Blob, Azure SQL. Mỗi dịch vụ một câu "dùng khi", một câu "giá".
  - **Kiểm tra chặng:** Nhân vẽ pipeline của PayoutHub từ commit tới production, chỉ ra từng cổng chặn lỗi gì, rồi trả lời "nếu chỉ được giữ ba cổng thì giữ cổng nào".
  - Trang: [Logging](/aspnet-core/logging), [Health checks](/aspnet-core/health-checks).

- [ ] **Buổi 4.4 (tuỳ chọn, làm khi còn thời gian). Doppler: một nguồn secret cho nhiều dự án cá nhân.**
  - Xuất phát từ nhu cầu thật của Nhân: nhiều dự án cá nhân, mỗi dự án nhiều môi trường và nhiều nơi giữ secret.
  - Câu đích: "Cùng một secret phải có mặt ở máy dev, CI và production. Làm sao chỉ có một nguồn, và khi đổi giá trị thì những nơi kia biết bằng cách nào?"
  - Talksum hôm nay chọn cách **giữ ba kho và kiểm tra lệch** bằng audit. Doppler là cách còn lại: **một kho, đồng bộ ra các nơi dùng**. Nhân so hai cách: mỗi cách bỏ được việc gì, thêm phụ thuộc gì (một dịch vụ bên thứ ba giữ toàn bộ secret), hỏng thì hỏng kiểu nào.
  - Model đọc tài liệu Doppler hiện hành trước buổi (gói miễn phí, cách tích hợp với GitHub Actions và Cloudflare), không nói theo trí nhớ.
  - Áp dụng: thử trên một dự án cá nhân nhỏ. Đưa Talksum sang Doppler là quyết định riêng, theo [mục 8](#checkpoints).

### Chặng 5: Hệ phân tán ở mức cơ bản (3 buổi) {#stage-5}

Nguyên lý xuyên suốt: **qua mạng thì mọi lời gọi có thể chậm, mất, hoặc tới hai lần, và hai phía không cùng sống chết.** Microservices là một cách trả giá đó để đổi lấy việc deploy và scale độc lập. Phần lớn dự án không cần trả.

**Độ sâu: cơ bản.** JD đúng hướng ít ghi microservices, nhưng vào phỏng vấn đôi lúc vẫn bị hỏi. Đích của chặng là trả lời được câu hỏi khái niệm và trade-off bằng lập luận của mình, không phải vận hành được microservices. Outbox, saga, service discovery, API gateway: mỗi thứ chỉ cần nói được nó chữa vấn đề gì trong một hai câu; các trang [Microservices](/architecture/microservices) và [Messaging](/architecture/messaging) đã có sẵn để đọc lại. Không làm Kubernetes.

Về việc Nhân chưa làm microservices: không giấu, không giả. Lập trường cần có khi hết chặng: "Tôi chưa vận hành microservices ở production. Tôi biết nó chữa vấn đề gì và giá của nó, tôi đã tự làm hai service gọi nhau có retry, idempotency và webhook, và với các dự án tôi từng làm thì monolith chia module là lựa chọn đúng, vì những lý do sau."

- [ ] **Buổi 5.1. Tách hay không tách.**
  - Câu đích: "Khi nào nên tách một monolith thành nhiều service? Dự án bạn đang làm có nên tách không?"
  - Khảo sát: áp vào CF (monolith Web Forms, team chia theo epic, 2–3 dev mỗi epic). Nếu tách thì tách theo đâu? Cái gì sẽ tệ đi?
  - Talksum: nó **đã** là hệ phân tán: DB trên máy người dùng, Worker, Neon, nhà cung cấp AI. Ranh giới nào là bắt buộc, ranh giới nào là tự chọn?
  - Nói qua DDD ở đúng chỗ nó có ích cho câu này: **bounded context** là cách tìm đường cắt theo nghiệp vụ thay vì theo bảng (chỗ yếu cũ: chia service theo bảng).
  - Chuyện: trang Legal ở CF (thử trên project nhỏ trước khi migrate).
  - Trang: [Microservices](/architecture/microservices), [DDD](/architecture/ddd). Bổ sung mục modular monolith nếu chưa có.

- [ ] **Buổi 5.2. Gọi một thứ có thể lỗi.**
  - Câu đích: "Service bạn gọi bị chậm. Chuyện gì xảy ra với service của bạn, và bạn chặn thế nào?"
  - Talksum: `api/src/lib/ai/groq.ts` (`AbortSignal`, chờ rồi thử lại khi bị 429, `AiRateLimitError`, đi qua AI Gateway). Hỏi Nhân: khi Groq chết thì người dùng Talksum thấy gì? Như vậy đã đủ chưa?
  - Lab (M4 trong Plan): typed `HttpClient` gọi `FakeBank` với resilience handler (timeout, retry, circuit breaker), `CancellationToken` đi xuyên các tầng. Bật độ trễ và tỷ lệ lỗi của `FakeBank` để thấy từng cơ chế hoạt động.
  - Trang: [Microservices](/architecture/microservices) (mục cascading failure). Trang còn thiếu: resilience.

- [ ] **Buổi 5.3. Việc không cần trả lời ngay: message. Kiểm tra chặng 5.**
  - Câu đích: "Khi nào dùng message thay cho gọi trực tiếp? At-least-once kéo theo những gì?"
  - Chuyện: MSMQ ở CF chỉ log lỗi. Nhân viết ra: message hỏng hiện đi đâu, mất gì, và sẽ đề xuất gì (retry có giới hạn, dead-letter, consumer idempotent).
  - Talksum: hàng đợi offline phía client là một hàng đợi thật. Nó xử lý gửi lại và trùng thế nào?
  - Lab (M5 trong Plan): `FakeBank` gọi webhook về PayoutHub; verify chữ ký HMAC; lưu id event đã xử lý với unique index. Không làm outbox và saga bằng code; chỉ hỏi lại ở mức "nó chữa gì".
  - **Kiểm tra chặng (30 phút cuối):** bài thiết kế "gọi một cổng thanh toán bên ngoài hay timeout", Nhân tự dẫn.
  - Trang: [Messaging](/architecture/messaging), [Tooling](/architecture/tooling).

### Chặng 6: System design và tổng hợp (3 buổi, rồi lặp lại) {#stage-6}

- [ ] **Buổi 6.1. Khung làm bài thiết kế.** Hỏi yêu cầu, ước lượng tải, API, dữ liệu, sơ đồ, điểm nghẽn, lỗi, trade-off. Làm bài: "Talksum có gấp 100 lần người dùng. Cái gì gãy trước?"
- [ ] **Buổi 6.2. Bài thiết kế thứ hai**: đối soát thanh toán (dùng lại miền của PayoutHub), hoặc SaaS nhiều tenant.
- [ ] **Buổi 6.3. Mock tổng**: kiến trúc, hiệu năng, CI/CD, AI, một bài thiết kế ngắn, behavioral ("có làm việc vượt trách nhiệm không"). Không được bỏ buổi này.

Sau đó: cứ 2–3 ngày một bài thiết kế mới, cho tới khi có job cụ thể.

### Chặng 7: Frontend ở mức cơ bản (2 buổi, ưu tiên thấp) {#stage-7}

Chỉ làm sau khi xong hết phần backend ở trên. Nhân đã dùng cả React và Vue (thích Vue hơn), nên đây là **ôn lại và gọi đúng tên**, không học từ đầu. Ví dụ luôn đặt React và Vue cạnh nhau. Không làm Angular. Nội dung chi tiết chốt lại khi tới nơi, theo JD đang nhắm lúc đó.

- [ ] **Buổi 7.1. Một màn hình lấy dữ liệu và vẽ lại thế nào.**
  - Câu đích: "Khi dữ liệu đổi, React và Vue biết phải vẽ lại gì bằng cách nào? State nào để ở component, state nào để ở store, dữ liệu từ server để ở đâu?"
  - Chuyện: RTK Query sinh code từ OpenAPI; Vuetify ở Websparks.
- [ ] **Buổi 7.2. Frontend nói chuyện với API.**
  - Câu đích: "Token giữ ở đâu trên trình duyệt và vì sao? Form validate ở client hay server? Trang chậm thì xem gì trước?"
  - Nối với backend đã học: [JWT](/aspnet-core/authentication-jwt) (lưu token, CSRF), [REST API](/aspnet-core/rest-api) (mã lỗi, ProblemDetails hiển thị ra sao).

## 7. Câu hỏi lại đầu buổi {#recall}

Mười phút đầu mỗi buổi lấy 2 câu ở đây, ưu tiên câu lâu chưa hỏi hoặc lần trước sai. Sai thì hỏi lại sau 2 buổi. Đúng hai lần liên tiếp thì giãn ra.

- `await Task.WhenAll`: ném exception nào; chạy tuần tự hay đồng thời
- `.Result`: deadlock ở .NET Framework, thread pool starvation ở .NET Core
- Luồng access token và refresh token: cấp, gửi mỗi request, hết hạn, refresh, rotation, thu hồi
- Concurrency: `RowVersion`, `DbUpdateConcurrencyException`, 409 hay 412
- N+1: cái gì gây ra, chữa bằng gì
- Idempotency-Key và unique constraint
- 401 và 403; 201 kèm Location; 202
- `IOptions`, `IOptionsSnapshot`, `IOptionsMonitor`
- `BackgroundService` chạy cùng process; dùng service scoped trong singleton bằng `IServiceScopeFactory`
- Sargable; thứ tự cột của composite index
- `IComparable` và `IEquatable`; constructor so với object initializer
- Live coding: nói Big-O và test case trước khi gõ
- CI/CD (thêm sau chặng 4): trigger, job, step; secret vào pipeline bằng đường nào; migration chạy ở bước nào
- At-least-once, idempotent consumer, outbox, thứ tự bước trong saga

Chỗ yếu mới phát hiện trong buổi nào thì thêm vào đây ngay trong buổi đó.

## 8. Điểm quay lại hỏi định hướng {#checkpoints}

Model chạy buổi tự quyết mọi thứ trong phạm vi một buổi. Dừng lại và báo Nhân mở thread định hướng khi:

- Xong một chặng: ghi kết quả kiểm tra chặng vào learning log, nêu chỗ còn yếu, đề xuất giữ hay đổi chặng kế.
- Một buổi trễ quá 2 giờ hai lần liên tiếp: khung giờ đang sai, cần chỉnh.
- Nhân thấy một chặng không ra kiến thức dùng được, hoặc muốn đổi thứ tự.
- Có job cần ôn gấp: lộ trình tạm dừng, soạn plan riêng cho job đó, xong thì quay lại đúng buổi đang dở.
- Một thay đổi định áp vào Talksum lớn hơn "một thay đổi nhỏ": đó là việc của project Talksum, không phải của buổi học.

## 9. Thứ đã cố ý để ngoài {#out}

- Frontend chuyên sâu, Angular, luyện nói tiếng Anh: lý do ở [mục 2](#facts). Frontend cơ bản nằm ở [chặng 7](#stage-7).
- Docker, Kubernetes (M8 trong Plan): nhóm JD đúng hướng gần như không hỏi. Chỉ làm khi một JD cụ thể cần.
- Microservices chuyên sâu (tự cài outbox, saga, service mesh): chặng 5 chỉ dừng ở mức cơ bản.
- Aspire, GraphQL, Kafka chi tiết: chỉ khi một JD cụ thể cần.
- DDD đầy đủ (aggregate lớn, event sourcing, CQRS tách kho dữ liệu): chỉ nói qua ở buổi liên quan, tới mức nhận ra khi nào nó đáng.
