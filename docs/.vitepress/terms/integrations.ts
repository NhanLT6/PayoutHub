// Thuật ngữ của các trang tích hợp ngoài, tracking, AI tool và hệ thống legacy.
import type { TermDef } from './types'

const web = 'Web & API' as const
const design = 'Thiết kế & nguyên tắc' as const
const data = 'Dữ liệu' as const
const sec = 'Bảo mật' as const
const rt = 'Runtime & build' as const

const terms: Record<string, TermDef> = {
  // --- Tích hợp ngoài ---
  webhook: {
    title: 'Webhook',
    group: web,
    def: 'Hệ thống bên kia **chủ động gọi HTTP vào bạn** khi có sự kiện (user bấm nút, đơn hàng mới), thay vì bạn hỏi liên tục. Endpoint nhận phải tự xác minh request đúng là của họ.',
    link: '/integrations/interactive-notifications#callback',
  },
  'replay attack': {
    title: 'Replay attack',
    group: sec,
    def: 'Kẻ gian bắt được một request hợp lệ (chữ ký đúng) rồi **gửi lại y nguyên** sau đó. Chặn bằng cách ký kèm timestamp và từ chối request quá cũ (vài phút).',
    link: '/integrations/interactive-notifications#verify',
  },
  'constant-time': {
    title: 'So sánh constant-time',
    group: sec,
    def: 'So hai chuỗi bí mật (chữ ký, token) mất **cùng thời gian dù sai ở ký tự nào**, để kẻ gian không đo thời gian phản hồi mà đoán dần từng ký tự. .NET: `CryptographicOperations.FixedTimeEquals`.',
  },
  'adaptive card': {
    title: 'Adaptive Card',
    group: web,
    def: 'Định dạng JSON mô tả một "thẻ" có chữ, ô nhập và nút, do Microsoft định nghĩa. Teams render nó thành giao diện. Tương đương **Block Kit** bên Slack.',
    link: '/integrations/interactive-notifications#teams',
  },
  'task module': {
    title: 'Task module',
    group: web,
    def: 'Cửa sổ modal trong Teams mở ra từ một nút trên card. Bot nhận invoke `task/fetch` để trả nội dung modal, và `task/submit` khi user bấm gửi. Tên mới trong tài liệu Microsoft là **dialog**.',
    link: '/integrations/interactive-notifications#teams',
  },
  'conversation reference': {
    title: 'ConversationReference',
    group: web,
    def: 'Gói thông tin đủ để bot **tự mở lại một cuộc trò chuyện** về sau (service URL, conversation id, bot id, user). Lưu khi user cài bot hoặc nhắn lần đầu; thiếu nó thì không gửi chủ động được.',
    link: '/integrations/interactive-notifications#identity',
  },
  tunnel: {
    title: 'Tunnel (dev tunnel, ngrok)',
    group: web,
    def: 'Dịch vụ cấp một URL công khai và chuyển request về `localhost` của bạn, để hệ thống ngoài (Teams, Slack) gọi được webhook vào máy dev.',
    link: '/integrations/interactive-notifications#debug-teams',
  },
  crm: {
    title: 'CRM',
    full: 'Customer Relationship Management',
    group: 'Quy trình & khác',
    def: 'Phần mềm đội sales dùng để quản lý khách hàng, công ty, deal (HubSpot, Salesforce). App nội bộ thường đồng bộ dữ liệu sang để sales khỏi nhập hai lần.',
    link: '/integrations/crm-sync',
  },
  'last write wins': {
    title: 'Last write wins',
    group: design,
    def: 'Hai lần ghi cùng một chỗ, **lần tới sau cùng thắng**, lần trước biến mất không báo lỗi. Hay gặp khi hai đường code cùng update một message hoặc hai job đồng bộ đến sai thứ tự.',
    link: '/integrations/interactive-notifications#single-writer',
  },

  // --- Semantic layer ---
  'semantic layer': {
    title: 'Semantic layer',
    full: 'còn gọi metrics layer',
    group: data,
    def: 'Lớp khai báo các **dimension** và **measure** có tên, rồi tự sinh SQL từ một request có cấu trúc. Người hỏi (hoặc LLM) chỉ chọn tên, không viết SQL. Cube, LookML, dbt MetricFlow làm việc này.',
    link: '/data/semantic-layer',
  },
  grain: {
    title: 'Grain',
    group: data,
    def: 'Một dòng của bảng hay query **đại diện cho cái gì**: một thành viên, một cặp (tổ chức, thành viên), một giao dịch. Join sai grain là nguồn của đếm phồng.',
    link: '/data/semantic-layer#grain',
  },
  'fan trap': {
    title: 'Fan trap',
    group: data,
    def: 'Join một bảng one-to-many làm **nhân dòng**, nên `COUNT(*)` hay `SUM` bị phồng. Hai join one-to-many cùng gốc nhân nhau thì gọi là **chasm trap**, còn nặng hơn.',
    link: '/data/semantic-layer#fan-out',
  },
  cte: {
    title: 'CTE',
    full: 'Common Table Expression',
    group: data,
    def: 'Query đặt tên tạm bằng `WITH ten AS (...)` ở đầu câu SQL, rồi dùng lại như một bảng trong phần sau. Giúp chia một query lớn thành các bước đọc được.',
  },
  'golden test': {
    title: 'Golden test',
    full: 'snapshot test',
    group: design,
    def: 'Test lưu sẵn **output mong đợi** (một chuỗi SQL, một JSON) vào file, rồi mỗi lần chạy so output mới với file đó. Đổi code làm output đổi thì diff cho thấy chính xác cái gì đổi. Thư viện C#: Verify, Snapper.',
    link: '/data/semantic-layer#dev-experience',
  },

  // --- Tracking ---
  'tracking pixel': {
    title: 'Tracking pixel',
    group: web,
    def: 'Một request nhỏ (thường là ảnh 1x1 trong suốt) mà trình duyệt tự gửi khi trang tải, mang dữ liệu trong query string và cookie đi kèm, để server bên tracking ghi một sự kiện.',
    link: '/web/tracking-pixel#pixel',
  },
  attribution: {
    title: 'Attribution',
    full: 'ghi công',
    group: 'Quy trình & khác',
    def: 'Quyết định một giao dịch được **tính cho đối tác nào** (người giới thiệu, quảng cáo nào), để trả hoa hồng hoặc đo hiệu quả kênh.',
    link: '/web/tracking-pixel#attribution',
  },
  'third-party cookie': {
    title: 'Third-party cookie',
    group: web,
    def: 'Cookie của **domain khác** domain trên thanh địa chỉ (vd cookie của `track.example.com` khi đang ở `shop.com`). Safari và Firefox chặn hoặc cô lập loại này; cookie của chính domain trang là **first-party**.',
    link: '/web/tracking-pixel#cookies',
  },
  itp: {
    title: 'ITP',
    full: 'Intelligent Tracking Prevention',
    group: web,
    def: 'Cơ chế chống tracking của Safari (WebKit): chặn third-party cookie và rút ngắn thời hạn một số cookie first-party, kể cả cookie đặt qua CNAME trỏ sang domain tracking.',
    link: '/web/tracking-pixel#cookies',
  },
  postback: {
    title: 'Postback (server-to-server)',
    group: web,
    def: 'Backend của người bán **tự gọi API** của bên tracking khi có đơn, kèm `click_id` đã lưu từ lúc khách vào. Không phụ thuộc cookie hay trình duyệt.',
    link: '/web/tracking-pixel#other-types',
  },
  samesite: {
    title: 'SameSite',
    group: sec,
    def: 'Thuộc tính cookie quyết định trình duyệt có gửi kèm cookie trong request **từ site khác** không: `Strict` (không), `Lax` (chỉ khi điều hướng), `None` (có, bắt buộc kèm `Secure`).',
  },

  // --- AI tool ---
  'function calling': {
    title: 'Function calling',
    full: 'tool use',
    group: design,
    def: 'LLM không tự chạy code: nó **trả về tên tool và tham số JSON** muốn gọi. App của bạn chạy tool, gửi kết quả lại, model đọc rồi trả lời hoặc gọi tool tiếp.',
    link: '/ai/llm-tools#loop',
  },
  'prompt injection': {
    title: 'Prompt injection',
    group: sec,
    def: 'Chữ do người ngoài viết lọt vào ngữ cảnh của LLM và **được model đọc như chỉ thị** ("bỏ qua mọi hướng dẫn trước..."). Gián tiếp khi nó đến qua kết quả tool, tài liệu RAG, tên do user đặt. OWASP LLM01.',
    link: '/ai/llm-tools#injection',
  },
  'excessive agency': {
    title: 'Excessive agency',
    group: sec,
    def: 'Cho LLM nhiều quyền hơn việc cần (tool ghi, xoá, gửi email) nên khi bị bẻ thì thiệt hại lớn. OWASP LLM06. Chữa bằng tool chỉ đọc và bước xác nhận của người dùng.',
    link: '/ai/llm-tools#injection',
  },
  'structured outputs': {
    title: 'Structured outputs',
    full: 'strict schema',
    group: design,
    def: 'Chế độ buộc model sinh JSON **đúng tuyệt đối** theo JSON Schema của tool (đủ field `required`, không thừa field). Giảm lỗi tham số, nhưng server vẫn phải validate và kiểm quyền.',
    link: '/ai/llm-tools#schema',
  },
  'prompt caching': {
    title: 'Prompt caching',
    group: design,
    def: 'Nhà cung cấp LLM cache phần **tiền tố giống hệt nhau** của prompt (system prompt, định nghĩa tool) để lần sau rẻ và nhanh hơn. Chèn thứ thay đổi (ngày hôm nay) vào đầu prompt là phá cache.',
    link: '/ai/llm-tools#description',
  },
  eval: {
    title: 'Eval',
    group: design,
    def: 'Bộ prompt thật kèm kết quả mong đợi, chạy lại mỗi khi đổi model, prompt hay schema để biết model **còn chọn đúng tool, điền đúng tham số** không. Unit test cho phần LLM.',
    link: '/ai/llm-tools#testing',
  },

  // --- Legacy ---
  webforms: {
    title: 'ASP.NET Web Forms',
    group: rt,
    def: 'Mô hình web của .NET Framework: trang `.aspx` + code-behind, sự kiện kiểu WinForms, ViewState giữ trạng thái. **Không có trong ASP.NET Core**, nên migrate là viết lại phần giao diện.',
    link: '/architecture/legacy-system',
  },
  msmq: {
    title: 'MSMQ',
    full: 'Microsoft Message Queuing',
    group: rt,
    def: 'Hàng đợi có sẵn trong Windows, dùng qua `System.Messaging` (chỉ .NET Framework). Mặc định message ở chế độ express (trong bộ nhớ), phải bật `Recoverable` và transaction mới bền.',
    link: '/architecture/legacy-system#queue',
  },
  binaryformatter: {
    title: 'BinaryFormatter',
    group: sec,
    def: 'Serializer nhị phân cũ của .NET. Deserialize dữ liệu không tin cậy có thể **chạy mã tuỳ ý**; bị loại khỏi .NET 9. Thay bằng JSON có version.',
    link: '/architecture/legacy-system#binaryformatter',
  },
  'characterization test': {
    title: 'Characterization test',
    group: design,
    def: 'Test ghi lại **hành vi hiện tại** của code cũ (kể cả chỗ có vẻ sai), làm lưới an toàn trước khi refactor hay migrate. Khác test theo spec: nó khoá "đang chạy thế nào", không phải "nên chạy thế nào".',
    link: '/architecture/legacy-system#prepare',
  },
}

export default terms
