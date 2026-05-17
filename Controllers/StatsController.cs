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
    private readonly IWatchedRepo _watchedRepo;

    public StatsController(IWatchedRepo watchedRepo)
    {
      _watchedRepo = watchedRepo;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
      var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
      var watchedMovies = await _watchedRepo.GetByUserIdAsync(userId);

      // 1. Top 6 Genres (Pie Chart Data)
      var topGenres = watchedMovies
          .Where(m => !string.IsNullOrEmpty(m.Genre))
          .SelectMany(m => m.Genre!.Split(','))
          .Select(g => g.Trim())
          .GroupBy(g => g)
          .Select(g => new { Genre = g.Key, Count = g.Count() })
          .OrderByDescending(g => g.Count)
          .Take(6)
          .ToList();

      // 2. Top Rated Movies (Bar Chart)
      var topRatedMovies = watchedMovies
          .Where(m => !string.IsNullOrEmpty(m.Rating) && decimal.TryParse(m.Rating, out _))
          .Select(m => new
          {
            m.Title,
            m.Year,
            Rating = decimal.Parse(m.Rating!),
            m.ImdbID,
            m.Poster
          })
          .OrderByDescending(m => m.Rating)
          .Take(10)
          .ToList();

      // 3. Most Rewatched Shows (Table)
      var mostRewatched = watchedMovies
          .Where(m => m.TimesWatched > 1)
          .OrderByDescending(m => m.TimesWatched)
          .Select(m => new
          {
            m.Title,
            m.Year,
            TimesWatched = m.TimesWatched,
            LastWatched = m.LastWatchedAt.ToString("yyyy-MM-dd"),
            m.Genre,
            m.ImdbID,
            m.Poster
          })
          .Take(20)
          .ToList();

      var stats = new
      {
        TotalMoviesWatched = watchedMovies.Count,
        TopGenres = topGenres,
        TopRatedMovies = topRatedMovies,
        MostRewatched = mostRewatched
      };

      return Ok(stats);
    }
  }
}
