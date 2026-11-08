using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PayoutHub.Core.Domain;

namespace PayoutHub.Infrastructure.Persistence.Configurations;

public class ConversionConfiguration : IEntityTypeConfiguration<Conversion>
{
    public void Configure(EntityTypeBuilder<Conversion> builder)
    {
        // Quan hệ: Conversion thuộc về 1 Merchant và 1 Affiliate (chỉ có FK, không có navigation).
        builder.HasOne<Merchant>().WithMany().HasForeignKey(c => c.MerchantId);
        builder.HasOne<Affiliate>().WithMany().HasForeignKey(c => c.AffiliateId);

        // TODO 1: map value object Money thành 2 cột ngay trong bảng Conversions
        //   dùng builder.ComplexProperty(c => c.Commission, money => { ... })
        //   - Amount: decimal(18,2)  → HasPrecision(...)
        //   - Currency: 3 ký tự (ISO 4217, vd "USD") → HasMaxLength(...)
        //   - đặt tên cột: CommissionAmount, CommissionCurrency → HasColumnName(...)

        // TODO 2: lưu Status dạng chuỗi ("Pending") thay vì số (0) cho dễ đọc khi query tay
        //   → HasConversion<string>() + HasMaxLength(20)

        // TODO 3: index phục vụ GET /affiliates/{id}/conversions (lọc theo affiliate, sắp theo thời gian)
        //   → HasIndex(...) gồm 2 cột nào, theo thứ tự nào? Vì sao thứ tự quan trọng?
    }
}
