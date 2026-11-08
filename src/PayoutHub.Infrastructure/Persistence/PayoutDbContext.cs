using Microsoft.EntityFrameworkCore;
using PayoutHub.Core.Domain;

namespace PayoutHub.Infrastructure.Persistence;

public class PayoutDbContext(DbContextOptions<PayoutDbContext> options) : DbContext(options)
{
    public DbSet<Merchant> Merchants => Set<Merchant>();
    public DbSet<Affiliate> Affiliates => Set<Affiliate>();
    public DbSet<Conversion> Conversions => Set<Conversion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tự tìm mọi class IEntityTypeConfiguration<T> trong project này (thư mục Configurations/).
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PayoutDbContext).Assembly);
    }
}
