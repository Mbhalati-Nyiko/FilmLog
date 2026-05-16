using FilmLog.Models;

namespace FilmLog.Repositories
{
  public interface IWatchedRepo
  {
    Task<List<WatchedItem>> GetAllAsync();
    Task<WatchedItem?> GetByIdAsync(int id);
    Task<List<WatchedItem>> GetByUserIdAsync(int userId);
    Task<WatchedItem> AddAsync(WatchedItem watched);
    Task<WatchedItem> UpdateAsync(WatchedItem watched);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int userId, string imdbId);
  }
}
