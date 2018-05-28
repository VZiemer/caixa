(function () {
  

  Date.prototype.YYYYMMDD = function (){
    return this.toISOString().split('T')[0];
  }
  Date.prototype.dataFirebird = function() {
    return this.getDate() + '.' + (this.getMonth()+1) + '.' + this.getFullYear();
  }  

    let param = {
      success: '',
      dispositivo: '',
      message: '',
      token: '',
      admin:'',
      name: '',
      cod: '',
      menu: {
        Reserva: '',
        Ordem: '',
        Produto: '',
        Prod_Reserva: '',
        Cliente: '',
        Localdecor: '',
        Entrada: '',
        Entrega: ''
      },
      Reserva: {
        Atualiza: '',
        Imprime: '',
        Cancela: '',
        Registra: '',
        EntraEstoque: '',
        EntraReserva: '',
        EntraTransporte: '',
        EntregaPedido: '',
        LiberaSeparacao: '',
        ImprimeEstoque:'',
        FiltraVendedor: ''
      },
      Cliente: {
        Pesquisa: '',
        Cadastra: '',
        Edita: '',
        Pesquisa_vendas: '',
        Pesquisa_Historico: ''
      },
      Entrada: {
        Checar: ''
      }
    }
    'use strict';
    angular.module(
        'ventronElectron',
        [
            'ngRoute',
            'ngMaterial',
            'ngAnimate',
            'md.data.table',
            'fixed.table.header',
            'ui.utils.masks'
        ]
    );    
})();

angular
.module("ventronElectron")
.constant("keyCodes", {
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  0: 96,
  NUMPAD_1: 97,
  NUMPAD_2: 98,
  NUMPAD_3: 99,
  NUMPAD_4: 100,
  NUMPAD_5: 101,
  NUMPAD_6: 102,
  NUMPAD_7: 103,
  NUMPAD_8: 104,
  NUMPAD_9: 105,
  NUMPAD_MULTIPLY: 106,
  NUMPAD_ADD: 107,
  NUMPAD_ENTER: 108,
  NUMPAD_SUBTRACT: 109,
  NUMPAD_DECIMAL: 110,
  NUMPAD_DIVIDE: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  F13: 124,
  F14: 125,
  F15: 126,
  COLON: 186,
  EQUALS: 187,
  UNDERSCORE: 189,
  QUESTION_MARK: 191,
  TILDE: 192,
  OPEN_BRACKET: 219,
  BACKWARD_SLASH: 220,
  CLOSED_BRACKET: 221,
  QUOTES: 222,
  BACKSPACE: 8,
  TAB: 9,
  CLEAR: 12,
  ENTER: 13,
  SHIFT: 16,
  CONTROL: 17,
  ALT: 18,
  CAPS_LOCK: 20,
  ESC: 27,
  SPACEBAR: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  INSERT: 45,
  DELETE: 46,
  HELP: 47,
  NUM_LOCK: 144
});



angular
.module('ventronElectron')
.controller('AppCtrl', AppCtrl)
.directive("keyboard", keyboard);
// VendasCtrl.$inject = ['$scope', '$q', 'VendaSrvc', '$mdDialog', '$mdToast', '$location'];
function AppCtrl ($scope, $timeout, $mdSidenav,$location,VendaSrvc) {
  const bemafi = require('./Bemafi32.js');
  $scope.appVersion = window.require('electron').remote.app.getVersion()
  $scope.empresa = remote.getGlobal('dados').configs.razao;
  console.log ($scope.empresa)
  var vm = this;
  vm.theme = 'localdecor'
  vm.msgs = [];
  vm.keys = {
    ENTER    : function(name, code) { vm.msgs.push({ name: name, code: code}); alert(name)},
    ESC      : function(name, code) { vm.msgs.push({ name: name, code: code}) },
    SHIFT    : function(name, code) { vm.msgs.push({ name: name, code: code}) },
    SPACEBAR : function(name, code) { vm.msgs.push({ name: name, code: code}) },
    F5 : function(name, code) {alert ('aperto' + name)}
  };
  $scope.toggleLeft = buildToggler('left');
  $scope.toggleRight = buildToggler('right');
  $scope.janela = function(janela) {
    $location.url('/'+janela)
  };

$scope.tiraReducaoZ = function () {
  console.log(bemafi.reducaoZ())
}
$scope.cancelaCupom = async function (ev) {
  const cancela = await bemafi.cancelaCupom();
  console.log(cancela);
  if (cancela === 1) {
    VendaSrvc.cancelaCupom().then(function (response) {
      console.log(response)
    })
  }
  else {
    console.log('deu errado')
  }
}

  // $scope.apertatecla = function (e) {
  //     if ( !e.metaKey ) {
  //       e.preventDefault();
  //     }
  //     alert(e.keyCode);
  // }
  function buildToggler(componentId) {
    return function() {
      $mdSidenav(componentId).toggle();
    };
  }
};

function keyboard($document, keyCodes) {
  
    return {
      link: function(scope, element, attrs) {
  
        var keysToHandle = scope.$eval(attrs.keyboard);
        var keyHandlers  = {};
        
        // Registers key handlers
        angular.forEach(keysToHandle, function(callback, keyName){
          var keyCode = keyCodes[keyName];
          keyHandlers[keyCode] = { callback: callback, name: keyName };
        });
        // Bind to document keydown event
        $document.on("keydown", function(event) {        
          var keyDown = keyHandlers[event.keyCode];
          // Handler is registered
          if (keyDown) {
            // event.preventDefault();
            // Invoke the handler and digest
            scope.$apply(function() {
              keyDown.callback(keyDown.name, event.keyCode);
              console.log (keyDown.name);
            })
          }
        });
      }
    };
  }



  