using FilmLog.Models;

namespace FilmLog.Repositories
{
  public interface IUserRepo
  {
    // Read operations
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByUsernameAsync(string username);
    Task<IEnumerable<User>> GetAllUsersAsync();

    // Create, Update, Delete
    Task<User> CreateAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task<bool> DeleteUserAsync(int id);
  }
}
