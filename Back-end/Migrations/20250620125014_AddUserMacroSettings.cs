using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitness_Tracker.Migrations
{
    /// <inheritdoc />
    public partial class AddUserMacroSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CarbsKcal",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CarbsRatio",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FatKcal",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FatRatio",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MacroMode",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProteinKcal",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProteinRatio",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CarbsKcal",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CarbsRatio",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "FatKcal",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "FatRatio",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "MacroMode",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ProteinKcal",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ProteinRatio",
                table: "AspNetUsers");
        }
    }
}
