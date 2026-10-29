<script setup lang="ts">
// Bản đồ tổng quan cho aspnet-core/api-security, kể như một cái phễu:
// 1 triệu request/phút đổ vào (đang bị tấn công), trong đó có 1 request thật của chị Lan.
// Mỗi hàng là một bước: hình nhỏ của bước đó, request của chị Lan bị làm gì, lớp đó loại bỏ cái gì,
// và thanh "còn lại" ngắn dần (thang log). Nguyên tắc nhìn thấy được: lọc rẻ, số lượng lớn trước;
// càng vào trong, request càng ít nhưng mỗi request được soi kỹ hơn.
// Số liệu là minh hoạ, không phải số đo thật. Bấm một hàng để tới #step-n.
import StepIcon from './StepIcon.vue'

type Kind = 'deny' | 'allow' | 'limit' | 'none'

interface Row {
  n: number
  icon: string
  name: string
  lan: string // request của chị Lan ở bước này
  drop?: string // cái bị loại
  kind: Kind
  left: number // số request còn lại sau bước này
}

interface Phase {
  title: string
  check: string // lớp này soi theo cái gì
  rows: Row[]
}

const START = 1_000_000

const phases: Phase[] = [
  {
    title: 'Đóng gói',
    check: 'chưa lọc, chỉ niêm phong',
    rows: [
      {
        n: 1,
        icon: 'tls',
        name: 'TLS',
        lan: 'được bỏ vào phong bì niêm phong: ai đứng giữa đường cũng chỉ thấy byte rác',
        drop: 'kẻ nghe lén, server giả (sai certificate)',
        kind: 'allow',
        left: START,
      },
    ],
  },
  {
    title: 'Lọc thô ở edge',
    check: 'soi theo số lượng và pattern, rẻ, chưa biết ai gửi',
    rows: [
      {
        n: 2,
        icon: 'ddos',
        name: 'CDN chống DDoS',
        lan: 'đi qua máy edge gần nhất, lẫn trong dòng traffic khổng lồ',
        drop: 'flood từ botnet: mạng edge hấp thụ gần hết',
        kind: 'deny',
        left: 20_000,
      },
      {
        n: 3,
        icon: 'waf',
        name: 'WAF',
        lan: 'bị mở ra soi nội dung: URL, header, body không có pattern xấu nên qua',
        drop: "request chứa ' OR 1=1, <script>, scanner tự động",
        kind: 'deny',
        left: 15_000,
      },
      {
        n: 4,
        icon: 'gateway',
        name: 'Gateway',
        lan: 'được chuyển vào mạng nội bộ, tới đúng app; app không có IP public',
        drop: 'gọi thẳng vào server, path không có route',
        kind: 'allow',
        left: 14_000,
      },
    ],
  },
  {
    title: 'Hỏi danh tính và quyền',
    check: 'soi từng người gửi: bao nhiêu lần, là ai, được làm gì',
    rows: [
      {
        n: 5,
        icon: 'ratelimit',
        name: 'Rate limit',
        lan: 'chị Lan mới gọi vài lần trong phút này, còn hạn mức',
        drop: 'một IP thử mật khẩu 500 lần/phút → 429',
        kind: 'limit',
        left: 2_000,
      },
      {
        n: 6,
        icon: 'cors',
        name: 'CORS',
        lan: 'gửi từ app.payouthub.example, đúng origin được phép',
        drop: 'không giảm số request: đây là luật của browser, chặn trang lạ đọc response',
        kind: 'none',
        left: 2_000,
      },
      {
        n: 7,
        icon: 'jwt',
        name: 'JWT',
        lan: 'token có chữ ký đúng của Entra ID: biết đây là chị Lan',
        drop: 'không có token, token giả, token hết hạn → 401',
        kind: 'allow',
        left: 300,
      },
      {
        n: 8,
        icon: 'role',
        name: 'Policy',
        lan: 'role Finance được approve payout',
        drop: 'đúng người nhưng sai role → 403',
        kind: 'allow',
        left: 120,
      },
      {
        n: 9,
        icon: 'idor',
        name: 'Owner check',
        lan: 'payout 42 thuộc công ty của chị',
        drop: 'đổi id sang payout của công ty khác (IDOR)',
        kind: 'allow',
        left: 100,
      },
    ],
  },
  {
    title: 'Soi dữ liệu, chạm database',
    check: 'soi từng giá trị trong request, rồi giới hạn thiệt hại',
    rows: [
      {
        n: 10,
        icon: 'inject',
        name: 'Validation',
        lan: 'body hợp lệ; id đi vào SQL dưới dạng tham số @p0',
        drop: 'body sai format, SQL injection còn sót → 400',
        kind: 'allow',
        left: 95,
      },
      {
        n: 11,
        icon: 'vault',
        name: 'DB + secret',
        lan: 'UPDATE chạy bằng tài khoản chỉ có đúng quyền cần, dữ liệu mã hoá trên đĩa',
        drop: 'không loại thêm: nếu lớp trước thủng thì thiệt hại vẫn nhỏ',
        kind: 'allow',
        left: 95,
      },
    ],
  },
]

const back: Row[] = [
  {
    n: 12,
    icon: 'headers',
    name: 'Response',
    lan: 'trả 200, không kèm stack trace, thêm security header',
    kind: 'none',
    left: 0,
  },
  {
    n: 13,
    icon: 'audit',
    name: 'Audit log',
    lan: 'ghi "chị Lan approve payout 42 lúc 9:05"; báo động nếu ai đó approve 500 cái',
    kind: 'limit',
    left: 0,
  },
]

// Thanh "còn lại" theo thang log: 1 triệu = 100%, 10 = 10%.
const barWidth = (left: number) => `${Math.max(8, (Math.log10(left) / Math.log10(START)) * 100)}%`

const fmt = (n: number) => n.toLocaleString('vi-VN')

// Số request trước mỗi bước, để vẽ phần vừa bị loại (đỏ nhạt) nối tiếp phần còn lại.
const before: Record<number, number> = {}
let prev = START

for (const r of phases.flatMap((p) => p.rows)) {
  before[r.n] = prev
  prev = r.left
}

const kindLabel: Record<Kind, string> = {
  deny: 'blocklist',
  allow: 'allowlist',
  limit: 'ngưỡng',
  none: '',
}
</script>

<template>
  <div class="sf">
    <div class="sf-intro">
      <span class="sf-pill">giả sử đang bị tấn công</span>
      <strong>{{ fmt(START) }} request/phút</strong>
      đổ vào, trong đó có <strong>1 request</strong> của chị Lan
      <span class="sf-env" aria-hidden="true">✉</span>
    </div>

    <section v-for="p in phases" :key="p.title" class="sf-phase">
      <header class="sf-phase-head">
        <strong>{{ p.title }}</strong>
        <span>{{ p.check }}</span>
      </header>

      <a v-for="r in p.rows" :key="r.n" class="sf-row" :href="`#step-${r.n}`">
        <div class="sf-icon">
          <StepIcon :name="r.icon" />
          <span class="sf-n">{{ r.n }}</span>
        </div>

        <div class="sf-text">
          <div class="sf-name">
            {{ r.name }}
            <span v-if="kindLabel[r.kind]" class="sf-kind" :class="r.kind">{{ kindLabel[r.kind] }}</span>
          </div>
          <div class="sf-lan"><span class="sf-env" aria-hidden="true">✉</span> {{ r.lan }}</div>
          <div v-if="r.drop" class="sf-drop" :class="{ muted: r.kind === 'none' || r.n === 11 }">
            <span aria-hidden="true">✕</span> {{ r.drop }}
          </div>
        </div>

        <div class="sf-left">
          <div class="sf-track">
            <div class="sf-gone" :style="{ width: barWidth(before[r.n]) }" />
            <div class="sf-bar" :style="{ width: barWidth(r.left) }" />
          </div>
          <span class="sf-count">
            còn {{ fmt(r.left) }}
            <span v-if="before[r.n] > r.left" class="sf-minus">−{{ fmt(before[r.n] - r.left) }}</span>
          </span>
        </div>
      </a>
    </section>

    <section class="sf-phase sf-back">
      <header class="sf-phase-head">
        <strong>Đường về</strong>
        <span>nhẹ: chỉ dọn response và ghi lại chuyện đã xảy ra</span>
      </header>

      <a v-for="r in back" :key="r.n" class="sf-row" :href="`#step-${r.n}`">
        <div class="sf-icon">
          <StepIcon :name="r.icon" />
          <span class="sf-n">{{ r.n }}</span>
        </div>

        <div class="sf-text">
          <div class="sf-name">{{ r.name }}</div>
          <div class="sf-lan"><span class="sf-env" aria-hidden="true">✉</span> {{ r.lan }}</div>
        </div>
      </a>
    </section>

    <p class="sf-note">
      Số liệu chỉ để minh hoạ, thanh vẽ theo thang log; phần đỏ nét đứt là số vừa bị lớp đó loại. Ý chính: lọc rẻ, số
      lượng lớn ở ngoài trước; càng vào trong, request càng ít nhưng mỗi request được soi kỹ hơn. Bấm một hàng để đọc
      bước đó.
    </p>
  </div>
</template>

<style scoped>
.sf {
  margin: 16px 0;
  font-size: 14px;
  line-height: 1.5;
}

.sf-intro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.sf-pill {
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--vp-c-red-1);
  background: var(--vp-c-red-soft);
}

.sf-env {
  color: var(--vp-c-brand-1);
}

.sf-phase {
  margin-top: 14px;
  border-left: 3px solid var(--vp-c-brand-1);
  padding-left: 12px;
}

.sf-back {
  border-left-color: var(--vp-c-divider);
}

.sf-phase-head {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  align-items: baseline;
  margin-bottom: 4px;
}

.sf-phase-head span {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}

.sf-row {
  display: grid;
  grid-template-columns: 72px 1fr 150px;
  gap: 12px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
}

.sf-row:hover {
  background: var(--vp-c-default-soft);
}

.sf-icon {
  position: relative;
}

.sf-icon :deep(svg) {
  display: block;
  width: 72px;
  height: auto;
  min-width: 0;
}

.sf-n {
  position: absolute;
  top: -4px;
  left: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  color: var(--vp-c-white);
  background: var(--vp-c-brand-1);
}

.sf-name {
  font-weight: 600;
}

.sf-kind {
  margin-left: 6px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.sf-kind.deny {
  color: var(--vp-c-red-1);
  background: var(--vp-c-red-soft);
}

.sf-kind.allow {
  color: var(--vp-c-green-1);
  background: var(--vp-c-green-soft);
}

.sf-kind.limit {
  color: var(--vp-c-warning-1);
  background: var(--vp-c-warning-soft);
}

.sf-lan {
  color: var(--vp-c-text-1);
}

.sf-drop {
  color: var(--vp-c-red-1);
  font-size: 13px;
}

.sf-drop.muted {
  color: var(--vp-c-text-2);
}

.sf-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sf-track {
  position: relative;
  height: 10px;
}

.sf-gone,
.sf-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 10px;
  border-radius: 5px;
}

.sf-gone {
  background: var(--vp-c-red-soft);
  border: 1px dashed var(--vp-c-red-1);
}

.sf-minus {
  margin-left: 4px;
  color: var(--vp-c-red-1);
}

.sf-bar {
  border-radius: 5px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-3));
}

.sf-count {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}

.sf-note {
  margin-top: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .sf-row {
    grid-template-columns: 56px 1fr;
  }

  .sf-icon :deep(svg) {
    width: 56px;
  }

  .sf-left {
    grid-column: 2;
  }
}
</style>
