﻿namespace Fitness_Tracker.Data
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
        public DbSet<WeightRecord> WeightRecords { get; set; }

        public DbSet<ActivityLevel> ActivityLevels { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

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
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }
    }
}
