# syntax=docker/dockerfile:1.6

# --------------------
# Build stage
# --------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY Back-end/Fitness-Tracker.csproj ./
RUN dotnet restore "Fitness-Tracker.csproj"

# Copy source
COPY Back-end/. ./

# Ensure consumable JSON exists for MSBuild content copy
COPY Back-end/consumableItem.json ./consumableItem.json

# Publish (Release)
RUN dotnet publish "Fitness-Tracker.csproj" -c Release -o /app/publish /p:UseAppHost=false


# --------------------
# Runtime stage
# --------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}
EXPOSE 7009

ENTRYPOINT ["dotnet", "Fitness-Tracker.dll"]


