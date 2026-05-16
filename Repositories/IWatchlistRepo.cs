using FilmLog.Models;

namespace FilmLog.Repositories
{
  public interface IWatchlistRepo
  {

    Task<List<WatchlistItem>> GetAllAsync();
    Task<WatchlistItem?> GetByIdAsync(int id);
    Task<List<WatchlistItem>> GetByUserIdAsync(int userId);  // Add this
    Task<WatchlistItem> AddAsync(WatchlistItem watchlistItem);  // Fix return type
    Task<WatchlistItem> UpdateAsync(WatchlistItem watchlistItem);  // Fix return type
    Task DeleteAsync(int id);  // Fix: return Task, not Task<Watchlist>
    Task<bool> ExistsAsync(int userId, string imdbId);  // Check for duplicates

  }
}
