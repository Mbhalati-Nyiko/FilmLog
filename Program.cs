using FilmLog.Data;
using FilmLog.Models;
using FilmLog.Repositories;
using FilmLog.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add authentication
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"]);
builder.Services.AddAuthentication(options =>
{
  options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
  options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
  options.RequireHttpsMetadata = false;
  options.SaveToken = true;
  options.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(key),
    ValidateIssuer = true,
    ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
    ValidateAudience = true,
    ValidAudience = builder.Configuration["JwtSettings:Audience"],
    ValidateLifetime = true,
    ClockSkew = TimeSpan.Zero
  };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

// Add services to the container
builder.Services.AddDbContext<FilmLogDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repositories
builder.Services.AddScoped<IUserRepo, UserRepo>();
builder.Services.AddScoped<IWatchedRepo, WatchedRepo>();
builder.Services.AddScoped<IWatchlistRepo, WatchlistRepo>();

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IOmdbService, OmdbService>();
builder.Services.AddScoped<MovieMappingService>();

// Add HttpClient for OMDb API
builder.Services.AddHttpClient<IOmdbService, OmdbService>();

// Add CORS for frontend
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials();
  });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
  var context = scope.ServiceProvider.GetRequiredService<FilmLogDbContext>();

  if (!context.Users.Any())
  {
    var hashedAdmin = BCrypt.Net.BCrypt.HashPassword("admin123");
    var hashedGuest = BCrypt.Net.BCrypt.HashPassword("guest123");

    context.Users.AddRange(
        new User
        {
          Username = "admin",
          Email = "admin@example.com",
          PasswordHash = hashedAdmin,
          CreatedAt = DateTime.UtcNow
        },
        new User
        {
          Username = "guest",
          Email = "guest@example.com",
          PasswordHash = hashedGuest,
          CreatedAt = DateTime.UtcNow
        }
    );
    await context.SaveChangesAsync();
  }
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ensure database is created and migrations applied
using (var scope = app.Services.CreateScope())
{
  var dbContext = scope.ServiceProvider.GetRequiredService<FilmLogDbContext>();
  dbContext.Database.EnsureCreated();
}

app.Run();
