using System.Text;

using HRMS_Backend.Data;
using HRMS_Backend.Mapper;
using HRMS_Backend.Middleware;
using HRMS_Backend.Model;
using HRMS_Backend.Services;
using HRMS_Backend.Services.Achievements;
using HRMS_Backend.Services.Email;
using HRMS_Backend.Services.GameScheduling;
using HRMS_Backend.Services.JobListing;
using HRMS_Backend.Services.Quartz;
using HRMS_Backend.Services.ServiceUserProfile;
using HRMS_Backend.Services.TravelandExpenses;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

using Quartz;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// -------------------- CORS Configuration --------------------

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowdFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:8080")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();

        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("Content-Disposition");

        policy.WithOrigins("https://localhost:7035")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// -------------------- Database Configuration --------------------

builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// -------------------- Authentication & Authorization --------------------

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["AppSettings:Issuer"],
                ValidAudience = builder.Configuration["AppSettings:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        builder.Configuration["AppSettings:Token"]!
                    )
                )
            };
    });

builder.Services.AddAuthorization();

// -------------------- Application Services --------------------

builder.Services.AddAutoMapper(typeof(MappingProfile));

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();

// Job Listing
builder.Services.AddScoped<IJobService, JobService>();

// Travel & Expenses
builder.Services.AddScoped<ITravelPlanService, TravelPlanService>();
builder.Services.AddScoped<IEmployeeTravelService, EmployeeTravelService>();
builder.Services.AddScoped<ITravelExpenseService, TravelExpenseService>();
builder.Services.AddScoped<IExpenseProofService, ExpenseProofService>();
builder.Services.AddScoped<ITravelDocumentsService, TravelDocumentsService>();

// Game Scheduling
builder.Services.AddScoped<IGameConfigService, GameConfigService>();
builder.Services.AddScoped<IGamesService, GamesService>();
builder.Services.AddScoped<IGameSlotService, GameSlotService>();
builder.Services.AddScoped<IGameCycleService, GameCycleService>();
builder.Services.AddScoped<IWaitingQueueService, WaitingQueueService>();
builder.Services.AddScoped<IFairnessService, FairnessService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IEmployeeCycleStatsService, EmployeeCycleStatsService>();

// Achievements & Social Interactions
builder.Services.AddScoped<IReferService, ReferService>();
builder.Services.AddScoped<IPostsService, PostsService>();
builder.Services.AddScoped<ICommentService, CommentService>();

// Email
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings")
);

builder.Services.AddScoped<IEmailService, EmailService>();

// -------------------- Quartz Job Scheduling --------------------

builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey("ExampleJob");

    q.AddJob<ExampleJob>(opts =>
        opts.WithIdentity(jobKey)
    );

    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity("ExampleJob-trigger")
        .StartNow()
        .WithSimpleSchedule(schedule => schedule
            .WithIntervalInHours(24)
            .RepeatForever()
        )
    );
});

// -------------------- Controllers & API Documentation --------------------

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// -------------------- Exception Handling --------------------

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// -------------------- Build Application --------------------

var app = builder.Build();

// -------------------- HTTP Request Pipeline --------------------

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowdFrontend");

app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(
            builder.Environment.ContentRootPath,
            "AchievementImages"
        )
    ),
    RequestPath = "/content/achievements"
});

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseExceptionHandler();

app.Run();