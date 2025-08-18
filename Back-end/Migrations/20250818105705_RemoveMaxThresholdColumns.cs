using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitness_Tracker.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMaxThresholdColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasMaxThreshold",
                table: "UserNutrientTargets");

            migrationBuilder.DropColumn(
                name: "MaxThreshold",
                table: "UserNutrientTargets");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasMaxThreshold",
                table: "UserNutrientTargets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<double>(
                name: "MaxThreshold",
                table: "UserNutrientTargets",
                type: "float",
                nullable: true);
        }
    }
}
