using FilmLog.Data;
using FilmLog.Models;
using Microsoft.EntityFrameworkCore;

namespace FilmLog.Repositories
{
  public class WatchedRepo : IWatchedRepo
  {
    private readonly FilmLogDbContext _context;

    public WatchedRepo(FilmLogDbContext context)
    {
      _context = context;
    }

    public async Task<List<WatchedItem>> GetAllAsync()
    {
      return await _context.WatchedItems
          .Include(w => w.User)
          .ToListAsync();
    }

    public async Task<WatchedItem?> GetByIdAsync(int id)
    {
      return await _context.WatchedItems
          .Include(w => w.User)
          .FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task<List<WatchedItem>> GetByUserIdAsync(int userId)
    {
      return await _context.WatchedItems
          .Where(w => w.UserId == userId)
          .OrderByDescending(w => w.WatchedAt)
          .ToListAsync();
    }

    public async Task<WatchedItem> AddAsync(WatchedItem watched)
    {
      _context.WatchedItems.Add(watched);
      await _context.SaveChangesAsync();
      return watched;
    }

    public async Task<WatchedItem> UpdateAsync(WatchedItem watched)
    {
      _context.WatchedItems.Update(watched);
      await _context.SaveChangesAsync();
      return watched;
    }

    public async Task DeleteAsync(int id)
    {
      var watched = await _context.WatchedItems.FindAsync(id);
      if (watched != null)
      {
        _context.WatchedItems.Remove(watched);
        await _context.SaveChangesAsync();
      }
    }

    public async Task<bool> ExistsAsync(int userId, string imdbId)
    {
      return await _context.WatchedItems
          .AnyAsync(w => w.UserId == userId && w.ImdbID == imdbId);  // Fixed property name
    }
  }
}
