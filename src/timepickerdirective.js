/*global angular */
/*
 Directive for jQuery UI timepicker (http://jonthornton.github.io/jquery-timepicker/)

 */
var m = angular.module('ui.timepicker', []);


m.value('uiTimepickerConfig', {
    'step': 15
});

m.directive('uiTimepicker', ['uiTimepickerConfig', '$parse', '$window', function(uiTimepickerConfig, $parse, $window) {
    var moment = $window.moment;

    var isAMoment = function(date) {
        return moment !== undefined && moment.isMoment(date) && date.isValid();
    };
    var isDateOrMoment = function(date) {
        return date !== null && (angular.isDate(date) || isAMoment(date));
    };

    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            baseDate: '=',
            uiTimepicker: '=',
        },
        priority: 1,
        link: function(scope, element, attrs, ngModel) {
            'use strict';
            var config = angular.copy(uiTimepickerConfig);
            var asMoment = config.asMoment || false;
            delete config.asMoment;

            ngModel.$render = function() {
                var date = ngModel.$modelValue;
                if (!angular.isDefined(date)) {
                    return;
                }
                if (date !== null && date !== '' && !isDateOrMoment(date)) {
                    throw new Error('ng-Model value must be a Date or Moment object - currently it is a ' + typeof date + '.');
                }
                if (isAMoment(date)) {
                    date = date.toDate();
                }
                if (!element.is(':focus') && !invalidInput()) {
                    element.timepicker('setTime', date);
                }
                if(date === null){
                    resetInput();
                }
            };

            scope.$watch('ngModel', function() {
                ngModel.$render();
            }, true);

            scope.$watch('uiTimepicker', function() {
              element.timepicker(
                  'option',
                  angular.extend(
                      config, scope.uiTimepicker ?
                          scope.uiTimepicker :
                          {}
                  )
              );
            }, true);

            config.appendTo = config.appendTo || element.parent();

            element.timepicker(
                angular.extend(
                    config, scope.uiTimepicker ?
                        scope.uiTimepicker :
                        {}
                )
            );

            var resetInput = function(){
                element.timepicker('setTime', null);
            };

            var userInput = function() {
                return element.val().trim();
            };

            var invalidInput = function() {
                return userInput() && ngModel.$modelValue === null;
            };

            element.on('$destroy', function() {
                element.timepicker('remove');
            });

            var asDate = function() {
                var baseDate = ngModel.$modelValue ? ngModel.$modelValue : scope.baseDate;
                return isAMoment(baseDate) ? baseDate.toDate() : baseDate;
            };

            var asMomentOrDate = function(date) {
                return asMoment ? moment(date) : date;
            };

            if (element.is('input')) {
                ngModel.$parsers.unshift(function() {
                    var date = element.timepicker('getTime', asDate());
                    ngModel.$setValidity('time', date !== null);
                    return date ? asMomentOrDate(date) : date;
                });
            } else {
                element.on('changeTime', function() {
                    scope.$evalAsync(function() {
                        var date = element.timepicker('getTime', asDate());
                        ngModel.$setViewValue(date);
                    });
                });
            }
        }
    };
}]);
