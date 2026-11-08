using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PayoutHub.Infrastructure.Persistence;

namespace PayoutHub.Infrastructure;

public static class DependencyInjection
{
    // Program.cs gọi builder.Services.AddInfrastructure(builder.Configuration).
    // Api không cần biết chi tiết EF đăng ký thế nào.
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        string connectionString = configuration.GetConnectionString("PayoutDb")
            ?? throw new InvalidOperationException("Missing connection string 'PayoutDb'.");

        // TODO 4: đăng ký PayoutDbContext dùng SQL Server với connectionString.
        //   Câu hỏi kèm: AddDbContext đăng ký với lifetime nào, vì sao?

        return services;
    }
}
