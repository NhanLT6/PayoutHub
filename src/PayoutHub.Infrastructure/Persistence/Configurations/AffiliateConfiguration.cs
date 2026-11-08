using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayoutHub.Core.Domain;

namespace PayoutHub.Infrastructure.Persistence.Configurations;

public class AffiliateConfiguration : IEntityTypeConfiguration<Affiliate>
{
    public void Configure(EntityTypeBuilder<Affiliate> builder)
    {
        builder.Property(a => a.Name).HasMaxLength(200).IsRequired();
        builder.Property(a => a.Email).HasMaxLength(320).IsRequired();
        builder.HasIndex(a => a.Email).IsUnique();
    }
}
