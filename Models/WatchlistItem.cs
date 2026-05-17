using FilmLog.Models;
using System.ComponentModel.DataAnnotations;

public class WatchlistItem
{
  [Key]
  public int Id { get; set; }
  public int UserId { get; set; }
  public string? Title { get; set; }
  public string? Poster { get; set; }
  public string? Year { get; set; }
  public string? Genre { get; set; }
  public string? Cast { get; set; }
  public string? ImdbID { get; set; }
  public string? Rating { get; set; }  // Add this
  public string? Runtime { get; set; }  // Add this
  public DateTime AddedAt { get; set; } = DateTime.UtcNow;
  public User? User { get; set; }
}
