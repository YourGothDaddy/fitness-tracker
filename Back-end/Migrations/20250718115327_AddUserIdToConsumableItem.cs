using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitness_Tracker.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToConsumableItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "ConsumableItems",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsumableItems_UserId",
                table: "ConsumableItems",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ConsumableItems_AspNetUsers_UserId",
                table: "ConsumableItems",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConsumableItems_AspNetUsers_UserId",
                table: "ConsumableItems");

            migrationBuilder.DropIndex(
                name: "IX_ConsumableItems_UserId",
                table: "ConsumableItems");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ConsumableItems");
        }
    }
}
