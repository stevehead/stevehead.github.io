(function() {
    const MIN_TAKE = 1.6;
    const INIT_TAKES = 3;
    const INIT_TAKE_INTERVAL = 900000;
    var app = angular.module('gstaketracker', []);

    app.controller('MainController', function($scope, $interval) {
        $scope.takes = [];
        $scope.process = function () {
            var now = Date.now();
            var startTime = Date.parse($scope.startTime);
            if (!startTime) return;
            startTime = startTime.getTime();
            var timeDifference = (now - startTime) / 1000;

            var workHours = ($scope.meal) ? $scope.hours - 0.5 : $scope.hours;
            var takeHours = $scope.hours - 0.5;
            var targetTakes = Math.ceil(MIN_TAKE * workHours);
            var normalTakes = targetTakes - INIT_TAKES;

            var normalTakeInterval = ((takeHours - 0.5) / normalTakes) * 3600 * 1000;

            var normalStartTime = startTime + (INIT_TAKES - 1) * INIT_TAKE_INTERVAL;
            var totalTime = INIT_TAKES * INIT_TAKE_INTERVAL + normalTakes * normalTakeInterval
            var takes = [];

            var cont = true;
            var totalWidth = 0;
            for (i = 0; i < 3; i++)
            {
                var take = {};
                take.startTime = startTime + (i - 1) * INIT_TAKE_INTERVAL;
                take.endTime = startTime + i * INIT_TAKE_INTERVAL;

                if (now < take.endTime)
                {
                    cont = false;
                    take.width = 100 * (now - take.startTime) / totalTime;
                }
                else
                {
                    take.width = 100 * INIT_TAKE_INTERVAL / totalTime;
                }
                totalWidth += take.width;
                take.class = (now >= take.endTime) ? 'progress-bar-success' : '';
                takes.push(take);

                if (!cont) break;
            }

            if (cont)
            {
                for (i = 0; i < normalTakes; i++)
                {
                    var take = {};
                    take.startTime = normalStartTime + i * normalTakeInterval;
                    take.endTime = normalStartTime + (i + 1) * normalTakeInterval;
                    if (now < take.endTime)
                    {
                        cont = false;
                        take.width = 100 * (now - take.startTime) / totalTime;
                    }
                    else
                    {
                        take.width = 100 * normalTakeInterval / totalTime;
                    }
                    totalWidth += take.width;
                    take.class = (now >= take.endTime) ? 'progress-bar-success' : '';
                    takes.push(take);

                    if (!cont) break;
                }
            }
            $scope.takes = takes;
        };


        $scope.startTime = '9:00 AM';
        $scope.hours = 8;
        $scope.meal = true;
        $scope.currentTakes = 0;
        $scope.process();

        $interval(function() {$scope.process()}, 5000);
    });
})();
