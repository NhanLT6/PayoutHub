---
title: Bản đồ dự án
---

# Bản đồ dự án PayoutHub

Trang này vẽ lại toàn bộ PayoutHub để nhìn một lần là thấy: **code nằm ở đâu, request đi qua đâu, tiền đi thế nào**. Cập nhật sau mỗi bước của [Plan](/progress/plan).

Chú thích màu: <span class="pm-done">đã làm</span> · <span class="pm-wip">đang làm</span> · <span class="pm-todo">chưa làm</span>

## 1. Các layer và file {#layers}

Mũi tên đậm = "tham chiếu tới" (Api cũng tham chiếu Core). **Core không tham chiếu ai**: Core khai báo interface, Infrastructure implement (DIP).

```mermaid
flowchart TB
  subgraph Api["PayoutHub.Api · web, HTTP"]
    direction LR
    P[Program.cs<br/>DI + pipeline]:::done
    GEH[GlobalExceptionHandler]:::done
    AM[AuditMiddleware]:::todo
    C[Controllers]:::todo
    W[PayoutWorker]:::todo
  end
  subgraph Infra["PayoutHub.Infrastructure · EF, gọi ra ngoài"]
    direction LR
    DB[PayoutDbContext<br/>+ Fluent config]:::todo
    MIG[Migrations]:::todo
    SEED[Seeder]:::todo
    FBC[FakeBankClient]:::todo
  end
  subgraph Core["PayoutHub.Core · domain thuần, không tham chiếu ai"]
    direction LR
    OPT[PayoutOptions]:::done
    MONEY[Domain/Money]:::wip
    CONV[Domain/Conversion]:::wip
    PAY[Domain/Payout]:::todo
    IPM[IPayoutMethod]:::todo
  end
  subgraph Ext["Bên ngoài"]
    direction LR
    SQL[(SQL Server)]
    FB[(FakeBank.Api)]:::todo
  end
  Api ==> Infra ==> Core
  Infra -.-> Ext

  classDef done fill:#d1fae5,stroke:#059669,color:#064e3b
  classDef wip fill:#fef3c7,stroke:#d97706,color:#78350f
  classDef todo fill:#f3f4f6,stroke:#9ca3af,color:#374151,stroke-dasharray:4 3
```

## 2. Một request đi qua pipeline {#pipeline}

Thứ tự trong `Program.cs`. Middleware chỉ bọc được những gì **đứng sau** nó ([Middleware pipeline](/aspnet-core/middleware#middleware)).

```mermaid
flowchart TB
  R([Request]) --> EH[UseExceptionHandler<br/>bọc tất cả bên dưới]:::done
  EH --> HR[UseHttpsRedirection]:::done
  HR --> AU[AuditMiddleware<br/>ghi log request vào DB · M2]:::todo
  AU --> AN[UseAuthentication<br/>bạn là ai · M3]:::todo
  AN --> AZ[UseAuthorization<br/>bạn được làm gì · M3]:::todo
  AZ --> EP{Endpoint}
  EP --> CT[Controller<br/>mỏng]:::todo
  EP --> HC[/health/]:::done
  CT --> ENT[Entity method<br/>Approve, Decline...]:::wip

  classDef done fill:#d1fae5,stroke:#059669,color:#064e3b
  classDef wip fill:#fef3c7,stroke:#d97706,color:#78350f
  classDef todo fill:#f3f4f6,stroke:#9ca3af,color:#374151,stroke-dasharray:4 3
```

Mỗi request có **một scope DI**: `PayoutDbContext` (scoped) sống đúng một request, rồi bị dispose.

```
App start ──●──────────────────────────────────▶
            └ Singleton: logger, options,
              convention middleware (new 1 lần)
Request 1     ├─ scope 1: DbContext #1 ─┤
Request 2              ├─ scope 2: DbContext #2 ─┤
              (IMiddleware cũng new theo từng scope)
```

## 3. Luồng tiền từ đầu đến cuối {#money-flow}

```mermaid
sequenceDiagram
  autonumber
  actor F as Merchant / Finance
  participant API as Api
  participant W as Worker
  participant FB as FakeBank
  F->>API: Approve conversion (M2)
  F->>API: generate payout (M3)
  Note right of API: gom theo affiliate,<br/>bỏ nếu < MinAmount
  F->>API: approve payout (M3)
  Note right of API: rowversion → 409
  API-->>F: 202 Accepted
  API->>W: Channel: payoutId (M4)
  W->>FB: POST /transfers (M4)
  Note over W,FB: Idempotency-Key = payoutId<br/>retry, timeout, breaker
  FB->>API: webhook Paid/Failed (M5)
  Note right of API: verify HMAC,<br/>bỏ event trùng
```

Bấm vào sơ đồ bất kỳ để mở toàn màn hình: kéo để di chuyển, cuộn chuột hoặc `+`/`-` để zoom, Esc để đóng.


## 4. State machine {#state-machines}

Chỉ đổi trạng thái qua **method của entity**; sai trạng thái thì throw (sau map thành 409).

```mermaid
stateDiagram-v2
  direction LR
  state "Conversion (M2)" as C {
    [*] --> Pending
    Pending --> Approved: Approve()
    Pending --> Declined: Decline()
  }
```

```mermaid
stateDiagram-v2
  direction LR
  state "Payout (M3–M5)" as P {
    [*] --> Draft
    Draft --> PendingApproval: Submit()
    PendingApproval --> Approved: Approve() · Finance
    PendingApproval --> Draft: Reject()
    Approved --> Processing: worker gọi FakeBank
    Processing --> Paid: webhook
    Processing --> Failed: webhook
  }
```

## 5. Lý thuyết nằm ở đâu trong code {#theory-map}

| Câu phỏng vấn | Nằm ở | Bước |
|---|---|---|
| [Options pattern](/aspnet-core/options-pattern#options-interfaces) | `Core/PayoutOptions.cs`, `Program.cs` (`ValidateOnStart`) | M1 ✓ |
| [Exception handling](/aspnet-core/exception-handling#exception-flow) | `Api/GlobalExceptionHandler.cs` | M1 ✓ |
| Encapsulation ([OOP](/dotnet/oop-fundamentals#oop)) | `Core/Domain/Conversion.cs` (`private set`, `Approve()`) | M2 |
| [record, value object](/dotnet/oop-fundamentals#struct-class-record) | `Core/Domain/Money.cs` | M2 |
| [Middleware lifetime](/aspnet-core/middleware#middleware-lifetime), [Captive dependency](/aspnet-core/dependency-injection#captive-dependency) | `Api/AuditMiddleware.cs` | M2 |
| [IEnumerable vs IQueryable](/dotnet/collections-linq#ienumerable-vs-iqueryable), N+1 | `GET /affiliates/{id}/conversions` | M2 |
| Optimistic concurrency, [REST status](/aspnet-core/questions#rest-design) | `POST /payouts/{id}/approve` | M3 |
| [SOLID](/dotnet/oop-fundamentals#solid) (OCP), [Nhiều implementation](/aspnet-core/dependency-injection#multiple-implementations) | `Core/IPayoutMethod` + Bank/PayPal/Wise | M3 |
| [Async](/runtime/async), scope trong singleton | `Api/PayoutWorker.cs` | M4 |
| [IHttpClientFactory](/aspnet-core/questions#httpclientfactory), idempotency | `Infrastructure/FakeBankClient.cs` | M4 |

<style>
.pm-done, .pm-wip, .pm-todo { padding: 1px 8px; border-radius: 6px; font-size: .85em; }
.pm-done { background: #d1fae5; color: #064e3b; }
.pm-wip  { background: #fef3c7; color: #78350f; }
.pm-todo { background: #f3f4f6; color: #374151; border: 1px dashed #9ca3af; }
</style>
