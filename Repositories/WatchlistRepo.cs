using FilmLog.Models;
using FilmLog.Data;
using Microsoft.EntityFrameworkCore;

namespace FilmLog.Repositories
{
  public class WatchlistRepo : IWatchlistRepo
  {

    private readonly FilmLogDbContext _context;

    public WatchlistRepo(FilmLogDbContext context)
    {
      _context = context;
    }

    public async Task<List<WatchlistItem>> GetAllAsync()
    {
      return await _context.WatchlistItems
          .Include(w => w.User)
          .ToListAsync();
    }

    public async Task<WatchlistItem?> GetByIdAsync(int id)
    {
      return await _context.WatchlistItems
          .Include(w => w.User)
          .FirstOrDefaultAsync(w => w.Id == id);
    }

    // Get watchlist for specific user
    public async Task<List<WatchlistItem>> GetByUserIdAsync(int userId)
    {
      return await _context.WatchlistItems
          .Where(w => w.UserId == userId)
          .OrderByDescending(w => w.AddedAt)
          .ToListAsync();
    }

    // Return added entity
    public async Task<WatchlistItem> AddAsync(WatchlistItem watchlistItem)
    {
      _context.WatchlistItems.Add(watchlistItem);
      await _context.SaveChangesAsync();
      return watchlistItem;
    }

    // Return updated entity
    public async Task<WatchlistItem> UpdateAsync(WatchlistItem watchlistItem)
    {
      _context.WatchlistItems.Update(watchlistItem);
      await _context.SaveChangesAsync();
      return watchlistItem;
    }

    // Fix: Return Task, not Task<Watchlist>
    public async Task DeleteAsync(int id)
    {
      var watchlistItem = await _context.WatchlistItems.FindAsync(id);
      if (watchlistItem != null)
      {
        _context.WatchlistItems.Remove(watchlistItem);
        await _context.SaveChangesAsync();
      }
    }

    // In ExistsAsync method, change ImdbId to ImdbID
    public async Task<bool> ExistsAsync(int userId, string imdbId)
    {
      return await _context.WatchlistItems
          .AnyAsync(w => w.UserId == userId && w.ImdbID == imdbId);  // Fixed
    }
  }
}
