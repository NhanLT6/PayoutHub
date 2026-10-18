# Mục lục sổ tay (mã mục)

Mã mục dùng để tham chiếu khi giải thích (vd "xem 4.6"). Nội dung đầy đủ trong `handbook.html`; tìm theo tiêu đề.

## 01 .NET Framework vs .NET (Core)

- **1.1** Bản đồ phiên bản
- **1.2** Bảng đối chiếu: thứ bạn dùng hằng ngày → thứ thay thế
- **1.3** .NET Framework và .NET (Core) khác nhau thế nào?
- **1.4** Kestrel là gì? Có còn cần IIS không?
- **1.5** Tại sao không còn HttpContext.Current?
- **1.6** Config hoạt động thế nào? Thay Web.config bằng gì?

## 02 Câu hỏi trả bài kinh điển

- **2.1** 4 tính chất của OOP
- **2.2** Abstract class vs interface
- **2.3** Overriding vs overloading vs new (method hiding)
- **2.4** const vs readonly vs static readonly
- **2.5** struct vs class vs record
- **2.6** String immutable nghĩa là gì? == vs Equals vs ReferenceEquals
- **2.7** ref vs out vs in
- **2.8** SOLID
- **2.9** Design pattern hay bị hỏi (và chỗ chúng có sẵn trong .NET)
- **2.10** DRY, KISS, YAGNI

## 03 Runtime & Memory

- **3.1** Code C# chạy như thế nào? CLR, IL, JIT
- **3.2** Value type vs reference type, stack vs heap
- **3.3** Boxing / unboxing
- **3.4** GC hoạt động thế nào?
- **3.5** GC chạy khi nào? Làm sao biết nó đang chạy và có vấn đề?
- **3.6** IDisposable, using, finalizer
- **3.7** Có GC rồi sao vẫn bị memory leak?
- **3.8** Span<T>, Memory<T>, ArrayPool

## 04 Async & Concurrency

- **4.1** Async/await giải quyết vấn đề gì?
- **4.2** await thực sự chạy thế nào?
- **4.3** Task vs Thread. Khi nào dùng Task.Run?
- **4.4** Concurrency vs parallelism
- **4.5** SynchronizationContext và ConfigureAwait(false)
- **4.6** Deadlock xảy ra khi nào?
- **4.7** async void có vấn đề gì?
- **4.8** Exception trong async và Task.WhenAll
- **4.9** CancellationToken
- **4.10** ValueTask vs Task
- **4.11** Thread safety: race condition và các công cụ đồng bộ
- **4.12** Task.Yield() dùng để làm gì?

## 05 C# hiện đại

- **5.1** Bản đồ theo version
- **5.2** Nullable reference types
- **5.3** Pattern matching và switch expression
- **5.4** Primary constructor, required, init
- **5.5** Mấy cú pháp nhỏ hay gặp trong code mẫu

## 06 Collections & LINQ

- **6.1** Độ phức tạp cần thuộc
- **6.2** Dictionary hoạt động bên trong thế nào?
- **6.3** Nên nhận và trả về kiểu collection nào?
- **6.4** IEnumerable vs IQueryable
- **6.5** Deferred execution và multiple enumeration
- **6.6** Các cặp toán tử LINQ hay bị hỏi
- **6.7** Big-O và các bẫy O(n²) ẩn trong code business

## 07 ASP.NET Core

- **7.1** App ASP.NET Core khởi động thế nào?
- **7.2** Middleware là gì? Thứ tự có quan trọng không?
- **7.3** Filter là gì? Khác middleware chỗ nào?
- **7.4** Controller hay Minimal API?
- **7.5** Model binding, validation và xử lý lỗi
- **7.6** Thiết kế REST API: status code và các quy ước
- **7.7** Logging đúng cách
- **7.8** Gọi API bên ngoài: IHttpClientFactory và resilience
- **7.9** Caching trong ASP.NET Core
- **7.10** "API chậm dần khi traffic tăng, bạn xử lý thế nào?"

## 08 Dependency Injection

- **8.1** Transient, Scoped, Singleton
- **8.2** Captive dependency: inject lifetime nào vào lifetime nào được?
- **8.3** Container dispose service thế nào?
- **8.4** Nhiều implementation cho một interface, keyed services, decorator
- **8.5** Constructor có quá nhiều dependency

## Chưa viết

9 AuthN/AuthZ · 10 EF Core · 11 Testing · 12 Migration Framework → .NET · 13 Kiến trúc mức senior · 14 Question bank
