---
title: "Messaging: queue, at-least-once, outbox, saga"
---

# Messaging: queue, at-least-once, outbox, saga

Message broker (Azure Service Bus, RabbitMQ) là một hộp thư nằm giữa hai phần của hệ thống: bên gửi bỏ message vào rồi đi tiếp, bên nhận lấy ra xử lý khi rảnh. Cả trang suy ra từ **một luật** của broker: message chỉ bị xoá khi consumer báo xong. Từ luật đó ra dead-letter queue, at-least-once, idempotent consumer; phía gửi thì ra outbox; quy trình nhiều bước qua nhiều hệ thống thì ra saga. Ví dụ xuyên suốt: shop online với Order, Payment (gọi cổng thanh toán bên ngoài), Inventory (giữ hàng), Shipping (gọi hãng vận chuyển bên ngoài), Notification (email/SMS). Đọc trước: [gọi đồng bộ hay gửi message](/architecture/microservices#sync-vs-async). Liên quan: [Idempotency-Key ở REST API](/aspnet-core/rest-api#idempotency-key).

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="msInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="msOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="msBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker><marker id="msAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 500" role="img" aria-label="Bản đồ chủ đề messaging: cột trái là phía nhận suy ra từ luật PeekLock, cột phải là phía gửi và quy trình nhiều bước">
<text x="24" y="22" font-size="12.5" font-weight="600" class="muted">Phía nhận · một luật sinh ra mọi thứ</text>
<text x="365" y="22" font-size="12.5" font-weight="600" class="muted">Phía gửi và quy trình nhiều bước</text>
<a href="#problem" style="text-decoration:none"><rect class="boxBad" x="24" y="36" width="331" height="52" rx="8"/><circle cx="48" cy="62" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="48" cy="62" r="13"/><text x="48" y="67" font-size="13" text-anchor="middle" font-weight="700" class="accT">1</text><text x="70" y="57" font-size="13" font-weight="600" class="badT">Đọc là mất việc</text><text x="70" y="76" font-size="11.5">MSMQ receive thường: lỗi → người làm lại</text></a>
<line class="ln" x1="190" y1="88" x2="190" y2="112" marker-end="url(#msInk)"/>
<a href="#peek-lock" style="text-decoration:none"><rect class="boxAcc" x="24" y="116" width="331" height="52" rx="8"/><circle cx="48" cy="142" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="48" cy="142" r="13"/><text x="48" y="147" font-size="13" text-anchor="middle" font-weight="700" class="accT">2</text><text x="70" y="137" font-size="13" font-weight="600" class="accT">Một luật: chỉ xoá khi Complete()</text><text x="70" y="156" font-size="11.5">PeekLock · lỗi hoặc crash → giao lại</text></a>
<line class="ln" x1="190" y1="168" x2="190" y2="192" marker-end="url(#msInk)"/>
<path class="ln" d="M24 150 H12 V302 H20" marker-end="url(#msInk)"/>
<a href="#dead-letter" style="text-decoration:none"><rect class="boxOk" x="24" y="196" width="331" height="52" rx="8"/><circle cx="48" cy="222" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="48" cy="222" r="13"/><text x="48" y="227" font-size="13" text-anchor="middle" font-weight="700" class="accT">3</text><text x="70" y="217" font-size="13" font-weight="600" class="okT">Không xoá → không mất việc</text><text x="70" y="236" font-size="11.5">hỏng quá 10 lần → dead-letter queue</text></a>
<a href="#at-least-once" style="text-decoration:none"><rect class="boxBad" x="24" y="276" width="331" height="52" rx="8"/><circle cx="48" cy="302" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="48" cy="302" r="13"/><text x="48" y="307" font-size="13" text-anchor="middle" font-weight="700" class="accT">4</text><text x="70" y="297" font-size="13" font-weight="600" class="badT">Xoá sau Complete → có thể trùng</text><text x="70" y="316" font-size="11.5">at-least-once, không phải exactly-once</text></a>
<line class="ln" x1="190" y1="328" x2="190" y2="352" marker-end="url(#msInk)"/>
<a href="#idempotent-consumer" style="text-decoration:none"><rect class="boxOk" x="24" y="356" width="331" height="52" rx="8"/><circle cx="48" cy="382" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="48" cy="382" r="13"/><text x="48" y="387" font-size="13" text-anchor="middle" font-weight="700" class="accT">5</text><text x="70" y="377" font-size="13" font-weight="600" class="okT">Idempotent consumer</text><text x="70" y="396" font-size="11.5">id + việc nghiệp vụ: cùng một transaction</text></a>
<a href="#queue-vs-topic" style="text-decoration:none"><rect class="box" x="365" y="36" width="345" height="52" rx="8"/><circle cx="389" cy="62" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="389" cy="62" r="13"/><text x="389" y="67" font-size="13" text-anchor="middle" font-weight="700" class="accT">6</text><text x="411" y="57" font-size="13" font-weight="600">Queue hay topic</text><text x="411" y="76" font-size="11.5">queue: 1 người xử lý · topic: mỗi sub 1 bản</text></a>
<a href="#dual-write" style="text-decoration:none"><rect class="boxBad" x="365" y="116" width="345" height="52" rx="8"/><circle cx="389" cy="142" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="389" cy="142" r="13"/><text x="389" y="147" font-size="13" text-anchor="middle" font-weight="700" class="accT">7</text><text x="411" y="137" font-size="13" font-weight="600" class="badT">Dual write: commit DB rồi publish</text><text x="411" y="156" font-size="11.5">crash giữa hai bước → mất event</text></a>
<line class="ln" x1="537" y1="168" x2="537" y2="192" marker-end="url(#msInk)"/>
<a href="#outbox-table" style="text-decoration:none"><rect class="boxOk" x="365" y="196" width="345" height="52" rx="8"/><circle cx="389" cy="222" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="389" cy="222" r="13"/><text x="389" y="227" font-size="13" text-anchor="middle" font-weight="700" class="accT">8</text><text x="411" y="217" font-size="13" font-weight="600" class="okT">Outbox: event là một dòng trong DB</text><text x="411" y="236" font-size="11.5">có thể publish trùng → consumer như ô 5</text></a>
<a href="#saga" style="text-decoration:none"><rect class="boxBad" x="365" y="276" width="345" height="52" rx="8"/><circle cx="389" cy="302" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="389" cy="302" r="13"/><text x="389" y="307" font-size="13" text-anchor="middle" font-weight="700" class="accT">9</text><text x="411" y="297" font-size="13" font-weight="600" class="badT">Saga: không có transaction chung</text><text x="411" y="316" font-size="11.5">mỗi bước commit riêng · không rollback</text></a>
<line class="ln" x1="537" y1="328" x2="537" y2="352" marker-end="url(#msInk)"/>
<a href="#compensation" style="text-decoration:none"><rect class="boxOk" x="365" y="356" width="345" height="52" rx="8"/><circle cx="389" cy="382" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="389" cy="382" r="13"/><text x="389" y="387" font-size="13" text-anchor="middle" font-weight="700" class="accT">10</text><text x="411" y="377" font-size="13" font-weight="600" class="okT">Compensation = hành động mới</text><text x="411" y="396" font-size="11.5">hoàn tiền, nhả kho, Cancelled · không xoá</text></a>
<line class="ln" x1="537" y1="408" x2="537" y2="432" marker-end="url(#msInk)"/>
<a href="#choreography-vs-orchestration" style="text-decoration:none"><rect class="box" x="365" y="436" width="345" height="52" rx="8"/><circle cx="389" cy="462" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="389" cy="462" r="13"/><text x="389" y="467" font-size="13" text-anchor="middle" font-weight="700" class="accT">11</text><text x="411" y="457" font-size="13" font-weight="600">Choreography hay orchestration</text><text x="411" y="476" font-size="11.5">ai nắm luồng: từng service hay coordinator</text></a>
<text x="190" y="440" font-size="11.5" text-anchor="middle" class="muted">Ô 3 và ô 4 cùng suy ra từ ô 2:</text>
<text x="190" y="457" font-size="11.5" text-anchor="middle" class="muted">không xoá thì không mất,</text>
<text x="190" y="474" font-size="11.5" text-anchor="middle" class="muted">xoá muộn thì có thể trùng.</text>
</svg>
<p class="fig-caption">Đỏ là cái đau, xanh lá là cách chữa. Cột trái là một chuỗi nhân quả từ luật PeekLock; cột phải áp cùng cách nghĩ cho phía gửi và cho quy trình nhiều bước. Ôn lại: nhìn từng ô và tự giải thích vì sao; ô nào không nói được thì bấm vào.</p>
</div>

## 1. Vấn đề: đọc là mất việc {#problem}

Worker gửi email xác nhận đơn hàng, viết theo kiểu quen thuộc với MSMQ:

```csharp
var queue = new MessageQueue(@".\private$\order-confirmation");
while (!stopping)
{
    var msg = queue.Receive();                    // receive thường: message RỜI KHỎI queue ngay tại đây
    try
    {
        emailSender.SendConfirmation((OrderPlaced)msg.Body);
    }
    catch (Exception ex)
    {
        emailSender.SendError("ops@shop.local", ex);   // người trực đọc email lỗi, gửi lại bằng tay
    }
}
```

**Vì `Receive()` không có transaction lấy message ra khỏi queue trước khi xử lý, nên mọi thất bại sau dòng đó đều làm mất việc.** Hai kiểu mất:

- **Exception** (SMTP sập 2 phút): message đã biến mất, chỉ còn email lỗi. Người trực phải tra đơn nào, gửi lại tay.
- **Process chết** (deploy, restart máy, out of memory) giữa `Receive` và `SendConfirmation`: không có cả email lỗi. Khách không nhận được gì và không ai biết.

MSMQ có transactional queue: receive trong một `MessageQueueTransaction`, lỗi thì `Abort()` và message quay lại queue. Trang này nói về receive thường như trên. Với System.Messaging, message hỏng vĩnh viễn sẽ quay vòng mãi nếu bạn không tự đếm số lần thử; Service Bus có sẵn bộ đếm đó (mục 3).

## 2. Một luật: chỉ xoá khi consumer nói Complete {#peek-lock}

**Ở chế độ PeekLock, Service Bus giao message cho consumer nhưng chỉ khoá nó, không xoá; message chỉ bị xoá khi consumer gọi `Complete`.** PeekLock là receive mode mặc định của SDK .NET (`Azure.Messaging.ServiceBus`). Chế độ còn lại, `ReceiveAndDelete`, xoá ngay khi giao, tức là giống receive thường của MSMQ.

<div class="fig">
<svg viewBox="0 0 720 320" role="img" aria-label="Vòng đời message ở PeekLock: giao và khoá, thành công thì Complete và xoá, lỗi thì giao lại, quá số lần thì vào dead-letter queue">
<rect class="box" x="10" y="60" width="140" height="56" rx="8"/><text x="80" y="84" font-size="13" font-weight="600" text-anchor="middle">Queue</text><text x="80" y="103" font-size="11" text-anchor="middle" class="mono muted">order-confirmation</text>
<line class="ln" x1="150" y1="88" x2="226" y2="88" marker-end="url(#msInk)"/><text x="188" y="80" font-size="11.5" text-anchor="middle" class="muted">giao + khoá</text>
<rect class="boxAcc" x="230" y="60" width="190" height="56" rx="8"/><text x="325" y="84" font-size="13" font-weight="600" text-anchor="middle" class="accT">Consumer xử lý</text><text x="325" y="103" font-size="11.5" text-anchor="middle">bị khoá, chưa bị xoá</text>
<line class="lnOk" x1="420" y1="80" x2="496" y2="40" marker-end="url(#msOk)"/>
<line class="lnBad" x1="420" y1="98" x2="496" y2="136" marker-end="url(#msBad)"/>
<rect class="boxOk" x="500" y="12" width="210" height="56" rx="8"/><text x="512" y="36" font-size="13" font-weight="600" class="okT">Thành công: Complete()</text><text x="512" y="55" font-size="11.5">message bị xoá, xong</text>
<rect class="boxBad" x="500" y="100" width="210" height="78" rx="8"/><text x="512" y="122" font-size="13" font-weight="600" class="badT">Không có Complete()</text><text x="512" y="142" font-size="11.5">exception → Abandon ngay</text><text x="512" y="161" font-size="11.5">crash → lock hết hạn (1 phút)</text>
<path class="lnBad" d="M605 178 V215 H80 V120" marker-end="url(#msBad)"/>
<text x="250" y="207" font-size="11.5" text-anchor="middle" class="badT">còn lượt: giao lại (retry), DeliveryCount + 1</text>
<line class="lnBad dash" x1="445" y1="215" x2="445" y2="250" marker-end="url(#msBad)"/>
<text x="455" y="238" font-size="11.5" class="muted">hết MaxDeliveryCount (mặc định 10)</text>
<rect class="boxBad" x="320" y="254" width="250" height="56" rx="8"/><text x="332" y="277" font-size="13" font-weight="600" class="badT">Dead-letter queue</text><text x="332" y="296" font-size="11.5">chờ người xem, không tự xử lý lại</text>
</svg>
<p class="fig-caption">Message chỉ có một lối ra "bị xoá": consumer gọi Complete. Mọi đường khác đều quay về queue, cho tới khi hết lượt thì sang dead-letter queue.</p>
</div>

Các con số là mặc định, chỉnh được trên queue: lock duration 1 phút (tối đa 5 phút), MaxDeliveryCount 10. Code với `ServiceBusProcessor`:

```csharp
var processor = client.CreateProcessor("order-confirmation", new ServiceBusProcessorOptions
{
    AutoCompleteMessages = false   // mặc định true: handler chạy xong không throw thì SDK tự Complete
});
processor.ProcessMessageAsync += async args =>
{
    await emailSender.SendConfirmationAsync(args.Message.Body.ToObjectFromJson<OrderPlaced>());
    await args.CompleteMessageAsync(args.Message);   // chỉ tới đây message mới bị xoá
};
processor.ProcessErrorAsync += args => { logger.LogError(args.Exception, "Service Bus error"); return Task.CompletedTask; };
await processor.StartProcessingAsync();
```

Hai chi tiết dễ hỏi: exception trong handler làm processor **Abandon** ngay (message giao lại liền, không chờ 1 phút); lock chỉ hết hạn khi consumer chết hoặc mất kết nối. Việc chạy lâu hơn lock duration không bị giao lại giữa chừng vì processor tự gia hạn lock, tối đa `MaxAutoLockRenewalDuration` (mặc định 5 phút).

## 3. Hệ quả 1: không mất việc, message hỏng vào dead-letter {#dead-letter}

**Vì message chưa bị xoá khi đang xử lý, nên exception hay crash chỉ làm nó quay lại queue; SMTP sập 2 phút thì lần giao sau gửi được, không ai phải làm tay.** Nhưng message hỏng vĩnh viễn (JSON sai, địa chỉ email không hợp lệ) sẽ quay vòng mãi. Gọi nó là **poison message**. Bộ đếm `DeliveryCount` chặn việc đó: quá MaxDeliveryCount, broker chuyển message sang **dead-letter queue** (DLQ), một sub-queue có sẵn của mỗi queue, đường dẫn `order-confirmation/$deadletterqueue`.

DLQ chính là "người vận hành xử lý ngoại lệ" của worker MSMQ cũ, nhưng tốt hơn email lỗi ở ba chỗ:

- **Message còn nguyên** (body, properties, lý do `DeadLetterReason`), không chỉ là stack trace.
- **Không tự xử lý lại và không tự hết hạn**: nằm đó tới khi có người hoặc tool đọc nó.
- **Phát lại được**: xem và gửi lại bằng Service Bus Explorer trên Azure portal, hoặc một tool nội bộ đọc DLQ, sửa dữ liệu, gửi lại vào queue chính. Alert theo số message trong DLQ thay cho hộp thư lỗi.

Consumer biết chắc thử lại vô ích (validation sai) thì đừng đốt 10 lượt: gọi `DeadLetterMessageAsync(msg, "InvalidEmail", ...)` để chuyển thẳng sang DLQ kèm lý do.

## 4. Hệ quả 2: có thể trùng, at-least-once {#at-least-once}

**Vì message chỉ bị xoá *sau* `Complete`, nên consumer có thể làm xong việc rồi chết ngay trước `Complete`; message quay lại và việc chạy lần hai.**

<div class="fig">
<svg viewBox="0 0 720 150" role="img" aria-label="Dòng thời gian: nhận message, gửi email, crash trước Complete, lock hết hạn, giao lại và gửi email lần hai">
<line class="lnMuted" x1="30" y1="62" x2="690" y2="62"/>
<circle cx="70" cy="62" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="70" cy="62" r="13"/><text x="70" y="67" font-size="13" text-anchor="middle" font-weight="700" class="accT">1</text><text x="70" y="102" font-size="12.5" font-weight="600" text-anchor="middle">Nhận message</text><text x="70" y="120" font-size="11.5" text-anchor="middle" class="muted">bị khoá</text>
<circle cx="210" cy="62" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxOk" cx="210" cy="62" r="13"/><text x="210" y="67" font-size="13" text-anchor="middle" font-weight="700" class="okT">2</text><text x="210" y="102" font-size="12.5" font-weight="600" text-anchor="middle" class="okT">Gửi email</text><text x="210" y="120" font-size="11.5" text-anchor="middle" class="muted">khách đã nhận</text>
<circle cx="350" cy="62" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxBad" cx="350" cy="62" r="13"/><text x="350" y="67" font-size="13" text-anchor="middle" font-weight="700" class="badT">3</text><text x="350" y="102" font-size="12.5" font-weight="600" text-anchor="middle" class="badT">Crash</text><text x="350" y="120" font-size="11.5" text-anchor="middle" class="muted">chưa gọi Complete()</text>
<circle cx="490" cy="62" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="490" cy="62" r="13"/><text x="490" y="67" font-size="13" text-anchor="middle" font-weight="700" class="accT">4</text><text x="490" y="102" font-size="12.5" font-weight="600" text-anchor="middle">Lock hết hạn</text><text x="490" y="120" font-size="11.5" text-anchor="middle" class="muted">sau 1 phút</text>
<circle cx="630" cy="62" r="13" style="fill:var(--vp-c-bg)"/><circle class="boxBad" cx="630" cy="62" r="13"/><text x="630" y="67" font-size="13" text-anchor="middle" font-weight="700" class="badT">5</text><text x="630" y="102" font-size="12.5" font-weight="600" text-anchor="middle" class="badT">Giao lại</text><text x="630" y="120" font-size="11.5" text-anchor="middle" class="muted">gửi email lần 2</text>
<text x="360" y="24" font-size="11.5" text-anchor="middle" class="muted">không mất việc (mục 3) và có thể trùng (mục này) là hai mặt của cùng một luật</text>
</svg>
</div>

Nên cam kết của broker là <T>at-least-once</T> (giao ít nhất một lần), không phải exactly-once. Không broker nào giao đúng một lần qua mạng được, vì luôn có khoảnh khắc "đã làm xong nhưng chưa kịp báo". Thứ làm được là **xử lý đúng một lần về mặt kết quả**: at-least-once cộng với consumer idempotent (mục 5).

Service Bus có **duplicate detection** (phải bật lúc tạo queue, theo `MessageId` trong một khoảng thời gian), nhưng nó chỉ chặn bên gửi **gửi trùng**. Nó không chặn được ca ở hình trên, vì đây là cùng một message được **giao lại**.

## 5. Idempotent consumer {#idempotent-consumer}

**Vì một message có thể tới hai lần, nên xử lý nó hai lần phải cho cùng kết quả như một lần (<T>idempotent</T>).** Ví dụ ở đây là Inventory nhận `OrderPlaced` và giữ hàng: giữ hai lần là trừ kho hai lần.

### Cách 1: bảng ProcessedMessages, chung transaction với việc nghiệp vụ {#processed-messages}

Lưu `MessageId` đã xử lý vào bảng có khoá chính là `MessageId`. Câu hỏi quyết định đúng sai là **lưu id lúc nào so với việc nghiệp vụ**:

<div class="fig">
<svg viewBox="0 0 720 200" role="img" aria-label="Ba thứ tự: lưu id trước thì crash làm mất việc, làm trước thì crash làm trùng, chung transaction thì đủ cả hai hoặc không có gì">
<rect class="boxBad" x="10" y="10" width="226" height="180" rx="8"/><text x="22" y="34" font-size="13" font-weight="600" class="badT">A. Lưu id trước, làm sau</text><text x="22" y="62" font-size="11.5">1. INSERT MessageId, commit</text><text x="22" y="84" font-size="11.5">2. crash trước khi giữ hàng</text><text x="22" y="106" font-size="11.5">3. giao lại: thấy id → bỏ qua</text><line class="lnMuted" x1="22" y1="124" x2="224" y2="124"/><text x="22" y="148" font-size="12" font-weight="600" class="badT">hàng không bao giờ được giữ</text><text x="22" y="170" font-size="11.5" class="muted">mất việc, không ai biết</text>
<rect class="boxBad" x="247" y="10" width="226" height="180" rx="8"/><text x="259" y="34" font-size="13" font-weight="600" class="badT">B. Làm trước, lưu id sau</text><text x="259" y="62" font-size="11.5">1. giữ hàng, commit</text><text x="259" y="84" font-size="11.5">2. crash trước khi lưu id</text><text x="259" y="106" font-size="11.5">3. giao lại: chưa có id → làm</text><line class="lnMuted" x1="259" y1="124" x2="461" y2="124"/><text x="259" y="148" font-size="12" font-weight="600" class="badT">giữ hàng hai lần</text><text x="259" y="170" font-size="11.5" class="muted">kho lệch</text>
<rect class="boxOk" x="484" y="10" width="226" height="180" rx="8"/><text x="496" y="34" font-size="13" font-weight="600" class="okT">C. Cùng một transaction</text><text x="496" y="62" font-size="11.5">1. INSERT id + giữ hàng</text><text x="496" y="84" font-size="11.5">2. commit một lần</text><text x="496" y="106" font-size="11.5">crash trước commit: cả hai mất</text><line class="lnMuted" x1="496" y1="124" x2="698" y2="124"/><text x="496" y="148" font-size="12" font-weight="600" class="okT">đủ cả hai, hoặc không có gì</text><text x="496" y="170" font-size="11.5" class="muted">giao lại thì làm lại sạch</text>
</svg>
</div>

Với EF Core, một lần `SaveChangesAsync` đã là một transaction, nên chỉ cần add cả hai rồi save một lần:

```csharp
processor.ProcessMessageAsync += async args =>   // db: DbContext mới cho mỗi message (tạo scope)
{
    var evt = args.Message.Body.ToObjectFromJson<OrderPlaced>();
    db.ProcessedMessages.Add(new ProcessedMessage { MessageId = args.Message.MessageId });   // PK = MessageId
    db.Reservations.Add(new Reservation(evt.OrderId, evt.Lines));
    try { await db.SaveChangesAsync(); }                         // một transaction
    catch (DbUpdateException ex) when (IsDuplicateKey(ex)) { }   // lỗi 2627/2601: đã xử lý rồi, bỏ qua
    await args.CompleteMessageAsync(args.Message);
};
```

Hai điều kiện để cách này đúng: `MessageId` phải **ổn định** (bên gửi đặt, vd id dòng outbox ở [mục 7](#outbox-table), không để mỗi lần gửi một id mới), và chống trùng dựa vào **khoá chính/UNIQUE**, không đọc trước rồi mới ghi, vì hai instance có thể cùng đọc thấy "chưa có". Lý do chi tiết: [UNIQUE, không check-then-insert](/aspnet-core/rest-api#unique-constraint).

### Cách 2: idempotent tự nhiên theo trạng thái nghiệp vụ {#natural-idempotency}

**Nếu chính dữ liệu nghiệp vụ đã cho biết việc đã làm chưa, thì không cần bảng phụ.** `Reservation` có UNIQUE trên `OrderId`: lần giao thứ hai vi phạm UNIQUE, bỏ qua. "Đặt `Status = Shipped`" vốn idempotent; "`Quantity -= 1`" thì không. Chuyển trạng thái có điều kiện (`UPDATE ... WHERE Status = 'Pending'`, kiểm số dòng bị đổi) cũng là một dạng: xem [ExecuteUpdate có điều kiện](/data/ef-core#conditional-update).

### Cách 3: gọi API bên ngoài: gửi idempotency key {#external-idempotency}

**Cổng thanh toán và hãng vận chuyển không tham gia transaction DB của bạn được, nên Cách 1 không bọc được lời gọi tới họ.** Payment consumer trừ tiền, cổng thanh toán đã trừ, rồi consumer chết trước khi ghi DB: lần giao sau trừ tiền lần hai. Cách chữa: gửi kèm <T>idempotency key</T> sinh từ dữ liệu ổn định (vd `charge-order-123`), nếu API hỗ trợ. Bên kia gặp lại key thì trả lại kết quả cũ thay vì trừ tiếp; đây chính là [Idempotency-Key](/aspnet-core/rest-api#idempotency-key) nhìn từ phía người gọi.

API không hỗ trợ key thì còn hai cách: hỏi trạng thái trước khi làm ("đơn 123 đã có giao dịch chưa?"), hoặc chấp nhận và đối soát sau. Email cũng thuộc loại này: nhà cung cấp email thường không có key, nên ghi "đã gửi" ngay sau khi gửi và chấp nhận một email trùng hiếm hoi; với email, trùng rẻ hơn mất.

## 6. Queue và topic/subscription {#queue-vs-topic}

**Queue giao mỗi message cho đúng một consumer (người đang giữ lock); topic chép mỗi message vào từng subscription, và mỗi subscription là một queue riêng.**

<div class="fig">
<svg viewBox="0 0 720 250" role="img" aria-label="Trái: queue send-email với ba instance chia nhau message. Phải: topic order-placed với ba subscription, mỗi subscription nhận một bản">
<text x="10" y="20" font-size="12.5" font-weight="600" class="muted">Queue · mỗi message một người xử lý</text>
<rect class="box" x="10" y="100" width="80" height="44" rx="8"/><text x="50" y="127" font-size="12.5" text-anchor="middle">Order</text>
<line class="ln" x1="90" y1="122" x2="116" y2="122" marker-end="url(#msInk)"/>
<rect class="boxAcc" x="120" y="92" width="100" height="60" rx="8"/><text x="170" y="117" font-size="13" font-weight="600" text-anchor="middle" class="accT">queue</text><text x="170" y="136" font-size="11" text-anchor="middle" class="mono">send-email</text>
<text x="300" y="34" font-size="11" text-anchor="middle" class="muted">Notification × 3 instance</text>
<rect class="box" x="250" y="44" width="100" height="40" rx="8"/><text x="300" y="69" font-size="12" text-anchor="middle">instance 1 · M1</text>
<rect class="box" x="250" y="102" width="100" height="40" rx="8"/><text x="300" y="127" font-size="12" text-anchor="middle">instance 2 · M2</text>
<rect class="box" x="250" y="160" width="100" height="40" rx="8"/><text x="300" y="185" font-size="12" text-anchor="middle">instance 3 · M3</text>
<line class="ln" x1="220" y1="110" x2="246" y2="66" marker-end="url(#msInk)"/>
<line class="ln" x1="220" y1="122" x2="246" y2="122" marker-end="url(#msInk)"/>
<line class="ln" x1="220" y1="134" x2="246" y2="178" marker-end="url(#msInk)"/>
<text x="180" y="232" font-size="11.5" text-anchor="middle" class="muted">competing consumers: thêm instance = chia tải</text>
<text x="370" y="20" font-size="12.5" font-weight="600" class="muted">Topic · mỗi subscription một bản</text>
<rect class="box" x="370" y="100" width="70" height="44" rx="8"/><text x="405" y="127" font-size="12.5" text-anchor="middle">Order</text>
<line class="ln" x1="440" y1="122" x2="461" y2="122" marker-end="url(#msInk)"/>
<rect class="boxAcc" x="465" y="92" width="100" height="60" rx="8"/><text x="515" y="117" font-size="13" font-weight="600" text-anchor="middle" class="accT">topic</text><text x="515" y="136" font-size="11" text-anchor="middle" class="mono">order-placed</text>
<text x="710" y="34" font-size="11" text-anchor="end" class="muted">3 subscription, mỗi cái nhận M1</text>
<rect class="boxOk" x="600" y="44" width="110" height="40" rx="8"/><text x="655" y="69" font-size="11.5" text-anchor="middle" class="mono">inventory</text>
<rect class="boxOk" x="600" y="102" width="110" height="40" rx="8"/><text x="655" y="127" font-size="11.5" text-anchor="middle" class="mono">shipping</text>
<rect class="boxOk" x="600" y="160" width="110" height="40" rx="8"/><text x="655" y="185" font-size="11.5" text-anchor="middle" class="mono">notification</text>
<line class="lnOk" x1="565" y1="110" x2="596" y2="66" marker-end="url(#msOk)"/>
<line class="lnOk" x1="565" y1="122" x2="596" y2="122" marker-end="url(#msOk)"/>
<line class="lnOk" x1="565" y1="134" x2="596" y2="178" marker-end="url(#msOk)"/>
<text x="540" y="232" font-size="11.5" text-anchor="middle" class="muted">thêm nơi nghe = thêm subscription, Order không đổi</text>
</svg>
</div>

Suy ra từ đó:

- **Queue cho lệnh** ("gửi email này"): đúng một nơi phải làm. Chạy 3 instance Notification trên cùng queue thì chúng tranh nhau message (**competing consumers**), tải tự chia, một instance chết thì message của nó hết lock và sang instance khác.
- **Topic cho sự kiện** ("đơn 123 đã được đặt"): bên gửi không cần biết ai quan tâm. Inventory, Shipping, Notification mỗi bên một subscription. Thêm Analytics là thêm một subscription; code Order không đổi. Bên trong một subscription vẫn là competing consumers như queue. Subscription có thể gắn filter (vd chỉ nhận đơn quốc tế).
- **Thứ tự không được đảm bảo** khi nhiều consumer chạy song song. Cần thứ tự theo từng đơn thì dùng **session** (bật `RequiresSession` trên queue, đặt `SessionId = OrderId`): message cùng session đi tuần tự qua một consumer.

**RabbitMQ** dựng cùng ý bằng mảnh khác: bên gửi publish vào **exchange**, exchange chép message sang các **queue** theo **binding**, consumer chỉ đọc queue. Fanout exchange (mỗi queue được bind nhận một bản) tương đương topic; direct/topic exchange lọc theo routing key, tương đương subscription filter. Nhiều consumer trên một queue là competing consumers; `ack` tương đương `Complete`, message chưa ack được giao lại khi channel của consumer đóng.

## 7. Outbox: phía gửi cũng có thể mất {#outbox}

### Dual write: DB và broker không chung transaction {#dual-write}

**Order phải làm hai việc, lưu đơn vào SQL Server và publish `OrderPlaced`, nhưng hai hệ thống này không có transaction chung, nên crash giữa hai bước để lại một nửa.** Đây là <T>dual write</T>; thứ tự nào cũng hỏng, chỉ hỏng kiểu khác:

<div class="fig">
<svg viewBox="0 0 720 250" role="img" aria-label="Ba hàng: commit trước thì mất event, publish trước thì có event về đơn không tồn tại, outbox thì có thể publish trùng">
<rect class="boxBad" x="10" y="10" width="130" height="64" rx="8"/><text x="22" y="37" font-size="12.5" font-weight="600" class="badT">A. Commit DB</text><text x="22" y="56" font-size="12.5" font-weight="600" class="badT">rồi publish</text>
<rect class="box" x="160" y="10" width="170" height="64" rx="8"/><text x="172" y="37" font-size="11.5">INSERT Order</text><text x="172" y="56" font-size="11.5">commit</text>
<line class="ln" x1="330" y1="42" x2="346" y2="42" marker-end="url(#msInk)"/>
<rect class="boxBad" x="350" y="10" width="170" height="64" rx="8"/><text x="362" y="37" font-size="11.5" class="badT">crash</text><text x="362" y="56" font-size="11.5">trước khi publish</text>
<line class="ln" x1="520" y1="42" x2="536" y2="42" marker-end="url(#msInk)"/>
<rect class="boxBad" x="540" y="10" width="170" height="64" rx="8"/><text x="552" y="37" font-size="11.5">đơn có trong DB,</text><text x="552" y="56" font-size="11.5">không ai giữ hàng, gửi mail</text>
<rect class="boxBad" x="10" y="92" width="130" height="64" rx="8"/><text x="22" y="119" font-size="12.5" font-weight="600" class="badT">B. Publish</text><text x="22" y="138" font-size="12.5" font-weight="600" class="badT">rồi commit</text>
<rect class="box" x="160" y="92" width="170" height="64" rx="8"/><text x="172" y="119" font-size="11.5">publish OrderPlaced</text><text x="172" y="138" font-size="11.5" class="muted">broker nhận rồi</text>
<line class="ln" x1="330" y1="124" x2="346" y2="124" marker-end="url(#msInk)"/>
<rect class="boxBad" x="350" y="92" width="170" height="64" rx="8"/><text x="362" y="119" font-size="11.5" class="badT">SaveChanges lỗi</text><text x="362" y="138" font-size="11.5">rollback</text>
<line class="ln" x1="520" y1="124" x2="536" y2="124" marker-end="url(#msInk)"/>
<rect class="boxBad" x="540" y="92" width="170" height="64" rx="8"/><text x="552" y="119" font-size="11.5">Shipping chuẩn bị giao</text><text x="552" y="138" font-size="11.5">một đơn không tồn tại</text>
<rect class="boxOk" x="10" y="174" width="130" height="64" rx="8"/><text x="22" y="201" font-size="12.5" font-weight="600" class="okT">C. Outbox</text><text x="22" y="220" font-size="11.5" class="muted">event là một dòng</text>
<rect class="boxOk" x="160" y="174" width="170" height="64" rx="8"/><text x="172" y="201" font-size="11.5">INSERT Order + Outbox</text><text x="172" y="220" font-size="11.5">một transaction</text>
<line class="lnOk" x1="330" y1="206" x2="346" y2="206" marker-end="url(#msOk)"/>
<rect class="boxOk" x="350" y="174" width="170" height="64" rx="8"/><text x="362" y="201" font-size="11.5">worker đọc Outbox,</text><text x="362" y="220" font-size="11.5">publish, ghi SentAt</text>
<line class="ln" x1="520" y1="206" x2="536" y2="206" marker-end="url(#msInk)"/>
<rect class="boxAcc" x="540" y="174" width="170" height="64" rx="8"/><text x="552" y="201" font-size="11.5">crash trước SentAt</text><text x="552" y="220" font-size="11.5" class="accT">→ publish lại: trùng</text>
</svg>
</div>

Hàng A là ca nguy hiểm nhất vì im lặng: đơn đã tạo, khách đã thấy "đặt hàng thành công", nhưng Inventory, Shipping, Notification không bao giờ biết.

### Outbox table: biến "publish" thành một dòng trong DB {#outbox-table}

**Vì một transaction DB thì nguyên tử, nên ghi event thành một dòng trong bảng `OutboxMessages` cùng transaction với đơn hàng: có đơn thì chắc chắn có event.** Việc publish chuyển cho một `BackgroundService` riêng:

::: code-group

```csharp [OrdersController (ghi)]
db.Orders.Add(order);
db.OutboxMessages.Add(new OutboxMessage
{
    Id = Guid.NewGuid(),                 // dùng làm MessageId khi publish: consumer chống trùng theo nó
    Type = nameof(OrderPlaced),
    Payload = JsonSerializer.Serialize(new OrderPlaced(order.Id, order.Lines)),
    CreatedAt = DateTime.UtcNow
});
await db.SaveChangesAsync();             // một transaction: cả đơn lẫn event, hoặc không gì cả
```

```csharp [OutboxPublisher (đọc và publish)]
// Trong ExecuteAsync của BackgroundService, chạy lại mỗi vài giây
var batch = await db.OutboxMessages.Where(m => m.SentAt == null)
    .OrderBy(m => m.CreatedAt).Take(50).ToListAsync(ct);
foreach (var row in batch)
{
    await sender.SendMessageAsync(
        new ServiceBusMessage(row.Payload) { MessageId = row.Id.ToString(), Subject = row.Type }, ct);
    row.SentAt = DateTime.UtcNow;
    await db.SaveChangesAsync(ct);       // crash ngay trước dòng này → lần sau publish lại
}
```

:::

Publisher có thể crash sau khi publish mà trước khi ghi `SentAt`, nên outbox cho **at-least-once ở phía gửi**: **outbox luôn đi cặp với [idempotent consumer](#idempotent-consumer)**. Đặt `MessageId` bằng id dòng outbox để consumer (hoặc duplicate detection của Service Bus, nếu bật) nhận ra bản trùng. Thư viện như MassTransit, NServiceBus có outbox dựng sẵn; viết tay như trên để hiểu cơ chế.

Cái giá là độ trễ: Inventory biết về đơn sau vài giây, không phải ngay khi commit. Đây là **eventual consistency** (nhất quán sau cùng): tại một thời điểm các service có thể thấy dữ liệu lệch nhau, nhưng nếu không có thay đổi mới thì cuối cùng tất cả khớp. Màn hình phải chịu được điều đó, vd hiện "đơn đang xử lý" thay vì "đã giữ hàng".

Chiều ngược lại cũng vậy: webhook "thanh toán thành công" từ cổng thanh toán hay feed trạng thái từ hãng vận chuyển cũng tới at-least-once (họ retry khi không nhận được 200). Handler nhận chúng phải idempotent theo id sự kiện của bên kia, đúng như [Cách 1](#processed-messages).

## 8. Saga: quy trình nhiều bước không có transaction chung {#saga}

**Đặt hàng đi qua nhiều hệ thống không chung transaction, nên mỗi bước commit riêng; khi bước sau hỏng hẳn, bước trước đã xảy ra rồi và không rollback được.** Saga là cách tổ chức quy trình đó: chuỗi bước local, mỗi bước có một hành động bù (compensation) nếu cần quay đầu.

<div class="fig">
<svg viewBox="0 0 720 280" role="img" aria-label="Saga đặt hàng: giữ hàng, trừ tiền, đặt giao hàng thất bại; bù bằng hoàn tiền, nhả hàng, đơn Cancelled và email báo huỷ">
<text x="85" y="22" font-size="11" text-anchor="middle" class="muted">Inventory</text><text x="265" y="22" font-size="11" text-anchor="middle" class="muted">Payment · cổng ngoài</text><text x="445" y="22" font-size="11" text-anchor="middle" class="muted">Shipping · hãng ngoài</text><text x="625" y="22" font-size="11" text-anchor="middle" class="muted">Notification</text>
<rect class="boxOk" x="10" y="32" width="150" height="56" rx="8"/><text x="22" y="56" font-size="12.5" font-weight="600">1. Giữ hàng</text><text x="22" y="75" font-size="11.5" class="muted">commit local</text>
<line class="lnOk" x1="160" y1="60" x2="186" y2="60" marker-end="url(#msOk)"/>
<rect class="boxOk" x="190" y="32" width="150" height="56" rx="8"/><text x="202" y="56" font-size="12.5" font-weight="600">2. Trừ tiền</text><text x="202" y="75" font-size="11.5" class="muted">tiền đã đi</text>
<line class="lnOk" x1="340" y1="60" x2="366" y2="60" marker-end="url(#msOk)"/>
<rect class="boxBad" x="370" y="32" width="150" height="56" rx="8"/><text x="382" y="56" font-size="12.5" font-weight="600" class="badT">3. Đặt giao hàng</text><text x="382" y="75" font-size="11.5">hỏng hẳn: không giao</text>
<line class="lnMuted dash" x1="520" y1="60" x2="546" y2="60"/>
<rect class="box dash" x="550" y="32" width="150" height="56" rx="8"/><text x="562" y="56" font-size="12.5" font-weight="600" class="muted">4. Báo khách</text><text x="562" y="75" font-size="11.5" class="muted">không tới bước này</text>
<path class="lnBad dash" d="M445 88 V150 H344" marker-end="url(#msBad)"/>
<text x="452" y="124" font-size="11.5" class="badT">không rollback được</text>
<text x="452" y="140" font-size="11.5" class="badT">→ chạy compensation</text>
<rect class="boxAcc" x="190" y="122" width="150" height="56" rx="8"/><text x="202" y="146" font-size="12.5" font-weight="600" class="accT">a. Hoàn tiền</text><text x="202" y="165" font-size="11.5">giao dịch mới ở cổng</text>
<line class="lnBad dash" x1="190" y1="150" x2="164" y2="150" marker-end="url(#msBad)"/>
<rect class="boxAcc" x="10" y="122" width="150" height="56" rx="8"/><text x="22" y="146" font-size="12.5" font-weight="600" class="accT">b. Nhả hàng</text><text x="22" y="165" font-size="11.5">trả lại số lượng</text>
<path class="lnBad dash" d="M85 178 V206" marker-end="url(#msBad)"/>
<rect class="boxAcc" x="10" y="210" width="700" height="56" rx="8"/><text x="22" y="234" font-size="12.5" font-weight="600" class="accT">c. Order → Cancelled (giữ lại làm lịch sử) · gửi email mới báo đơn bị huỷ</text><text x="22" y="253" font-size="11.5" class="muted">không DELETE gì: trừ tiền và hoàn tiền đều là sự thật đã xảy ra, kế toán và hỗ trợ khách hàng cần thấy cả hai</text>
</svg>
<p class="fig-caption">Hàng trên: các bước tiến, mỗi bước commit ở hệ thống của nó. Hàng dưới: compensation chạy ngược, mỗi cái là một hành động nghiệp vụ mới.</p>
</div>

**Saga tồn tại vì nhiều hệ thống không chung transaction, không phải vì microservices.** Một monolith gọi cổng thanh toán và hãng vận chuyển bên ngoài cũng phải chia bước kiểu saga, vì không thể `BEGIN TRAN` qua API của người khác. Microservices chỉ làm tình huống này xảy ra nhiều hơn, vì mỗi service có DB riêng ([database per service](/architecture/microservices#database-per-service)).

Tên gọi lấy từ bài báo "Sagas" (1987) của Hector Garcia-Molina và Kenneth Salem về long-lived transactions: một giao dịch dài chia thành chuỗi giao dịch nhỏ, mỗi cái có giao dịch bù. "Saga" thường hiểu là một câu chuyện dài kể theo từng chương.

### Compensation là hành động mới, không phải xoá {#compensation}

**Vì bước trước đã commit và có thể đã có người thấy (khách nhận SMS trừ tiền, kế toán đã ghi sổ), nên không thể làm như nó chưa xảy ra; chỉ có thể làm thêm một việc ngược chiều.** Từ đó:

- **Hoàn tiền** là một giao dịch mới ở cổng thanh toán, không phải xoá giao dịch trừ tiền. Sao kê của khách có cả hai dòng.
- **Đơn chuyển sang `Cancelled`** kèm lý do, không bị DELETE: hỗ trợ khách hàng cần tra "vì sao đơn 123 bị huỷ".
- **Email báo huỷ là email mới**; email đã gửi không thu hồi được.
- **Compensation cũng có thể lỗi** (cổng thanh toán đang sập), nên nó phải retry được và idempotent: hoàn tiền với idempotency key `refund-order-123`.
- **Không phải lúc nào cũng quay đầu.** Có thể đi tiếp (forward recovery): thử hãng vận chuyển khác, hoặc giữ đơn chờ hãng mở lại tuyến. Hoặc đẩy cho người xử lý (hàng chờ duyệt tay). Chọn hướng nào là **quyết định nghiệp vụ** (hoàn tiền tốn phí giao dịch, khách có chịu chờ không), dev đưa ra lựa chọn và chi phí, PO quyết.

Thứ tự bước cũng là thiết kế: đặt bước dễ bù (giữ hàng: nhả là xong) trước bước đắt để bù (trừ tiền: hoàn tiền tốn phí, mất vài ngày).

### Choreography và orchestration {#choreography-vs-orchestration}

**Saga cần ai đó quyết bước tiếp theo; hai cách khác nhau ở chỗ quyết định đó nằm rải trong từng service, hay nằm ở một coordinator.**

<div class="fig">
<svg viewBox="0 0 720 260" role="img" aria-label="Trái: choreography, các service nối nhau bằng event. Phải: orchestration, OrderSaga ở giữa gửi lệnh tới bốn service">
<text x="10" y="20" font-size="12.5" font-weight="600" class="muted">Choreography · service nghe event, tự làm bước mình</text>
<rect class="box" x="10" y="50" width="110" height="40" rx="8"/><text x="65" y="75" font-size="12" text-anchor="middle">Order</text>
<rect class="box" x="230" y="50" width="110" height="40" rx="8"/><text x="285" y="75" font-size="12" text-anchor="middle">Inventory</text>
<rect class="box" x="230" y="160" width="110" height="40" rx="8"/><text x="285" y="185" font-size="12" text-anchor="middle">Payment</text>
<rect class="box" x="10" y="160" width="110" height="40" rx="8"/><text x="65" y="185" font-size="12" text-anchor="middle">Shipping</text>
<line class="ln" x1="120" y1="70" x2="226" y2="70" marker-end="url(#msInk)"/><text x="175" y="62" font-size="10.5" text-anchor="middle" class="mono muted">OrderPlaced</text>
<line class="ln" x1="285" y1="90" x2="285" y2="156" marker-end="url(#msInk)"/><text x="278" y="128" font-size="10.5" text-anchor="end" class="mono muted">StockReserved</text>
<line class="ln" x1="230" y1="180" x2="124" y2="180" marker-end="url(#msInk)"/><text x="175" y="172" font-size="10.5" text-anchor="middle" class="mono muted">PaymentCharged</text>
<text x="175" y="232" font-size="11.5" text-anchor="middle" class="badT">luồng nằm rải trong 4 service</text>
<text x="175" y="250" font-size="11.5" text-anchor="middle" class="muted">"đơn 123 đang kẹt ở đâu?" phải ghép log</text>
<text x="370" y="20" font-size="12.5" font-weight="600" class="muted">Orchestration · coordinator gửi lệnh, nhận kết quả</text>
<rect class="box" x="380" y="40" width="110" height="36" rx="8"/><text x="435" y="63" font-size="12" text-anchor="middle">Inventory</text>
<rect class="box" x="600" y="40" width="110" height="36" rx="8"/><text x="655" y="63" font-size="12" text-anchor="middle">Payment</text>
<rect class="box" x="600" y="170" width="110" height="36" rx="8"/><text x="655" y="193" font-size="12" text-anchor="middle">Shipping</text>
<rect class="box" x="380" y="170" width="110" height="36" rx="8"/><text x="435" y="193" font-size="12" text-anchor="middle">Notification</text>
<rect class="boxAcc" x="470" y="100" width="140" height="50" rx="8"/><text x="540" y="121" font-size="13" font-weight="600" text-anchor="middle" class="accT">OrderSaga</text><text x="540" y="139" font-size="11" text-anchor="middle">trạng thái từng đơn</text>
<line class="lnAcc" x1="500" y1="100" x2="450" y2="80" marker-start="url(#msAcc)" marker-end="url(#msAcc)"/>
<line class="lnAcc" x1="580" y1="100" x2="640" y2="80" marker-start="url(#msAcc)" marker-end="url(#msAcc)"/>
<line class="lnAcc" x1="580" y1="150" x2="640" y2="166" marker-start="url(#msAcc)" marker-end="url(#msAcc)"/>
<line class="lnAcc" x1="500" y1="150" x2="450" y2="166" marker-start="url(#msAcc)" marker-end="url(#msAcc)"/>
<text x="545" y="232" font-size="11.5" text-anchor="middle" class="okT">một chỗ trả lời "đơn 123 đang ở bước nào"</text>
<text x="545" y="250" font-size="11.5" text-anchor="middle" class="muted">thêm một thành phần phải viết và vận hành</text>
</svg>
</div>

**Choreography**: mỗi service nghe event, làm phần mình, phát event tiếp; lỗi thì phát event lỗi và các service trước tự bù.

- **+** Không có thành phần trung tâm; với 2–3 bước thì đơn giản, các service ít biết nhau.
- **−** Vì không ai giữ cả luồng, nên luồng chỉ tồn tại trong đầu người viết: câu "đơn 123 đang kẹt ở đâu?" phải trả lời bằng cách ghép log của 4 service. Thêm hoặc đổi thứ tự một bước phải sửa nhiều service, và dễ sinh vòng event khó theo dõi.

**Orchestration**: một coordinator (gọi là **process manager**, ở đây là `OrderSaga`) giữ trạng thái từng đơn (vd bảng `OrderSagaState`: `OrderId`, `Step`, `Status`), gửi lệnh `ReserveStock`, `ChargePayment`... qua queue, nhận kết quả và quyết bước tiếp hoặc compensation.

- **+** Vì trạng thái nằm một chỗ, nên trạng thái đơn đọc được bằng một query, timeout ("Payment 10 phút chưa trả lời") và luồng bù viết ở một nơi.
- **−** Thêm một thành phần phải viết, deploy, vận hành. Dễ phình thành "god service" chứa luật nghiệp vụ của người khác: giữ nó **gầy**, chỉ điều phối (bước nào, theo thứ tự nào, bù gì), còn việc "giữ hàng thế nào" vẫn nằm ở Inventory.

**Khuyến nghị**: quy trình nhiều bước, nhiều ngoại lệ và cần compensation (đặt hàng ở trên) thì dùng orchestration; thông báo kiểu fan-out đơn giản ("đơn đã giao, ai quan tâm thì nghe") thì choreography là đủ. Trong .NET, MassTransit và NServiceBus có saga state machine dựng sẵn; tự viết thì là một bảng trạng thái cộng một consumer, và consumer đó cũng phải idempotent.

## 9. Biến thể và trade-off {#trade-offs}

- **Vì Abandon và lock hết hạn giao lại message ngay, không có <T>backoff</T>**, hệ thống phía sau sập 30 giây có thể đốt hết 10 lượt và đẩy message lành vào DLQ. Retry có backoff ngay trong handler cho lỗi tạm thời (vd `Microsoft.Extensions.Http.Resilience` cho lời gọi HTTP), hoặc tăng MaxDeliveryCount.
- **Vì `ReceiveAndDelete` xoá lúc giao**, chỉ dùng khi mất một message không sao (telemetry, cập nhật vị trí liên tục).
- **Vì outbox publisher đọc "dòng chưa gửi"**, hai instance publisher chạy song song sẽ cùng publish một dòng. Chạy một instance, hoặc khoá dòng khi đọc; consumer idempotent vẫn là lưới cuối. Bảng outbox cũng cần job dọn dòng đã gửi.
- **Vì broker thêm một hệ thống phải vận hành và thêm eventual consistency**, không dùng nó khi người gọi cần kết quả ngay (kiểm tra tồn kho trên trang sản phẩm) hoặc khi mọi thứ nằm trong một DB và một transaction làm được. Việc nền trong cùng một app mà mất khi restart cũng không sao thì `Channel` + `BackgroundService` đủ. Cách chọn: [đồng bộ hay bất đồng bộ](/architecture/microservices#sync-vs-async).
- **Vì saga đổi transaction lấy compensation**, mỗi bước thêm vào là thêm một hành động bù phải thiết kế, test và quyết định nghiệp vụ. Gộp được các bước vào một service, một DB thì dùng transaction thường.

## Câu hỏi phỏng vấn {#interview}

### Queue và topic khác nhau thế nào? Khi nào dùng cái nào? <Badge type="warning" text="hay bị hỏi" /> {#queue-topic-difference}

::: tip Trả lời nhanh
Queue: mỗi message được đúng một consumer xử lý; nhiều instance trên một queue là competing consumers, chia tải. Topic: mỗi subscription nhận một bản riêng, mỗi subscription như một queue. Queue cho lệnh (một nơi phải làm), topic cho sự kiện (ai quan tâm thì nghe; thêm nơi nghe không sửa bên gửi). RabbitMQ: exchange + binding + queue, fanout tương đương topic. Xem [queue và topic](#queue-vs-topic).
:::

::: details Câu trả lời mẫu (English)
A queue delivers each message to exactly one consumer. If I run three instances of the email worker on the same queue, they compete for messages, so the load is shared and if one instance dies its locked messages go to another. A topic copies each message into every subscription, and each subscription behaves like its own queue. So I use a queue for commands, where exactly one component must do the work, like "send this email", and a topic for events, like "order placed", where inventory, shipping and notifications each have their own subscription. Adding a new listener means adding a subscription; the order service doesn't change. In RabbitMQ the same idea is built from an exchange that routes into queues through bindings; a fanout exchange is the equivalent of a topic.
:::

::: warning Bẫy & follow-up
**"Ba instance đọc một subscription thì mỗi instance nhận một bản à?"**

Không: trong một subscription vẫn là competing consumers, mỗi message một instance. Muốn mỗi service một bản thì mỗi service một subscription.

**"Có giữ thứ tự không?"**

Không khi nhiều consumer chạy song song. Cần thứ tự theo đơn thì dùng session (`SessionId = OrderId`, phải bật `RequiresSession`). Xem [queue và topic](#queue-vs-topic).
:::

### At-least-once nghĩa là gì với code của bạn? <Badge type="warning" text="câu senior" /> {#at-least-once-meaning}

::: tip Trả lời nhanh
Message chỉ bị xoá sau khi consumer `Complete`, nên consumer có thể làm xong rồi chết trước `Complete`; message được giao lại và việc chạy hai lần. Không mất, nhưng có thể trùng. Hệ quả cho code: mọi consumer phải idempotent. Exactly-once delivery qua mạng không có; thứ làm được là at-least-once + idempotent. Duplicate detection của Service Bus chỉ chặn gửi trùng, không chặn giao lại. Xem [at-least-once](#at-least-once), [PeekLock](#peek-lock).
:::

::: details Câu trả lời mẫu (English)
It means the broker won't lose a message, but it may deliver it more than once. With Service Bus in peek-lock mode, which is the SDK default, a message is only deleted when the consumer completes it. If the consumer finishes the work and crashes before completing, the lock expires after the lock duration, one minute by default, and the message is delivered again. So for my code it means every handler must be idempotent: processing the same message twice must have the same effect as processing it once. Exactly-once delivery over a network isn't really achievable; what you get is effectively-once processing by combining at-least-once delivery with an idempotent consumer. Coming from MSMQ with plain receives, it's the opposite trade-off: there a crash lost the message, here a crash may duplicate it, which is much easier to handle.
:::

::: warning Bẫy & follow-up
**"Bật duplicate detection là xong?"**

Không: nó lọc theo `MessageId` lúc **gửi**, trong một khoảng thời gian. Message bị giao lại vì consumer crash là cùng một message, nó không chặn. Xem [at-least-once](#at-least-once).

**"Sao không dùng ReceiveAndDelete cho khỏi trùng?"**

Thì quay lại at-most-once: crash là mất, đúng như MSMQ receive thường. Xem [vấn đề](#problem).
:::

### Làm sao để consumer idempotent? <Badge type="warning" text="câu senior" /> {#make-consumer-idempotent}

::: tip Trả lời nhanh
Ba cách. (1) Bảng `ProcessedMessages` có khoá chính `MessageId`, INSERT **cùng transaction** với thay đổi nghiệp vụ; trùng khoá thì bỏ qua. Lưu id trước thì crash làm mất việc, lưu sau thì crash làm trùng, cùng transaction thì đủ cả hai hoặc không gì. (2) Idempotent tự nhiên: UNIQUE `OrderId` trên `Reservation`, update có điều kiện theo trạng thái. (3) Gọi API ngoài không vào được transaction: gửi idempotency key nếu API hỗ trợ. Xem [idempotent consumer](#idempotent-consumer).
:::

::: details Câu trả lời mẫu (English)
The main technique is a processed-messages table whose primary key is the message id. In the handler I insert the message id and make the business change, for example creating the stock reservation, in the same database transaction, which in EF Core is a single SaveChanges. If the insert hits a duplicate key, the message was already processed and I just complete it. The ordering matters: if I saved the id first and crashed before the work, the redelivery would skip it and the work would be lost; if I did the work first and crashed before saving the id, it would run twice. Same transaction means both or neither. Sometimes the business data is enough, like a unique constraint on order id for reservations, or a conditional update on status. When the handler calls an external API like a payment gateway, which can't join my transaction, I pass an idempotency key derived from the order, if the API supports one. The message id itself must be stable, set by the sender, for example the outbox row id.
:::

::: warning Bẫy & follow-up
**"Kiểm tra bảng xem id có chưa rồi mới xử lý, được không?"**

Không đủ: hai instance có thể cùng đọc thấy "chưa có". Phải để khoá chính/UNIQUE quyết. Xem [UNIQUE](/aspnet-core/rest-api#unique-constraint).

**"Handler gửi email thì bỏ email vào transaction thế nào?"**

Không được. Ghi "đã gửi" ngay sau khi gửi và chấp nhận trùng hiếm hoi, hoặc dùng key nếu nhà cung cấp có. Xem [Cách 3](#external-idempotency).
:::

### Outbox pattern là gì, giải quyết vấn đề gì? <Badge type="warning" text="hay bị hỏi" /> {#outbox-why}

::: tip Trả lời nhanh
Vấn đề là dual write: lưu đơn vào DB và publish event là hai hệ thống không chung transaction. Commit rồi crash trước publish thì mất event (im lặng); publish rồi DB lỗi thì có event về đơn không tồn tại. Outbox: ghi event thành một dòng trong bảng `OutboxMessages` cùng transaction với đơn; một `BackgroundService` đọc dòng chưa gửi, publish, ghi `SentAt`. Crash sau publish trước `SentAt` thì publish lại, nên outbox luôn đi cặp với idempotent consumer. Xem [dual write](#dual-write), [outbox](#outbox-table).
:::

::: details Câu trả lời mẫu (English)
It solves the dual-write problem. When the order service saves an order and publishes an OrderPlaced event, those are two systems without a shared transaction. If I commit and then crash before publishing, the order exists but inventory and shipping never hear about it, and nobody notices. If I publish first and the database save fails, other services act on an order that doesn't exist. With an outbox, I write the event as a row in an outbox table in the same transaction as the order, so either both exist or neither does. A background service polls unsent rows, publishes them and marks them sent. It can crash after publishing but before marking, so the event may be published twice. That's why the outbox always goes together with idempotent consumers, and I use the outbox row id as the message id so duplicates are easy to detect. The trade-off is a few seconds of latency, so the system is eventually consistent.
:::

::: warning Bẫy & follow-up
**"Sao không bọc DB và publish trong một TransactionScope?"**

Service Bus không tham gia distributed transaction với SQL Server như vậy; và kể cả hệ thống có hỗ trợ thì distributed transaction chậm và kéo hai hệ thống dính chặt vào nhau. Outbox chỉ cần transaction của một DB.

**"Chạy 2 instance publisher thì sao?"**

Cùng đọc "dòng chưa gửi" và publish trùng. Chạy một instance hoặc khoá dòng; consumer idempotent vẫn là lưới cuối. Xem [trade-off](#trade-offs).
:::

### Saga: choreography hay orchestration, compensation là gì? <Badge type="warning" text="câu senior" /> {#saga-orchestration-choreography}

::: tip Trả lời nhanh
Saga là quy trình nhiều bước qua nhiều hệ thống không chung transaction: mỗi bước commit local, bước sau hỏng hẳn thì chạy compensation, là **hành động nghiệp vụ mới** (hoàn tiền, nhả hàng, đơn `Cancelled` giữ làm lịch sử, email báo huỷ), không phải xoá. Có khi đi tiếp (hãng khác) hoặc đẩy cho người; chọn gì là quyết định nghiệp vụ. Choreography: service nghe event và tự làm, không coordinator, nhưng luồng rải rác, khó biết đơn đang kẹt ở đâu. Orchestration: process manager giữ trạng thái và gửi lệnh, một chỗ xem trạng thái, phải giữ gầy. Nhiều bước nhiều ngoại lệ: orchestration; fan-out đơn giản: choreography. Xem [saga](#saga), [compensation](#compensation), [choreography và orchestration](#choreography-vs-orchestration).
:::

::: details Câu trả lời mẫu (English)
I haven't run sagas in production; here is how I understand them. A saga is a multi-step process across systems that don't share a transaction, for example reserve stock, charge the payment gateway, book a shipping provider, notify the customer. Each step commits locally, so if booking shipping fails permanently I can't roll back the charge. Instead I run compensations, which are new business actions: refund the payment, release the stock, mark the order cancelled and keep it as history, and send a cancellation email. Compensations must be retryable and idempotent too. Sometimes forward recovery is better, like trying another carrier, and that choice is a business decision. For coordination, choreography means each service reacts to events and emits the next one: simple for two or three steps, but the flow is scattered and it's hard to answer where order 123 is stuck. Orchestration means a process manager keeps the state per order and sends commands: one place to see status and handle timeouts, as long as it stays a thin coordinator. I'd pick orchestration for an order flow with many failure cases and choreography for simple fan-out notifications. And this isn't specific to microservices: a monolith calling an external payment API has the same problem.
:::

::: warning Bẫy & follow-up
**"Compensation là rollback phải không?"**

Không: rollback làm như chưa xảy ra; compensation thừa nhận nó đã xảy ra và làm thêm việc ngược chiều. Khách thấy cả dòng trừ tiền lẫn dòng hoàn tiền. Xem [compensation](#compensation).

**"Monolith thì không cần saga?"**

Vẫn cần khi gọi hệ thống ngoài (cổng thanh toán, hãng vận chuyển): không có transaction chung là đủ lý do. Xem [saga](#saga).

**"Compensation lỗi thì sao?"**

Retry với idempotency key; vẫn hỏng thì vào DLQ hoặc hàng chờ cho người xử lý.
:::

### Một message cứ lỗi mãi thì chuyện gì xảy ra? Bạn xử lý thế nào? {#poison-message}

::: tip Trả lời nhanh
Mỗi lần lỗi (exception thì Abandon, crash thì lock hết hạn) message quay lại queue và `DeliveryCount` tăng; quá MaxDeliveryCount (mặc định 10) thì broker chuyển nó sang dead-letter queue. DLQ không tự xử lý lại, không tự hết hạn: alert theo số message trong DLQ, xem lý do, sửa dữ liệu hoặc code, rồi gửi lại vào queue chính (Service Bus Explorer hoặc tool nội bộ). Lỗi chắc chắn không retry được thì `DeadLetterMessageAsync` luôn. Xem [dead-letter](#dead-letter).
:::

::: details Câu trả lời mẫu (English)
That's a poison message. In Service Bus each failed attempt, either an exception that abandons it or a crash that lets the lock expire, puts it back in the queue and increments the delivery count. After the max delivery count, ten by default, the broker moves it to the dead-letter queue, a sub-queue every queue has. Messages there aren't retried and don't expire, so I'd alert on the dead-letter count, inspect the message and the dead-letter reason, fix the data or the bug, and resubmit it to the main queue, either with Service Bus Explorer in the portal or a small internal tool. If the handler knows retrying is pointless, like a validation error, it dead-letters the message immediately with a reason instead of burning ten attempts. In my MSMQ worker today we catch the exception and email the error, and someone redoes the work by hand; a dead-letter queue keeps the actual message so it can be replayed.
:::

::: warning Bẫy & follow-up
**"Hệ thống phía sau sập 30 giây thì 10 lượt có đủ không?"**

Có thể không: giao lại là ngay lập tức, không có backoff, nên 10 lượt hết trong vài giây và message lành vào DLQ. Retry có backoff trong handler hoặc tăng MaxDeliveryCount. Xem [trade-off](#trade-offs).

**"Replay từ DLQ có an toàn không?"**

Chỉ khi consumer idempotent: message có thể đã làm được một phần trước khi lỗi. Xem [idempotent consumer](#idempotent-consumer).
:::

## Tự kiểm tra {#self-check}

::: details 1. Vì sao cùng một luật "chỉ xoá khi Complete" vừa làm hết mất việc vừa sinh ra trùng việc?
Không xoá khi đang xử lý nên lỗi hay crash chỉ làm message quay lại: không mất. Nhưng xoá *sau* khi xong nên có khoảnh khắc "xong rồi mà chưa Complete"; crash đúng lúc đó thì message quay lại và chạy lần hai.
:::

::: details 2. Handler throw exception. Message quay lại sau 1 phút hay ngay lập tức?
Với `ServiceBusProcessor`, ngay lập tức: processor tự Abandon khi handler throw. Chờ hết lock (1 phút mặc định) chỉ xảy ra khi consumer chết hoặc mất kết nối, không kịp Abandon.
:::

::: details 3. Nếu lưu MessageId vào bảng ProcessedMessages rồi commit, sau đó mới giữ hàng, thì crash ở giữa gây ra gì?
Lần giao lại thấy id đã có nên bỏ qua: hàng không bao giờ được giữ, và không ai biết. Phải INSERT id và giữ hàng trong cùng một transaction.
:::

::: details 4. Bên gửi tạo MessageId mới mỗi lần gửi lại cùng một event. Idempotent consumer còn chặn được trùng không?
Không chặn được theo MessageId, vì consumer thấy mỗi bản là một message khác. Chỉ còn idempotency tự nhiên (UNIQUE `OrderId` trên `Reservation`) cứu được. Vì thế MessageId phải ổn định, vd id dòng outbox.
:::

::: details 5. Không có outbox, Order commit đơn rồi crash trước khi publish. Ai phát hiện ra?
Thường không ai: khách thấy đặt hàng thành công, nhưng Inventory, Shipping, Notification không bao giờ nhận event. Lỗi im lặng, tới khi khách hỏi vì sao chưa giao.
:::

::: details 6. Hãng vận chuyển từ chối đơn đã trừ tiền. Vì sao không thể "rollback" mà phải hoàn tiền, và vì sao đơn không bị xoá?
Trừ tiền đã commit ở hệ thống của cổng thanh toán, ngoài transaction của bạn; khách và kế toán có thể đã thấy nó. Chỉ làm được hành động ngược chiều: một giao dịch hoàn tiền mới. Đơn giữ lại với trạng thái `Cancelled` để còn lịch sử cho hỗ trợ khách hàng và đối soát.
:::

::: details 7. Sếp hỏi "đơn 123 đang kẹt ở bước nào?". Với choreography và orchestration, bạn trả lời thế nào?
Orchestration: query bảng trạng thái của `OrderSaga`. Choreography: không có chỗ nào giữ câu trả lời, phải ghép log/trace của từng service (cần <T>distributed tracing</T> mới làm nổi).
:::
