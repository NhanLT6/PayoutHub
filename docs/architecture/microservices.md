---
title: "Microservices: khi nào tách, tách thế nào"
---

# Microservices: khi nào tách, tách thế nào

**Microservices** là chia một hệ thống thành nhiều service nhỏ, mỗi service một năng lực nghiệp vụ, deploy riêng, giữ DB riêng và nói chuyện với nhau qua mạng. Nó giải quyết việc nhiều team phải chờ nhau trong một monolith lớn, đổi lại là cái giá của mạng và dữ liệu phân tán. Trang này đi theo một shop online (Order, Payment, Inventory, Shipping, Notification): khi nào nên tách, chia ranh giới ở đâu, vì sao mỗi service một DB, khi nào gọi sync và khi nào gửi message, và cách tách dần một monolith. Đọc kèm: [Messaging](/architecture/messaging), [DDD](/architecture/ddd).

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="msInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="msAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="msOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="msBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 392" role="img" aria-label="Bản đồ chủ đề microservices: shop online với gateway, năm service mỗi cái một DB, một lời gọi sync, một message broker, và các bẫy">
<text x="196" y="22" font-size="12" font-weight="600" class="muted">Shop online · đường đi của một đơn hàng</text>
<a href="#when-to-use" style="text-decoration:none"><rect class="boxAcc" x="10" y="36" width="166" height="110" rx="8"/><text x="93" y="60" font-size="13" font-weight="600" text-anchor="middle">Khi nào tách</text><text x="93" y="80" font-size="10.5" text-anchor="middle">monolith → modular</text><text x="93" y="96" font-size="10.5" text-anchor="middle">→ microservices</text><text x="93" y="118" font-size="10" text-anchor="middle" class="muted">lý do chính:</text><text x="93" y="134" font-size="11" font-weight="700" text-anchor="middle" class="accT">deploy độc lập</text><circle cx="10" cy="36" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="10" cy="36" r="12"/><text x="10" y="41" font-size="13" font-weight="700" text-anchor="middle" class="accT">1</text></a>
<a href="#strangler-fig" style="text-decoration:none"><rect class="box" x="10" y="158" width="166" height="140" rx="8"/><text x="93" y="180" font-size="13" font-weight="600" text-anchor="middle">Strangler fig</text><rect class="box" x="60" y="192" width="66" height="20" rx="4"/><text x="93" y="206" font-size="10" text-anchor="middle">proxy</text><line class="ln" x1="80" y1="212" x2="60" y2="232" marker-end="url(#msInk)"/><line class="ln" x1="106" y1="212" x2="128" y2="232" marker-end="url(#msInk)"/><rect class="box dash" x="22" y="236" width="70" height="24" rx="4"/><text x="57" y="252" font-size="10" text-anchor="middle">monolith</text><rect class="boxOk" x="100" y="236" width="66" height="24" rx="4"/><text x="133" y="252" font-size="9.5" text-anchor="middle" class="okT">service mới</text><text x="93" y="284" font-size="10.5" text-anchor="middle">chuyển từng route một</text><circle cx="10" cy="158" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="10" cy="158" r="12"/><text x="10" y="163" font-size="13" font-weight="700" text-anchor="middle" class="accT">8</text></a>
<a href="#database-per-service" style="text-decoration:none"><rect class="boxBad" x="10" y="310" width="166" height="70" rx="8"/><text x="93" y="334" font-size="12" font-weight="700" text-anchor="middle" class="badT">Distributed monolith</text><text x="93" y="354" font-size="10.5" text-anchor="middle">đọc chung bảng DB</text><text x="93" y="370" font-size="10.5" text-anchor="middle">→ phải deploy chung</text><circle cx="10" cy="310" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="10" cy="310" r="12"/><text x="10" y="315" font-size="13" font-weight="700" text-anchor="middle" class="accT">9</text></a>
<rect class="box" x="390" y="36" width="110" height="24" rx="4"/><text x="445" y="52" font-size="11" text-anchor="middle">Client</text><line class="ln" x1="445" y1="60" x2="445" y2="82" marker-end="url(#msInk)"/>
<a href="#api-gateway" style="text-decoration:none"><rect class="boxAcc" x="196" y="86" width="394" height="44" rx="8"/><text x="393" y="104" font-size="12" font-weight="600" text-anchor="middle">API gateway · routing, auth, rate limit</text><text x="393" y="121" font-size="10.5" text-anchor="middle" class="muted">service discovery: gọi service theo tên</text><circle cx="196" cy="86" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="196" cy="86" r="12"/><text x="196" y="91" font-size="13" font-weight="700" text-anchor="middle" class="accT">7</text></a>
<rect class="boxBad" x="612" y="86" width="94" height="44" rx="8"/><text x="659" y="105" font-size="10" text-anchor="middle">Hãng vận chuyển</text><text x="659" y="120" font-size="9.5" text-anchor="middle" class="muted">bên ngoài</text>
<line class="ln" x1="230" y1="130" x2="230" y2="164" marker-end="url(#msInk)"/>
<line class="lnBad" x1="658" y1="168" x2="658" y2="134" marker-end="url(#msBad)"/>
<a href="#service-boundaries" style="text-decoration:none"><rect class="box" x="196" y="168" width="92" height="64" rx="6"/><text x="242" y="188" font-size="11.5" font-weight="600" text-anchor="middle">Order</text><rect class="box" x="300" y="168" width="92" height="64" rx="6"/><text x="346" y="188" font-size="11.5" font-weight="600" text-anchor="middle">Inventory</text><rect class="box" x="404" y="168" width="92" height="64" rx="6"/><text x="450" y="188" font-size="11.5" font-weight="600" text-anchor="middle">Payment</text><rect class="box" x="508" y="168" width="92" height="64" rx="6"/><text x="554" y="188" font-size="11.5" font-weight="600" text-anchor="middle">Notification</text><rect class="box" x="612" y="168" width="92" height="64" rx="6"/><text x="658" y="188" font-size="11.5" font-weight="600" text-anchor="middle">Shipping</text><circle cx="196" cy="168" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="196" cy="168" r="12"/><text x="196" y="173" font-size="13" font-weight="700" text-anchor="middle" class="accT">2</text></a>
<a href="#database-per-service" style="text-decoration:none"><path class="boxOk" d="M229 202 L229 218 A13 3 0 0 0 255 218 L255 202 A13 3 0 0 0 229 202 Z"/><ellipse class="boxOk" cx="242" cy="202" rx="13" ry="3"/><path class="boxOk" d="M333 202 L333 218 A13 3 0 0 0 359 218 L359 202 A13 3 0 0 0 333 202 Z"/><ellipse class="boxOk" cx="346" cy="202" rx="13" ry="3"/><path class="boxOk" d="M437 202 L437 218 A13 3 0 0 0 463 218 L463 202 A13 3 0 0 0 437 202 Z"/><ellipse class="boxOk" cx="450" cy="202" rx="13" ry="3"/><path class="boxOk" d="M541 202 L541 218 A13 3 0 0 0 567 218 L567 202 A13 3 0 0 0 541 202 Z"/><ellipse class="boxOk" cx="554" cy="202" rx="13" ry="3"/><path class="boxOk" d="M645 202 L645 218 A13 3 0 0 0 671 218 L671 202 A13 3 0 0 0 645 202 Z"/><ellipse class="boxOk" cx="658" cy="202" rx="13" ry="3"/><circle cx="212" cy="212" r="10" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="212" cy="212" r="10"/><text x="212" y="216" font-size="12" font-weight="700" text-anchor="middle" class="accT">3</text></a>
<a href="#sync-question" style="text-decoration:none"><path class="lnAcc" d="M262 168 C 262 144, 326 144, 326 164" fill="none" marker-end="url(#msAcc)"/><circle cx="294" cy="150" r="11" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="294" cy="150" r="11"/><text x="294" y="155" font-size="12" font-weight="700" text-anchor="middle" class="accT">4</text><text x="340" y="154" font-size="10.5" class="accT">sync: chờ giá, tồn kho</text></a>
<a href="#messaging-benefits" style="text-decoration:none"><line class="lnAcc" x1="242" y1="232" x2="242" y2="258" marker-end="url(#msAcc)"/><rect class="boxAcc dash" x="196" y="262" width="510" height="30" rx="6"/><text x="222" y="281" font-size="11">message broker · OrderPlaced: mỗi service tự làm phần mình, Order không chờ</text><line class="lnAcc dash" x1="346" y1="262" x2="346" y2="236" marker-end="url(#msAcc)"/><line class="lnAcc dash" x1="554" y1="262" x2="554" y2="236" marker-end="url(#msAcc)"/><line class="lnAcc dash" x1="658" y1="262" x2="658" y2="236" marker-end="url(#msAcc)"/><circle cx="196" cy="262" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="196" cy="262" r="12"/><text x="196" y="267" font-size="13" font-weight="700" text-anchor="middle" class="accT">5</text></a>
<a href="#cascading-failure" style="text-decoration:none"><rect class="boxBad" x="196" y="310" width="250" height="70" rx="8"/><text x="216" y="332" font-size="12" font-weight="700" class="badT">Cascading failure</text><text x="216" y="352" font-size="10.5">service chậm (không chết) giữ chân</text><text x="216" y="368" font-size="10.5">người gọi → lan sang endpoint khác</text><circle cx="196" cy="310" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="196" cy="310" r="12"/><text x="196" y="315" font-size="13" font-weight="700" text-anchor="middle" class="accT">6</text></a>
<a href="#provider-down" style="text-decoration:none"><rect class="boxBad" x="458" y="310" width="248" height="70" rx="8"/><text x="478" y="332" font-size="12" font-weight="700">Hãng sập 10 phút</text><text x="478" y="352" font-size="10.5" class="badT">sync: lỗi chạy ngược về khách</text><text x="478" y="368" font-size="10.5" class="okT">queue: chờ 10 phút rồi xong</text><circle cx="458" cy="310" r="12" style="fill:var(--vp-c-bg)"/><circle class="boxAcc" cx="458" cy="310" r="12"/><text x="458" y="315" font-size="13" font-weight="700" text-anchor="middle" class="accT">10</text></a>
</svg>
<p class="fig-caption">Ôn lại: đi từ Client xuống, nói được vì sao mỗi service có DB riêng, vì sao mũi tên 4 là sync còn 5 là message, rồi giải thích ba thẻ đỏ. Chỗ nào không nói được thì bấm vào đọc mục đó.</p>
</div>

## 1. Monolith lớn dần đau ở đâu, và khi nào nên tách {#when-to-use}

Vì mọi phần của monolith nằm chung một process và một lần deploy, nên chúng chia chung mọi thứ: lịch release, tài nguyên, và rủi ro. Shop còn nhỏ thì đó là ưu điểm (một chỗ build, một chỗ debug). Shop lớn lên, 5 team cùng sửa một codebase, thì chính sự "chung" đó gây đau:

- **Deploy chung nên lịch chung**: team Payment xong tính năng từ thứ Hai nhưng phải chờ team Shipping test xong mới release được, vì cả hai nằm trong cùng một bản build.
- **Process chung nên scale chung**: dịp sale chỉ Order và Inventory bị dồn tải, nhưng muốn thêm sức thì phải chạy thêm instance của cả app.
- **Process chung nên sập chung**: Notification rò memory làm process chết, khách cũng không đặt hàng được.

### Ba nấc: monolith, modular monolith, microservices {#evolution}

<div class="fig">
<svg viewBox="0 0 720 256" role="img" aria-label="Ba nấc: monolith code gọi chéo, modular monolith có ranh giới module nhưng một deploy, microservices mỗi service deploy và DB riêng">
<text x="122" y="26" font-size="13" font-weight="600" text-anchor="middle" class="badT">Nấc 0 · Monolith</text>
<text x="360" y="26" font-size="13" font-weight="600" text-anchor="middle" class="accT">Nấc 1 · Modular monolith</text>
<text x="598" y="26" font-size="13" font-weight="600" text-anchor="middle" class="okT">Nấc 2 · Microservices</text>
<rect class="boxBad" x="20" y="44" width="204" height="116" rx="8"/>
<g class="lnBad"><line x1="65" y1="67" x2="172" y2="115"/><line x1="168" y1="71" x2="78" y2="111"/><line x1="78" y1="111" x2="115" y2="143"/><line x1="65" y1="67" x2="78" y2="111"/><line x1="168" y1="71" x2="172" y2="115"/><line x1="172" y1="115" x2="115" y2="143"/></g>
<g font-size="10" text-anchor="middle"><rect class="box" x="30" y="56" width="70" height="22" rx="4"/><text x="65" y="71">Order</text><rect class="box" x="130" y="60" width="76" height="22" rx="4"/><text x="168" y="75">Payment</text><rect class="box" x="40" y="100" width="76" height="22" rx="4"/><text x="78" y="115">Inventory</text><rect class="box" x="136" y="104" width="72" height="22" rx="4"/><text x="172" y="119">Shipping</text><rect class="box" x="70" y="132" width="90" height="22" rx="4"/><text x="115" y="147">Notification</text></g>
<line class="ln" x1="122" y1="160" x2="122" y2="170"/><path class="box" d="M104 172 L104 194 A18 4 0 0 0 140 194 L140 172 A18 4 0 0 0 104 172 Z"/><ellipse class="box" cx="122" cy="172" rx="18" ry="4"/>
<line class="ln" x1="230" y1="100" x2="244" y2="100" marker-end="url(#msInk)"/>
<rect class="boxAcc" x="258" y="44" width="204" height="116" rx="8"/>
<g font-size="10" text-anchor="middle"><rect class="box" x="268" y="54" width="88" height="26" rx="4"/><text x="312" y="71">Order</text><rect class="box" x="364" y="54" width="88" height="26" rx="4"/><text x="408" y="71">Payment</text><rect class="box" x="268" y="88" width="88" height="26" rx="4"/><text x="312" y="105">Inventory</text><rect class="box" x="364" y="88" width="88" height="26" rx="4"/><text x="408" y="105">Shipping</text><rect class="box" x="316" y="122" width="88" height="26" rx="4"/><text x="360" y="139">Notification</text></g>
<line class="ln" x1="360" y1="160" x2="360" y2="170"/><path class="box" d="M342 172 L342 194 A18 4 0 0 0 378 194 L378 172 A18 4 0 0 0 342 172 Z"/><ellipse class="box" cx="360" cy="172" rx="18" ry="4"/>
<line class="ln" x1="468" y1="100" x2="482" y2="100" marker-end="url(#msInk)"/>
<g font-size="10" text-anchor="middle"><rect class="boxOk" x="492" y="52" width="66" height="24" rx="4"/><text x="525" y="68">Order</text><rect class="boxOk" x="563" y="52" width="66" height="24" rx="4"/><text x="596" y="68">Payment</text><rect class="boxOk" x="634" y="52" width="66" height="24" rx="4"/><text x="667" y="68">Inventory</text><rect class="boxOk" x="520" y="116" width="70" height="24" rx="4"/><text x="555" y="132">Shipping</text><rect class="boxOk" x="604" y="116" width="84" height="24" rx="4"/><text x="646" y="132">Notification</text></g>
<g class="box"><path d="M516 82 L516 94 A9 3 0 0 0 534 94 L534 82 A9 3 0 0 0 516 82 Z"/><ellipse cx="525" cy="82" rx="9" ry="3"/><path d="M587 82 L587 94 A9 3 0 0 0 605 94 L605 82 A9 3 0 0 0 587 82 Z"/><ellipse cx="596" cy="82" rx="9" ry="3"/><path d="M658 82 L658 94 A9 3 0 0 0 676 94 L676 82 A9 3 0 0 0 658 82 Z"/><ellipse cx="667" cy="82" rx="9" ry="3"/><path d="M546 146 L546 158 A9 3 0 0 0 564 158 L564 146 A9 3 0 0 0 546 146 Z"/><ellipse cx="555" cy="146" rx="9" ry="3"/><path d="M637 146 L637 158 A9 3 0 0 0 655 158 L655 146 A9 3 0 0 0 637 146 Z"/><ellipse cx="646" cy="146" rx="9" ry="3"/></g>
<g font-size="10.5" text-anchor="middle"><text x="122" y="222" font-weight="600">1 deploy, 1 DB, code gọi chéo</text><text x="122" y="240" class="badT">đau: team chờ nhau, 1 bug sập cả app</text><text x="360" y="222" font-weight="600">1 deploy, module có ranh giới</text><text x="360" y="240" class="muted">còn: deploy chung, scale chung</text><text x="598" y="222" font-weight="600">deploy riêng, DB riêng</text><text x="598" y="240" class="badT">giá: mạng, dữ liệu phân tán, giám sát</text></g>
</svg>
<p class="fig-caption">Mỗi nấc chữa một cái đau của nấc trước. Nấc 1 chữa code dính nhau mà chưa trả giá mạng; nấc 2 mới tách deploy, process và DB.</p>
</div>

- **Modular monolith** (nấc 1): vẫn một deploy, nhưng mỗi module chỉ gọi module khác qua interface công khai và chỉ đụng bảng của mình. Phần lớn cái đau "sửa chỗ này vỡ chỗ kia" là do code dính nhau, không phải do deploy chung, nên nấc này chữa được nó với chi phí thấp. Nó cũng là bước chuẩn bị: ranh giới module rõ thì sau này tách ra thành service gần như theo đường kẻ sẵn.
- **Microservices** (nấc 2): mỗi module thành một process riêng, deploy riêng, DB riêng. Thứ duy nhất nấc này thêm so với nấc 1 là **tách deploy và runtime**, và cái giá là mọi lời gọi giữa module thành lời gọi qua mạng.

**Lý do chính để lên nấc 2 thường là deploy độc lập cho các team độc lập**: team Payment release lúc nào xong, không hẹn ai. Hai lợi ích còn lại là phụ:

- **Scale riêng**: monolith cũng scale ngang được bằng cách chạy thêm instance; scale riêng chỉ đáng khi phần nóng ngốn tài nguyên khác hẳn phần còn lại.
- **Cô lập lỗi**: chỉ đúng khi service **không gọi nhau theo chuỗi sync**. Order gọi sync Shipping, Shipping gọi sync hãng vận chuyển, thì hãng sập vẫn kéo đặt hàng sập theo, xem [Hãng sập 10 phút](#provider-down).

### Khi nào không nên tách {#when-not}

Vì mỗi ranh giới service biến một method call thành một network call và một DB thành nhiều DB, nên microservices có một cái giá trả hằng ngày: lời gọi có thể chậm hoặc mất, không còn transaction chung giữa các service, và phải vận hành N lần deploy, log, alert, <T>distributed tracing</T>. Suy ra ba trường hợp không nên:

- **Team nhỏ**: vài dev không có ai phải chờ ai, nên lợi ích chính không tồn tại, chỉ còn cái giá.
- **Domain chưa rõ**: vẽ sai ranh giới trong monolith thì sửa là refactor trong một solution; vẽ sai giữa hai service thì sửa là đổi API, đổi event và chuyển data giữa hai DB.
- **Chưa đủ sức vận hành**: chưa có <T>CI/CD</T> cho từng service, chưa trace được một request đi qua 4 service, thì sự cố đầu tiên sẽ rất khó tìm.

Hướng an toàn: bắt đầu bằng modular monolith, tách một module ra khi nó có lý do thật (team riêng cần release riêng, hoặc tải khác hẳn).

## 2. Chia ranh giới theo năng lực nghiệp vụ {#service-boundaries}

Vì mục tiêu là một team sửa và deploy một service mà không cần ai khác, nên ranh giới phải bao trọn những thứ **hay thay đổi cùng nhau**. Một tính năng nghiệp vụ thường cắt dọc qua UI, logic và DB, nên chia theo tầng kỹ thuật thì tính năng nào cũng chạm mọi service.

<div class="fig">
<svg viewBox="0 0 720 220" role="img" aria-label="Chia theo tầng: tính năng giao hàng nhanh chạm cả ba service. Chia theo nghiệp vụ: chỉ chạm Shipping">
<text x="180" y="22" font-size="13" font-weight="600" text-anchor="middle" class="badT">Chia theo tầng kỹ thuật</text>
<text x="540" y="22" font-size="13" font-weight="600" text-anchor="middle" class="okT">Chia theo năng lực nghiệp vụ</text>
<g font-size="12" text-anchor="middle"><rect class="box" x="40" y="40" width="250" height="32" rx="6"/><text x="165" y="61">UI service</text><rect class="box" x="40" y="82" width="250" height="32" rx="6"/><text x="165" y="103">Logic service</text><rect class="box" x="40" y="124" width="250" height="32" rx="6"/><text x="165" y="145">Data service (mọi bảng)</text></g>
<line class="lnBad" x1="310" y1="44" x2="310" y2="152"/><circle class="dotBad" cx="310" cy="56" r="4"/><circle class="dotBad" cx="310" cy="98" r="4"/><circle class="dotBad" cx="310" cy="140" r="4"/>
<text x="165" y="182" font-size="11" text-anchor="middle">tính năng: phí giao hàng nhanh</text>
<text x="165" y="202" font-size="11" text-anchor="middle" class="badT">sửa cả 3 service, 3 team, deploy cùng lúc</text>
<line class="lnMuted" x1="360" y1="14" x2="360" y2="210"/>
<g font-size="10" text-anchor="middle"><rect class="box" x="390" y="36" width="90" height="124" rx="6"/><text x="435" y="54" font-size="12" font-weight="600">Order</text><rect class="box" x="490" y="36" width="90" height="124" rx="6"/><text x="535" y="54" font-size="12" font-weight="600">Payment</text><rect class="boxOk" x="600" y="36" width="90" height="124" rx="6"/><text x="645" y="54" font-size="12" font-weight="600" class="okT">Shipping</text><rect class="box dash" x="398" y="66" width="74" height="22" rx="4"/><text x="435" y="81" class="muted">API</text><rect class="box dash" x="398" y="96" width="74" height="22" rx="4"/><text x="435" y="111" class="muted">logic</text><rect class="box dash" x="398" y="126" width="74" height="22" rx="4"/><text x="435" y="141" class="muted">DB</text><rect class="box dash" x="498" y="66" width="74" height="22" rx="4"/><text x="535" y="81" class="muted">API</text><rect class="box dash" x="498" y="96" width="74" height="22" rx="4"/><text x="535" y="111" class="muted">logic</text><rect class="box dash" x="498" y="126" width="74" height="22" rx="4"/><text x="535" y="141" class="muted">DB</text><rect class="box" x="608" y="66" width="74" height="22" rx="4"/><text x="645" y="81">API</text><rect class="box" x="608" y="96" width="74" height="22" rx="4"/><text x="645" y="111">logic</text><rect class="box" x="608" y="126" width="74" height="22" rx="4"/><text x="645" y="141">DB</text></g>
<text x="540" y="182" font-size="11" text-anchor="middle">tính năng: phí giao hàng nhanh</text>
<text x="540" y="202" font-size="11" text-anchor="middle" class="okT">chỉ sửa Shipping: 1 team, 1 deploy</text>
</svg>
<p class="fig-caption">Cùng một tính năng. Chia theo tầng thì nó cắt ngang mọi service; chia theo nghiệp vụ thì nó nằm gọn trong một service.</p>
</div>

Ba dấu hiệu để vẽ ranh giới, đều suy ra từ "thay đổi cùng nhau thì ở cùng nhau":

- **Thay đổi cùng nhau**: phí giao hàng, hãng vận chuyển, vận đơn luôn đổi cùng lúc, nên cùng một service.
- **Cùng bộ từ vựng**: chữ "đơn hàng" ở Shipping là kiện hàng có địa chỉ và cân nặng, ở Payment là số tiền cần thu. Cùng một chữ mà hai nghĩa là dấu hiệu có hai ranh giới; DDD gọi mỗi vùng nghĩa là một [bounded context](/architecture/ddd#bounded-context).
- **Một team sở hữu**: service có hai team cùng sửa thì lại quay về cảnh chờ nhau.

Dấu hiệu chia sai: hai service luôn phải deploy cùng nhau, hoặc một request phải gọi qua lại giữa hai service nhiều lần (chatty). Cả hai nghĩa là thứ thay đổi cùng nhau đang bị cắt đôi.

## 3. Mỗi service một database {#database-per-service}

Vì bảng của một service là chi tiết bên trong của nó, nên service khác đọc thẳng bảng đó thì chi tiết bên trong thành hợp đồng công khai. Shipping `SELECT` thẳng từ bảng `Orders` thì team Order không đổi tên cột được nữa nếu không báo team Shipping, và hai bên phải hẹn deploy cùng lúc. Đó là **distributed monolith**: trả đủ giá của microservices (mạng, nhiều deploy) mà mất đúng lợi ích chính là deploy độc lập.

<div class="fig">
<svg viewBox="0 0 720 190" role="img" aria-label="DB chung: Shipping đọc bảng Orders của Order. DB riêng: Shipping chỉ hỏi qua API hoặc nghe event">
<text x="180" y="22" font-size="13" font-weight="600" text-anchor="middle" class="badT">Đọc chung bảng</text>
<text x="540" y="22" font-size="13" font-weight="600" text-anchor="middle" class="okT">Mỗi service giữ dữ liệu của mình</text>
<g font-size="12" text-anchor="middle"><rect class="box" x="40" y="40" width="110" height="34" rx="6"/><text x="95" y="62">Order</text><rect class="box" x="210" y="40" width="110" height="34" rx="6"/><text x="265" y="62">Shipping</text><rect class="box" x="70" y="110" width="220" height="50" rx="6"/><text x="125" y="140" font-size="11" class="mono">Orders</text><text x="235" y="140" font-size="11" class="mono">Shipments</text></g>
<line class="ln" x1="95" y1="74" x2="115" y2="106" marker-end="url(#msInk)"/><line class="ln" x1="265" y1="74" x2="240" y2="106" marker-end="url(#msInk)"/><line class="lnBad" x1="250" y1="74" x2="145" y2="106" marker-end="url(#msBad)"/>
<text x="180" y="180" font-size="11" text-anchor="middle" class="badT">Order đổi cột Orders → Shipping vỡ</text>
<line class="lnMuted" x1="360" y1="14" x2="360" y2="186"/>
<g font-size="12" text-anchor="middle"><rect class="box" x="400" y="40" width="110" height="34" rx="6"/><text x="455" y="62">Order</text><rect class="box" x="580" y="40" width="110" height="34" rx="6"/><text x="635" y="62">Shipping</text><rect class="boxOk" x="400" y="110" width="110" height="50" rx="6"/><text x="455" y="140" font-size="11" class="mono">Orders</text><rect class="boxOk" x="580" y="110" width="110" height="50" rx="6"/><text x="635" y="140" font-size="11" class="mono">Shipments</text></g>
<line class="ln" x1="455" y1="74" x2="455" y2="106" marker-end="url(#msInk)"/><line class="ln" x1="635" y1="74" x2="635" y2="106" marker-end="url(#msInk)"/><line class="lnAcc dash" x1="576" y1="57" x2="514" y2="57" marker-end="url(#msAcc)"/>
<text x="545" y="50" font-size="10" text-anchor="middle" class="accT">API / event</text>
<text x="545" y="180" font-size="11" text-anchor="middle" class="okT">Orders đổi gì cũng được, miễn API/event giữ nguyên</text>
</svg>
<p class="fig-caption">Hợp đồng giữa hai service là API và event, không phải schema bảng.</p>
</div>

- **"DB riêng" là riêng quyền truy cập**, không bắt buộc riêng server: hai schema trên cùng một SQL Server, mỗi service chỉ có quyền vào schema của mình, vẫn đạt mục tiêu.
- **Không có foreign key xuyên service**: `Shipments.OrderId` chỉ là một giá trị, DB không kiểm tra nó tồn tại bên Order. Tính đúng giữa các service do quy trình (API, event) giữ, không do constraint.

### Cần dữ liệu của service khác thì làm sao {#cross-service-data}

Rule ví dụ: **Shipping chỉ tạo vận đơn cho đơn đã thanh toán**. Thông tin "đã thanh toán" thuộc Payment. Có ba cách, khác nhau ở chỗ dữ liệu được lấy **lúc nào**:

1. **Hỏi chủ dữ liệu ngay lúc cần**: Shipping gọi API của Payment. Luôn đúng số mới nhất, nhưng Shipping chỉ chạy được khi Payment đang sống, và mỗi lần cần là một lời gọi mạng.
2. **Giữ bản sao đọc tại chỗ, nuôi bằng event**: Shipping nghe event `PaymentCompleted`, ghi vào bảng `PaidOrders` của riêng mình. Lúc cần thì đọc DB của mình, không phụ thuộc Payment. Đổi lại là **eventual consistency**: bản sao có thể trễ vài giây so với Payment, nên phải chấp nhận được độ trễ đó.
3. **Thiết kế quy trình để rule tự đúng**: Shipping không bắt đầu từ `OrderPlaced` mà từ `PaymentCompleted`. Không có đường nào để một đơn chưa thanh toán tới được Shipping, nên không cần kiểm tra gì. Cách này thường gọn nhất, nhưng cần nghĩ lại luồng nghiệp vụ, xem [Saga](/architecture/messaging#saga).

Truy vấn xuyên service (danh sách đơn kèm trạng thái giao hàng) cũng theo hai hướng tương tự: một chỗ (gateway hoặc service đứng trước) gọi từng service rồi ghép kết quả, hoặc dựng một bảng chỉ để đọc, nuôi bằng event từ Order và Shipping. Không ai `JOIN` sang DB của service khác.

## 4. Sync hay async: chỉ một câu hỏi {#sync-vs-async}

### Người gọi có cần câu trả lời để làm tiếp không? {#sync-question}

Đó là câu hỏi duy nhất. **Cần** thì gọi sync (HTTP, gRPC) và chờ. **Không cần** thì gửi message rồi đi tiếp. Giống **gọi điện và gửi email**: gọi điện khi phải có câu trả lời mới làm tiếp được, nhưng người kia phải nghe máy ngay lúc đó; gửi email khi chỉ cần báo, người kia đọc lúc rảnh, còn mình làm việc khác.

- **Sync**: khách mở trang đơn hàng thì trang cần trạng thái hiện tại mới hiển thị được. Lúc checkout, Order cần Inventory trả lời giá và số lượng còn **trước khi** xác nhận đơn. Không có câu trả lời thì không có gì để làm tiếp.
- **Async**: đơn đã xác nhận, Order publish `OrderPlaced`. Inventory trừ kho, Shipping tạo vận đơn, Notification gửi email, mỗi bên làm khi nó làm được. Order không cần kết quả của bên nào để trả lời khách "đã nhận đơn", nên không chờ.

### Hãng vận chuyển sập 10 phút {#provider-down}

Hai thiết kế chỉ khác nhau thật khi có sự cố. Cho hãng vận chuyển bên ngoài sập 10 phút, rồi xem ai còn giữ lỗi trong tay:

<div class="fig">
<svg viewBox="0 0 720 310" role="img" aria-label="A: Order gọi sync Shipping, hãng sập, lỗi chạy ngược về khách và việc dừng lại. B: Order publish OrderPlaced, khách nhận trả lời ngay, message chờ trong queue và xong khi hãng sống lại">
<text x="180" y="22" font-size="13" font-weight="600" text-anchor="middle" class="badT">A · Order gọi sync Shipping</text>
<text x="545" y="22" font-size="13" font-weight="600" text-anchor="middle" class="okT">B · Order publish OrderPlaced</text>
<line class="lnMuted" x1="360" y1="10" x2="360" y2="300"/>
<g font-size="11" text-anchor="middle" font-weight="600"><text x="55" y="50">Khách</text><text x="140" y="50">Order</text><text x="230" y="50">Shipping</text><text x="315" y="50">Hãng</text><text x="400" y="50">Khách</text><text x="465" y="50">Order</text><text x="535" y="50">Queue</text><text x="610" y="50">Shipping</text><text x="685" y="50">Hãng</text></g>
<g class="lnMuted dash"><line x1="55" y1="58" x2="55" y2="280"/><line x1="140" y1="58" x2="140" y2="280"/><line x1="230" y1="58" x2="230" y2="280"/><line x1="315" y1="58" x2="315" y2="280"/><line x1="400" y1="58" x2="400" y2="280"/><line x1="465" y1="58" x2="465" y2="280"/><line x1="535" y1="58" x2="535" y2="280"/><line x1="610" y1="58" x2="610" y2="280"/><line x1="685" y1="58" x2="685" y2="280"/></g>
<rect class="boxBad" x="307" y="66" width="16" height="164" rx="3"/><rect class="boxBad" x="677" y="66" width="16" height="164" rx="3"/>
<g font-size="10.5" class="muted"><text x="14" y="88">0'</text><text x="14" y="244">10'</text><text x="370" y="88">0'</text><text x="370" y="244">10'</text></g>
<line class="ln" x1="55" y1="84" x2="136" y2="84" marker-end="url(#msInk)"/><text x="97" y="79" font-size="10" text-anchor="middle">đặt hàng</text>
<line class="ln" x1="140" y1="104" x2="226" y2="104" marker-end="url(#msInk)"/><text x="185" y="99" font-size="10" text-anchor="middle">tạo vận đơn</text>
<line class="lnBad" x1="230" y1="124" x2="303" y2="124" marker-end="url(#msBad)"/><text x="268" y="119" font-size="10" text-anchor="middle" class="badT">✗</text>
<line class="lnBad dash" x1="230" y1="146" x2="144" y2="146" marker-end="url(#msBad)"/><text x="185" y="141" font-size="10" text-anchor="middle" class="badT">503</text>
<line class="lnBad dash" x1="140" y1="168" x2="59" y2="168" marker-end="url(#msBad)"/><text x="97" y="163" font-size="10" text-anchor="middle" class="badT">lỗi</text>
<text x="50" y="196" font-size="10.5" class="badT">khách thấy lỗi, phải tự bấm lại</text><text x="50" y="212" font-size="10.5">Order: huỷ đơn, hoặc tự lưu để thử lại</text>
<text x="315" y="248" font-size="10" text-anchor="middle" class="okT">sống lại</text>
<text x="180" y="270" font-size="10.5" text-anchor="middle" class="badT">không ai gọi lại: việc dừng ở lỗi</text>
<line class="ln" x1="400" y1="84" x2="461" y2="84" marker-end="url(#msInk)"/><text x="432" y="79" font-size="10" text-anchor="middle">đặt hàng</text>
<line class="lnAcc" x1="465" y1="102" x2="531" y2="102" marker-end="url(#msAcc)"/><text x="500" y="97" font-size="9.5" text-anchor="middle" class="mono">OrderPlaced</text>
<line class="lnOk dash" x1="465" y1="120" x2="404" y2="120" marker-end="url(#msOk)"/><text x="432" y="115" font-size="10" text-anchor="middle" class="okT">đã nhận</text>
<line class="lnAcc" x1="535" y1="140" x2="606" y2="140" marker-end="url(#msAcc)"/>
<line class="lnBad" x1="610" y1="156" x2="673" y2="156" marker-end="url(#msBad)"/><text x="645" y="151" font-size="10" text-anchor="middle" class="badT">✗</text>
<line class="ln dash" x1="610" y1="172" x2="539" y2="172" marker-end="url(#msInk)"/><text x="572" y="167" font-size="10" text-anchor="middle">trả lại</text>
<text x="395" y="200" font-size="10.5" class="muted">message chờ; Shipping thử lại sau, có delay</text><text x="395" y="216" font-size="10.5" class="muted">Inventory, Notification vẫn chạy bình thường</text>
<text x="685" y="248" font-size="10" text-anchor="middle" class="okT">sống lại</text>
<line class="lnAcc" x1="535" y1="258" x2="606" y2="258" marker-end="url(#msAcc)"/>
<line class="lnOk" x1="610" y1="272" x2="681" y2="272" marker-end="url(#msOk)"/><text x="645" y="267" font-size="10" text-anchor="middle" class="okT">✓</text>
<text x="540" y="298" font-size="10.5" text-anchor="middle" class="okT">vận đơn xong sau 10 phút, không ai thấy lỗi</text>
</svg>
<p class="fig-caption">Cùng một sự cố. A: lỗi chạy ngược về tới khách, và không có ai tự làm lại khi hãng sống lại. B: khách được trả lời ngay; message nằm chờ, Shipping làm xong khi hãng sống lại.</p>
</div>

Ở A, Order có thể bắt lỗi rồi tự lưu đơn lại để thử sau, nhưng như vậy là đang tự viết lại một cái queue. B làm việc đó có sẵn, với hai điều kiện:

- **Shipping không được xác nhận xong message khi gọi hãng lỗi**, và phải **thử lại có delay**. Với Azure Service Bus, receive mode mặc định của SDK là PeekLock: message chỉ bị xoá khi consumer gọi complete, xem [Peek-lock](/architecture/messaging#peek-lock). Nhưng nếu thử lại ngay lập tức thì 10 lần (MaxDeliveryCount mặc định là 10) có thể hết trong vài giây, message vào [dead-letter queue](/architecture/messaging#dead-letter) trước khi hãng sống lại.
- **Lời hứa với khách đổi đi**: B nói "đã nhận đơn", không nói "đã có vận đơn". Nếu hãng không bao giờ sống lại thì phải có bước bù (huỷ đơn, hoàn tiền), xem [Saga](/architecture/messaging#saga).

### Vì sao qua mạng câu hỏi này nặng hơn trong monolith {#network-call}

Trong monolith, Order gọi `shipping.CreateLabel()` là một method call trong cùng process: process còn sống thì bên kia chắc chắn có mặt, gọi mất vài nanosecond, lỗi thì thành exception. Vì vậy chọn sync hay không gần như không quan trọng. Qua mạng thì bên kia có thể chết, chậm, hoặc đã làm xong mà response bị mất giữa đường (timeout: không biết bên kia đã làm chưa, xem [Timeout](/aspnet-core/rest-api#timeout)). Nên mỗi lời gọi sync **cộng thêm độ trễ và nhân thêm xác suất lỗi** vào người gọi: chuỗi 3 service, mỗi cái sống 99,9% thời gian, thì cả chuỗi chỉ còn khoảng 99,7% (0,999³). Message cắt chuỗi đó: lúc publish, Order chỉ cần broker sống.

### Messaging cho thêm gì, và giá phải trả {#messaging-benefits}

- **Một event, nhiều người nghe mà người gửi không biết**: thêm service tích điểm nghe `OrderPlaced` mà không sửa một dòng nào trong Order. Order chỉ biết "đơn đã đặt", không biết ai quan tâm, nên <T>coupling</T> giữa các service thấp.
- **Queue hấp thụ tải đột biến**: giờ mở sale có 5.000 đơn mỗi phút, Shipping xử lý được 500 mỗi phút. Queue dài ra rồi rút dần; Shipping làm theo sức mình, không bị đè chết.
- **Giá phải trả**: dữ liệu giữa các service chỉ khớp sau một lúc (eventual consistency); message có thể tới hơn một lần ([at-least-once](/architecture/messaging#at-least-once)) nên consumer phải [idempotent](/architecture/messaging#idempotent-consumer); lưu đơn và publish event phải cùng thành công hoặc cùng thất bại ([Outbox](/architecture/messaging#outbox)); và debug khó hơn vì một việc chạy qua nhiều process ở nhiều thời điểm.

### REST hay gRPC {#rest-vs-grpc}

Cả hai đều là gọi sync, tức vẫn là gọi điện; chọn cái nào không thay đổi câu trả lời ở trên. <T>REST</T> (JSON qua HTTP) thì ai cũng gọi được: browser, đối tác, `curl`. <T>gRPC</T> gửi dữ liệu nhị phân (Protobuf) qua HTTP/2, viết contract trước trong file `.proto` rồi sinh code client và server, nên nhanh, gọn và chặt kiểu; hợp với gọi nội bộ giữa các service. Browser không gọi thẳng gRPC được (phải qua gRPC-Web), nên API cho client bên ngoài thường vẫn là REST.

## 5. Cascading failure: một service chậm kéo sập service khác {#cascading-failure}

Vì service **chậm** vẫn nhận request và giữ kết nối, nên người gọi không thấy lỗi ngay mà ngồi chờ. Mỗi request đang chờ giữ một phần tài nguyên của người gọi; traffic vẫn vào đều nên tài nguyên cạn dần, và đến lúc endpoint không liên quan cũng phải xếp hàng. Service **chết hẳn** lại ít hại hơn: kết nối bị từ chối ngay, người gọi nhận lỗi trong vài mili giây.

<div class="fig">
<svg viewBox="0 0 720 176" role="img" aria-label="Inventory chậm 30 giây, request của Order chờ chồng chất, endpoint xem đơn không gọi Inventory cũng chậm theo">
<g font-size="10.5" class="mono"><text x="20" y="62">POST /orders</text><text x="20" y="120">GET /orders/42</text></g>
<text x="20" y="78" font-size="10" class="muted">checkout, gọi Inventory</text><text x="20" y="136" font-size="10" class="badT">không gọi Inventory, vẫn chậm</text>
<line class="ln" x1="150" y1="58" x2="256" y2="58" marker-end="url(#msInk)"/><line class="lnBad" x1="170" y1="116" x2="256" y2="116" marker-end="url(#msBad)"/>
<rect class="box" x="260" y="30" width="200" height="112" rx="8"/><text x="360" y="50" font-size="12" font-weight="600" text-anchor="middle">Order</text>
<g class="boxBad dash"><rect x="278" y="62" width="14" height="40" rx="2"/><rect x="298" y="62" width="14" height="40" rx="2"/><rect x="318" y="62" width="14" height="40" rx="2"/><rect x="338" y="62" width="14" height="40" rx="2"/><rect x="358" y="62" width="14" height="40" rx="2"/><rect x="378" y="62" width="14" height="40" rx="2"/><rect x="398" y="62" width="14" height="40" rx="2"/><rect x="418" y="62" width="14" height="40" rx="2"/></g>
<text x="360" y="124" font-size="10" text-anchor="middle" class="badT">request đang chờ: tăng dần</text>
<line class="lnBad" x1="460" y1="76" x2="556" y2="76" marker-end="url(#msBad)"/><text x="508" y="70" font-size="10" text-anchor="middle" class="badT">chờ…</text>
<rect class="boxBad" x="560" y="50" width="140" height="52" rx="8"/><text x="630" y="72" font-size="12" font-weight="600" text-anchor="middle">Inventory</text><text x="630" y="90" font-size="10.5" text-anchor="middle" class="badT">chậm 30s, chưa chết</text>
<text x="360" y="166" font-size="10.5" text-anchor="middle" class="muted">client của Order cũng chờ theo → chậm lan ngược lên trên</text>
</svg>
<p class="fig-caption">Inventory không trả lỗi nên Order không biết để dừng. Request chờ chồng lên nhau cho tới khi tài nguyên dùng chung của Order cạn.</p>
</div>

"Tài nguyên" ở đây cụ thể là gì phụ thuộc code. Code gọi blocking (`.Result`, `.Wait()`) thì mỗi request giữ hẳn một thread, nhanh chóng thành <T>thread pool starvation</T> và mọi endpoint chậm, xem [Async/await giải quyết gì](/runtime/async#why-async). Code async đúng thì thread được trả lại trong lúc chờ, nhưng request vẫn giữ memory, kết nối, và DB connection nếu đang mở transaction quanh lời gọi; client của Order cũng treo theo. Cách chữa, mỗi cách cắt một khâu:

- **Timeout**: không chờ vô hạn. `HttpClient` mặc định chờ 100 giây, quá dài cho gọi nội bộ.
- **Retry với <T>backoff</T>**: thử lại lỗi tạm thời, giãn cách và thêm jitter để không dồn thêm tải vào service đang yếu; chỉ retry request idempotent.
- **<T>Circuit breaker</T>**: lỗi vượt ngưỡng thì ngắt, fail ngay trong một khoảng thay vì chờ timeout, rồi thử lại vài request xem bên kia đã ổn chưa. Trong .NET dùng Polly hoặc `Microsoft.Extensions.Http.Resilience` (xây trên Polly).
- **Chuyển sang messaging** nếu người gọi không cần câu trả lời: không còn ai chờ, không còn chuỗi, xem [mục 4](#sync-question).

```csharp
// Program.cs của Order: một dòng gắn sẵn timeout + retry + circuit breaker
builder.Services.AddHttpClient<InventoryClient>(c => c.BaseAddress = new Uri("http://inventory"))
    .AddStandardResilienceHandler(); // mặc định: 10s mỗi lần thử, 30s tổng, retry có backoff + jitter
```

Giá trị mặc định và bẫy retry POST của `AddStandardResilienceHandler()` nằm ở [Gọi API bên ngoài](/aspnet-core/questions#httpclientfactory).

## 6. API gateway và service discovery {#api-gateway}

Vì client không nên biết shop có bao nhiêu service và mỗi cái ở địa chỉ nào, nên đặt **một cửa vào duy nhất**: <T>API gateway</T>. Nó nhận mọi request từ ngoài và làm các việc chung một lần: **routing** (`/orders/*` sang Order, `/shipments/*` sang Shipping), **xác thực** token, <T>rate limiting</T>. Tách hay gộp service phía sau thì chỉ sửa bảng route ở gateway, client không đổi. Ví dụ: <T>YARP</T> (thư viện <T>reverse proxy</T> của Microsoft, tự host trong một app ASP.NET Core) hoặc Azure API Management (<T>APIM</T>, dịch vụ có sẵn trên Azure). Bẫy: không đặt logic nghiệp vụ vào gateway, nếu không nó thành một monolith mới mà mọi team phải sửa chung.

**Service discovery**: vì instance của service sinh ra, chết đi và đổi IP liên tục (scale, deploy lại), nên không gọi bằng IP mà gọi **bằng tên**, và một thành phần khác tra tên ra địa chỉ hiện tại. Trên <T>Kubernetes</T> việc này có sẵn: tạo một <T k="k8s service">Service</T> tên `inventory` thì DNS trong cluster phân giải `http://inventory` (cùng namespace) hoặc `inventory.<namespace>.svc.cluster.local` ra một IP ổn định, chia request cho các pod đang sống phía sau. Đó là lý do đoạn code ở mục 5 chỉ cần `http://inventory`.

## 7. Strangler fig: tách monolith từng phần {#strangler-fig}

Vì rủi ro của một lần release tỉ lệ với lượng thay đổi chưa từng chạy trên production, nên tách monolith theo <T>strangler fig</T>: đặt một proxy hoặc gateway trước monolith, mỗi lần dựng **một** năng lực thành service mới rồi chuyển route của nó sang; phần còn lại vẫn đi vào monolith. Lát nào lỗi thì trả riêng route đó về monolith. <T>Big-bang</T> (viết lại toàn bộ, một ngày chuyển) dồn mọi rủi ro vào ngày đó, hàng tháng không giao được gì, và trong lúc chờ monolith vẫn phải sửa ở cả hai nơi.

Với shop: lát đầu nên là thứ **ít phụ thuộc và có lý do tách rõ**, vd Notification (chỉ nghe event, không ai chờ kết quả của nó). Thường phần khó nhất là **dữ liệu**: service mới phải sở hữu bảng của nó, nên các chỗ trong monolith đang đọc thẳng bảng đó phải chuyển sang gọi API hoặc nghe event trước khi tách được.

Cơ chế chạy song song, proxy bằng YARP và cutover DB đã có chi tiết ở [Migrate .NET Framework: vì sao strangler fig](/dotnet/framework-vs-core#why-strangler) và [Migrate một app .NET Framework](/dotnet/framework-vs-core#migration-strategy); cùng nguyên lý, chỉ khác đích đến là nhiều service thay vì một app mới.

## Câu hỏi phỏng vấn {#interview}

### Khi nào nên và không nên dùng microservices? <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#when-microservices}

::: tip Trả lời nhanh
Nên khi nhiều team cần deploy độc lập trên một domain đã rõ, và có sức vận hành (CI/CD, tracing, monitoring). Không nên khi team nhỏ, domain chưa rõ, hoặc chưa trả nổi giá mạng và dữ liệu phân tán. Bước giữa an toàn là modular monolith. Xem [mục 1](#when-to-use).
:::

::: details Câu trả lời mẫu (English)
I haven't run microservices in production, so here is how I reason about it. The main reason to split is independent deployment by independent teams; separate scaling and fault isolation are secondary, and fault isolation only holds if services don't call each other in long synchronous chains. The cost is paid every day: network calls that can be slow or fail, no shared transactions, and many deployments to operate and monitor. So for a small team or a domain that is still changing, I would start with a modular monolith with clear module boundaries, and extract a module only when it has a real reason, like a team that needs its own release cycle.
:::

::: warning Bẫy & follow-up
**"Microservices để scale tốt hơn?"**

Chỉ một phần: monolith cũng chạy nhiều instance được. Scale riêng đáng giá khi một phần ngốn tài nguyên khác hẳn phần còn lại.

**"Tách ra là một service sập không ảnh hưởng service khác?"**

Chỉ khi chúng không gọi nhau theo chuỗi sync. Xem [Hãng sập 10 phút](#provider-down).
:::

### Chia ranh giới service thế nào? {#define-boundaries}

::: tip Trả lời nhanh
Theo năng lực nghiệp vụ, không theo tầng kỹ thuật: những gì thay đổi cùng nhau, dùng cùng bộ từ vựng, một team sở hữu thì ở cùng một service. Xem [mục 2](#service-boundaries) và [Bounded context](/architecture/ddd#bounded-context).
:::

::: details Câu trả lời mẫu (English)
I split by business capability, not by technical layer. A feature usually cuts through UI, logic and data, so a "UI service, logic service, data service" split means every feature touches every service. I look for things that change together, that use the same vocabulary, and that one team can own; in DDD terms that is a bounded context. A sign of a wrong boundary is two services that always have to be deployed together, or one request that bounces between two services many times.
:::

::: warning Bẫy & follow-up
**"Mỗi entity (Customer, Product, Order) một service?"**

Thường là sai: một use case cần nhiều entity nên service phải gọi nhau liên tục. Ranh giới là năng lực nghiệp vụ, không phải bảng.
:::

### Vì sao mỗi service một database? Query xuyên service thế nào? <Badge type="warning" text="hay bị hỏi" /> {#db-per-service-q}

::: tip Trả lời nhanh
Service khác đọc thẳng bảng của mình thì schema thành hợp đồng, hai bên phải deploy cùng nhau: distributed monolith. Cần dữ liệu của service khác: gọi API của chủ dữ liệu, giữ bản sao đọc nuôi bằng event, hoặc thiết kế quy trình để rule tự đúng. Xem [mục 3](#database-per-service).
:::

::: details Câu trả lời mẫu (English)
A service's tables are its private implementation. If another service reads them directly, the schema becomes a public contract, so you can't change a column without coordinating a joint deployment, and you lose independent deployment, which was the point. Separate can mean separate schemas with separate permissions on the same server. To use another service's data I have three options: call the owner's API when I need it, which is always fresh but couples me to its availability; keep a local read-only copy updated from its events, which is fast and independent but eventually consistent; or design the flow so the rule holds by itself, for example Shipping starts from a PaymentCompleted event, so it never sees an unpaid order. For cross-service queries, either compose the results from several APIs, or build a read model fed by events.
:::

::: warning Bẫy & follow-up
**"Vậy foreign key giữa Orders và Shipments?"**

Không có. `OrderId` bên Shipping chỉ là một giá trị; tính đúng do quy trình giữ.

**"Eventual consistency có chấp nhận được không?"**

Hỏi lại nghiệp vụ: bản sao trễ vài giây có làm sai điều gì quan trọng không. Nếu không chấp nhận được thì gọi API của chủ dữ liệu, hoặc hai thứ đó vốn nên ở cùng một service.
:::

### Giữa các service, gọi sync hay gửi message? Cho ví dụ. <Badge type="warning" text="gần như chắc chắn bị hỏi" /> {#sync-async-q}

::: tip Trả lời nhanh
Một câu hỏi: người gọi có cần câu trả lời để làm tiếp không. Checkout cần giá và tồn kho thì gọi sync; đơn đã đặt thì publish `OrderPlaced`, Inventory, Shipping, Notification tự làm phần mình. Khác biệt lộ ra khi có sự cố: hãng vận chuyển sập 10 phút thì sync trả lỗi về khách, queue thì chờ rồi xong. Xem [mục 4](#sync-vs-async).
:::

::: details Câu trả lời mẫu (English)
The deciding question is whether the caller needs the answer to continue. At checkout, Order needs price and stock from Inventory before it can confirm, so that is a synchronous call. Once the order is placed, Order publishes an OrderPlaced event and doesn't wait: Inventory, Shipping and Notification each do their part. The difference shows up during failures. If the shipping provider is down for ten minutes and Order calls Shipping synchronously, the error travels back to the customer and nobody retries when the provider comes back. With a queue, the customer gets "order received", the message waits, and the label is created ten minutes later. In my current job we used MSMQ for sending emails asynchronously, so I've seen the basic idea; in a microservices setup I would also need idempotent consumers and the outbox pattern, because messages can arrive more than once.
:::

::: warning Bẫy & follow-up
**"Message thì không bao giờ mất việc?"**

Chỉ khi consumer không complete message lúc lỗi và retry có delay. Retry dồn dập thì hết MaxDeliveryCount (Azure Service Bus mặc định 10) và vào [dead-letter](/architecture/messaging#dead-letter).

**"Dùng gRPC thay REST là hết vấn đề chuỗi sync?"**

Không. gRPC nhanh hơn nhưng vẫn là gọi sync, vẫn chờ. Xem [REST hay gRPC](#rest-vs-grpc).
:::

### Làm sao để một service chậm không kéo sập service khác? {#stop-cascading}

::: tip Trả lời nhanh
Service chậm giữ chân người gọi, request chờ chồng lên tới khi tài nguyên cạn. Chữa: timeout, retry có backoff (chỉ request idempotent), circuit breaker (Polly, `Microsoft.Extensions.Http.Resilience`), và chuyển sang messaging khi không cần câu trả lời. Xem [mục 5](#cascading-failure).
:::

::: details Câu trả lời mẫu (English)
A slow service is worse than a dead one, because callers keep waiting instead of failing fast. Waiting requests hold threads if the code blocks, or memory and connections if it is async, and soon even unrelated endpoints of the caller slow down. First I set a short timeout, since the HttpClient default is 100 seconds. Then retries with exponential backoff and jitter, only for idempotent requests. Then a circuit breaker, so after too many failures we fail immediately for a while instead of piling up. In .NET, `AddStandardResilienceHandler` gives all three with sensible defaults. And where the caller doesn't need the answer, I'd replace the call with a message. When I integrated external APIs, timeout and retry on the HttpClient were the first things I had to get right.
:::

::: warning Bẫy & follow-up
**"Retry càng nhiều càng chắc?"**

Không: retry dồn dập đè thêm tải lên service đang yếu, và retry POST không idempotent có thể tạo trùng. Xem [Gọi API bên ngoài](/aspnet-core/questions#httpclientfactory).
:::

### Bạn sẽ tách một monolith thế nào? {#split-monolith}

::: tip Trả lời nhanh
Không big-bang. Làm rõ ranh giới module bên trong trước, rồi strangler fig: gateway đứng trước, mỗi lần chuyển một năng lực ít phụ thuộc sang service mới, dữ liệu đi theo service. Xem [mục 7](#strangler-fig).
:::

::: details Câu trả lời mẫu (English)
I haven't split a monolith into microservices, but I have migrated a legacy ASP.NET app to ASP.NET Core, and the approach is the same: no big bang. First I make the module boundaries clear inside the monolith, so each module only talks to others through an interface and only touches its own tables. Then I put a gateway or reverse proxy like YARP in front and move one capability at a time, starting with something with few dependencies, like notifications. Each slice goes to production on its own and can be routed back to the monolith if something breaks. The hardest part is usually data: before a module can move out, other code that reads its tables directly has to switch to an API or events.
:::

::: warning Bẫy & follow-up
**"Tách theo thứ tự nào?"**

Bắt đầu từ chỗ ít phụ thuộc và có lý do tách rõ (team riêng, tải riêng), không bắt đầu từ lõi rối nhất.
:::

## Tự kiểm tra {#self-check}

::: details 1. Hai service luôn phải deploy cùng nhau. Nói lên điều gì, và có được lợi gì so với monolith không?
Ranh giới sai hoặc đang chia chung DB: thứ thay đổi cùng nhau bị cắt đôi. Đó là distributed monolith: trả giá mạng và nhiều deploy mà mất deploy độc lập, nên tệ hơn monolith.
:::

::: details 2. Nếu Order gọi sync Payment, Payment gọi sync Inventory, mỗi service sống 99,9% thời gian, thì đặt hàng sống bao nhiêu? Vì sao message giúp được?
Khoảng 99,7% (0,999³): mỗi lời gọi sync nhân thêm xác suất lỗi. Bước nào không cần câu trả lời thì đổi sang message; lúc publish chỉ cần broker sống, bên kia làm sau.
:::

::: details 3. Vì sao service chậm 30 giây nguy hiểm hơn service chết hẳn?
Chết hẳn thì kết nối bị từ chối ngay, người gọi nhận lỗi và giải phóng tài nguyên. Chậm thì người gọi chờ, request chồng lên tới khi tài nguyên dùng chung cạn, endpoint không liên quan cũng chậm.
:::

::: details 4. Shipping nhận OrderPlaced, gọi hãng lỗi, rồi ném exception ngay lập tức mỗi lần. Hãng sập 10 phút thì message ra sao?
Với `ServiceBusProcessor` để mặc định, handler ném exception thì message bị abandon và được giao lại ngay; 10 lần (MaxDeliveryCount mặc định của Azure Service Bus) có thể hết trong vài giây, rồi vào dead-letter queue. Muốn "chờ 10 phút rồi xong" phải retry có delay.
:::

::: details 5. Shipping cần biết đơn đã thanh toán chưa. Nếu Payment đang sập, cách nào trong ba cách vẫn chạy?
Bản sao đọc nuôi bằng event (đọc DB của chính Shipping) và quy trình bắt đầu từ PaymentCompleted (không cần hỏi). Gọi API của Payment thì không.
:::

::: details 6. Team 4 người, domain đang thay đổi hằng tuần, sếp muốn microservices "để scale". Bạn trả lời thế nào?
Lợi ích chính (team độc lập) không có, domain đổi liên tục thì ranh giới service dễ sai và sửa rất đắt. Scale thì monolith chạy nhiều instance được. Đề xuất modular monolith, tách khi có lý do cụ thể.
:::
