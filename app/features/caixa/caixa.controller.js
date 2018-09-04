(function () {
  'use strict';
  const bemafi = require('./Bemafi32.js');
  const nfe = require('node-nfe'),
    fs = require('fs'),
    path = require('path'),
    ini = require('ini'),
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
    Fatura = nfe.Fatura,
    Item = nfe.Item,
    Icms = nfe.Icms,
    GravaBanco = nfe.Gravabanco,
    Pagamento = nfe.Pagamento;



  var pathDoArquivoPdf = path.join('c:/temp/', 'danfe.pdf');

  function zeroEsq(valor, comprimento, digito) {
    var length = comprimento - valor.toString().length + 1;
    return Array(length).join(digito || '0') + valor;
  };


  // const mp2032 = require('./Mp2032.js');
  const electron = require('electron');
  const Pagto = require('./pagamentos');
  const dinheiro = require('./dinheiro');
  const venda = require('./venda');
  const nodemailer = require('nodemailer');
  const remote = require('electron').remote;
  angular.module('ventronElectron').controller('VendasCtrl', VendasCtrl);
  VendasCtrl.$inject = ['$scope', '$q', 'VendaSrvc', '$mdDialog', '$mdToast', '$location'];



  const config = ini.parse(fs.readFileSync('config/config.ini', 'utf-8'))

  // # gera nfe
  function geraNFCtrl($scope, VendaSrvc, $mdDialog, $mdToast, locals) {
    var empresaIniciada = remote.getGlobal('dados').configs.empresa;

    if (empresaIniciada == 1) {
      var caminhopasta = config.PASTAFLORESTAL
      console.log(caminhopasta)
    } else if (empresaIniciada == 2) {
      var caminhopasta = config.PASTALOCAL
      console.log(caminhopasta)
    }
    var danfe = new NFe();
    $scope.venda = locals.venda ? locals.venda : new venda()
    $scope.nota = new NFe();
    //cria as variáveis necessárias
    var emitente = new Emitente();
    var destinatario = new Destinatario();
    var transportador = new Transportador();
    var volumes = new Volumes();
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
              resolve(venda);
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
        danfe = new NFe();
        var tipoFrete = '';
        switch (venda.TRANSPORTE.TIPOFRETE) {
          case "0":
            tipoFrete = 'porContaDoEmitente';
            break;
          case "1":
            tipoFrete = 'porContaDoDestinatarioRemetente';
            break;
          case "2":
            tipoFrete = 'porContaDeTerceiros';
            break;
          case "3":
            tipoFrete = 'porContaProprioRemetente';
            break;
          case "4":
            tipoFrete = 'porContaProprioDestinatario';
            break;
          default:
            tipoFrete = 'semFrete'
        }

        danfe.comEmitente(emitente);
        danfe.comDestinatario(destinatario);
        danfe.comTransportador(transportador);
        danfe.comVolumes(volumes);
        danfe.comTipo('saida');
        danfe.comFinalidade('normal');
        var naturezaOperacao = 'VENDA DE MERCADORIA NO ESTADO';
        if (venda.operacao == 2) {
          naturezaOperacao = 'VENDA DE ATIVO'
        }
        if (venda.operacao == 1 && danfe.getDestinatario().getEndereco().getUf() !== danfe.getEmitente().getEndereco().getUf()) {
          naturezaOperacao = 'VENDA DE MERCADORIA FORA DO ESTADO'
        }
        danfe.comNaturezaDaOperacao(naturezaOperacao);
        danfe.comSerie('001');
        danfe.comDataDaEmissao(new Date());
        danfe.comDataDaEntradaOuSaida(new Date());
        danfe.comModalidadeDoFrete(tipoFrete);
        // danfe.comInscricaoEstadualDoSubstitutoTributario('102959579');
        resolve(venda);
      })
    }

    function pagamentosNota(venda) {
      console.log('com pagamento')
      var _numDuplicata = 0;
      var _vlFat = new dinheiro(0);
      return new Promise((resolve, reject) => {
        for (let item of venda.PAGAMENTO) {
          let _formaPagto = "",
            _meioPagto = "",
            _integracaoPagto = "",
            _bandeiraCartao = "",
            _valorTroco = 0;
          if (item.tipo === "BL") {
            _vlFat.soma(item.valor);
            _formaPagto = "Á Prazo",
              _meioPagto = "Boleto Bancário",
              _integracaoPagto = "Não Integrado",
              _numDuplicata++;
            let duplicata = new Duplicata();
            duplicata.comNumero(zeroEsq(_numDuplicata, 3, 0))
              .comValor(item.valor.valor)
              .comVencimento(item.vencimento)
            danfe._duplicatas.push(duplicata)
          } else if (item.tipo === "CC") {
            _formaPagto = "Á Prazo",
              _meioPagto = "Cartão de Crédito",
              _integracaoPagto = "Não Integrado",
              _bandeiraCartao = "Visa";
          } else if (item.tipo === "CM") {
            _formaPagto = "Á Prazo",
              _meioPagto = "Cartão de Crédito",
              _integracaoPagto = "Não Integrado",
              _bandeiraCartao = "Mastercard";
          } else if (item.tipo === "DA") {
            _formaPagto = "Á Vista",
              _meioPagto = "Cartão de Débito",
              _integracaoPagto = "Não Integrado",
              _bandeiraCartao = "Visa";
          } else if (item.tipo === "DM") {
            _formaPagto = "Á Vista",
              _meioPagto = "Cartão de Débito",
              _integracaoPagto = "Não Integrado",
              _bandeiraCartao = "Mastercard";
          } else if (item.tipo === "CH") {
            _formaPagto = "Á Vista",
              _meioPagto = "Cheque",
              _integracaoPagto = "Não Integrado";
          } else { //se nenhum atender considerar Dinheiro
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
        if (_vlFat.valor) {
          var fatura = new Fatura();
          fatura.comNumero('0001')
            .comValorOriginal(_vlFat.valor+0.01)
            .comValorDoDesconto(0.01)
            .comValorLiquido(_vlFat.valor)
          danfe.comFatura(fatura)
        }
        resolve(venda);
      })
    }

    function itensNota(venda) {
      return new Promise((resolve, reject) => {
        for (let item of venda.PRODUTOS) {
          var prodst = (item.SITTRIB === "060") ? true : false;
          var icms = new Icms().CalculaIcms(
            prodst,
            danfe.getEmitente().getCodigoRegimeTributario(),
            danfe.getEmitente().getEndereco().getUf(),
            danfe.getDestinatario().getEndereco().getUf(),
            danfe.getDestinatario().getIdenfificaContribuinteIcms(),
            1,
            item.BASECALC,
            item.ALIQ,
            item.ORIG,
            venda.operacao
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
            .comValorDoFrete(item.FRETEPROD)
          );
        }
        resolve(venda);
      })
    }

    function totalizadorNfe() {
      console.log('totalizador')
      return new Promise((resolve, reject) => {
        var impostos = new Impostos();
        impostos.comBaseDeCalculoDoIcms(danfe.getItens().reduce(function (a, item) {
          return a.soma(item.getIcms().getBaseDeCalculoDoIcms());
        }, new dinheiro(0)));
        impostos.comValorDoIcms(danfe.getItens().reduce(function (a, item) {
          return a.soma(item.getIcms().getValorDoIcms());
        }, new dinheiro(0)));
        impostos.comBaseDeCalculoDoIcmsSt(danfe.getItens().reduce(function (a, item) {
          return a.soma(item.getIcms().getBaseDeCalculoDoIcmsSt());
        }, new dinheiro(0)));
        impostos.comValorDoIcmsSt(danfe.getItens().reduce(function (a, item) {
          return a.soma(item.getIcms().getValorDoIcmsSt());
        }, new dinheiro(0)));
        impostos.comValorDoImpostoDeImportacao(0);
        impostos.comValorDoPis(0);
        impostos.comValorTotalDoIpi(0);
        impostos.comValorDaCofins(0);
        impostos.comBaseDeCalculoDoIssqn(0);
        impostos.comValorTotalDoIssqn(0);
        danfe.comImpostos(impostos);
        var infoComplementar = 'Documento emitido por ME ou EPP optante pelo simples nacional;';
        console.log('codregime', danfe.getEmitente().getCodigoRegimeTributario())
        if (danfe.getEmitente().getCodigoRegimeTributario() === '1') {
          infoComplementar += 'Valor dos produtos Tributado pelo Simples Nacional R$' + danfe.getImpostos().getBaseDeCalculoDoIcmsFormatada() + ';';
        } else if (danfe.getEmitente().getCodigoRegimeTributario() === '2') {
          infoComplementar += 'Estabelecimento impedido de recolher o ICMS pelo simples nacional no inciso 1 do art. 2 da LC 123/2006;'
          infoComplementar += 'Imposto recolhido por substituição ART 313-Y DO RICMS;'
          infoComplementar += 'Valor dos produtos Tributado pelo Simples Nacional ' + danfe.getImpostos().getBaseDeCalculoDoIcmsFormatada() + ';';
          infoComplementar += 'Valor dos produtos Substituicao Tributaria ' + danfe.getImpostos().getBaseDeCalculoDoIcmsStFormatada() + ';';
        }
        danfe.comInformacoesComplementares(infoComplementar);

        danfe.comValorTotalDaNota(danfe.getItens().reduce(function (a, item) {
          return a.soma(item.getValorDoFrete()).soma(item.getValorTotal());
        }, new dinheiro(0)));
        danfe.comValorTotalDosProdutos(danfe.getItens().reduce(function (a, item) {
          return a.soma(item.getValorTotal());
        }, new dinheiro(0)));
        danfe.comValorTotalDosServicos(0);
        danfe.comValorDoFrete(danfe.getItens().reduce(function (a, item) {
          return a.soma(item.getValorDoFrete());
        }, new dinheiro(0)));
        danfe.comValorDoSeguro(0);
        danfe.comDesconto(0);
        danfe.comOutrasDespesas(0);
        resolve(danfe);
      })
    };

    $scope.nota = new NFe()
    $scope.carregaVenda = function (venda) {
      VendaSrvc.vendaNota(venda).then(function (response) {
        console.log(response)
        $scope.venda = response;
        $scope.venda.operacao='1';
        $scope.$apply();
      }, function (reject) {
        alert = $mdDialog.alert({
          title: "Atenção",
          multiple: true,
          textContent: reject,
          ok: 'Fechar'
        });
        $mdDialog
          .show(alert)
          .finally(function () {
            alert = undefined;
          });
      })
    }
    $scope.geraNFe = function (venda) {
      //dados do Emitente
      dadosEmitente(remote.getGlobal('dados').configs.empresa, venda).then(dadosNota).then(criaNf).then(itensNota).then(pagamentosNota).then(totalizadorNfe).then(function (res) {
        // depos gerar o objeto salva no scope do angular para verificação
        $scope.nota = res;
        $scope.$apply();
        alert = $mdDialog.alert({
          title: 'Atenção',
          multiple: true,
          textContent: 'Gerado com sucesso',
          ok: 'Ok'
        });
        $mdDialog
          .show(alert)
          .finally(function () {
            alert = undefined;
          });

      }, function (motivo) { //se alguma função foi rejeitada (erros)
        alert = $mdDialog.alert({
          title: 'Atenção',
          multiple: true,
          textContent: motivo,
          ok: 'Fechar'
        });

        $mdDialog
          .show(alert)
          .finally(function () {
            alert = undefined;
          });
      })
    }

    $scope.enviaNfe = function (res) {
      console.log(res);
      //grava no banco de dados e retorna o numero
      let valores = [
        empresaIniciada, //EMPRESA
        res.getNumero(), // NOTA
        res.getDataDaEmissao().dataFirebird(), //DATA
        res.getDestinatario().getCodigo(), //CODCLI
        res.getDataDaEmissao().dataFirebird(), //DT_EMISSAO
        res.getDataDaEmissao().dataFirebird(), //DT_FISCAL
        1, //ESPECIE
        res.getOutrasDespesas(), //DESPACES
        res.getDesconto(), //DESCONTO
        "", //CODIGODEBARRAS  -  TODO
        res.getValorDoFrete(), //FRETENOTA
        0, // FRETEFOB
        res.getValorTotalDosProdutos(), //VPROD
        res.getImpostos().getBaseDeCalculoDoIcms(), //BCICMS
        res.getImpostos().getValorDoIcms(), //VICMS
        res.getImpostos().getValorDoIcmsSt(), //VICMSST
        res.getImpostos().getBaseDeCalculoDoIcmsSt(), //BCICMSST
        res.getValorTotalDaNota(), //VNF
        res.getDestinatario().getEndereco().getUf(), //UF
        res.getChaveDeAcesso(), //CHAVE
        res.getCodigoModalidadeDoFrete(), //TOMADORFRETE
        '55', //MODELO
        res.getSerie(), //SERIE
        res.getDestinatario().getCodigo(), //CODPARC
        res.getProtocolo().getCodigo(), //PROTOCOLO
        "", //PROTOCOLOCANCELA
      ]
      let sql = 'update or insert into SAIDA (EMPRESA,NOTA,DATA,CODCLI,DT_EMISSAO,DT_FISCAL,ESPECIE,DESPACES,DESCONTO,CODIGOBARRAS,FRETENOTA,FRETEFOB,VPROD,BCICMS,VICMS,VICMSST,BCICMSST,VNF,UF,CHAVE,TOMADORFRETE,MODELO,SERIE,CODPARC,PROTOCOLO,PROTOCOLOCANCELA) ';
      sql += 'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
      sql += 'MATCHING (EMPRESA,NOTA) ';
      sql += 'RETURNING NOTA,LCTO';
      console.log(sql, valores.toString())
      firebird.attach(conexao, function (err, db) {
        if (err) throw err;
        db.query(sql, valores, function (err, result) {
          if (err) throw err;
          console.log(result)
          res.comNumero(result.NOTA)
          let sql = "execute block as begin ";
          for (let item of res.getItens()) {
            sql += "insert into PRODSAIDA (EMPRESA,LCTOSAIDA,QTD,VALOR,PRODUTO,VBCICMS,PICMSST,VBCICMSST,VICMS,VICMSST,FRETENOTA,PICMS,VPROD,CFOP,NCM,ORIG,CEST,SITTRIB) VALUES (";
            sql += empresaIniciada + "," //EMPRESA
            sql += result.LCTO + "," //LCTOSAIDA
            sql += item.getQuantidade() + "," //QTD
            sql += item.getValorTotal() + "," //VALOR
            sql += item.getCodigo() + "," //PRODUTO
            sql += (item.getIcms().getBaseDeCalculoDoIcms() || 'null') + "," //VBCICMS
            sql += (item.getIcms().getAliquotaDoIcmsSt() || 'null') + "," //PICMSST
            sql += (item.getIcms().getBaseDeCalculoDoIcmsSt() || 'null') + "," //VBCICMSST
            sql += (item.getIcms().getValorDoIcms() || 'null') + "," //VICMS
            sql += (item.getIcms().getValorDoIcmsSt() || 'null') + "," //VICMSST
            sql += (item.getValorDoFrete() || 'null') + "," //FRETENOTA
            sql += (item.getIcms().getAliquotaDoIcms() || 'null') + "," //PICMS
            sql += item.getValorUnitario() + "," //VPROD
            sql += item.getIcms().getCfop() + "," //CFOP
            sql += item.getNcmSh() + "," //NCM
            sql += item.getIcms().getOrigem() + "," //ORIG
            sql += (item.getCodigoCest() || 'null') + "," //CEST
            sql += item.getIcms().getSituacaoTributaria() //SITTRIB
            sql += '); '
          }
          sql += 'end';
          console.log(sql)
          db.execute(sql, function (err, result) {
            if (err) throw err;
            var Geraini = {
              infNFe: {
                versao: '4.0'
              },
              Identificacao: {
                cNF: '',
                natOp: res.getNaturezaDaOperacao(),
                indPag: '',
                mod: '55',
                serie: res.getSerie(),
                nNF: res.getNumero(),
                dhEmi: res.getDataDaEmissaoFormatada(),
                dhSaiEnt: '',
                tpNF: res.getTipoFormatado(),
                idDest: res.getEmitente().getEndereco().getUf() === res.getDestinatario().getEndereco().getUf() ? '1' : '2',
                tpImp: '1', // 1=DANFE normal, Retrato; 
                tpEmis: '1', // normal
                finNFe: res.getCodigoFinalidade(),
                indFinal: '1', // consumidor final
                indPres: '1', // presente no local
                procEmi: '0', // 0 - emissão de NF-e com aplicativo do contribuinte; 
                verProc: '1.0.0',
                dhCont: '',
                xJust: ''
              },
              Volume001: {
                qVol: res.getVolumes().getQuantidade(),
                esp: res.getVolumes().getEspecie(),
                Marca: res.getVolumes().getMarca(),
                nVol: res.getVolumes().getNumeracao(),
                pesoL: res.getVolumes().getPesoLiquido(),
                pesoB: res.getVolumes().getPesoBruto()
              },
              Transportador: {
                modFrete: res.getCodigoModalidadeDoFrete(),
                CNPJCPF: res.getTransportador().getRegistroNacional(),
                xNome: res.getTransportador().getNome(),
                IE: res.getTransportador().getInscricaoEstadual(),
                xEnder: res.getTransportador().getEndereco().getLogradouro(),
                xMun: res.getTransportador().getEndereco().getMunicipio(),
                UF: res.getTransportador().getEndereco().getUf(),
                vServ: '',
                vBCRet: '',
                pICMSRet: '',
                vICMSRet: '',
                CFOP: '',
                cMunFG: '',
                Placa: '',
                UFPlaca: '',
                RNTC: '',
                vagao: '',
                balsa: ''
              },
              Emitente: {
                CNPJCPF: res.getEmitente().getRegistroNacional(),
                xNome: res.getEmitente().getNome(),
                xFant: res.getEmitente().getNome(),
                IE: res.getEmitente().getInscricaoEstadual(),
                IEST: '',
                IM: '',
                CNAE: '',
                CRT: res.getEmitente().getCodigoRegimeTributario(),
                xLgr: res.getEmitente().getEndereco().getLogradouro(),
                nro: res.getEmitente().getEndereco().getNumero(),
                xCpl: res.getEmitente().getEndereco().getComplemento(),
                xBairro: res.getEmitente().getEndereco().getBairro(),
                cMun: res.getEmitente().getEndereco().getCodMunicipio(),
                xMun: res.getEmitente().getEndereco().getMunicipio(),
                UF: res.getEmitente().getEndereco().getUf(),
                CEP: res.getEmitente().getEndereco().getCep(),
                cPais: res.getEmitente().getEndereco().getCodPais(),
                xPais: res.getEmitente().getEndereco().getPais(),
                Fone: res.getEmitente().getTelefone(),
                cUF: res.getEmitente().getEndereco().getUf(),
                cMunFG: ''
              },
              Destinatario: {
                idEstrangeiro: '',
                CNPJCPF: res.getDestinatario().getRegistroNacional(),
                xNome: res.getDestinatario().getNome(),
                indIEDest: res.getDestinatario().getIdenfificaContribuinteIcms(),
                IE: res.getDestinatario().getInscricaoEstadual(),
                ISUF: '',
                Email: res.getDestinatario().getEmail(),
                xLgr: res.getDestinatario().getEndereco().getLogradouro(),
                nro: res.getDestinatario().getEndereco().getNumero(),
                xCpl: res.getDestinatario().getEndereco().getComplemento(),
                xBairro: res.getDestinatario().getEndereco().getBairro(),
                cMun: res.getDestinatario().getEndereco().getCodMunicipio(),
                xMun: res.getDestinatario().getEndereco().getMunicipio(),
                UF: res.getDestinatario().getEndereco().getUf(),
                CEP: res.getDestinatario().getEndereco().getCep(),
                cPais: res.getDestinatario().getEndereco().getCodPais(),
                xPais: res.getDestinatario().getEndereco().getPais(),
                Fone: res.getDestinatario().getTelefone()
              },
              Total: {
                vBC: res.getImpostos().getBaseDeCalculoDoIcms(),
                vICMS: res.getImpostos().getValorDoIcms(),
                vICMSDeson: '',
                vBCST: res.getImpostos().getBaseDeCalculoDoIcmsSt(),
                vST: res.getImpostos().getValorDoIcmsSt(),
                vProd: res.getValorTotalDosProdutos(),
                vFrete: res.getValorDoFrete(),
                vSeg: res.getValorDoSeguro(),
                vDesc: res.getDesconto(),
                vII: '',
                vIPI: '',
                vPIS: '',
                vCOFINS: '',
                vOutro: res.getOutrasDespesas(),
                vNF: res.getValorTotalDaNota()
              },
              DadosAdicionais: {
                infCpl: res.getInformacoesComplementares()
                // pgtoavista +';'+ infoAdic+ '
              },
            }
            var duplic = res.getDuplicatas();
            for (let i = 0; i < duplic.length; i++) {
              Geraini['Duplicata' + zeroEsq(i + 1, 3, 0)] = {
                nDup: duplic[i].getNumero(),
                dVenc: duplic[i].getVencimentoFormatado(),
                vDup: duplic[i].getValor()
              }
            }
            if (res.getFatura()) {
              Geraini.Fatura = {
                nFat: res.getFatura().getNumero(),
                vOrig: res.getFatura().getValorOriginal(),
                vDesc: res.getFatura().getValorDoDesconto(),
                vLiq: res.getFatura().getValorLiquido()
              }
            }
            var pagtos = res.getPagamento();
            for (let i = 0; i < pagtos.length; i++) {
              Geraini['PAG' + zeroEsq(i + 1, 3, 0)] = {
                tpag: pagtos[i].getCodMeioDePagamento(),
                vPag: pagtos[i].getValor(),
                tpIntegra: pagtos[i].getCodIntegracaoDePagamento(),
                CNPJ: pagtos[i].getCnpjDaCredenciadoraDeCartao(),
                tBand: pagtos[i].getCodBandeiraDoCartao(),
                cAut: pagtos[i].getAutorizacaoDeOperacao(),
                vTroco: pagtos[i].getValorDoTroco(),
              }
            }
            var itens = res.getItens();
            for (let i = 0; i < itens.length; i++) {
              Geraini['Produto' + zeroEsq(i + 1, 3, 0)] = {
                cProd: itens[i].getCodigo(),
                cEAN: itens[i].getCodigoDeBarras(),
                xProd: itens[i].getDescricao(),
                NCM: itens[i].getNcmSh(),
                CEST: '',
                EXTIPI: '',
                CFOP: itens[i].getIcms().getCfop(),
                uCom: itens[i].getUnidade(),
                qCom: itens[i].getQuantidade(),
                vUnCom: itens[i].getValorUnitario(),
                vProd: itens[i].getValorTotal(),
                cEANTrib: itens[i].getCodigoDeBarras(),
                uTrib: itens[i].getUnidade(),
                qTrib: itens[i].getQuantidade(),
                vUnTrib: itens[i].getValorUnitario(),
                vFrete: itens[i].getValorDoFrete(),
                vSeg: '',
                vDesc: '',
                vOutro: '',
                indTot: 1,
                xPed: '',
                nItemPed: '',
                nFCI: '',
                nRECOPI: '',
                pDevol: '',
                vIPIDevol: '',
                vTotTrib: '',
                infAdProd: ''
              }
              Geraini['ICMS' + zeroEsq(i + 1, 3, 0)] = {
                orig: itens[i].getIcms().getOrigem(),
                CST: (res.getEmitente().getCodigoRegimeTributario() === '1') ? '' : itens[i].getIcms().getSituacaoTributaria(),
                CSOSN: (res.getEmitente().getCodigoRegimeTributario() === '1') ? itens[i].getIcms().getSituacaoTributaria() : '',
                modBC: 0,
                pRedBC: 0,
                vBC: itens[i].getIcms().getBaseDeCalculoDoIcms(),
                pICMS: itens[i].getIcms().getAliquotaDoIcms(),
                vICMS: itens[i].getIcms().getValorDoIcms(),
                modBCS: '',
                pMVAST: '',
                pRedBCST: '',
                vBCST: itens[i].getIcms().getBaseDeCalculoDoIcmsSt(),
                pICMSST: itens[i].getIcms().getAliquotaDoIcmsSt(),
                vICMSST: itens[i].getIcms().getValorDoIcmsSt(),
                UFST: '',
                pBCOp: '',
                vBCSTRet: '',
                vICMSSTRet: '',
                motDesICMS: '',
                pCredSN: '',
                vCredICMSSN: '',
                vBCSTDest: '',
                vICMSSTDest: '',
                vICMSDeson: '',
                vICMSOp: '',
                pDif: '',
                vICMSDif: ''
              }
              Geraini['ICMSUFDEST' + zeroEsq(i + 1, 3, 0)] = {
                vBCUFDest: itens[i].getIcms().getBaseDeCalculoUFDestino(),
                pICMSUFDest: itens[i].getIcms().getAliquotaDoIcmsUFDestino(),
                pICMSInter: itens[i].getIcms().getAliquotaDoIcmsInterna(),
                pICMSInterPart: itens[i].getIcms().getPercentualIcmsUFDestino(),
                vICMSUFDest: itens[i].getIcms().getValorDoIcmsUFDestino(),
                vICMSUFRemet: itens[i].getIcms().getValorDoIcmsUFRemetente(),
                pFCPUFDest: itens[i].getIcms().getPercentualFundoCombatePobrezaDestino(),
                vFCPUFDest: itens[i].getIcms().getValorFundoCombatePobrezaDestino(),
                vBCFCPUFDest: itens[i].getIcms().getBaseDeCalculoFundoCombatePobrezaDestino()
              }
              Geraini['IPI' + zeroEsq(i + 1, 3, 0)] = {
                CST: 51,
                clEnq: '',
                CNPJProd: '',
                cSelo: '',
                qSelo: '',
                cEnq: 999,
                vBC: '',
                qUnid: '',
                vUnid: '',
                pIPI: '',
                vIPI: ''
              }
            }

            // grava o arquivo ini
            let textoini = ini.stringify(Geraini);
            fs.writeFile(caminhopasta + "ent.tmp", 'NFe.CriarEnviarNFe("\n' + textoini + '\n",1,1)', (err) => {
              if (err) throw err;
              console.log("arquivo salvo com sucesso");
              fs.rename(caminhopasta + "ent.tmp", caminhopasta + "ent.txt", (err) => {
                if (err) throw err;
                console.log("arquivo renomeado");
              })
            })
            var watcher = fs.watch(caminhopasta, {
              persistent: true
            }, (eventType, filename) => {
              console.log(filename);
              console.log(eventType);
              if (filename == "sai.txt" && eventType == 'change') {
                watcher.close(function () {
                  console.log('fechado watcher')
                })
                fs.readFile(caminhopasta + "sai.txt", 'utf-8', (error, resposta) => {
                  if (error) {
                    throw error
                  }
                  let nota = res.getNumero();
                  var retorno = ini.parse(resposta)
                  let mensagem = retorno.RETORNO.XMotivo;
                  if (mensagem === "Autorizado o uso da NF-e") {
                    let protocoloretorno = retorno['NFE' + nota].NProt;
                    let chave = retorno['NFE' + nota].ChNFe;
                    let arquivo = ['NFE' + nota].Arquivo;
                    var protocolo = new Protocolo();
                    protocolo.comCodigo(protocoloretorno);
                    protocolo.comData(new Date());
                    res.comProtocolo(protocolo);
                    res.comChaveDeAcesso(chave);
                    fs.writeFile(caminhopasta + "sai.txt", '', (err) => {
                      if (err) throw err;
                      console.log("arquivo limpo");
                    })
                    //gera o pdf
                    new Gerador(res).gerarPDF({
                      ambiente: 'producao',
                      ajusteYDoLogotipo: 0,
                      ajusteYDaIdentificacaoDoEmitente: 0,
                      creditos: 'Gammasoft Desenvolvimento de Software Ltda - http://opensource.gammasoft.com.br'
                    }, function (err, pdf) {
                      if (err) {
                        throw err;
                      }
                      pdf.pipe(fs.createWriteStream(pathDoArquivoPdf));
                      console.log('PDF gerado', pathDoArquivoPdf)
                    });

                    db.query('update SAIDA set protocolo = ?, chave = ? where empresa = ? and nota = ?', [protocoloretorno, chave, remote.getGlobal('dados').configs.empresa, nota], function (err, result) {
                      if (err) throw err;
                      console.log(result)
                      db.detach(function () {
                        $scope.venda.NFE = nota;
                        alert = $mdDialog.alert({
                          title: 'Atenção',
                          multiple: true,
                          textContent: mensagem,
                          ok: 'Fechar'
                        });
                        $mdDialog
                          .show(alert)
                          .finally(function () {
                            alert = undefined;
                            var confirm = $mdDialog.prompt()
                              .title('Deseja enviar para outro e-mail?')
                              .textContent('a nota já foi enviada para o e-mail de cadastro')
                              .placeholder('e-mail')
                              .ariaLabel('e-mail')
                              .initialValue('')
                              .required(false)
                              .multiple(true)
                              .ok('Enviar');

                            $mdDialog.show(confirm).then(function (email) {
                              $scope.enviarPorEmail(email);
                              let modal = window.open('', 'Danfe')
                              $mdDialog.cancel();
                            }, function () {
                              $scope.enviarPorEmail(email);
                              let modal = window.open('', 'Danfe')
                              $mdDialog.cancel();
                            });

                          });
                      })
                    })
                  } else {
                    db.detach(function () {
                      alert = $mdDialog.alert({
                        title: mensagem.split(':')[0],
                        multiple: true,
                        textContent: mensagem.split(':')[1],
                        ok: 'Fechar'
                      });

                      $mdDialog
                        .show(alert)
                        .finally(function () {
                          alert = undefined;
                        });
                    })
                  }
                  console.log(retorno)
                });
              };
            });
            console.log('deu certo')
          })
        })
      })

    }

    $scope.enviarPorEmail = function (email) {
      if (!email) {
        email = ''
      };
      let emailnota = $scope.nota.getDestinatario().getEmail();


      fs.writeFile(caminhopasta + "ent.tmp", 'NFe.EnviarEmail(' + emailnota + ',' + $scope.nota.getChaveDeAcesso() + '-nfe.xml,1,,' + email + ')', (err) => {
        if (err) throw err;
        console.log("arquivo salvo com sucesso");
        fs.rename(caminhopasta + "ent.tmp", caminhopasta + "ent.txt", (err) => {
          if (err) throw err;
          console.log("arquivo renomeado");
        })
      })

      var watcher = fs.watch(caminhopasta, {
        persistent: true
      }, (eventType, filename) => {
        console.log(filename);
        console.log(eventType);
        if (filename == "sai.txt" && eventType == 'change') {
          watcher.close(function () {
            console.log('fechado watcher')
          })
          fs.readFile(caminhopasta + "sai.txt", 'utf-8', (error, resposta) => {
            if (error) {
              throw error
            }
            fs.writeFile(caminhopasta + "sai.txt", '', (err) => {
              if (err) throw err;
              console.log("arquivo limpo");
            })
            let mensagem = resposta;
            alert = $mdDialog.alert({
              title: 'OK',
              multiple: true,
              textContent: mensagem.split(":")[1],
              ok: 'Fechar'
            });

            $mdDialog
              .show(alert)
              .finally(function () {
                alert = undefined;
              });


          });
        };
      });


    }

    $scope.inutilizaNumero = function (nota) {
      fs.writeFile(caminhopasta + "ent.tmp", 'NFe.InutilizarNFe(' + nota.getEmitente().getRegistroNacional() + ',numeração não utilizada devido a problemas técnicos,2018,55,1,' + nota.getNumero() + ',' + nota.getNumero() + ',1)', (err) => {
        if (err) throw err;
        console.log("arquivo salvo com sucesso");
        fs.rename(caminhopasta + "ent.tmp", caminhopasta + "ent.txt", (err) => {
          if (err) throw err;
          console.log("arquivo renomeado");
        })
      })

      var watcher = fs.watch(caminhopasta, {
        persistent: true
      }, (eventType, filename) => {
        console.log(filename);
        console.log(eventType);
        if (filename == "sai.txt" && eventType == 'change') {
          watcher.close(function () {
            console.log('fechado watcher')
          })
          fs.readFile(caminhopasta + "sai.txt", 'utf-8', (error, resposta) => {
            if (error) {
              throw error
            }
            fs.writeFile(caminhopasta + "sai.txt", '', (err) => {
              if (err) throw err;
              console.log("arquivo limpo");
            })
            let nnf = nota.getNumero();
            var retorno = ini.parse(resposta)
            let mensagem = retorno.INUTILIZACAO.XMotivo;
            if (mensagem === "Inutilização de número homologado") {
              let protocoloretorno = retorno.INUTILIZACAO.NProt;
              firebird.attach(conexao, function (err, db) {
                if (err) throw err;
                db.query('update SAIDA set protocoloinutiliza = ?  where empresa = ? and nota = ?', [protocoloretorno, remote.getGlobal('dados').configs.empresa, nnf], function (err, result) {
                  if (err) throw err;
                  console.log(result)
                  db.detach(function () {
                    $scope.carregar.pedido = '';
                    $scope.venda = new venda();
                    $scope.nota = new NFe();
                    alert = $mdDialog.alert({
                      title: 'Atenção',
                      multiple: true,
                      textContent: mensagem,
                      ok: 'Fechar'
                    });

                    $mdDialog
                      .show(alert)
                      .finally(function () {
                        alert = undefined;
                        let modal = window.open('', 'Danfe')
                      });
                  })
                })
              })
            } else {

              alert = $mdDialog.alert({
                title: mensagem.split(':')[0],
                multiple: true,
                textContent: mensagem.split(':')[1],
                ok: 'Fechar'
              });

              $mdDialog
                .show(alert)
                .finally(function () {
                  alert = undefined;
                });

            }
            console.log(retorno)
          });
        };
      });


    }


    $scope.cancel = function (ev) {
      var confirm = $mdDialog.confirm(ev)
        .title('Tem certeza que deseja cancelar?')
        .textContent('isso inutilizará a nota fiscal atual')
        .targetEvent(ev)
        .multiple(true)
        .ok('Confirmar cancelamento')
        .cancel('Voltar');

      $mdDialog.show(confirm).then(function () {
        if ($scope.nota.getNumero())
          $scope.inutilizaNumero($scope.nota)
        $mdDialog.cancel()
      }, function () {

      });

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
            $scope.nota = new NFe();
          });
          console.log(valor);
        }, function () {
          console.log('You cancelled the dialog.');
        });
    };


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
          locals: {}
        })
        .then(function (valor) {
          console.log('alteravalorvenda');
          $mdToast.show($mdToast.simple({
            'hideDelay': 0
          }).textContent('Aplicando Desconto...').position('top right left'));

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
          html += "<h2>FLORESTAL</h2><span>Relatório de Movimento de Contas</span></br><span>Período 01/07/2018 a 31/07/2018</span><hr><span>Cliente: " + venda.CODCLI + "  -  " + venda.RAZAO + "</span><hr>"
          html += "<table><thead>"
          html += "<tr><td>Documento</td><td>Data</td><td>Vencimento</td><td>Valor Entrada</td><td>Valor Saida</td><td></td></tr>"
          html += "</thead><tbody>"
          let saida = new dinheiro(0);
          for (let item of vendas) {
            if (item.VALORSAIDA) {
              saida.soma(item.VALORSAIDA)
            }
            console.log(saida)
            html += "<tr><td>" + (item.LCTO || '') + "</td><td>" + item.DATA.toLocaleDateString() + "</td><td>" + item.VENCIMENTO.toLocaleDateString() + "</td><td>" + item.VALOR.toString() + "</td><td>" + item.VALORSAIDA.toString() + "</td><td></td></tr>"
          }
          html += "</tbody><tfoot><tr><td colspan='6'><hr></td></tr>"
          html += "<tr><td>TOTAIS</td><td colspan='2'><td>" + venda.TOTALDESC.soma(venda.DESCONTOITEM).valor + "</td><td>" + saida.valor + "</td><th>= " + venda.TOTALDESC.subtrai(saida).toString() + "</th></tr>"
          html += "<tr><td colspan='5'>Desconto para pagamento até 15/08/2018</td><th>= " + venda.descontoPrev().soma(venda.DESCONTOITEM.desconto(4)).subtrai(saida).toString() + "</th></tr>"
          html += "</tfoot></table></body></html>"
          var pdf = require('html-pdf');

          var options = {
            format: 'Letter'
          };

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
            attachments: [{ // file on disk as an attachment
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
          if (item.VALORSAIDA) {
            saida.subtrai(item.VALORSAIDA)
          }
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
          $mdToast.show($mdToast.simple({
            'hideDelay': 0
          }).textContent('CARREGANDO...').position('top right left'));
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
      $scope.cliente = {
        'CODIGO': '',
        'RAZAO': ''
      };
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

    function inserePgtoCtrl($scope, $mdDialog, $mdToast, locals) { //controla o modal que faz o pagamento
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
      if (locals.fpagto.TIPO == 'DI') {
        $scope.max = new dinheiro(locals.venda.PAGAR.valor).soma(100)
      };
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

    function PagamentoCtrl($scope, $mdDialog, locals, $timeout, $mdToast) { //controla o modal que faz o pagamento       




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
            if (atual.ENT_SAI == 'S') {
              atual.TOTAL = atual.TOTAL * (-1)
            }
            return acumulador += atual.TOTAL;
          }, 0);
        }
        console.log($scope.vale)
      })
      $scope.venda = locals.dados;
      console.log($scope.venda);

      $scope.NFe = function (ev, venda) {
        $mdDialog.show({
            controller: geraNFCtrl,
            templateUrl: './app/features/janelas/selecionaNF.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            focusOnOpen: true,
            clickOutsideToClose: false,
            multiple: true,
            fullscreen: true, // Only for -xs, -sm breakpoints.,
            locals: {
              'venda': venda
            }
          })
          .then(function (response) {
            console.log(response)
          }, function () {
            console.log('You cancelled the dialog.');
          });
      };



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
          } else return true
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
        $mdToast.show($mdToast.simple({
          'hideDelay': 0
        }).textContent('Imprimindo Cupom...').position('top right left'));
        const Ncupom = await bemafi.gravaECF($scope.venda);
        console.log(Ncupom);
        $scope.venda.insereNucupom(Ncupom);
        $mdToast.updateTextContent('Confirmando Venda...');
        VendaSrvc.confirmaVenda($scope.venda, 'V').then(function (response) {
          $scope.imprime($scope.venda);
          $mdDialog.hide();
          console.log(response)
          $mdToast.hide();
        });
      }
      // $scope.nfFech = function () {
      //   let faturas = $scope.venda.PAGAMENTO.filter(function (item, index) {
      //     if (item.tipo == 'BL') {
      //       return item
      //     }
      //   })
      //   let pgtoAvista = $scope.venda.PAGAMENTO.filter(function (item, index) {
      //     if (item.tipo == 'NP') {
      //       return item.valor
      //     }
      //   })
      //   VendaSrvc.NumNota().then(function (nota) {
      //     $scope.venda.NFE = nota;
      //     console.log($scope.venda);
      //     NFe.iniciaNota($scope.venda, $scope.venda.PRODUTOS, faturas, pgtoAvista, nota)
      //   })
      // }
      $scope.concluirFech = function () {
        console.log(venda)
        VendaSrvc.confirmaVenda($scope.venda, 'F').then(function (response) {
          alert = $mdDialog.alert({
            title: "Atenção",
            multiple: true,
            textContent: 'Fechamento Confirmado',
            ok: 'Fechar'
          });
          $mdDialog
            .show(alert)
            .finally(function () {
              alert = undefined;
            });
          $mdDialog.hide();
          // $scope.imprime($scope.venda); $mdDialog.hide(); console.log(response)
          console.log(response)
        });
      }
      $scope.concluir = function () {
        VendaSrvc.confirmaVenda($scope.venda, 'V').then(function (response) {
          $scope.imprime($scope.venda);
          alert = $mdDialog.alert({
            title: "Atenção",
            multiple: true,
            textContent: reject,
            ok: 'Fechar'
          });
          $mdDialog
            .show(alert)
            .finally(function () {
              alert = undefined;
            });
          $mdDialog.hide();
          console.log(response)
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
      ENTER: function (name, code) {
        if (cx.codbar) {
          cx.insereproduto(cx.codbar);
          cx.codbar = ''
        }
      },
      A: function (name, code) {
        cx.codbar += name
      },
      ZERO: function (name, code) {
        if (cx.codbar) cx.codbar += '0'
      },
      ONE: function (name, code) {
        if (cx.codbar) cx.codbar += '1'
      },
      TWO: function (name, code) {
        if (cx.codbar) cx.codbar += '2'
      },
      THREE: function (name, code) {
        if (cx.codbar) cx.codbar += '3'
      },
      FOUR: function (name, code) {
        if (cx.codbar) cx.codbar += '4'
      },
      FIVE: function (name, code) {
        if (cx.codbar) cx.codbar += '5'
      },
      SIX: function (name, code) {
        if (cx.codbar) cx.codbar += '6'
      },
      SEVEN: function (name, code) {
        if (cx.codbar) cx.codbar += '7'
      },
      EIGHT: function (name, code) {
        if (cx.codbar) cx.codbar += '8'
      },
      NINE: function (name, code) {
        if (cx.codbar) cx.codbar += '9'
      },
      NUMPAD_0: function (name, code) {
        if (cx.codbar) cx.codbar += '0'
      },
      NUMPAD_1: function (name, code) {
        if (cx.codbar) cx.codbar += '1'
      },
      NUMPAD_2: function (name, code) {
        if (cx.codbar) cx.codbar += '2'
      },
      NUMPAD_3: function (name, code) {
        if (cx.codbar) cx.codbar += '3'
      },
      NUMPAD_4: function (name, code) {
        if (cx.codbar) cx.codbar += '4'
      },
      NUMPAD_5: function (name, code) {
        if (cx.codbar) cx.codbar += '5'
      },
      NUMPAD_6: function (name, code) {
        if (cx.codbar) cx.codbar += '6'
      },
      NUMPAD_7: function (name, code) {
        if (cx.codbar) cx.codbar += '7'
      },
      NUMPAD_8: function (name, code) {
        if (cx.codbar) cx.codbar += '8'
      },
      NUMPAD_9: function (name, code) {
        if (cx.codbar) cx.codbar += '9'
      },
      F3: function (name, code) {
        cx.abreVendas('', 'C', 'V')
      },
      F4: function (name, code) {
        cx.abreVendas('', 'R', 'V')
      },
      F6: function (name, code) {
        cx.abreVendasFechamento('', 'F')
      },
      F5: function (name, code) {
        cx.Pagar()
      }
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
          VendaSrvc.puxaLocal(valor).then(function () {
            alert("pedido Puxado")
          })
        }, function () {
          console.log('You cancelled the dialog.');
        });
    };
    cx.NFe = function (ev, venda) {
      $mdDialog.show({
          controller: geraNFCtrl,
          templateUrl: './app/features/janelas/selecionaNF.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          focusOnOpen: true,
          clickOutsideToClose: false,
          multiple: true,
          fullscreen: true, // Only for -xs, -sm breakpoints.,
          locals: {
            'venda': venda
          }
        })
        .then(function (response) {
          console.log(response)
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
      } else {
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