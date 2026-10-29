<script setup lang="ts">
// Hình minh hoạ nhỏ cho từng bước của FlowStep (runtime/async-flow): mỗi `name` một SVG 132×88.
// Chỉ dùng biến màu của theme, nên tự đổi theo light/dark. Nhãn trong hình để tiếng Anh, thật ngắn.
// Thêm hình mới: thêm một nhánh v-else-if với name mới, rồi dùng <FlowStep icon="name">.
defineProps<{ name: string }>()
</script>

<template>
  <svg class="si" viewBox="0 0 132 88" role="img" :aria-label="name">
    <!-- 1. Browser: bấm nút Approve -->
    <g v-if="name === 'click'">
      <rect class="frame" x="8" y="8" width="116" height="72" rx="6" />
      <line class="ln" x1="8" y1="22" x2="124" y2="22" />
      <circle class="dot" cx="17" cy="15" r="2.2" /><circle class="dot" cx="25" cy="15" r="2.2" /><circle class="dot" cx="33" cy="15" r="2.2" />
      <rect class="btn" x="34" y="38" width="64" height="20" rx="10" />
      <text class="t tb on" x="66" y="52" text-anchor="middle">Approve</text>
      <circle class="ripple" cx="96" cy="56" r="9" />
      <path class="cursor" d="M96 54 l0 17 l4.5 -4.2 l3.3 7 l3 -1.4 l-3.3 -6.8 l6 -0.4 z" />
      <text class="t" x="14" y="75">UI thread</text>
    </g>

    <!-- 2. Network: các gói tin đi trên dây -->
    <g v-else-if="name === 'network'">
      <rect class="frame" x="6" y="28" width="26" height="20" rx="3" />
      <line class="ln" x1="2" y1="52" x2="36" y2="52" />
      <rect class="frame" x="104" y="20" width="22" height="40" rx="3" />
      <line class="ln" x1="108" y1="30" x2="122" y2="30" /><line class="ln" x1="108" y1="38" x2="122" y2="38" />
      <path class="wire" d="M36 40 C 56 22, 76 58, 102 40" />
      <rect class="pkt p1" x="46" y="30" width="8" height="8" rx="1.5" />
      <rect class="pkt p2" x="64" y="38" width="8" height="8" rx="1.5" />
      <rect class="pkt p3" x="82" y="34" width="8" height="8" rx="1.5" />
      <text class="t" x="66" y="74" text-anchor="middle">HTTP bytes →</text>
      <text class="t ok" x="66" y="84" text-anchor="middle">0 threads</text>
    </g>

    <!-- 3. Lớp chặn: tường lửa có một cửa, Kestrel đứng sau -->
    <g v-else-if="name === 'gate'">
      <g class="brick">
        <rect x="44" y="6" width="16" height="10" /><rect x="44" y="18" width="16" height="10" />
        <rect x="44" y="58" width="16" height="10" /><rect x="44" y="70" width="16" height="10" />
      </g>
      <text class="t s tb ok" x="52" y="54" text-anchor="middle">443</text>
      <path class="arrow" d="M8 40 H40" /><path class="head" d="M40 36 l6 4 l-6 4 z" />
      <path class="bad-ln" d="M8 14 L36 14" /><path class="bad-ln" d="M34 10 l6 8 M40 10 l-6 8" />
      <text class="t s bad" x="8" y="27">:1433</text>
      <rect class="box-acc" x="74" y="22" width="52" height="36" rx="5" />
      <text class="t tb acc" x="100" y="38" text-anchor="middle">Kestrel</text>
      <text class="t" x="100" y="50" text-anchor="middle">listen</text>
      <path class="arrow" d="M60 40 H70" /><path class="head" d="M70 36 l5 4 l-5 4 z" />
      <path class="bell" d="M94 66 a6 6 0 0 1 12 0 v5 l2 3 h-16 l2 -3 z" />
      <text class="t" x="112" y="80">IOCP</text>
    </g>

    <!-- 4. Pipeline: Thread #7 mang request đi qua middleware -->
    <g v-else-if="name === 'pipeline'">
      <circle class="person" cx="14" cy="22" r="6" />
      <path class="person-ln" d="M14 28 v18 M14 46 l-6 12 M14 46 l6 12 M6 34 h16" />
      <rect class="env" x="18" y="30" width="12" height="9" rx="1" /><path class="ln" d="M18 30 l6 5 l6 -5" />
      <text class="t warn tb" x="14" y="72" text-anchor="middle">#7</text>
      <g>
        <rect class="box" x="38" y="28" width="24" height="16" rx="3" /><text class="t s" x="50" y="39" text-anchor="middle">log</text>
        <rect class="box" x="66" y="28" width="24" height="16" rx="3" /><text class="t s" x="78" y="39" text-anchor="middle">auth</text>
        <rect class="box" x="94" y="28" width="24" height="16" rx="3" /><text class="t s" x="106" y="39" text-anchor="middle">route</text>
      </g>
      <path class="arrow" d="M34 52 H118" /><path class="head" d="M118 48 l6 4 l-6 4 z" />
      <rect class="box-ok" x="68" y="60" width="60" height="18" rx="3" />
      <text class="t s ok" x="98" y="72" text-anchor="middle">Approve(42)</text>
      <text class="t" x="38" y="20">middleware</text>
    </g>

    <!-- 5. Code chạy đồng bộ tới await -->
    <g v-else-if="name === 'sync'">
      <rect class="frame" x="8" y="6" width="116" height="76" rx="5" />
      <path class="ok-ln" d="M16 20 l3 3 l5 -6" /><rect class="code" x="30" y="17" width="70" height="5" rx="2" />
      <path class="ok-ln" d="M16 32 l3 3 l5 -6" /><rect class="code" x="30" y="29" width="54" height="5" rx="2" />
      <path class="ok-ln" d="M16 44 l3 3 l5 -6" /><rect class="code" x="30" y="41" width="62" height="5" rx="2" />
      <rect class="await-bg" x="12" y="52" width="108" height="16" rx="3" />
      <text class="t tb warn mono" x="18" y="64">await</text>
      <rect class="code dim" x="52" y="58" width="48" height="5" rx="2" />
      <path class="head warn-f" d="M4 56 l6 4 l-6 4 z" />
      <text class="t" x="66" y="78" text-anchor="middle">same thread #7</text>
    </g>

    <!-- 6. SqlClient gửi SELECT tới DB, trả về Task chưa xong -->
    <g v-else-if="name === 'query'">
      <rect class="box-warn" x="4" y="22" width="44" height="20" rx="3" />
      <text class="t s tb" x="26" y="35" text-anchor="middle">SqlClient</text>
      <path class="arrow" d="M50 30 H90" /><path class="head" d="M90 26 l6 4 l-6 4 z" />
      <text class="t s mono" x="70" y="24" text-anchor="middle">SELECT</text>
      <g class="db"><path d="M100 18 v34 a14 5 0 0 0 28 0 v-34" /><ellipse cx="114" cy="18" rx="14" ry="5" /></g>
      <text class="t s" x="114" y="40" text-anchor="middle">SQL</text>
      <path class="arrow dash" d="M96 62 H52" /><path class="head" d="M52 58 l-6 4 l6 4 z" />
      <rect class="ticket" x="8" y="54" width="36" height="18" rx="3" />
      <text class="t s tb" x="26" y="66" text-anchor="middle">Task ⏳</text>
      <text class="t s" x="84" y="80" text-anchor="middle">not done yet</text>
    </g>

    <!-- 7. Awaiter hỏi IsCompleted, state machine ghi state -->
    <g v-else-if="name === 'state'">
      <rect class="card" x="6" y="8" width="70" height="72" rx="4" />
      <rect class="card-top" x="6" y="8" width="70" height="14" rx="4" />
      <text class="t s tb on" x="41" y="18" text-anchor="middle">state machine</text>
      <text class="t mono tb acc" x="12" y="36">state = 0</text>
      <text class="t mono s" x="12" y="50">id = 42</text>
      <text class="t mono s" x="12" y="62">ct, a1 …</text>
      <text class="t mono s" x="12" y="74">MoveNext()</text>
      <rect class="box" x="80" y="22" width="50" height="26" rx="10" />
      <text class="t xs" x="105" y="33" text-anchor="middle">IsCompleted</text>
      <text class="t tb bad" x="105" y="44" text-anchor="middle">false</text>
      <path class="arrow" d="M106 50 v10" /><path class="head" d="M102 60 l4 6 l4 -6 z" />
      <text class="t xs" x="104" y="76" text-anchor="middle">OnCompleted</text>
    </g>

    <!-- 8. Card ghim lên heap, Thread #7 về pool -->
    <g v-else-if="name === 'release'">
      <rect class="board" x="4" y="6" width="56" height="44" rx="4" />
      <text class="t s" x="32" y="16" text-anchor="middle">heap</text>
      <rect class="card" x="12" y="22" width="40" height="22" rx="2" />
      <text class="t s mono acc" x="32" y="36" text-anchor="middle">state=0</text>
      <circle class="pin" cx="32" cy="22" r="3" />
      <rect class="pool" x="80" y="40" width="48" height="40" rx="6" />
      <text class="t s tb ok" x="104" y="76" text-anchor="middle">pool</text>
      <circle class="person" cx="96" cy="50" r="4" /><path class="person-ln" d="M96 54 v8 M90 58 h12" />
      <text class="t s tb warn" x="114" y="60" text-anchor="middle">#7</text>
      <path class="arrow" d="M58 64 C 66 64, 70 60, 76 60" /><path class="head" d="M76 56 l6 4 l-6 4 z" />
      <text class="t ok" x="6" y="66">no thread</text>
      <text class="t ok" x="6" y="76">waiting</text>
    </g>

    <!-- 9. SQL Server tự chạy query bằng thread của nó -->
    <g v-else-if="name === 'dbwork'">
      <g class="db-red"><path d="M46 14 v50 a20 6 0 0 0 40 0 v-50" /><ellipse cx="66" cy="14" rx="20" ry="6" /></g>
      <g class="gear spin"><circle cx="66" cy="42" r="8" /><path d="M66 30 v4 M66 50 v4 M54 42 h4 M74 42 h4 M57.5 33.5 l2.8 2.8 M71.7 47.7 l2.8 2.8 M57.5 50.5 l2.8 -2.8 M71.7 36.3 l2.8 -2.8" /></g>
      <text class="t s tb bad" x="66" y="84" text-anchor="middle">SQL Server</text>
      <rect class="box-ok dash" x="94" y="30" width="34" height="26" rx="4" />
      <text class="t s ok" x="111" y="41" text-anchor="middle">app</text>
      <text class="t s tb ok" x="111" y="51" text-anchor="middle">0 thr</text>
      <text class="t s" x="6" y="40">its own</text>
      <text class="t s" x="6" y="50">threads</text>
    </g>

    <!-- 10. OS báo I/O xong: chuông, việc vào queue -->
    <g v-else-if="name === 'bell'">
      <path class="bell big" d="M50 46 a16 16 0 0 1 32 0 v10 l6 8 h-44 l6 -8 z" /><circle class="bell" cx="66" cy="68" r="4" />
      <path class="ring" d="M38 30 q-6 10 0 20 M30 26 q-9 14 0 28 M94 30 q6 10 0 20 M102 26 q9 14 0 28" />
      <text class="t tb acc" x="66" y="20" text-anchor="middle">IOCP / epoll</text>
      <rect class="tray" x="100" y="66" width="28" height="14" rx="2" />
      <rect class="pkt" x="104" y="69" width="8" height="8" rx="1" />
      <text class="t s" x="114" y="62" text-anchor="middle">queue</text>
      <path class="arrow" d="M84 70 H96" /><path class="head" d="M96 66 l5 4 l-5 4 z" />
      <text class="t s" x="6" y="82">I/O done</text>
    </g>

    <!-- 11. Thread #12 lấy card, chạy tiếp case 0 -->
    <g v-else-if="name === 'resume'">
      <rect class="board" x="4" y="6" width="44" height="34" rx="4" />
      <text class="t s" x="26" y="16" text-anchor="middle">heap</text>
      <path class="arrow dash" d="M48 24 C 62 24, 66 34, 70 40" /><path class="head" d="M66 38 l6 6 l1 -8 z" />
      <circle class="person" cx="82" cy="20" r="6" />
      <path class="person-ln" d="M82 26 v18 M82 44 l-6 12 M82 44 l6 12 M72 32 h18" />
      <rect class="card" x="90" y="24" width="40" height="20" rx="2" />
      <text class="t s mono acc" x="110" y="37" text-anchor="middle">case 0</text>
      <text class="t tb warn" x="82" y="70" text-anchor="middle">#12</text>
      <text class="t s" x="6" y="58">any free</text>
      <text class="t s" x="6" y="68">pool thread</text>
      <text class="t s mono" x="6" y="82">MoveNext()</text>
    </g>

    <!-- 12. Việc CPU: bánh răng -->
    <g v-else-if="name === 'cpu'">
      <rect class="chip" x="40" y="10" width="52" height="52" rx="6" />
      <path class="pins" d="M50 4 v6 M62 4 v6 M74 4 v6 M86 4 v6 M50 62 v6 M62 62 v6 M74 62 v6 M86 62 v6 M34 20 h6 M34 32 h6 M34 44 h6 M34 56 h6 M92 20 h6 M92 32 h6 M92 44 h6 M92 56 h6" />
      <g class="gear spin"><circle cx="66" cy="36" r="10" /><path d="M66 20 v5 M66 47 v5 M50 36 h5 M77 36 h5 M54.7 24.7 l3.5 3.5 M73.8 43.8 l3.5 3.5 M54.7 47.3 l3.5 -3.5 M73.8 28.2 l3.5 -3.5" /></g>
      <text class="t mono tb" x="66" y="82" text-anchor="middle">Approve()</text>
      <text class="t s ok" x="108" y="30">µs</text>
      <text class="t s" x="104" y="42">no await</text>
    </g>

    <!-- 13. SaveChangesAsync: UPDATE tới DB, vòng lặp lại -->
    <g v-else-if="name === 'save'">
      <rect class="card" x="4" y="14" width="40" height="22" rx="2" />
      <text class="t s mono acc" x="24" y="28" text-anchor="middle">state=1</text>
      <path class="arrow" d="M48 25 H88" /><path class="head" d="M88 21 l6 4 l-6 4 z" />
      <text class="t s mono" x="68" y="19" text-anchor="middle">UPDATE</text>
      <g class="db"><path d="M98 12 v34 a14 5 0 0 0 28 0 v-34" /><ellipse cx="112" cy="12" rx="14" ry="5" /></g>
      <path class="loop" d="M40 44 a26 12 0 1 0 52 0" /><path class="head" d="M88 40 l6 4 l-2 -7 z" />
      <text class="t s" x="66" y="70" text-anchor="middle">same loop</text>
      <text class="t s" x="66" y="82" text-anchor="middle">#12 → pool → any</text>
    </g>

    <!-- 14. Task xong, ghi 204, dispose scope -->
    <g v-else-if="name === 'respond'">
      <rect class="box-acc" x="6" y="18" width="46" height="42" rx="5" />
      <text class="t s tb acc" x="29" y="32" text-anchor="middle">Task</text>
      <path class="ok-ln thick" d="M20 44 l6 6 l12 -12" />
      <path class="arrow" d="M56 39 H100" /><path class="head" d="M100 35 l6 4 l-6 4 z" />
      <text class="t tb ok" x="80" y="33" text-anchor="middle">204</text>
      <text class="t s" x="80" y="52" text-anchor="middle">No Content</text>
      <rect class="frame" x="108" y="26" width="20" height="26" rx="3" />
      <text class="t xs" x="118" y="62" text-anchor="middle">client</text>
      <text class="t s" x="6" y="76">scope + DbContext</text>
      <text class="t s" x="6" y="85">disposed</text>
    </g>

    <!-- 15. Browser: Promise resolve, badge Approved -->
    <g v-else-if="name === 'resolve'">
      <rect class="frame" x="8" y="8" width="116" height="72" rx="6" />
      <line class="ln" x1="8" y1="22" x2="124" y2="22" />
      <circle class="dot" cx="17" cy="15" r="2.2" /><circle class="dot" cx="25" cy="15" r="2.2" /><circle class="dot" cx="33" cy="15" r="2.2" />
      <rect class="badge-ok" x="30" y="32" width="72" height="20" rx="10" />
      <text class="t tb ok" x="66" y="46" text-anchor="middle">✓ Approved</text>
      <text class="t mono s" x="66" y="70" text-anchor="middle">Promise resolved</text>
    </g>
  </svg>
</template>

<style scoped>
/* Kích thước hiển thị do nơi dùng quyết định qua --si-w (mặc định 132px); hình và chữ co giãn theo */
.si { display: block; width: var(--si-w, 132px); height: auto; aspect-ratio: 3 / 2; overflow: visible; }

/* Chữ: selector có class + data-v nên thắng `.vp-doc svg text` trong custom.css */
.si .t { font-family: var(--vp-font-family-base); font-size: 10px; fill: var(--vp-c-text-2); }
.si .t.s { font-size: 9px; }
.si .t.tb { font-weight: 700; }
.si .t.mono { font-family: var(--vp-font-family-mono); }
.si .t.acc { fill: var(--vp-c-brand-1); }
.si .t.ok { fill: var(--vp-c-green-1); }
.si .t.warn { fill: var(--vp-c-warning-1); }
.si .t.bad { fill: var(--vp-c-red-1); }
.si .t.on { fill: var(--vp-c-bg); }
.si .t.xs { font-size: 8px; }

/* Nét và khối */
.si .frame, .si .box, .si .board, .si .card { fill: var(--vp-c-bg); stroke: var(--vp-c-text-3); stroke-width: 1.5; }
.si .card { stroke: var(--vp-c-brand-1); fill: var(--vp-c-brand-soft); }
.si .card-top { fill: var(--vp-c-brand-1); }
.si .board { fill: var(--vp-c-bg-soft); stroke-dasharray: 4 3; }
.si .ln, .si .person-ln, .si .pins { stroke: var(--vp-c-text-3); stroke-width: 1.5; fill: none; stroke-linecap: round; }
.si .person-ln { stroke: var(--vp-c-text-1); stroke-width: 2; }
.si .person { fill: none; stroke: var(--vp-c-text-1); stroke-width: 2; }
.si .dot { fill: var(--vp-c-text-3); }
.si .btn { fill: var(--vp-c-brand-1); }
.si .ripple { fill: none; stroke: var(--vp-c-brand-1); stroke-width: 1.5; opacity: .6; }
.si .cursor { fill: var(--vp-c-text-1); stroke: var(--vp-c-bg); stroke-width: 1.2; }
.si .wire { fill: none; stroke: var(--vp-c-text-3); stroke-width: 2; stroke-dasharray: 3 4; }
.si .pkt { fill: var(--vp-c-brand-1); }
.si .brick rect { fill: var(--vp-c-red-soft); stroke: var(--vp-c-red-1); stroke-width: 1.2; }
.si .arrow { fill: none; stroke: var(--vp-c-text-2); stroke-width: 1.8; }
.si .arrow.dash, .si .dash { stroke-dasharray: 4 3; }
.si .head { fill: var(--vp-c-text-2); }
.si .head.warn-f { fill: var(--vp-c-warning-1); }
.si .ok-ln { fill: none; stroke: var(--vp-c-green-1); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.si .ok-ln.thick { stroke-width: 3; }
.si .bad-ln { fill: none; stroke: var(--vp-c-red-1); stroke-width: 1.8; stroke-linecap: round; }
.si .box-acc { fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 1.5; }
.si .box-ok { fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 1.5; }
.si .box-warn, .si .ticket { fill: var(--vp-c-warning-soft); stroke: var(--vp-c-warning-1); stroke-width: 1.5; }
.si .bell { fill: var(--vp-c-warning-soft); stroke: var(--vp-c-warning-1); stroke-width: 1.5; }
.si .ring { fill: none; stroke: var(--vp-c-warning-1); stroke-width: 1.8; stroke-linecap: round; }
.si .tray { fill: var(--vp-c-bg-soft); stroke: var(--vp-c-text-3); stroke-width: 1.5; }
.si .env { fill: var(--vp-c-bg); stroke: var(--vp-c-text-2); stroke-width: 1.2; }
.si .code { fill: var(--vp-c-text-3); opacity: .55; }
.si .code.dim { opacity: .3; }
.si .await-bg { fill: var(--vp-c-warning-soft); stroke: var(--vp-c-warning-1); stroke-width: 1.2; }
.si .db path, .si .db ellipse { fill: var(--vp-c-bg-soft); stroke: var(--vp-c-text-2); stroke-width: 1.5; }
.si .db-red path, .si .db-red ellipse { fill: var(--vp-c-red-soft); stroke: var(--vp-c-red-1); stroke-width: 1.5; }
.si .gear circle { fill: none; stroke: var(--vp-c-text-1); stroke-width: 2; }
.si .gear path { stroke: var(--vp-c-text-1); stroke-width: 3; stroke-linecap: round; }
.si .chip { fill: var(--vp-c-bg-soft); stroke: var(--vp-c-text-2); stroke-width: 1.5; }
.si .pin { fill: var(--vp-c-red-1); }
.si .pool { fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 1.5; }
.si .loop { fill: none; stroke: var(--vp-c-text-2); stroke-width: 1.6; stroke-dasharray: 4 3; }
.si .badge-ok { fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 1.5; }

/* Chuyển động nhẹ; tắt khi người dùng chọn giảm chuyển động */
.si .spin { transform-box: fill-box; transform-origin: center; animation: si-spin 6s linear infinite; }
.si .p1, .si .p2, .si .p3 { animation: si-blink 1.8s ease-in-out infinite; }
.si .p2 { animation-delay: .6s; }
.si .p3 { animation-delay: 1.2s; }
@keyframes si-spin { to { transform: rotate(360deg); } }
@keyframes si-blink { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .si .spin, .si .p1, .si .p2, .si .p3 { animation: none; } }
</style>
