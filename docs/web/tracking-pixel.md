---
title: "Tracking và tracking pixel: giao dịch này ghi công cho ai"
---

# Tracking và tracking pixel: giao dịch này ghi công cho ai

Trong performance marketing (affiliate, quảng cáo trả theo kết quả), người bán chỉ trả tiền cho đối tác khi có giao dịch. Một hệ thống tracking trả lời đúng một câu: **giao dịch này nên ghi công cho ai** (<T>attribution</T>). Nó có hai nửa: nửa **click** ghi lại việc khách đi qua link của một đối tác, nửa **conversion** nối giao dịch với định danh đã ghi ở nửa kia. Trang này đi theo đường đi đó: click redirect và cookie, <T>tracking pixel</T> và vì sao cookie bên thứ ba làm nó yếu dần, các loại tracking khác (mỗi loại là một cách khác để mang định danh qua), cách chọn đối tác được ghi công, và chống gian lận.

Liên quan: [SEO](/web/seo) (cùng nhóm web, khác mục tiêu), [Bảo mật API](/aspnet-core/api-security) cho chữ ký HMAC, [Messaging](/architecture/messaging) cho việc ghi sự kiện qua queue.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="tkInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="tkBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker><marker id="tkAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 330" role="img" aria-label="Bản đồ chủ đề. Đọc 1 đến 4: khách bấm link đối tác, server tracking ghi click và set cookie rồi 302; khách mua hàng, trang cảm ơn tải pixel kèm cookie; server nối thành giao dịch; chọn closer trong hành trình nhiều điểm chạm. Bẫy đỏ: cookie bên thứ ba bị chặn, reload trang cảm ơn bắn trùng, ai cũng gọi được URL pixel, pixel bị cache. Hàng dưới: các loại tracking khác, bảo mật và chống gian lận.">
<a href="#click" style="text-decoration:none">
<rect class="box" x="20" y="40" width="150" height="100" rx="8"/>
<circle class="boxAcc" cx="36" cy="40" r="11"/><text x="36" y="44.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">1</text>
<path class="ln" d="M62 62 l0 22 l6 -6 l5 10 l4 -2 l-5 -10 l8 0 z"/>
<line class="ln" x1="88" y1="74" x2="108" y2="74" marker-end="url(#tkInk)"/>
<circle class="boxAcc" cx="125" cy="74" r="10"/><text x="125" y="78" font-size="9" text-anchor="middle" class="mono accT">302</text>
<text x="95" y="108" font-size="10" text-anchor="middle" class="mono muted">Set-Cookie: click_id</text>
<text x="95" y="128" font-size="11.5" text-anchor="middle">Click qua server</text>
</a>
<line class="ln" x1="170" y1="90" x2="191" y2="90" marker-end="url(#tkInk)"/>
<a href="#pixel" style="text-decoration:none">
<rect class="boxAcc" x="195" y="40" width="150" height="100" rx="8"/>
<circle class="boxAcc" cx="211" cy="40" r="11"/><text x="211" y="44.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">2</text>
<rect class="box" x="230" y="56" width="70" height="46" rx="4"/><line class="lnMuted" x1="238" y1="66" x2="290" y2="66"/><line class="lnMuted" x1="238" y1="74" x2="280" y2="74"/>
<rect class="boxAcc" x="285" y="88" width="6" height="6"/>
<line class="lnAcc" x1="294" y1="91" x2="320" y2="80" marker-end="url(#tkAcc)"/>
<text x="270" y="128" font-size="11.5" text-anchor="middle">Pixel ở trang cảm ơn</text>
</a>
<line class="ln" x1="345" y1="90" x2="366" y2="90" marker-end="url(#tkInk)"/>
<a href="#pixel-server" style="text-decoration:none">
<rect class="box" x="370" y="40" width="150" height="100" rx="8"/>
<circle class="boxAcc" cx="386" cy="40" r="11"/><text x="386" y="44.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">3</text>
<rect class="box" x="400" y="62" width="34" height="22" rx="3"/><text x="417" y="77" font-size="9" text-anchor="middle" class="mono">click</text>
<path class="lnOk" d="M436 73 h12"/>
<rect class="box" x="450" y="62" width="44" height="22" rx="3"/><text x="472" y="77" font-size="9" text-anchor="middle" class="mono">order</text>
<text x="445" y="104" font-size="10" text-anchor="middle" class="muted">nối qua cookie</text>
<text x="445" y="128" font-size="11.5" text-anchor="middle">Server nối giao dịch</text>
</a>
<line class="ln" x1="520" y1="90" x2="541" y2="90" marker-end="url(#tkInk)"/>
<a href="#attribution" style="text-decoration:none">
<rect class="box" x="545" y="40" width="150" height="100" rx="8"/>
<circle class="boxAcc" cx="561" cy="40" r="11"/><text x="561" y="44.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">4</text>
<line class="lnMuted" x1="570" y1="80" x2="670" y2="80"/>
<circle class="box" cx="580" cy="80" r="7"/><circle class="box" cx="615" cy="80" r="7"/><circle class="boxOk" cx="650" cy="80" r="9"/>
<text x="580" y="102" font-size="9" text-anchor="middle" class="muted">intro</text><text x="650" y="104" font-size="9" text-anchor="middle" class="okT">closer</text>
<text x="620" y="128" font-size="11.5" text-anchor="middle">Chọn ai được ghi công</text>
</a>
<a href="#cookies" style="text-decoration:none"><circle class="dotBad" cx="28" cy="158" r="4"/><text x="37" y="162" font-size="11" class="badT">cookie bên thứ ba bị chặn</text></a>
<a href="#pixel-risks" style="text-decoration:none"><circle class="dotBad" cx="203" cy="158" r="4"/><text x="212" y="162" font-size="11" class="badT">reload = bắn trùng</text></a>
<a href="#pixel-server" style="text-decoration:none"><circle class="dotBad" cx="378" cy="158" r="4"/><text x="387" y="162" font-size="11" class="badT">pixel bị cache</text></a>
<a href="#security" style="text-decoration:none"><circle class="dotBad" cx="553" cy="158" r="4"/><text x="562" y="162" font-size="11" class="badT">ai cũng gọi được pixel</text></a>
<!-- bottom -->
<a href="#other-types" style="text-decoration:none">
<rect class="box" x="20" y="200" width="330" height="105" rx="8"/>
<g font-size="10" class="mono"><rect class="box" x="40" y="218" width="80" height="22" rx="4"/><text x="80" y="233" text-anchor="middle">pixel</text>
<rect class="boxOk" x="130" y="218" width="90" height="22" rx="4"/><text x="175" y="233" text-anchor="middle">postback</text>
<rect class="box" x="230" y="218" width="100" height="22" rx="4"/><text x="280" y="233" text-anchor="middle">CNAME 1st-party</text>
<rect class="box" x="40" y="248" width="80" height="22" rx="4"/><text x="80" y="263" text-anchor="middle">coupon</text>
<rect class="box" x="130" y="248" width="90" height="22" rx="4"/><text x="175" y="263" text-anchor="middle">impression</text>
<rect class="box" x="230" y="248" width="100" height="22" rx="4"/><text x="280" y="263" text-anchor="middle">platform app</text></g>
<text x="185" y="293" font-size="11.5" text-anchor="middle">Các cách khác mang định danh qua</text>
</a>
<a href="#security" style="text-decoration:none">
<rect class="box" x="370" y="200" width="330" height="105" rx="8"/>
<path class="box" d="M410 218 l16 -6 l16 6 v16 c0 12 -8 18 -16 22 c-8 -4 -16 -10 -16 -22 z"/>
<g font-size="10.5"><text x="470" y="226">chữ ký HMAC + timestamp</text><text x="470" y="244">khử trùng theo order_id</text><text x="470" y="262">lọc bot, rate limit</text></g>
<text x="535" y="293" font-size="11.5" text-anchor="middle">Bảo mật và chống gian lận</text>
</a>
</svg>
<p class="fig-caption">Đọc 1 đến 4 theo đường đi của một khách. Tự hỏi: ở bước 2, vì sao pixel nằm trên domain khác trang bán hàng thì có thể không nhận được cookie từ bước 1? Vì sao postback (ô xanh) không bị ảnh hưởng?</p>
</div>

## 1. Vấn đề: hai nửa không biết nhau {#problem}

Khách bấm link của đối tác A trên một blog, xem shop, ba ngày sau quay lại mua. Server của shop thấy một đơn hàng, nhưng **không có gì trong đơn nói khách đến từ A**. Mọi kỹ thuật tracking đều là cách mang một **định danh** từ lúc click sang lúc mua:

| Định danh | Là gì |
|---|---|
| `click_id` | GUID sinh mỗi lần click, thường lưu trong cookie |
| `visitor_id` | GUID định danh trình duyệt, sống qua nhiều click |
| Click ID của nền tảng ads | ID click quảng cáo do nền tảng ads sinh, truyền qua URL |
| `partner_id`, `partner_code` | Báo thẳng đối tác nào, không cần click |
| Coupon | Mã giảm giá gắn với một đối tác |
| Fingerprint | Băm IP + User-Agent khi không có cookie; yếu hơn nhiều |

## 2. Click redirect: nửa đầu {#click}

**Link của đối tác không trỏ thẳng tới shop mà đi qua server tracking**, nên server có cơ hội ghi click và đặt cookie trước khi chuyển tiếp:

1. Khách bấm link → request tới domain tracking. Server kiểm chiến dịch còn hiệu lực, lọc bot, **đẩy việc ghi click vào queue** (không ghi DB ngay để trả nhanh).
2. Server sinh `click_id`, trả `Set-Cookie` (`HttpOnly; Secure; SameSite=None`, `Max-Age` bằng thời hạn ghi công, ví dụ 90 ngày = `7776000` giây) và `302` sang trang đích.

Mọi loại tracking khác đều dựa trên bước này; chúng chỉ khác ở cách mang `click_id` sang nửa sau.

## 3. Tracking pixel: nửa sau kiểu kinh điển {#pixel}

**Pixel là một request mà trình duyệt tự gửi khi trang cảm ơn tải; giá trị nằm ở query string và cookie đi kèm, không phải ở cái ảnh.**

```html
<img src="https://track.example.com/pixel.png?site=123&order=A-1001&amount=59.90&currency=USD"
     width="1" height="1" alt="">
```

Trình duyệt gửi GET tới `track.example.com`, **tự gắn cookie của domain đó** (cookie `click_id` từ bước click). Server đọc query (đơn hàng, số tiền) và cookie (đối tác nào), nối thành giao dịch được ghi công, rồi trả một ảnh trong suốt 1x1 để trình duyệt không báo lỗi.

Biến thể: **image pixel** (thẻ `<img>`, chạy cả khi tắt JS), **JS pixel** (script tạo `Image()` hoặc `fetch`, đọc được biến trang như giỏ hàng), **iframe pixel** (cách ly khỏi trang nhưng cookie bị coi là bên thứ ba), **tag manager** (bên bán không sửa code, nhưng thêm một tầng dễ lỗi), **master tag + conversion tag** (một script trên mọi trang đọc `click_id` từ URL rồi ghi cookie **first-party**, script thứ hai ở trang cảm ơn).

Pixel được chuộng vì dễ: bên bán dán một đoạn HTML, không cần dev backend.

### Vì sao pixel yếu dần: cookie bên thứ ba {#cookies}

**Trình duyệt chỉ gửi kèm cookie của domain mà request đi tới, và coi cookie là <T>third-party cookie</T> khi domain đó khác domain trên thanh địa chỉ.** Pixel của `track.example.com` nằm trong trang `shop.com` chính là trường hợp này. Safari (<T>ITP</T>) chặn loại cookie này, Firefox cô lập nó theo từng site, Chrome vẫn giữ nhưng chính sách đổi liên tục. Hệ quả suy ra trực tiếp:

- Pixel bên thứ ba có thể **không nhận được cookie click** → đơn hàng không được ghi công, và không ai thấy lỗi.
- Các cách chữa đều là **biến cookie thành first-party** (master tag ghi cookie trên domain shop, hoặc domain tracking là subdomain CNAME của shop) hoặc **bỏ hẳn cookie** (postback). Xem [các loại khác](#other-types).
- Cookie gửi chéo site cần `SameSite=None; Secure` (<T>SameSite</T>), thiếu thì trình duyệt hiện đại không gửi.

### Các rủi ro khác của pixel {#pixel-risks}

- **Ad blocker** chặn domain tracking: mất sự kiện, không biết lỗi.
- **Bắn trùng**: khách reload trang cảm ơn, bấm Back, hai tag cùng chạy. Phải khử trùng theo `order_id`.
- **Mất khi trang đóng sớm**: trình duyệt huỷ request đang dở. JS pixel dùng `navigator.sendBeacon` hoặc `fetch(..., { keepalive: true })`.
- **Không xuyên thiết bị**: click trên điện thoại, mua trên máy tính là hai visitor.
- **Dễ giả mạo**: ai cũng gọi được URL pixel với tham số tự bịa. Cần [chữ ký](#security).

### Phía server nhận pixel {#pixel-server}

**Endpoint pixel là endpoint nóng nhất hệ thống, nên chỉ validate rồi xếp hàng**, việc nặng (tìm click, tính hoa hồng) làm ở worker:

- Trả `200`, `Content-Type: image/gif` (hoặc png), ảnh 1x1, và `Cache-Control: no-store`. Trình duyệt hay CDN cache pixel thì sự kiện không bao giờ tới server.
- Kiểm `site_id` tồn tại và đang hoạt động; lạ thì 404. Cache kết quả kiểm vài phút, vì truy vấn DB mỗi request ở endpoint nóng là điểm nghẽn.
- Lọc bot trước khi ghi; bot vẫn nhận 200 để kẻ dò không biết đã bị chặn. Bỏ qua request từ công cụ preview của tag manager.
- Làm sạch input: `amount` có thể kèm ký hiệu tiền tệ, dấu phẩy, khoảng trắng; bỏ ký tự lạ rồi parse bằng `CultureInfo.InvariantCulture`.
- Ghi sự kiện qua queue để chịu được đỉnh traffic và để lỗi DB không làm vỡ trang của khách.

Pixel trả ảnh, không trả JSON, nên lỗi phải vào log, trình duyệt không nhận được thông báo nào. API server-to-server thì trả `400` kèm `{"status":"error","message":"Field 'amount' is invalid."}`.

## 4. Các loại tracking khác {#other-types}

**Mỗi loại dưới đây là một cách khác để mang định danh từ click sang conversion**, và điểm mạnh, điểm yếu của nó suy ra từ việc nó dựa vào cái gì:

| Loại | Mang định danh bằng | Mạnh | Yếu |
|---|---|---|---|
| Image pixel | cookie bên thứ ba | Dễ nhất | Bị chặn cookie, ad blocker |
| JS tag / master tag | cookie first-party do JS ghi | Qua ITP tốt hơn, đọc được dữ liệu trang | Phải dán tag, lỗi JS, ad blocker |
| <T>Postback</T> server-to-server | backend người bán lưu `click_id` rồi gửi lại | Không phụ thuộc trình duyệt, khó chặn | Người bán phải dev tích hợp |
| First-party custom domain (CNAME) | cookie first-party trên subdomain của shop | Qua hầu hết chặn | DNS + chứng chỉ cho từng người bán; ITP vẫn rút hạn cookie CNAME |
| App nền tảng thương mại điện tử | webhook đơn hàng của nền tảng | Không cần tag, tin cậy | Phụ thuộc API nền tảng; dễ đếm đôi với pixel cũ |
| Mobile (MMP postback) | click_id qua deep link | Đo được trong app | Cấu hình hai phía |
| Coupon (clickless) | mã giảm giá | Bắt traffic ngoài link | Dễ lạm dụng; cần quy tắc khớp, hạn, trạng thái đối tác |
| Impression / view-through | `visitor_id` từ lượt hiển thị | Ghi công quảng cáo hiển thị | Ưu tiên thấp nhất, dễ gian lận |
| Direct partner | `partner_id` do server đối tác gửi | Không cần click | Phải kiểm đối tác được phép; cần chữ ký |
| Network postback | POST JSON từ mạng khác | Gộp nhiều nguồn | Mỗi mạng một định dạng, cần adapter |
| Manual / import | người nhập | Sửa sai, bù dữ liệu | Phải log ai làm, vì sao |

Một bài học thực tế: site đã tích hợp app nền tảng (nền tảng tự gửi đơn) mà vẫn để pixel cũ ở trang cảm ơn thì **mỗi đơn bị ghi hai lần**. Tắt pixel, hoặc khử trùng ở bước ghi cuối.

## 5. Ai được ghi công {#attribution}

### Thứ tự tìm hành động chốt {#closing-action}

**Khi có giao dịch, hệ thống thử các định danh theo độ tin cậy giảm dần và dừng ở cái đầu tiên tìm được.** Một thứ tự hợp lý:

1. `click_id` truyền thẳng trong request (người bán chủ động gửi)
2. Click ID của nền tảng ads
3. `partner_id`, rồi `partner_code`
4. Cookie hoặc fingerprint của trình duyệt (suy luận)
5. Coupon không cần click

Lý do thứ tự: định danh người bán chủ động gửi đáng tin hơn thứ suy ra từ trình duyệt. Khi cùng có cookie và tham số URL cho cùng một thứ, cookie thắng vì URL dễ bị sửa tay.

### Hành trình nhiều điểm chạm {#touchpoints}

**Một khách có thể đi qua nhiều đối tác trước khi mua; chọn ai bằng priority trước, thời gian sau:**

- **Closer** (được trả tiền): hành động có priority cao nhất (click mạnh > click yếu kiểu nội dung khám phá > impression), cùng priority thì lấy mới nhất.
- **Introducer**: hành động sớm nhất theo thời gian, bất kể priority.
- **Influencer**: các hành động còn lại ở giữa.
- Một hành động giữ được nhiều vai (hành trình chỉ một click). Hành động hết hạn trước thời điểm giao dịch bị loại; hết hạn hết thì không ghi công.
- **Lưu toàn bộ hành trình** (bảng touchpoint) cạnh giao dịch, kể cả khi chỉ trả cho closer: sau này đổi mô hình ghi công (chia đều, theo vị trí) thì đã có dữ liệu.

## 6. Bảo mật và chống gian lận {#security}

**Vì tracking quyết định trả tiền cho ai, mọi đầu vào đều có người muốn giả.**

- **Chữ ký**: mỗi người bán có một secret riêng. Gửi giao dịch kèm `signature = HMAC-SHA256(secret, timestamp + " " + order_id)` và `timestamp`. Server tính lại, so sánh constant-time, từ chối nếu timestamp lệch quá xa. Cho bật "bắt buộc chữ ký" theo từng người bán vì người bán cũ có thể chưa tích hợp được.
- **Không bao giờ để secret trong JS** phía trình duyệt: mọi thứ trong JS đều công khai. Chữ ký chỉ dùng được cho postback từ server.
- **Khử trùng** theo `order_id` ở **bước ghi cuối**, không ở từng endpoint: pixel, postback và webhook nền tảng có thể cùng bắn một đơn.
- Lọc bot theo danh sách User-Agent và IP; rate limit theo IP và theo `site_id`; `site_id` là GUID khó đoán, không phải số tự tăng.
- Kiểm trạng thái: người bán còn hoạt động, đối tác được duyệt cho người bán đó và không bị khoá. Cửa sổ hiệu lực áp theo **từng hành động**, không theo giao dịch.

## 7. Biến thể và trade-off {#trade-offs}

- **Pixel vẫn đáng có** cho người bán nhỏ không có dev: dễ tích hợp thắng độ chính xác. Vì cookie bên thứ ba ngày càng bị chặn, đừng dựa riêng vào nó với người bán lớn.
- **Postback chính xác nhất** vì không qua trình duyệt, nhưng đẩy việc sang người bán (lưu `click_id` vào phiên khách, gọi API khi có đơn). Nó cũng là cách duy nhất vượt qua [giới hạn xuyên thiết bị](#pixel-risks) nếu người bán gửi kèm ID khách hàng của họ.
- **CNAME first-party** chữa cookie nhưng tốn vận hành (DNS, chứng chỉ cho từng khách) và ITP vẫn rút hạn cookie khi phát hiện CNAME.
- **Chế độ debug theo người bán** (log chi tiết, `console.log` trong tag, tắt mặc định) giảm hẳn ticket hỗ trợ tích hợp.

Checklist kiểm thử một loại tracking mới:

- [ ] Click rồi mua cùng trình duyệt: ghi công đúng đối tác
- [ ] Hai click của hai đối tác: closer, introducer, influencer đúng
- [ ] Click đã hết hạn
- [ ] Reload trang cảm ơn hai lần: chỉ một giao dịch
- [ ] Trình duyệt chặn third-party cookie (Safari, Firefox, ẩn danh), ad blocker bật
- [ ] Chữ ký sai, thiếu, hết hạn
- [ ] `amount` có ký hiệu tiền tệ hoặc dấu phân cách
- [ ] Bot User-Agent; người bán bị khoá hoặc đã xoá
- [ ] Coupon: khớp đúng, khớp tiền tố, hết hạn, đối tác chưa được duyệt

## Câu hỏi phỏng vấn {#interview}

### Tracking pixel hoạt động thế nào, và vì sao nó kém chính xác dần? <Badge type="warning" text="câu product" /> {#how-pixel-works}

::: tip Trả lời nhanh
Pixel là request (ảnh 1x1) trình duyệt tự gửi khi trang cảm ơn tải; server đọc **query string** (đơn hàng) và **cookie** của domain tracking (click_id) để nối giao dịch với click. Vì cookie đó là **bên thứ ba** trên trang của shop, Safari/Firefox chặn nó, nên pixel mất dần dữ liệu. Chữa bằng cookie first-party hoặc postback server-to-server. Xem [Tracking pixel](#pixel) và [cookie bên thứ ba](#cookies).
:::

::: details Câu trả lời mẫu (English)
- A pixel is just a GET the browser fires on the thank-you page; the data is the query string plus the cookies the browser attaches for the tracking domain.
- Earlier, the click went through our redirect, which set the click_id cookie.
- On the shop's page that cookie is third-party, and Safari ITP / Firefox block or partition it, so conversions go unattributed silently.
- Fixes: first-party cookies (a tag on the shop's domain, or a CNAME subdomain), or server-to-server postbacks that don't depend on the browser at all.
- Always dedupe by order id and sign server-side calls.
:::

::: warning Bẫy & follow-up
- "Ảnh 1x1 là để ẩn": ảnh không quan trọng, quan trọng là request và cookie đi kèm.
- Follow-up: "Pixel endpoint nhận 5.000 request/giây, thiết kế thế nào?" Validate + cache + đẩy queue, `no-store`, worker xử lý ([Phía server](#pixel-server)).
- Follow-up: "Làm sao chống người bán gọi pixel giả?" Không chống được trên pixel; dùng chữ ký trên postback.
:::

## Tự kiểm tra {#self-check}

1. Pixel của bạn trả `Cache-Control: max-age=3600`. Chuyện gì xảy ra với khách mua hai đơn trong một giờ?
2. Khách click trên Safari, mua trên Safari, nhưng không được ghi công. Pixel nằm ở đâu thì giải thích được chuyện này?
3. Vì sao khử trùng phải ở bước ghi cuối chứ không ở từng endpoint?
4. Khách click đối tác A (bài review) rồi đối tác B (trang coupon) rồi mua. Ai là closer, ai là introducer, và nếu click của A đã hết hạn thì sao?
5. Vì sao không thể đặt chữ ký HMAC trong pixel JS?
