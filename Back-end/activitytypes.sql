CREATE TABLE [ActivityCategories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_ActivityCategories] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [ActivityLevels] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Multiplier] float NOT NULL,
    CONSTRAINT [PK_ActivityLevels] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [ConsumableItems] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [CaloriesPer100g] int NOT NULL,
    [ProteinPer100g] float NOT NULL,
    [CarbohydratePer100g] float NOT NULL,
    [FatPer100g] float NOT NULL,
    [Type] int NOT NULL,
    [IsPublic] bit NOT NULL,
    CONSTRAINT [PK_ConsumableItems] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [ActivityTypes] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [ActivityCategoryId] int NOT NULL,
    CONSTRAINT [PK_ActivityTypes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ActivityTypes_ActivityCategories_ActivityCategoryId] FOREIGN KEY ([ActivityCategoryId]) REFERENCES [ActivityCategories] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUsers] (
    [Id] nvarchar(450) NOT NULL,
    [FullName] nvarchar(max) NOT NULL,
    [Gender] int NOT NULL,
    [Weight] real NOT NULL,
    [Height] real NOT NULL,
    [Age] int NOT NULL,
    [ActivityLevelId] int NOT NULL,
    [WeeklyWeightChangeGoal] real NOT NULL,
    [DailyCaloriesGoal] int NOT NULL,
    [MonthlyCaloriesGoal] int NOT NULL,
    [DailyProteinGoal] int NOT NULL,
    [GoalWeight] real NOT NULL,
    [IsDailyCaloriesGoal] bit NOT NULL,
    [NotificationsEnabled] bit NOT NULL,
    [MacroMode] int NOT NULL,
    [ProteinRatio] int NOT NULL,
    [CarbsRatio] int NOT NULL,
    [FatRatio] int NOT NULL,
    [ProteinKcal] int NOT NULL,
    [CarbsKcal] int NOT NULL,
    [FatKcal] int NOT NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUsers_ActivityLevels_ActivityLevelId] FOREIGN KEY ([ActivityLevelId]) REFERENCES [ActivityLevels] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Nutrients] (
    [Id] int NOT NULL IDENTITY,
    [Category] nvarchar(max) NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Amount] float NOT NULL,
    [ConsumableItemId] int NULL,
    CONSTRAINT [PK_Nutrients] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Nutrients_ConsumableItems_ConsumableItemId] FOREIGN KEY ([ConsumableItemId]) REFERENCES [ConsumableItems] ([Id])
);
GO


CREATE TABLE [Activities] (
    [Id] int NOT NULL IDENTITY,
    [DurationInMinutes] int NOT NULL,
    [TimeOfTheDay] int NOT NULL,
    [CaloriesBurned] int NOT NULL,
    [ActivityTypeId] int NOT NULL,
    [Date] datetime2 NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [IsPublic] bit NOT NULL,
    CONSTRAINT [PK_Activities] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Activities_ActivityTypes_ActivityTypeId] FOREIGN KEY ([ActivityTypeId]) REFERENCES [ActivityTypes] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Activities_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserRoles] (
    [UserId] nvarchar(450) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserTokens] (
    [UserId] nvarchar(450) NOT NULL,
    [LoginProvider] nvarchar(450) NOT NULL,
    [Name] nvarchar(450) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Meals] (
    [Id] int NOT NULL IDENTITY,
    [MealOfTheDay] int NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Calories] int NOT NULL,
    [Protein] float NOT NULL,
    [Carbs] float NOT NULL,
    [Fat] float NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [Date] datetime2 NOT NULL,
    CONSTRAINT [PK_Meals] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Meals_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [RefreshTokens] (
    [Id] int NOT NULL IDENTITY,
    [Token] nvarchar(max) NOT NULL,
    [Expires] datetime2 NOT NULL,
    [Created] datetime2 NOT NULL,
    [CreatedByIp] nvarchar(max) NOT NULL,
    [Revoked] datetime2 NULL,
    [RevokedByIp] nvarchar(max) NULL,
    [ReplacedByToken] nvarchar(max) NULL,
    [UserId] nvarchar(450) NULL,
    CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RefreshTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [UserNutrientTargets] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [NutrientName] nvarchar(max) NOT NULL,
    [Category] nvarchar(max) NOT NULL,
    [IsTracked] bit NOT NULL,
    [DailyTarget] float NULL,
    [HasMaxThreshold] bit NOT NULL,
    [MaxThreshold] float NULL,
    CONSTRAINT [PK_UserNutrientTargets] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UserNutrientTargets_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [WeightRecords] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [Date] datetime2 NOT NULL,
    [Weight] real NOT NULL,
    [Notes] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_WeightRecords] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WeightRecords_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE INDEX [IX_Activities_ActivityTypeId] ON [Activities] ([ActivityTypeId]);
GO


CREATE INDEX [IX_Activities_UserId] ON [Activities] ([UserId]);
GO


CREATE INDEX [IX_ActivityTypes_ActivityCategoryId] ON [ActivityTypes] ([ActivityCategoryId]);
GO


CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
GO


CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
GO


CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
GO


CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
GO


CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
GO


CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
GO


CREATE INDEX [IX_AspNetUsers_ActivityLevelId] ON [AspNetUsers] ([ActivityLevelId]);
GO


CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
GO


CREATE INDEX [IX_Meals_UserId] ON [Meals] ([UserId]);
GO


CREATE INDEX [IX_Nutrients_ConsumableItemId] ON [Nutrients] ([ConsumableItemId]);
GO


CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);
GO


CREATE INDEX [IX_UserNutrientTargets_UserId] ON [UserNutrientTargets] ([UserId]);
GO


CREATE INDEX [IX_WeightRecords_UserId] ON [WeightRecords] ([UserId]);
GO


