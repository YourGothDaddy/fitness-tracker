namespace Fitness_Tracker.Services.Benchmarking
{
    using System.Threading.Tasks;

    public interface IBenchmarkService
    {
        Task<string> RunBenchmarksAsync(string userId, int iterations = 3);
    }
}

