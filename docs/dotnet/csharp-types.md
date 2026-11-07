---
title: "Kiểu dữ liệu C#"
---

# Kiểu dữ liệu C#: value và reference

Mọi câu "struct vs class", "string ==", "ref vs out", "const vs readonly" đều suy ra từ một điều: **gán là copy thứ nằm trong biến**. Trang này dựng hình đó trước, rồi suy ra từng câu.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="oA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker><marker id="oBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker><marker id="oMut" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path style="fill:var(--vp-c-text-3)" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 362" role="img" aria-label="Bản đồ chủ đề kiểu dữ liệu C#: struct copy dữ liệu, class copy địa chỉ, record so theo giá trị, string sửa là tạo mới, ref đưa chính biến, const readonly chốt ở các thời điểm khác nhau">
<!-- struct -->
<a href="#value-reference" style="text-decoration:none">
<rect class="box" x="6" y="6" width="228" height="170" rx="10"/>
<text x="20" y="30" font-size="13.5" font-weight="700">struct</text>
<text x="222" y="30" font-size="10" text-anchor="end" class="badT">bẫy: sửa nhầm bản copy</text>
<rect class="box" x="50" y="48" width="84" height="30" rx="5"/>
<text x="92" y="68" font-size="10.5" text-anchor="middle" class="mono">a: 100</text>
<rect class="boxAcc" x="50" y="100" width="84" height="30" rx="5"/>
<text x="92" y="120" font-size="10.5" text-anchor="middle" class="mono accT">b: 120</text>
<path class="lnAcc dash" d="M134 63 C 170 70, 170 108, 138 115" marker-end="url(#oA)"/>
<text x="168" y="92" font-size="10" class="muted">copy</text>
<line class="lnMuted" x1="20" y1="140" x2="220" y2="140"/>
<text x="120" y="162" font-size="11.5" text-anchor="middle">Gán = copy dữ liệu</text>
</a>
<!-- class -->
<a href="#value-reference" style="text-decoration:none">
<rect class="box" x="246" y="6" width="228" height="170" rx="10"/>
<text x="260" y="30" font-size="13.5" font-weight="700">class</text>
<text x="462" y="30" font-size="10" text-anchor="end" class="badT">bẫy: readonly chỉ khoá biến</text>
<rect class="box" x="262" y="48" width="58" height="30" rx="5"/>
<text x="291" y="68" font-size="10.5" text-anchor="middle" class="mono">p1 →</text>
<rect class="box" x="262" y="100" width="58" height="30" rx="5"/>
<text x="291" y="120" font-size="10.5" text-anchor="middle" class="mono">p2 →</text>
<rect class="boxAcc" x="380" y="66" width="80" height="46" rx="8"/>
<text x="420" y="86" font-size="11" text-anchor="middle" font-weight="600" class="accT">Payout</text>
<text x="420" y="102" font-size="9.5" text-anchor="middle">#42</text>
<line class="lnAcc" x1="320" y1="63" x2="376" y2="80" marker-end="url(#oA)"/>
<line class="lnAcc" x1="320" y1="115" x2="376" y2="98" marker-end="url(#oA)"/>
<line class="lnMuted" x1="260" y1="140" x2="460" y2="140"/>
<text x="360" y="162" font-size="11.5" text-anchor="middle">Gán = copy địa chỉ</text>
</a>
<!-- record -->
<a href="#record" style="text-decoration:none">
<rect class="box" x="486" y="6" width="228" height="170" rx="10"/>
<text x="500" y="30" font-size="13.5" font-weight="700">record</text>
<rect class="box" x="500" y="58" width="84" height="30" rx="5"/>
<text x="542" y="78" font-size="10" text-anchor="middle" class="mono">100 AUD</text>
<rect class="box" x="616" y="58" width="84" height="30" rx="5"/>
<text x="658" y="78" font-size="10" text-anchor="middle" class="mono">100 AUD</text>
<text x="600" y="79" font-size="13" text-anchor="middle" font-weight="700" class="accT">==</text>
<text x="600" y="120" font-size="13" text-anchor="middle" font-weight="700" class="okT">true</text>
<text x="600" y="102" font-size="9.5" text-anchor="middle" class="muted">hai object khác nhau</text>
<line class="lnMuted" x1="500" y1="140" x2="700" y2="140"/>
<text x="600" y="162" font-size="11.5" text-anchor="middle">== so theo giá trị</text>
</a>
<!-- string -->
<a href="#string" style="text-decoration:none">
<rect class="box" x="6" y="186" width="228" height="170" rx="10"/>
<text x="20" y="210" font-size="13.5" font-weight="700">string</text>
<text x="222" y="210" font-size="10" text-anchor="end" class="badT">bẫy: += trong vòng lặp</text>
<rect class="box" x="24" y="244" width="58" height="30" rx="5"/>
<text x="53" y="264" font-size="11" text-anchor="middle" class="mono">"abc"</text>
<line class="lnAcc" x1="82" y1="259" x2="152" y2="259" marker-end="url(#oA)"/>
<text x="117" y="250" font-size="9.5" text-anchor="middle" class="mono accT">ToUpper()</text>
<rect class="boxAcc" x="156" y="244" width="58" height="30" rx="5"/>
<text x="185" y="264" font-size="11" text-anchor="middle" class="mono accT">"ABC"</text>
<text x="53" y="292" font-size="9.5" text-anchor="middle" class="muted">giữ nguyên</text>
<text x="185" y="292" font-size="9.5" text-anchor="middle" class="muted">object mới</text>
<line class="lnMuted" x1="20" y1="320" x2="220" y2="320"/>
<text x="120" y="342" font-size="11.5" text-anchor="middle">Sửa = tạo string mới</text>
</a>
<!-- ref -->
<a href="#ref-params" style="text-decoration:none">
<rect class="box" x="246" y="186" width="228" height="170" rx="10"/>
<text x="260" y="210" font-size="13.5" font-weight="700">ref / out / in</text>
<rect class="box" x="370" y="226" width="92" height="82" rx="8"/>
<text x="416" y="240" font-size="9.5" text-anchor="middle" class="muted">method</text>
<rect class="box" x="262" y="248" width="40" height="24" rx="4"/>
<text x="282" y="264" font-size="10.5" text-anchor="middle" class="mono">a</text>
<line class="ln dash" x1="302" y1="260" x2="384" y2="260" marker-end="url(#oMut)"/>
<rect class="box dash" x="388" y="249" width="56" height="22" rx="4"/>
<text x="416" y="264" font-size="9.5" text-anchor="middle" class="muted">bản copy</text>
<text x="336" y="254" font-size="9" text-anchor="middle" class="muted">f(a)</text>
<rect class="boxAcc" x="262" y="280" width="40" height="24" rx="4"/>
<text x="282" y="296" font-size="10.5" text-anchor="middle" class="mono accT">a</text>
<line class="lnAcc" x1="302" y1="292" x2="384" y2="292" marker-end="url(#oA)"/>
<text x="336" y="286" font-size="9" text-anchor="middle" class="accT">f(ref a)</text>
<text x="416" y="296" font-size="9.5" text-anchor="middle" class="accT">chính a</text>
<line class="lnMuted" x1="260" y1="320" x2="460" y2="320"/>
<text x="360" y="342" font-size="11.5" text-anchor="middle">Đưa chính biến vào</text>
</a>
<!-- const / readonly -->
<a href="#when-assigned" style="text-decoration:none">
<rect class="box" x="486" y="186" width="228" height="170" rx="10"/>
<text x="500" y="210" font-size="13.5" font-weight="700">Chốt lúc nào</text>
<line class="ln" x1="500" y1="264" x2="700" y2="264" marker-end="url(#oMut)"/>
<circle class="boxAcc" cx="522" cy="264" r="5"/>
<circle class="boxAcc" cx="600" cy="264" r="5"/>
<circle class="boxAcc" cx="676" cy="264" r="5"/>
<text x="522" y="250" font-size="10" text-anchor="middle" class="mono accT">const</text>
<text x="600" y="250" font-size="10" text-anchor="middle" class="mono accT">static readonly</text>
<text x="676" y="250" font-size="10" text-anchor="middle" class="mono accT">readonly</text>
<text x="522" y="282" font-size="9.5" text-anchor="middle" class="muted">compile</text>
<text x="600" y="282" font-size="9.5" text-anchor="middle" class="muted">dùng type</text>
<text x="676" y="282" font-size="9.5" text-anchor="middle" class="muted">mỗi new</text>
<text x="600" y="306" font-size="10" text-anchor="middle" class="badT">bẫy: const bị chép sang DLL gọi</text>
<line class="lnMuted" x1="500" y1="320" x2="700" y2="320"/>
<text x="600" y="342" font-size="11.5" text-anchor="middle">Compile, lần đầu dùng, hay new</text>
</a>
</svg>
<p class="fig-caption">Nhìn từng ô, tự nói lại vì sao; chữ đỏ là bẫy hay bị hỏi. Quên ô nào thì bấm vào ô đó.</p>
</div>

## 1. Gán là copy biến {#value-reference}

**Biến kiểu value (struct, `int`, `decimal`) chứa chính dữ liệu; biến kiểu reference (class, `string`) chứa địa chỉ của object. Phép gán và truyền tham số copy thứ nằm trong biến.** Value thì copy cả dữ liệu, reference thì copy địa chỉ, hai biến cùng trỏ một object.

<div class="fig">
<svg viewBox="0 0 720 226" role="img" aria-label="Bên trái struct Money: b = a copy cả dữ liệu, sửa b thì a vẫn 100. Bên phải class Payout: p2 = p1 copy địa chỉ, hai biến cùng trỏ một object, sửa qua p2 thì p1 thấy ngay">
<text x="180" y="22" font-size="12.5" font-weight="600" text-anchor="middle">struct Money: biến chứa dữ liệu</text>
<text x="540" y="22" font-size="12.5" font-weight="600" text-anchor="middle">class Payout: biến chứa địa chỉ</text>
<text x="40" y="50" font-size="10.5" class="mono">Money b = a;</text>
<rect class="box" x="40" y="66" width="140" height="38" rx="6"/>
<text x="56" y="90" font-size="11" class="mono">a</text>
<rect class="box" x="76" y="72" width="96" height="26" rx="4"/>
<text x="124" y="89" font-size="10.5" text-anchor="middle">100 AUD</text>
<rect class="box" x="40" y="146" width="140" height="38" rx="6"/>
<text x="56" y="170" font-size="11" class="mono">b</text>
<rect class="boxAcc" x="76" y="152" width="96" height="26" rx="4"/>
<text x="124" y="169" font-size="10.5" text-anchor="middle" class="accT">120 AUD</text>
<path class="lnAcc dash" d="M180 85 C 230 95, 230 155, 184 165" marker-end="url(#oA)"/>
<text x="226" y="128" font-size="10" class="muted">copy dữ liệu</text>
<text x="110" y="208" font-size="10.5" text-anchor="middle">sửa b, a vẫn 100</text>
<line class="lnMuted" x1="360" y1="12" x2="360" y2="214"/>
<text x="392" y="50" font-size="10.5" class="mono">Payout p2 = p1;</text>
<rect class="box" x="392" y="66" width="120" height="38" rx="6"/>
<text x="408" y="90" font-size="11" class="mono">p1</text>
<rect class="box" x="432" y="72" width="72" height="26" rx="4"/>
<text x="468" y="89" font-size="10.5" text-anchor="middle" class="mono">→ #42</text>
<rect class="box" x="392" y="146" width="120" height="38" rx="6"/>
<text x="408" y="170" font-size="11" class="mono">p2</text>
<rect class="box" x="432" y="152" width="72" height="26" rx="4"/>
<text x="468" y="169" font-size="10.5" text-anchor="middle" class="mono">→ #42</text>
<rect class="boxAcc" x="590" y="98" width="116" height="56" rx="8"/>
<text x="648" y="120" font-size="11" text-anchor="middle" font-weight="600" class="accT">Payout #42</text>
<text x="648" y="140" font-size="10" text-anchor="middle">Status: Paid</text>
<line class="lnAcc" x1="504" y1="85" x2="586" y2="114" marker-end="url(#oA)"/>
<line class="lnAcc" x1="504" y1="165" x2="586" y2="140" marker-end="url(#oA)"/>
<text x="540" y="208" font-size="10.5" text-anchor="middle">sửa qua p2, p1 thấy ngay</text>
</svg>
<p class="fig-caption"><code>b = a</code> copy cái gì ở mỗi bên? <code>readonly</code> trên <code>p1</code> khoá cái gì? <code>ref</code> đưa cái gì vào method?</p>
</div>

Hai hệ quả trực tiếp:

- **struct**: gán là copy. Vì thế struct có thể sửa (mutable) rất bẫy: `list[0].X = 5` không compile với `List<Point>`, còn sửa qua biến tạm chỉ sửa bản copy. Struct nên là `readonly struct`, nhỏ (khoảng 16 byte trở xuống), tạo nhiều, ít bị <T>boxing</T>.
- **class**: gán là copy địa chỉ, sửa qua biến nào cũng thấy. Truyền object vào method rồi sửa property thì bên ngoài thấy; nhưng gán `param = new Payout(...)` trong method chỉ đổi bản copy địa chỉ, bên ngoài không đổi.
- **`readonly`** khoá **biến**, không khoá object biến trỏ tới: `readonly List<int>` vẫn `Add` được. Muốn khoá nội dung thì dùng `IReadOnlyList` hoặc immutable collection.

### Record: class so sánh theo giá trị {#record}

**Record (C# 9) vẫn là class, nhưng compiler sinh sẵn `Equals`/`==` so từng property và `with` để tạo bản sao.** Hợp với <T>DTO</T> và <T>value object</T>; `record struct` (C# 10) là bản value type.

```csharp
public record Money(decimal Amount, string Currency);

var a = new Money(100, "AUD");
var b = new Money(100, "AUD");
a == b;                         // true: so sánh theo giá trị
var c = a with { Amount = 120 }; // bản sao mới, a không đổi
```

`==` và `Equals` mặc định so địa chỉ với class; string, record và kiểu tự override thì so nội dung. `ReferenceEquals` luôn so địa chỉ. Tự override `Equals` thì phải override cả `GetHashCode`, vì Dictionary tìm theo hash trước rồi mới gọi `Equals`.

### String: reference nhưng không sửa tại chỗ {#string}

**String là reference type nhưng immutable: mọi phép "sửa" (`Replace`, `ToUpper`, `+`) tạo string mới, bản cũ giữ nguyên.** Nó là reference vì độ dài thay đổi, copy cả nội dung mỗi lần gán thì quá đắt; còn overload `==` để so nội dung nên dùng giống value type.

- Vì không ai sửa được, string an toàn khi dùng chung giữa các thread và làm key Dictionary.
- Vì mỗi lần `+=` tạo một bản mới, ghép string trong vòng lặp rất tốn: dùng `StringBuilder` hoặc `string.Join`.

### ref, out, in: đưa chính biến vào method {#ref-params}

**Thay vì copy thứ nằm trong biến, `ref`/`out`/`in` đưa chính biến vào method.** `ref` phải gán trước, method đọc và sửa được; `out` method bắt buộc gán (như `int.TryParse`); `in` chỉ đọc, để truyền struct lớn mà không copy.

## 2. Giá trị được chốt lúc nào: const, readonly, static readonly {#when-assigned}

**Ba từ khoá khác nhau ở thời điểm giá trị được chốt.** `const` chốt lúc compile: compiler chép thẳng giá trị vào mọi chỗ dùng, nên chỉ cho kiểu primitive và string. `static readonly` chốt một lần cho cả type lúc runtime, ngay trước lần đầu type được dùng (chạy static initializer rồi static constructor), dùng được mọi kiểu. `readonly` chốt mỗi lần `new` object, trong initializer hoặc constructor.

Vì `const` bị chép vào <T>assembly</T> gọi nó, đổi `const` trong một library mà assembly gọi không build lại thì vẫn dùng giá trị cũ; giá trị có thể đổi theo version thì dùng `static readonly`. Vì static sống theo process, nó dùng chung cho mọi request của mọi user; Web Forms recycle <T>app pool</T> thì static khởi tạo lại, nhiều server thì mỗi server một bản.


## Câu hỏi phỏng vấn {#interview}

### `const` vs `readonly` vs `static readonly` {#const-readonly}

::: tip Trả lời nhanh
`const` chốt lúc compile, được chép vào chỗ dùng, chỉ primitive và string. `readonly` chốt trong constructor, mỗi object một giá trị. `static readonly` chốt một lần cho cả type lúc runtime, mọi kiểu. Xem [giá trị được gán lúc nào](#when-assigned).
:::

::: details Câu trả lời mẫu (English)
They differ in when the value is fixed. A const is a compile-time constant: the compiler copies the value into every place that uses it, so it only works for primitives and strings. A readonly field is set once per instance, in the initializer or the constructor. A static readonly field is set once per type at runtime, before the type is first used, and can hold any type. One practical consequence: if a library changes a public const, callers keep the old value until they're recompiled, so for values that may change between versions I use static readonly.
:::

::: warning Bẫy & follow-up
**"`readonly List<int>` có thêm phần tử được không?"** Được. `readonly` khoá biến, không khoá object. Xem [gán là copy biến](#value-reference).

**"Static constructor ném exception thì sao?"** Xem [Hỏi đáp](#static-ctor-exception).
:::

### `struct` vs `class` vs `record` {#struct-class-record}

::: tip Trả lời nhanh
`struct` là <T>value type</T>: biến chứa dữ liệu, gán là copy. `class` là <T>reference type</T>: biến chứa địa chỉ, gán là copy địa chỉ. `record` là class có so sánh theo giá trị và `with`; `record struct` là bản value type. Xem [gán là copy biến](#value-reference).
:::

::: details Câu trả lời mẫu (English)
A struct is a value type: the variable holds the data itself, so assigning or passing it copies the whole value. A class is a reference type: the variable holds a reference, so two variables can point to the same object. A record is a class where the compiler generates value-based equality and a with expression for non-destructive copies, which makes it a good fit for DTOs and value objects like Money; record struct is the value-type version. I use structs only for small, immutable, frequently created values, and default to classes or records otherwise.
:::

::: warning Bẫy & follow-up
**"Struct mutable có vấn đề gì?"** Mỗi lần lấy ra là một bản copy, sửa bản copy không sửa bản gốc. Struct nên là `readonly struct`.

**"Khi nào dùng struct?"** Nhỏ (khoảng 16 byte trở xuống), bất biến, tạo rất nhiều, ít bị <T>boxing</T>.

**"`Tuple` và `ValueTuple`?"** Xem [Hỏi đáp](#tuple).
:::

### String immutable nghĩa là gì? `==` vs `Equals` vs `ReferenceEquals` {#string-equality}

::: tip Trả lời nhanh
String không bao giờ bị sửa tại chỗ, mọi phép "sửa" tạo string mới, nên an toàn khi dùng chung giữa thread và làm key. `ReferenceEquals` luôn so địa chỉ; `==` và `Equals` mặc định so địa chỉ với class, nhưng string, record và kiểu tự override thì so nội dung. Xem [gán là copy biến](#value-reference).
:::

::: details Câu trả lời mẫu (English)
Immutable means a string is never changed in place: Replace, ToUpper or concatenation all return a new string. That makes strings safe to share across threads and to use as dictionary keys, but building a string in a loop creates many copies, so I use StringBuilder or string.Join there. For equality, ReferenceEquals always compares references. Equals and == compare references by default for classes, but string overrides both to compare content, and records generate value equality too.
:::

::: warning Bẫy & follow-up
**"String là reference type mà sao giống value type?"** Độ dài thay đổi nên không thể là value type cố định kích thước; immutable cộng với overload `==` làm nó dùng giống value type mà vẫn chỉ copy địa chỉ.

**"Override `Equals` cần làm gì thêm?"** Override cả `GetHashCode`. Nếu hash dựa vào field có thể sửa, object "biến mất" khỏi Dictionary/HashSet sau khi sửa.
:::

### `ref` vs `out` vs `in` {#ref-out-in}

::: tip Trả lời nhanh
Cả ba đưa chính biến vào method thay vì copy. `ref`: gán trước, method đọc và sửa. `out`: method bắt buộc gán (`int.TryParse`). `in`: chỉ đọc, để truyền struct lớn không copy. Xem [gán là copy biến](#value-reference).
:::

::: details Câu trả lời mẫu (English)
All three pass the variable itself instead of a copy of its content. With ref, the caller must initialize it and the method can read and change it. With out, the method must assign it, like int.TryParse returning the parsed value. With in, the method can only read it; it's for passing large structs without copying. Note that passing a class without ref already shares the object, but reassigning the parameter inside the method doesn't affect the caller.
:::

::: warning Bẫy & follow-up
**"Truyền object vào method rồi sửa property, bên ngoài có thấy không?"** Có, cùng trỏ một object. Nhưng gán `param = new Order()` thì bên ngoài không đổi, trừ khi dùng `ref`. Reference type được truyền bằng copy địa chỉ, không phải "truyền theo tham chiếu".

**"Async method dùng `ref`/`out` được không?"** Không; trả về tuple hoặc object kết quả.
:::


## Hỏi đáp

### `Tuple` và `ValueTuple` khác nhau thế nào? {#tuple}

`System.Tuple` là class cũ, phần tử chỉ có tên `Item1`, `Item2`. `ValueTuple` `(int Id, string Name)` là struct, đặt tên được, nhưng tên chỉ tồn tại lúc compile và mất khi serialize. Dùng tuple cho giá trị trả về nội bộ; ở API public thì dùng record.

### Static constructor ném exception thì sao? {#static-ctor-exception}

Mọi lần dùng type sau đó ném `TypeInitializationException`, và <T>CLR</T> không thử chạy lại static constructor: type hỏng tới khi process khởi động lại. Vì vậy đừng gọi DB, file hay API trong static constructor.


## Tự kiểm tra

1. Truyền một `Money` (struct) và một `Payout` (class) vào method rồi sửa bên trong: bên ngoài thấy gì ở mỗi cái? Thêm `ref` thì khác gì?
