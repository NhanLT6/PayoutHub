---
title: Mục lục câu hỏi
---

# Mục lục câu hỏi

Mọi câu hỏi kiểu phỏng vấn trên site, chia theo chủ đề. Trang nào có bài học thì câu hỏi nằm ở cuối trang đó. Mỗi câu có 4 phần: **Trả lời nhanh**, **Bản chất**, **Ở dự án thật** (thu gọn), **Bẫy & follow-up**.

::: tip Công thức cho câu hỏi trả bài
Nói định nghĩa trong 1 câu (Trả lời nhanh), rồi nối ngay sang 1 case bạn từng làm (Ở dự án thật), kết bằng 1 trade-off hoặc trường hợp không nên dùng. Interviewer gần như luôn đi theo hướng bạn mở ra, và phần thứ hai mới là chỗ senior được chấm điểm.
:::

## C# & .NET

### [.NET Framework vs .NET](/dotnet/framework-vs-core)

- [Bản đồ phiên bản](/dotnet/framework-vs-core#version-map)
- [Bảng đối chiếu: thứ bạn dùng hằng ngày → thứ thay thế](/dotnet/framework-vs-core#framework-to-core-map)
- [.NET Framework và .NET (Core) khác nhau thế nào?](/dotnet/framework-vs-core#framework-vs-core)
- [Kestrel là gì? Có còn cần IIS không?](/dotnet/framework-vs-core#kestrel)
- [Tại sao không còn HttpContext.Current?](/dotnet/framework-vs-core#httpcontext-current)
- [Config hoạt động thế nào? Thay Web.config bằng gì?](/dotnet/framework-vs-core#configuration)

### [OOP & C# cơ bản](/dotnet/oop-fundamentals)

- [4 tính chất của OOP](/dotnet/oop-fundamentals#oop)
- [Abstract class vs interface](/dotnet/oop-fundamentals#abstract-vs-interface)
- [Overriding vs overloading vs new (method hiding)](/dotnet/oop-fundamentals#override-overload-new)
- [const vs readonly vs static readonly](/dotnet/oop-fundamentals#const-readonly)
- [struct vs class vs record](/dotnet/oop-fundamentals#struct-class-record)
- [String immutable nghĩa là gì? == vs Equals vs ReferenceEquals](/dotnet/oop-fundamentals#string-equality)
- [ref vs out vs in](/dotnet/oop-fundamentals#ref-out-in)
- [SOLID](/dotnet/oop-fundamentals#solid)
- [Design pattern hay bị hỏi (và chỗ chúng có sẵn trong .NET)](/dotnet/oop-fundamentals#design-patterns)
- [DRY, KISS, YAGNI](/dotnet/oop-fundamentals#dry-kiss-yagni)

### [C# hiện đại](/dotnet/modern-csharp)

- [Bản đồ theo version](/dotnet/modern-csharp#csharp-versions)
- [Nullable reference types](/dotnet/modern-csharp#nullable)
- [Pattern matching và switch expression](/dotnet/modern-csharp#pattern-matching)
- [Primary constructor, required, init](/dotnet/modern-csharp#primary-ctor)
- [Mấy cú pháp nhỏ hay gặp trong code mẫu](/dotnet/modern-csharp#small-syntax)

### [Collections & LINQ](/dotnet/collections-linq)

- [Độ phức tạp cần thuộc](/dotnet/collections-linq#complexity)
- [Dictionary hoạt động bên trong thế nào?](/dotnet/collections-linq#dictionary)
- [Nên nhận và trả về kiểu collection nào?](/dotnet/collections-linq#collection-types)
- [IEnumerable vs IQueryable](/dotnet/collections-linq#ienumerable-vs-iqueryable)
- [Deferred execution và multiple enumeration](/dotnet/collections-linq#deferred-execution)
- [Các cặp toán tử LINQ hay bị hỏi](/dotnet/collections-linq#linq-pairs)
- [Big-O và các bẫy O(n²) ẩn trong code business](/dotnet/collections-linq#hidden-on2)

## Runtime & Async

### [Runtime & Memory](/runtime/memory)

- [Code C# chạy như thế nào? CLR, IL, JIT](/runtime/memory#clr-il-jit)
- [Value type vs reference type, stack vs heap](/runtime/memory#value-vs-reference)
- [Boxing / unboxing](/runtime/memory#boxing)
- [GC hoạt động thế nào?](/runtime/memory#gc)
- [GC chạy khi nào? Làm sao biết nó đang chạy và có vấn đề?](/runtime/memory#gc-diagnostics)
- [IDisposable, using, finalizer](/runtime/memory#idisposable)
- [Có GC rồi sao vẫn bị memory leak?](/runtime/memory#memory-leak)
- [`Span<T>`, `Memory<T>`, ArrayPool](/runtime/memory#span-memory)

### [Async & Concurrency](/runtime/async)

- [Async/await giải quyết vấn đề gì?](/runtime/async#why-async)
- [await thực sự chạy thế nào?](/runtime/async#how-await-works)
- [Task vs Thread. Khi nào dùng Task.Run?](/runtime/async#task-vs-thread)
- [Concurrency vs parallelism](/runtime/async#concurrency-vs-parallelism)
- [SynchronizationContext và ConfigureAwait(false)](/runtime/async#configureawait)
- [Deadlock xảy ra khi nào?](/runtime/async#deadlock)
- [async void có vấn đề gì?](/runtime/async#async-void)
- [Exception trong async và Task.WhenAll](/runtime/async#async-exceptions)
- [CancellationToken](/runtime/async#cancellation)
- [ValueTask vs Task](/runtime/async#valuetask)
- [Thread safety: race condition và các công cụ đồng bộ](/runtime/async#thread-safety)
- [Task.Yield() dùng để làm gì?](/runtime/async#task-yield)

## ASP.NET Core

### [Dependency Injection](/aspnet-core/dependency-injection#interview)

- [Transient, Scoped, Singleton](/aspnet-core/dependency-injection#lifetimes)
- [Captive dependency: inject lifetime nào vào lifetime nào được?](/aspnet-core/dependency-injection#captive-dependency)
- [Container dispose service thế nào?](/aspnet-core/dependency-injection#disposal)
- [Nhiều implementation cho một interface, keyed services, decorator](/aspnet-core/dependency-injection#multiple-implementations)
- [Constructor có quá nhiều dependency](/aspnet-core/dependency-injection#too-many-dependencies)

### [Options pattern](/aspnet-core/options-pattern#interview)

- [Validate config khi khởi động thế nào?](/aspnet-core/options-pattern#options-validation)
- [IOptions vs IOptionsSnapshot vs IOptionsMonitor](/aspnet-core/options-pattern#options-interfaces)
- [Finance muốn đổi MinAmount mà không restart](/aspnet-core/options-pattern#options-runtime-change)

### [Logging](/aspnet-core/logging#interview)

- [Logging đúng cách: message template hay string interpolation?](/aspnet-core/logging#logging)
- [User báo lỗi 500, tìm log tương ứng thế nào?](/aspnet-core/logging#find-log-500)

### [Middleware](/aspnet-core/middleware#interview)

- [Middleware là gì? Thứ tự có quan trọng không?](/aspnet-core/middleware#middleware)
- [Filter là gì? Khác middleware chỗ nào?](/aspnet-core/middleware#filters)

### [Exception handling](/aspnet-core/exception-handling#interview)

- [Model binding, validation và xử lý lỗi](/aspnet-core/exception-handling#validation-errors)

### [Health check](/aspnet-core/health-checks#interview)

- [Liveness và readiness khác nhau thế nào? Check DB đặt ở đâu?](/aspnet-core/health-checks#liveness-vs-readiness)

### [Bảo mật API](/aspnet-core/api-security#interview)

- [Authentication và authorization khác nhau thế nào?](/aspnet-core/api-security#authn-vs-authz)
- [JWT là gì? Có an toàn để chứa dữ liệu nhạy cảm không?](/aspnet-core/api-security#jwt)
- [IDOR / BOLA là gì? Bạn chặn thế nào?](/aspnet-core/api-security#idor)
- [CORS có bảo vệ API không?](/aspnet-core/api-security#cors)
- [SQL injection xảy ra thế nào và chặn ra sao?](/aspnet-core/api-security#sql-injection)
- [Thiết kế một API an toàn: checklist của bạn?](/aspnet-core/api-security#secure-api-checklist)

### Chưa có câu phỏng vấn riêng

- [Result pattern](/aspnet-core/result-pattern)

### [Câu hỏi khác](/aspnet-core/questions)

- [App ASP.NET Core khởi động thế nào?](/aspnet-core/questions#startup)
- [Controller hay Minimal API? Dùng cho app lớn được không?](/aspnet-core/questions#controllers-vs-minimal)
- [Thiết kế REST API: status code và các quy ước](/aspnet-core/questions#rest-design)
- [Gọi API bên ngoài: IHttpClientFactory và resilience](/aspnet-core/questions#httpclientfactory)
- [Caching trong ASP.NET Core](/aspnet-core/questions#caching)
- ["API chậm dần khi traffic tăng, bạn xử lý thế nào?"](/aspnet-core/questions#slow-api)

## Chưa viết

AuthN/AuthZ · EF Core · Testing · Migration Framework → .NET · Kiến trúc mức senior · Question bank
