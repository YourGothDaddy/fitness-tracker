using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Fitness_Tracker.Models;
using Microsoft.Extensions.Options;

namespace Fitness_Tracker.Services.FileStorage
{
    public class CloudinaryStorageService : IFileStorageService
    {
        private readonly Cloudinary _cloudinary;
        private readonly CloudinarySettings _settings;

        public CloudinaryStorageService(IOptions<CloudinarySettings> settings)
        {
            _settings = settings.Value;
            
            var account = new Account(
                _settings.CloudName,
                _settings.ApiKey,
                _settings.ApiSecret
            );
            
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder = "avatars")
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty or null");
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"Invalid file type. Allowed: {string.Join(", ", allowedExtensions)}");
            }

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
            {
                throw new ArgumentException("File size exceeds 10MB limit");
            }

            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder, // Organize images in folders
                Transformation = new Transformation()
                    .Width(400)
                    .Height(400)
                    .Crop("fill")
                    .Gravity("face")
                    .Quality("auto") // Auto-optimize quality
                    .FetchFormat("auto"), // Auto-optimize format (WebP when supported)
                PublicId = $"{folder}/{Guid.NewGuid()}", // Unique public ID
                Overwrite = false
            };

            try
            {
                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                
                if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    // Return the secure URL
                    return uploadResult.SecureUrl.ToString();
                }
                else
                {
                    throw new Exception($"Cloudinary upload failed: {uploadResult.Error?.Message}");
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error uploading image to Cloudinary: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                // Extract public ID from Cloudinary URL
                // URL format: https://res.cloudinary.com/{cloudName}/image/upload/{folder}/{publicId}.{ext}
                var uri = new Uri(imageUrl);
                var segments = uri.Segments;
                
                // Find the upload segment and get everything after it
                int uploadIndex = Array.IndexOf(segments, "upload/");
                if (uploadIndex == -1)
                {
                    return false;
                }

                // Get the path after "upload/"
                var pathAfterUpload = string.Join("", segments.Skip(uploadIndex + 1));
                
                // Remove file extension to get public ID
                var publicId = Path.ChangeExtension(pathAfterUpload, null);
                
                var deleteParams = new DeletionParams(publicId)
                {
                    ResourceType = ResourceType.Image
                };

                var result = await _cloudinary.DestroyAsync(deleteParams);
                
                return result.Result == "ok";
            }
            catch
            {
                return false;
            }
        }
    }
}

