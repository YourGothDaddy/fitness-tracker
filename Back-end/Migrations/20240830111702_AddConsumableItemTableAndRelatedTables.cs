using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fitness_Tracker.Migrations
{
    /// <inheritdoc />
    public partial class AddConsumableItemTableAndRelatedTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NutritionalInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConsumableItemId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionalInfos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AminoAcidInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NutritionalInfoId = table.Column<int>(type: "int", nullable: false),
                    Alanine = table.Column<double>(type: "float", nullable: false),
                    Arginine = table.Column<double>(type: "float", nullable: false),
                    AsparticAcid = table.Column<double>(type: "float", nullable: false),
                    Valine = table.Column<double>(type: "float", nullable: false),
                    Glycine = table.Column<double>(type: "float", nullable: false),
                    Glutamine = table.Column<double>(type: "float", nullable: false),
                    Isoleucine = table.Column<double>(type: "float", nullable: false),
                    Leucine = table.Column<double>(type: "float", nullable: false),
                    Lysine = table.Column<double>(type: "float", nullable: false),
                    Methionine = table.Column<double>(type: "float", nullable: false),
                    Proline = table.Column<double>(type: "float", nullable: false),
                    Serine = table.Column<double>(type: "float", nullable: false),
                    Tyrosine = table.Column<double>(type: "float", nullable: false),
                    Threonine = table.Column<double>(type: "float", nullable: false),
                    Tryptophan = table.Column<double>(type: "float", nullable: false),
                    Phenylalanine = table.Column<double>(type: "float", nullable: false),
                    Hydroxyproline = table.Column<double>(type: "float", nullable: false),
                    Histidine = table.Column<double>(type: "float", nullable: false),
                    Cystine = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AminoAcidInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AminoAcidInfos_NutritionalInfos_NutritionalInfoId",
                        column: x => x.NutritionalInfoId,
                        principalTable: "NutritionalInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CarbohydrateInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NutritionalInfoId = table.Column<int>(type: "int", nullable: false),
                    Fibers = table.Column<double>(type: "float", nullable: false),
                    Starch = table.Column<double>(type: "float", nullable: false),
                    Sugars = table.Column<double>(type: "float", nullable: false),
                    Galactose = table.Column<double>(type: "float", nullable: false),
                    Glucose = table.Column<double>(type: "float", nullable: false),
                    Sucrose = table.Column<double>(type: "float", nullable: false),
                    Lactose = table.Column<double>(type: "float", nullable: false),
                    Maltose = table.Column<double>(type: "float", nullable: false),
                    Fructose = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarbohydrateInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CarbohydrateInfos_NutritionalInfos_NutritionalInfoId",
                        column: x => x.NutritionalInfoId,
                        principalTable: "NutritionalInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConsumableItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CaloriesPer100g = table.Column<int>(type: "int", nullable: false),
                    ProteinPer100g = table.Column<double>(type: "float", nullable: false),
                    CarbohydratePer100g = table.Column<double>(type: "float", nullable: false),
                    FatPer100g = table.Column<double>(type: "float", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NutritionalInformationId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumableItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsumableItems_NutritionalInfos_NutritionalInformationId",
                        column: x => x.NutritionalInformationId,
                        principalTable: "NutritionalInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FatInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NutritionalInfoId = table.Column<int>(type: "int", nullable: false),
                    TotalFats = table.Column<double>(type: "float", nullable: false),
                    MonounsaturatedFats = table.Column<double>(type: "float", nullable: false),
                    PolyunsaturatedFats = table.Column<double>(type: "float", nullable: false),
                    SaturatedFats = table.Column<double>(type: "float", nullable: false),
                    TransFats = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FatInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FatInfos_NutritionalInfos_NutritionalInfoId",
                        column: x => x.NutritionalInfoId,
                        principalTable: "NutritionalInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MineralInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NutritionalInfoId = table.Column<int>(type: "int", nullable: false),
                    Iron = table.Column<double>(type: "float", nullable: false),
                    Potassium = table.Column<double>(type: "float", nullable: false),
                    Calcium = table.Column<double>(type: "float", nullable: false),
                    Magnesium = table.Column<double>(type: "float", nullable: false),
                    Manganese = table.Column<double>(type: "float", nullable: false),
                    Copper = table.Column<double>(type: "float", nullable: false),
                    Sodium = table.Column<double>(type: "float", nullable: false),
                    Selenium = table.Column<double>(type: "float", nullable: false),
                    Fluoride = table.Column<double>(type: "float", nullable: false),
                    Phosphorus = table.Column<double>(type: "float", nullable: false),
                    Zinc = table.Column<double>(type: "float", nullable: false),
                    Sterols = table.Column<double>(type: "float", nullable: false),
                    Cholesterol = table.Column<double>(type: "float", nullable: false),
                    Phytosterols = table.Column<double>(type: "float", nullable: false),
                    Stigmasterol = table.Column<double>(type: "float", nullable: false),
                    Campesterol = table.Column<double>(type: "float", nullable: false),
                    BetaSitosterol = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MineralInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MineralInfos_NutritionalInfos_NutritionalInfoId",
                        column: x => x.NutritionalInfoId,
                        principalTable: "NutritionalInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MoreInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NutritionalInfoId = table.Column<int>(type: "int", nullable: false),
                    Alcohol = table.Column<double>(type: "float", nullable: false),
                    Water = table.Column<double>(type: "float", nullable: false),
                    Caffeine = table.Column<double>(type: "float", nullable: false),
                    Theobromine = table.Column<double>(type: "float", nullable: false),
                    Ashes = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MoreInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MoreInfos_NutritionalInfos_NutritionalInfoId",
                        column: x => x.NutritionalInfoId,
                        principalTable: "NutritionalInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VitaminInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NutritionalInfoId = table.Column<int>(type: "int", nullable: false),
                    Betaine = table.Column<double>(type: "float", nullable: false),
                    VitaminA = table.Column<double>(type: "float", nullable: false),
                    VitaminB1 = table.Column<double>(type: "float", nullable: false),
                    VitaminB2 = table.Column<double>(type: "float", nullable: false),
                    VitaminB3 = table.Column<double>(type: "float", nullable: false),
                    VitaminB4 = table.Column<double>(type: "float", nullable: false),
                    VitaminB5 = table.Column<double>(type: "float", nullable: false),
                    VitaminB6 = table.Column<double>(type: "float", nullable: false),
                    VitaminB9 = table.Column<double>(type: "float", nullable: false),
                    VitaminB12 = table.Column<double>(type: "float", nullable: false),
                    VitaminC = table.Column<double>(type: "float", nullable: false),
                    VitaminD = table.Column<double>(type: "float", nullable: false),
                    VitaminE = table.Column<double>(type: "float", nullable: false),
                    VitaminK1 = table.Column<double>(type: "float", nullable: false),
                    VitaminK2 = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VitaminInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VitaminInfos_NutritionalInfos_NutritionalInfoId",
                        column: x => x.NutritionalInfoId,
                        principalTable: "NutritionalInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AminoAcidInfos_NutritionalInfoId",
                table: "AminoAcidInfos",
                column: "NutritionalInfoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CarbohydrateInfos_NutritionalInfoId",
                table: "CarbohydrateInfos",
                column: "NutritionalInfoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsumableItems_NutritionalInformationId",
                table: "ConsumableItems",
                column: "NutritionalInformationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FatInfos_NutritionalInfoId",
                table: "FatInfos",
                column: "NutritionalInfoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MineralInfos_NutritionalInfoId",
                table: "MineralInfos",
                column: "NutritionalInfoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MoreInfos_NutritionalInfoId",
                table: "MoreInfos",
                column: "NutritionalInfoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VitaminInfos_NutritionalInfoId",
                table: "VitaminInfos",
                column: "NutritionalInfoId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AminoAcidInfos");

            migrationBuilder.DropTable(
                name: "CarbohydrateInfos");

            migrationBuilder.DropTable(
                name: "ConsumableItems");

            migrationBuilder.DropTable(
                name: "FatInfos");

            migrationBuilder.DropTable(
                name: "MineralInfos");

            migrationBuilder.DropTable(
                name: "MoreInfos");

            migrationBuilder.DropTable(
                name: "VitaminInfos");

            migrationBuilder.DropTable(
                name: "NutritionalInfos");
        }
    }
}
