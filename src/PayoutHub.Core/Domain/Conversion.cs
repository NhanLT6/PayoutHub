namespace PayoutHub.Core.Domain;

public class Conversion
{
    public int Id { get; private set; }
    public int MerchantId { get; private set; }
    public int AffiliateId { get; private set; }
    public Money Commission { get; private set; } = null!;
    public ConversionStatus Status { get; private set; }
    public DateTime OccurredAtUtc { get; private set; }
    public int? PayoutId { get; private set; }

    // EF Core cần constructor không tham số; private để code khác không dùng được.
    private Conversion()
    {
    }

    public Conversion(int merchantId, int affiliateId, Money commission, DateTime occurredAtUtc)
    {
        MerchantId = merchantId;
        AffiliateId = affiliateId;
        Commission = commission;
        Status = ConversionStatus.Pending;
        OccurredAtUtc = occurredAtUtc;
    }

    public void Approve()
    {
        if (Status is not ConversionStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot approve conversion ID {Id} in status {Status}");
        }

        Status = ConversionStatus.Approved;
    }

    public void Decline()
    {
        if (Status is not ConversionStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot decline conversion ID {Id} in status {Status}");
        }

        Status = ConversionStatus.Declined;
    }
}