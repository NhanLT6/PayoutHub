using System.ComponentModel.DataAnnotations;

namespace PayoutHub.Core;

public class PayoutOptions
{
    public const string SectionName = "Payout";

    [Range(typeof(decimal), "0", "100000000000", MinimumIsExclusive =  true)]
    public decimal MinAmount { get; set; }

    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string DefaultCurrency { get; set; } = string.Empty;
}