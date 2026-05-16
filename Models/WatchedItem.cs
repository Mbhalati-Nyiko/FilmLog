using System.ComponentModel.DataAnnotations;

namespace FilmLog.Models
{
  public class WatchedItem
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    public string? Title { get; set; }
    public string? Poster { get; set; }
    public string? Year { get; set; }
    public string? Genre { get; set; }
    public string? Cast { get; set; }
    public string? ImdbID { get; set; }  // Consistent naming
    public DateTime WatchedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User? User { get; set; }
  }
}
