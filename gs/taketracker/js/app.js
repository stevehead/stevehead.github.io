(function() {
    const MIN_TAKE = 1.6;
    const INIT_TAKES = 3;
    const INIT_TAKE_INTERVAL = 900000;
    var app = angular.module('gstaketracker', []);

    app.controller('MainController', function($scope, $interval) {
        $scope.takes = [];
        $scope.cTakes = [];
        $scope.process = function () {
            var now = Date.now();
            var startTime = Date.parse($scope.startTime);
            if (!startTime) return;
            startTime = startTime.getTime();
            var timeDifference = (now - startTime) / 1000;

            var workHours = ($scope.meal) ? $scope.hours - 0.5 : $scope.hours;
            var takeHours = $scope.hours - 0.5;
            var targetTakes = Math.ceil($scope.targetTakeRate * workHours);
            $scope.targetTakes = targetTakes;
            var normalTakes = targetTakes - INIT_TAKES;

            var normalTakeInterval = ((takeHours - 0.5) / normalTakes) * 3600 * 1000;

            var normalStartTime = startTime + (INIT_TAKES - 1) * INIT_TAKE_INTERVAL;
            var totalTime = INIT_TAKES * INIT_TAKE_INTERVAL + normalTakes * normalTakeInterval
            var takes = [];

            var cont = true;
            var shouldHaveTakes = 0;
            for (i = 0; i < 3; i++)
            {
                var take = {};
                take.startTime = startTime + (i - 1) * INIT_TAKE_INTERVAL;
                take.endTime = startTime + i * INIT_TAKE_INTERVAL;
                var takeCloseTime = take.endTime - 0.2 * INIT_TAKE_INTERVAL;

                if (now < take.endTime)
                {
                    cont = false;
                    take.width = 100 * (now - take.startTime) / totalTime;
                }
                else
                {
                    shouldHaveTakes++;
                    take.width = 100 * INIT_TAKE_INTERVAL / totalTime;
                }

                if (now >= take.endTime)
                {
                    if (shouldHaveTakes > $scope.currentTakes)
                    {
                        take.class = 'progress-bar-danger';
                    }
                    else
                    {
                        take.class = 'progress-bar-success';
                    }
                }
                else
                {
                    if (shouldHaveTakes > $scope.currentTakes && now >= takeCloseTime)
                    {
                        take.class = 'progress-bar-warning';
                    }
                    else
                    {
                        take.class = '';
                    }
                }
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
                    var takeCloseTime = take.endTime - 0.2 * normalTakeInterval;
                    if (now < take.endTime)
                    {
                        cont = false;
                        take.width = 100 * (now - take.startTime) / totalTime;
                    }
                    else
                    {
                        shouldHaveTakes++;
                        take.width = 100 * normalTakeInterval / totalTime;
                    }
                    if (now >= take.endTime)
                    {
                        if (shouldHaveTakes > $scope.currentTakes)
                        {
                            take.class = 'progress-bar-danger';
                        }
                        else
                        {
                            take.class = 'progress-bar-success';
                        }
                    }
                    else
                    {
                        if (shouldHaveTakes > $scope.currentTakes && now >= takeCloseTime)
                        {
                            take.class = 'progress-bar-warning';
                        }
                        else
                        {
                            take.class = '';
                        }
                    }
                    takes.push(take);

                    if (!cont) break;
                }
            }

            var cTakes = [];
            var tClass;
            var takeRate = $scope.currentTakes / ((now - startTime) / (3600 * 1000));
            var tWidth = 100 / targetTakes;
            if (takeRate < 1.6)  tClass = 'progress-bar-danger';
            else if (takeRate < 1.8) tClass = 'progress-bar-warning';
            else if (takeRate < 2.0) tClass = 'progress-bar-info';
            else tClass = 'progress-bar-success';
            for (i = 0; i < $scope.currentTakes; i++)
            {
                var take = {};
                take.width = tWidth;
                take.class = tClass;
                cTakes.push(take);
            }
            $scope.takes = takes;
            $scope.cTakes = cTakes;
        };


        $scope.startTime = '9:00 AM';
        $scope.hours = 8;
        $scope.meal = true;
        $scope.currentTakes = 0;
        $scope.targetTakeRate = MIN_TAKE;
        $scope.process();

        $interval(function() {$scope.process()}, 5000);
    });
})();
