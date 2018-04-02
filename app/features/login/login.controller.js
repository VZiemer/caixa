(function() {
'use strict';

    angular
        .module('ventronElectron')
        .controller('HomeCtrl', HomeController);

    HomeController.$inject = ['$scope','$location', '$mdSidenav', '$mdToast','$mdDialog','LoginSrvc'];
    function HomeController($scope,$location,$mdSidenav,$mdToast,$mdDialog,LoginSrvc) {
        const remote = require('electron').remote;
        remote.getGlobal('dados').configs.usuario='';
        remote.getGlobal('dados').configs.senha='';
        remote.getGlobal('dados').configs.empresa='';
        var lg = this;
        lg.Login = login;
        lg.dados = remote.getGlobal('dados').configs;
        console.log (lg.dados)
        function login(ev){
            console.log (lg.dados)
            LoginSrvc.login(lg.dados).then(function(response){
                console.log(response.data);
                if (response.data.message == 'Acesso Liberado') {
                    if (lg.dados.empresa == 2) {
                        // vm.theme = 'localdecor'
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