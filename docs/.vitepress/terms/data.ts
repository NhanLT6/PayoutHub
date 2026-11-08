// Thuật ngữ của nhóm Data: EF Core (query, tracking, concurrency) và hiệu năng SQL.
import type { TermDef } from './types'

const data = 'Dữ liệu' as const

const terms: Record<string, TermDef> = {
  // --- EF Core ---
  'lazy loading': {
    title: 'Lazy loading',
    group: data,
    def: 'Navigation property tự chạy một query **lúc được đọc tới lần đầu**. Đọc trong vòng lặp thì thành [[N+1]]. EF Core tắt mặc định (cần package Proxies, `UseLazyLoadingProxies()` và navigation `virtual`); [[EF6]] bật mặc định.',
    link: '/data/ef-core#n-plus-one-causes',
  },
  'eager loading': {
    title: 'Eager loading',
    group: data,
    def: 'Load dữ liệu liên quan **ngay trong query đầu** bằng JOIN, qua `Include`. Là cách chữa [[N+1]], không phải nguyên nhân.',
    link: '/data/ef-core#include',
  },
  projection: {
    title: 'Projection',
    group: data,
    def: '`Select` sang DTO hoặc kiểu ẩn danh: SQL chỉ lấy các cột được nhắc tới, tự JOIN theo navigation dùng trong `Select`, và kết quả không bị track.',
    link: '/data/ef-core#projection',
  },
  'cartesian explosion': {
    title: 'Cartesian explosion',
    group: data,
    def: 'JOIN nhiều collection ngang hàng làm số dòng nhân lên (50 payout × 200 conversion = 10.000 dòng). EF Core chữa bằng `AsSplitQuery()`.',
    link: '/data/ef-core#split-query',
  },
  'change tracking': {
    title: 'Change tracking',
    group: data,
    def: '`DbContext` giữ snapshot giá trị gốc của entity lúc load; `SaveChanges` gọi `DetectChanges` so object với snapshot và chỉ `UPDATE` cột đã đổi. `AsNoTracking` tắt cơ chế này cho query chỉ đọc.',
    link: '/data/ef-core#change-tracking',
  },
  'lost update': {
    title: 'Lost update',
    group: data,
    def: 'Hai người cùng đọc rồi cùng ghi, bản ghi sau đè bản trước mà không ai biết. Chặn bằng [[optimistic concurrency]].',
    link: '/data/ef-core#concurrency',
  },
  'optimistic concurrency': {
    title: 'Optimistic concurrency',
    group: data,
    def: 'Không khoá lúc đọc; lúc ghi thêm version gốc vào `WHERE`. 0 dòng bị đổi nghĩa là có người sửa trước, EF ném `DbUpdateConcurrencyException`.',
    link: '/data/ef-core#rowversion',
  },
  'pessimistic locking': {
    title: 'Pessimistic locking',
    group: data,
    def: 'Khoá dòng ngay lúc đọc (`UPDLOCK` trên SQL Server, `SELECT ... FOR UPDATE` trên PostgreSQL), người khác chờ tới hết transaction. Không trải qua được hai HTTP request.',
    link: '/data/ef-core#pessimistic',
  },
  rowversion: {
    title: 'rowversion',
    full: 'trước đây gọi là timestamp',
    group: data,
    def: 'Kiểu cột 8 byte của SQL Server, DB tự tăng mỗi lần dòng bị UPDATE. EF dùng làm concurrency token qua `IsRowVersion()` hoặc `[Timestamp]`. PostgreSQL dùng cột hệ thống [[xmin]].',
    link: '/data/ef-core#rowversion',
  },
  xmin: {
    title: 'xmin',
    group: data,
    def: 'Cột hệ thống của PostgreSQL: id của transaction ghi dòng gần nhất, đổi mỗi lần dòng bị sửa. Npgsql map một property `uint` + `IsRowVersion()` sang nó để làm concurrency token.',
    link: '/data/ef-core#rowversion',
  },
  etag: {
    title: 'ETag',
    full: 'entity tag',
    group: 'Web & API',
    def: 'Header HTTP chứa "phiên bản" của resource. Client gửi lại trong `If-Match` khi ghi; server thấy không khớp thì trả **412 Precondition Failed**.',
    link: '/data/ef-core#version-round-trip',
  },

  // --- SQL performance ---
  ssms: {
    title: 'SSMS',
    full: 'SQL Server Management Studio',
    group: data,
    def: 'Công cụ của Microsoft để chạy query và quản trị SQL Server: xem execution plan (Ctrl+M), STATISTICS IO, Query Store.',
  },
  'logical reads': {
    title: 'Logical reads',
    group: data,
    def: 'Số page 8 KB query đọc từ [[buffer pool]]. Thước đo ổn định của "query làm bao nhiêu việc", không phụ thuộc cache nóng hay nguội như số giây.',
    link: '/data/sql-performance#statistics-io',
  },
  'buffer pool': {
    title: 'Buffer pool',
    group: data,
    def: 'Vùng RAM SQL Server dùng để giữ các page dữ liệu và index đã đọc. Page có sẵn ở đây thì không phải đọc đĩa.',
  },
  'query store': {
    title: 'Query Store',
    group: data,
    def: 'Tính năng SQL Server tự ghi lại query, plan, thời gian và logical reads theo thời gian. Dùng để tìm query tốn nhất trên production và thấy plan bị đổi. Bật mặc định từ SQL Server 2022 và trên Azure SQL.',
    link: '/data/sql-performance#query-store',
  },
  tempdb: {
    title: 'tempdb',
    group: data,
    def: 'Database hệ thống của SQL Server cho dữ liệu tạm. Sort hoặc hash thiếu RAM thì "spill" xuống đây, ghi ra đĩa và chậm hẳn.',
    link: '/data/sql-performance#red-flags',
  },
  'parameter sniffing': {
    title: 'Parameter sniffing',
    group: data,
    def: 'SQL Server dựng plan theo giá trị tham số của lần chạy đầu rồi cache lại. Lần sau giá trị khác hẳn (vài dòng so với vài triệu dòng) vẫn dùng plan đó, có thể rất chậm.',
  },
  'b-tree': {
    title: 'B-tree',
    full: 'balanced tree',
    group: data,
    def: 'Cấu trúc lưu index: dữ liệu sắp theo cột khoá ở tầng lá, các tầng trên để nhảy nhanh tới đúng chỗ (seek) trong 3–4 page kể cả với hàng triệu dòng.',
    link: '/data/sql-performance#btree',
  },
  'clustered index': {
    title: 'Clustered index',
    group: data,
    def: 'Index **chính là bảng**: dữ liệu được sắp vật lý theo khoá của nó. Mỗi bảng có tối đa một; mặc định là khoá chính trên SQL Server.',
    link: '/data/sql-performance#red-flags',
  },
  'key lookup': {
    title: 'Key Lookup',
    group: data,
    def: 'Index phụ tìm được dòng nhưng thiếu cột, nên mỗi dòng phải nhảy về [[clustered index]] lấy phần còn lại. Chữa bằng `INCLUDE` (covering index).',
    link: '/data/sql-performance#covering',
  },
  'covering index': {
    title: 'Covering index',
    group: data,
    def: 'Index chứa đủ mọi cột query cần (khoá + `INCLUDE`), nên trả lời được mà không quay về bảng: không còn [[Key Lookup]].',
    link: '/data/sql-performance#covering',
  },
  'filtered index': {
    title: 'Filtered index',
    full: 'PostgreSQL: partial index',
    group: data,
    def: 'Index chỉ chứa những dòng khớp một điều kiện (`WHERE Status = \'Pending\'`): nhỏ và rẻ khi giá trị cần tìm là phần nhỏ của bảng. Query phải dùng hằng số khớp filter, không phải tham số.',
    link: '/data/sql-performance#filtered-index',
  },
  'keyset pagination': {
    title: 'Keyset pagination',
    full: 'seek method',
    group: data,
    def: 'Phân trang bằng cách nhớ khoá của dòng cuối trang trước (`WHERE CreatedAt > @last`) thay vì `OFFSET`, nên trang sâu vẫn là một lần seek.',
    link: '/data/sql-performance#keyset',
  },
  selectivity: {
    title: 'Selectivity',
    group: data,
    def: 'Một điều kiện lọc lại bao nhiêu phần trăm bảng. Cột ít giá trị khác nhau (`Status`) có selectivity thấp nên index một mình yếu, nhưng vẫn tốt khi làm cột đầu của index ghép.',
    link: '/data/sql-performance#index-cost',
  },
  sargable: {
    title: 'Sargable',
    full: 'Search ARGument ABLE',
    group: data,
    def: 'Điều kiện mà index seek được: so sánh trên **cột trần** (`CreatedAt >= @from`). Bọc cột trong hàm (`YEAR(CreatedAt) = 2026`), `LIKE \'%son\'` hay implicit conversion thì SQL phải tính lại cho từng dòng, thành Scan.',
    link: '/data/sql-performance#sargable',
  },
  'extended events': {
    title: 'Extended Events',
    full: 'XEvents',
    group: data,
    def: 'Cơ chế bắt sự kiện nhẹ của SQL Server (vd mọi câu chạy quá 1 giây), thay cho SQL Profiler đã deprecated và nặng trên production. Dùng để bắt chuyện **đang xảy ra**; Query Store dùng để xem lịch sử.',
    link: '/data/sql-performance#extended-events',
  },
  'dbcommandinterceptor': {
    title: 'DbCommandInterceptor',
    group: data,
    def: 'Class của EF Core để chen vào trước/sau mỗi lần chạy một `DbCommand`. Hay dùng để log riêng các câu chạy quá N ms. Đăng ký bằng `AddInterceptors(...)`.',
    link: '/data/sql-performance#ef-log',
  },
}

export default terms
