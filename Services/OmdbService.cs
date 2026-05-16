using FilmLog.Models;

namespace FilmLog.Services
{
  public class OmdbService : IOmdbService
  {
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public OmdbService(HttpClient httpClient, IConfiguration config)
    {
      _httpClient = httpClient;
      _apiKey = config["OmdbApiKey"];
    }

    public async Task<OmdbSearchResponse> SearchMoviesAsync(string title, int page = 1)
    {
      var response = await _httpClient.GetAsync(
          $"http://www.omdbapi.com/?apikey={_apiKey}&s={Uri.EscapeDataString(title)}&page={page}");

      var content = await response.Content.ReadFromJsonAsync<OmdbSearchResponse>();
      return content;
    }

    public async Task<OmdbMovieDetail> GetMovieDetailsAsync(string imdbId)
    {
      var response = await _httpClient.GetAsync(
          $"http://www.omdbapi.com/?apikey={_apiKey}&i={imdbId}&plot=full");

      var content = await response.Content.ReadFromJsonAsync<OmdbMovieDetail>();
      return content;
    }
  }
}
