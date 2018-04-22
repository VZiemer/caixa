(function () {
  'use strict';
  const bemafi = require('./Bemafi32.js');
  const NFe = require('./NFE.js');
  // const mp2032 = require('./Mp2032.js');
  const electron = require('electron');
  const Pagto = require('./pagamentos');
  const dinheiro = require('./dinheiro');
  const venda = require('./venda');
  const fs = require('fs');


  // teste socket

  // var io = require('socket.io-client'),
  //   socket = io.connect('localhost', {
  //     port: 3434
  //   });
  // socket.on('connect', function () { console.log("socket connected"); });
  // socket.on('error', function () { console.log("socket erro"); });
  // socket.emit('private message', { user: 'me', msg: 'whazzzup?' });


  const remote = require('electron').remote;
  angular.module('ventronElectron').controller('VendasCtrl', VendasCtrl);
  VendasCtrl.$inject = ['$scope', '$q', 'VendaSrvc', '$mdDialog', '$location'];
  function VendasCtrl($scope, $q, VendaSrvc, $mdDialog, $location) {

    $scope.param = remote.getGlobal('dados').param;
    const screenElectron = electron.screen;
    $scope.mainScreen = screenElectron.getPrimaryDisplay().workAreaSize.height;
    $scope.venda = new venda()
    console.log($scope.venda)
    $scope.alteraValor = function (ev, produto, index) {
      console.log(produto);
      $mdDialog.show({
        controller: alteraValorCtrl,
        templateUrl: './app/features/janelas/alteraValor.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        focusOnOpen: true,
        clickOutsideToClose: true,
        multiple: true,
        fullscreen: false, // Only for -xs, -sm breakpoints.,
        locals: {
          produto: produto,
          index: index
        }
      })
        .then(function (response, index) {
          var valor = response.VALOR;
          console.log(response)
          console.log(valor)
          response.VALOR = response.VALOR.valor;
          $scope.await = 'carregando...';
          VendaSrvc.atualizaProdVenda(response).then(function (response) {
            console.log(response)
            $scope.venda = response
            $scope.await = ''
          });
          console.log(valor);
        }, function () {
          console.log('You cancelled the dialog.');
        });
    };
    function geraNFCtrl($scope, $mdDialog, locals) {
      $scope.Faturas = [];
      $scope.Vendas = [];
      $scope.Venda = {
        BAIRRO: '',
        CEP: '',
        CGC: '',
        CIDADE: '',
        CODCLI: '',
        CODIBGE: '',
        CODCIDADE: '',
        COMPLEMENTO: '',
        DESCONTO: 0,
        EMAIL: '',
        ENDERECO: '',
        ESTADO: '',
        FONE: '',
        FRETE: 0,
        INSC: '',
        LCTO: '',
        NUMERO: '',
        RAZAO: '',
        SEGURO: 0,
        TOTAL: 0,
        PAGAR: 0
      };
      $scope.prodNotas = [];
      $scope.carregaVenda = function (venda) {
        console.log("aaaaa")
        $scope.await = 'carregando...'
        VendaSrvc.vendaNota(venda).then(function (response) {
          $scope.await = ''
          console.log(response)
          // $scope.Vendas.push(response[0][0])
          if (!$scope.Venda.LCTO) {
            $scope.Venda.BAIRRO = response[0][0].BAIRRO,
              $scope.Venda.CEP = response[0][0].CEP,
              $scope.Venda.CGC = response[0][0].CGC,
              $scope.Venda.CIDADE = response[0][0].CIDADE,
              $scope.Venda.CODCLI = response[0][0].CODCLI,
              $scope.Venda.CODIBGE = response[0][0].CODIBGE,
              $scope.Venda.CODCIDADE = response[0][0].CODCIDADE,
              $scope.Venda.COMPLEMENTO = response[0][0].COMPLEMENTO,
              $scope.Venda.DESCONTO = response[0][0].DESCONTO,
              $scope.Venda.EMAIL = response[0][0].EMAIL,
              $scope.Venda.ENDERECO = response[0][0].ENDERECO,
              $scope.Venda.ESTADO = response[0][0].ESTADO,
              $scope.Venda.FONE = response[0][0].FONE,
              $scope.Venda.INSC = response[0][0].INSC,
              $scope.Venda.LCTO = response[0][0].LCTO,
              $scope.Venda.NUMERO = response[0][0].NUMERO,
              $scope.Venda.RAZAO = response[0][0].RAZAO,
              $scope.Venda.SEGURO = response[0][0].SEGURO,
              $scope.Venda.TOTAL = response[0][0].TOTAL,
              $scope.Venda.FRETE = response[0][0].FRETE,
              $scope.Venda.VOLUMES = response[0][0].VOLUMES,
              $scope.Venda.PESO = response[0][0].PESO,
              $scope.Venda.TRANSPORTADOR = response[0][0].TRANSPORTADOR,
              $scope.Venda.CODTRANSP = response[0][0].CODTRANSP,
              $scope.Venda.TIPOFRETE = response[0][0].TIPOFRETE
          }
          response[0].forEach(function (valor, index, array) {
            if (valor.CODBAN == 109 || valor.CODBAN == 209) {
              $scope.Faturas.push({ 'valor': valor.VALOR, 'vencimento': valor.VENCIMENTO })
            }
          })
          response[1].forEach(function (valor, index, array) {
            $scope.prodNotas.push(valor)
          })
          console.log($scope.Vendas)
          console.log($scope.prodNotas)
        })
        $scope.venda = '';
      }
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.ok = function () {
        console.log('aa')
        console.log($scope.prodNotas)
        $mdDialog.hide([$scope.prodNotas, $scope.Venda, $scope.Faturas]);
      };
      // $scope.InserePgto = function (ev, pagto) {
      //   // console.log(pagto)
      //   $mdDialog.show({
      //     controller: inserePgtoCtrl,
      //     templateUrl: './app/features/janelas/inserePgto.tmpl.html',
      //     parent: angular.element(document.body),
      //     targetEvent: ev,
      //     focusOnOpen: true,
      //     clickOutsideToClose: true,
      //     multiple: true,
      //     fullscreen: false, // Only for -xs, -sm breakpoints.,
      //     locals: {
      //       venda: $scope.venda,
      //       fpagto: pagto
      //     }
      //   })
      //     .then(function (pgto) {
      //       console.log(pgto);
      //       Array.prototype.push.apply($scope.Faturas, Pagto.Pagamentos(pgto.VALORAPAGAR, pgto.VALORPARCELA, pgto.PARCELAS, pgto.TIPO, pgto.PERIODO, pgto.CODBAN, pagto.BANCO, pagto.AGENCIA, pagto.CONTA, pagto.NRCHEQUE, pagto.VENCTO, pagto.EMNOME));
      //       console.log("entrou pagamento");
      //       console.log($scope.Faturas)
      //     }, function () {
      //       console.log('You cancelled the dialog.');
      //     });
      // };
    }
    function alteraValorCtrl($scope, $mdDialog, locals) {
      $scope.produto = locals.produto;
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.paga = function (produto) {
        $mdDialog.hide($scope.produto, locals.index);
      };
    }
    $scope.alteraValorVenda = function (ev) {
      $mdDialog.show({
        controller: alteraValorVendaCtrl,
        templateUrl: './app/features/janelas/alteraValorVenda.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        focusOnOpen: true,
        clickOutsideToClose: false,
        multiple: true,
        fullscreen: false, // Only for -xs, -sm breakpoints.,
        locals: {
        }
      })
        .then(function (valor) {
          console.log('alteravalorvenda');
          $scope.await = 'aplicando desconto...'
          VendaSrvc.descontoTotalVenda($scope.venda.LCTO, valor).then(function (response) {
            $scope.prodVenda = response;
            $scope.totals();
            $scope.await = ''
          })
        }, function () {
          console.log('You cancelled the dialog.');
        });
    };
    function alteraValorVendaCtrl($scope, $mdDialog, locals) {
      $scope.VALOR = 0;
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.desconto = function () {
        $mdDialog.hide($scope.VALOR);
      };
    }
    function puxaLocalCtrl($scope, $mdDialog, locals) {
      // $scope.param = remote.getGlobal('dados').param;
      $scope.pedido = '';
      //controla o modal que faz o pagamento
      // $scope.venda = locals.dados;  
      $scope.hide = function () {
        $mdDialog.hide($scope.pedido);
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
    }
    function PesquisaVendaFechamentoCtrl($scope, $mdDialog, locals) {
      // $scope.param = remote.getGlobal('dados').param;
      //controla o modal que pesquisa vendas
      $scope.status = locals.status;
      $scope.prodVendas = [];
      console.log(locals);
      $scope.dados = locals.dados;
      $scope.selected = [];
      $scope.query = {
        order: 'LCTO',
        limit: 5,
        page: 1
      };
      $scope.voltaVenda = function (pedido) {
        var status = 'A';
        var dados = [pedido.CODCLI, pedido.NOMECLI, pedido.CODVEND, pedido.OBS, status, pedido.LCTO];
        VendaSrvc.atualizaVenda(dados).then(function (response) {
          VendaSrvc.listaVendas('C').then(function (response) {
            $scope.dados = response.data;
            $scope.prodVendas = [];
          })
        });
      }
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.seleciona = function () {
        $mdDialog.hide($scope.selected);
      };
    }
    function PesquisaVendaCtrl($scope, $mdDialog, locals) {
      // $scope.param = remote.getGlobal('dados').param;
      //controla o modal que pesquisa vendas
      $scope.status = locals.status;
      $scope.prodVendas = [];
      console.log(locals);
      $scope.dados = locals.dados;
      $scope.selected = [];
      $scope.$watch("selected[0].LCTO", function (newValue, oldValue) {
        $scope.await = 'carregando...'
        console.log(newValue)
        if (newValue) {
          VendaSrvc.listaProdVenda(newValue).then(function (response) {
            $scope.prodVendas = response;
            console.log($scope.prodVendas);
            $scope.await = ''
          })
        }
      });
      $scope.query = {
        order: 'LCTO',
        limit: 5,
        page: 1
      };
      $scope.voltaVenda = function (pedido) {
        var status = 'A';
        var dados = [pedido.CODCLI, pedido.NOMECLI, pedido.CODVEND, pedido.OBS, status, pedido.LCTO];
        VendaSrvc.atualizaVenda(dados).then(function (response) {
          VendaSrvc.listaVendas('C').then(function (response) {
            $scope.dados = response.data;
            $scope.prodVendas = [];
          })
        });
      }
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.seleciona = function (pedido) {
        $mdDialog.hide(pedido);
      };
    }
    function buscaCtrl($scope, $mdDialog) {
      $scope.param = remote.getGlobal('dados').param;
      //controla o modal que faz o pagamento
      $scope.mainScreen = screenElectron.getPrimaryDisplay().size.height;
      $scope.selected = [];
      $scope.query = {
        order: 'RAZAO',
        limit: 5,
        page: 1
      };
      $scope.listaCli = '';
      $scope.cliente = { 'CODIGO': '', 'RAZAO': '' };
      console.log($scope.cliente);
      $scope.pesquisacliente = function () {
        VendaSrvc.buscaCliente($scope.cliente).then(
          function (response) {
            $scope.listaCli = response.data;
            console.log(response.data);
          });
      };
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.seleciona = function (cliente) {
        $mdDialog.hide(cliente);
      };
    }
    function insereCPFCtrl($scope, $mdDialog, locals) {
      // $scope.param = remote.getGlobal('dados').param;
      $scope.cliente = locals.venda.CGC;
      //controla o modal que faz o pagamento
       
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
    }
    function inserePgtoCtrl($scope, $mdDialog, locals) {  //controla o modal que faz o pagamento
      $scope.param = remote.getGlobal('dados').param;
      // $scope.venda = locals.dados;
      console.log(locals.venda)
      $scope.max = new dinheiro(locals.venda.PAGAR.valor);
      let maxparc = Math.floor(new dinheiro(locals.venda.PAGAR.valor) / locals.fpagto.PARCELA_MIN + 1)
      console.log(maxparc)
      $scope.parcelas = [1];
      for (let i = 2; i <= maxparc && maxparc > 0; i++) {
        $scope.parcelas.push(i)
      }
      $scope.pagamento = locals.fpagto;
      $scope.pagamento.VALORAPAGAR = new dinheiro(locals.venda.PAGAR);
      $scope.pagamento.PARCELAS = 1;
      $scope.pagamento.VALORPARCELA = new dinheiro(locals.venda.PAGAR.valor);
      $scope.venda = locals.venda;
      var Valor = new dinheiro(locals.venda.PAGAR.valor);
      if (locals.fpagto.TIPO == 'DI') { $scope.max = new dinheiro(locals.venda.PAGAR.valor).soma(100) };
      if (locals.fpagto.TIPO == 'VL') {
        if ($scope.max < $scope.pagamento.VALORAPAGAR) $scope.pagamento.VALORAPAGAR = $scope.max;
      }
      $scope.calculaParcela = function (parcelas, valortotal) {
        console.log(parcelas)
        console.log(valortotal)
        var valor = new dinheiro(valortotal / parcelas);
        return valor;
        console.log(valor);
      }
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.paga = function (pagamento) {
        if (pagamento.VALORAPAGAR > Valor) pagamento.VALORAPAGAR = Valor;
        var valor = new dinheiro(pagamento.VALORAPAGAR / pagamento.PARCELAS);
        pagamento.VALORPARCELA = valor
        $mdDialog.hide(pagamento);
      };
    }
    function PagamentoCtrl($scope, $mdDialog, locals, $timeout) {  //controla o modal que faz o pagamento
      $scope.hoje = new Date();
      $scope.acao = locals.acao
      $scope.param = remote.getGlobal('dados').param;
      $scope.await = 'carregando...'
      VendaSrvc.formasPagamento().then(
        function (response) {
          console.log(response.data);
          $scope.FormaPagto = response.data
          // $scope.await = ''
        })
      VendaSrvc.valeCliente(locals.dados.CODCLI).then(function (response) {
        if (locals.acao = 'V') {
          $scope.vale = response.reduce(function (acumulador, atual) {
            if (atual.ENT_SAI == 'S') { atual.TOTAL = atual.TOTAL * (-1) }
            return acumulador += atual.TOTAL;
          }, 0);
        }
        if (locals.acao = 'F') {
          $scope.vale = response.filter(function (item) {
            if (item.ENT_SAI == 'S') { return item }
          })[0].TOTAL + locals.descontoitem;
        }
        console.log($scope.vale)
      })
      $scope.venda = locals.dados;
      console.log($scope.venda);
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.seleciona = function (pedido) {
        $mdDialog.hide(pedido);
      };
      $scope.imprime = async function (venda) {
        var html = "<html><head><style>@page { size: portrait;margin: 1%; }table,td,tr,span{font-size:8pt;font-family:Arial;}table {width:80mm;}td {min-width:2mm;}hr{border-top:1pt dashed #000;} </style></head><body ng-controller='BaixaController'>"
        var conteudo = "<span>DOCUMENTO SEM VALOR FISCAL</span><hr><span class='pull-left'>" + remote.getGlobal('dados').configs.empresa + "</span><br><span class='pull-left'>Pedido: " + venda.LCTO + "   Emissão: " + new Date().toLocaleDateString() + "</span><br><span>Cliente: " + venda.NOMECLI + "</span><br><span>Cod. Cliente" + venda.CODCLI + "</span><br><span>Vendedor: " + venda.NOMEVEND + "</span><br>"
        conteudo += "<span>Forma de Pagamento--------------------------------</span><br>"
        conteudo += "<table>"
        // $timeout(function () {
        for (let x of venda.PAGAMENTO) {
          conteudo += "<tr><td colspan='3'>" + x.vencimento.toLocaleDateString() + "</td><td>" + x.valor.toString() + "</td><td>" + x.tipo + "</td><td colspan='3'> </td></tr>"
        }
        conteudo += "</table><hr><table><tr><td colspan='8'>Descricao<td></tr><tr><td></td><td>Qtd</td><td>UN</td><td colspan='3'>Código</td><td>Vl. Unit.</td><td>Subtotal</td>"
        for (let x of venda.PRODUTOS) {
          if (!x.QTDRESERVA)
            conteudo += "<tr><td colspan='8'>" + x.DESCRICAO + "</td></tr><tr><td></td><td>" + x.QTD + "</td><td>" + x.UNIDADE + "</td><td colspan='3'>" + x.CODIGO + "</td><td>" + x.VALOR.toString() + "</td><td>" + x.TOTAL.toString() + "</td></tr>"
        };
        venda.PRODUTOS.every(function (element, index) {
          if (element.QTDRESERVA) {
            conteudo += "<tr><td colspan='8'>ITENS DE ENCOMENDA</td</tr>";
            return false
          }
          else return true
        })

        venda.PRODUTOS.forEach(function (x, index) {
          if (x.QTDRESERVA)
            conteudo += "<tr><td colspan='8'>" + x.DESCRICAO + "</td></tr><tr><td></td><td>" + x.QTD + "</td><td>" + x.UNIDADE + "</td><td colspan='3'>" + x.CODIGO + "</td><td>" + x.VALOR.toString() + "</td><td>" + x.TOTAL.toString() + "</td></tr>"
        });
        conteudo += "</table><br><span class='pull-right'>Total Produtos: " + venda.TOTAL.toString() + "</span>"
        conteudo += "<br><br><span>CONFERENTE.________________________________</span><br>"
        conteudo += "<br><br><span>ASS._______________________________________</span><br><br><br><br><br>"
        conteudo += conteudo;
        html += conteudo + "</body></html>"
        // }, 1000, false).then(function () {
        const janela = await fs.writeFile('c:/temp/teste.html', html, (err) => {
          if (err) throw err;
          let modal = window.open('', 'modal')
          console.log('The file has been saved!');
        });
        $scope.venda = new Venda()
        // });
      }
      $scope.concluirCupom = async function () {
        $scope.await = 'Imprimindo Cupom...'
        const Ncupom = await bemafi.gravaECF($scope.venda);
        console.log(Ncupom);
        $scope.venda.insereNucupom(Ncupom)
        $scope.await = 'Confirmando Venda...'
        VendaSrvc.confirmaVenda($scope.venda).then(function (response) {
          $scope.imprime($scope.venda); $mdDialog.hide(); console.log(response)
        });
        $scope.await = ''
      }
      $scope.nfFech = function () {
        let faturas = $scope.venda.PAGAMENTO.filter(function (item, index) {
          if (item.tipo == 'BL') { return item }
        })
        let pgtoAvista = $scope.venda.PAGAMENTO[0].valor.valueOf()
        NFe.iniciaNota($scope.venda, $scope.venda.PRODUTOS, faturas, pgtoAvista)
      }
      $scope.concluirFech = function () {
        VendaSrvc.confirmaFechamento($scope.venda).then(function (response) {
          alert('pedido confirmado'); $mdDialog.hide();
          // $scope.imprime($scope.venda); $mdDialog.hide(); console.log(response)
          console.log(response)
        });

      }
      $scope.emitirCupom = function () {
        VendaSrvc.confirmaVenda($scope.venda).then(function (response) {
          bemafi.gravaECF(
            {
              'Cliente': $scope.venda.CGC || '',
              'produtos': $scope.venda.PRODUTOS,
              'pagamento': $scope.venda.TOTAL,
              'codvenda': $scope.venda.LCTO,
              'empresa': remote.getGlobal('dados').configs.empresa
            });
          $scope.imprime($scope.venda); $mdDialog.hide(); console.log(response)
        });
      }
      $scope.concluir = function () {
        VendaSrvc.confirmaVenda($scope.venda).then(function (response) {
          $scope.imprime($scope.venda); $mdDialog.hide(); console.log(response)
        });
      }
      $scope.insereCPF = function (ev) {
        $mdDialog.show({
          controller: insereCPFCtrl,
          templateUrl: './app/features/janelas/InsereCPF.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          focusOnOpen: true,
          clickOutsideToClose: true,
          multiple: true,
          fullscreen: false, // Only for -xs, -sm breakpoints.,
          locals: {
            'venda': $scope.venda
          }
        })
          .then(function (valor) {
            $scope.venda.CGC = valor;
            console.log(valor);
          }, function () {
            console.log('You cancelled the dialog.');
          });
      };
      $scope.InserePgto = function (ev, pagto) {
        $scope.periodo = pagto.PERIODO;
        $mdDialog.show({
          controller: inserePgtoCtrl,
          templateUrl: './app/features/janelas/inserePgto.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          focusOnOpen: true,
          clickOutsideToClose: true,
          multiple: true,
          fullscreen: false, // Only for -xs, -sm breakpoints.,
          locals: {
            venda: $scope.venda,
            fpagto: pagto
          }
        })
          .then(function (pgto) {
            console.log(pgto);
            $scope.venda.PAGAR.subtrai(pgto.VALORAPAGAR);
            Array.prototype.push.apply($scope.venda.PAGAMENTO, Pagto.Pagamentos(pgto.VALORAPAGAR, pgto.VALORPARCELA, pgto.PARCELAS, pgto.TIPO, pgto.PERIODO, pgto.CODBAN, pagto.BANCO, pagto.AGENCIA, pagto.CONTA, pagto.NRCHEQUE, pagto.VENCTO, pagto.EMNOME));
            console.log("entrou pagamento");
            console.log($scope.venda)
          }, function () {
            console.log('You cancelled the dialog.');
          });
      };
    }
    var cx = this;
    cx.codbar = '';
    cx.numerocupom = function () {
      console.log(bemafi.nuCupom());
    }
    cx.keys = {
      ENTER: function (name, code) { if (cx.codbar) { cx.insereproduto(cx.codbar); cx.codbar = '' } },
      A: function (name, code) { cx.codbar += name },
      ZERO: function (name, code) { if (cx.codbar) cx.codbar += '0' },
      ONE: function (name, code) { if (cx.codbar) cx.codbar += '1' },
      TWO: function (name, code) { if (cx.codbar) cx.codbar += '2' },
      THREE: function (name, code) { if (cx.codbar) cx.codbar += '3' },
      FOUR: function (name, code) { if (cx.codbar) cx.codbar += '4' },
      FIVE: function (name, code) { if (cx.codbar) cx.codbar += '5' },
      SIX: function (name, code) { if (cx.codbar) cx.codbar += '6' },
      SEVEN: function (name, code) { if (cx.codbar) cx.codbar += '7' },
      EIGHT: function (name, code) { if (cx.codbar) cx.codbar += '8' },
      NINE: function (name, code) { if (cx.codbar) cx.codbar += '9' },
      NUMPAD_0: function (name, code) { if (cx.codbar) cx.codbar += '0' },
      NUMPAD_1: function (name, code) { if (cx.codbar) cx.codbar += '1' },
      NUMPAD_2: function (name, code) { if (cx.codbar) cx.codbar += '2' },
      NUMPAD_3: function (name, code) { if (cx.codbar) cx.codbar += '3' },
      NUMPAD_4: function (name, code) { if (cx.codbar) cx.codbar += '4' },
      NUMPAD_5: function (name, code) { if (cx.codbar) cx.codbar += '5' },
      NUMPAD_6: function (name, code) { if (cx.codbar) cx.codbar += '6' },
      NUMPAD_7: function (name, code) { if (cx.codbar) cx.codbar += '7' },
      NUMPAD_8: function (name, code) { if (cx.codbar) cx.codbar += '8' },
      NUMPAD_9: function (name, code) { if (cx.codbar) cx.codbar += '9' },
      F3: function (name, code) { cx.abreVendas('', 'C', 'V') },
      F4: function (name, code) { cx.abreVendas('', 'R', 'V') },
      F6: function (name, code) { cx.abreVendasFechamento('', 'F') },
      F5: function (name, code) { cx.Pagar() }
    };
    cx.puxaLocal = function (ev) {
      $mdDialog.show({
        controller: puxaLocalCtrl,
        templateUrl: './app/features/janelas/PuxaLocal.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        focusOnOpen: true,
        clickOutsideToClose: true,
        multiple: true,
        fullscreen: false, // Only for -xs, -sm breakpoints.,
        locals: {}
      })
        .then(function (valor) {
          VendaSrvc.puxaLocal(valor).then(function () { alert("pedido Puxado") })
        }, function () {
          console.log('You cancelled the dialog.');
        });
    };
    cx.NFe = function (ev) {
      $mdDialog.show({
        controller: geraNFCtrl,
        templateUrl: './app/features/janelas/selecionaNF.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        focusOnOpen: true,
        clickOutsideToClose: true,
        multiple: true,
        fullscreen: false, // Only for -xs, -sm breakpoints.,
        locals: {}
      })
        .then(function (response) {
          console.log(response)
          NFe.iniciaNota(response[1], response[0], response[2]);
        }, function () {
          console.log('You cancelled the dialog.');
        });
    };
    cx.abreVendas = function (ev, status, acao) {
      $scope.acao = acao
      $scope.venda = [];
      $scope.prodVenda = [];
      VendaSrvc.listaVendas(status).then(function (response) {
        cx.desserts = response.data;
        $mdDialog.show({
          controller: PesquisaVendaCtrl,
          templateUrl: './app/features/janelas/selecionaVenda.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: true, // Only for -xs, -sm breakpoints.,
          locals: {
            dados: response.data,
            status: status
          }
        })
          .then(function (pedido) {
            var status = 'C';
            var dados = [pedido.CODCLI, pedido.NOMECLI, pedido.CODVEND, pedido.OBS, status, pedido.LCTO];
            VendaSrvc.atualizaVenda(dados).then(function (res) {
              // $scope.venda=new venda(res.LCTO,res.ID_TRANSITO,res.CGC,res.INSC,res.CODCLI,res.NOMECLI,res.EMAIL,res.FONE,res.RAZAO,res.ENDERECO,res.NUMERO,res.BAIRRO,res.CEP,res.CODIBGE,res.CODCIDADE,res.CIDADE,res.ESTADO,res.COMPLEMENTO,res.DESCONTO,res.FRETE,res.SEGURO,res.TOTAL );
              $scope.venda = res;
              // VendaSrvc.retornaprodVenda().forEach(function(item){$scope.venda.insereProduto(item)});
              console.log($scope.venda)
            });
          }, function () {
            console.log('You cancelled the dialog.');
          });

      });
    };



    cx.abreVendasFechamento = function (ev, acao) {
      $scope.acao = acao;
      $scope.venda = [];
      $scope.prodVenda = [];
      VendaSrvc.CarregaFechamento().then(function (response) {
        cx.desserts = response.data;
        $mdDialog.show({
          controller: PesquisaVendaFechamentoCtrl,
          templateUrl: './app/features/janelas/selecionaVendaFechamento.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          fullscreen: true, // Only for -xs, -sm breakpoints.,
          locals: {
            dados: response,
            status: status
          }
        })
          .then(function (vendas) {
            // var dados = [pedido.CODCLI, pedido.NOMECLI, pedido.CODVEND, pedido.OBS, status, pedido.LCTO];
            VendaSrvc.carregaNPcli(vendas).then(function (res) {
              // $scope.venda=new venda(res.LCTO,res.ID_TRANSITO,res.CGC,res.INSC,res.CODCLI,res.NOMECLI,res.EMAIL,res.FONE,res.RAZAO,res.ENDERECO,res.NUMERO,res.BAIRRO,res.CEP,res.CODIBGE,res.CODCIDADE,res.CIDADE,res.ESTADO,res.COMPLEMENTO,res.DESCONTO,res.FRETE,res.SEGURO,res.TOTAL );
              $scope.venda = res;
              // VendaSrvc.retornaprodVenda().forEach(function(item){$scope.venda.insereProduto(item)});
              console.log($scope.venda)
            });
          }, function () {
            console.log('You cancelled the dialog.');
          });

      });
    };
    cx.insereproduto = function (codbar) {
      console.log(codbar);
      VendaSrvc.inserePacote(codbar).then(
        function (response) {
          console.log(response)
        });
    };
    cx.Logout = function () {
      $location.path('/login');
    }
    cx.leiturax = function (ev) {
      console.log(bemafi.leituraX())
    }
    cx.reducaoZ = function (ev) {
      console.log(bemafi.reducaoZ())
    }
    cx.acertaHora = function (ev) {
      console.log(bemafi.acertaHora())
    }
    cx.novaVenda = function (ev) {
      $mdDialog.show({
        controller: buscaCtrl,
        templateUrl: './app/features/janelas/busca.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: true
      })
        .then(function (cliente) {
          var status = 'C';
          var dados = [cliente.CODIGO, cliente.RAZAO, venda.CODVEND, $scope.venda.OBS, status, $scope.venda.LCTO];
          VendaSrvc.atualizaVenda(dados).then(function (response) {
            $scope.venda = response;
          });
        }, function () {
          console.log('You cancelled the dialog.');
        });
    }
    cx.Pagar = function (ev) {
      $mdDialog.show({
        controller: PagamentoCtrl,
        templateUrl: './app/features/janelas/Pagamento.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: true, // Only for -xs, -sm breakpoints.,
        locals: {
          dados: $scope.venda,
          acao: $scope.acao,
          descontoitem: $scope.venda.DESCONTOITEM
        }
      })
        .then(function () {
          $scope.venda = {
            'LCTO': null,
            'DATA': '',
            'CODCLI': '',
            'NOMECLI': '',
            'CODVEND': '',
            'NOMEVEND': '',
            'OBS': '',
            'STATUS': ''
          };
          $scope.prodVenda = [];
        }, function () {
          console.log('You cancelled the dialog.');
        });
    };
    // cx.SelecionaVenda = function(venda) {
    //     cx.selecteder = this.item;
    //     console.log($scope.selected);
    //     VendaSrvc.listaProdVenda(venda).then(function(response){
    //       cx.ListaProduto = response;
    //     });             
    // }; 
  };
})();