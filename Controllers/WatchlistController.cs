using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileSystemGlobbing;
using System.Security.Claims;
using FilmLog.Models;
using FilmLog.Repositories;

namespace FilmLog.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]  // Add authentication
  public class WatchlistController : ControllerBase
  {

    private readonly IWatchlistRepo _repository;

    public WatchlistController(IWatchlistRepo repository)
    {
      _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<List<WatchlistItem>>> GetAll()
    {
      var userId = GetCurrentUserId();  // Get from JWT
      var watchedMovies = await _repository.GetByUserIdAsync(userId);
      return Ok(watchedMovies);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WatchlistItem>> GetById(int id)
    {
      var watched = await _repository.GetByIdAsync(id);
      if (watched == null) return NotFound();

      // Verify ownership
      var userId = GetCurrentUserId();
      if (watched.UserId != userId) return Unauthorized();

      return Ok(watched);
    }

    [HttpPost]
    public async Task<ActionResult<WatchlistItem>> Create(WatchlistItem watchlistItem)
    {
      var userId = GetCurrentUserId();
      watchlistItem.UserId = userId;  // Set user ID

      // Check for duplicates
      if (await _repository.ExistsAsync(userId, watchlistItem.ImdbID))
        return BadRequest("Movie already in watchlist");

      var created = await _repository.AddAsync(watchlistItem);
      return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, WatchlistItem watchlistItem)
    {
      if (id != watchlistItem.Id) return BadRequest();

      var userId = GetCurrentUserId();
      if (watchlistItem.UserId != userId) return Unauthorized();

      await _repository.UpdateAsync(watchlistItem);
      return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
      var watchlistItem = await _repository.GetByIdAsync(id);
      if (watchlistItem == null) return NotFound();

      var userId = GetCurrentUserId();
      if (watchlistItem.UserId != userId) return Unauthorized();

      await _repository.DeleteAsync(id);
      return NoContent();
    }

    private int GetCurrentUserId()
    {
      var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
      return int.Parse(userIdClaim.Value);
    }
  }
 }
