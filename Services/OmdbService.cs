using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace FilmLog.Services
{
  public class OmdbService : IOmdbService
  {
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl;
    private readonly ILogger<OmdbService> _logger;

    public OmdbService(HttpClient httpClient, IConfiguration configuration, ILogger<OmdbService> logger)
    {
      _httpClient = httpClient;
      _logger = logger;

      // Read from correct configuration section
      _apiKey = configuration["OmdbApi:Key"] ??
                configuration["OmdbApiKey"] ??
                throw new InvalidOperationException("OMDb API key not configured in appsettings.json");

      _baseUrl = configuration["OmdbApi:BaseUrl"] ?? "http://www.omdbapi.com/";

      _logger.LogInformation("OMDb Service initialized with API Key: {KeyPrefix}...", _apiKey?.Substring(0, 4));
    }

    public async Task<OmdbSearchResponse?> SearchMoviesAsync(string title, int page = 1)
    {
      try
      {
        var url = $"{_baseUrl}?apikey={_apiKey}&s={Uri.EscapeDataString(title)}&page={page}&type=movie";
        _logger.LogInformation("Calling OMDb API: {Url}", url.Replace(_apiKey, "***HIDDEN***"));

        var response = await _httpClient.GetAsync(url);
        var json = await response.Content.ReadAsStringAsync();

        _logger.LogInformation("OMDb Response Status: {StatusCode}, Content: {Content}",
            response.StatusCode, json.Length > 200 ? json.Substring(0, 200) + "..." : json);

        if (!response.IsSuccessStatusCode)
        {
          _logger.LogError("OMDb API returned error: {StatusCode}, Response: {Response}",
              response.StatusCode, json);
          return new OmdbSearchResponse
          {
            Response = "False",
            Error = $"API returned {response.StatusCode}"
          };
        }

        var result = JsonSerializer.Deserialize<OmdbSearchResponse>(json, new JsonSerializerOptions
        {
          PropertyNameCaseInsensitive = true
        });

        if (result?.Response == "False")
        {
          _logger.LogWarning("OMDb search failed: {Error}", result.Error);
        }

        return result;
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error searching movies with title: {Title}", title);
        return new OmdbSearchResponse
        {
          Response = "False",
          Error = "Failed to search movies. Please try again later."
        };
      }
    }

    public async Task<OmdbMovieDetail?> GetMovieDetailsAsync(string imdbId)
    {
      try
      {
        var url = $"{_baseUrl}?apikey={_apiKey}&i={imdbId}&plot=full";
        _logger.LogInformation("Getting movie details for ID: {ImdbId}", imdbId);

        var response = await _httpClient.GetAsync(url);
        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
          _logger.LogError("OMDb API returned error: {StatusCode}", response.StatusCode);
          return new OmdbMovieDetail { Response = "False", Error = $"API returned {response.StatusCode}" };
        }

        var result = JsonSerializer.Deserialize<OmdbMovieDetail>(json, new JsonSerializerOptions
        {
          PropertyNameCaseInsensitive = true
        });

        return result;
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error getting movie details for ID: {ImdbId}", imdbId);
        return new OmdbMovieDetail { Response = "False", Error = "Failed to get movie details" };
      }
    }
  }
}
