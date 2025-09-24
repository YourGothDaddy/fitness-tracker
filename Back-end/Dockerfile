# syntax=docker/dockerfile:1.6

# --------------------
# Build stage
# --------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY Back-end/Fitness-Tracker.csproj ./
RUN dotnet restore "Fitness-Tracker.csproj"

# Copy the rest of the source (only Back-end)
COPY Back-end/. ./

# Publish (Release)
RUN dotnet publish "Fitness-Tracker.csproj" -c Release -o /app/publish /p:UseAppHost=false


# --------------------
# Runtime stage
# --------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published app from build stage
COPY --from=build /app/publish ./

# Render provides PORT env var; Kestrel is configured in Program.cs to use it
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}

# Expose default local dev port (optional) and Render dynamic port
EXPOSE 7009

# Start the application
ENTRYPOINT ["dotnet", "Fitness-Tracker.dll"]


