using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitness_Tracker.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPublicAndCreatedByUserIdToActivityType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "ActivityTypes",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "ActivityTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_ActivityTypes_CreatedByUserId",
                table: "ActivityTypes",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityTypes_AspNetUsers_CreatedByUserId",
                table: "ActivityTypes",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActivityTypes_AspNetUsers_CreatedByUserId",
                table: "ActivityTypes");

            migrationBuilder.DropIndex(
                name: "IX_ActivityTypes_CreatedByUserId",
                table: "ActivityTypes");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ActivityTypes");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "ActivityTypes");
        }
    }
}
