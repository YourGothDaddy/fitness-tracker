using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitness_Tracker.Migrations
{
    /// <inheritdoc />
    public partial class AddSubTitleToConsumableItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomWorkouts_ActivityCategories_ActivityCategoryId",
                table: "CustomWorkouts");

            migrationBuilder.AddColumn<string>(
                name: "SubTitle",
                table: "ConsumableItems",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomWorkouts_ActivityCategories_ActivityCategoryId",
                table: "CustomWorkouts",
                column: "ActivityCategoryId",
                principalTable: "ActivityCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomWorkouts_ActivityCategories_ActivityCategoryId",
                table: "CustomWorkouts");

            migrationBuilder.DropColumn(
                name: "SubTitle",
                table: "ConsumableItems");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomWorkouts_ActivityCategories_ActivityCategoryId",
                table: "CustomWorkouts",
                column: "ActivityCategoryId",
                principalTable: "ActivityCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
