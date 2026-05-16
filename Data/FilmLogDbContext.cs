using FilmLog.Models;
using Microsoft.EntityFrameworkCore;

namespace FilmLog.Data
{
  public class FilmLogDbContext : DbContext
  {
    public FilmLogDbContext(DbContextOptions<FilmLogDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<WatchedItem> WatchedItems { get; set; }
    public DbSet<WatchlistItem> WatchlistItems { get; set; }
    public DbSet<MovieItem> Movies { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // Add unique constraint on username
      modelBuilder.Entity<User>()
          .HasIndex(u => u.Username)
          .IsUnique();

      // Hash passwords for seed data
      var hashedAdmin = BCrypt.Net.BCrypt.HashPassword("admin123");
      var hashedGuest = BCrypt.Net.BCrypt.HashPassword("guest123");

      // Seed default user data
      // modelBuilder.Entity<User>().HasData(
      //   new User
      //   {
      //     Id = 1,
      //     Username = "admin",
      //     Email = "admin@example.com",
      //     PasswordHash = hashedAdmin,
      //     CreatedAt = DateTime.UtcNow
      //   },
      //   new User
      //   {
      //     Id = 2,
      //     Username = "guest",
      //     Email = "guest@example.com",
      //     PasswordHash = hashedGuest,
      //     CreatedAt = DateTime.UtcNow
      //   }
      // );

      // Prevent duplicate watchlist entries for same user/movie
      modelBuilder.Entity<WatchlistItem>()
          .HasIndex(w => new { w.UserId, w.ImdbID })
          .IsUnique();

      // Prevent duplicate watched entries for same user/movie
      modelBuilder.Entity<WatchedItem>()
          .HasIndex(w => new { w.UserId, w.ImdbID })
          .IsUnique();
    }
  }
}
