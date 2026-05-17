using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FilmLog.Migrations
{
    /// <inheritdoc />
    public partial class AddRatingAndRuntimeToWatched : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Rating",
                table: "WatchlistItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Runtime",
                table: "WatchlistItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Runtime",
                table: "WatchedItems",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rating",
                table: "WatchlistItems");

            migrationBuilder.DropColumn(
                name: "Runtime",
                table: "WatchlistItems");

            migrationBuilder.DropColumn(
                name: "Runtime",
                table: "WatchedItems");
        }
    }
}
