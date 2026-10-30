// Thuật ngữ chưa thuộc trang bài học nào, chuyển từ bảng Glossary cũ.
import type { TermDef } from './types'

const terms: Record<string, TermDef> = {
  sdk: {
    title: 'SDK',
    full: 'Software Development Kit',
    group: 'Runtime & build',
    def: 'Bộ công cụ build .NET (`dotnet` CLI, compiler, template). Khác **runtime**, thứ chỉ dùng để chạy app.',
  },

  openapi: {
    title: 'OpenAPI',
    full: 'trước đây gọi là Swagger',
    group: 'Web & API',
    def: 'Chuẩn mô tả API bằng JSON/YAML: endpoint, tham số, schema. Dùng để sinh tài liệu và client.',
  },

  rest: {
    title: 'REST',
    full: 'Representational State Transfer',
    group: 'Web & API',
    def: 'Kiểu thiết kế API xoay quanh **resource** (`/payouts/42`), dùng HTTP method cho hành động và status code cho kết quả.',
    link: '/aspnet-core/questions#rest-design',
  },

  trace: {
    title: 'Trace',
    full: 'distributed tracing',
    group: 'Web & API',
    def: 'Toàn bộ hành trình của một thao tác, có thể đi qua nhiều service. Gồm nhiều [[span]] lồng nhau, nối với nhau bằng [[traceparent]].',
  },

  span: {
    title: 'Span',
    full: 'OpenTelemetry',
    group: 'Web & API',
    def: 'Một bước công việc trong một [[trace]]: xử lý request, gọi DB, gọi FakeBank. Trong .NET gọi là `Activity`.',
  },

  csrf: {
    title: 'CSRF',
    full: 'Cross-Site Request Forgery',
    group: 'Bảo mật',
    def: 'Site lạ khiến browser của user gửi request tới app của bạn, **kèm cookie tự động**. Chặn bằng cookie `SameSite`, antiforgery token, hoặc dùng header `Authorization` thay cho cookie.',
    link: '/aspnet-core/authentication-jwt#csrf',
  },

  ssrf: {
    title: 'SSRF',
    full: 'Server-Side Request Forgery',
    group: 'Bảo mật',
    def: 'Server bị lừa gọi một URL do kẻ tấn công chọn (vd địa chỉ nội bộ `169.254.169.254` để lấy credential cloud). Chặn bằng allowlist đích được gọi.',
    blocks: 'truy cập mạng nội bộ qua server',
    link: '/aspnet-core/api-security#owasp-api-top-10',
  },

  'iso 4217': {
    title: 'ISO 4217',
    group: 'Dữ liệu',
    def: 'Chuẩn mã tiền tệ 3 chữ cái: `VND`, `USD`, `EUR`.',
  },

  orm: {
    title: 'ORM',
    full: 'Object-Relational Mapper',
    group: 'Dữ liệu',
    def: 'Thư viện map bảng DB sang class C# và dịch LINQ thành SQL. Ví dụ: [[EF Core]], Dapper (micro-ORM).',
  },

  'ci/cd': {
    title: 'CI/CD',
    full: 'Continuous Integration / Continuous Delivery',
    group: 'Quy trình & khác',
    def: 'Tự động build và chạy test mỗi lần push (CI), rồi tự động deploy (CD). Site docs này deploy bằng GitHub Actions.',
  },

  'nfc/nfd': {
    title: 'NFC / NFD',
    full: 'Normalization Form Composed / Decomposed',
    group: 'Quy trình & khác',
    def: 'Hai cách lưu chữ có dấu trong Unicode: dựng sẵn (`ế` là 1 ký tự) hoặc tổ hợp (`e` + dấu). NFD làm dấu tiếng Việt bị tách, so sánh chuỗi sai.',
  },

  'po/ba': {
    title: 'PO / BA',
    full: 'Product Owner / Business Analyst',
    group: 'Quy trình & khác',
    def: 'Vai trò nắm nghiệp vụ, viết và ưu tiên yêu cầu cho team.',
  },

  pr: {
    title: 'PR',
    full: 'Pull Request',
    group: 'Quy trình & khác',
    def: 'Yêu cầu merge một nhánh code vào nhánh chính, kèm review và CI.',
  },
}

export default terms
