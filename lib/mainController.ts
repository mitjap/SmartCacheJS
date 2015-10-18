/// <reference path="../typings/tsd.d.ts" />

interface IMainControllerScope extends ng.IScope {
	value: string;
}

function MainController($scope: IMainControllerScope)  {
	$scope.value = "bu";
}