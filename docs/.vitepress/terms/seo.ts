// Thuật ngữ của trang SEO (/web/seo).
import type { TermDef } from './types'

const terms: Record<string, TermDef> = {
  seo: {
    title: 'SEO',
    full: 'Search Engine Optimization',
    group: 'SEO',
    def: 'Làm cho trang đi trót lọt qua crawl, render, index và thắng ở bước xếp hạng, để người tìm thấy mà không phải trả tiền quảng cáo.',
    link: '/web/seo',
  },

  serp: {
    title: 'SERP',
    full: 'Search Engine Results Page',
    group: 'SEO',
    def: 'Trang kết quả tìm kiếm: quảng cáo, AI Overview, kết quả **organic** và các khối đặc biệt (People Also Ask, featured snippet...).',
    link: '/web/seo#serp',
  },

  organic: {
    title: 'Organic',
    group: 'SEO',
    def: 'Kết quả tự nhiên, không trả tiền. Đây là sân chơi của SEO; khác [[sem]].',
  },

  sem: {
    title: 'SEM / PPC',
    full: 'Search Engine Marketing / Pay Per Click',
    group: 'SEO',
    def: 'Quảng cáo trên công cụ tìm kiếm, trả tiền theo click. Không phải SEO.',
  },

  impression: {
    title: 'Impression',
    group: 'SEO',
    def: 'Một lần trang của bạn hiện trên [[serp]], dù người dùng có click hay không.',
  },

  ctr: {
    title: 'CTR',
    full: 'Click-Through Rate',
    group: 'SEO',
    def: 'Số click chia cho số [[impression]].',
  },

  'search intent': {
    title: 'Search intent',
    group: 'SEO',
    def: 'Ý định thật sự phía sau một query: muốn biết, muốn vào một site, đang so sánh, hay muốn mua ngay.',
    link: '/web/seo#search-intent',
  },

  'search volume': {
    title: 'Search volume',
    group: 'SEO',
    def: 'Lượt tìm trung bình mỗi tháng của một keyword, thường lấy trung bình 12 tháng. Luôn là **ước tính**.',
    link: '/web/seo#keyword',
  },

  kd: {
    title: 'KD',
    full: 'Keyword Difficulty',
    group: 'SEO',
    def: 'Độ khó lên top do **từng tool tự tính**, chủ yếu từ backlink của top 10 hiện tại. Không phải chỉ số của Google; chỉ so được trong cùng một tool.',
    link: '/web/seo#keyword-difficulty',
  },

  cpc: {
    title: 'CPC',
    full: 'Cost Per Click',
    group: 'SEO',
    def: 'Giá trung bình nhà quảng cáo trả cho một click. Gợi ý giá trị thương mại của keyword.',
  },

  'long-tail': {
    title: 'Long-tail keyword',
    group: 'SEO',
    def: 'Cụm dài, cụ thể, volume thấp nhưng dễ lên top và người tìm biết rõ mình muốn gì. Ngược với head term ngắn, cạnh tranh gắt.',
    link: '/web/seo#long-tail',
  },

  backlink: {
    title: 'Backlink',
    group: 'SEO',
    def: 'Link từ site khác trỏ về site bạn. Google coi như một phiếu bầu tín nhiệm, nhưng các phiếu không ngang giá.',
    link: '/web/seo#backlink',
  },

  pagerank: {
    title: 'PageRank',
    group: 'SEO',
    def: 'Ý tưởng gốc của Google: một trang quan trọng nếu nhiều trang quan trọng link tới nó. Uy tín chảy theo link.',
    link: '/web/seo#backlink',
  },

  'referring domain': {
    title: 'Referring domain',
    group: 'SEO',
    def: 'Số domain **khác nhau** có link về bạn. Quan trọng hơn tổng số backlink: 100 link từ 1 domain kém xa 100 link từ 100 domain.',
  },

  'anchor text': {
    title: 'Anchor text',
    group: 'SEO',
    def: 'Chữ được gắn link. Giúp Google hiểu trang đích nói về gì.',
  },

  'da/dr': {
    title: 'DA / DR',
    full: 'Domain Authority (Moz) / Domain Rating (Ahrefs)',
    group: 'SEO',
    def: 'Điểm uy tín 0–100 mỗi tool tự tính từ backlink mà tool đó crawl được. **Google không dùng.**',
    link: '/web/seo#authority-scores',
  },

  'robots.txt': {
    title: 'robots.txt',
    group: 'SEO',
    def: 'File ở gốc domain, nói bot nào được **crawl** chỗ nào. Chặn crawl, **không** chặn index: muốn ẩn khỏi Google thì dùng [[noindex]].',
    link: '/web/seo#robots-noindex',
  },

  sitemap: {
    title: 'sitemap.xml',
    group: 'SEO',
    def: 'File liệt kê các URL bạn muốn được index, để Google phát hiện trang không cần chờ link.',
  },

  noindex: {
    title: 'noindex',
    group: 'SEO',
    def: 'Thẻ `<meta name="robots" content="noindex">` yêu cầu không đưa trang vào index. Bot phải **crawl được** trang thì mới đọc được thẻ này.',
    link: '/web/seo#robots-noindex',
  },

  canonical: {
    title: 'Canonical',
    group: 'SEO',
    def: '`<link rel="canonical">` chỉ ra URL bản chính khi nhiều URL có cùng nội dung (`?sort=`, `?utm=`).',
    link: '/web/seo#head-tags',
  },

  hreflang: {
    title: 'hreflang',
    group: 'SEO',
    def: 'Khai báo các phiên bản ngôn ngữ / quốc gia của cùng một trang. Phải khai báo **hai chiều** và mỗi bản liệt kê đủ mọi bản.',
    link: '/web/seo#hreflang',
  },

  'x-default': {
    title: 'x-default',
    group: 'SEO',
    def: 'Phiên bản dự phòng trong bộ [[hreflang]], cho người dùng không khớp bản nào.',
  },

  '301/302': {
    title: '301 / 302',
    group: 'SEO',
    def: 'Redirect **vĩnh viễn** (Google chuyển uy tín và index sang URL mới) / **tạm thời** (Google giữ URL cũ trong index).',
    link: '/web/seo#redirects',
  },

  'redirect chain': {
    title: 'Redirect chain',
    group: 'SEO',
    def: 'Chuỗi redirect nối nhau A → B → C. Mỗi bước chậm thêm và có thể mất tín hiệu; sửa bằng cách trỏ thẳng A về URL cuối.',
  },

  'soft 404': {
    title: 'Soft 404',
    group: 'SEO',
    def: 'Trang không có nội dung (lỗi, đã xoá, hoặc redirect mọi thứ về trang chủ) nhưng vẫn trả `200`. Google tự coi là 404.',
  },

  'orphan page': {
    title: 'Orphan page',
    group: 'SEO',
    def: 'Trang không có link nội bộ nào trỏ tới. Google khó tìm và coi là không quan trọng, kể cả khi có trong [[sitemap]].',
  },

  'open graph': {
    title: 'Open Graph',
    group: 'SEO',
    def: 'Thẻ `og:title`, `og:image`... quyết định link trông thế nào khi chia sẻ lên mạng xã hội. **Không ảnh hưởng ranking.**',
  },

  'json-ld': {
    title: 'Structured data / JSON-LD',
    group: 'SEO',
    def: 'Dữ liệu có cấu trúc theo chuẩn schema.org, đặt trong `<script type="application/ld+json">`, giúp máy hiểu trang là sản phẩm, bài viết hay doanh nghiệp.',
    link: '/web/seo#structured-data',
  },

  spa: {
    title: 'SPA',
    full: 'Single-Page Application',
    group: 'SEO',
    def: 'App mà HTML ban đầu gần như trống, JavaScript vẽ nội dung trong browser (Vue, React thuần client-side). Bot không chạy JS sẽ thấy trang trắng.',
    link: '/web/seo#js-rendering',
  },

  ssr: {
    title: 'SSR',
    full: 'Server-Side Rendering',
    group: 'SEO',
    def: 'Server trả về HTML đã có nội dung cho mỗi request (vd Nuxt với Vue), rồi JS gắn tương tác sau. Bot đọc được ngay.',
    link: '/web/seo#js-rendering',
  },

  ssg: {
    title: 'SSG',
    full: 'Static Site Generation',
    group: 'SEO',
    def: 'Tạo sẵn file HTML tĩnh lúc build (như chính site docs VitePress này). Bot đọc được ngay, server không phải render.',
    link: '/web/seo#js-rendering',
  },

  'core web vitals': {
    title: 'Core Web Vitals',
    group: 'SEO',
    def: 'Ba chỉ số trải nghiệm Google đo từ người dùng thật: **LCP** (nội dung chính hiện nhanh cỡ nào, < 2.5s), **INP** (bấm vào phản hồi nhanh cỡ nào, < 200ms), **CLS** (layout có nhảy không, < 0.1).',
    link: '/web/seo#core-web-vitals',
  },

  'e-e-a-t': {
    title: 'E-E-A-T',
    full: 'Experience, Expertise, Authoritativeness, Trust',
    group: 'SEO',
    def: 'Cách Google đánh giá chất lượng: có trải nghiệm thật, có chuyên môn, có uy tín, đáng tin. Quan trọng nhất với chủ đề tiền bạc và sức khoẻ.',
  },

  'keyword cannibalization': {
    title: 'Keyword cannibalization',
    group: 'SEO',
    def: 'Hai trang cùng site nhắm cùng một keyword nên tự cạnh tranh nhau, cả hai đều khó lên.',
  },

  'topic cluster': {
    title: 'Topic cluster',
    group: 'SEO',
    def: 'Một **pillar page** tổng quan link tới nhiều **cluster page** đi sâu chủ đề con, và ngược lại. Tạo ra **topical authority**: site bao phủ trọn một chủ đề.',
    link: '/web/seo#topic-cluster',
  },

  gsc: {
    title: 'GSC',
    full: 'Google Search Console',
    group: 'SEO',
    def: 'Dữ liệu thật về chuyện xảy ra **trên Google**, trước khi click: query, impression, click, vị trí trung bình, lỗi index. Miễn phí, chỉ cho site đã xác minh.',
    link: '/web/seo#measurement',
  },

  ga4: {
    title: 'GA4',
    full: 'Google Analytics 4',
    group: 'SEO',
    def: 'Dữ liệu về chuyện xảy ra **trên site** sau khi click: session, nguồn traffic, conversion. Bị adblock và cookie consent làm hụt.',
    link: '/web/seo#measurement',
  },

  'zero-click': {
    title: 'Zero-click',
    group: 'SEO',
    def: 'Lượt tìm kết thúc mà không click vào site nào, vì câu trả lời đã nằm ngay trên [[serp]] hoặc trong [[ai overview]].',
  },

  'ai overview': {
    title: 'AI Overview',
    group: 'SEO',
    def: 'Đoạn tóm tắt do AI viết ở đầu trang Google, có trích dẫn vài nguồn. Chạy trên chính hệ thống ranking của Search.',
    link: '/web/seo#ai-search',
  },

  'ai mode': {
    title: 'AI Mode',
    group: 'SEO',
    def: 'Chế độ tìm kiếm dạng hội thoại của Google. Giảm click nhiều hơn [[ai overview]] và trích dẫn ít trùng với top organic hơn.',
  },

  'query fan-out': {
    title: 'Query fan-out',
    group: 'SEO',
    def: 'AI tách một câu hỏi dài thành nhiều truy vấn nhỏ, search từng câu, rồi tổng hợp. Muốn được trích dẫn thì phải rank được cho các câu nhỏ đó.',
    link: '/web/seo#query-fan-out',
  },

  rag: {
    title: 'RAG',
    full: 'Retrieval-Augmented Generation',
    group: 'SEO',
    def: 'Mô hình AI tìm (retrieve) các đoạn nội dung liên quan trước, rồi mới viết câu trả lời dựa trên chúng và trích dẫn nguồn.',
  },

  geo: {
    title: 'GEO / AEO',
    full: 'Generative / Answer Engine Optimization',
    group: 'SEO',
    def: 'Tên gọi cho việc tối ưu để được AI trích dẫn. Theo Google, SEO tốt chính là tối ưu cho AI; không có markup riêng.',
    link: '/web/seo#geo',
  },

  'llms.txt': {
    title: 'llms.txt',
    group: 'SEO',
    def: 'File đề xuất ở gốc site, liệt kê nội dung chính dạng Markdown cho AI agent. Chưa là chuẩn, chưa có bằng chứng giúp tăng trích dẫn.',
  },
}

export default terms
