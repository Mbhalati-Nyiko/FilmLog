using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FilmLog.Migrations
{
    /// <inheritdoc />
    public partial class FixStaticSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "PasswordHash", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 5, 16, 17, 16, 25, 223, DateTimeKind.Utc).AddTicks(5191), "admin@example.com", "$2a$11$0.4rgFTt.Y2b.p8CaXJ18uyP54HDo/XqaD/RovEofRsdS552uB3jC", "admin" },
                    { 2, new DateTime(2026, 5, 16, 17, 16, 25, 223, DateTimeKind.Utc).AddTicks(5752), "guest@example.com", "$2a$11$7PzWYCUbecXgRKXqep/DdOzW.KWYEU1/tVMzv.KP5BdZccV/qNjFm", "guest" }
                });
        }
    }
}
