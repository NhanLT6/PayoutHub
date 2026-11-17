---
title: "Semantic layer: sinh SQL thống kê từ request có cấu trúc"
---

# Semantic layer: sinh SQL thống kê từ request có cấu trúc

Một chatbot hay API thống kê phải trả lời hàng trăm câu khác nhau trên cùng một tập dữ liệu: đếm, nhóm theo, phần trăm, xu hướng theo tháng, so sánh hai kỳ. Viết tay từng query thì không bền, vì câu hỏi mới xuất hiện liên tục. <T>Semantic layer</T> giải bài này bằng cách **khai báo** các dimension và measure có tên, rồi một compiler nhỏ sinh SQL từ request. Trang này đi qua vì sao builder kiểu `switch` vỡ, khái niệm <T>grain</T> và lỗi đếm phồng, hai quy tắc chặn nó, kiến trúc registry + compiler với code mẫu, và cách làm cho hệ thống sinh SQL debug được.

Đọc trước: [SQL chậm và index](/data/sql-performance). Liên quan: [Thiết kế tool cho LLM](/ai/llm-tools), nơi semantic layer là backend của một tool.

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="slInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker><marker id="slOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headOk" d="M0 0L10 5L0 10z"/></marker><marker id="slBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="headBad" d="M0 0L10 5L0 10z"/></marker></defs></svg>

## Bản đồ chủ đề {#topic-map}

<div class="fig">
<svg viewBox="0 0 720 330" role="img" aria-label="Bản đồ chủ đề. Bên trái: builder switch, một khối rối nhiều nhánh, thêm câu hỏi là sửa code. Bên phải: registry là danh sách entry, compiler cố định, ra SQL. Hàng dưới: grain core cộng satellite, fan-out một dòng thành ba, tám hình dạng query, golden test. Bẫy đỏ: COUNT star sau join, hai dimension đa trị, số khác màn hình, để model viết SQL.">
<a href="#problem" style="text-decoration:none">
<rect class="boxBad" x="20" y="30" width="230" height="130" rx="8" fill-opacity="0.15"/>
<text x="135" y="52" font-size="12" font-weight="600" text-anchor="middle" class="badT">switch + builder</text>
<path class="lnBad" d="M60 70 C 100 140, 140 60, 180 120 S 220 80, 210 130"/><path class="lnBad" d="M50 120 C 90 70, 160 150, 220 80"/><path class="lnBad" d="M70 140 C 120 100, 150 130, 200 70"/>
<text x="135" y="152" font-size="11" text-anchor="middle">câu mới = sửa code</text>
</a>
<line class="ln" x1="262" y1="95" x2="300" y2="95" marker-end="url(#slInk)"/>
<a href="#architecture" style="text-decoration:none">
<rect class="box" x="310" y="30" width="390" height="130" rx="8"/>
<rect class="boxAcc" x="330" y="56" width="100" height="80" rx="6"/>
<g class="lnAcc"><line x1="342" y1="72" x2="418" y2="72"/><line x1="342" y1="86" x2="410" y2="86"/><line x1="342" y1="100" x2="415" y2="100"/><line x1="342" y1="114" x2="405" y2="114"/></g>
<text x="380" y="52" font-size="11" text-anchor="middle" class="accT">Registry</text>
<line class="ln" x1="432" y1="96" x2="468" y2="96" marker-end="url(#slInk)"/>
<circle class="box" cx="505" cy="96" r="28"/><circle class="box" cx="505" cy="96" r="10"/>
<g class="ln"><line x1="505" y1="62" x2="505" y2="68"/><line x1="505" y1="124" x2="505" y2="130"/><line x1="471" y1="96" x2="477" y2="96"/><line x1="533" y1="96" x2="539" y2="96"/></g>
<text x="505" y="52" font-size="11" text-anchor="middle">Compiler</text>
<line class="lnOk" x1="542" y1="96" x2="578" y2="96" marker-end="url(#slOk)"/>
<rect class="boxOk" x="585" y="70" width="95" height="52" rx="4"/><text x="632" y="92" font-size="10" text-anchor="middle" class="mono">WITH core</text><text x="632" y="108" font-size="10" text-anchor="middle" class="mono">SELECT ...</text>
<text x="505" y="152" font-size="11" text-anchor="middle">câu mới = thêm một entry</text>
</a>
<a href="#llm-rule" style="text-decoration:none"><circle class="dotBad" cx="318" cy="176" r="4"/><text x="327" y="180" font-size="11" class="badT">model tự viết SQL</text></a>
<!-- bottom -->
<a href="#grain" style="text-decoration:none">
<rect class="box" x="20" y="200" width="160" height="100" rx="8"/>
<circle class="boxAcc" cx="70" cy="240" r="13"/>
<circle class="box" cx="118" cy="222" r="7"/><circle class="box" cx="128" cy="245" r="7"/><circle class="box" cx="112" cy="264" r="7"/>
<line class="lnMuted" x1="83" y1="237" x2="111" y2="224"/><line class="lnMuted" x1="83" y1="241" x2="121" y2="245"/><line class="lnMuted" x1="82" y1="245" x2="106" y2="261"/>
<text x="100" y="290" font-size="11.5" text-anchor="middle">Grain: core + satellite</text>
</a>
<a href="#fan-out" style="text-decoration:none">
<rect class="box" x="195" y="200" width="160" height="100" rx="8"/>
<rect class="box" x="212" y="232" width="34" height="14" rx="2"/>
<line class="lnBad" x1="248" y1="239" x2="282" y2="222" marker-end="url(#slBad)"/><line class="lnBad" x1="248" y1="239" x2="282" y2="239" marker-end="url(#slBad)"/><line class="lnBad" x1="248" y1="239" x2="282" y2="256" marker-end="url(#slBad)"/>
<rect class="boxBad" x="288" y="216" width="34" height="12" rx="2"/><rect class="boxBad" x="288" y="233" width="34" height="12" rx="2"/><rect class="boxBad" x="288" y="250" width="34" height="12" rx="2"/>
<text x="275" y="290" font-size="11.5" text-anchor="middle">Fan-out: 1 dòng thành 3</text>
</a>
<a href="#fan-out" style="text-decoration:none"><circle class="dotBad" cx="203" cy="316" r="4"/><text x="212" y="320" font-size="11" class="badT">COUNT(*) sau JOIN</text></a>
<a href="#shapes" style="text-decoration:none">
<rect class="box" x="370" y="200" width="160" height="100" rx="8"/>
<g><rect class="boxAcc" x="392" y="218" width="22" height="16" rx="2"/><rect class="box" x="420" y="218" width="22" height="16" rx="2"/><rect class="box" x="448" y="218" width="22" height="16" rx="2"/><rect class="box" x="476" y="218" width="22" height="16" rx="2"/><rect class="box" x="392" y="240" width="22" height="16" rx="2"/><rect class="box" x="420" y="240" width="22" height="16" rx="2"/><rect class="box" x="448" y="240" width="22" height="16" rx="2"/><rect class="box" x="476" y="240" width="22" height="16" rx="2"/></g>
<text x="450" y="290" font-size="11.5" text-anchor="middle">Tám hình dạng query</text>
</a>
<a href="#dev-experience" style="text-decoration:none">
<rect class="box" x="545" y="200" width="155" height="100" rx="8"/>
<rect class="box" x="565" y="216" width="50" height="40" rx="3"/><rect class="boxOk" x="630" y="216" width="50" height="40" rx="3"/>
<text x="622" y="241" font-size="12" text-anchor="middle">=</text>
<text x="622" y="290" font-size="11.5" text-anchor="middle">Golden test + includeSql</text>
</a>
<a href="#core" style="text-decoration:none"><circle class="dotBad" cx="28" cy="316" r="4"/><text x="37" y="320" font-size="11" class="badT">số khác màn hình</text></a>
<a href="#fan-out" style="text-decoration:none"><circle class="dotBad" cx="378" cy="316" r="4"/><text x="387" y="320" font-size="11" class="badT">hai dimension đa trị</text></a>
</svg>
<p class="fig-caption">Trên: từ builder rối sang registry + compiler. Dưới: các mục bên trong. Tự hỏi: vì sao "câu hỏi mới buộc phải sửa compiler" là dấu hiệu mô hình dữ liệu sai? Vì sao <code>EXISTS</code> không làm phồng số còn <code>JOIN</code> thì có?</p>
</div>

Domain ví dụ cho cả trang: **thư mục thành viên** của nhiều tổ chức. Mỗi thành viên có đúng một trạng thái, nhưng **nhiều** kỹ năng, nhiều khu vực, nhiều tài khoản mạng xã hội.

## 1. Vấn đề: một `switch` cho mỗi câu hỏi {#problem}

Hướng hay gặp là một method `Process` với `switch` map từng chuỗi ("Join Month", "Skill") sang một đoạn SQL, cộng một builder hàng nghìn dòng ghép các đoạn đó. Nó chạy được cho chục câu hỏi đầu, rồi đau:

- Thêm một dimension phải sửa ở hai, ba chỗ, và dễ quên một chỗ.
- Logic nằm trong nhánh code nên không đọc được như một danh sách, không test riêng từng phần.
- Builder thiết kế cho một loại dữ liệu (sự kiện giao dịch) không nối thêm được dữ liệu khác <T>grain</T> (tài khoản).

Nếu tool đã có **hình dạng request** hợp lý (mảng `dimensions`, `metrics`, filter dạng `{parameter, operator, values}`, `sortColumn`, `take`), giữ nguyên hình dạng đó. Chỉ thay phần cài đặt phía sau.

### Nguyên tắc với LLM {#llm-rule}

**Model chỉ được chọn measure và dimension có tên, không tự viết SQL.** Vì mỗi tên đã được quản trị (join đúng, công thức đúng, lọc đúng quyền), model không thể tự suy ra một join sai hay quên điều kiện loại tài khoản test. Đây chính là thứ semantic layer sinh ra để làm; Cube, Looker (LookML), dbt MetricFlow, Malloy đều theo nguyên tắc này. Trang này lấy phần cốt lõi, cắt gọn cho một dataset.

## 2. Grain: core cộng satellites {#grain}

**Một query phẳng không chứa được dữ liệu có hai grain khác nhau.** Thành viên có một trạng thái nhưng nhiều kỹ năng; join tất cả vào một query thì ra một dòng cho mỗi tổ hợp (thành viên × kỹ năng × khu vực), và mọi phép đếm bị nhân lên. Vì vậy chia dữ liệu theo grain:

```text
CORE        một dòng cho mỗi cặp (tổ chức, thành viên)
            MemberId, status, ngày vào, ngày rời, quốc gia ...

SATELLITES  nhiều dòng cho mỗi thành viên, mỗi dòng = MemberId + một giá trị
            Skills, Regions, SocialProfiles (platform, followers)
```

### Core phải khớp màn hình hiện có {#core}

**Người dùng đã nhìn thấy con số trên màn hình; bot trả số khác thì người dùng đúng, bot sai.** Nên core phải sao chép nguyên cách màn hình đang tính, kể cả chỗ có vẻ lạ:

- Chỉ lấy dòng quan hệ mới nhất của mỗi cặp: `ROW_NUMBER() OVER (PARTITION BY OrgId, MemberId ORDER BY Id DESC)`.
- Công thức `CASE` suy ra trạng thái hiển thị.
- Điều kiện loại tài khoản test, tài khoản đã xoá, điều kiện visibility.
- Lọc trên giá trị thô (raw), không phải giá trị đã làm tròn để hiển thị.

## 3. Hai quy tắc chặn đếm phồng {#fan-out}

**Join một bảng one-to-many nhân số dòng, nên measure nào cộng hay đếm trên dòng đều phồng theo.** Hai lỗi kinh điển: <T>fan trap</T> (một join one-to-many làm phồng một measure) và chasm trap (hai join one-to-many cùng gốc nhân nhau, phồng theo tích). Looker chữa bằng symmetric aggregates, MetricFlow dò loại entity để tránh join gây fan-out. Với một dataset, hai quy tắc sau chặn cả hai ngay từ cách dựng:

**Quy tắc 1: filter dùng `EXISTS`, không dùng `JOIN`.** `EXISTS` chỉ hỏi "có ít nhất một dòng không", nên không nhân dòng, không cần `DISTINCT`. "Bao nhiêu thành viên có kỹ năng Design" là `WHERE EXISTS (SELECT 1 FROM skills ...)` trên core.

**Quy tắc 2: tối đa một dimension đa trị mỗi query, và satellite gộp về grain thành viên trước khi join.** Tổng follower tính theo từng thành viên trong subquery trước, rồi mới join. Request có hai dimension đa trị (Skill × Region) thì **từ chối kèm thông báo rõ**, không trả số sai.

Khi join một satellite để group by, measure phải là `COUNT(DISTINCT MemberId)`, không phải `COUNT(*)`. Và tổng các nhóm sẽ **lớn hơn** tổng thành viên: người có hai kỹ năng thuộc hai nhóm. Điều đó đúng, nhưng câu trả lời nên nói rõ.

## 4. Kiến trúc: registry, compiler, tool mỏng {#architecture}

**Câu hỏi nằm trong dữ liệu (registry), còn code (compiler) không biết câu hỏi cụ thể nào.**

```text
Registry (dữ liệu, vài chục entry nhỏ)
  Dimension  { Name, SelectSql, GroupBySql, Source }
  Measure    { Name, Sql }
  Filter     { Name, Column hoặc Satellite, AllowedOperators, ToLiteral }
  Satellite  { Name, Sql }

Compiler (vài trăm dòng)
  xác định satellite nào cần
  sinh core thành CTE, chỉ sinh CTE cho satellite được nhắc tới
  filter thành EXISTS (satellite) hoặc predicate (core)
  sinh SELECT, GROUP BY, ORDER BY, TOP

Tools (mỏng)
  stats   thêm GROUP BY và aggregate
  filter  thêm ORDER BY, paging, danh sách cột
```

Cả hai tool đi qua cùng registry nên số liệu không thể lệch nhau.

**Quy tắc bảo trì:** thêm câu hỏi mới nghĩa là thêm entry vào registry, **không bao giờ sửa compiler**. Một câu hỏi buộc phải sửa compiler nghĩa là mô hình dữ liệu sai: dừng lại sửa mô hình, đừng thêm nhánh riêng cho câu đó. Đây là khác biệt cốt lõi so với builder kiểu `switch`, nơi mọi câu hỏi đều là một nhánh code.

### Code mẫu: giai đoạn 1, đếm và filter {#code}

::: code-group

```csharp [StatsRequest.cs]
namespace PayoutHub.Core.Stats;

public sealed class StatsRequest
{
    public List<string> Dimensions { get; } = [];
    public List<string> Metrics { get; } = [];
    public List<FilterClause> Filters { get; } = [];
}

public sealed class FilterClause
{
    public required string Parameter { get; init; }
    public required string Operator { get; init; }   // "Include" | "Exclude"
    public List<string> Values { get; } = [];
}
```

```csharp [Registry.cs]
namespace PayoutHub.Core.Stats;

public sealed record MeasureDef(string Name, string Sql);
public sealed record SatelliteDef(string Name, string Sql);
public sealed record FilterDef(
    string Name, string? CoreColumn, string? Satellite, string? SatelliteColumn,
    Func<string, string> ToLiteral);

public sealed class Registry
{
    public Dictionary<string, MeasureDef> Measures { get; } = new();
    public Dictionary<string, FilterDef> Filters { get; } = new();
    public Dictionary<string, SatelliteDef> Satellites { get; } = new();

    public string CoreSql { get; } = """
        core AS (
            SELECT m.MemberId, m.Status AS MembershipStatus, m.DateJoined, m.DateLeft
            FROM (
                SELECT *, ROW_NUMBER() OVER (PARTITION BY OrgId, MemberId ORDER BY Id DESC) AS rn
                FROM Memberships WHERE OrgId = @OrgId
            ) m
            JOIN Members p ON p.Id = m.MemberId
            WHERE m.rn = 1 AND p.DateDeleted IS NULL
        )
        """;

    public static Registry Build()
    {
        var r = new Registry();
        r.Measures["Member Count"] = new("Member Count", "COUNT(DISTINCT core.MemberId)");
        r.Satellites["skills"] = new("skills", "skills AS (SELECT MemberId, Skill FROM MemberSkills)");
        r.Filters["Membership Status"] = new("Membership Status", "MembershipStatus", null, null,
            v => v switch { "Active" => "100", "Invited" => "200", "Left" => "300",
                            _ => throw new ArgumentException($"Unknown Membership Status: {v}") });
        r.Filters["Skill"] = new("Skill", null, "skills", "Skill",
            v => v switch { "Design" => "10", "Writing" => "20", "Video" => "30",
                            _ => throw new ArgumentException($"Unknown Skill: {v}") });
        return r;
    }
}
```

```csharp [Compiler.cs]
using System.Text;

namespace PayoutHub.Core.Stats;

public sealed class Compiler(Registry registry)
{
    public string Compile(StatsRequest request)
    {
        if (request.Dimensions.Count > 0) throw new NotSupportedException("Dimensions arrive in phase 2.");
        if (request.Metrics.Count == 0) throw new ArgumentException("At least one metric is required.");

        var satellites = request.Filters.Select(f => Lookup(f).Satellite).OfType<string>().Distinct();
        var ctes = new List<string> { registry.CoreSql };
        ctes.AddRange(satellites.Select(n => registry.Satellites[n].Sql));

        var selects = request.Metrics.Select(m => $"{registry.Measures[m].Sql} AS [{m}]");
        var predicates = request.Filters.Select(BuildPredicate).ToList();

        var sql = new StringBuilder();
        sql.Append("WITH ").AppendLine(string.Join(",\n", ctes));
        sql.Append("SELECT ").AppendLine(string.Join(", ", selects));
        sql.AppendLine("FROM core");
        if (predicates.Count > 0) sql.Append("WHERE ").AppendLine(string.Join("\n  AND ", predicates));
        return sql.ToString().TrimEnd();
    }

    private FilterDef Lookup(FilterClause c) =>
        registry.Filters.TryGetValue(c.Parameter, out var def)
            ? def : throw new ArgumentException($"Unknown filter parameter: {c.Parameter}");

    private string BuildPredicate(FilterClause c)
    {
        var def = Lookup(c);
        var literals = string.Join(", ", c.Values.Select(def.ToLiteral));
        var negate = c.Operator == "Exclude";

        if (def.CoreColumn is not null)
            return $"core.{def.CoreColumn} {(negate ? "NOT IN" : "IN")} ({literals})";

        return $"{(negate ? "NOT EXISTS" : "EXISTS")} (SELECT 1 FROM {def.Satellite} s " +
               $"WHERE s.MemberId = core.MemberId AND s.{def.SatelliteColumn} IN ({literals}))";
    }
}
```

:::

Request "bao nhiêu thành viên Active có kỹ năng Design" sinh ra:

```sql
WITH core AS ( ... như CoreSql ... ),
skills AS (SELECT MemberId, Skill FROM MemberSkills)
SELECT COUNT(DISTINCT core.MemberId) AS [Member Count]
FROM core
WHERE core.MembershipStatus IN (100)
  AND EXISTS (SELECT 1 FROM skills s WHERE s.MemberId = core.MemberId AND s.Skill IN (10))
```

**Vì sao an toàn dù ghép chuỗi:** giá trị từ request không bao giờ đi thẳng vào SQL. Mỗi giá trị qua `ToLiteral`, là một **whitelist**; giá trị lạ ném lỗi, nên gõ sai thì lỗi to thay vì trả số sai âm thầm. Tên cột và tên bảng chỉ đến từ registry. `@OrgId` lấy từ phiên đăng nhập phía server, không từ request. Giá trị tự do (khoảng ngày, số) thì dùng `SqlParameter`, không ghép.

## 5. Tám hình dạng query {#shapes}

**Hàng trăm câu hỏi thực tế chỉ gồm vài hình dạng**, nên một tool với vài tham số phủ hết:

| Hình dạng | Gọi thế nào |
|---|---|
| Đếm một số | `dimensions: []`, `metrics: ["Member Count"]` |
| Phân tách theo nhóm | `dimensions: ["Skill"]` |
| Phần trăm | `metrics: ["Percentage of Total"]` |
| Cao nhất, thấp nhất | `sortColumn` theo metric, `take: 1`, `includeEmptyGroups: true` |
| Chuỗi theo tháng, quý | `dimensions: ["Join Month"]` |
| Thống kê trên một giá trị | `metrics: ["Follower Median"]` |
| Vào, ra, ròng | `metrics: ["Join Count", "Exit Count", "Net Change"]` |
| So sánh hai kỳ | `compareToPreviousPeriod: true` |

`includeEmptyGroups` bắt đầu phép nhóm từ **danh sách tham chiếu** (mọi kỹ năng) thay vì từ dòng thành viên, để nhóm có 0 người vẫn hiện ra. Thiếu nó thì câu "kỹ năng nào ít người nhất" luôn sai: nhóm 0 người không có dòng nào để hiện.

Thứ tự xây: (1) core, filter, đếm không dimension: giai đoạn quyết định tính đúng, vì số khác màn hình thì mọi thứ phía trên đều sai; (2) một dimension, `includeEmptyGroups`, sort, take; (3) measure không phải đếm; (4) so sánh kỳ và bộ ba vào, ra, ròng.

## 6. Làm cho SQL sinh ra debug được {#dev-experience}

**Hệ thống sinh SQL bị ghét vì không ai nhìn thấy SQL nó sinh ra.** Ba lớp bảo vệ nhắm đúng vào lý do đó:

1. **Trả lại SQL đã sinh.** Cờ `includeSql` trong response. Biến SQL thành output, đừng bắt người ta dò bằng SQL Profiler.
2. **<T>Golden test</T> cho mỗi câu hỏi mẫu.** Mỗi câu một test, assert đúng chuỗi SQL compiler sinh. Sửa compiler thì diff cho thấy chính xác câu nào đổi. Golden test cũng là thứ cho phép thay hẳn engine về sau mà không sợ đổi đáp án.
3. **Từ chối thẳng yêu cầu bất khả thi**: hai dimension đa trị, metric không khớp, filter ngoài quyền. Trả số sai một cách tự tin tệ hơn một lỗi rõ, vì sai grain có thể đếm đôi âm thầm hàng tháng trước khi ai phát hiện.

## 7. Biến thể và trade-off {#trade-offs}

- **Không nên** mở rộng builder cũ cho dữ liệu khác grain, không xây ngôn ngữ biểu thức hay cho SQL tuỳ ý đi qua. Builder nghìn dòng bắt đầu đúng từ đó.
- **Bảng snapshot phi chuẩn hoá ban đêm** (một dòng mỗi thành viên, satellite đã làm phẳng) biến phần lớn câu hỏi thành query một bảng, đổi lại dữ liệu cũ một ngày. Vì contract của tool nói về measure và dimension chứ không về bảng, có thể thay backend sau mà không đụng tool, miễn golden test đã khoá đáp án.
- **Công cụ có sẵn** (Cube, dbt Semantic Layer) đáng dùng khi có nhiều dataset và nhiều người tiêu thụ (BI, API, AI). Một dataset, một tool thì vài trăm dòng tự viết dễ hiểu và dễ sửa hơn.
- **Câu hỏi engine không phủ**, nên liệt kê từ đầu thay vì nhồi vào: kiểm thiếu dữ liệu theo từng field, đếm xuyên mọi tổ chức (phá scope), dữ liệu không nằm trong SQL, quy tắc nằm trong C# chưa port sang SQL, và câu cần lịch sử chuyển trạng thái mà bản ghi hiện tại không giữ.

## Câu hỏi phỏng vấn {#interview}

### Một query thống kê trả số lớn hơn thực tế sau khi thêm JOIN. Vì sao, sửa thế nào? <Badge type="warning" text="hay bị hỏi" /> {#inflated-count}

::: tip Trả lời nhanh
**Fan-out**: join bảng one-to-many nhân số dòng, nên `COUNT(*)`/`SUM` đếm mỗi thành viên nhiều lần. Sửa: filter bằng `EXISTS` thay vì `JOIN`; group by satellite thì dùng `COUNT(DISTINCT id)`; cần `SUM` thì gộp satellite về grain thành viên trong subquery trước khi join. Xem [Hai quy tắc chặn đếm phồng](#fan-out).
:::

::: details Câu trả lời mẫu (English)
- Joining a one-to-many table multiplies rows, so row-level aggregates double count (fan trap; two such joins multiply each other, chasm trap).
- Filters: use EXISTS, it never multiplies rows.
- Grouping by the many side: COUNT(DISTINCT key), and say the group totals exceed the population.
- Sums: pre-aggregate the child table to the parent grain in a subquery, then join.
- If a request needs two multi-valued dimensions, reject it rather than return a wrong number.
:::

::: warning Bẫy & follow-up
- Thêm `DISTINCT` vào cả câu cho "hết trùng": đúng cho đếm, **sai** cho `SUM` (hai giao dịch cùng số tiền bị gộp làm một).
- Follow-up: "Sao tổng các nhóm lại lớn hơn tổng số người?" Vì một người thuộc nhiều nhóm; đó là đúng, không phải bug.
:::

### Bạn cho LLM trả lời câu hỏi thống kê. Có để nó viết SQL không? <Badge type="warning" text="câu senior" /> {#llm-text-to-sql}

::: tip Trả lời nhanh
Không. Model chỉ chọn **measure và dimension có tên** trong một registry; compiler sinh SQL. Như vậy join, công thức và lọc quyền đã được kiểm, giá trị đi qua whitelist, và có golden test khoá đáp án. Xem [Nguyên tắc với LLM](#llm-rule).
:::

::: details Câu trả lời mẫu (English)
- Free-form text-to-SQL means the model re-derives joins and metric formulas every time; it will eventually get grain wrong and double count silently.
- Instead: a semantic layer. The model picks governed names; a small compiler emits SQL.
- Safety: values pass through whitelists, tenant scope comes from the session, never from the model.
- Debuggability: return the generated SQL, golden-test every sample question.
:::

::: warning Bẫy & follow-up
- "Cho model chạy trên connection read-only là đủ an toàn": read-only chặn ghi, không chặn **đọc chéo tenant** hay số sai.
- Follow-up: "Câu hỏi mới mà registry không có?" Thêm entry; nếu phải sửa compiler thì mô hình sai.
:::

## Tự kiểm tra {#self-check}

1. "Có bao nhiêu thành viên có kỹ năng Design hoặc Video": viết bằng `JOIN` thì sai ở đâu, viết bằng `EXISTS` thì vì sao đúng?
2. Bot trả 1.204 thành viên Active, màn hình hiện 1.198. Bạn nghi phần nào của core trước?
3. Vì sao request Skill × Region bị từ chối thay vì cố trả lời?
4. Câu "khu vực nào ít thành viên nhất" luôn trả một khu vực có ít nhất 1 người, dù có khu vực 0 người. Thiếu gì?
5. Bạn sửa compiler để tối ưu một CTE. Làm sao biết câu hỏi nào bị đổi đáp án?
