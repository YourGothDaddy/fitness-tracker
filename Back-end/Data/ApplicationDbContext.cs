namespace Fitness_Tracker.Data
{
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Data.Models.Consumables;
    using System.Reflection.Emit;

    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Meal> Meals { get; set; }
        public DbSet<ConsumableItem> ConsumableItems { get; set; }
        public DbSet<Nutrient> Nutrients { get; set; }
        public DbSet<ActivityCategory> ActivityCategories { get; set; }
        public DbSet<ActivityType> ActivityTypes { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<ActivityExercise> ActivityExercises { get; set; }
        public DbSet<ExerciseMetProfile> ExerciseMetProfiles { get; set; }
        public DbSet<WeightRecord> WeightRecords { get; set; }
        public DbSet<CustomWorkout> CustomWorkouts { get; set; }

        public DbSet<ActivityLevel> ActivityLevels { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<UserNutrientTarget> UserNutrientTargets { get; set; }
        public DbSet<UserFavoriteActivityType> UserFavoriteActivityTypes { get; set; }
        public DbSet<UserFavoriteConsumableItem> UserFavoriteConsumableItems { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>()
                .HasMany(u => u.Meals)
                .WithOne(m => m.User)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ActivityType>()
                .HasOne(at => at.ActivityCategory)
                .WithMany(ac => ac.ActivityTypes)
                .HasForeignKey(at => at.ActivityCategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Activity>()
                .HasOne(a => a.ActivityType)
                .WithMany(at => at.Activities)
                .HasForeignKey(a => a.ActivityTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ActivityExercise>()
                .HasOne(ae => ae.ActivityType)
                .WithMany(at => at.ActivityExercises)
                .HasForeignKey(ae => ae.ActivityTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ExerciseMetProfile>()
                .HasOne(emp => emp.ActivityExercise)
                .WithMany(ae => ae.MetProfiles)
                .HasForeignKey(emp => emp.ActivityExerciseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ActivityType>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(at => at.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<User>()
                .HasOne(u => u.ActivityLevel)
                .WithMany(al => al.Users)
                .HasForeignKey(u => u.ActivityLevelId);

            builder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.Entity<WeightRecord>()
                .HasOne(wr => wr.User)
                .WithMany()
                .HasForeignKey(wr => wr.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.Entity<User>()
                .HasMany(u => u.Activities)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<User>()
                .HasMany(u => u.UserNutrientTargets)
                .WithOne(nt => nt.User)
                .HasForeignKey(nt => nt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserFavoriteActivityType>()
                .HasKey(uf => new { uf.UserId, uf.ActivityTypeId });
            builder.Entity<UserFavoriteActivityType>()
                .HasOne(uf => uf.User)
                .WithMany()
                .HasForeignKey(uf => uf.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<UserFavoriteActivityType>()
                .HasOne(uf => uf.ActivityType)
                .WithMany()
                .HasForeignKey(uf => uf.ActivityTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserFavoriteConsumableItem>()
                .HasKey(uf => new { uf.UserId, uf.ConsumableItemId });
            builder.Entity<UserFavoriteConsumableItem>()
                .HasOne(uf => uf.User)
                .WithMany()
                .HasForeignKey(uf => uf.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<UserFavoriteConsumableItem>()
                .HasOne(uf => uf.ConsumableItem)
                .WithMany()
                .HasForeignKey(uf => uf.ConsumableItemId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ConsumableItem>()
                .HasOne(ci => ci.User)
                .WithMany()
                .HasForeignKey(ci => ci.UserId)
                .OnDelete(DeleteBehavior.SetNull);


            builder.Entity<CustomWorkout>()
                .HasOne(cw => cw.ActivityCategory)
                .WithMany()
                .HasForeignKey(cw => cw.ActivityCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CustomWorkout>()
                .HasOne(cw => cw.ActivityType)
                .WithMany()
                .HasForeignKey(cw => cw.ActivityTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CustomWorkout>()
                .HasOne(cw => cw.User)
                .WithMany()
                .HasForeignKey(cw => cw.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }
    }
}
