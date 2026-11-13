---
title: "Lộ trình cốt lõi: kiến trúc và trade-off"
---

# Lộ trình cốt lõi: kiến trúc và trade-off

Lập ngày 13/11/2026, thay cho mục "Ôn theo 2 job" trong [Plan](/progress/plan). Đây là **nguồn sự thật về thứ tự học**. Checklist code của PayoutHub vẫn nằm ở [Plan](/progress/plan), nhật ký từng buổi ở [Learning log](/progress/learning-log).

Trang này viết cho hai người đọc: Nhan (để biết mình đang ở đâu) và model chạy từng buổi (để biết phải làm gì mà không cần hỏi lại định hướng).

## 1. Vì sao có lộ trình này {#why}

Feedback chính thức của HRS (12/11/2026): làm tính năng tốt, nhưng yếu **architectural thinking**, **performance optimization**, và khả năng **tự thiết kế rồi dẫn dắt một giải pháp kỹ thuật**. Chỗ hổng không nằm ở kỹ năng code. Nó nằm ở việc lập luận về lực tác động và cái giá của từng lựa chọn, rồi nói ra được lập luận đó.

Quan điểm của Nhan: giữ dự án đơn giản, bám nghiệp vụ, code tốt là code giải quyết được vấn đề. Lộ trình này **không** nhằm đổi quan điểm đó. "Đơn giản" là một quyết định kiến trúc hợp lệ. Mục tiêu là sau khi học, Nhan:

1. Nhìn một hệ thống và chỉ ra được nó đang chịu **áp lực** nào (requirement đổi, dữ liệu lớn, nhiều người cùng sửa, thứ bên ngoài lỗi).
2. Với mỗi áp lực, biết các **phương án**, mỗi phương án chữa gì và **trả giá** gì.
3. **Tự chỉnh** pattern có sẵn cho vừa use case của mình, kể cả quyết định không dùng.
4. Bảo vệ được lựa chọn đó bằng lời, với ví dụ từ dự án thật.

Nhan muốn có kiến thức thật, không học lý thuyết để trả bài. Vì vậy mỗi buổi phải kết thúc bằng một thứ Nhan **tự làm ra**: một quyết định được viết lại, một đoạn code tự gõ, hoặc một thay đổi thật trong Talksum.

## 2. Dữ kiện đã chốt (13/11/2026) {#facts}

| Việc | Đã chốt |
|---|---|
| Thời lượng | **2 giờ mỗi buổi, dừng cứng.** Các buổi trước hay trôi tới 4–5 giờ vì hỏi đáp giữa chừng |
| Ưu tiên | Năng lực thật trước. Khi có job cần ôn gấp, Nhan báo và soạn plan riêng cho job đó, lộ trình này tạm dừng |
| Vị trí nhắm tới | Senior Full-stack hoặc Product Engineer (.NET + React/Vue). Chưa từng lead team, không trình bày như lead |
| Frontend | Không có chặng riêng. Nhan đã trên mức cơ bản ở cả React và Vue; phỏng vấn ở Việt Nam hiếm khi hỏi sâu. Quyết định frontend cũ được dùng làm **câu chuyện** (xem [kho chuyện](#stories)) |
| Tiếng Anh | Không luyện nói trong buổi học. Buổi học dùng tiếng Việt. Cuối buổi chỉ cần **3–5 ý chính bằng tiếng Anh** để Nhan bám vào khi nói |
| Hai project | **Talksum** là bài toán thật để lập luận và áp dụng. **PayoutHub** là chỗ gõ C#. Chi tiết ở [mục 4](#projects) |
| Azure | Nhan có tài khoản. Học bằng cách tự deploy, ở [chặng 5](#stage-5) |
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
| 0–10 | **Hỏi lại** 2 câu từ [danh sách chỗ yếu](#recall), chấm thẳng | Model hỏi, Nhan trả lời |
| 10–30 | **Khảo sát**: Nhan giải thích một quyết định thật (trong Talksum hoặc dự án cũ) theo cách hiểu hiện tại. Model chưa dạy gì | Nhan |
| 30–65 | **Cơ chế**: gọi tên chỗ hổng, rồi đi một ví dụ theo đường *cách đơn giản nhất → thêm một áp lực → đau ở đâu → pattern chữa gì → trả giá gì → khi nào không dùng*. Có hình | Model |
| 65–105 | **Thực hành**: Nhan tự gõ C# trên PayoutHub, hoặc tự sửa Talksum. Model chỉ gợi ý và review | Nhan |
| 105–120 | **Chốt**: Nhan viết một ADR ngắn; model rút 3–5 ý chính tiếng Anh từ lời của Nhan; ghi learning log | Cả hai |

### Luật giữ giờ {#time-rules}

Đây là phần quan trọng nhất của khung, vì các buổi trước trễ ở đúng chỗ này.

- **Câu hỏi phát sinh**: nếu nó chặn bước đang làm, trả lời tối đa 3 câu rồi đi tiếp. Nếu không chặn, ghi vào "Bãi đỗ câu hỏi" của buổi và nói một câu "đã ghi lại". Cuối buổi còn giờ thì trả lời, không thì trả lời bằng tin nhắn riêng trong ngày, **ngoài** 2 giờ.
- **Một buổi một mục tiêu.** Mỗi buổi trong lộ trình có một câu hỏi đích. Thứ không phục vụ câu đó thì để buổi khác.
- **Hết 2 giờ thì dừng**, kể cả khi phần thực hành chưa xong. Phần dở mang sang đầu buổi sau, không kéo dài buổi này.
- **Viết trang docs nằm ngoài 2 giờ.** Model viết hoặc sửa trang sau buổi, Nhan đọc lúc rảnh. Trong buổi chỉ dùng hình và ví dụ ngắn ngay trong chat.
- Model nói mốc thời gian khi chuyển phần ("hết 30 phút, sang cơ chế").

### Luật dạy {#teach-rules}

Các luật trong `CLAUDE.md` vẫn áp dụng (mentor, không làm thay; kiểm tra cách hiểu của Nhan trước; hình trước chữ). Thêm cho lộ trình này:

- **Khảo sát trước, dạy sau.** Không chấm điểm rồi đưa đáp án ngay. Câu khảo sát là để biết Nhan đang hiểu tới đâu.
- **Cơ chế trước, công cụ sau.** Dạy vì sao đau trước khi nói tên pattern hay thư viện. Nếu Nhan nói "hai cách trông như nhau" thì ví dụ đang sai: đổi ví dụ, không thêm giải pháp.
- **Luôn có phần "khi nào không dùng".** Mỗi pattern phải đi kèm trường hợp nó thừa. Đây là thứ Nhan cần để tự chỉnh cho use case của mình.
- **Giữ lập trường.** Khi Nhan phản biện, tách phần đúng và phần chưa đúng. Không gật theo cho xong.
- **Đọc code thật trước buổi.** Model phải đọc các file Talksum và PayoutHub ghi trong buổi đó trước khi hỏi. Các đường dẫn trong trang này được đọc ngày 13/11/2026 (commit `893aa31` của Talksum); nếu code đã đổi thì tin code.
- **Không bịa số liệu, không thổi phồng vai trò.** Chuyện nhỏ thì kể là chuyện nhỏ.

### Sản phẩm mỗi buổi {#outputs}

1. **Một ADR ngắn do Nhan viết** (ADR là bản ghi một quyết định kiến trúc). Khung 5 dòng: bối cảnh và áp lực; các phương án; chọn gì và vì sao; cái giá đã chấp nhận; khi nào sẽ đổi. ADR về Talksum đặt ở `docs/adr/` trong repo Talksum. ADR về PayoutHub đặt ở `docs/decisions/` trong repo này (buổi đầu tiên viết ADR thì tạo folder và thêm nhóm sidebar).
2. **3–5 ý chính tiếng Anh**, ghi vào `docs/progress/talking-points.md` dưới tên chủ đề. Ý ngắn, không viết thành đoạn văn.
3. **Một mục learning log**: làm gì, chỗ yếu mới, bãi đỗ câu hỏi còn lại, buổi sau bắt đầu từ đâu.
4. Tick checklist ở [mục 6](#stages) và ở [Plan](/progress/plan) nếu có làm lab.

## 4. Hai project làm ví dụ {#projects}

### Talksum: bài toán thật {#talksum}

Repo `NhanLT6/monetai_flutter` (tên sản phẩm là Talksum). App Flutter ghi chi tiêu bằng giọng nói. Phần `api/` viết bằng TypeScript: Hono trên Cloudflare Workers, Drizzle + Neon Postgres, better-auth, zod, vitest, Sentry.

Vì sao dùng: đây là sản phẩm của chính Nhan, là nơi duy nhất Nhan được tự quyết và áp dụng điều đã học. Nó nhỏ nhưng đã chứa nhiều quyết định kiến trúc thật.

**Điều cần biết về cách Talksum được làm:** Nhan lên ý tưởng và chọn hướng, AI kiểm tra, tìm hiểu rồi viết code. Nhan dùng app và kiểm tra trên UI, **chưa đọc code từng dòng** như với C#. Nghĩa là nhiều quyết định ở mức cấu trúc code là do AI đề xuất. Vì vậy với Talksum, việc đầu tiên luôn là **Nhan tự đọc và giải thích lại**, rồi mới tới đánh giá và sửa.

Phạm vi đọc: tập trung vào `api/` (khoảng 5.300 dòng TypeScript, đọc được). Phần Flutter chỉ đọc ở mức cấu trúc: `lib/data/` (repository, sync) và cách chia `lib/features/`. Không đọc widget.

Áp dụng vào Talksum: mỗi chặng chọn **một thay đổi nhỏ có thật** để Nhan tự làm trong `api/`. Thay đổi phải xuất phát từ một điểm yếu tìm thấy khi đọc, không tự nghĩ ra cho có. Talksum là app đang chạy thật với dữ liệu tài chính, nên theo đúng quy trình của repo đó (`CLAUDE.md` của Talksum, test, PR) và không gộp việc học vào một thay đổi lớn.

### PayoutHub: chỗ gõ C# {#payouthub}

Mọi JD đều là .NET, và người phỏng vấn hỏi bằng C#. Mỗi ý học ở Talksum được làm lại bằng .NET trên PayoutHub để tay quen.

Hiện trạng (13/11/2026): M1 xong. M2 có entity (`Affiliate`, `Conversion`, `Merchant`, `Money`) và cấu hình `DbContext`. Chưa có controller nghiệp vụ, chưa có test, `FakeBank` mới là khung.

Lộ trình này **không đi theo thứ tự M2 → M8 nữa**. Các mục trong [Plan](/progress/plan) được gọi ra theo từng buổi, đúng lúc nó minh hoạ cho điều đang học. Mục nào không được buổi nào gọi thì để sau. M8 (Docker, Kubernetes) để sau cùng.

Cặp `PayoutHub.Api` và `FakeBank` là **hai service thật gọi nhau qua mạng**. Đây là chỗ Nhan có kinh nghiệm tay về hệ phân tán mà không cần giả vờ đã làm microservices.

## 5. Kho chuyện thật {#stories}

Mỗi buổi gắn với ít nhất một chuyện dưới đây, để điều vừa học có chỗ bám trong kinh nghiệm của Nhan. Chi tiết từng dự án nằm trong Google Doc "Ghi chú phỏng vấn". Chuyện nào còn thiếu chi tiết thì hỏi Nhan, không đoán.

| Chuyện | Dùng cho |
|---|---|
| **My Fertility Health**: hai dev khác gọi thẳng plugin Ionic, không bọc wrapper, nên khó xử lý lỗi. Phần logic thuần của Nhan có unit test, QA không tìm ra lỗi | Chiều phụ thuộc, bọc thứ bên ngoài, test |
| **RTK Query sinh code từ OpenAPI của C#** (Altsource): một nguồn sự thật cho hợp đồng API, không viết lại tay | Một nguồn sự thật, hợp đồng giữa hai phía |
| **Vuetify ở Websparks**: đưa cả team sang một bộ UI thay cho nhiều thư viện lẻ | Dẫn dắt một quyết định, nhất quán |
| **Trang Legal ở CF**: dựng một project ASP.NET Core nhỏ trước để thử đường migrate. Kết quả gần như không có vấn đề kỹ thuật, team chủ yếu cần thời gian thích nghi. Chuyện nhỏ, kể đúng cỡ | Migrate dần thay vì viết lại, giảm rủi ro |
| **MSMQ ở CF**: xử lý nền, lỗi thì chỉ log, không retry | Messaging, at-least-once, dead-letter |
| **Job nền Quartz ở Jabil**: gom dữ liệu mỗi 15 phút cho dashboard sản xuất | Việc nền, lịch chạy, báo cáo |
| **Trợ lý AI ở CF**: xếp hạng merchant bằng LLM không ổn nên quay về luật SQL; đề xuất thiết kế tool kiểu semantic layer nhưng lead không chọn | Khi nào không dùng AI, bất đồng kỹ thuật |
| **Slack/Teams ở CF**: đề xuất v1 chỉ gửi thông báo chính, đo mức dùng rồi mới làm v2; không được chọn | Phạm vi, MVP |
| **WorkCtx**: bỏ luồng tự động hoàn toàn vì tốn usage, chuyển sang người kiểm từng bước | Mức tự động hoá, chi phí AI |
| **Talksum: prod trả 503 suốt 9 ngày** vì một biến môi trường bắt buộc không tới được Worker, còn danh sách kiểm tra thì viết tay | Sự cố, một nguồn sự thật, chặn lỗi lúc deploy |
| **Talksum: bảng đo token các lần chạy agent** (`docs/wiki/process/how-we-work.md`): cách làm đầy đủ tốn khoảng 4,7 triệu token, cách gọn khoảng 1,15 triệu cho cùng cỡ việc | Đo chi phí AI bằng số thật |
| **CF**: khoảng 100.000 affiliate, khoảng 200 merchant (CTO nói trong daily, chưa kiểm chứng) | Quy mô, nói rõ nguồn |

## 6. Các chặng {#stages}

Thứ tự là thứ tự ưu tiên. **Ưu tiên 1** (chặng 0 đến 2, 11 buổi) là phần cả hai nhóm JD đều cần và là chỗ HRS chấm thiếu. **Ưu tiên 2** là chặng 3 và 4. **Ưu tiên 3** là chặng 5 và 6. Với 5 buổi mỗi tuần, toàn bộ khoảng 5 tuần; ưu tiên 1 xong trong hơn 2 tuần.

Mỗi buổi ghi: **câu đích** (thứ Nhan phải tự trả lời được khi hết buổi), chỗ đọc trong Talksum, lab trên PayoutHub, chuyện thật, và trang trên site.

### Chặng 0: Vẽ lại hệ thống của mình (1 buổi) {#stage-0}

- [ ] **Buổi 0. Một request đi từ đâu tới đâu.**
  - Câu đích: "Mô tả cấu trúc dự án của bạn và đường đi của một thao tác từ UI tới DB." Đây là câu 1 của HRS.
  - Khảo sát: Nhan vẽ (bằng chữ hoặc mermaid) đường đi của một câu nói trong Talksum: app → Worker → AI → DB → app. Chưa mở code.
  - Talksum: `api/src/index.ts` (thứ tự middleware: CORS, kiểm tra env, auth, route), `api/src/middleware/`, `api/src/routes/ai.ts`. So hình Nhan vẽ với code thật.
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
  - Lab: không gõ code mới. Nhan đọc lại `PayoutHub.Core`, `Infrastructure`, `Api` và chỉ ra mỗi reference giữa project đang chặn loại thay đổi nào.
  - Trang: [SOLID và pattern](/dotnet/solid-patterns), [Dependency injection](/aspnet-core/dependency-injection).

- [ ] **Buổi 1.2. Bọc thứ bên ngoài: interface đáng giá khi nào.**
  - Câu đích: "Khi nào đặt interface trước một thứ bên ngoài, khi nào interface chỉ là thủ tục thừa?"
  - Talksum: `api/src/lib/ai/ai-provider.ts` và `api/src/lib/ai/index.ts` (đổi Groq sang Workers AI bằng một biến env), registry `SpeechEngine` trong `lib/features/recording/`, `TransactionRepository` trừu tượng trong `lib/data/repositories/`. Hỏi Nhan: trong ba cái đó, cái nào đã thật sự đổi implementation, cái nào chỉ có một?
  - Chuyện: My Fertility Health không bọc plugin Ionic.
  - Lab (M3 trong Plan): `IPayoutMethod` cho Bank, PayPal, Wise (phí và validate). Nhan tự viết. Sau đó thêm một phương thức thứ tư để thấy chỗ nào phải sửa.
  - Trang: [SOLID và pattern](/dotnet/solid-patterns), [Dependency injection](/aspnet-core/dependency-injection).

- [ ] **Buổi 1.3. Luật nghiệp vụ nằm ở đâu.**
  - Câu đích: "Rule nghiệp vụ nên nằm trong entity, trong service, hay trong handler? Dấu hiệu nào cho thấy cần domain model, dấu hiệu nào cho thấy transaction script là đủ?"
  - Talksum: `api/src/lib/usage.ts` (hạn mức theo ngày, theo streak) và `api/src/lib/validate.ts`. Luật ở đây viết kiểu hàm thuần. Vì sao kiểu đó hợp với Worker không giữ state?
  - Lab (M2 trong Plan): entity `Payout` với `private set` và method `Approve`, `Reject`; chuyển trạng thái sai thì ném lỗi. Nhan tự viết, vì đây cũng là chỗ yếu cũ (constructor so với object initializer, entity luôn hợp lệ).
  - Trang: [DDD](/architecture/ddd) (mục entity, aggregate, và "khi nào thừa").

- [ ] **Buổi 1.4. Chia theo tầng hay theo tính năng; đọc và ghi.**
  - Câu đích: "Chia thư mục theo layer hay theo feature? Repository có cần không khi đã có `DbContext`? Khi nào tách đường đọc khỏi đường ghi?"
  - Talksum: `lib/features/*` chia theo tính năng, còn `lib/data/` lại chia theo tầng. Vì sao một app dùng cả hai? `api/` thì chia theo loại file. Cỡ nào thì cách chia đó bắt đầu đau?
  - Lab (M2 trong Plan): `GET /affiliates/{id}/conversions` có phân trang và projection sang DTO, viết thẳng trên `DbContext`, không qua repository. So với đường ghi ở buổi 1.3. Nhan quyết định PayoutHub có cần repository không và viết ADR.
  - Chuyện: RTK Query sinh code từ OpenAPI.
  - Trang: [EF Core](/data/ef-core), [DDD](/architecture/ddd) (mục repository).

- [ ] **Buổi 1.5. Việc cắt ngang: pipeline. Kiểm tra chặng 1.**
  - Câu đích: "Auth, phân quyền, validate, xử lý lỗi nên đặt ở đâu trong đường đi của request, và vì sao không đặt trong từng handler?"
  - Talksum: `require-auth.ts`, `require-feature.ts`, `parse-auth.ts`, đoạn chặn env trong `index.ts`. Talksum dùng session của better-auth (token tra trong DB) thay cho JWT tự xác thực. Hỏi Nhan: hai cách khác nhau ở điểm nào khi cần thu hồi quyền ngay?
  - Lab (M3 trong Plan): endpoint approve với policy `Finance`, trả đúng 401, 403, 404, 409. Dùng dịp này hỏi lại trọn luồng access token và refresh token (câu 2 của HRS).
  - **Kiểm tra chặng (30 phút cuối):** Nhan trả lời lại câu đích của buổi 0 cho cả ba hệ thống, lần này phải có lý do và cái giá cho từng đường ranh. Model chấm thẳng, ghi chỗ còn yếu vào learning log.
  - Trang: [Middleware](/aspnet-core/middleware), [Filters](/aspnet-core/filters), [JWT](/aspnet-core/authentication-jwt), [Authorization](/aspnet-core/authorization).

### Chặng 2: Dữ liệu, nhất quán, hiệu năng (5 buổi) {#stage-2}

Nguyên lý xuyên suốt: **dữ liệu chỉ đúng khi nói rõ được "đúng tại thời điểm nào, theo ai".** Hai người cùng sửa, một request chạy hai lần, một bước chết giữa chừng: mỗi tình huống cần một cơ chế riêng, và cơ chế nào cũng chậm đi hoặc phức tạp lên.

Trang còn thiếu: `data/transactions.md` (transaction, isolation, ranh giới atomic) và `data/caching.md`. Model viết sau buổi tương ứng.

- [ ] **Buổi 2.1. Ranh giới "tất cả hoặc không gì".**
  - Câu đích: "Trong một thao tác nhiều bước, những bước nào phải thành công cùng nhau? Chuyện gì xảy ra nếu chết giữa chừng?"
  - Talksum: `api/src/lib/sync/engine.ts`: cả một lần push chạy trong **một** transaction Postgres. `api/src/lib/holds.ts`: đọc hold mà không tiêu, chỉ nhả khi đã trả xong, để chết giữa chừng vẫn đổi lại được. Hỏi Nhan: nếu đọc là xoá luôn thì hỏng ở đâu?
  - Lab (M3 trong Plan): `POST /payouts/generate`. Gom conversion đã duyệt thành payout, đảm bảo một conversion chỉ thuộc một payout. Nhan quyết định ranh giới transaction.
  - Trang: [EF Core](/data/ef-core); trang mới `data/transactions.md`.

- [ ] **Buổi 2.2. Hai người cùng sửa.**
  - Câu đích: "Last-write-wins mất gì? Khi nào chấp nhận được, khi nào phải dùng optimistic concurrency?"
  - Talksum: `api/src/lib/sync/statements.ts`: bản ghi nào có `updated_at` mới hơn thì thắng, server kẹp lại giờ của máy chạy nhanh (`clampedInstant`), bản thua nhận về bản thắng để tự gộp. Hỏi Nhan: với sổ chi tiêu cá nhân, lựa chọn này hợp lý không? Với payout thì sao?
  - Lab (M3 trong Plan): hai Finance cùng approve một payout. Thêm `RowVersion`, bắt `DbUpdateConcurrencyException`, trả 409. Đây là chỗ yếu đã sai nhiều lần.
  - Trang: [EF Core](/data/ef-core) (mục concurrency), [REST API](/aspnet-core/rest-api).

- [ ] **Buổi 2.3. Một request chạy hai lần.**
  - Câu đích: "Vì sao phải giả định mọi request có thể tới hai lần? Làm sao để lần thứ hai vô hại?"
  - Talksum: client offline đẩy lại hàng đợi (`lib/features/offline_queue/`), push dùng upsert theo `id` nên gửi lại không tạo trùng; con trỏ `change_seq` khi pull. Hỏi Nhan: thao tác nào trong Talksum **chưa** an toàn khi gửi lại?
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
  - **Kiểm tra chặng (30 phút cuối):** một bài nhỏ: "Thiết kế tính năng xuất báo cáo lớn" (câu Glassdoor của HRS). Nhan tự dẫn, model chỉ hỏi.
  - Trang: [Async](/runtime/async), [Async flow](/runtime/async-flow); trang mới `data/caching.md`.

### Chặng 3: Test và làm việc với AI (4 buổi) {#stage-3}

Nguyên lý xuyên suốt: **test là thứ cho phép thay đổi mà không sợ, và là thứ cho phép giao việc cho agent.** Không có test thì người phải kiểm bằng mắt, nên mức tự động hoá bị chặn ở đó.

Trang còn thiếu: nhóm `testing/` (một trang về chọn tầng test, một trang về `WebApplicationFactory`) và một trang `ai-workflow`. Model viết sau buổi tương ứng.

- [ ] **Buổi 3.1. Test cái gì, ở tầng nào.**
  - Câu đích: "Với một tính năng, bạn chọn unit test, integration test hay kiểm bằng tay? Dựa vào đâu?"
  - Talksum: `api/test/` (khoảng 32 file): test nào chạm DB thật (`*-db.test.ts`), test nào dùng dữ liệu giả. `FakeSpeechEngine` trong app. Hỏi Nhan: test nào trong số đó đã từng bắt được lỗi thật?
  - Chuyện: My Fertility Health, phần logic thuần có unit test.
  - Lab (M6 trong Plan): xUnit cho state machine của `Payout` và phần tính phí. Nhan tự viết, nói to test case trước khi gõ (chỗ yếu khi live coding).

- [ ] **Buổi 3.2. Integration test và một vòng TDD.**
  - Câu đích: "Integration test của API nên dựng thật tới đâu, giả từ đâu? TDD đáng khi nào?"
  - Lab (M6 trong Plan): `WebApplicationFactory` cho luồng approve, có case concurrency; fake gateway thay `FakeBank`. Rồi làm một vòng TDD nhỏ cho một rule mới (payout dưới `MinAmount` thì dồn sang kỳ sau), có nói Big-O và test case.

- [ ] **Buổi 3.3. AI trong sản phẩm: đo được mới sửa được.**
  - Câu đích: "Làm sao biết một thay đổi prompt là tốt hơn? Khi nào không nên dùng LLM?"
  - Talksum: `api/eval/` (bộ case, kết quả `baseline.json` và các lần sau), `api/src/lib/ai/prompts.ts`, `record-kinds.ts` (làm sạch output của model), tách prompt hệ thống khỏi lời người dùng trong `ai-provider.ts`. Nhan đọc và giải thích bộ eval đo cái gì.
  - Chuyện: xếp hạng merchant bằng LLM rồi quay về luật SQL; thiết kế tool kiểu semantic layer.
  - Áp dụng vào Talksum: Nhan tự thêm vài case eval cho một lỗi parse đã gặp khi dùng app, chạy và đọc kết quả.

- [ ] **Buổi 3.4. AI để viết code: mức tự động và chi phí. Kiểm tra chặng 3.**
  - Câu đích: ba câu HRS đã hỏi. "Bạn đo chi phí dùng AI thế nào?" "Vì sao không cho AI quét cả project một lần?" "Vì sao không tự động hoá hết?"
  - Talksum: `docs/wiki/process/how-we-work.md` (bảng Measured: token của từng lần chạy, cách làm đầy đủ so với cách gọn), các luật "enforced, never remembered" trong `CLAUDE.md` của Talksum, các lệnh audit trong Makefile. Đây là số liệu thật của chính Nhan.
  - Chuyện: WorkCtx; sự cố 503 trong 9 ngày (một luật chỉ nằm trong đầu người thì đã hỏng).
  - Sản phẩm: câu chuyện AI hoàn chỉnh, gồm mức tự động hiện tại và vì sao, test và audit là hàng rào, số token thật, cách sẽ đo "chi phí trên mỗi thay đổi được chấp nhận". Chỗ nào chưa đo thì nói là chưa đo.
  - **Kiểm tra chặng:** Nhan trả lời 9 câu AI trong job #25 của bảng job (InterviewTracker giữ), model chấm.

### Chặng 4: Hệ phân tán (4 buổi) {#stage-4}

Nguyên lý xuyên suốt: **qua mạng thì mọi lời gọi có thể chậm, mất, hoặc tới hai lần, và hai phía không cùng sống chết.** Microservices là một cách trả giá đó để đổi lấy việc deploy và scale độc lập. Phần lớn dự án không cần trả.

Về việc Nhan chưa làm microservices: không giấu, không giả. Lập trường cần có khi hết chặng: "Tôi chưa vận hành microservices ở production. Tôi biết nó chữa vấn đề gì và giá của nó, tôi đã tự làm hai service gọi nhau có retry, idempotency và webhook, và với các dự án tôi từng làm thì monolith chia module là lựa chọn đúng, vì những lý do sau."

- [ ] **Buổi 4.1. Tách hay không tách.**
  - Câu đích: "Khi nào nên tách một monolith thành nhiều service? Dự án bạn đang làm có nên tách không?"
  - Khảo sát: áp vào CF (monolith Web Forms, team chia theo epic, 2–3 dev mỗi epic). Nếu tách thì tách theo đâu? Cái gì sẽ tệ đi?
  - Talksum: nó **đã** là hệ phân tán: DB trên máy người dùng, Worker, Neon, nhà cung cấp AI. Ranh giới nào là bắt buộc, ranh giới nào là tự chọn?
  - Chuyện: trang Legal ở CF (thử trên project nhỏ trước khi migrate).
  - Trang: [Microservices](/architecture/microservices). Bổ sung mục modular monolith nếu chưa có.

- [ ] **Buổi 4.2. Gọi một thứ có thể lỗi.**
  - Câu đích: "Service bạn gọi bị chậm. Chuyện gì xảy ra với service của bạn, và bạn chặn thế nào?"
  - Talksum: `api/src/lib/ai/groq.ts` (`AbortSignal`, chờ rồi thử lại khi bị 429, `AiRateLimitError`, đi qua AI Gateway). Hỏi Nhan: khi Groq chết thì người dùng Talksum thấy gì? Như vậy đã đủ chưa?
  - Lab (M4 trong Plan): typed `HttpClient` gọi `FakeBank` với resilience handler (timeout, retry, circuit breaker), `CancellationToken` đi xuyên các tầng. Bật độ trễ và tỷ lệ lỗi của `FakeBank` để thấy từng cơ chế hoạt động.
  - Trang: [Microservices](/architecture/microservices) (mục cascading failure). Trang còn thiếu: resilience.

- [ ] **Buổi 4.3. Việc không cần trả lời ngay: message.**
  - Câu đích: "Khi nào dùng message thay cho gọi trực tiếp? At-least-once kéo theo những gì?"
  - Chuyện: MSMQ ở CF chỉ log lỗi. Nhan viết ra: message hỏng hiện đi đâu, mất gì, và sẽ đề xuất gì (retry có giới hạn, dead-letter, consumer idempotent).
  - Talksum: hàng đợi offline phía client là một hàng đợi thật. Nó xử lý gửi lại và trùng thế nào?
  - Lab (M5 trong Plan): `FakeBank` gọi webhook về PayoutHub; verify chữ ký HMAC; lưu id event đã xử lý với unique index. Outbox chỉ làm nếu còn giờ.
  - Trang: [Messaging](/architecture/messaging), [Tooling](/architecture/tooling).

- [ ] **Buổi 4.4. Nhìn thấy hệ thống đang chạy. Kiểm tra chặng 4.**
  - Câu đích: "Có lỗi ở production. Bạn tìm nguyên nhân bằng gì?"
  - Talksum: `api/src/routes/health.ts`, Sentry và `telemetry-scrub.ts` (lọc dữ liệu nhạy cảm trước khi gửi), và sự cố 503 trong 9 ngày. Nhan viết một bản postmortem ngắn: chuyện gì xảy ra, vì sao 9 ngày không ai biết, đã sửa gốc thế nào.
  - Lab (M3 trong Plan): gây một lỗi 500 thật, lấy `traceId` trong ProblemDetails và tìm lại đúng dòng log.
  - **Kiểm tra chặng:** bài thiết kế "đặt chỗ qua một nhà cung cấp bên ngoài hay timeout", Nhan tự dẫn 30 phút.
  - Trang: [Logging](/aspnet-core/logging), [Health checks](/aspnet-core/health-checks). Trang còn thiếu: observability.

### Chặng 5: Azure bằng tay (2 buổi) {#stage-5}

Nhận xét của Nhan là đúng một nửa: phần lớn việc với Azure là cấu hình. Thứ công ty cần ở một senior là **chọn đúng dịch vụ, cấu hình cho an toàn, và tự chẩn đoán khi nó hỏng**. "Đã tự deploy và vận hành một app" trả lời được phần lớn câu hỏi Azure trong JD.

Trước khi tạo tài nguyên, model kiểm tra gói miễn phí hiện hành của Azure và nói rõ thứ nào có thể tốn tiền. Xong chặng thì xoá hoặc tắt tài nguyên.

- [ ] **Buổi 5.1. Đưa PayoutHub lên Azure.** App Service + Azure SQL; cấu hình và secret theo môi trường (app settings, Key Vault ở mức biết dùng khi nào); pipeline deploy. Đối chiếu với Talksum: Workers, Neon, `wrangler secret`, và cổng chặn deploy khi thiếu secret.
- [ ] **Buổi 5.2. Vận hành và chọn dịch vụ.** Application Insights (log, trace, tìm request chậm), deployment slot, scale up so với scale out. Bản đồ "việc này thì dùng gì": App Service, Functions, Service Bus, Blob, Azure SQL. Mỗi dịch vụ một câu "dùng khi", một câu "giá".

Trang còn thiếu: một trang Azure theo kiểu "một app đi lên cloud, mỗi chặng dùng dịch vụ nào".

### Chặng 6: System design và tổng hợp (3 buổi, rồi lặp lại) {#stage-6}

- [ ] **Buổi 6.1. Khung làm bài thiết kế.** Hỏi yêu cầu, ước lượng tải, API, dữ liệu, sơ đồ, điểm nghẽn, lỗi, trade-off. Làm bài: "Talksum có gấp 100 lần người dùng. Cái gì gãy trước?"
- [ ] **Buổi 6.2. Bài thiết kế thứ hai**: đối soát thanh toán (dùng lại miền của PayoutHub), hoặc SaaS nhiều tenant.
- [ ] **Buổi 6.3. Mock tổng**: kiến trúc, hiệu năng, AI, một bài thiết kế ngắn, behavioral ("có làm việc vượt trách nhiệm không"). Không được bỏ buổi này.

Sau đó: cứ 2–3 ngày một bài thiết kế mới, cho tới khi có job cụ thể.

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
- At-least-once, idempotent consumer, outbox, thứ tự bước trong saga

Chỗ yếu mới phát hiện trong buổi nào thì thêm vào đây ngay trong buổi đó.

## 8. Điểm quay lại hỏi định hướng {#checkpoints}

Model chạy buổi tự quyết mọi thứ trong phạm vi một buổi. Dừng lại và báo Nhan mở thread định hướng khi:

- Xong một chặng: ghi kết quả kiểm tra chặng vào learning log, nêu chỗ còn yếu, đề xuất giữ hay đổi chặng kế.
- Một buổi trễ quá 2 giờ hai lần liên tiếp: khung giờ đang sai, cần chỉnh.
- Nhan thấy một chặng không ra kiến thức dùng được, hoặc muốn đổi thứ tự.
- Có job cần ôn gấp: lộ trình tạm dừng, soạn plan riêng cho job đó, xong thì quay lại đúng buổi đang dở.
- Một thay đổi định áp vào Talksum lớn hơn "một thay đổi nhỏ": đó là việc của project Talksum, không phải của buổi học.

## 9. Thứ đã cố ý để ngoài {#out}

- Chặng frontend, Angular, luyện nói tiếng Anh: lý do ở [mục 2](#facts).
- Docker, Kubernetes (M8 trong Plan): nhóm JD đúng hướng gần như không hỏi. Làm sau khi xong ưu tiên 1 và 2.
- Aspire, GraphQL, Kafka chi tiết: chỉ khi một JD cụ thể cần.
- DDD đầy đủ (aggregate lớn, event sourcing, CQRS tách kho dữ liệu): chỉ học tới mức nhận ra khi nào nó đáng.
