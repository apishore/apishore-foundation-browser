apishore.factory("apishoreFormUtils", function($state, apishoreUtils)
{
    return {
        findParentStateData: function(state, parent)
        {
            if(state.data && angular.isDefined(state.data[parent]))
            {
                return state.data[parent];
            }
            var ld = state.name.lastIndexOf('.');
            if(ld >= 0)
            {
                var parentName = state.name.substring(0, ld);
                return this.findParentStateData($state.get(parentName), parent);
            }
            return undefined;
        },
        setCreateDefaults: function($scope, resetModel, factory, parent)
        {
            $scope.itemData = { data: {}};
            $scope.serverError = false;
            $scope.submitting = false;

            if(angular.isDefined(parent))
            {
                // state can contain old data, we might want to get fresh data from server
                var thus = this;
                angular.forEach(parent, function(value)
                {
                    var parentName = apishoreUtils.toFieldName(value);
                    $scope.itemData.data[parentName] = thus.findParentStateData($state.current, parentName);
                    if ($scope.itemData.data[parentName])
                    {
                        $scope.itemData.data[parentName+'Id'] = $scope.itemData.data[parentName].id;
                    }
                });
            }
            factory.setDefaults($scope.itemData.data);
            resetModel();
        },
//        createCreateScope: function($scope, elem, attrs, resetModel, factory, useState)
//        {
//        	
//        },
//        createCreateStateScope: function($scope, elem, attrs, resetModel, factory)
//        {
//            return this.createCreateScope($scope, elem, attrs, resetModel, factory, true)
//        },

        createEditStateScope: function($scope, elem, attrs, factory, itemId){
            return this.createEditScope($scope, elem, attrs, factory, itemId, true);
        },
        createFieldRefSelectDirective: function(elem, attrs, factory, label)
        {
            if(attrs.required == "true")
            {
                elem.find("option")[0].remove();
            }

            var id = attrs.controlId;
            apishoreUtils.adjustFormGroupTemplate(elem, attrs, label);
            return {
                post: function($scope, elem, attrs, formCtrl)
                {
                    // console.log(name + ': post link'+formCtrl);
                    $scope.formField = formCtrl[id];
                    $scope.form = formCtrl;
                    $scope.itemLoaded = false;
                    if(angular.isDefined(attrs.restrictedByParent))
                    {
                        $scope.$watch('restrictedByParent', function(newValue, oldValue)
                        {
                            $scope.selectAll();
                            if(formCtrl.$dirty && $scope.parentModel !== newValue)
                            {
                                $scope.item = {name: ""};
                                $scope.model = undefined;
                            }
                        });
                    }
                    if(angular.isDefined(attrs.eraseByParent))
                    {
                        $scope.$watch('eraseByParent', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && $scope.parentModel !== newValue)
                            {
                                $scope.item = {name: ""};
                                $scope.model = undefined;
                            }
                        });
                    }
                    if(angular.isDefined(attrs.setByChild))
                    {
                        $scope.$watch('setByChild', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && angular.isDefined(newValue) && newValue !== '')
                            {
                                factory.get(newValue, "view").then(function(res)
                                {
                                    if(res.data.data)
                                    {
                                        $scope.item = res.data.data;
                                        $scope.model = res.data.data.id;
                                    }
                                });
                            }
                        });
                    }
                    $scope.selectAll = function()
                    {
                        if(angular.isDefined($scope.restrictedByParent))
                        {
                            factory.list({}, $scope.restrictedByParent).then(function(items)
                            {
                                $scope.items = items.data.data;
                            });
                            return;
                        }
                        factory.listByState().then(function(items)
                        {
                            $scope.items = items.data.data;
                        });
                    };
                    $scope.onselected = function()
                    {
                        $scope.items.forEach(function(item)
                        {
                            if(item.data.id === $scope.model)
                            {
                                $scope.itemData.data[$scope.controlPreview] = item.data;
                            }
                        });
                    };
                    //init
                    $scope.selectAll();
                }
            };
        },
        createFieldRefSelectTypeaheadDirective: function(elem, attrs, factory, label, typeahead)
        {
            var id = attrs.controlId;
            apishoreUtils.adjustFormGroupTemplate(elem, attrs, label);
            return {
                post: function($scope, elem, attrs, formCtrl)
                {
                    // console.log(name + ': post link'+formCtrl);
                    $scope.formField = formCtrl[id];
                    $scope.form = formCtrl;
                    $scope.item = {};
                    $scope.item[typeahead] = '';
                    $scope.itemLoaded = false;
                    if(angular.isDefined(attrs.restrictedByParent))
                    {
                        $scope.$watch('restrictedByParent', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && $scope.parentModel !== newValue)
                            {
                                $scope.item = {name: ""};
                                $scope.model = undefined;
                            }
                        });
                    }
                    if(angular.isDefined(attrs.eraseByParent))
                    {
                        $scope.$watch('eraseByParent', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && $scope.parentModel !== newValue)
                            {
                                $scope.item = {name: ""};
                                $scope.model = undefined;
                            }
                        });
                    }
                    if(angular.isDefined(attrs.setByChild))
                    {
                        $scope.$watch('setByChild', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && angular.isDefined(newValue) && newValue !== '' && newValue !== oldValue)
                            {
                                factory.get(newValue, "view").then(function(res)
                                {
                                    if(res.data.data)
                                    {
                                        $scope.item = $scope.itemData.data[$scope.controlPreview] = res.data;
                                        $scope.model = res.data.data.id;
                                    }
                                });
                            }
                        });
                    }

                    $scope.$watch('itemData.data', function(newValue, oldValue)
                    {
                        if(angular.isDefined(newValue) && angular.isDefined(newValue[$scope.controlPreview]) && !$scope.itemLoaded)
                        {
                            $scope.item = newValue[$scope.controlPreview];
                            $scope.itemLoaded = true;
                        }
                    });
                    $scope.$watch('item', function(newValue, oldValue)
                    {
                        if(formCtrl.$dirty && (newValue == '' || !angular.isDefined(newValue)))
                        {
                            $scope.model = '';
                            $scope.itemData.data[$scope.controlPreview] = undefined;
                        }
                    });
                    $scope.typeahead = function(value)
                    {
                        if(angular.isDefined($scope.restrictedByParent))
                        {
                            return factory.selectByParent({
                                sortField: typeahead,
                                typeahead: value
                            }, $scope.restrictedByParent).then(function(items)
                            {
                                return items.data.data;
                            });
                        }
                        return factory.listByState({
                            sortField: typeahead,
                            typeahead: value
                        }).then(function(items)
                        {
                            return items.data.data;
                        });
                    };
                    $scope.onselected = function(value)
                    {
                        console.info("onselected" + value);
                        $scope.model = value.id;
                        $scope.itemData.data[$scope.controlPreview] = value;
                    };
                }
            }
        },
        createStateController: function createStateController($scope, $rootScope, $state, $stateParams, stateName, struct, view, entityName, entityStateParamName)
        {
            var state = $state.get(stateName);
            $rootScope.$on('DataChanges', function(event, changes, data)
            {
                if(data.view == view && data.item && data.item.id == $stateParams[entityStateParamName])
                {
                    state.data.dataRoles = data.roles;
                    $scope[entityName] = state.data[entityName] = data.item;
                    $rootScope.$broadcast('$stateDataUpdate');
                }
                else
                {
                    var id = changes.items && changes.items[struct];
                    if(id == $stateParams[entityStateParamName])
                    {
                        state.resolve[entityName].then(function(res)
                        {
                            state.data.dataRoles = res.data.roles;
                            state.data[entityName] = res.data.data;
                            $rootScope.$broadcast('$stateDataUpdate');
                        });
                    }
                }
            });
        },
        createStateSingletonController: function createStateSingletonController($scope, $rootScope, $state, $stateParams, stateName, struct, view, entityName)
        {
            var state = $state.get(stateName);
            $rootScope.$on('DataChanges', function(event, changes, data)
            {
                if(data.view == view && data.item)
                {
                    state.data.dataRoles = data.roles;
                    $scope[entityName] = state.data[entityName] = data.item;
                    $rootScope.$broadcast('$stateDataUpdate');
                }
                else
                {
                    if(changes.items && changes.items[struct])
                    {
                        state.resolve[entityName].then(function(res)
                        {
                            state.data.dataRoles = res.data.roles;
                            state.data[entityName] = res.data.data;
                            $rootScope.$broadcast('$stateDataUpdate');
                        });
                    }
                }
            });
        }
    };
});
