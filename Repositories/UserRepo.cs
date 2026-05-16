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

    public async Task<User> UpdateUserAsync(User user)
    {
      _context.Users.Update(user);
      await _context.SaveChangesAsync();
      return user;
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
