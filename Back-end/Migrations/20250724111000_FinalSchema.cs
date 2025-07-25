using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitness_Tracker.Migrations
{
    /// <inheritdoc />
    public partial class FinalSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomWorkouts_ActivityTypes_ActivityTypeId",
                table: "CustomWorkouts");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomWorkouts_ActivityTypes_ActivityTypeId",
                table: "CustomWorkouts",
                column: "ActivityTypeId",
                principalTable: "ActivityTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomWorkouts_ActivityTypes_ActivityTypeId",
                table: "CustomWorkouts");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomWorkouts_ActivityTypes_ActivityTypeId",
                table: "CustomWorkouts",
                column: "ActivityTypeId",
                principalTable: "ActivityTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
