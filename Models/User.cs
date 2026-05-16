using System.ComponentModel.DataAnnotations;

namespace FilmLog.Models
{
  public class User
  {
    [Key]
    public int Id { get; set; }  // Removed nullable

    [Required]
    public string? Username { get; set; }

    [Required]
    public string? Email { get; set; }

    [Required]
    public string? PasswordHash { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  }
}
