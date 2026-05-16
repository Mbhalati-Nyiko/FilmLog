using Microsoft.AspNetCore.Mvc;
using FilmLog.Models;
using FilmLog.Repositories;

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
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] User user)
    {
      user.Id = id;
      var updatedUser = await _userRepo.UpdateUserAsync(user);
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
  }
}
