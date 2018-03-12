(function () {
    'use strict';
      angular
        .module('ventronElectron')
        .config(
            [
                '$routeProvider', '$mdThemingProvider',
                function ($routeProvider, $mdThemingProvider) {
                    $mdThemingProvider.theme('default').primaryPalette('green').accentPalette('light-green', {
                        'default': 'A100',
                        'hue-1': '100',
                        'hue-2': '600',
                        'hue-3': 'A100'
                      }).warnPalette('red');
                    $routeProvider.when(
                        '/home', {
                            templateUrl: './app/features/login/login.html',
                            controller: 'HomeCtrl',
                            controllerAs: 'vm'
                        }
                    )
                    .when(
                        '/caixa', {
                            templateUrl: './app/features/caixa/caixa.html',
                            controller: 'VendasCtrl',
                            controllerAs: 'vm'
                        }
                    )
                    .when(
                        '/nfe', {
                            templateUrl: './app/features/nfe/nfe.html',
                            controller: 'NfeCtrl',
                            controllerAs: 'vm'
                        }
                    )                                         ;
                    $routeProvider.otherwise({redirectTo: '/home'});
                }
            ]
        );
})();