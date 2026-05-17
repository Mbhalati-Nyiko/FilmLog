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

    [Required]
    public string? Genre { get; set; }

    [Required]
    public string? Actors { get; set; }

    [Required]
    public string? Type { get; set; }
  }
}
