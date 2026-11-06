// Thuật ngữ của nhóm Kiến trúc phân tán: microservices, messaging, DDD.
import type { TermDef } from './types'

const design = 'Thiết kế & nguyên tắc' as const
const web = 'Web & API' as const

const terms: Record<string, TermDef> = {
  // --- Microservices ---
  'modular monolith': {
    title: 'Modular monolith',
    group: design,
    def: 'Một app, một lần deploy, nhưng code chia module theo nghiệp vụ với ranh giới rõ (module không đọc bảng của nhau). Bước giữa trước khi tách thành service.',
    link: '/architecture/microservices#evolution',
  },
  'distributed monolith': {
    title: 'Distributed monolith',
    group: design,
    def: 'Nhiều service nhưng vẫn dính chặt: đọc chung DB, gọi nhau đồng bộ thành chuỗi, phải deploy cùng nhau. Có chi phí của microservices mà không có lợi ích.',
    link: '/architecture/microservices#database-per-service',
  },
  'eventual consistency': {
    title: 'Eventual consistency',
    group: design,
    def: 'Dữ liệu ở các nơi có thể lệch nhau một lúc (vài giây), nhưng nếu không có thay đổi mới thì cuối cùng sẽ khớp. Giá phải trả khi không dùng một transaction chung.',
    link: '/architecture/messaging#outbox',
  },
  'service discovery': {
    title: 'Service discovery',
    group: web,
    def: 'Tìm địa chỉ của một service theo tên thay vì ghi cứng IP. Trong Kubernetes, tên DNS của Service (vd `http://inventory`) làm việc này.',
    link: '/architecture/microservices#api-gateway',
  },
  'message broker': {
    title: 'Message broker',
    group: web,
    def: 'Hệ thống trung gian giữ và chuyển message giữa các service (Azure Service Bus, RabbitMQ). Bên gửi và bên nhận không cần sống cùng lúc.',
    link: '/architecture/messaging',
  },
  polly: {
    title: 'Polly',
    group: web,
    def: 'Thư viện resilience cho .NET: retry, timeout, circuit breaker. `Microsoft.Extensions.Http.Resilience` dựng trên Polly cho `HttpClient`.',
    link: '/architecture/microservices#cascading-failure',
  },

  // --- Messaging ---
  'peek-lock': {
    title: 'PeekLock',
    group: web,
    def: 'Chế độ nhận mặc định của SDK Azure Service Bus: message bị khoá chứ chưa xoá, chỉ xoá khi consumer gọi `Complete`. Hết lock (mặc định 1 phút) thì message được giao lại.',
    link: '/architecture/messaging#peek-lock',
  },
  dlq: {
    title: 'DLQ',
    full: 'Dead-letter queue',
    group: web,
    def: 'Queue phụ chứa message xử lý thất bại quá `MaxDeliveryCount` lần (mặc định 10) hoặc bị từ chối chủ động. Người hoặc tool xem rồi sửa/gửi lại.',
    link: '/architecture/messaging#dead-letter',
  },
  'poison message': {
    title: 'Poison message',
    group: web,
    def: 'Message lần nào xử lý cũng lỗi (dữ liệu hỏng, rule không qua). Retry không chữa được, phải vào [[DLQ]].',
    link: '/architecture/messaging#dead-letter',
  },
  'competing consumers': {
    title: 'Competing consumers',
    group: web,
    def: 'Nhiều instance cùng đọc một queue, mỗi message chỉ một instance xử lý. Cách san tải cho consumer.',
    link: '/architecture/messaging#queue-vs-topic',
  },
  outbox: {
    title: 'Outbox pattern',
    group: design,
    def: 'Ghi event vào bảng `Outbox` chung transaction với dữ liệu nghiệp vụ, rồi một worker publish sau. Chữa [[dual write]]; có thể gửi trùng nên consumer phải idempotent.',
    link: '/architecture/messaging#outbox',
  },
  saga: {
    title: 'Saga',
    group: design,
    def: 'Quy trình nhiều bước qua nhiều hệ thống không chung transaction: mỗi bước commit cục bộ, bước sau thất bại thì chạy [[compensation]].',
    link: '/architecture/messaging#saga',
  },
  compensation: {
    title: 'Compensation',
    full: 'compensating transaction',
    group: design,
    def: 'Hành động nghiệp vụ ngược lại cho một bước đã commit (hoàn tiền, nhả hàng trong kho), không phải rollback hay xoá dữ liệu.',
    link: '/architecture/messaging#compensation',
  },
  choreography: {
    title: 'Choreography',
    group: design,
    def: 'Saga không có bộ điều phối: mỗi service nghe event rồi tự làm phần mình. Đơn giản nhưng luồng nằm rải rác.',
    link: '/architecture/messaging#choreography-vs-orchestration',
  },
  orchestration: {
    title: 'Orchestration',
    group: design,
    def: 'Saga có một bộ điều phối (process manager) giữ trạng thái và ra lệnh từng bước. Dễ xem trạng thái, dễ quyết bước bù.',
    link: '/architecture/messaging#choreography-vs-orchestration',
  },

  // --- DDD ---
  ddd: {
    title: 'DDD',
    full: 'Domain-Driven Design',
    group: design,
    def: 'Cách thiết kế lấy model nghiệp vụ làm trung tâm: rule nằm trong model (tactical) và hệ thống chia theo vùng nghĩa (strategic).',
    link: '/architecture/ddd',
  },
  'anemic domain model': {
    title: 'Anemic domain model',
    group: design,
    def: 'Class chỉ có dữ liệu với setter public, rule nằm rải rác trong service. Ai cũng có thể đưa object vào trạng thái sai.',
    link: '/architecture/ddd#problem',
  },
  entity: {
    title: 'Entity',
    group: design,
    def: 'Object có danh tính: thuộc tính đổi thì vẫn là nó (Order #123 đổi địa chỉ vẫn là Order #123).',
    link: '/architecture/ddd#entity-value-object',
  },
  aggregate: {
    title: 'Aggregate',
    full: 'aggregate root',
    group: design,
    def: 'Nhóm object phải luôn đúng cùng nhau, chỉ sửa qua một cửa là aggregate root. Chỉ bảo vệ được rule trên dữ liệu nằm bên trong nó.',
    link: '/architecture/ddd#aggregate',
  },
  'domain event': {
    title: 'Domain event',
    group: design,
    def: 'Aggregate ghi lại "việc này vừa xảy ra" (`OrderPaid`). Xử lý trong service; muốn ra ngoài thì thành integration event qua [[outbox]].',
    link: '/architecture/ddd#domain-event',
  },
  'bounded context': {
    title: 'Bounded context',
    group: design,
    def: 'Vùng mà một từ có đúng một nghĩa và một model. Cùng chữ "Product" nhưng Catalog, Inventory, Shipping mỗi bên một model; thường là ranh giới service.',
    link: '/architecture/ddd#bounded-context',
  },
  'ubiquitous language': {
    title: 'Ubiquitous language',
    group: design,
    def: 'Code, tài liệu và người nghiệp vụ dùng cùng một bộ từ trong một bounded context.',
    link: '/architecture/ddd#ubiquitous-language',
  },
  acl: {
    title: 'ACL',
    full: 'Anti-corruption layer',
    group: design,
    def: 'Lớp dịch ở ranh giới, chuyển model của hệ thống ngoài hoặc legacy sang model của mình để nó không "nhiễm" vào domain.',
    link: '/architecture/ddd#context-map',
  },
}

export default terms
