(function () {
  'use strict';
  const bemafi = require('./Bemafi32.js');
  const nfe = require('nfejs'),
    firebird = require('node-firebird'),
    conexao = require('./db'),
    NFe = nfe.NFe,
    Gerador = nfe.Gerador,
    Danfe = nfe.Danfe,
    Emitente = nfe.Emitente,
    Destinatario = nfe.Destinatario,
    Transportador = nfe.Transportador,
    Endereco = nfe.Endereco,
    Protocolo = nfe.Protocolo,
    Impostos = nfe.Impostos,
    Volumes = nfe.Volumes,
    Duplicata = nfe.Duplicata,
    Item = nfe.Item,
    Icms = nfe.Icms,
    GravaBanco = nfe.Gravabanco,
    Pagamento = nfe.Pagamento;







  //cria as variáveis necessárias
  var emitente = new Emitente();
  var destinatario = new Destinatario();
  var transportador = new Transportador();
  var volumes = new Volumes();
  var danfe = new NFe();

  function zeroEsq(valor, comprimento, digito) {
    var length = comprimento - valor.toString().length + 1;
    return Array(length).join(digito || '0') + valor;
  };


  // const mp2032 = require('./Mp2032.js');
  const electron = require('electron');
  const Pagto = require('./pagamentos');
  const dinheiro = require('./dinheiro');
  const venda = require('./venda');
  const fs = require('fs');
  const nodemailer = require('nodemailer');







  const remote = require('electron').remote;
  angular.module('ventronElectron').controller('VendasCtrl', VendasCtrl);
  VendasCtrl.$inject = ['$scope', '$q', 'VendaSrvc', '$mdDialog', '$mdToast', '$location'];
  function VendasCtrl($scope, $q, VendaSrvc, $mdDialog, $mdToast, $location) {
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
          VendaSrvc.atualizaProdVenda(response).then(function (response) {
            console.log(response)
            $scope.venda = response
          });
          console.log(valor);
        }, function () {
          console.log('You cancelled the dialog.');
        });
    };
    function geraNFCtrl($scope, $mdDialog, $mdToast, locals) {

      // funções de criação da nota

      function dadosEmitente(empresa, venda) {
        return new Promise((resolve, reject) => {
          firebird.attach(conexao, function (err, db) {
            if (err) throw err;
            db.query('select p.crt,c.razao,c.cgc,c.insc,c.endereco,c.bairro,c.cep,c.fone,c.email,ci.nom_cidade as cidade,ci.codibge,ci.estado from param p  join cliente c on p.codparc = c.codigo  join cidade ci on c.codcidade = ci.cod_cidade where p.codigo=?', empresa, function (err, result) {
              if (err) throw err;
              db.detach(function () {
                emitente.comNome(result[0].RAZAO)
                  .comRegistroNacional(result[0].CGC)
                  .comInscricaoEstadual(result[0].INSC)
                  .comTelefone(result[0].FONE)
                  .comEmail(result[0].EMAIL)
                  .comCrt(result[0].CRT)
                  .comEndereco(new Endereco()
                    .comLogradouro(result[0].ENDERECO)
                    .comNumero(result[0].NUMERO)
                    .comComplemento('')
                    .comCep(result[0].CEP)
                    .comBairro(result[0].BAIRRO)
                    .comMunicipio(result[0].CIDADE)
                    .comCidade(result[0].CIDADE)
                    .comCodMunicipio(result[0].CODIBGE)
                    .comUf(result[0].ESTADO));
                console.log(emitente);
                resolve(venda, emitente);
              })
            })
          })
        });
      }
      function dadosNota(venda) {
        return new Promise((resolve, reject) => {
          destinatario.comNome(venda.RAZAO)
            .comCodigo(venda.CODCLI)
            .comRegistroNacional(venda.CGC)
            .comInscricaoEstadual(venda.INSC)
            .comTelefone(venda.FONE)
            .comEmail(venda.EMAIL)
            .comEndereco(new Endereco()
              .comLogradouro(venda.ENDERECO)
              .comNumero(venda.NUMERO)
              .comComplemento(venda.COMPLEMENTO)
              .comCep(venda.CEP)
              .comBairro(venda.BAIRRO)
              .comMunicipio(venda.CIDADE)
              .comCidade(venda.CIDADE)
              .comUf(venda.ESTADO)
              .comCodMunicipio(venda.CODIBGE));
          transportador.comNome(venda.TRANSPORTE.TRANSPORTADOR)
            .comCodigo(venda.TRANSPORTE.TRANSPORTADOR)
            .comEndereco(new Endereco());
          volumes.comQuantidade(venda.TRANSPORTE.VOLUMES);
          volumes.comEspecie('CX');
          volumes.comMarca('');
          volumes.comNumeracao('');
          volumes.comPesoBruto(venda.TRANSPORTE.PESO);
          console.log(destinatario);
          resolve(venda);

        })
      }

      function criaNf(venda) {
        return new Promise((resolve, reject) => {
          //TODO : retorno do envio inserir chave e protocolo.
          // danfe.comChaveDeAcesso(chave);
          // danfe.comProtocolo(protocolo);
          danfe.comEmitente(emitente);
          danfe.comDestinatario(destinatario);
          danfe.comTransportador(transportador);
          danfe.comVolumes(volumes);
          danfe.comTipo('saida');
          danfe.comFinalidade('normal');
          danfe.comNaturezaDaOperacao('VENDA');
          danfe.comNumero(1420);
          danfe.comSerie(100);
          danfe.comDataDaEmissao(new Date());
          danfe.comDataDaEntradaOuSaida(new Date());
          danfe.comModalidadeDoFrete('porContaDoDestinatarioRemetente');
          // danfe.comInscricaoEstadualDoSubstitutoTributario('102959579');
          resolve(venda);
        })
      }

      function pagamentosNota(venda) {
        console.log('com pagamento')
        let _numDuplicata = 0;
        return new Promise((resolve, reject) => {
          for (let item of venda.PAGAMENTO) {
            let _formaPagto = "",
              _meioPagto = "",
              _integracaoPagto = "",
              _bandeiraCartao = "",
              _valorTroco = 0;
            if (item.tipo === "BL") {
              _formaPagto = "Á Prazo",
                _meioPagto = "Boleto Bancário",
                _integracaoPagto = "Não Integrado",
                _numDuplicata++;
              let duplicata = new Duplicata();
              duplicata.comNumero(_numDuplicata)
                .comValor(item.valor)
                .comVencimento(_meioPagto)
              danfe._duplicatas.push(duplicata)
            }
            else if (item.tipo === "CC") {
              _formaPagto = "Á Prazo",
                _meioPagto = "Cartão de Crédito",
                _integracaoPagto = "Não Integrado",
                _bandeiraCartao = "Visa";
            }
            else if (item.tipo === "CM") {
              _formaPagto = "Á Prazo",
                _meioPagto = "Cartão de Crédito",
                _integracaoPagto = "Não Integrado",
                _bandeiraCartao = "Mastercard";
            }
            else if (item.tipo === "DA") {
              _formaPagto = "Á Vista",
                _meioPagto = "Cartão de Débito",
                _integracaoPagto = "Não Integrado",
                _bandeiraCartao = "Visa";
            }
            else if (item.tipo === "DM") {
              _formaPagto = "Á Vista",
                _meioPagto = "Cartão de Débito",
                _integracaoPagto = "Não Integrado",
                _bandeiraCartao = "Mastercard";
            }
            else if (item.tipo === "CH") {
              _formaPagto = "Á Vista",
                _meioPagto = "Cheque",
                _integracaoPagto = "Não Integrado";
            }
            else { //se nenhum atender considerar Dinheiro
              _formaPagto = "Á Vista",
                _meioPagto = "Dinheiro",
                _integracaoPagto = "Não Integrado";
            }
            let pagamento = new Pagamento();
            pagamento.comFormaDePagamento(_formaPagto)
              .comValor(item.valor)
              .comMeioDePagamento(_meioPagto)
              .comIntegracaoDePagamento(_integracaoPagto)
              .comBandeiraDoCartao(_bandeiraCartao ? _bandeiraCartao : '')
              .comValorDoTroco(_valorTroco);
            danfe._pagamentos.push(pagamento)

          }
          console.log(danfe._pagamentos)
          resolve(venda);
        })
      }

      function itensNota(venda) {
        return new Promise((resolve, reject) => {
          for (let item of venda.PRODUTOS) {
            var prodst = (item.SITTRIB === "060") ? true : false;
            var icms = new Icms().CalculaIcms(
              prodst,
              danfe.getEmitente().getCrt(),
              danfe.getEmitente().getEndereco().getUf(),
              danfe.getDestinatario().getEndereco().getUf(),
              1,
              1,
              item.VALOR,
              item.ALIQ,
              item.ORIG
            )
            danfe.adicionarItem(new Item()
              .comCodigo(item.CODPRO)
              .comDescricao(item.DESCRICAO)
              .comNcmSh(item.NCM)
              .comIcms(icms)
              // .comOCst('020')
              // .comCfop('6101')
              .comUnidade(item.UNIDADE)
              .comQuantidade(item.QTD)
              .comValorUnitario(item.VALOR)
              .comValorTotal(item.VALOR * item.QTD));
          }
          resolve(venda);

        })
      }
      function totalizadorNfe() {
        console.log('totalizador')
        return new Promise((resolve, reject) => {
          var impostos = new Impostos();
          impostos.comBaseDeCalculoDoIcms(danfe.getItens().reduce(function (a, item) {
            return parseFloat(a + item.getIcms().getBaseDeCalculoDoIcms());
          }, 0));
          impostos.comValorDoIcms(danfe.getItens().reduce(function (a, item) {
            return parseFloat(a + item.getIcms().getValorDoIcms());
          }, 0));
          impostos.comBaseDeCalculoDoIcmsSt(danfe.getItens().reduce(function (a, item) {
            return parseFloat(a + item.getIcms().getBaseDeCalculoDoIcmsSt());
          }, 0));
          impostos.comValorDoIcmsSt(danfe.getItens().reduce(function (a, item) {
            return parseFloat(a + item.getIcms().getValorDoIcmsSt());
          }, 0));
          impostos.comValorDoImpostoDeImportacao(0);
          impostos.comValorDoPis(0);
          impostos.comValorTotalDoIpi(0);
          impostos.comValorDaCofins(0);
          impostos.comBaseDeCalculoDoIssqn(0);
          impostos.comValorTotalDoIssqn(30);

          danfe.comImpostos(impostos);
          danfe.comInformacoesComplementares('');
          danfe.comValorTotalDaNota(250.13);
          danfe.comValorTotalDosProdutos(120.10);
          danfe.comValorTotalDosServicos(130.03);
          danfe.comValorDoFrete(23.34);
          danfe.comValorDoSeguro(78.65);
          danfe.comDesconto(1.07);
          danfe.comOutrasDespesas(13.32);
          resolve(danfe);
        })

      };
      $scope.nota = new NFe()
      $scope.carregaVenda = function (venda) {
        console.log("aaaaa")
        VendaSrvc.vendaNota(venda).then(function (response) {
          dadosEmitente(1, response).then(dadosNota).then(criaNf).then(itensNota).then(pagamentosNota).then(totalizadorNfe).then(function (res) {
            $scope.nota = res;
            $scope.$apply();
            console.log($scope.nota);
          })
        })

      }



      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.ok = function () {
        console.log('aa')
        $mdDialog.hide($scope.Venda);
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
    function alteraValorCtrl($scope, $mdDialog, $mdToast, locals) {
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
          $mdToast.show($mdToast.simple({ 'hideDelay': 0 }).textContent('Aplicando Desconto...').position('top right left'));

          VendaSrvc.descontoTotalVenda($scope.venda.LCTO, valor).then(function (response) {
            $scope.prodVenda = response;
            $mdToast.hide();
          })
        }, function () {
          console.log('You cancelled the dialog.');
        });
    };
    function alteraValorVendaCtrl($scope, $mdDialog, $mdToast, locals) {
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
    function puxaLocalCtrl($scope, $mdDialog, $mdToast, locals) {
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
    function PesquisaVendaFechamentoCtrl($scope, $mdDialog, $mdToast, locals) {
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
      $scope.Relatorio = function (vendas) {
        console.log(vendas)
        VendaSrvc.carregaNPcli(vendas).then(function (res) {
          let venda = res;
          venda.aplicaDesconto()
          console.log(venda.descontoPrev())
          console.log(venda)
          var html = "<html><head><style>@media print{@page {size:A4}}page {background: white;display: block;margin: 0 auto; margin-bottom: 0.5cm;}page[size='A4'] { width: 21cm; height: 29.7cm; }table,td,tr,span{font-size:11pt;font-family:Arial;}table{width: 100%;}td {min-width:4mm;}hr{border-top:1pt dashed #000;} </style></head><body>"
          html += "<h2>FLORESTAL</h2><span>Relatório de Movimento de Contas</span></br><span>Período 01/05/2018 a 31/05/2018</span><hr><span>Cliente: " + venda.CODCLI + "  -  " + venda.RAZAO + "</span><hr>"
          html += "<table><thead>"
          html += "<tr><td>Documento</td><td>Data</td><td>Vencimento</td><td>Valor Entrada</td><td>Valor Saida</td><td></td></tr>"
          html += "</thead><tbody>"
          let saida = new dinheiro(0);
          for (let item of vendas) {
            if (item.VALORSAIDA) { saida.soma(item.VALORSAIDA) }
            console.log(saida)
            html += "<tr><td>" + (item.LCTO || '') + "</td><td>" + item.DATA.toLocaleDateString() + "</td><td>" + item.VENCIMENTO.toLocaleDateString() + "</td><td>" + item.VALOR.toString() + "</td><td>" + item.VALORSAIDA.toString() + "</td><td></td></tr>"
          }
          html += "</tbody><tfoot><tr><td colspan='6'><hr></td></tr>"
          html += "<tr><td>TOTAIS</td><td colspan='2'><td>" + venda.TOTALDESC.soma(venda.DESCONTOITEM).valor + "</td><td>" + saida.valor + "</td><th>= " + venda.TOTALDESC.subtrai(saida).toString() + "</th></tr>"
          html += "<tr><td colspan='5'>Desconto para pagamento até 15/06/2018</td><th>= " + venda.descontoPrev().soma(venda.DESCONTOITEM.desconto(4)).subtrai(saida).toString() + "</th></tr>"
          html += "</tfoot></table></body></html>"
          var pdf = require('html-pdf');

          var options = { format: 'Letter' };

          // pdf.create(html, options).toFile('c:/temp/teste.pdf', function(err, res) {
          //   if (err) return console.log(err);
          //   console.log(res); // { filename: '/app/businesscard.pdf' }
          // });

          const janela = fs.writeFile('c:/temp/teste.html', html, 'binary', (err) => {
            if (err) throw err;
            let modal = window.open('', 'relatorio')
            console.log('The file has been saved!');
          });
        });

      }

      $scope.enviaEmail = function () {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        nodemailer.createTestAccount((err, account) => {
          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
            host: 'email-ssl.com.br',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
              user: "suporte@florestalferragens.com.br", // generated ethereal user
              pass: "Shin0t4m4" // generated ethereal password
            }
          });

          // setup email data with unicode symbols
          let mailOptions = {
            from: '"Suporte Florestal" <suporte@florestalferragens.com.br>', // sender address
            to: 'vanius@live.com', // list of receivers
            subject: 'aaaaa', // Subject line
            text: 'Hello world?', // plain text body
            attachments: [{   // file on disk as an attachment
              path: './relatorio.pdf' // stream this file
            }]
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
          });
        });
      }




      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.seleciona = function () {
        let saida = new dinheiro(0);
        for (let item of $scope.selected) {
          if (item.VALORSAIDA) { saida.subtrai(item.VALORSAIDA) }
          console.log(saida)
        }
        $mdDialog.hide([$scope.selected, saida]);
      };
    }
    function PesquisaVendaCtrl($scope, $mdDialog, $mdToast, locals) {
      // $scope.param = remote.getGlobal('dados').param;
      //controla o modal que pesquisa vendas
      $scope.status = locals.status;
      $scope.prodVendas = [];
      console.log(locals);
      $scope.dados = locals.dados;
      $scope.selected = [];
      $scope.$watch("selected[0].LCTO", function (newValue, oldValue) {
        console.log(newValue)
        if (newValue) {
          $mdToast.show($mdToast.simple({ 'hideDelay': 0 }).textContent('CARREGANDO...').position('top right left'));
          VendaSrvc.listaProdVenda(newValue).then(function (response) {
            $scope.prodVendas = response;
            console.log($scope.prodVendas);
            $mdToast.hide()
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
        $mdDialog.hide($scope.cliente);
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
    }
    function inserePgtoCtrl($scope, $mdDialog, $mdToast, locals) {  //controla o modal que faz o pagamento
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
    function PagamentoCtrl($scope, $mdDialog, locals, $timeout, $mdToast) {  //controla o modal que faz o pagamento       
      $scope.hoje = new Date();
      $scope.acao = locals.acao
      $scope.param = remote.getGlobal('dados').param;
      VendaSrvc.formasPagamento().then(
        function (response) {
          console.log(response.data);
          $scope.FormaPagto = response.data
        })
      VendaSrvc.valeCliente(locals.dados.CODCLI).then(function (response) {
        if (locals.acao = 'V') {
          $scope.vale = response.reduce(function (acumulador, atual) {
            if (atual.ENT_SAI == 'S') { atual.TOTAL = atual.TOTAL * (-1) }
            return acumulador += atual.TOTAL;
          }, 0);
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
        var conteudo = "<div><span>DOCUMENTO SEM VALOR FISCAL</span><hr><span class='pull-left'>" + remote.getGlobal('dados').configs.razao + "</span><br><span class='pull-left'>Pedido: " + venda.LCTO + "   Emissão: " + new Date().toLocaleDateString() + "</span><br><span>Cliente: " + venda.NOMECLI + "</span><br><span>Cod. Cliente" + venda.CODCLI + "</span><br><span>Vendedor: " + venda.NOMEVEND + "</span><br>"
        conteudo += "<span>Forma de Pagamento--------------------------------</span><br>"
        conteudo += "<table>"
        for (let x of venda.PAGAMENTO) {
          conteudo += "<tr><td colspan='3'>" + x.vencimento.toLocaleDateString() + "</td><td>" + x.valor.toString() + "</td><td>" + x.tipo + "</td><td colspan='3'> </td></tr>"
        }
        conteudo += "</table><hr><table><tr><td colspan='8'>Descricao<td></tr><tr><td></td><td>Qtd</td><td>UN</td><td colspan='3'>Código</td><td>Vl. Unit.</td><td>Subtotal</td>"
        for (let x of venda.PRODUTOS) {
          if (!x.QTDRESERVA)
            conteudo += "<tr><td colspan='8'>" + x.DESCRICAO + "</td></tr><tr><td></td><td>" + x.QTD + "</td><td>" + x.UNIDADE + "</td><td colspan='3'>" + x.CODPRO + "</td><td>" + x.VALOR.toString() + "</td><td>" + x.TOTAL.toString() + "</td></tr>"
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
            conteudo += "<tr><td colspan='8'>" + x.DESCRICAO + "</td></tr><tr><td></td><td>" + x.QTD + "</td><td>" + x.UNIDADE + "</td><td colspan='3'>" + x.CODPRO + "</td><td>" + x.VALOR.toString() + "</td><td>" + x.TOTAL.toString() + "</td></tr>"
        });
        conteudo += "</table><br><span class='pull-right'>Total Produtos: " + venda.TOTALDESC.toString() + "</span>"
        conteudo += "<br><br><span>CONFERENTE.________________________________</span><br>"
        conteudo += "<br><br><span>ASS._______________________________________</span></div></br><hr>"
        conteudo += conteudo;
        html += conteudo + "</body></html>"
        const janela = await fs.writeFile('c:/temp/teste.html', html, (err) => {
          if (err) throw err;
          let modal = window.open('', 'impressao')
          console.log('The file has been saved!');
        });
        $scope.venda = new Venda()
      }
      $scope.concluirCupom = async function () {
        $mdToast.show($mdToast.simple({ 'hideDelay': 0 }).textContent('Imprimindo Cupom...').position('top right left'));
        const Ncupom = await bemafi.gravaECF($scope.venda);
        console.log(Ncupom);
        $scope.venda.insereNucupom(Ncupom);
        $mdToast.updateTextContent('Confirmando Venda...');
        VendaSrvc.confirmaVenda($scope.venda, 'V').then(function (response) {
          $scope.imprime($scope.venda); $mdDialog.hide(); console.log(response)
          $mdToast.hide();
        });
      }
      $scope.nfFech = function () {
        let faturas = $scope.venda.PAGAMENTO.filter(function (item, index) {
          if (item.tipo == 'BL') { return item }
        })
        let pgtoAvista = $scope.venda.PAGAMENTO.filter(function (item, index) {
          if (item.tipo == 'NP') { return item.valor }
        })
        VendaSrvc.NumNota().then(function (nota) {
          $scope.venda.NFE = nota;
          console.log($scope.venda);
          NFe.iniciaNota($scope.venda, $scope.venda.PRODUTOS, faturas, pgtoAvista, nota)
        })
      }
      $scope.concluirFech = function () {
        console.log(venda)
        VendaSrvc.confirmaVenda($scope.venda, 'F').then(function (response) {
          alert('pedido confirmado'); $mdDialog.hide();
          // $scope.imprime($scope.venda); $mdDialog.hide(); console.log(response)
          console.log(response)
        });
      }
      $scope.concluir = function () {
        VendaSrvc.confirmaVenda($scope.venda, 'V').then(function (response) {
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
            $scope.venda.insereCPFCupom(valor)
            console.log(valor);
          }, function () {
            // console.log('You cancelled the dialog.');
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
        locals: { 'venda': $scope.venda }
      })
        .then(function (response) {
          console.log(response)
          VendaSrvc.NumNota().then(function (nota) {
            // $scope.venda.NFE = nota;
            // NFe.iniciaNota(response[1], response[0], response[2],"",nota);
            NFe.iniciaNota(response, response.PRODUTOS, response.PAGAMENTO, "", nota)
          })
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
              $scope.venda = res;
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
            VendaSrvc.carregaNPcli(vendas[0]).then(function (res) {
              $scope.venda = res;
              $scope.venda.DESCONTOITEM.soma(vendas[1]);
              $scope.venda.PAGAR.soma($scope.venda.DESCONTOITEM);
              $scope.venda.TOTALDESC.soma($scope.venda.DESCONTOITEM);
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
    cx.cancelaCupom = async function (ev) {
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
          acao: $scope.acao
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