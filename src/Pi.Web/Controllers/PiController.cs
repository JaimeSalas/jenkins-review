using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Pi.Web.Models;
using Pi.Math;

namespace Pi.Web.Controllers
{
    public class PiController : Controller
    {
        // private readonly ILogger<PiController> _logger;
        private readonly IConfiguration _config;
        private readonly bool _metricsEnabled;

        public PiController(IConfiguration config)
        {
            _config = config;
            _metricsEnabled = bool.Parse(_config["Computation:Metrics:Enabled"]);
        }

        public IActionResult Index(int? dp = 6)
        {
            var stopwatch = Stopwatch.StartNew();

            var pi = MachinFormula.Calculate(dp.Value, _metricsEnabled);

            var model = new PiViewModel
            {
                DecimalPlaces = dp.Value,
                Value = pi.ToString(),
                ComputeMilliseconds = stopwatch.ElapsedMilliseconds,
                ComputeHost = Environment.MachineName
            };

            return View(model);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
