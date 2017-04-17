app.directive("choosePhotoModalDirective", function () {
    return {
        scope: {
            onSelectCallback: '&',
            callbackArgs: '=',
            maxWidth: '=',
            ratio: '='
        },
        transclude: true,
        restrict: "A",
        template: '<span ng-click="choosePhotoModal()" ng-transclude></span>',
        replace: false,
        controller: 'choosePhotoModalDirectiveController',
        controllerAs: 'ctrl',
        link: function ($scope, $elem, $attr, controller) {

        }
    };
}); 

