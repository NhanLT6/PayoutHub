namespace PayoutHub.Core.Domain;

public class Affiliate
{
    public int Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string Email { get; private set; } = null!;

    // Phương thức nhận tiền (Bank/PayPal/Wise) thêm ở M3 cùng IPayoutMethod.

    private Affiliate() { }

    public Affiliate(string name, string email)
    {
        Name = name;
        Email = email;
    }
}
