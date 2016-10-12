(function() {
    const DAY_LENGTH = 86400000;
    var app = angular.module('gsfftracker', []).run(function($rootScope) {
        $rootScope.canClockOn = false;
        $rootScope.canStartMeal = false;
        $rootScope.canEndMeal = false;
        $rootScope.canClockOff = false;
        $rootScope.canWork = false;
        loadData($rootScope);
    });

    app.controller('PunchController', function($rootScope) {
        this.punch = '';
        var punchCtrl = this;

        punchCtrl.addPunch = function() {
            var now = Date.now();
            var shift;
            if (punchCtrl.punch == 'clockOn') {
                shift = {'clockOn': now, 'startMeal': 0, 'endMeal': 0, 'clockOff': 0};
            }
            else {
                shift = $rootScope.activeShift;
                shift[punchCtrl.punch] = now;
            }
            db.shifts.put(shift).then(function () {
                loadData($rootScope);
            });
        };
    });

    app.controller('CalendarController', function() {

    });

    app.controller('NewJobController', function($scope, $rootScope) {
        var newJobCtrl = this;
        newJobCtrl.newJob = {};

        newJobCtrl.addJob = function() {
            var now = Date.now();
            var newJob = newJobCtrl.newJob;
            newJob.utilization = 0;
            newJob.startTime = now;
            newJob.endTime = 0;
            db.jobs.add(newJob).then(function () {
                loadData($rootScope);
            });
        };
    });

    app.controller('JobsController', function() {

    });

    function loadData(scope) {
        var today = new Date();
        var sundayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        var startTime = sundayOfWeek.getTime();
        return db.transaction('r', db.shifts, db.jobs, db.services, function* () {
            scope.activeShift = yield db.shifts.where('clockOff').equals(0).first();
            scope.activeJobs = yield db.jobs.where('endTime').equals(0).toArray();
            scope.days = [];

            for (i = 0; i < 7; i++) {
                var thisStartTime = startTime + i * DAY_LENGTH;
                if (thisStartTime > today.getTime()) break;
                var thisEndTime = startTime + (i + 1) * DAY_LENGTH;

                var day = {date: new Date(thisStartTime)};

                // Shifts
                var shiftIds = [];
                yield db.shifts.where('clockOn').aboveOrEqual(thisStartTime)
                    .and(function (shift) { return shift.clockOn < thisEndTime; })
                    .each(function (shift) { shiftIds.push(shift.id) });
                yield db.shifts.where('clockOff').aboveOrEqual(thisStartTime)
                    .and(function (shift) { return shift.clockOff < thisEndTime; })
                    .each(function (shift) { shiftIds.push(shift.id) });
                yield db.shifts.where('id').anyOf(shiftIds).sortBy('clockOn', function (shifts) { day.shifts = shifts; });

                // Jobs
                var jobIds = [];
                yield db.jobs.where('startTime').aboveOrEqual(thisStartTime)
                    .and(function (job) { return job.startTime < thisEndTime; })
                    .each(function (job) { jobIds.push(job.id) });
                yield db.jobs.where('startTime').below(thisEndTime)
                    .and(function (job) { return job.endTime == 0; })
                    .each(function (job) { jobIds.push(job.id) });
                var jobs = yield db.jobs.where('id').anyOf(jobIds).sortBy('startTime', function (jobs) { return jobs; });

                // Services
                for (j = 0; j < jobs.length; j++) {
                    let services = yield db.services.where('jobId').equals(jobs[j].id).sortBy('startTime', function (services) { return services; });
                    jobs[j].services = services;
                }
                day.jobs = jobs;

                scope.days.push(day);
            }
            console.log(scope.days);
            //var affectedShifts = yield db.shifts.where('clockOff').above(startTime).toArray();
            determineAllowedActions(scope, scope.activeShift);
        }).then(function () {
            scope.$apply();
        });
    }

    function determineAllowedActions(scope, shift) {
        if (shift) {
            if (shift.startMeal == 0) {
                scope.canClockOn = false;
                scope.canStartMeal = true;
                scope.canEndMeal = false;
                scope.canClockOff = true;
                scope.canWork = true;
            }
            else if (shift.startMeal != 0 && shift.endMeal == 0) {
                scope.canClockOn = false;
                scope.canStartMeal = false;
                scope.canEndMeal = true;
                scope.canClockOff = false;
                scope.canWork = false;
            }
            else if (shift.endMeal != 0) {
                scope.canClockOn = false;
                scope.canStartMeal = false;
                scope.canEndMeal = false;
                scope.canClockOff = true;
                scope.canWork = true;
            }
        }
        else {
            scope.canClockOn = true;
            scope.canStartMeal = false;
            scope.canEndMeal = false;
            scope.canClockOff = false;
            scope.canWork = false;
        }
    }
})();
