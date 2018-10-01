(function () {
    'use strict';
    angular
        .module('ventronElectron')
        .controller('HomeCtrl', HomeController);
    HomeController.$inject = ['$rootScope', '$scope', '$location', '$mdSidenav', '$mdToast', '$mdDialog', 'LoginSrvc'];
    function HomeController($rootScope, $scope, $location, $mdSidenav, $mdToast, $mdDialog, LoginSrvc) {
        const remote = require('electron').remote;
        remote.getGlobal('dados').configs.usuario = '';
        remote.getGlobal('dados').configs.senha = '';
        remote.getGlobal('dados').configs.empresa = '';
        remote.getGlobal('dados').configs.razao = '';
        var lg = this;
        lg.Login = login;
        lg.dados = remote.getGlobal('dados').configs;
        function login(ev) {
            LoginSrvc.login(lg.dados).then(function (response) {
                if (response.data.message == 'Acesso Liberado') {
                    if (lg.dados.empresa === 1) {
                        remote.getGlobal('dados').configs.razao = 'FLORESTAL FERRAGENS';
                        $rootScope.NOMELOJA = 'FLORESTAL FERRAGENS';
                    }
                    if (lg.dados.empresa === 2) {
                        remote.getGlobal('dados').configs.razao = 'LOCALDECOR FERRAGENS';
                        $rootScope.NOMELOJA = 'LOCALDECOR FERRAGENS';
                    }
                    console.log($location.url());
                    $location.path('/caixa');
                }
            })
            // $mdDialog.show(
            //     $mdDialog.alert()
            //       .parent(angular.element(document.querySelector('#popupContainer')))
            //       .clickOutsideToClose(false)
            //       .title('This is an alert title')
            //       .textContent('You can specify some description text in here.')
            //       .ariaLabel('Alert Dialog Demo')
            //       .ok('Got it!')
            //       .targetEvent(ev)
            //   );
        }
        activate();

        ////////////////

        function activate() { }
    }
})();