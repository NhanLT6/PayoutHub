---
title: "SEO: từ crawl tới được AI trích dẫn"
---

# SEO: từ crawl tới được AI trích dẫn

<T>SEO</T> là làm cho một trang **được tìm thấy mà không trả tiền quảng cáo**. Google đi đọc trang (crawl), lưu lại (index), và khi có người tìm thì xếp hạng (rank); SEO là cho trang đi trót lọt cả ba bước và thắng ở bước cuối. Từ khi có AI Overview và ChatGPT, mục tiêu mở rộng thêm: không chỉ **được click** mà còn **được trích dẫn**.

Trang này viết cho developer chưa biết gì về SEO, và dùng một ví dụ xuyên suốt: landing page của **Talksum** (app ghi chi tiêu bằng giọng nói). Phần developer làm tốt nhất là [Technical SEO](#technical), đặc biệt [SPA và SSR](#js-rendering) nếu bạn viết Vue/React.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="seoInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="seoOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="seoBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker><marker id="seoAcc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headAcc" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 785 410" role="img" aria-label="Bản đồ chủ đề SEO. Hàng trên là đường đi của một URL, đọc 1 đến 5: crawl, render, index, rank, rồi được click hoặc trích dẫn. Ba bước đầu thuộc technical SEO. Bốn thứ đẩy vào bước rank: search intent, keyword, nội dung, backlink. Bước 5 rẽ xuống SEO thời AI. Hàng dưới: đo lường bằng GSC trước click và GA4 sau click, nhà cung cấp dữ liệu, và checklist tự setup. Bẫy đỏ: robots.txt khác noindex, SPA trống với AI bot, DA DR không phải của Google, GSC và GA4 không khớp.">
<!-- technical bracket -->
<a href="#technical" style="text-decoration:none">
<path class="lnAcc" d="M20 52 V44 H455 V52"/>
<text x="237" y="36" font-size="12" font-weight="600" text-anchor="middle" class="accT">Technical SEO: phần của developer</text>
</a>
<!-- stage 1 crawl -->
<a href="#pipeline" style="text-decoration:none">
<rect class="box" x="20" y="62" width="125" height="88" rx="8"/>
<circle class="boxAcc" cx="36" cy="62" r="11"/><text x="36" y="66.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">1</text>
<rect class="box" x="48" y="86" width="24" height="20" rx="4"/><circle class="boxAcc" cx="56" cy="95" r="2.5"/><circle class="boxAcc" cx="64" cy="95" r="2.5"/><line class="ln" x1="60" y1="86" x2="60" y2="80"/>
<line class="ln" x1="75" y1="96" x2="92" y2="96" marker-end="url(#seoInk)"/>
<rect class="box" x="96" y="82" width="22" height="28" rx="2"/><line class="lnMuted" x1="100" y1="90" x2="114" y2="90"/><line class="lnMuted" x1="100" y1="96" x2="114" y2="96"/><line class="lnMuted" x1="100" y1="102" x2="110" y2="102"/>
<text x="82" y="134" font-size="11.5" text-anchor="middle">Crawl: bot tải trang</text>
</a>
<line class="ln" x1="145" y1="106" x2="171" y2="106" marker-end="url(#seoInk)"/>
<!-- stage 2 render -->
<a href="#js-rendering" style="text-decoration:none">
<rect class="box" x="175" y="62" width="125" height="88" rx="8"/>
<circle class="boxAcc" cx="191" cy="62" r="11"/><text x="191" y="66.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">2</text>
<rect class="box dash" x="200" y="82" width="22" height="28" rx="2"/>
<line class="ln" x1="225" y1="96" x2="246" y2="96" marker-end="url(#seoInk)"/><text x="235" y="89" font-size="9.5" text-anchor="middle" class="mono muted">JS</text>
<rect class="boxAcc" x="250" y="82" width="22" height="28" rx="2"/><line class="lnAcc" x1="254" y1="90" x2="268" y2="90"/><line class="lnAcc" x1="254" y1="96" x2="268" y2="96"/><line class="lnAcc" x1="254" y1="102" x2="264" y2="102"/>
<text x="237" y="134" font-size="11.5" text-anchor="middle">Render: chạy JS</text>
</a>
<line class="ln" x1="300" y1="106" x2="326" y2="106" marker-end="url(#seoInk)"/>
<!-- stage 3 index -->
<a href="#pipeline" style="text-decoration:none">
<rect class="box" x="330" y="62" width="125" height="88" rx="8"/>
<circle class="boxAcc" cx="346" cy="62" r="11"/><text x="346" y="66.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">3</text>
<path class="box" d="M374 86 V106 A18.5 5 0 0 0 411 106 V86"/><ellipse class="boxAcc" cx="392.5" cy="86" rx="18.5" ry="5"/><path class="lnMuted" d="M374 96 A18.5 5 0 0 0 411 96"/>
<text x="392" y="134" font-size="11.5" text-anchor="middle">Index: lưu vào kho</text>
</a>
<line class="ln" x1="455" y1="106" x2="481" y2="106" marker-end="url(#seoInk)"/>
<!-- stage 4 rank -->
<a href="#ranking" style="text-decoration:none">
<rect class="boxAcc" x="485" y="62" width="125" height="88" rx="8"/>
<circle class="boxAcc" cx="501" cy="62" r="11"/><text x="501" y="66.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">4</text>
<rect class="box" x="526" y="94" width="13" height="16"/><rect class="boxOk" x="541" y="82" width="13" height="28"/><rect class="box" x="556" y="99" width="13" height="11"/>
<text x="547" y="134" font-size="11.5" text-anchor="middle">Rank: xếp hạng</text>
</a>
<line class="ln" x1="610" y1="106" x2="636" y2="106" marker-end="url(#seoInk)"/>
<!-- stage 5 display -->
<a href="#serp" style="text-decoration:none">
<rect class="box" x="640" y="62" width="125" height="88" rx="8"/>
<circle class="boxAcc" cx="656" cy="62" r="11"/><text x="656" y="66.5" font-size="12" font-weight="700" text-anchor="middle" class="accT">5</text>
<rect class="box" x="672" y="80" width="62" height="34" rx="3"/><line class="lnAcc" x1="678" y1="89" x2="716" y2="89"/><line class="lnMuted" x1="678" y1="97" x2="726" y2="97"/><line class="lnMuted" x1="678" y1="105" x2="720" y2="105"/>
<rect class="boxAcc" x="718" y="74" width="22" height="13" rx="3"/><text x="729" y="84" font-size="8.5" font-weight="700" text-anchor="middle" class="accT">AI</text>
<text x="702" y="134" font-size="11.5" text-anchor="middle">Click hoặc trích dẫn</text>
</a>
<!-- traps under stage 1,2 -->
<a href="#robots-noindex" style="text-decoration:none"><circle class="dotBad" cx="28" cy="168" r="4"/><text x="37" y="172" font-size="11" class="badT">robots.txt ≠ noindex</text></a>
<a href="#js-rendering" style="text-decoration:none"><circle class="dotBad" cx="183" cy="168" r="4"/><text x="192" y="172" font-size="11" class="badT">SPA trống với AI bot</text></a>
<!-- inputs to rank -->
<a href="#search-intent" style="text-decoration:none">
<rect class="box" x="210" y="214" width="95" height="66" rx="8"/>
<circle class="box" cx="257" cy="236" r="12"/><circle class="box" cx="257" cy="236" r="7"/><circle class="boxOk" cx="257" cy="236" r="2.5"/>
<text x="257" y="268" font-size="11" text-anchor="middle">Search intent</text>
</a>
<a href="#keyword" style="text-decoration:none">
<rect class="box" x="315" y="214" width="95" height="66" rx="8"/>
<circle class="box" cx="358" cy="234" r="9"/><line class="ln" x1="364" y1="241" x2="372" y2="249"/>
<text x="362" y="268" font-size="11" text-anchor="middle">Keyword</text>
</a>
<a href="#content" style="text-decoration:none">
<rect class="box" x="420" y="214" width="95" height="66" rx="8"/>
<line class="lnMuted" x1="467" y1="236" x2="451" y2="226"/><line class="lnMuted" x1="467" y1="236" x2="483" y2="226"/><line class="lnMuted" x1="467" y1="236" x2="451" y2="247"/><line class="lnMuted" x1="467" y1="236" x2="483" y2="247"/>
<circle class="boxAcc" cx="467" cy="236" r="6"/><circle class="box" cx="451" cy="226" r="3.5"/><circle class="box" cx="483" cy="226" r="3.5"/><circle class="box" cx="451" cy="247" r="3.5"/><circle class="box" cx="483" cy="247" r="3.5"/>
<text x="467" y="268" font-size="11" text-anchor="middle">Nội dung</text>
</a>
<a href="#backlink" style="text-decoration:none">
<rect class="box" x="525" y="214" width="95" height="66" rx="8"/>
<circle class="box" cx="545" cy="228" r="4"/><circle class="box" cx="545" cy="246" r="4"/><circle class="boxAcc" cx="596" cy="237" r="6"/>
<line class="lnOk" x1="549" y1="229" x2="587" y2="235" stroke-width="3" marker-end="url(#seoOk)"/><line class="lnMuted dash" x1="549" y1="246" x2="587" y2="240" marker-end="url(#seoInk)"/>
<text x="572" y="268" font-size="11" text-anchor="middle">Backlink</text>
</a>
<a href="#authority-scores" style="text-decoration:none"><circle class="dotBad" cx="533" cy="296" r="4"/><text x="542" y="300" font-size="11" class="badT">DA/DR không phải Google</text></a>
<line class="ln" x1="257" y1="214" x2="528" y2="152" marker-end="url(#seoInk)"/>
<line class="ln" x1="362" y1="214" x2="535" y2="153" marker-end="url(#seoInk)"/>
<line class="ln" x1="467" y1="214" x2="542" y2="153" marker-end="url(#seoInk)"/>
<line class="ln" x1="572" y1="214" x2="552" y2="153" marker-end="url(#seoInk)"/>
<!-- AI tile -->
<line class="lnAcc" x1="702" y1="150" x2="702" y2="210" marker-end="url(#seoAcc)"/>
<a href="#ai-search" style="text-decoration:none">
<rect class="boxAcc" x="640" y="214" width="125" height="66" rx="8"/>
<circle class="box" cx="664" cy="237" r="7"/>
<line class="lnAcc" x1="671" y1="237" x2="688" y2="226"/><line class="lnAcc" x1="671" y1="237" x2="690" y2="237"/><line class="lnAcc" x1="671" y1="237" x2="688" y2="248"/>
<circle class="box" cx="692" cy="225" r="3"/><circle class="box" cx="694" cy="237" r="3"/><circle class="box" cx="692" cy="249" r="3"/>
<text x="728" y="241" font-size="10.5" text-anchor="middle" class="accT">fan-out</text>
<text x="702" y="268" font-size="11" text-anchor="middle">SEO thời AI</text>
</a>
<!-- checklist tile -->
<a href="#setup-checklist" style="text-decoration:none">
<rect class="box" x="20" y="214" width="170" height="166" rx="8"/>
<g font-size="10.5" class="mono muted"><text x="40" y="244">1</text><text x="40" y="266">2</text><text x="40" y="288">3</text><text x="40" y="310">…</text><text x="34" y="332">12</text></g>
<g><rect class="boxOk" x="56" y="234" width="10" height="10" rx="2"/><line class="lnMuted" x1="74" y1="239" x2="160" y2="239"/><rect class="boxOk" x="56" y="256" width="10" height="10" rx="2"/><line class="lnMuted" x1="74" y1="261" x2="150" y2="261"/><rect class="box" x="56" y="278" width="10" height="10" rx="2"/><line class="lnMuted" x1="74" y1="283" x2="155" y2="283"/><rect class="box" x="56" y="322" width="10" height="10" rx="2"/><line class="lnMuted" x1="74" y1="327" x2="145" y2="327"/></g>
<text x="105" y="364" font-size="11" text-anchor="middle">Checklist tự setup</text>
</a>
<!-- measurement -->
<a href="#measurement" style="text-decoration:none">
<rect class="box" x="210" y="322" width="410" height="58" rx="8"/>
<text x="310" y="348" font-size="11.5" font-weight="600" text-anchor="middle">GSC</text><text x="310" y="366" font-size="10.5" text-anchor="middle" class="muted">trên Google, trước click</text>
<path class="ln" d="M408 336 l0 18 l5 -5 l4 8 l3 -1.5 l-4 -8 l7 0 z"/>
<text x="520" y="348" font-size="11.5" font-weight="600" text-anchor="middle">GA4</text><text x="520" y="366" font-size="10.5" text-anchor="middle" class="muted">trên site, sau click</text>
</a>
<a href="#measurement" style="text-decoration:none"><circle class="dotBad" cx="218" cy="396" r="4"/><text x="227" y="400" font-size="11" class="badT">hai con số không bao giờ khớp</text></a>
<a href="#data-providers" style="text-decoration:none">
<rect class="box" x="640" y="322" width="125" height="58" rx="8"/>
<text x="702" y="346" font-size="10.5" text-anchor="middle" class="mono muted">API</text>
<text x="702" y="366" font-size="11" text-anchor="middle">Nguồn dữ liệu</text>
</a>
</svg>
<p class="fig-caption">Đọc 1 đến 5 theo đường đi của một URL; mỗi ô bấm được. Tự hỏi: trang có trong <code>robots.txt</code> Disallow vẫn có thể hiện trên Google, vì sao? Vì sao landing page Vue thuần client-side có thể trống trơn với bot AI (2)? Bốn thứ đẩy vào bước 4, thứ nào nội dung một mình không thay thế được?</p>
</div>

## 1. Vấn đề: trang có nhưng không ai thấy {#problem}

**Mỗi bước trên đường đi của một URL đều có thể hỏng âm thầm; hỏng ở bước nào thì mọi công sức ở bước sau vô nghĩa, và không có lỗi nào hiện ra cho bạn thấy.** Talksum làm landing page đẹp, deploy xong, ba tháng sau Search Console báo gần như không có impression. Đi lại từng bước, mỗi bước chữa cái đau của bước trước:

1. **Bước 1, trang trống với bot.** Landing page là Vue SPA: HTML trả về chỉ có `<div id="app">`. Googlebot phải xếp hàng chờ render, bot AI không chạy JS nên thấy trang trắng. Chữa: build tĩnh bằng <T>SSG</T>. Nhãn: [JS rendering](#js-rendering).
2. **Bước 2, Google không biết trang tồn tại.** Chưa ai link tới, chưa có <T>sitemap</T>. Chữa: `sitemap.xml`, `robots.txt`, xác minh Search Console. Nhãn: [đường đi của URL](#pipeline).
3. **Bước 3, index rồi nhưng không lên.** Chỉ có trang chủ và trang tải về, nên chỉ bắt được người **đã biết tên** Talksum, tức gần như không ai. Chữa: viết trang cho người đang gặp vấn đề ("cuối tháng hết tiền không biết tiêu vào đâu"). Nhãn: [search intent theo phễu](#funnel).
4. **Bước 4, có trang nhưng không ai tin.** Nội dung tốt nhưng không site nào nhắc tới. Chữa: dữ liệu gốc đáng trích dẫn, được báo, cộng đồng nhắc. Nhãn: [backlink](#backlink).
5. **Bước 5, lên top mà click vẫn giảm.** AI Overview trả lời ngay trên Google. Chữa: viết kiểu trả lời trước, có số liệu, để được **trích dẫn**. Nhãn: [SEO thời AI](#ai-search).

Thứ tự này cũng là thứ tự của [checklist tự setup](#setup-checklist): bước sau vô nghĩa nếu bước trước hỏng.

## 2. Đường đi của một URL: crawl, render, index {#pipeline}

**Google chỉ xếp hạng được thứ nó đã lưu, chỉ lưu được thứ nó đã đọc, và chỉ đọc được thứ nó biết là tồn tại.** Nên mỗi bước có một cách hỏng riêng:

<div class="fig">
<svg viewBox="0 0 760 200" role="img" aria-label="Sáu bước: phát hiện URL, crawl, render, index, rank, hiển thị. Dưới bốn bước đầu là cách hỏng: không link và không sitemap thì Google không biết có trang; robots.txt Disallow thì không được tải; nội dung chỉ có sau JS thì AI bot thấy trống; thẻ noindex thì đọc xong mà không lưu">
<rect class="box" x="10" y="14" width="110" height="50" rx="8"/><text x="65.0" y="35" font-size="12" font-weight="600" text-anchor="middle">Phát hiện URL</text><text x="65.0" y="53" font-size="10.5" text-anchor="middle" class="muted">sitemap, link</text>
<line class="ln" x1="120" y1="39" x2="137" y2="39" marker-end="url(#seoInk)"/>
<rect class="box" x="140" y="14" width="110" height="50" rx="8"/><text x="195.0" y="35" font-size="12" font-weight="600" text-anchor="middle">Crawl</text><text x="195.0" y="53" font-size="10.5" text-anchor="middle" class="muted">bot tải HTML</text>
<line class="ln" x1="250" y1="39" x2="267" y2="39" marker-end="url(#seoInk)"/>
<rect class="box" x="270" y="14" width="110" height="50" rx="8"/><text x="325.0" y="35" font-size="12" font-weight="600" text-anchor="middle">Render</text><text x="325.0" y="53" font-size="10.5" text-anchor="middle" class="muted">chạy JS</text>
<line class="ln" x1="380" y1="39" x2="397" y2="39" marker-end="url(#seoInk)"/>
<rect class="box" x="400" y="14" width="110" height="50" rx="8"/><text x="455.0" y="35" font-size="12" font-weight="600" text-anchor="middle">Index</text><text x="455.0" y="53" font-size="10.5" text-anchor="middle" class="muted">lưu vào kho</text>
<line class="ln" x1="510" y1="39" x2="527" y2="39" marker-end="url(#seoInk)"/>
<rect class="boxAcc" x="530" y="14" width="110" height="50" rx="8"/><text x="585.0" y="35" font-size="12" font-weight="600" text-anchor="middle">Rank</text><text x="585.0" y="53" font-size="10.5" text-anchor="middle" class="muted">theo query</text>
<line class="ln" x1="640" y1="39" x2="657" y2="39" marker-end="url(#seoInk)"/>
<rect class="box" x="660" y="14" width="110" height="50" rx="8"/><text x="715.0" y="35" font-size="12" font-weight="600" text-anchor="middle">Hiển thị</text><text x="715.0" y="53" font-size="10.5" text-anchor="middle" class="muted">SERP, AI</text>
<line class="lnBad dash" x1="65.0" y1="66" x2="65.0" y2="122"/><path class="lnBad" d="M59.0 116 l12 12 M71.0 116 l-12 12" stroke-width="2.5"/>
<rect class="boxBad" x="10" y="136" width="110" height="50" rx="8"/>
<text x="65.0" y="156" font-size="10.5" text-anchor="middle" class="badT">không link, sitemap</text><text x="65.0" y="174" font-size="10.5" text-anchor="middle" class="muted">Google không biết</text>
<line class="lnBad dash" x1="195.0" y1="66" x2="195.0" y2="122"/><path class="lnBad" d="M189.0 116 l12 12 M201.0 116 l-12 12" stroke-width="2.5"/>
<rect class="boxBad" x="140" y="136" width="110" height="50" rx="8"/>
<text x="195.0" y="156" font-size="10.5" text-anchor="middle" class="badT">robots.txt chặn</text><text x="195.0" y="174" font-size="10.5" text-anchor="middle" class="muted">không được tải</text>
<line class="lnBad dash" x1="325.0" y1="66" x2="325.0" y2="122"/><path class="lnBad" d="M319.0 116 l12 12 M331.0 116 l-12 12" stroke-width="2.5"/>
<rect class="boxBad" x="270" y="136" width="110" height="50" rx="8"/>
<text x="325.0" y="156" font-size="10.5" text-anchor="middle" class="badT">nội dung sau JS</text><text x="325.0" y="174" font-size="10.5" text-anchor="middle" class="muted">AI bot thấy trống</text>
<line class="lnBad dash" x1="455.0" y1="66" x2="455.0" y2="122"/><path class="lnBad" d="M449.0 116 l12 12 M461.0 116 l-12 12" stroke-width="2.5"/>
<rect class="boxBad" x="400" y="136" width="110" height="50" rx="8"/>
<text x="455.0" y="156" font-size="10.5" text-anchor="middle" class="badT">thẻ noindex</text><text x="455.0" y="174" font-size="10.5" text-anchor="middle" class="muted">đọc mà không lưu</text>
</svg>
<p class="fig-caption">Tự hỏi: traffic bằng 0, bạn kiểm tra theo thứ tự nào? Trang có <code>noindex</code> mà bị <code>robots.txt</code> chặn thì bot có đọc được thẻ không?</p>
</div>

- Chỉ khi qua hết bốn bước đầu mới đến chuyện ranking. Nên khi traffic bằng 0, kiểm tra theo thứ tự này trước khi nghĩ tới nội dung.
- Báo cáo **Pages** trong <T>GSC</T> cho biết trang nào chưa được index và vì sao (bị chặn, có noindex, trùng lặp...).

### Trang kết quả (SERP) gồm những gì {#serp}

**Vị trí #1 organic không còn nằm ở đầu trang: phía trên nó có thể là quảng cáo và AI Overview, nên cùng là #1 mà lượng click đã giảm so với vài năm trước.**

<div class="fig">
<svg viewBox="0 0 700 290" role="img" aria-label="Mô phỏng SERP cho query giày chạy bộ nam tốt nhất: trên cùng là quảng cáo trả tiền, không phải SEO; tiếp theo là AI Overview trích dẫn vài nguồn, mục tiêu mới; kết quả organic số 1 bị đẩy xuống dưới; cuối là khối People Also Ask">
<rect class="box" x="20" y="14" width="420" height="30" rx="15"/><text x="40" y="34" font-size="12" class="muted">giày chạy bộ nam tốt nhất</text>
<rect class="box" x="20" y="58" width="420" height="44" rx="6"/><text x="34" y="76" font-size="10.5" class="muted">Sponsored · shop-a.com</text><text x="34" y="93" font-size="12">Giày chạy bộ chính hãng, giảm 30%</text>
<rect class="boxAcc" x="20" y="112" width="420" height="58" rx="6"/><text x="34" y="131" font-size="12" font-weight="600" class="accT">AI Overview</text><text x="34" y="148" font-size="11" class="muted">Tóm tắt do AI viết từ nhiều trang…</text>
<g font-size="10" class="mono"><rect class="box" x="34" y="154" width="84" height="12" rx="6"/><text x="76" y="163.5" text-anchor="middle">runnersworld</text><rect class="boxOk" x="124" y="154" width="90" height="12" rx="6"/><text x="169" y="163.5" text-anchor="middle" class="okT">review-blog.vn</text></g>
<rect class="boxOk" x="20" y="180" width="420" height="44" rx="6"/><text x="34" y="198" font-size="10.5" class="muted">review-blog.vn › giay-chay-bo</text><text x="34" y="215" font-size="12">Top 10 giày chạy bộ nam 2026</text>
<rect class="box" x="20" y="234" width="420" height="44" rx="6"/><text x="34" y="252" font-size="12">Mọi người cũng hỏi</text><text x="34" y="269" font-size="11" class="muted">Giày chạy bộ dùng được bao lâu? ▾</text>
<g font-size="11.5"><text x="462" y="78" font-weight="600">Paid (SEM/PPC)</text><text x="462" y="94" class="muted">trả tiền theo click, không phải SEO</text>
<text x="462" y="134" font-weight="600" class="accT">AI Overview</text><text x="462" y="150" class="muted">được trích dẫn = mục tiêu mới</text>
<text x="462" y="200" font-weight="600" class="okT">Organic #1</text><text x="462" y="216" class="muted">sân chơi của SEO, bị đẩy xuống</text>
<text x="462" y="254" font-weight="600">SERP feature</text><text x="462" y="270" class="muted">PAA, featured snippet, video…</text></g>
<path class="lnOk dash" d="M448 70 C 455 120, 455 160, 448 195" marker-end="url(#seoOk)"/>
</svg>
<p class="fig-caption">Tự hỏi: <code>review-blog.vn</code> xuất hiện ở hai chỗ, chỗ nào mang lại click? Vì sao Search Console có thể báo vị trí tăng mà click giảm?</p>
</div>

## 3. Ranking: Google chấm theo năm câu hỏi {#ranking}

**Không có công thức công khai, nhưng mọi tín hiệu gom được thành năm câu hỏi; và câu hỏi đầu tiên, trang có đúng ý người tìm không, chặn tất cả các câu sau.**

| Nhóm | Google hỏi gì | Bạn tác động bằng |
|---|---|---|
| Relevance | Trang có trả lời đúng **ý định** của query không? | Nội dung, title, heading, đúng search intent |
| Quality | Có hữu ích, có trải nghiệm thật, có chuyên môn không? (<T>E-E-A-T</T>) | Viết từ kinh nghiệm thật, có tác giả, có nguồn |
| Authority | Web khác có tin và nhắc tới trang này không? | [Backlink](#backlink), brand mention |
| Usability | Nhanh, dùng tốt trên mobile, HTTPS không? | [Technical SEO](#technical), [Core Web Vitals](#core-web-vitals) |
| Context | Người tìm ở đâu, ngôn ngữ gì, thiết bị gì? | Không tác động trực tiếp, nhưng phải chọn đúng thị trường |

### Search intent: nhóm quan trọng nhất {#search-intent}

**Google xếp hạng theo loại trang hợp với ý định của query, nên sai <T>search intent</T> thì nội dung tốt đến đâu cũng khó lên.**

- **Informational**: muốn biết ("cách tiết kiệm tiền khi lương thấp") → bài hướng dẫn.
- **Navigational**: muốn vào một site cụ thể ("talksum đăng nhập").
- **Commercial**: đang so sánh trước khi mua ("app quản lý chi tiêu tốt nhất", "X vs Y") → review, so sánh. Sân chơi truyền thống của affiliate site.
- **Transactional**: muốn hành động ngay ("tải talksum") → trang sản phẩm, trang tải về.

Mẹo kiểm tra: search thử keyword và nhìn top 10. Top 10 toàn bài review thì trang sản phẩm của bạn gần như không có cửa, và ngược lại.

### Intent theo phễu mua hàng {#funnel}

**Một người đi từ "có vấn đề" tới "tải app" qua nhiều lần search, mỗi giai đoạn gõ một kiểu keyword; site chỉ có trang chủ và trang tải về thì chỉ bắt được giai đoạn cuối, nơi sản phẩm mới gần như không có ai tìm.**

| Giai đoạn | Người dùng đang nghĩ | Keyword ví dụ (Talksum) | Loại trang |
|---|---|---|---|
| Awareness | Có vấn đề, chưa nghĩ tới giải pháp | "cuối tháng hết tiền không biết tiêu vào đâu" | Bài hướng dẫn, mẹo |
| Consideration | Biết cần công cụ, đang so sánh | "app quản lý chi tiêu tốt nhất", "ghi chi tiêu bằng giọng nói" | So sánh, trang tính năng |
| Decision | Gần chọn xong | "talksum giá", "talksum có an toàn không" | Trang giá, FAQ, tải về |

Dùng bảng này để tự kiểm tra: mỗi giai đoạn đã có ít nhất một trang chưa.

### "Vị trí" là một con số dao động {#position}

**Kết quả thay đổi theo địa điểm, thiết bị, ngôn ngữ và thời điểm, nên không có một thứ hạng cố định.** Vì vậy:

- Tool bên thứ ba (như DataForSEO) cho vị trí **tại một location và device, ở một thời điểm**. Đổi location là đổi kết quả.
- <T>GSC</T> cho **average position** qua mọi lần hiển thị thật. Hai con số không khớp là bình thường.

## 4. Keyword: volume, difficulty, CPC {#keyword}

**Mỗi keyword có ba con số: bao nhiêu người tìm (<T>search volume</T>), khó lên top đến đâu (<T>KD</T>), nhà quảng cáo trả bao nhiêu cho một click (<T>CPC</T>, gợi ý giá trị thương mại). Cả ba đều là ước tính, vì Google không công bố số thật.**

- **Volume** thường lấy từ Google Ads Keyword Planner (chỉ cho khoảng như 1K–10K nếu tài khoản không chạy nhiều quảng cáo), tool tinh chỉnh thêm bằng clickstream mua từ bên thứ ba. Con số là **trung bình 12 tháng**, nên keyword theo mùa ("quà Tết") bị lệch.

### Keyword difficulty tính thế nào {#keyword-difficulty}

**KD không phải chỉ số của Google: mỗi tool tự đặt công thức, thường là đo sức mạnh backlink của top 10 hiện tại rồi quy ra thang 0–100.** Vì công thức và kho backlink khác nhau nên:

| Keyword | Top 10 trung bình có | KD (minh hoạ) | Ý nghĩa |
|---|---|---|---|
| app quản lý chi tiêu | ~800 domain trỏ link | 75 | Site mới gần như không có cửa |
| ghi chi tiêu bằng giọng nói tiếng Việt | ~15 domain trỏ link | 12 | Site nhỏ vẫn lên được nhờ nội dung tốt |

- KD của Ahrefs và Semrush cho cùng một keyword có thể chênh rất nhiều: chỉ so KD giữa các keyword **trong cùng một tool**.
- KD chỉ đo backlink, không đo intent hay chất lượng nội dung.

### Head term và long-tail {#long-tail}

**Cụm càng dài càng ít người tìm, nhưng càng ít đối thủ và người tìm càng biết rõ mình muốn gì**, nên site mới bắt đầu từ <T>long-tail</T>. Thời AI làm long-tail quan trọng hơn nữa, vì câu người ta hỏi AI thường dài và cụ thể (xem [query fan-out](#query-fan-out)).

## 5. Backlink: uy tín chảy theo link {#backlink}

**Google coi mỗi <T>backlink</T> như một phiếu bầu tín nhiệm, nhưng các phiếu không ngang giá: phiếu từ site uy tín, cùng chủ đề nặng hơn nhiều phiếu từ site rác, và có loại link được đánh dấu là "không tính phiếu".** Ý tưởng gốc là <T>PageRank</T>: trang quan trọng nếu nhiều trang quan trọng link tới nó. Ngày nay đó chỉ là một phần của ranking, nhưng là phần nội dung một mình không thay thế được.

<div class="fig">
<svg viewBox="0 0 700 230" role="img" aria-label="Bốn link trỏ về landing page Talksum: báo tài chính lớn cùng chủ đề là mũi tên dày, blog cá nhân về tiết kiệm là mũi tên vừa, site rác khác chủ đề là mũi tên mảnh nét đứt, link affiliate có rel sponsored bị gạch, không tính phiếu">
<rect class="box" x="20" y="16" width="200" height="38" rx="6"/><text x="120" y="40" font-size="12" text-anchor="middle">Báo tài chính, cùng chủ đề</text>
<rect class="box" x="20" y="68" width="200" height="38" rx="6"/><text x="120" y="92" font-size="12" text-anchor="middle">Blog tiết kiệm cá nhân</text>
<rect class="box dash" x="20" y="120" width="200" height="38" rx="6"/><text x="120" y="144" font-size="12" text-anchor="middle" class="muted">Site rác, khác chủ đề</text>
<rect class="box" x="20" y="172" width="200" height="38" rx="6"/><text x="120" y="190" font-size="11.5" text-anchor="middle">Link affiliate</text><text x="120" y="204" font-size="10" text-anchor="middle" class="mono muted">rel="sponsored"</text>
<rect class="boxAcc" x="480" y="88" width="200" height="54" rx="8"/><text x="580" y="112" font-size="12.5" font-weight="600" text-anchor="middle">Landing page Talksum</text><text x="580" y="130" font-size="11" text-anchor="middle" class="muted">uy tín cộng dồn</text>
<line class="lnOk" x1="222" y1="35" x2="474" y2="100" stroke-width="5" marker-end="url(#seoOk)"/>
<line class="lnOk" x1="222" y1="87" x2="474" y2="110" stroke-width="2.5" marker-end="url(#seoOk)"/>
<line class="lnMuted dash" x1="222" y1="139" x2="474" y2="120" marker-end="url(#seoInk)"/>
<line class="lnBad dash" x1="222" y1="191" x2="380" y2="150"/>
<path class="lnBad" d="M372 140 l16 16 M388 140 l-16 16" stroke-width="2.5"/>
<text x="398" y="168" font-size="11" class="badT">không tính phiếu</text>
<text x="300" y="44" font-size="11" class="okT">nặng</text>
</svg>
<p class="fig-caption">Tự hỏi: 100 link từ cùng một site rác so với 10 link từ 10 site khác nhau, bên nào nặng hơn? Vì sao link affiliate không giúp merchant tăng SEO?</p>
</div>

Một link nặng hay nhẹ phụ thuộc vào:

- **Uy tín và chủ đề của trang nguồn**: báo lớn, trang đại học, site cùng ngành nặng hơn blog vô danh khác chủ đề.
- **<T>Referring domain</T>**: số domain khác nhau quan trọng hơn tổng số link.
- **<T>Anchor text</T>**: chữ gắn link giúp Google hiểu trang đích nói về gì.

### Thuộc tính rel của link {#link-rel}

**Thuộc tính `rel` là cách trang nguồn nói "đừng tính phiếu này"**:

```html
<a href="https://shop.com">                    <!-- link bình thường, truyền uy tín -->
<a href="https://shop.com" rel="nofollow">     <!-- "đừng tính phiếu bầu này" -->
<a href="https://shop.com" rel="sponsored">    <!-- link trả tiền, quảng cáo, affiliate -->
<a href="https://shop.com" rel="ugc">          <!-- nội dung người dùng: comment, forum -->
```

::: info Liên quan PayoutHub
PayoutHub tính commission cho affiliate. Google yêu cầu link affiliate gắn `rel="sponsored"` (hoặc `nofollow`), và mua bán link để tăng ranking là vi phạm chính sách spam. Nên link affiliate **không** giúp merchant tăng SEO; giá trị của nó là traffic và doanh số trực tiếp, đúng thứ PayoutHub đếm để trả tiền.
:::

### DA, DR, Authority Score {#authority-scores}

**Domain Authority (Moz), Domain Rating (Ahrefs), Authority Score (Semrush) là điểm 0–100 mỗi tool tự tính từ backlink mà tool đó crawl được, nên <T>DA/DR</T> không phải thứ Google dùng.** Dùng để so tương đối giữa các site trong cùng một tool, không coi là sự thật.

### Có backlink một cách hợp lệ {#earn-backlinks}

- Nội dung đáng trích dẫn: dữ liệu gốc, khảo sát, công cụ miễn phí, hướng dẫn rất chi tiết.
- Digital PR: được báo chí, blog trong ngành nhắc tới. Quan hệ thật với đối tác, cộng đồng.
- Hồ sơ doanh nghiệp: Google Business Profile, danh bạ ngành uy tín.

::: warning Tránh
Mua gói "1000 backlink", PBN (mạng lưới site vệ tinh), trao đổi link hàng loạt. Đó là cách làm cũ và giờ có rủi ro bị phạt.
:::

## 6. Technical SEO: phần của developer {#technical}

**Technical SEO là mọi thứ quyết định bot (Googlebot và AI crawler) có tải được, đọc được và lưu đúng bản trang hay không; nó không làm nội dung kém lên top, nhưng hỏng thì nội dung tốt cũng vô hình.** Đây là phần developer làm tốt nhất, và cũng hay bị bỏ quên nhất.

### robots.txt, sitemap và noindex {#robots-noindex}

**<T>robots.txt</T> điều khiển bước crawl, còn <T>noindex</T> điều khiển bước index; vì hai bước tách rời nên chặn crawl không ngăn được trang vào index.**

```txt
# https://talksum.app/robots.txt
User-agent: *
Disallow: /admin/
Disallow: /api/

Sitemap: https://talksum.app/sitemap.xml
```

- Trang bị `Disallow` nhưng có link từ nơi khác vẫn có thể hiện trên Google (chỉ có URL, không có mô tả), vì Google biết URL mà không được đọc.
- Muốn trang **không** hiện: dùng `<meta name="robots" content="noindex">` và **phải cho crawl** trang đó, không thì bot không đọc được thẻ.
- Lỗi kinh điển: quên gỡ `noindex` của staging khi lên production.

### Các thẻ trong head {#head-tags}

```html
<title>Ghi chi tiêu bằng giọng nói | Talksum</title>
<meta name="description" content="Nói một câu, app tự ghi khoản chi…">
<link rel="canonical" href="https://talksum.app/ghi-chi-tieu-giong-noi">
<meta name="robots" content="index, follow">
```

- **title**: tín hiệu on-page mạnh nhất, cũng là dòng chữ xanh trên SERP.
- **meta description**: không ảnh hưởng ranking trực tiếp, nhưng ảnh hưởng <T>CTR</T>. Google thường tự viết lại.
- **<T>canonical</T>**: nhiều URL cùng nội dung (`?sort=price`, `?utm=…`) thì chỉ ra đâu là bản chính, để uy tín không bị chia nhỏ.

### Open Graph: không phải SEO nhưng hay đi kèm {#open-graph}

<T>Open Graph</T> (`og:title`, `og:description`, `og:image`) quyết định link trông thế nào khi chia sẻ lên Facebook, Zalo, Slack. **Không ảnh hưởng ranking**, nhưng ticket SEO thường gộp chung. Thiếu `og:image` thì link chia sẻ ra trơ trọi.

```html
<meta property="og:title" content="Ghi chi tiêu bằng giọng nói">
<meta property="og:image" content="https://talksum.app/og/voice.jpg">
```

### Redirect và link hỏng {#redirects}

**301 nói với Google "URL cũ đã chết, chuyển hết uy tín sang URL mới"; 302 nói "tạm thời thôi, giữ URL cũ"; nên chọn sai loại là uy tín ở sai chỗ.** Mọi lỗi dưới đây suy ra từ đó (<T>301/302</T>):

- **302 cho thay đổi vĩnh viễn** (đổi URL, gộp trang, đổi domain): lỗi rất phổ biến, Google giữ URL cũ trong index. Dùng 302 chỉ khi thật sự tạm (bảo trì, A/B test).
- **<T>Redirect chain</T>** A → B → C → D: mỗi bước chậm thêm và có thể mất tín hiệu. Cho A trỏ thẳng D, sửa link nội bộ trỏ thẳng URL cuối.
- **Backlink trỏ vào trang đã xoá**: uy tín từ link đó mất hẳn, nên 301 về trang thay thế gần nhất. Không có trang thay thế thì trả `404` hoặc `410`; **đừng** redirect tất cả về trang chủ, Google coi đó là <T>soft 404</T>.
- **<T>Orphan page</T>**: không có link nội bộ nào trỏ tới, Google coi là không quan trọng kể cả khi có trong sitemap.

### Site đa ngôn ngữ, đa thị trường {#hreflang}

**<T>hreflang</T> là một bộ khai báo mà mọi phiên bản phải cùng xác nhận; thiếu một chiều thì Google bỏ qua cả cặp.** Ví dụ một site phục vụ Úc và New Zealand, cùng tiếng Anh:

```html
<html lang="en-AU">
<link rel="alternate" hreflang="en-au" href="https://example.com/au/page">
<link rel="alternate" hreflang="en-nz" href="https://example.com/nz/page">
<link rel="alternate" hreflang="x-default" href="https://example.com/page">
```

- Mỗi bản liệt kê **tất cả** bản, kể cả chính nó; trang AU trỏ NZ thì NZ cũng phải trỏ AU. <T>x-default</T> là bản dự phòng.
- Mỗi bản **tự canonical về chính nó**. Lỗi hay gặp: canonical mọi bản về bản tiếng Anh, các bản kia biến mất khỏi index.
- Mã = ngôn ngữ (bắt buộc) + quốc gia (tuỳ chọn): `en-au` đúng, `au` một mình sai vì "au" không phải mã ngôn ngữ.

Cấu trúc URL là trade-off giữa **dùng chung uy tín** và **tín hiệu quốc gia**:

| Cấu trúc | Ví dụ | Ưu | Nhược |
|---|---|---|---|
| Subfolder | `example.com/au/` | Dùng chung uy tín domain, dễ làm. Mặc định hợp lý | Tín hiệu quốc gia yếu hơn ccTLD |
| Subdomain | `au.example.com` | Tách hạ tầng được | Uy tín tích luỹ tách rời nhiều hơn |
| ccTLD | `example.com.au` | Tín hiệu quốc gia mạnh nhất, người dùng địa phương tin hơn | Mỗi domain gần như làm SEO lại từ đầu |

Keyword cũng phải nghiên cứu riêng từng thị trường, không dịch thẳng: người Úc tìm "thongs" (dép xỏ ngón), người Mỹ tìm "flip flops".

### Structured data (JSON-LD) {#structured-data}

**<T>JSON-LD</T> nói thẳng cho máy biết trang là cái gì (sản phẩm, bài viết, doanh nghiệp) thay vì để máy đoán từ chữ**, nhờ đó trang có thể hiện kèm sao đánh giá, giá, giờ mở cửa trên SERP.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Talksum",
  "operatingSystem": "Android, iOS",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "VND" }
}
</script>
```

Kiểm tra bằng **Rich Results Test** của Google.

### JavaScript rendering: SPA, SSR, SSG {#js-rendering}

**Bot đọc HTML server trả về; với <T>SPA</T>, HTML đó gần như trống và nội dung chỉ có sau khi JavaScript chạy, nên trang phụ thuộc vào việc bot có chịu chạy JS hay không.** Googlebot có chạy nhưng phải xếp hàng chờ và không đảm bảo; nhiều AI crawler được ghi nhận là **không chạy JS**.

<div class="fig">
<svg viewBox="0 0 720 230" role="img" aria-label="Cùng lệnh curl talksum.app. Bên trái SPA: HTML trả về chỉ có div id app rỗng và thẻ script, AI bot thấy trang trống. Bên phải SSR hoặc SSG: HTML đã có h1 Ghi chi tiêu bằng giọng nói và đoạn mô tả, bot đọc được ngay">
<text x="175" y="22" font-size="13" font-weight="600" text-anchor="middle">SPA thuần client-side</text>
<text x="545" y="22" font-size="13" font-weight="600" text-anchor="middle">SSR hoặc SSG</text>
<rect class="box" x="20" y="36" width="310" height="120" rx="6"/>
<g font-size="11" class="mono"><text x="34" y="58" class="muted">$ curl talksum.app</text><text x="34" y="82">&lt;body&gt;</text><text x="50" y="100" class="badT">&lt;div id="app"&gt;&lt;/div&gt;</text><text x="50" y="118" class="muted">&lt;script src="app.js"&gt;</text><text x="34" y="136">&lt;/body&gt;</text></g>
<rect class="boxOk" x="390" y="36" width="310" height="120" rx="6"/>
<g font-size="11" class="mono"><text x="404" y="58" class="muted">$ curl talksum.app</text><text x="404" y="82">&lt;body&gt;</text><text x="420" y="100" class="okT">&lt;h1&gt;Ghi chi tiêu bằng giọng nói</text><text x="420" y="118" class="okT">&lt;p&gt;Nói một câu, app tự ghi…</text><text x="404" y="136">&lt;/body&gt;</text></g>
<line class="lnBad" x1="175" y1="160" x2="175" y2="186" marker-end="url(#seoBad)"/><text x="175" y="206" font-size="12" text-anchor="middle" class="badT">AI bot: trang trống</text><text x="175" y="222" font-size="10.5" text-anchor="middle" class="muted">Googlebot: chờ hàng đợi render</text>
<line class="lnOk" x1="545" y1="160" x2="545" y2="186" marker-end="url(#seoOk)"/><text x="545" y="206" font-size="12" text-anchor="middle" class="okT">mọi bot đọc được ngay</text><text x="545" y="222" font-size="10.5" text-anchor="middle" class="muted">JS chỉ gắn tương tác sau</text>
</svg>
<p class="fig-caption">Tự hỏi: site docs VitePress này thuộc bên nào? Một dashboard sau đăng nhập có cần SSR vì SEO không?</p>
</div>

- **Chữa**: render nội dung quan trọng ở server (<T>SSR</T>, vd Nuxt với Vue) hoặc tạo HTML tĩnh lúc build (<T>SSG</T>, như VitePress). Landing page, blog, trang tính năng nên SSG: nội dung ít đổi, rẻ nhất.
- **Khi nào không cần**: trang sau đăng nhập (dashboard, app nội bộ) không cần index, SPA là đủ.
- **Kiểm tra nhanh**: `curl` URL hoặc tắt JavaScript trong browser, xem HTML có chứa nội dung chính không.

### Core Web Vitals {#core-web-vitals}

**<T>Core Web Vitals</T> đo trải nghiệm từ người dùng thật, và chỉ là tín hiệu phụ: không kéo nội dung kém lên top, nhưng phân định giữa các trang ngang nhau.**

- **LCP** (Largest Contentful Paint): nội dung lớn nhất hiện ra sau bao lâu. Nên < 2.5s.
- **INP** (Interaction to Next Paint): bấm vào thì trang phản hồi nhanh cỡ nào. Nên < 200ms.
- **CLS** (Cumulative Layout Shift): layout có nhảy khi tải không. Nên < 0.1.

Kiểm tra bằng **PageSpeed Insights**. Lỗi phổ biến khác: trang lỗi trả `200` thay vì `404` (soft 404), nội dung trùng do tham số URL mà không có canonical.

## 7. On-page và nội dung {#content}

**Mỗi trang nhắm một chủ đề và một intent, trả lời tốt hơn các trang đang ở top, và nối với các trang khác trong site; vì Google đánh giá cả trang lẫn mức độ site bao phủ cả chủ đề.**

- **Một trang, một mục tiêu**: hai trang cùng nhắm một keyword tự cạnh tranh nhau (<T>keyword cannibalization</T>).
- **Cấu trúc trả lời trước**: một H1, H2/H3 rõ ràng, mỗi phần mở bằng câu trả lời thẳng rồi mới giải thích. Tốt cho cả người đọc lẫn [AI trích dẫn](#ai-search).
- **<T>E-E-A-T</T>**: tác giả thật, kinh nghiệm thật, có nguồn, có liên hệ. Đặc biệt quan trọng với chủ đề tiền bạc (đúng chủ đề của Talksum). Ảnh có `alt`, nén nhẹ, tên file có nghĩa.

### Topic cluster: tổ chức nội dung theo cụm {#topic-cluster}

**Uy tín chảy theo link nội bộ giống như theo backlink, nên một cụm trang link chặt quanh một chủ đề mạnh hơn cùng số bài rời rạc.** Đó là <T>topic cluster</T>: Google thấy site bao phủ **cả chủ đề** (topical authority), không chỉ một keyword.

<div class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Pillar page Quản lý chi tiêu cá nhân ở giữa, link hai chiều với bốn cluster page: ghi chi tiêu bằng giọng nói, lập ngân sách tháng, tiết kiệm khi lương thấp, so sánh app chi tiêu. Hai cluster liên quan link ngang với nhau. Bên phải một orphan page không có link nào trỏ tới, Google coi là không quan trọng">
<rect class="boxAcc" x="170" y="102" width="180" height="46" rx="8"/><text x="260" y="122" font-size="12" font-weight="600" text-anchor="middle">Pillar: quản lý</text><text x="260" y="139" font-size="12" font-weight="600" text-anchor="middle">chi tiêu cá nhân</text>
<rect class="box" x="20" y="20" width="160" height="34" rx="6"/><text x="100" y="42" font-size="11.5" text-anchor="middle">ghi chi tiêu bằng giọng nói</text>
<rect class="box" x="340" y="20" width="160" height="34" rx="6"/><text x="420" y="42" font-size="11.5" text-anchor="middle">lập ngân sách tháng</text>
<rect class="box" x="20" y="196" width="160" height="34" rx="6"/><text x="100" y="218" font-size="11.5" text-anchor="middle">tiết kiệm khi lương thấp</text>
<rect class="box" x="340" y="196" width="160" height="34" rx="6"/><text x="420" y="218" font-size="11.5" text-anchor="middle">so sánh app chi tiêu</text>
<line class="lnAcc" x1="120" y1="56" x2="210" y2="100" marker-start="url(#seoAcc)" marker-end="url(#seoAcc)"/>
<line class="lnAcc" x1="400" y1="56" x2="310" y2="100" marker-start="url(#seoAcc)" marker-end="url(#seoAcc)"/>
<line class="lnAcc" x1="120" y1="194" x2="210" y2="150" marker-start="url(#seoAcc)" marker-end="url(#seoAcc)"/>
<line class="lnAcc" x1="400" y1="194" x2="310" y2="150" marker-start="url(#seoAcc)" marker-end="url(#seoAcc)"/>
<line class="lnMuted dash" x1="184" y1="37" x2="336" y2="37" marker-start="url(#seoInk)" marker-end="url(#seoInk)"/>
<rect class="boxBad dash" x="530" y="102" width="112" height="46" rx="8"/><text x="586" y="122" font-size="11.5" text-anchor="middle" class="badT">orphan page</text><text x="586" y="139" font-size="10.5" text-anchor="middle" class="muted">không link nào tới</text>
</svg>
<p class="fig-caption">Tự hỏi: AI tách câu "app nào giúp tiết kiệm khi lương thấp" thành nhiều câu nhỏ; cụm này có sẵn trang cho câu nào? Orphan page có trong sitemap thì có đủ không?</p>
</div>

- **Pillar** link tới mọi cluster, mỗi cluster link ngược về pillar, cluster liên quan link ngang.
- **Gom keyword vào cụm**: hai keyword dùng chung một trang nếu top 10 của chúng gần như trùng nhau; khác intent hoặc kết quả khác hẳn thì tách trang.
- Cụm cũng khớp [query fan-out](#query-fan-out): mỗi câu nhỏ AI tách ra có sẵn một trang trả lời.

### Độ mới của nội dung {#freshness}

**Google ưu tiên nội dung mới chỉ ở chủ đề thay đổi theo thời gian, nên bài cũ chỉ tụt khi thông tin trong nó đã sai.**

- **Chủ đề đổi theo thời gian** (giá, "tốt nhất 2026", luật, phiên bản phần mềm): bài "top app 2025" để nguyên sang 2026 sẽ tụt.
- **Chủ đề ổn định** (định nghĩa một khái niệm): bài cũ mà vẫn đúng thì không bị phạt vì cũ.
- Cách làm: định kỳ lọc trong GSC những trang có click giảm đều vài tháng, cập nhật thật số liệu và ảnh. Chỉ đổi ngày đăng mà không đổi nội dung thì vô ích, có thể bị coi là thao túng.

### Lời khuyên đã lỗi thời {#outdated-advice}

**Nhiều tài liệu, tool và cả AI skill vẫn lặp lại lời khuyên cũ; gặp chúng trong ticket là dấu hiệu người viết chưa cập nhật.**

| Lời khuyên | Thực tế |
|---|---|
| Giữ "mật độ keyword" X% | Google không đếm mật độ. Viết tự nhiên, đúng chủ đề; nhồi keyword có thể bị coi là spam |
| Thêm "LSI keywords" | Google nói rõ không dùng LSI. Ý đúng còn lại: bao phủ đủ các khía cạnh của chủ đề |
| `rel="next/prev"` cho phân trang | Google ngừng dùng từ 2019. Mỗi trang phân trang canonical về chính nó |
| Thêm FAQ / HowTo schema để có rich result | Từ 2023 FAQ rich result chỉ còn cho số ít site chính phủ, y tế; HowTo bỏ hẳn |
| Đăng bài AI hằng ngày để tăng topical authority | Tạo hàng loạt trang mỏng là **scaled content abuse**, đúng thứ Google phạt |
| Title đúng 50–60 ký tự, description 150–160 | Quy ước gần đúng. Google cắt theo độ rộng pixel và hay tự viết lại description |

::: info Nội dung do AI viết
Google không phạt nội dung chỉ vì do AI tạo. Thứ bị phạt là tạo hàng loạt trang kém để thao túng ranking, bất kể người hay máy viết. Nội dung chỉ tóm tắt lại thứ đã có trên web thì ngày càng khó có chỗ đứng, vì AI Overview đã làm việc đó rồi.
:::

## 8. Đo lường: GSC, GA4 và dữ liệu ước tính {#measurement}

**Mỗi công cụ đứng ở một chỗ khác nhau trên hành trình của người dùng, nên chúng đo những thứ khác nhau và số không bao giờ khớp.**

<div class="fig">
<svg viewBox="0 0 720 200" role="img" aria-label="Hành trình: query, impression trên SERP, click, rồi session và conversion trên site. Google Search Console đo đoạn trên Google trước click. GA4 đo đoạn trên site sau click. Tool bên thứ ba đứng ngoài, ước tính cho site của người khác">
<g font-size="11.5" text-anchor="middle">
<rect class="box" x="20" y="70" width="100" height="40" rx="6"/><text x="70" y="94">query</text>
<rect class="box" x="150" y="70" width="110" height="40" rx="6"/><text x="205" y="94">impression</text>
<rect class="boxAcc" x="290" y="70" width="90" height="40" rx="20"/><text x="335" y="94" font-weight="600">click</text>
<rect class="box" x="410" y="70" width="100" height="40" rx="6"/><text x="460" y="94">session</text>
<rect class="boxOk" x="540" y="70" width="110" height="40" rx="6"/><text x="595" y="94">conversion</text>
</g>
<line class="ln" x1="120" y1="90" x2="146" y2="90" marker-end="url(#seoInk)"/><line class="ln" x1="260" y1="90" x2="286" y2="90" marker-end="url(#seoInk)"/><line class="ln" x1="380" y1="90" x2="406" y2="90" marker-end="url(#seoInk)"/><line class="ln" x1="510" y1="90" x2="536" y2="90" marker-end="url(#seoInk)"/>
<path class="lnAcc" d="M20 58 V48 H378 V58"/><text x="199" y="40" font-size="12" font-weight="600" text-anchor="middle" class="accT">GSC: trên Google, dữ liệu thật</text>
<path class="lnOk" d="M292 122 V132 H650 V122"/><text x="471" y="150" font-size="12" font-weight="600" text-anchor="middle" class="okT">GA4: trên site, khi tag chạy được</text>
<rect class="box dash" x="20" y="164" width="250" height="28" rx="6"/><text x="145" y="183" font-size="11" text-anchor="middle" class="muted">Tool bên thứ ba: ước tính, site bất kỳ</text>
</svg>
<p class="fig-caption">Tự hỏi: GSC báo 1.000 click, GA4 báo 800 session organic; cái nào sai? Muốn biết đối thủ có bao nhiêu traffic thì dùng cái nào?</p>
</div>

| | <T>GSC</T> | <T>GA4</T> | Tool bên thứ ba |
|---|---|---|---|
| Đo gì | Query, impression, click, CTR, avg position, lỗi index | Session, nguồn traffic, hành vi, conversion | Keyword, ranking, backlink, traffic ước tính |
| Site nào | Chỉ site đã xác minh | Chỉ site có gắn tag | Bất kỳ domain nào |
| Độ chính xác | Thật (có lấy mẫu, ẩn query hiếm) | Thật (hụt vì adblock, cookie consent) | Ước tính, có thể lệch nhiều |
| Chi phí | Miễn phí | Miễn phí | Trả phí |

- Click trong GSC và session Organic Search trong GA4 **không bao giờ khớp**: GSC đếm click trên Google, GA4 đếm phiên khi tag chạy được. Chênh 10–30% là thường.
- **Traffic từ AI**: trong GA4 lọc referrer `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `claude.ai`. Traffic từ AI Overview và AI Mode thì bị gộp chung vào Search trong GSC, chưa tách được.

## 9. SEO trong thời AI {#ai-search}

**AI trả lời thay cho người dùng nên click giảm mạnh, nhưng AI vẫn cần nguồn để trả lời và chọn nguồn bằng cơ chế rất giống search; nên nền tảng SEO vẫn là điều kiện cần, chỉ mục tiêu mở rộng từ "được click" sang "được trích dẫn".**

### Chuyện gì đã thay đổi, theo số liệu {#ai-impact}

- Thử nghiệm ngẫu nhiên có đối chứng (Agarwal & Sen, 2026, hơn 1.000 người dùng Mỹ): khi có <T>AI Overview</T>, click ra website giảm khoảng 38–40%, tỉ lệ tìm kiếm <T>zero-click</T> tăng từ khoảng 54% lên 72%. Đây là đo lường nhân quả đầu tiên, không chỉ tương quan.
- Seer Interactive theo dõi hơn 5 triệu query: CTR organic trên query có AI Overview giảm từ khoảng 1.76% xuống 0.61%.
- <T>AI Mode</T> giảm click nhiều hơn AI Overview, và trích dẫn ít trùng top organic hơn: theo một phân tích, khoảng 19% trích dẫn của AI Mode nằm trong top 20 organic, so với khoảng 56% của AI Overview.
- Hệ quả dễ hiểu lầm: trong GSC impression và thứ hạng có thể **tăng** mà click **giảm**. Mặt tích cực: click còn lại chất lượng hơn, ở lại lâu hơn, convert tốt hơn.

### AI chọn nguồn như thế nào {#query-fan-out}

**AI tách câu hỏi dài thành nhiều câu nhỏ và search từng câu (<T>query fan-out</T>), rồi viết câu trả lời từ các đoạn tìm được (<T>RAG</T>); nên muốn được trích dẫn thì trước hết phải được tìm thấy cho các câu nhỏ đó.**

<div class="fig">
<svg viewBox="0 0 740 250" role="img" aria-label="Câu hỏi dài: app nào giúp người lương thấp tiết kiệm, ghi chi tiêu nhanh. AI tách thành bốn câu nhỏ: cách tiết kiệm khi lương thấp, app ghi chi tiêu nhanh, ghi chi tiêu bằng giọng nói, so sánh app chi tiêu. Trang của Talksum rank được cho hai câu nên được trích dẫn trong câu trả lời; hai câu kia không có trang nên không có mặt">
<rect class="box" x="20" y="96" width="170" height="58" rx="8"/><text x="105" y="118" font-size="11.5" text-anchor="middle">"App nào giúp người</text><text x="105" y="134" font-size="11.5" text-anchor="middle">lương thấp tiết kiệm,</text><text x="105" y="150" font-size="11.5" text-anchor="middle">ghi chi tiêu nhanh?"</text>
<g font-size="11" text-anchor="middle">
<rect class="box" x="260" y="16" width="200" height="34" rx="6"/><text x="360" y="38">tiết kiệm khi lương thấp</text>
<rect class="box dash" x="260" y="74" width="200" height="34" rx="6"/><text x="360" y="96" class="muted">app ghi chi tiêu nhanh</text>
<rect class="box" x="260" y="132" width="200" height="34" rx="6"/><text x="360" y="154">ghi chi tiêu bằng giọng nói</text>
<rect class="box dash" x="260" y="190" width="200" height="34" rx="6"/><text x="360" y="212" class="muted">so sánh app chi tiêu</text>
</g>
<line class="lnAcc" x1="190" y1="118" x2="256" y2="34" marker-end="url(#seoAcc)"/><line class="lnAcc" x1="190" y1="122" x2="256" y2="92" marker-end="url(#seoAcc)"/><line class="lnAcc" x1="190" y1="128" x2="256" y2="148" marker-end="url(#seoAcc)"/><line class="lnAcc" x1="190" y1="132" x2="256" y2="206" marker-end="url(#seoAcc)"/>
<text x="105" y="86" font-size="11" font-weight="600" text-anchor="middle" class="accT">query fan-out</text>
<path class="lnOk" d="M460 33 C 540 33, 540 100, 560 110" marker-end="url(#seoOk)"/>
<text x="470" y="95" font-size="10.5" class="badT">✕ không có trang</text>
<line class="lnOk" x1="460" y1="149" x2="560" y2="130" marker-end="url(#seoOk)"/>
<text x="470" y="211" font-size="10.5" class="badT">✕ không có trang</text>
<rect class="boxOk" x="565" y="96" width="160" height="58" rx="8"/><text x="645" y="118" font-size="11.5" font-weight="600" text-anchor="middle">Câu trả lời AI</text><text x="645" y="136" font-size="11" text-anchor="middle" class="okT">trích dẫn: talksum.app</text><text x="645" y="150" font-size="10" text-anchor="middle" class="muted">(2 trong 4 câu nhỏ)</text>
</svg>
<p class="fig-caption">Tự hỏi: muốn có mặt ở hai câu nhỏ còn lại thì cần thêm gì (gợi ý: <a href="#topic-cluster">topic cluster</a>)? Hỏi ChatGPT 5 lần ra 5 câu trả lời thì "vị trí #1" còn nghĩa gì?</p>
</div>

- Không có "vị trí #1" cố định trong ChatGPT: hỏi 5 lần có thể ra 5 câu trả lời. Đo lường chuyển sang **tần suất được nhắc tới**.

### GEO, AEO và quan điểm của Google {#geo}

<T>GEO</T> (Generative Engine Optimization), AEO (Answer Engine Optimization), LLMO... đều là tên cho việc tối ưu để được AI trích dẫn. Ngành có rất nhiều acronym, và nhiều người bán "dịch vụ GEO" như một môn mới hoàn toàn.

::: tip Quan điểm chính thức của Google (hướng dẫn tháng 5/2026)
AI Overview và AI Mode chạy trên chính hệ thống ranking và đánh giá chất lượng của Search, nên SEO tốt chính là tối ưu cho AI. Không có markup đặc biệt, không cần chia nhỏ nội dung kiểu riêng, không cần phiên bản site riêng cho chatbot.
:::

### Những gì thực sự nên làm thêm {#ai-what-to-do}

**Vì AI trích một đoạn gọn và dựa vào sự đồng thuận giữa nhiều nguồn, nên đoạn nào tự đứng được và brand nào được nhắc ở nhiều nơi thì dễ được chọn.**

- **Trả lời trước**: mỗi phần mở bằng 2–3 câu trả lời thẳng, rồi mới chi tiết.
- **Số liệu có nguồn**: nghiên cứu GEO của Princeton cho thấy thêm trích dẫn và số liệu có nguồn có thể tăng độ hiển thị trong câu trả lời AI khoảng 30–40%; đây là chiến thuật có bằng chứng tốt nhất hiện nay. Kèm quan điểm rõ và nội dung gốc: thứ chỉ tóm tắt lại web thì AI không cần bạn.
- **Brand được nhắc khắp nơi**: báo, Reddit, trang review, Wikipedia quan trọng hơn trước, kể cả khi không có link.

### Cho phép đúng AI crawler {#ai-crawlers}

**Có hai loại bot AI: bot lấy dữ liệu để train và bot tra cứu trực tiếp khi trả lời; chặn loại đầu không làm bạn biến mất khỏi câu trả lời, chặn loại sau thì có.**

```txt
# robots.txt: chặn bot train, cho phép bot tra cứu
User-agent: GPTBot          # OpenAI, train
Disallow: /
User-agent: OAI-SearchBot   # OpenAI, tra cứu cho ChatGPT search
Allow: /
User-agent: ClaudeBot       # Anthropic, train
Disallow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended # Gemini train; KHÔNG ảnh hưởng AI Overview
Disallow: /
```

- AI Overview và AI Mode dùng **Googlebot thông thường**: chặn Googlebot là biến mất khỏi cả Google Search.
- <T>llms.txt</T>: file Markdown đề xuất ở gốc site cho AI agent đọc. Chưa là chuẩn, chưa có bằng chứng giúp tăng trích dẫn; làm cũng không tốn công, nhưng đừng kỳ vọng.

### Đo độ hiển thị trên AI {#ai-visibility}

**Không có "Search Console cho ChatGPT", và câu trả lời AI đổi giữa các lần hỏi, nên cách đo là tự hỏi có hệ thống rồi nhìn xu hướng.**

1. Lập bộ 20–50 câu khách hàng thật sự hỏi: "app nào tốt nhất cho Y", "so sánh A với B", "thay thế cho C".
2. Chạy định kỳ trên ChatGPT, Perplexity, Gemini, Claude và AI Mode, mỗi câu vài lần.
3. Ghi lại: brand có được nhắc không, đứng thứ mấy, mô tả có đúng không, giọng điệu, đối thủ nào được nhắc thay, trang nào được trích dẫn.
4. Theo dõi xu hướng theo thời gian, không nhìn từng lần riêng lẻ. Kết hợp traffic referrer AI trong [GA4](#measurement) để biết được nhắc có mang lại khách không.

Các tool AI visibility ([nguồn dữ liệu](#data-providers)) tự động hoá đúng quy trình này.

::: details Còn kịp học SEO không?
Thời "SEO dễ kiếm tiền" (nhồi keyword, mua link, viết bài hàng loạt) đã qua từ trước khi có AI, vì Google chặn dần những cách đó. Phần đang mở ra: hiểu technical SEO sâu, hiểu AI crawler và cách AI chọn nguồn, đo được giá trị thật thay vì chỉ đếm click. Đây là nhóm kỹ năng developer có lợi thế, và ngành còn đang định hình. Điều cần cảnh giác: đừng học theo người bán "bí kíp GEO" không có số liệu.
:::

## 10. Nhà cung cấp dữ liệu SEO {#data-providers}

**Không có nhà cung cấp "tốt nhất"; chọn theo ba câu hỏi: cần loại dữ liệu nào, cần giao diện hay chỉ API, và lượng request có ổn định không.** Đây là chủ đề phụ, chỉ cần khi build tính năng SEO vào sản phẩm.

| Nhà cung cấp | Loại | Mạnh ở | Cách tính tiền | Chọn khi |
|---|---|---|---|---|
| Search Console, GA4 | First-party | Dữ liệu thật | Miễn phí | Site của bạn, hoặc người dùng cấp quyền qua OAuth |
| DataForSEO | API thô, không giao diện | Rất rộng: SERP, keyword, backlink, traffic ước tính. Rẻ khi dùng nhiều | Theo request, nạp trước (tối thiểu ~$50) | Build tính năng trong sản phẩm, lượng dùng thay đổi |
| Semrush API | Platform + API | Traffic ước tính, lịch sử nhiều năm | Gói platform cao (~$500+/tháng) rồi mua thêm API unit | Công ty đã dùng Semrush |
| Ahrefs API | Platform + API | Kho backlink mạnh, cập nhật nhanh | Gói enterprise | Backlink là trọng tâm |
| SE Ranking | Platform + API | Đủ loại, giá tầm trung, có MCP server | Credit, theo mức dùng | Team nhỏ, agency |
| SerpApi, Serper | Chỉ SERP | Nhanh, tài liệu dễ đọc | Theo số lượt search | Chỉ cần SERP thời gian thực |
| Majestic | Chuyên backlink | Trust Flow, Citation Flow | Subscription | Phân tích link chuyên sâu |
| Profound, Ahrefs Brand Radar | AI visibility | Theo dõi brand trong ChatGPT, Perplexity, Gemini | Subscription | Cần [đo GEO](#ai-visibility) |

Trước khi chọn, kiểm tra:

- **Thị trường**: dữ liệu cho Việt Nam hay Úc có đủ không; nhiều tool mạnh ở Mỹ nhưng mỏng ở thị trường nhỏ. **Độ chính xác**: so số ước tính của tool với số thật trong GSC của một site bạn sở hữu.
- **Điều khoản lưu trữ**: một số nhà cung cấp giới hạn thời gian cache (Semrush được cho là không cho quá 1 tháng), ảnh hưởng thẳng tới thiết kế hệ thống.
- **Tốc độ và giá**: DataForSEO có chế độ Standard (xếp hàng, rẻ, trả sau) và Live (tức thì, đắt hơn), một trade-off sync/async quen thuộc.

::: warning Đọc bài so sánh có chọn lọc
Rất nhiều bài "top SEO API 2026" do chính một vendor viết (vd blog của SE Ranking) và luôn xếp sản phẩm của mình lên đầu.
:::

## 11. Checklist tự setup SEO cho website {#setup-checklist}

**Làm theo đúng thứ tự trên [đường đi của URL](#pipeline): cho bot vào được, cho Google biết mình tồn tại, chuẩn hoá từng trang, rồi mới tới nội dung và uy tín; bước sau vô nghĩa nếu bước trước hỏng.**

1. **Nền tảng**: domain chính thức, HTTPS, chọn một dạng URL duy nhất (có hay không `www`) và 301 các dạng còn lại về nó.
2. **Cho bot vào**: `robots.txt` và `sitemap.xml`. Quyết định [bot AI nào được phép](#ai-crawlers).
3. **Nội dung render ở server**: `curl` xem HTML có nội dung chính không ([SPA, SSR, SSG](#js-rendering)).
4. **Chuẩn hoá từng trang**: title riêng, meta description, một H1, canonical, URL dễ đọc.
5. **Structured data**: tối thiểu Organization hoặc LocalBusiness, thêm Product / Article / SoftwareApplication tuỳ loại trang. Kiểm tra bằng Rich Results Test.
6. **Tốc độ**: PageSpeed Insights, xử lý ảnh nặng và script chặn render.
7. **Search Console**: xác minh site (bản ghi DNS TXT là ổn nhất), submit sitemap, đọc báo cáo Pages.
8. **GA4**: gắn tag, liên kết với Search Console, định nghĩa conversion (đăng ký, tải app...).
9. **Keyword research**: câu hỏi thật của khách theo [từng giai đoạn phễu](#funnel), kiểm tra intent bằng cách search thử, ưu tiên long-tail.
10. **Nội dung và internal link**: tổ chức thành [topic cluster](#topic-cluster), mỗi trang một chủ đề, trả lời trước, có nguồn. Không còn orphan page.
11. **Uy tín**: Google Business Profile (nếu có địa điểm), được nhắc ở báo chí, cộng đồng, trang review.
12. **Theo dõi hằng tháng**: GSC (query, index, link hỏng, trang có click giảm), GA4 (conversion, traffic từ AI), bộ câu hỏi AI, rồi lặp lại từ bước 9.

## Câu hỏi phỏng vấn {#interview}

Các câu developer full-stack hay gặp khi sản phẩm cần được tìm thấy.

### App Vue/React (SPA) có làm SEO được không? <Badge type="warning" text="hay bị hỏi" /> {#spa-seo}

::: tip Trả lời nhanh
Được nhưng rủi ro: HTML ban đầu của SPA gần như trống, Googlebot phải xếp hàng render JS, nhiều AI crawler không chạy JS nên thấy trang trắng. Trang cần được tìm thấy (landing, blog, trang sản phẩm) thì SSR (Nuxt, Next) hoặc SSG; trang sau đăng nhập để SPA. Xem [JS rendering](#js-rendering).
:::

::: details Câu trả lời mẫu (English)
- Bots read the HTML the server returns; a pure SPA returns an empty shell.
- Googlebot renders JS, but in a queue and not guaranteed; many AI crawlers don't run JS at all.
- So public pages: SSG if content rarely changes (cheapest), SSR if it's per-request or very dynamic.
- Pages behind login don't need indexing, so a plain SPA is fine there.
- Quick check: `curl` the URL and look for the main content.
:::

::: warning Bẫy & follow-up
**"Google chạy JS rồi mà, cần gì SSR?"**

Googlebot chạy, nhưng ở hàng đợi render riêng, chậm và không đảm bảo; còn AI crawler thì nhiều con không chạy. Trả lời bằng "phụ thuộc bot nào", đừng nói "Google không đọc được SPA" (sai).

**"SSR hay SSG?"**

Nội dung giống nhau cho mọi người và ít đổi thì SSG (build một lần, phục vụ từ CDN). Nội dung theo request (giá theo vùng, dữ liệu realtime) thì SSR, đổi lại phải có server render mỗi request.
:::

### robots.txt và noindex khác nhau thế nào? {#robots-vs-noindex}

::: tip Trả lời nhanh
`robots.txt` chặn bước **crawl**, `noindex` chặn bước **index**. Hai bước tách rời nên Disallow không ngăn trang hiện trên Google (Google biết URL qua link). Muốn ẩn: `noindex` và phải **cho crawl** để bot đọc được thẻ. Xem [robots.txt, sitemap và noindex](#robots-noindex).
:::

::: details Câu trả lời mẫu (English)
- Crawl and index are separate steps: robots.txt controls crawling, noindex controls indexing.
- A disallowed URL can still be indexed from external links, just without a snippet.
- To keep a page out: allow crawling and add `noindex`; blocking it would hide the tag.
- Classic incident: staging `noindex` shipped to production.
:::

::: warning Bẫy & follow-up
**"Vừa Disallow vừa noindex cho chắc?"**

Ngược tác dụng: bị Disallow thì bot không tải trang, không đọc được `noindex`. Chọn một: muốn ẩn khỏi kết quả thì chỉ dùng `noindex`.
:::

### 301 và 302 khác nhau thế nào, khi nào dùng cái nào? {#redirect-301-302}

::: tip Trả lời nhanh
301 vĩnh viễn: Google chuyển uy tín và index sang URL mới (đổi URL, gộp trang, đổi domain). 302 tạm thời: Google giữ URL cũ (bảo trì, A/B test). Dùng 302 cho thay đổi vĩnh viễn là lỗi phổ biến. Xem [Redirect và link hỏng](#redirects).
:::

::: details Câu trả lời mẫu (English)
- 301 says "moved for good": Google transfers signals and indexes the new URL.
- 302 says "temporary": the old URL stays indexed.
- Avoid chains (A→B→C): point A straight to the final URL and update internal links.
- Deleted page with no replacement: 404/410, not a redirect to the homepage (soft 404).
:::

::: warning Bẫy & follow-up
**"ASP.NET Core `Redirect()` trả mã gì?"**

`Redirect()` trả 302; `RedirectPermanent()` trả 301 (còn có 307/308 giữ nguyên HTTP method). Đổi URL vĩnh viễn mà dùng `Redirect()` là đúng lỗi trên.
:::

### Canonical dùng khi nào? {#canonical-when}

::: tip Trả lời nhanh
Khi nhiều URL cho cùng nội dung (`?sort=`, `?utm=`, có/không `www`, phân trang theo bộ lọc): `rel="canonical"` chỉ ra bản chính để uy tín không bị chia nhỏ và Google không chọn nhầm bản. Site đa ngôn ngữ: mỗi bản canonical về chính nó. Xem [Các thẻ trong head](#head-tags).
:::

::: details Câu trả lời mẫu (English)
- Same content under many URLs splits signals and lets Google pick the "wrong" one.
- Canonical is a strong hint (not a directive) naming the preferred URL.
- With hreflang, each language version is canonical to itself, never to the English one.
:::

::: warning Bẫy & follow-up
**"Canonical khác 301 thế nào?"**

301 đưa cả người dùng lẫn bot sang URL khác; canonical để người dùng ở lại URL đó (vd trang có `?sort=`) và chỉ nói với Google bản nào để index. Canonical là gợi ý, Google có thể bỏ qua nếu tín hiệu khác mâu thuẫn.
:::

### AI Overview làm click giảm. Với tư cách developer bạn làm gì? <Badge type="warning" text="câu product" /> {#seo-ai-era}

::: tip Trả lời nhanh
AI vẫn chọn nguồn bằng search (query fan-out + RAG), nên nền tảng SEO vẫn là điều kiện cần. Thêm: nội dung render ở server để AI bot đọc được, cho phép bot tra cứu trong `robots.txt`, viết trả lời trước có số liệu, topic cluster phủ các câu nhỏ, và đo bằng bộ câu hỏi AI + referrer AI trong GA4. Xem [SEO trong thời AI](#ai-search).
:::

::: details Câu trả lời mẫu (English)
- AI answers still retrieve sources through search (query fan-out, RAG); you must rank for the sub-questions first.
- Make content readable without JS (SSR/SSG); allow search bots like OAI-SearchBot, Claude-SearchBot.
- Answer-first sections with sourced numbers; clusters that cover each sub-question.
- Measure differently: mention frequency over a fixed question set, plus AI referrers in GA4.
:::

::: warning Bẫy & follow-up
**"Có cần markup riêng cho AI, hay llms.txt không?"**

Theo Google (5/2026): không có markup đặc biệt; SEO tốt là tối ưu cho AI. `llms.txt` chưa là chuẩn, chưa có bằng chứng.

**"Chặn GPTBot có làm mất mặt trên ChatGPT không?"**

GPTBot là bot train; bot tra cứu là OAI-SearchBot. Chặn cái trước, cho cái sau. Còn `Google-Extended` không ảnh hưởng AI Overview.
:::

## Hỏi đáp {#qa}

### Nguồn tham khảo {#qa-sources}

::: details Tài liệu, tool hay AI skill về SEO có đáng tin không?
Dùng để tìm ý và checklist thì tốt, nhưng đừng coi là chuẩn. Nhiều nguồn do vendor viết để bán sản phẩm và vẫn lặp lại lời khuyên cũ (xem [lời khuyên đã lỗi thời](#outdated-advice)). Khi mâu thuẫn, ưu tiên tài liệu chính thức của Google Search Central, sau đó là nghiên cứu có phương pháp rõ ràng.
:::

::: details Nguồn chính của trang này
- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Tóm tắt hướng dẫn tối ưu cho AI của Google (5/2026)](https://www.semrush.com/blog/google-publishes-generative-ai-search-guide/)
- [Search Engine Journal: thử nghiệm ngẫu nhiên về AI Overview và click](https://www.searchenginejournal.com/ai-overviews-cut-organic-clicks-38-field-study-finds/573145/)
- [Tổng hợp các nghiên cứu CTR khi có AI Overview](https://www.relevantaudience.com/seo/ai-overview-impact-on-organic-search-2026/)
- [So sánh AI Overview và AI Mode](https://heybuffy.com/blog/ai-overviews-vs-ai-mode-click-loss)
- [Similarweb: hướng dẫn GEO](https://aisearch.similarweb.com/blog/what-is-geo/)
- [LLM Pulse: danh sách AI crawler và llms.txt](https://llmpulse.ai/blog/geo-guide/)
- [So sánh các SEO API (bài của SE Ranking, lưu ý thiên vị)](https://seranking.com/blog/ahrefs-api-alternatives/)
:::

## Tự kiểm tra {#self-check}

1. Landing page Talksum có trong `sitemap.xml` nhưng GSC báo "Discovered, currently not indexed" và không có link nội bộ nào trỏ tới. Hai nguyên nhân khả dĩ là gì?
2. Bạn thêm `Disallow: /pricing` để ẩn trang giá cũ, một tuần sau nó vẫn hiện trên Google. Vì sao, và sửa thế nào?
3. Đổi `/blog/old-slug` sang `/blog/new-slug` bằng `Redirect()` trong ASP.NET Core. Ba tháng sau URL cũ vẫn trong index. Chuyện gì đã xảy ra?
4. KD của một keyword là 30 trên Ahrefs và 55 trên Semrush. Keyword đó dễ hay khó?
5. GSC báo vị trí trung bình tăng từ 8 lên 4, impression tăng, mà click giảm. Có mâu thuẫn không?
6. Nếu chặn `ClaudeBot` trong `robots.txt` thì Talksum có biến mất khỏi câu trả lời của Claude không? Còn chặn `Googlebot` thì sao với AI Overview?
