using FilmLog.Models;
using FilmLog.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FilmLog.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class UserController : ControllerBase
  {
    private readonly IUserRepo _userRepo;

    public UserController(IUserRepo userRepo)
    {
      _userRepo = userRepo;
    }

    // GET: api/user
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
      var users = await _userRepo.GetAllUsersAsync();
      return Ok(users);
    }

    // GET: api/user/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
      var user = await _userRepo.GetByIdAsync(id);
      if (user == null)
      {
        return NotFound();
      }
      return Ok(user);
    }

    // POST: api/user
    [HttpPost]
    public async Task<IActionResult> AddUser([FromBody] User user)
    {
      var addedUser = await _userRepo.CreateAsync(user);
      return CreatedAtAction(nameof(GetUserById), new { id = addedUser.Id }, addedUser);
    }

    // PUT: api/user/{id}
    // PUT: api/user/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto userUpdate)
    {
      // Check if IDs match
      if (id != userUpdate.Id)
        return BadRequest("ID mismatch");

      // Get existing user
      var existingUser = await _userRepo.GetByIdAsync(id);
      if (existingUser == null)
        return NotFound($"User with ID {id} not found");

      // Update only allowed fields
      existingUser.Username = userUpdate.Username;
      existingUser.Email = userUpdate.Email;

      // Note: Password and CreatedAt should not be updated here

      var updatedUser = await _userRepo.UpdateUserAsync(existingUser);

      // Return 200 OK with the updated user (not NoContent)
      return Ok(updatedUser);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
      var result = await _userRepo.DeleteUserAsync(id);
      if (!result)
      {
        return NotFound();
      }
      return NoContent();
    }

    [HttpPut("{id}/password")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] PasswordChangeDto passwordChange)
    {
      var user = await _userRepo.GetByIdAsync(id);
      if (user == null)
        return NotFound($"User with ID {id} not found");

      // Verify old password
      if (!BCrypt.Net.BCrypt.Verify(passwordChange.CurrentPassword, user.PasswordHash))
        return BadRequest("Current password is incorrect");

      // Hash and update new password
      user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordChange.NewPassword);

      await _userRepo.UpdateUserAsync(user);
      return Ok(new { message = "Password updated successfully" });
    }

    public class PasswordChangeDto
    {
      public string CurrentPassword { get; set; } = string.Empty;
      public string NewPassword { get; set; } = string.Empty;
    }
  }
}
