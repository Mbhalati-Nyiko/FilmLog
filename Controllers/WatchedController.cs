using FilmLog.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FilmLog.Models;

namespace FilmLog.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]  // Add authentication
  public class WatchedController : ControllerBase
  {
    private readonly IWatchedRepo _repository;

    public WatchedController(IWatchedRepo repository)
    {
      _repository = repository;
    }

    // Add this method to WatchedController.cs if not present
    [HttpGet("by-imdb/{imdbId}")]
    public async Task<ActionResult<WatchedItem>> GetByImdbId(string imdbId)
    {
      var userId = GetCurrentUserId();
      var watchedItems = await _repository.GetByUserIdAsync(userId);
      var item = watchedItems.FirstOrDefault(w => w.ImdbID == imdbId);

      if (item == null) return NotFound();
      return Ok(item);
    }

    [HttpGet]
    public async Task<ActionResult<List<WatchedItem>>> GetAll()
    {
      var userId = GetCurrentUserId();  // Get from JWT
      var watchedMovies = await _repository.GetByUserIdAsync(userId);
      return Ok(watchedMovies);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WatchedItem>> GetById(int id)
    {
      var watched = await _repository.GetByIdAsync(id);
      if (watched == null) return NotFound();

      // Verify ownership
      var userId = GetCurrentUserId();
      if (watched.UserId != userId) return Unauthorized();

      return Ok(watched);
    }

    [HttpPost]
    public async Task<ActionResult<WatchedItem>> Create(WatchedItem watched)
    {
      var userId = GetCurrentUserId();
      watched.UserId = userId;  // Set user ID

      // Check for duplicates
      if (await _repository.ExistsAsync(userId, watched.ImdbID))
        return BadRequest("Movie already in watched list");

      var created = await _repository.AddAsync(watched);
      return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, WatchedItem watched)
    {
      if (id != watched.Id) return BadRequest();

      var userId = GetCurrentUserId();
      if (watched.UserId != userId) return Unauthorized();

      await _repository.UpdateAsync(watched);
      return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
      var watched = await _repository.GetByIdAsync(id);
      if (watched == null) return NotFound();

      var userId = GetCurrentUserId();
      if (watched.UserId != userId) return Unauthorized();

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
