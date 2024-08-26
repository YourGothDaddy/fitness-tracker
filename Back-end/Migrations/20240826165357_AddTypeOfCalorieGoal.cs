using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitness_Tracker.Migrations
{
    /// <inheritdoc />
    public partial class AddTypeOfCalorieGoal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDailyCaloriesGoal",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDailyCaloriesGoal",
                table: "AspNetUsers");
        }
    }
}
