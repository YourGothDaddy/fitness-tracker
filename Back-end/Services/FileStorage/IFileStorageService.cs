namespace Fitness_Tracker.Services.FileStorage
{
    public interface IFileStorageService
    {
        Task<string> UploadImageAsync(IFormFile file, string folder = "avatars");
        Task<bool> DeleteImageAsync(string imageUrl);
    }
}

