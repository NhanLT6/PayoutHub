namespace PayoutHub.Core.Domain;

// Value object: so sánh theo giá trị nhờ record.
public sealed record Money(decimal Amount, string Currency)
{
    public string Currency { get; } = !string.IsNullOrWhiteSpace(Currency)
        ? Currency
        : throw new InvalidOperationException("Currency cannot be empty");

    public static Money Zero(string currency)
    {
        return new Money(0m, currency);
    }

    public static Money operator +(Money left, Money right)
    {
        // TODO: khác Currency thì throw InvalidOperationException
        // TODO: trả về Money mới với Amount cộng lại
        return left.Currency != right.Currency
            ? throw new InvalidOperationException("Cannot sum money with different currencies")
            : new Money(left.Amount + right.Amount, left.Currency);
    }

    // TODO (tuỳ chọn): validate trong constructor, vd Amount âm hoặc Currency rỗng thì throw
}