using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitness_Tracker.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ActivityExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActivityTypeId = table.Column<int>(type: "int", nullable: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityExercises_ActivityTypes_ActivityTypeId",
                        column: x => x.ActivityTypeId,
                        principalTable: "ActivityTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExerciseMetProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ActivityExerciseId = table.Column<int>(type: "int", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Met = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseMetProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExerciseMetProfiles_ActivityExercises_ActivityExerciseId",
                        column: x => x.ActivityExerciseId,
                        principalTable: "ActivityExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityExercises_ActivityTypeId",
                table: "ActivityExercises",
                column: "ActivityTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseMetProfiles_ActivityExerciseId",
                table: "ExerciseMetProfiles",
                column: "ActivityExerciseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExerciseMetProfiles");

            migrationBuilder.DropTable(
                name: "ActivityExercises");
        }
    }
}
