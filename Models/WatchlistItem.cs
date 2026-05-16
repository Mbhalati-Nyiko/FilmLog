using System.ComponentModel.DataAnnotations;

namespace FilmLog.Models
{
  public class WatchlistItem
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }  // Link to user

    public string? Title { get; set; }
    public string? Poster { get; set; }
    public string? Year { get; set; }
    public string? Genre { get; set; }
    public string? Cast { get; set; }
    public string? ImdbID { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
  }
}
