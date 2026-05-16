using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FilmLog.Repositories;

namespace FilmLog.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class StatsController : ControllerBase
  {
    private readonly IWatchedRepo _watchedRepo;  // Fixed interface name

    public StatsController(IWatchedRepo watchedRepo)  // Fixed interface name
    {
      _watchedRepo = watchedRepo;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetDashboardStats()
    {
      var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
      var watchedMovies = await _watchedRepo.GetByUserIdAsync(userId);

      var stats = new
      {
        TotalMoviesWatched = watchedMovies.Count,
        MostWatchedGenre = watchedMovies
            .Where(m => !string.IsNullOrEmpty(m.Genre))
            .GroupBy(m => m.Genre)
            .OrderByDescending(g => g.Count())
            .FirstOrDefault()?.Key ?? "N/A",
        MoviesByYear = watchedMovies
            .Where(m => !string.IsNullOrEmpty(m.Year))
            .GroupBy(m => m.Year)
            .Select(g => new { Year = g.Key, Count = g.Count() }),
        GenreDistribution = watchedMovies
            .Where(m => !string.IsNullOrEmpty(m.Genre))
            .GroupBy(m => m.Genre)
            .Select(g => new { Genre = g.Key, Count = g.Count() })
      };

      return Ok(stats);
    }
  }
}
