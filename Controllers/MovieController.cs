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

    public MoviesController(IOmdbService omdbService, MovieMappingService mapper, IWatchlistRepo watchlistRepo)
    {
      _omdbService = omdbService;
      _mapper = mapper;
      _watchlistRepo = watchlistRepo;
    }

    [HttpGet("search")]
    public async Task<ActionResult<OmdbSearchResponse>> Search([FromQuery] string title, [FromQuery] int page = 1)
    {
      if (string.IsNullOrWhiteSpace(title))
        return BadRequest("Title is required");

      var result = await _omdbService.SearchMoviesAsync(title, page);

      if (result?.Response == "False")
        return NotFound(result.Error ?? "No movies found");

      return Ok(result);
    }

    [HttpGet("{imdbId}")]
    public async Task<ActionResult<OmdbMovieDetail>> GetDetails(string imdbId)
    {
      var result = await _omdbService.GetMovieDetailsAsync(imdbId);

      if (result?.Response == "False")
        return NotFound(result.Error ?? "Movie not found");

      return Ok(result);
    }

    [HttpPost("watchlist/{imdbId}")]
    public async Task<IActionResult> AddToWatchlist(string imdbId)
    {
      var userId = GetCurrentUserId();

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
      return Ok(new { message = "Movie removed from watchlist" });
    }

    private int GetCurrentUserId()
    {
      var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
      return int.Parse(userIdClaim?.Value ?? "0");
    }
  }
}
