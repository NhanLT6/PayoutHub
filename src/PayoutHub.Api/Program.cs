using PayoutHub.Core;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<PayoutOptions>()
    .BindConfiguration(PayoutOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.MapGet("/", () => "Hello World!");

app.Run();
