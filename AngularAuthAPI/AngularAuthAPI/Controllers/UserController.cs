using AngularAuthAPI.Context;
using AngularAuthAPI.Helpers;
using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _authContext; 
        public UserController(AppDbContext appDbContext)
        {
            _authContext = appDbContext;
        }
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody]User userObj)
        {
            if (userObj == null)
                return BadRequest();

            var user = _authContext.Users.FirstOrDefault(x => x.Username == userObj.Username);

            if (user == null)
                return NotFound(new { Message = "User not found" });
            if (!PasswordHasher.VerifyPassword(userObj.Password, user.Password))
                return NotFound(new { Message = "Password does not match" });
            return Ok(new
            {
                Message = "Login Success",
                Token=user.Token
            });
        }
        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody]User userObj)
        {
            if (userObj == null)
                return BadRequest();
            if (await CheckUserExist(userObj.Username))
            {
                return BadRequest(new { Message = "Username Already exist" });
            }
            if (await CheckEmailExist(userObj.Email))
            {
                return BadRequest(new { Message = "Email Already exists" });
            }
            var pass=CheckPasswordStrength(userObj.Password);
            if (!string.IsNullOrEmpty(pass))
            {
                return BadRequest(new { Message = pass });
            }
            
            userObj.Password = PasswordHasher.HashPassword(userObj.Password);
            userObj.Role = "admin";
            userObj.Token = CreateJwt(userObj);
            await _authContext.Users.AddAsync(userObj);
            await _authContext.SaveChangesAsync();
            return Ok(new { 
                Message = "User Registerd"
            });
        }
        private async Task<bool> CheckUserExist(string useraname)
        {
            return _authContext.Users.Any(x => x.Username.Equals(useraname));
        }
        private async Task<bool> CheckEmailExist(string email)
        {
            return _authContext.Users.Any(x => x.Email.Equals(email));
        }
        private string CheckPasswordStrength(string password)
        {
            StringBuilder sb=new StringBuilder();
            if (password.Length < 8)
            {
                sb.Append("Minimum password length should be 8 "+
                    Environment.NewLine);
            }
            if(!(Regex.IsMatch(password,"[a-z]") && Regex.IsMatch(password,"[A-Z]") && Regex.IsMatch(password, "[0-9]"))){
                sb.Append("Password should contain small,Capital and number"+Environment.NewLine);
            }
            if (!Regex.IsMatch(password, "[<,>,@,$,(,)]"))
            {
                sb.Append("Password should contain special character");
            }
            return sb.ToString();
        }
        private string CreateJwt(User user)
        {
            var jwtTokenHnadler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("veryverysecret.....");
            var identity = new ClaimsIdentity(new Claim[] {
                new Claim(ClaimTypes.Role,user.Role),
                new Claim(ClaimTypes.Name,$"{user.FirstName} {user.LastName}")
            });
            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = credentials,
            };
            var token=jwtTokenHnadler.CreateToken(tokenDescriptor);

            return jwtTokenHnadler.WriteToken(token);
        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            return Ok(_authContext.Users.ToList());
        }
    }
}
