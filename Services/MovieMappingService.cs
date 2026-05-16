using FilmLog.Models;

namespace FilmLog.Services
{
  // In your service, map OMDb response to your Movie model
  public class MovieMappingService
  {
    public MovieItem MapOmdbDetailToMovie(OmdbMovieDetail detail)
    {
      return new MovieItem
      {
        // Don't set Id - let database auto-generate it
        Title = detail.Title,
        Poster = detail.Poster,
        Year = detail.Year,
        Genre = detail.Genre,
        Cast = detail.Actors  // Map Actors to Cast
      };
    }

    public MovieItem MapOmdbSearchToMovie(OmdbSearchItem searchItem)
    {
      return new MovieItem
      {
        Title = searchItem.Title,
        Poster = searchItem.Poster,
        Year = searchItem.Year,
        Genre = null,  // Search results don't include genre
        Cast = null     // Search results don't include cast
      };
    }
  }
}
