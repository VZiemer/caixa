(function () {
    'use strict';
      angular
        .module('ventronElectron')
        .config(
            [
                '$routeProvider', '$mdThemingProvider','$mdDateLocaleProvider',
                function ($routeProvider, $mdThemingProvider,$mdDateLocaleProvider) {

                    // Example of a French localization.
                    $mdDateLocaleProvider.months = ['Janeiro', 'Fefereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro' ];
                    $mdDateLocaleProvider.shortMonths = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
                    $mdDateLocaleProvider.days = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
                    $mdDateLocaleProvider.shortDays = ['D','S', 'T', 'Q', 'Q', 'S', 'S'];

                    // Can change week display to start on Monday.
                    $mdDateLocaleProvider.firstDayOfWeek = 1;

                    // Optional.
                    // $mdDateLocaleProvider.dates = [1, 2, 3, 4, 5, 6, ...];
                    $mdDateLocaleProvider.formatDate = function(date) {

                        var day = date.getDate();
                        var monthIndex = date.getMonth();
                        var year = date.getFullYear();
                    
                        return day + '/' + (monthIndex + 1) + '/' + year;
                    
                      };


                      $mdThemingProvider.definePalette('localdecor', {
                        '50': 'e2e4ef',
                        '100': 'b6bbd7',
                        '200': '868ebc',
                        '300': '5561a1',
                        '400': '303f8c',
                        '500': '0c1d78',
                        '600': '0a1a70',
                        '700': '081565',
                        '800': '06115b',
                        '900': '030a48',
                        'A100': '7c83ff',
                        'A200': '4953ff',
                        'A400': '1623ff',
                        'A700': '000dfc',
                        'contrastDefaultColor': 'light',
                        'contrastDarkColors': [
                          '50',
                          '100',
                          '200',
                          'A100'
                        ],
                        'contrastLightColors': [
                          '300',
                          '400',
                          '500',
                          '600',
                          '700',
                          '800',
                          '900',
                          'A200',
                          'A400',
                          'A700'
                        ]
                      });
                      
                    $mdThemingProvider.definePalette('florestal', {
                        '50': 'edf5ea',
                        '100': 'd2e5ca',
                        '200': 'b5d4a7',
                        '300': '97c284',
                        '400': '80b569',
                        '500': '6aa84f',
                        '600': '62a048',
                        '700': '57973f',
                        '800': '4d8d36',
                        '900': '3c7d26',
                        'A100': 'cdffbe',
                        'A200': 'a6ff8b',
                        'A400': '7fff58',
                        'A700': '6cff3f',
                        'contrastDefaultColor': 'light',
                        'contrastDarkColors': [
                          '50',
                          '100',
                          '200',
                          '300',
                          '400',
                          '500',
                          '600',
                          'A100',
                          'A200',
                          'A400',
                          'A700'
                        ],
                        'contrastLightColors': [
                          '700',
                          '800',
                          '900'
                        ]
                      });
                      $mdThemingProvider.theme('localdecor').primaryPalette('localdecor').accentPalette('localdecor').warnPalette('localdecor');
                      $mdThemingProvider.theme('default').primaryPalette('florestal').accentPalette('florestal').warnPalette('florestal');
                    $mdThemingProvider.alwaysWatchTheme(true);
                    
                    $routeProvider.when(
                        '/home', {
                            templateUrl: './app/features/login/login.html',
                            controller: 'HomeCtrl',
                            controllerAs: 'lg'
                        }
                    )
                    .when(
                        '/caixa', {
                            templateUrl: './app/features/caixa/caixa.html',
                            controller: 'VendasCtrl',
                            controllerAs: 'cx'
                        }
                    )
                    .when(
                        '/nfe', {
                            templateUrl: './app/features/nfe/nfe.html',
                            controller: 'NfeCtrl',
                            controllerAs: 'nf'
                        }
                    )
                    .when(
                        '/fechamento', {
                            templateUrl: './app/features/fechamento/fechamento.html',
                            controller: 'FechamentoCtrl',
                            controllerAs: 'fech'
                        }
                    )                                           ;
                    $routeProvider.otherwise({redirectTo: '/home'});
                }
            ]
        );
})();