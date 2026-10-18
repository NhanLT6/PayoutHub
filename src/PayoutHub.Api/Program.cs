using Microsoft.Extensions.Options;
using PayoutHub.Api;
using PayoutHub.Core;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<PayoutOptions>()
    .BindConfiguration(PayoutOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Logging.AddJsonConsole();

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseHttpsRedirection();

app.MapControllers();

app.MapGet("/", () => "Hello World!");

PayoutOptions payout = app.Services.GetRequiredService<IOptions<PayoutOptions>>().Value;
app.Logger.LogInformation("Payout config: {MinAmount} {Currency}", payout.MinAmount, payout.DefaultCurrency);

app.Run();