---
title: "Authentication: đăng nhập và JWT"
description: "Authentication với JWT: JWT chặn được gì, server tự phát hành hay dùng Entra ID, mỗi request từ Bearer token tới HttpContext.User, access và refresh token, hết hạn, bị trộm, lưu token ở đâu, CSRF."
---

# Authentication: đăng nhập và JWT

<T>Authentication</T> trả lời câu "**bạn là ai**": API dựng lại danh tính người gọi từ token đi kèm mỗi request. Trang này đi qua: JWT chặn được gì, ai phát hành và ký token, mỗi request token biến thành `HttpContext.User` thế nào, các loại token, rồi chuyện hết hạn, bị trộm và lưu token ở đâu.

Phần "**bạn được làm gì**" (policy, role, quyền trên từng payout) nằm ở trang riêng: [Authorization](/aspnet-core/authorization). Bức tranh cả request qua các lớp bảo mật: [Bảo mật API](/aspnet-core/api-security#flow), trang này là [bước 7](/aspnet-core/api-security#step-7) của nó.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="jzInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="jzOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="jzAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 422" role="img" aria-label="Bản đồ chủ đề authentication: sáu ô, mỗi ô một mục của trang">
<a href="#what-jwt-blocks" style="text-decoration:none"><g transform="translate(10,10)">
<rect class="box" x="0" y="0" width="228" height="196" rx="10"/>
<text x="14" y="26" font-size="14" font-weight="600">JWT chặn gì, không chặn gì</text>
<rect class="boxAcc" x="14" y="40" width="48" height="24" rx="4"/><text x="38" y="56" font-size="11" text-anchor="middle" class="accT">header</text>
<rect class="boxOk" x="66" y="40" width="80" height="24" rx="4"/><text x="106" y="56" font-size="11" text-anchor="middle" class="okT">sub, role</text>
<rect class="box" x="150" y="40" width="64" height="24" rx="4"/><text x="182" y="56" font-size="11" text-anchor="middle" font-weight="700">signature</text>
<g font-size="12"><text x="14" y="92">tự chế token</text><text x="214" y="92" text-anchor="end" class="okT" font-weight="700">chặn</text><text x="14" y="116">sửa role → Admin</text><text x="214" y="116" text-anchor="end" class="okT" font-weight="700">chặn</text><text x="14" y="140">trộm nguyên token</text><text x="214" y="140" text-anchor="end" class="badT" font-weight="700">lọt</text></g>
<text x="14" y="180" font-size="12" class="badT" font-weight="600">được ký, không mã hoá</text>
</g></a>
<a href="#issuing" style="text-decoration:none"><g transform="translate(246,10)">
<rect class="box" x="0" y="0" width="228" height="196" rx="10"/>
<text x="14" y="26" font-size="14" font-weight="600">Ai ký token</text>
<text x="60" y="52" font-size="12" text-anchor="middle" font-weight="600">HS256</text><text x="168" y="52" font-size="12" text-anchor="middle" font-weight="600">RS256</text>
<line class="lnMuted" x1="114" y1="40" x2="114" y2="160"/>
<text x="60" y="88" font-size="26" text-anchor="middle">🔑</text><text x="60" y="110" font-size="11" text-anchor="middle" class="muted">1 secret</text><text x="60" y="126" font-size="11" text-anchor="middle" class="muted">ký = kiểm</text>
<text x="146" y="88" font-size="22" text-anchor="middle">🔑</text><text x="190" y="88" font-size="22" text-anchor="middle">🔓</text>
<text x="146" y="110" font-size="11" text-anchor="middle" class="accT">private ký</text><text x="190" y="126" font-size="11" text-anchor="middle" class="okT">public kiểm</text>
<text x="14" y="180" font-size="12" class="muted">tự phát hành · Entra ID</text>
</g></a>
<a href="#per-request" style="text-decoration:none"><g transform="translate(482,10)">
<rect class="box" x="0" y="0" width="228" height="196" rx="10"/>
<text x="14" y="26" font-size="14" font-weight="600">Mỗi request: token → User</text>
<rect class="box" x="14" y="42" width="200" height="24" rx="5"/><text x="24" y="58" font-size="11" class="mono">Bearer eyJ…</text>
<line class="ln" x1="114" y1="66" x2="114" y2="82" marker-end="url(#jzInk)"/>
<rect class="boxAcc" x="14" y="86" width="200" height="24" rx="5"/><text x="114" y="102" font-size="11.5" text-anchor="middle" class="accT">JwtBearer: chữ ký · iss · aud · exp</text>
<line class="lnOk" x1="114" y1="110" x2="114" y2="126" marker-end="url(#jzOk)"/>
<rect class="boxOk" x="14" y="130" width="200" height="24" rx="5"/><text x="114" y="146" font-size="11.5" text-anchor="middle" class="mono okT">HttpContext.User</text>
<text x="14" y="180" font-size="12" class="badT" font-weight="600">token sai ≠ 401 ngay</text>
</g></a>
<a href="#token-types" style="text-decoration:none"><g transform="translate(10,216)">
<rect class="box" x="0" y="0" width="228" height="196" rx="10"/>
<text x="14" y="26" font-size="14" font-weight="600">Access · refresh · ID token</text>
<rect class="boxAcc" x="14" y="44" width="80" height="26" rx="5"/><text x="54" y="61" font-size="11.5" text-anchor="middle" class="accT">access</text><line class="ln" x1="94" y1="57" x2="140" y2="57" marker-end="url(#jzInk)"/><text x="148" y="61" font-size="12">API</text>
<rect class="boxOk" x="14" y="84" width="80" height="26" rx="5"/><text x="54" y="101" font-size="11.5" text-anchor="middle" class="okT">refresh</text><line class="ln" x1="94" y1="97" x2="140" y2="97" marker-end="url(#jzInk)"/><text x="148" y="101" font-size="12">chỉ IdP</text>
<rect class="box" x="14" y="124" width="80" height="26" rx="5"/><text x="54" y="141" font-size="11.5" text-anchor="middle">ID</text><line class="ln" x1="94" y1="137" x2="140" y2="137" marker-end="url(#jzInk)"/><text x="148" y="141" font-size="12">app client</text>
<text x="14" y="180" font-size="12" class="muted">JWT = định dạng, không phải loại</text>
</g></a>
<a href="#expiry" style="text-decoration:none"><g transform="translate(246,216)">
<rect class="box" x="0" y="0" width="228" height="196" rx="10"/>
<text x="14" y="26" font-size="14" font-weight="600">Hết hạn: đổi ngầm</text>
<rect class="boxBad" x="14" y="48" width="60" height="26" rx="5"/><text x="44" y="66" font-size="13" text-anchor="middle" class="badT" font-weight="700">401</text>
<line class="ln" x1="74" y1="61" x2="106" y2="61" marker-end="url(#jzInk)"/>
<rect class="boxOk" x="110" y="48" width="104" height="26" rx="5"/><text x="162" y="66" font-size="11.5" text-anchor="middle" class="okT">dùng refresh</text>
<path class="lnAcc" d="M162 74 C162 120, 44 120, 44 82" marker-end="url(#jzAcc)"/>
<text x="104" y="132" font-size="11.5" text-anchor="middle" class="accT">gửi lại request</text>
<text x="14" y="180" font-size="12" class="badT" font-weight="600">access token không thu hồi được</text>
</g></a>
<a href="#stolen-token" style="text-decoration:none"><g transform="translate(482,216)">
<rect class="box" x="0" y="0" width="228" height="196" rx="10"/>
<text x="14" y="26" font-size="14" font-weight="600">Bị trộm · lưu ở đâu</text>
<rect class="boxBad" x="14" y="44" width="96" height="28" rx="5"/><text x="62" y="62" font-size="11" text-anchor="middle" class="mono badT">localStorage</text>
<text x="124" y="62" font-size="12" class="badT">XSS mang đi</text>
<rect class="boxOk" x="14" y="84" width="96" height="28" rx="5"/><text x="62" y="102" font-size="11" text-anchor="middle" class="mono okT">HttpOnly</text>
<text x="124" y="102" font-size="12" class="muted">→ chống CSRF</text>
<rect class="boxOk" x="14" y="124" width="96" height="28" rx="5"/><text x="62" y="142" font-size="11" text-anchor="middle" class="okT">BFF</text>
<text x="124" y="142" font-size="12" class="muted">browser 0 token</text>
<text x="14" y="180" font-size="12" class="badT" font-weight="600">chữ ký không chống trộm</text>
</g></a>
</svg>
<p class="fig-caption">Mỗi ô một mục, bấm để tới. Chữ đỏ là bẫy hay bị hỏi. Ôn lại: nhìn ô "Mỗi request" và tự giải thích vì sao token sai không trả 401 ngay.</p>
</div>

## 1. JWT chặn được gì, không chặn được gì {#what-jwt-blocks}

<T>JWT</T> gồm 3 phần `header.payload.signature`. **Header** nói thuật toán ký, **payload** chứa thông tin user (`sub`, `role`, `exp`), **signature** là một con số được **tính** từ header + payload bằng một khoá bí mật. Server không "giải mã" signature: nó **tính lại** từ header + payload nhận được, rồi so với signature trong token.

| Kẻ tấn công thử | Kết quả | Vì sao |
|---|---|---|
| Tự chế token "tôi là user 42" | **Chặn** | Không có khoá thì không tính ra signature đúng |
| Sửa token, đổi `role` thành `Admin` | **Chặn** | Payload đổi thì signature cũ không khớp nữa |
| Trộm nguyên token của chị Lan | **Không chặn** | Token thật, chưa bị sửa, server chấp nhận |

Giống **thẻ phòng khách sạn**: lễ tân chỉ đưa thẻ cho người xuất trình giấy tờ (bước **login**, password + <T>MFA</T>). Cửa phòng chỉ kiểm "thẻ do khách sạn này làm, còn hạn", không nhìn mặt người cầm. Nên câu "**ai là thật**" được trả lời **một lần lúc login**; JWT chỉ mang kết quả đó theo mỗi request.

### Ký, không mã hoá {#signed-not-encrypted}

**Chữ ký chỉ chứng minh "không ai sửa", không giấu nội dung.** Payload chỉ là **Base64Url**: ai cầm token cũng decode được (dán vào jwt.io là đọc). Nên không bao giờ để số tài khoản, lương, dữ liệu bệnh nhân vào claim.

Ba từ hay bị lẫn, phân biệt bằng một câu hỏi: **cần khoá để đảo ngược không?**

- **Encoding** (Base64, payload JWT): không cần khoá, ai cũng đảo ngược được. Chỉ để truyền cho tiện.
- **Encryption** (TLS, TDE): cần khoá mới đảo ngược. Dùng để giữ bí mật.
- **Hashing** (bcrypt cho mật khẩu): không đảo ngược được, chỉ so sánh. Chữ ký và <T>HMAC</T> là hashing cộng khoá: chứng minh toàn vẹn và nguồn gốc, không giữ bí mật.

## 2. Ai phát hành và ký token {#issuing}

### Cách 1: server tự phát hành {#self-issued}

Một app vừa có `POST /login` vừa là API, thuật toán **HS256**:

1. Cài đặt một lần: dev sinh một **secret** ngẫu nhiên (32 byte trở lên), cất trong <T>Azure Key Vault</T> hoặc config, không để trong code.
2. `POST /login`: server so password với hash trong DB. Đúng thì tạo header `{alg: HS256}` và payload `{sub: 42, role: Approver, exp: +15 phút}`.
3. `signature = HMACSHA256(header + "." + payload, secret)`, trả token cho browser.
4. Request sau: JwtBearer **tính lại** HMAC bằng **cùng secret** đó, so với signature. Khớp thì đọc claim, lệch thì 401.

Chỉ có một secret, vì bên ký và bên kiểm là cùng một server. Nếu thêm service khác cần kiểm token, service đó cũng phải giữ secret, nghĩa là **ai kiểm được cũng ký được**.

### Cách 2: dùng nhà cung cấp {#identity-provider}

Chị Lan đăng nhập ở một <T>IdP</T> là <T k="entra id">Microsoft Entra ID</T>, theo chuẩn <T>OAuth 2.0</T> và <T>OpenID Connect</T>. Vẫn 4 bước như trên, **chỉ khác 2 chỗ**: ai làm bước login, và ai giữ khoá ký.

| Bước | Cách 1: tự phát hành | Cách 2: Entra ID |
|---|---|---|
| 1. Khoá | Dev sinh **1 secret** | Entra ID tự sinh **cặp key**: private key giữ kín, public key đăng công khai |
| 2. Login | `POST /login` của **PayoutHub** | Trang login của **Entra ID**, password không đi qua PayoutHub |
| 3. Ký | PayoutHub ký bằng secret | **Entra ID** ký bằng **private key** (<T>RS256</T>) |
| 4. Kiểm | PayoutHub tính lại bằng secret | PayoutHub kiểm bằng **public key** tải từ Entra ID |

Điểm mấu chốt của cặp key: **public key chỉ kiểm được, không ký được**. PayoutHub cầm public key thì biết token thật hay giả, nhưng nó (hay bất kỳ ai có public key) không làm ra token được. Chỉ Entra ID, nơi giữ private key, ký được.

<div class="fig">
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="jInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="jAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="jOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker></defs></svg>
<svg viewBox="0 0 400 440" style="min-width:0;max-width:460px;margin:0 auto" role="img" aria-label="Entra ID giữ private key và ký token; browser chỉ chuyển token; API tải public key từ Entra ID một lần rồi tự kiểm chữ ký"><rect class="boxAcc" x="10" y="10" width="380" height="104" rx="10"/><text x="24" y="34" font-size="15" font-weight="600">Entra ID (IdP)</text><text x="24" y="56" font-size="12"><tspan class="accT" font-weight="600">🔑 private key:</tspan> chỉ Entra ID giữ, dùng để KÝ</text><text x="24" y="78" font-size="12"><tspan class="okT" font-weight="600">🔓 public key:</tspan> công khai (JWKS), ai cũng tải</text><text x="24" y="96" font-size="12">được, nhưng chỉ dùng để KIỂM chữ ký</text><line class="ln" x1="40" y1="196" x2="40" y2="120" marker-end="url(#jInk)"/><text x="48" y="150" font-size="12"><tspan font-weight="700" font-size="14">1.</tspan> đăng nhập</text><text x="48" y="166" font-size="11" class="muted">mật khẩu + MFA</text><line class="lnAcc" x1="150" y1="118" x2="150" y2="194" marker-end="url(#jAcc)"/><text x="158" y="150" font-size="12" class="accT"><tspan font-weight="700" font-size="14">2.</tspan> token</text><text x="158" y="166" font-size="11" class="accT">đã ký</text><line class="lnOk dash" x1="300" y1="118" x2="300" y2="194" marker-end="url(#jOk)"/><text x="308" y="150" font-size="12" class="okT"><tspan font-weight="700" font-size="14">3.</tspan> tải public key</text><text x="308" y="166" font-size="11" class="muted">1 lần, rồi cache</text><rect class="box" x="10" y="200" width="172" height="134" rx="10"/><text x="24" y="224" font-size="15" font-weight="600">Browser (chị Lan)</text><text x="24" y="246" font-size="12">chỉ cầm token,</text><text x="24" y="262" font-size="12" font-weight="600">không giữ key nào</text><text x="24" y="292" font-size="12"><tspan font-weight="700" font-size="14">4.</tspan> gửi request kèm</text><text x="24" y="308" font-size="12" class="mono">Bearer token</text><line class="ln" x1="184" y1="300" x2="222" y2="300" marker-end="url(#jInk)"/><text x="14" y="360" font-size="11" class="muted">Như cầm vé: ai cầm cũng dùng</text><text x="14" y="376" font-size="11" class="muted">được (bearer = người cầm)</text><rect class="boxOk" x="226" y="200" width="164" height="230" rx="10"/><text x="240" y="224" font-size="15" font-weight="600">PayoutHub API</text><text x="240" y="246" font-size="12" class="okT" font-weight="600">mỗi request, tự kiểm:</text><g font-size="12"><text x="240" y="268">a. đọc <tspan class="mono">kid</tspan> trong token</text><text x="240" y="284">   → chọn public key</text><text x="240" y="304">b. tính lại chữ ký,</text><text x="240" y="320">   so khớp signature</text><text x="240" y="340">c. <tspan class="mono">iss</tspan> đúng tenant?</text><text x="240" y="358">d. <tspan class="mono">aud</tspan> = PayoutHub?</text><text x="240" y="376">e. chưa quá <tspan class="mono">exp</tspan>?</text></g><text x="240" y="400" font-size="11" class="muted">không gọi Entra ID</text><text x="240" y="416" font-size="11" class="badT">sai bước nào → 401</text></svg>
<p class="fig-caption">Cách 2 vẽ ra. Private key không bao giờ rời Entra ID. Browser không giữ key nào, chỉ chuyển token.</p>
</div>

PayoutHub lấy public key ở đâu (bước 3 trên hình)? `Authority` trong code bên dưới là địa chỉ Entra ID. Lúc khởi động, JwtBearer tự gọi `{Authority}/.well-known/openid-configuration`, đọc `jwks_uri`, tải bộ public key (<T>JWKS</T>) và cache lại. Entra ID có nhiều key và **xoay vòng** định kỳ, nên header token ghi <T>kid</T> để API biết dùng key nào.

```csharp
// cần package Microsoft.AspNetCore.Authentication.JwtBearer (M3)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        // IdP cấp token; API tải public key từ đây để kiểm chữ ký
        o.Authority = "https://login.microsoftonline.com/<tenant-id>/v2.0";
        // token phải dành cho đúng API này (claim aud)
        o.Audience = "api://payouthub";
    });

app.UseAuthentication();
```

::: details Vì sao private key ký được còn public key thì không?
Vì toán học một chiều: **nhân 2 số nguyên tố rất lớn thì dễ, nhưng từ tích tách ngược ra 2 số đó thì gần như không thể**. Public key chứa cái tích. Private key được tính từ 2 số nguyên tố gốc, mà chỉ người sinh key biết.

Ví dụ đồ chơi (<T>RS256</T> thật dùng số dài khoảng 617 chữ số):

```text
Sinh key:  chọn 3 và 11 → n = 33.   Public = (n = 33, e = 3).   Private = d = 7 (tính được vì biết 3 và 11)

Ký:        hash của token = 4   →   signature = 4^7 mod 33 = 16      (cần d = 7)

Kiểm:      16^3 mod 33 = 4   →   bằng hash 4 → chữ ký đúng          (chỉ cần e = 3, n = 33)
```

Số 7 từ đâu ra? Từ 2 số bí mật 3 và 11:

```text
1. φ = (3 − 1) × (11 − 1) = 20
2. Tìm d sao cho (e × d) chia 20 dư 1:   3 × 7 = 21 = 20 + 1   →   d = 7
```

Ký là lũy thừa 7, kiểm là lũy thừa 3, gộp lại là lũy thừa 21. Định lý Euler nói: với n = 33, lũy thừa (1 + bội số của 20) luôn trả về đúng số ban đầu (4^21 mod 33 = 4). Nên "ký rồi kiểm" trả lại đúng hash.

Muốn giả chữ ký thì cần d. Muốn có d thì phải có φ = 20, tức là phải tách 33 thành 3 × 11. Với 33 thì dễ, với số 617 chữ số thì máy tính hiện nay chạy hàng tỷ năm cũng chưa xong. Nên public key đăng công khai mà không lộ private key.
:::

## 3. Mỗi request: từ Bearer token tới `[Authorize]` {#per-request}

**Login chỉ xảy ra một lần. Ở mỗi request sau đó, API tự dựng lại "người gọi là ai" từ chính token, không hỏi DB hay IdP.** Hai middleware chia nhau việc đó: `UseAuthentication` biến header `Authorization` thành `HttpContext.User`, rồi `UseAuthorization` so `User` với policy của endpoint. Vì là hai bước tách rời nên có hai mã lỗi: **401** khi không dựng được danh tính, **403** khi có danh tính nhưng policy không thoả.

<div class="fig">
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="pInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="pOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="pBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>
<svg viewBox="0 0 720 490" role="img" aria-label="Request mang Bearer token: JwtBearer kiểm chữ ký, iss, aud, exp; hợp lệ thì dựng ClaimsPrincipal trên HttpContext.User, không hợp lệ thì User ẩn danh; UseAuthorization so policy Finance: chưa xác thực trả 401, thiếu role trả 403, thoả thì action chạy">
<rect class="box" x="20" y="10" width="680" height="46" rx="8"/>
<text x="34" y="30" font-size="13" font-weight="600">Client: <tspan class="mono">POST /payouts/42/approve</tspan></text>
<text x="34" y="48" font-size="11.5" class="mono muted">Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6…</text>
<line class="ln" x1="230" y1="56" x2="230" y2="76" marker-end="url(#pInk)"/>
<rect class="boxAcc" x="20" y="80" width="420" height="136" rx="8"/>
<circle class="boxAcc" cx="44" cy="104" r="13"/><text x="44" y="109" font-size="13" text-anchor="middle" font-weight="700" class="accT">1</text>
<text x="66" y="109" font-size="13" font-weight="600">UseAuthentication → JwtBearer handler</text>
<text x="40" y="136" font-size="12">a. chữ ký khớp? (public key chọn theo <tspan class="mono">kid</tspan>)</text>
<text x="40" y="156" font-size="12">b. <tspan class="mono">iss</tspan> đúng IdP? <tspan class="mono">aud</tspan> = <tspan class="mono">api://payouthub</tspan>?</text>
<text x="40" y="176" font-size="12">c. <tspan class="mono">exp</tspan> chưa qua? (dung sai ClockSkew, mặc định 5 phút)</text>
<text x="40" y="202" font-size="11.5" class="muted">chỉ dùng key đã cache và đồng hồ: không gọi DB, không gọi IdP</text>
<rect class="box dash" x="480" y="80" width="220" height="136" rx="8"/>
<text x="494" y="104" font-size="12.5" font-weight="600" class="badT">thiếu token / sai bước nào</text>
<text x="494" y="128" font-size="12">chưa trả 401 ở đây:</text>
<text x="494" y="146" font-size="12">User = ẩn danh,</text>
<text x="494" y="164" font-size="12">request đi tiếp</text>
<text x="494" y="190" font-size="11" class="muted">endpoint không có [Authorize]</text>
<text x="494" y="206" font-size="11" class="muted">vẫn chạy bình thường</text>
<line class="lnBad dash" x1="440" y1="148" x2="476" y2="148" marker-end="url(#pBad)"/>
<line class="lnOk" x1="230" y1="216" x2="230" y2="236" marker-end="url(#pOk)"/>
<text x="238" y="230" font-size="11" class="okT">hợp lệ</text>
<rect class="boxOk" x="20" y="240" width="420" height="62" rx="8"/>
<circle class="boxAcc" cx="44" cy="264" r="13"/><text x="44" y="269" font-size="13" text-anchor="middle" font-weight="700" class="accT">2</text>
<text x="66" y="269" font-size="13" font-weight="600" class="okT">HttpContext.User = ClaimsPrincipal</text>
<text x="66" y="291" font-size="11.5" class="mono">sub=42 · role=Finance · aud · exp</text>
<line class="lnBad dash" x1="590" y1="216" x2="590" y2="322" marker-end="url(#pBad)"/>
<text x="598" y="272" font-size="11" class="muted">User ẩn danh</text>
<line class="ln" x1="230" y1="302" x2="230" y2="322" marker-end="url(#pInk)"/>
<rect class="boxAcc" x="20" y="326" width="680" height="64" rx="8"/>
<circle class="boxAcc" cx="44" cy="350" r="13"/><text x="44" y="355" font-size="13" text-anchor="middle" font-weight="700" class="accT">3</text>
<text x="66" y="355" font-size="13" font-weight="600">UseAuthorization: endpoint có <tspan class="mono">[Authorize(Policy = "CanApprovePayout")]</tspan></text>
<text x="66" y="378" font-size="11.5" class="mono">policy "CanApprovePayout" = RequireRole("Finance"), hoặc RequireClaim(…)</text>
<line class="lnBad" x1="128" y1="390" x2="128" y2="414" marker-end="url(#pBad)"/>
<line class="lnBad" x1="360" y1="390" x2="360" y2="414" marker-end="url(#pBad)"/>
<line class="lnOk" x1="592" y1="390" x2="592" y2="414" marker-end="url(#pOk)"/>
<rect class="boxBad" x="20" y="418" width="216" height="64" rx="8"/>
<text x="34" y="439" font-size="12.5" font-weight="600" class="badT">chưa xác thực</text>
<text x="34" y="457" font-size="12">Challenge → <tspan font-weight="700">401</tspan></text>
<text x="34" y="474" font-size="10.5" class="mono">WWW-Authenticate: Bearer</text>
<rect class="boxBad" x="252" y="418" width="216" height="64" rx="8"/>
<text x="266" y="439" font-size="12.5" font-weight="600" class="badT">xác thực rồi, thiếu role</text>
<text x="266" y="457" font-size="12">Forbid → <tspan font-weight="700">403</tspan></text>
<text x="266" y="474" font-size="11" class="muted">gửi lại cùng token vẫn 403</text>
<rect class="boxOk" x="484" y="418" width="216" height="64" rx="8"/>
<text x="498" y="439" font-size="12.5" font-weight="600" class="okT">thoả policy</text>
<text x="498" y="457" font-size="12">action <tspan class="mono">Approve</tspan> chạy</text>
<text x="498" y="474" font-size="11" class="muted">đọc người gọi qua <tspan class="mono">User</tspan></text>
</svg>
<p class="fig-caption">Tổng quan ba bước, chi tiết từng bước ngay bên dưới. Tự hỏi: token hết hạn gọi vào <code>/health</code> (không có <code>[Authorize]</code>) thì nhận gì? Gọi vào <code>Approve</code> thì sao?</p>
</div>

<FlowStep :n="1" title="JwtBearer kiểm token" layer="ASP.NET Core" icon="jwt">

**JwtBearer chỉ tin những gì nó tự kiểm được bằng toán và đồng hồ.** Token được ký nên sửa một byte là chữ ký không khớp ([mục 1](#what-jwt-blocks)). Handler kiểm theo thứ tự:

- **Chữ ký**: tính lại bằng public key lấy từ <T>JWKS</T> theo <T>kid</T> ([cách 2](#identity-provider)), hoặc bằng secret chung nếu tự phát hành HS256.
- **`iss`** (ai cấp) và **`aud`** (token dành cho API nào): token Entra ID cấp cho một API khác cũng có chữ ký đúng, chỉ `aud` mới chặn được nó.
- **`exp`** (và `nbf` nếu có): so với giờ server, cho lệch thêm <T k="clock skew">ClockSkew</T>, **mặc định 5 phút**. Token "hết hạn" lúc 10:00 vẫn được nhận tới 10:05; ai test "hết hạn sau 1 phút" sẽ thấy token sống 6 phút.

Các kiểm tra này **bật mặc định** trong `TokenValidationParameters` (`ValidateIssuer`, `ValidateAudience`, `ValidateLifetime` đều `true`). Tắt `ValidateAudience` cho "chạy được" là lỗi bảo mật hay gặp.

Thiếu header hoặc sai một bước thì handler **không trả 401 ngay**: nó ghi log lý do (category `Microsoft.AspNetCore.Authentication`, mức Information) và để `User` ẩn danh. Lý do: middleware này chạy cho **mọi** request, kể cả endpoint không cần đăng nhập như `/health`; quyết định chặn thuộc về bước 3.

</FlowStep>

<FlowStep :n="2" title="Claim thành HttpContext.User" layer="ASP.NET Core" icon="principal">

**Token hợp lệ thì mỗi claim trong payload thành một `Claim` trong một <T>ClaimsPrincipal</T>, gán vào `HttpContext.User`.** Từ đây code chỉ đọc `User`, không đọc token nữa: `User.IsInRole("Finance")`, `User.FindFirstValue(...)`, và policy ở bước 3.

::: warning Bẫy: role có trong token mà vẫn 403
Mặc định `MapInboundClaims = true`: JwtBearer **đổi tên** claim ngắn sang tên dài kiểu .NET Framework, vd `role`/`roles` thành `ClaimTypes.Role`, `sub` thành `ClaimTypes.NameIdentifier`. Vì `RequireRole` đọc claim có type bằng `RoleClaimType` (mặc định chính là `ClaimTypes.Role`), nên ở cấu hình mặc định role vẫn khớp, nhưng `User.FindFirst("sub")` lại ra `null`.

Nhiều team tắt `MapInboundClaims = false` để giữ tên gốc. Khi đó claim role mang type `role` (hoặc `roles` với Entra ID), không khớp `RoleClaimType` mặc định, và `RequireRole("Finance")` trả **403 dù token có role**. Sửa bằng `TokenValidationParameters.RoleClaimType = "roles"` (đúng tên claim IdP của bạn dùng).
:::

</FlowStep>

<FlowStep :n="3" title="Authorization quyết 401 hay 403" layer="ASP.NET Core" icon="verdict">

**Authentication chỉ dựng (hoặc không dựng được) danh tính; mã lỗi do authorization chọn, dựa trên đúng một câu hỏi: `User` đã xác thực chưa.** Endpoint có `[Authorize]` mà `User` ẩn danh → authorization gọi lại JwtBearer để *challenge* → **401** kèm `WWW-Authenticate: Bearer` (token sai thì thêm `error="invalid_token"`, vd đã hết hạn). Đã xác thực mà policy không thoả → *forbid* → **403**.

Vì bước này đọc `User` do bước 1 dựng, `UseAuthentication` phải đứng **trước** `UseAuthorization`. Policy được ghép và đánh giá thế nào (requirement, handler, nhiều `[Authorize]` là AND hay OR): [Authorization: luồng một request](/aspnet-core/authorization#flow).

</FlowStep>

### Code {#per-request-code}

PayoutHub hiện chưa cài authentication: cần package `Microsoft.AspNetCore.Authentication.JwtBearer` (M3). Cấu hình `Auth:Authority` là địa chỉ IdP, vd `https://login.microsoftonline.com/<tenant-id>/v2.0`.

::: code-group

```csharp [Program.cs]
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.Authority = builder.Configuration["Auth:Authority"];   // iss và public key (JWKS) lấy từ đây
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidAudience = "api://payouthub",                    // aud phải là API này
            ClockSkew = TimeSpan.FromMinutes(1),                  // mặc định 5 phút
            // ValidateIssuer / ValidateAudience / ValidateLifetime mặc định true: đừng tắt
        };
    });

builder.Services.AddAuthorization(o =>
{
    o.AddPolicy("CanApprovePayout", p => p.RequireRole("Finance"));
    // theo claim: o.AddPolicy("FinanceDept", p => p.RequireClaim("department", "finance"));
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseAuthentication();   // header Authorization → HttpContext.User
app.UseAuthorization();    // User + policy → cho qua, 401 hoặc 403
app.MapControllers();

app.Run();
```

```csharp [PayoutsController.cs]
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayoutHub.Core;

namespace PayoutHub.Api.Controllers;

[ApiController]
[Route("payouts")]
[Authorize(Policy = "CanApprovePayout")]                  // mọi action: phải có role Finance
public class PayoutsController(IPayoutService payouts) : ControllerBase
{
    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, CancellationToken ct)
    {
        // Tới được đây: token hợp lệ VÀ có role Finance
        var approverId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;   // "sub", đã bị map tên
        await payouts.ApproveAsync(id, approverId, ct);
        return NoContent();
    }
}
```

:::

### Stateless: nhanh, nhưng không thu hồi được {#stateless}

**Vì bước 1 chỉ cần key đã cache và đồng hồ, mỗi instance API tự kiểm token mà không gọi ai.** Thêm instance không cần chia sẻ session, và IdP chết vài phút thì token đã cấp vẫn dùng được. Cũng vì không tra cứu gì, token của user vừa bị khoá **vẫn hợp lệ tới `exp`**. Cách xử lý chuẩn là access token sống ngắn cộng refresh token thu hồi được ([mục 5](#expiry)). Cần khoá ngay lập tức thì phải thêm một lần tra cứu mỗi request (denylist theo `jti`, hoặc kiểm trạng thái user trong DB), tức là đổi lại một phần tính stateless.

## 4. Access token, refresh token, ID token {#token-types}

**Token** là tên chung. **JWT** là một **định dạng** (cách viết token). **Access token**, **refresh token**, **ID token** là ba **công dụng**:

| | Dùng để | Gửi tới | Sống | Định dạng thường gặp |
|---|---|---|---|---|
| **Access token** | Gọi API, gửi kèm mỗi request | API | Ngắn: 15–60 phút (Entra ID mặc định 60–90) | JWT, API tự kiểm chữ ký |
| <T>Refresh token</T> | Đổi lấy access token mới | **Chỉ** IdP hoặc auth server | Dài: vài giờ tới 90 ngày | Chuỗi ngẫu nhiên (opaque), server lưu trong DB |
| **ID token** | Cho app client biết ai vừa đăng nhập (<T>OpenID Connect</T>) | App client | Ngắn | JWT, **không** gửi tới API |

Nên "JWT có phải token không?": có, JWT là một loại token. Access token **thường** là JWT, nhưng hai từ không đồng nghĩa.

## 5. Token hết hạn thì xử lý thế nào {#expiry}

User **không** phải đăng nhập lại mỗi 15 phút. Access token hết hạn thì client tự đổi ngầm, user không thấy gì. User chỉ phải đăng nhập lại khi **refresh token** hết hạn hoặc bị thu hồi.

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser (Angular + MSAL)
    participant A as PayoutHub API
    participant I as Entra ID / auth server
    B->>A: POST /payouts/42/approve<br/>Bearer access token (đã quá exp)
    A-->>B: 401 Unauthorized
    Note over B: interceptor bắt 401,<br/>giữ request lại
    B->>I: POST /token<br/>refresh token
    I->>I: tra refresh token trong DB
    alt refresh token còn hiệu lực
        I-->>B: access token MỚI + refresh token MỚI<br/>(refresh token cũ bị vô hiệu)
        B->>A: gửi lại request, Bearer access token mới
        A-->>B: 200 OK
    else hết hạn hoặc đã bị thu hồi
        I-->>B: 400 invalid_grant
        Note over B: chuyển sang trang login
    end
```

Bước 1–2 là token cũ bị từ chối, bước 3–7 là đổi token ngầm. Interceptor (hoặc MSAL) làm hết, code gọi API không phải biết.

Vì sao phải tách hai loại? Access token **không thu hồi được**: API chỉ kiểm chữ ký và `exp`, không hỏi ai. Vì vậy cho nó sống ngắn. Refresh token **thu hồi được**: lần nào dùng, server cũng tra DB. Khi logout, đổi mật khẩu hay phát hiện bị trộm, server xoá refresh token, và chậm nhất một vòng `exp` sau kẻ trộm mất quyền. Thêm **rotation**: mỗi lần đổi là cấp refresh token mới, cái cũ hết hiệu lực. Nếu cái cũ bị dùng lại, server biết có người trộm và thu hồi cả chuỗi.

Thư viện như MSAL còn **làm mới trước** khi access token hết hạn (đọc `exp` ngay trong token), nên phần lớn thời gian user không gặp cả bước 401.

## 6. Token bị trộm thì sao {#stolen-token}

Chữ ký không cứu được trường hợp này, vì token bị trộm là token thật. Phải giữ token và giới hạn thiệt hại: đi qua <T>TLS</T> để không bị nghe lén; `exp` ngắn để trộm được cũng chỉ dùng được một lúc; không lưu token ở chỗ script lạ đọc được (<T>XSS</T>), `localStorage` nguy hiểm hơn cookie `HttpOnly`; nâng cao thì gắn token với key riêng của client (DPoP, mTLS) để trộm token thôi chưa đủ.

### Lưu token ở đâu {#token-storage}

Không phải client nào cũng cầm cả 2 token. SPA kiểu Angular + MSAL thì cầm. Kiểu <T>BFF</T> thì browser **không cầm token nào**. Trong browser có 5 chỗ:

| Chỗ | JavaScript đọc được? | <T>XSS</T> lấy token mang đi được? | Ghi chú |
|---|---|---|---|
| `localStorage` | Có | **Có** | Còn sau khi đóng tab. Tệ nhất cho refresh token |
| `sessionStorage` | Có | **Có** | Mất khi đóng tab. MSAL mặc định dùng |
| Biến trong RAM | Có | Khó hơn | Reload trang là mất, phải xin token lại |
| Cookie `HttpOnly; Secure` | **Không** | Không | Browser tự gửi kèm, nên phải chống <T>CSRF</T> (`SameSite` + anti-forgery token) |
| <T>BFF</T> | Không có token | Không | Browser chỉ có cookie session. BFF là một server ASP.NET Core nhỏ cùng domain, giữ cả 2 token, tự gắn token khi gọi API và tự refresh |

```mermaid
flowchart LR
    B["Browser: chỉ có cookie"] -- "cookie HttpOnly" --> F["BFF giữ 2 token"]
    F -- "Bearer access token" --> A["PayoutHub API"]
    F <-- "login, refresh" --> I["Entra ID"]
```

Chọn theo loại app:

- **App y tế, tài chính** (ASW, PayoutHub): BFF. Không nhất thiết là hệ thống riêng: thường chính app ASP.NET Core phục vụ file Angular kiêm luôn BFF, dùng <T>YARP</T> chuyển request sang API. BFF dùng cookie nên vẫn phải [chống CSRF](#csrf).
- **SPA bình thường**: access token trong RAM, refresh token trong cookie `HttpOnly` giới hạn `Path=/auth/refresh`.
- **Mobile**: Keychain (iOS), Keystore (Android).
- **Service gọi service**: không có refresh token. Dùng client credentials với secret trong <T>Azure Key Vault</T>, hoặc <T>managed identity</T> để khỏi cần secret.

Không chỗ nào trong browser an toàn tuyệt đối trước XSS: khi trang đang mở, script độc vẫn gọi API được dưới tên user. Cookie `HttpOnly` và BFF chỉ ngăn script **mang token đi dùng ở chỗ khác, sau này**. Vẫn phải chặn XSS từ gốc bằng <T>output encoding</T> và <T>CSP</T>.

### Chống CSRF khi dùng cookie {#csrf}

Cookie `HttpOnly` và BFF chặn được XSS lấy token, nhưng đổi lại mở ra <T>CSRF</T>: **browser tự gắn cookie** vào mọi request tới domain của nó, kể cả request do trang khác khởi tạo.

```text
Chị Lan đang đăng nhập PayoutHub, mở thêm tab evil.com. Trang đó có form ẩn tự submit:

   <form method="POST" action="https://payouthub.com/payouts/42/approve">

browser gửi request → TỰ GẮN cookie của payouthub.com → server thấy cookie hợp lệ → duyệt tiền
```

Kẻ tấn công không đọc được cookie hay response, chỉ **mượn browser** của chị Lan để gửi lệnh. Bearer token trong header thì không bị, vì browser không tự gắn header và evil.com không đọc được token. Hai hàng rào, dùng cả hai:

**1. `SameSite` trên cookie**: browser có gửi cookie khi request đến từ site khác không.

| Giá trị | Request từ site khác | Ghi chú |
|---|---|---|
| `Strict` | Không bao giờ gửi cookie | Chặn chắt nhất; bấm link từ email vào thì chưa thấy đăng nhập |
| `Lax` | Chỉ gửi khi user bấm link (GET chuyển trang) | Mặc định của browser hiện đại. **Không** gửi với POST hay `fetch` từ site khác |
| `None` | Luôn gửi (bắt buộc kèm `Secure`) | Không có bảo vệ |

Chưa đủ vì "site" tính theo domain gốc: subdomain bị chiếm (vd `blog.payouthub.com`) vẫn là cùng site, và browser cũ có thể không hỗ trợ.

**2. Anti-forgery token**: một con số ngẫu nhiên mà request thay đổi dữ liệu phải gửi lại trong **header**.

```text
1. Server set cookie XSRF-TOKEN=abc123      (KHÔNG HttpOnly, để JavaScript đọc được)
2. Angular HttpClient tự đọc cookie, gắn header X-XSRF-TOKEN: abc123 vào POST/PUT/DELETE
3. Server so header với token nó đã phát → khớp thì cho qua

evil.com không đọc được cookie của payouthub.com (same-origin policy)
→ không biết abc123 → không gắn được header → 400
```

```csharp
builder.Services.AddAntiforgery(o => o.HeaderName = "X-XSRF-TOKEN");

// Controller: kiểm token cho mọi POST/PUT/PATCH/DELETE (GET, HEAD, OPTIONS được bỏ qua)
builder.Services.AddControllers(o => o.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()));

// Angular gọi endpoint này sau khi login để nhận cookie XSRF-TOKEN
app.MapGet("/antiforgery/token", (IAntiforgery af, HttpContext ctx) =>
{
    var tokens = af.GetAndStoreTokens(ctx);

    ctx.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!,
        new CookieOptions { HttpOnly = false, Secure = true, SameSite = SameSiteMode.Strict });

    return Results.NoContent();
});
```

Phía Angular gần như không phải code: `HttpClient` mặc định đọc cookie `XSRF-TOKEN` và gửi header `X-XSRF-TOKEN`.

Thêm một quy tắc: **không dùng GET để thay đổi dữ liệu**, vì `SameSite=Lax` vẫn gửi cookie với GET chuyển trang.

::: details evil.com tự đọc XSRF-TOKEN rồi gắn vào thì sao?
Không làm được, vì browser chặn cả hai việc:

- **Đọc**: JavaScript trên evil.com chỉ thấy cookie của evil.com. Gọi `fetch` tới payouthub.com để xin token thì request đi được, nhưng browser không cho đọc response (<T>CORS</T>).
- **Gắn header**: `<form>` không thêm header được. `fetch` có header lạ thì browser gửi preflight trước, server không cho origin evil.com, request thật bị huỷ.

ASP.NET Core còn phát **một cặp** giá trị (một trong cookie `HttpOnly` riêng, một là `XSRF-TOKEN`) gắn với user đang đăng nhập, nên token kẻ tấn công lấy từ tài khoản của hắn không khớp với cookie của chị Lan.

Hàng rào này **thủng** khi: có <T>XSS</T> trên chính payouthub.com (script chạy trong origin của mình, đọc được token), hoặc CORS cấu hình sai như `SetIsOriginAllowed(_ => true)` + `AllowCredentials()` (evil.com gọi kèm cookie và đọc được response).
:::

## Câu hỏi phỏng vấn {#interview}

### Đi từ lúc login tới lúc `[Authorize]` cho qua: chuyện gì xảy ra? <Badge type="warning" text="hay bị hỏi" /> {#login-to-authorize}

::: tip Trả lời nhanh
Login chỉ để lấy token. Mỗi request sau: client gửi `Authorization: Bearer <token>`; `UseAuthentication` chạy JwtBearer kiểm chữ ký, `iss`, `aud`, `exp` (dung sai ClockSkew mặc định 5 phút) rồi dựng `ClaimsPrincipal` trên `HttpContext.User`; `UseAuthorization` đánh giá policy của endpoint, vd `RequireRole("Finance")`. Thiếu hoặc sai token → 401 (challenge), token đúng nhưng thiếu role → 403 (forbid). Xem [mỗi request](#per-request), [bước 3](#step-3), cách policy được đánh giá: [Authorization](/aspnet-core/authorization#flow).
:::

::: details Câu trả lời mẫu (English)
- Login only gets the token; identity is proven once, there.
- Every request: `Authorization: Bearer <JWT>`.
- `UseAuthentication` → JwtBearer validates signature (IdP public key via JWKS), issuer, audience, expiry (default clock skew 5 min).
- Valid → claims become a `ClaimsPrincipal` on `HttpContext.User`; invalid → `User` stays anonymous, no 401 yet.
- `UseAuthorization` evaluates the endpoint policy: anonymous → 401 (challenge), authenticated but not allowed → 403 (forbid).
- Stateless: scales, but can't revoke before `exp` → short-lived access token + refresh token.
:::

::: warning Bẫy & follow-up
**Dừng ở chỗ "server phát token" là thiếu nửa câu trả lời.** Câu hỏi muốn nghe phần mỗi request: ai kiểm token, kiểm những gì, `User` được dựng ở đâu, và ai quyết 401 hay 403.

**"Token sai thì JwtBearer trả 401 luôn à?"**

Không. Nó để `User` ẩn danh; endpoint không có `[Authorize]` vẫn chạy. 401 chỉ xuất hiện khi authorization cần danh tính mà không có. Xem [bước 1](#step-1).

**"Token có role Finance mà vẫn 403?"**

Thường là claim type: tắt `MapInboundClaims` thì claim tên `role`/`roles` không khớp `RoleClaimType` mặc định. Xem [bước 2](#step-2).

**"Đặt hạn 1 phút mà token sống tới 6 phút?"**

ClockSkew mặc định 5 phút. Giảm nó trong `TokenValidationParameters`.

**"User bị khoá thì token bị chặn ngay không?"**

Không, vì kiểm token là stateless: còn hiệu lực tới `exp`. Xem [stateless](#stateless).
:::

### JWT là gì? Có an toàn để chứa dữ liệu nhạy cảm không? {#jwt}

::: tip Trả lời nhanh
JWT = `header.payload.signature`. Payload là JSON chứa claim, chỉ **Base64Url encode**, ai cũng đọc được; signature chống **sửa**, không chống **đọc**. Nên: không để dữ liệu nhạy cảm trong claim, token sống ngắn vì không thu hồi được, API phải validate chữ ký, `iss`, `aud`, `exp`. Xem [JWT chặn gì](#what-jwt-blocks), [ký, không mã hoá](#signed-not-encrypted).
:::

::: details Câu trả lời mẫu (English)
- Self-contained token, three Base64Url parts: header (algorithm), payload (claims `sub`, `role`, `aud`, `exp`), signature.
- IdP signs with its private key; API validates with the public key from the authority metadata, no DB lookup per request.
- Signed, not encrypted: anyone can read the payload → never put PII in claims.
- Can't be revoked → short-lived access token + refresh token.
- API validates issuer, audience, lifetime, signature (`AddJwtBearer` with Authority + Audience).
:::

::: warning Bẫy & follow-up
**"Logout với JWT làm thế nào?"** Xoá token phía client; muốn chặn ngay ở server thì token ngắn hạn, thu hồi refresh token, hoặc tra danh sách khoá mỗi request (mất một phần lợi ích stateless, xem [stateless](#stateless)).

**"`alg: none`?"** Thư viện phải từ chối token không ký; luôn chỉ định thuật toán được chấp nhận.
:::

### JWT bị trộm thì sao? {#stolen-token-question}

::: tip Trả lời nhanh
JWT là bearer token: ai cầm cũng dùng được tới `exp`, chữ ký chỉ chống **giả** và **sửa**, không chống **trộm**. Nên: chỉ gửi qua TLS, access token sống ngắn, không lưu ở `localStorage` (XSS đọc được), dùng refresh token có rotation để thu hồi được, và với hệ thống nhạy cảm thì gắn token với client (DPoP, mTLS).
:::

### Access token và refresh token khác nhau thế nào? Hết hạn thì sao? {#access-vs-refresh}

::: tip Trả lời nhanh
Access token gửi tới API mỗi request, thường là JWT, sống ngắn và **không thu hồi được**. Refresh token chỉ gửi tới auth server để đổi access token mới, sống lâu, server lưu trong DB nên **thu hồi được**. Access token hết hạn thì client tự đổi ngầm bằng refresh token; user chỉ đăng nhập lại khi refresh token hết hạn hoặc bị thu hồi. Mỗi lần đổi cấp refresh token mới (rotation), token cũ bị dùng lại là dấu hiệu bị trộm.
:::

### Vì sao dùng RS256 thay vì HS256 khi có nhiều service? {#rs256-vs-hs256}

::: tip Trả lời nhanh
HS256 dùng một secret chung: service nào kiểm được token thì cũng ký được token, lộ một chỗ là lộ hết. RS256 tách ra: chỉ auth server giữ private key để ký, các service khác chỉ cần public key (tải từ JWKS) để kiểm, không giả được token.
:::

### CSRF là gì? Chặn thế nào? {#csrf-question}

::: tip Trả lời nhanh
Trang lạ khiến browser của user gửi request tới app của bạn, browser tự gắn cookie nên request được xác thực. Chỉ xảy ra khi xác thực bằng cookie, không xảy ra với Bearer token trong header. Chặn bằng: cookie `SameSite=Lax/Strict`, anti-forgery token gửi trong header (ASP.NET Core `AddAntiforgery`, Angular tự gửi `X-XSRF-TOKEN`), và không đổi dữ liệu bằng GET.
:::

### SPA nên lưu token ở đâu? {#token-storage-question}

::: tip Trả lời nhanh
Không để refresh token ở `localStorage`: XSS đọc được và mang đi. SPA thông thường: access token trong RAM, refresh token trong cookie `HttpOnly; Secure; SameSite` và chống CSRF. App nhạy cảm (y tế, tài chính): dùng BFF, browser chỉ giữ cookie session, token nằm ở server. Dù chọn cách nào vẫn phải chặn XSS bằng output encoding và CSP, vì script độc vẫn gọi API được khi trang đang mở.
:::
