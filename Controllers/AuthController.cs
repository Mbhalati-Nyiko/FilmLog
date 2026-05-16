using FilmLog.Models;
using FilmLog.Services;
using FilmLog.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FilmLog.Controllers
{
  // Controllers/AuthController.cs
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : ControllerBase
  {
    private readonly IUserRepo _userRepository;
    private readonly IAuthService _authService;

    public AuthController(IUserRepo userRepository, IAuthService authService)
    {
      _userRepository = userRepository;
      _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
      // Check if user exists
      var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
      if (existingUser != null)
        return BadRequest("Username already exists");

      var user = new User
      {
        Username = request.Username,
        Email = request.Email,
        PasswordHash = _authService.HashPassword(request.Password),
        CreatedAt = DateTime.UtcNow
      };

      var created = await _userRepository.CreateAsync(user);
      var token = _authService.GenerateJwtToken(created);

      return Ok(new AuthResponse { Token = token, UserId = created.Id, Username = created.Username });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
      var user = await _userRepository.GetByUsernameAsync(request.Username);
      if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
        return Unauthorized("Invalid username or password");

      var token = _authService.GenerateJwtToken(user);
      return Ok(new AuthResponse { Token = token, UserId = user.Id, Username = user.Username });
    }
  }
}
