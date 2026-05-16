using FilmLog.Models;

namespace FilmLog.Services
{
  public interface IOmdbService
  {
    Task<OmdbSearchResponse> SearchMoviesAsync(string title, int page = 1);
    Task<OmdbMovieDetail> GetMovieDetailsAsync(string imdbId);
  }
}
