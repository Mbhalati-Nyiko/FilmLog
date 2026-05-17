using Microsoft.EntityFrameworkCore;
using FilmLog.Models;
using FilmLog.Data;

namespace FilmLog.Repositories
{
  public class UserRepo : IUserRepo
  {
    private readonly FilmLogDbContext _context;

    public UserRepo(FilmLogDbContext context)
    {
      _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
      return await _context.Users.FindAsync(id);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
      return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
      return await _context.Users.ToListAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
      _context.Users.Add(user);
      await _context.SaveChangesAsync();
      return user;
    }

    public async Task<User?> UpdateUserAsync(User user)
    {
      // Ensure the entity exists and is tracked
      var existingUser = await _context.Users.FindAsync(user.Id);
      if (existingUser == null)
        return null;

      // Update only allowed fields
      existingUser.Username = user.Username;
      existingUser.Email = user.Email;
      

      // Only update password if a new one is provided
      if (!string.IsNullOrWhiteSpace(user.PasswordHash))
        existingUser.PasswordHash = user.PasswordHash;

      await _context.SaveChangesAsync();
      return existingUser;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
      var user = await _context.Users.FindAsync(id);
      if (user == null) return false;

      _context.Users.Remove(user);
      await _context.SaveChangesAsync();
      return true;
    }
  }
}
