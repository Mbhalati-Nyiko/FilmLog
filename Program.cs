using FilmLog.Data;
using FilmLog.Models;
using FilmLog.Repositories;
using FilmLog.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

var testKey = builder.Configuration["OmdbApi:Key"];
Console.WriteLine($"OMDb API Key loaded: {(string.IsNullOrEmpty(testKey) ? "NOT FOUND" : "Found")}");

builder.Configuration.AddEnvironmentVariables();

// Add authentication
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured"));
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

// Configure HttpClient for OMDb with timeout and retry
builder.Services.AddHttpClient<IOmdbService, OmdbService>(client =>
{
  client.Timeout = TimeSpan.FromSeconds(30);
  client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// Add CORS for frontend
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy.WithOrigins("http://localhost:8100", "http://localhost:8101", "http://localhost:4200")
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials();
  });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors("AllowFrontend");

// Configure pipeline
if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
  app.MapScalarApiReference(options =>
  {
    options.WithPreferredScheme("http"); // Force HTTP for development
  });
}

// Comment out or conditionally use HTTPS
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
