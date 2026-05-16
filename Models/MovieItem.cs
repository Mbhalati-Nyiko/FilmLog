using System.ComponentModel.DataAnnotations;

namespace FilmLog.Models
{
  public class MovieItem
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public string? Title { get; set; }

    [Required]
    public string? Poster { get; set; }

    [Required]
    public string? Year { get; set; }

    public string? Genre { get; set; }

    public string? Cast { get; set; }
  }
}
