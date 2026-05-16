using Microsoft.EntityFrameworkCore;
using FilmLog.Models;

namespace FilmLog.Data
{
  public class FilmLogDbContext : DbContext
  {
    public FilmLogDbContext(DbContextOptions<FilmLogDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // Seed default user data
      modelBuilder.Entity<User>().HasData(
        new User
        {
          Id = 1,
          Username = "admin",
          Email = "admin@example.com",
          Password = "admin123"
        },
        new User
        {
          Id = 2,
          Username = "guest",
          Email = "guest@example.com",
          Password = "guest123"
        }
      );
    }
  }
}
