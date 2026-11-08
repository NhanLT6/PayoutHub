namespace PayoutHub.Core.Domain;

public class Merchant
{
    public int Id { get; private set; }
    public string Name { get; private set; } = null!;

    private Merchant() { }

    public Merchant(string name)
    {
        Name = name;
    }
}
