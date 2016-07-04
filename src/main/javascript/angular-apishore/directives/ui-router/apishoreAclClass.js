(function () {
    apishore.directive("apishoreAclClass", function ($animate, $interpolate, apishoreAuth) {
        return {
            restrict: 'A',
            transclude: false,
            scope: false,
            controller: function ($scope, $element, $attrs) {

                var oldVal;

                $attrs.$observe('apishoreAclClass', update);
                $scope.$watch($attrs.apishoreAclClass, update);
                $scope.$on("permissionsUpdated", update);

                function update() {
                    console.log("roles: ", apishoreAuth.getRoles());
                    var params = $scope.$eval($attrs.apishoreAclClass, apishoreAuth.getRoles());
                    console.log("update: ", params);
                    var classes = arrayClasses(params);
                    console.log("classes: ", classes);
                    ngClassWatchAction(classes);
                }

                // following is from ng-class sources
                // https://github.com/angular/angular.js/blob/master/src/ng/directive/ngClass.js
                function ngClassWatchAction(newVal) {
                    var newClasses = arrayClasses(newVal || []);
                    if (!oldVal) {
                        addClasses(newClasses);
                    } else if (!angular.equals(newVal, oldVal)) {
                        var oldClasses = arrayClasses(oldVal);
                        updateClasses(oldClasses, newClasses);
                    }
                    oldVal = newVal;
                }

                function addClasses(classes) {
                    var newClasses = digestClassCounts(classes, 1);
                    $attrs.$addClass(newClasses);
                }

                function removeClasses(classes) {
                    var newClasses = digestClassCounts(classes, -1);
                    $attrs.$removeClass(newClasses);
                }

                function digestClassCounts(classes, count) {
                    var classCounts = $element.data('$classCounts') || {};
                    var classesToUpdate = [];
                    angular.forEach(classes, function (className) {
                        if (count > 0 || classCounts[className]) {
                            classCounts[className] = (classCounts[className] || 0) + count;
                            if (classCounts[className] === +(count > 0)) {
                                classesToUpdate.push(className);
                            }
                        }
                    });
                    $element.data('$classCounts', classCounts);
                    return classesToUpdate.join(' ');
                }

                function updateClasses(oldClasses, newClasses) {
                    var toAdd = arrayDifference(newClasses, oldClasses);
                    var toRemove = arrayDifference(oldClasses, newClasses);
                    toAdd = digestClassCounts(toAdd, 1);
                    toRemove = digestClassCounts(toRemove, -1);
                    if (toAdd && toAdd.length) {
                        $animate.addClass($element, toAdd);
                    }
                    if (toRemove && toRemove.length) {
                        $animate.removeClass($element, toRemove);
                    }
                }

                function arrayDifference(tokens1, tokens2) {
                    var values = [];

                    outer:
                        for (var i = 0; i < tokens1.length; i++) {
                            var token = tokens1[i];
                            for (var j = 0; j < tokens2.length; j++) {
                                if (token == tokens2[j]) continue outer;
                            }
                            values.push(token);
                        }
                    return values;
                }

                function arrayClasses(classVal) {
                    if (angular.isArray(classVal)) {
                        return classVal;
                    } else if (angular.isString(classVal)) {
                        return classVal.split(' ');
                    } else if (angular.isObject(classVal)) {
                        var classes = [];
                        angular.forEach(classVal, function (v, k) {
                            if (v) {
                                classes = classes.concat(k.split(' '));
                            }
                        });
                        return classes;
                    }
                    return classVal;
                }
            }
        };
    });
})();