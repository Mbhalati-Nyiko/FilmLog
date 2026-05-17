using FilmLog.Models;
using FilmLog.Services;
using FilmLog.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FilmLog.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class MoviesController : ControllerBase
  {
    private readonly IOmdbService _omdbService;
    private readonly MovieMappingService _mapper;
    private readonly IWatchlistRepo _watchlistRepo;
    private readonly ILogger<MoviesController> _logger;

    public MoviesController(
      IOmdbService omdbService,
      MovieMappingService mapper,
      IWatchlistRepo watchlistRepo,
      ILogger<MoviesController> logger)
    {
      _omdbService = omdbService;
      _mapper = mapper;
      _watchlistRepo = watchlistRepo;
      _logger = logger;
    }

    [HttpGet("search")]
    public async Task<ActionResult<OmdbSearchResponse>> Search([FromQuery] string title, [FromQuery] int page = 1)
    {
      if (string.IsNullOrWhiteSpace(title))
        return BadRequest("Title is required");

      _logger.LogInformation("Searching for movies with title: {Title}, page: {Page}", title, page);

      var result = await _omdbService.SearchMoviesAsync(title, page);

      if (result == null)
        return StatusCode(500, "Failed to search movies. Please try again later.");

      if (result.Response == "False")
      {
        _logger.LogWarning("OMDb search returned error: {Error}", result.Error);
        return NotFound(result.Error ?? "No movies found");
      }

      return Ok(result);
    }

    [HttpGet("{imdbId}")]
    public async Task<ActionResult<OmdbMovieDetail>> GetDetails(string imdbId)
    {
      _logger.LogInformation("Getting details for movie ID: {ImdbId}", imdbId);

      var result = await _omdbService.GetMovieDetailsAsync(imdbId);

      if (result == null)
        return StatusCode(500, "Failed to get movie details. Please try again later.");

      if (result.Response == "False")
      {
        _logger.LogWarning("OMDb details returned error: {Error}", result.Error);
        return NotFound(result.Error ?? "Movie not found");
      }

      return Ok(result);
    }

    [HttpPost("watchlist/{imdbId}")]
    public async Task<IActionResult> AddToWatchlist(string imdbId)
    {
      var userId = GetCurrentUserId();
      _logger.LogInformation("Adding movie {ImdbId} to watchlist for user {UserId}", imdbId, userId);

      // Check if already in watchlist
      if (await _watchlistRepo.ExistsAsync(userId, imdbId))
        return BadRequest("Movie already in watchlist");

      // Get movie details from OMDb
      var omdbMovie = await _omdbService.GetMovieDetailsAsync(imdbId);

      if (omdbMovie?.Response == "False")
        return NotFound("Movie not found");

      // Create watchlist item
      var watchlistItem = new WatchlistItem
      {
        UserId = userId,
        Title = omdbMovie.Title,
        Poster = omdbMovie.Poster,
        Year = omdbMovie.Year,
        Genre = omdbMovie.Genre,
        Cast = omdbMovie.Actors,
        ImdbID = imdbId,
        AddedAt = DateTime.UtcNow
      };

      var result = await _watchlistRepo.AddAsync(watchlistItem);
      return Ok(new { id = result.Id, message = "Movie added to watchlist" });
    }

    [HttpDelete("watchlist/{id}")]
    public async Task<IActionResult> RemoveFromWatchlist(int id)
    {
      var userId = GetCurrentUserId();
      var item = await _watchlistRepo.GetByIdAsync(id);

      if (item == null)
        return NotFound("Watchlist item not found");

      if (item.UserId != userId)
        return Unauthorized();

      await _watchlistRepo.DeleteAsync(id);
      _logger.LogInformation("Removed watchlist item {Id} for user {UserId}", id, userId);
      return Ok(new { message = "Movie removed from watchlist" });
    }

    private int GetCurrentUserId()
    {
      var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
      return int.Parse(userIdClaim?.Value ?? "0");
    }

    [HttpGet("test-details")]
    [AllowAnonymous]
    public async Task<IActionResult> TestDetails([FromQuery] string imdbId = "tt1375666")  // Inception
    {
      var result = await _omdbService.GetMovieDetailsAsync(imdbId);
      return Ok(new
      {
        hasGenre = !string.IsNullOrEmpty(result?.Genre),
        genre = result?.Genre,
        hasActors = !string.IsNullOrEmpty(result?.Actors),
        actors = result?.Actors,
        fullResponse = result
      });
    }

    // Add to MovieController.cs for testing
    //[HttpGet("test-omdb")]
    //[AllowAnonymous] // Remove authorization for testing
    //public async Task<IActionResult> TestOmdbConnection()
    //{
    //  try
    //  {
    //    var result = await _omdbService.SearchMoviesAsync("Inception", 1);
    //    return Ok(new
    //    {
    //      success = result?.Response == "True",
    //      response = result,
    //      apiKeyConfigured = !string.IsNullOrEmpty(_apiKey) // You'd need to expose this
    //    });
    //  }
    //  catch (Exception ex)
    //  {
    //    return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
    //  }
    //}
  }
}
