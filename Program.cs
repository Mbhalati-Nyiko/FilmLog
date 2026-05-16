using Microsoft.EntityFrameworkCore;
using FilmLog.Data;
using FilmLog.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add services to the container.
// Register EF Core with SQL Server 
builder.Services.AddDbContext<FilmLogDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register the repository (Scoped = one instance per HTTP request) 
builder.Services.AddScoped<IUserRepo, UserRepo>();

//
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


app.UseRouting();
app.UseHttpsRedirection();
  app.UseSwagger();
  app.UseSwaggerUI();


app.MapControllers();
app.UseAuthorization();

app.Run();
