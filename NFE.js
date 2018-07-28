// const fs = require('fs');
// const ini = require('ini');
// var config = ini.parse(fs.readFileSync('config/config.ini', 'utf-8'))
// console.log(config)
// console.log(config.PASTA)
// const Firebird = require('node-firebird');
// const options = require("./db.js")
// function formatDate(date) {
//   var d = new Date(date),
//     month = '' + (d.getMonth() + 1),
//     day = '' + d.getDate(),
//     year = d.getFullYear();
//   if (month.length < 2) month = '0' + month;
//   if (day.length < 2) day = '0' + day;
//   return [day, month, year].join('/');
// }
// const tabst = {
//   'SP': { 'RJ': 12, 'PR': 12, 'RS': 12 },
//   'RJ': {},
//   'RS': {}
// }
// function dinheiro(decimal) {
//   return Math.floor((decimal * 100) + 0.0001) / 100
// }
// let numNota = '';
// let infoAdic = '';
// let pgtoavista = '';
// let ProdNota = [];
// let totais = {};
// let empresa = {};
// let cliente = {};
// let produtos = [];
// let transportador = {};
// let verProc = '1.0.0';
// let chave = '';
// let watcher = null;
// let TvBC = 0, TvICMS = 0, TvICMSDeson = 0, TvBCST = 0, TvST = 0, TvProd = 0, TvFrete = 0, TvSeg = 0, TvDesc = 0, TvII = 0, TvIPI = 0, TvPIS = 0, TvCOFINS = 0, TvOutro = 0;
// //FUNÇÕES AUXILIARES
// // completa uma string com um digito determinado á esquerda (0 á esquerda por exemplo)
// function zeroEsq(valor, comprimento, digito) {
//   var length = comprimento - valor.toString().length + 1;
//   return Array(length).join(digito || '0') + valor;
// };
// // arredonda para cima um valor informando casas decimais
// function roundSup(value, decimals) {
//   return Number(Math.ceil(value + 'e' + decimals) + 'e-' + decimals);
// }
// // Gera a chave de uma nota fiscal
// function Gerachave(cUF, AAMM, CNPJ, mod, serie, nNF, tpEmis) {
//   let rng = Math.floor(Math.random() * 90000000) + 10000000;
//   let chave = '' + cUF + AAMM + CNPJ + mod + serie + zeroEsq(nNF, 9) + rng + tpEmis;
//   let DV = GeraDV(chave);
//   chave += DV;
//   return chave;
// }
// // Gera o DV de uma nota segundo padrão da receita
// function GeraDV(chave) {
//   let pesos = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
//   let SomaPond = 0;
//   chave.split('').forEach(function (item, index) {
//     SomaPond += item * pesos[index];
//   })
//   let DV = 11 - parseInt((roundSup(SomaPond / 11, 1) - parseInt(SomaPond / 11)) * 10)
//   return DV
// }
// function Nota(versao, cUF, AAMM, CNPJ, mod, serie, nNF, tpEmis, finNFe) {
//   chave = Gerachave(cUF, AAMM, CNPJ, mod, serie, nNF, tpEmis);
//   this.infNFe = {
//     versao: versao
//   }
//   this.Identificacao = {
//     cNF: chave.slice(34, 42),
//     natOp: 'VENDA DE MERCADORIA',
//     indPag: 0,
//     mod: mod,
//     serie: serie,
//     nNF: nNF,
//     dhEmi: new Date(),
//     dhSaiEnt: '',
//     tpNF: 1,
//     idDest: 1,
//     tpImp: 1,
//     tpEmis: tpEmis,
//     finNFe: finNFe,
//     indFinal: 1,
//     indPres: 1,
//     procEmi: 0,
//     verProc: verProc,
//     dhCont: '',
//     xJust: ''
//   }
// }
// Nota.prototype.InsereVolume = function (qtd, esp, peso) {
//   this.Volume001 = {
//     'qVol': qtd || '',
//     'esp': esp || '',
//     'Marca': '',
//     'nVol': '',
//     'pesoL': '',
//     'pesoB': peso || ''
//   }
// }
// Nota.prototype.InsereTransportador = function (tipofrete, nomeTransp) {
//   this.Transportador = {
//     modFrete: tipofrete,
//     CNPJCPF: '',
//     xNome: nomeTransp || '',
//     IE: '',
//     xEnder: '',
//     xMun: '',
//     UF: '',
//     vServ: '',
//     vBCRet: '',
//     pICMSRet: '',
//     vICMSRet: '',
//     CFOP: '',
//     cMunFG: '',
//     Placa: '',
//     UFPlaca: '',
//     RNTC: '',
//     vagao: '',
//     balsa: ''
//   }
// }
// Nota.prototype.GravaBanco = function (produtos, nomexml, protocolo) {
//   let CFOP = '';
//   let NATOPER = '';
//   let indIEDest = '';
//   if (this.Destinatario.UF == 'SP' && this.Destinatario.indIEDest == 9) {
//     CFOP = 5102;
//     indIEDest = 'N';
//     NATOPER = 'VENDA MERC NO ESTADO';
//   }
//   else if (this.Destinatario.UF == 'SP' && this.Destinatario.indIEDest != 9) {
//     CFOP = 5102;
//     indIEDest = 'C';
//     NATOPER = 'VENDA MERC NO ESTADO';
//   }
//   else if (this.Destinatario.UF != 'SP' && this.Destinatario.indIEDest == 9) {
//     CFOP = 6108;
//     NATOPER = 'VENDA DE MERCADORIA ADQUIR.OU REC.TERC. A NÃO CONTRIBUINTE';
//   }
//   else if (this.Destinatario.UF != 'SP' && this.Destinatario.indIEDest != 9) {
//     CFOP = 6102;
//     NATOPER = 'VENDA MERC FORA ESTADO';
//   }
//   let sql = "execute block as begin ";
//   sql = sql + "insert into nfe (nota,data,codcli,nome,cnpj,inscest,endereco,end_numero,bairro,cidade,estado,cep,codcidade,fone,total,cancela,frete,entsai,basesubs,vlsubs,baseicms,valoricms,vlfrete,vldesconto,outrasdesp,cnf,finalidade,formapagto,indfinal,indiedest,cfop,natoper,nomexml,protocolo,pesobruto,quantidade,especie,codtran) values (" + this.Identificacao.nNF + ",CURRENT_DATE," + cliente.CODCLI + ",'" + this.Destinatario.xNome + "'," + this.Destinatario.CNPJCPF + ",'" + this.Destinatario.IE + "','" + this.Destinatario.xLgr + "','" + this.Destinatario.nro + "','" + this.Destinatario.xBairro + "','" + this.Destinatario.xMun + "','" + this.Destinatario.UF + "','" + this.Destinatario.CEP + "'," + cliente.CODCIDADE + ",'" + this.Destinatario.Fone + "'," + this.Total.vNF + ",'E','1','S'," + this.Total.vBCST + "," + this.Total.vST + "," + this.Total.vBC + "," + this.Total.vICMS + "," + this.Total.vFrete + "," + this.Total.vDesc + "," + this.Total.vOutro + ",'" + this.Identificacao.cNF + "'," + this.Identificacao.finNFe + ",1," + this.Identificacao.indFinal + ",'" + indIEDest + "','" + CFOP + "','" + NATOPER + "','" + nomexml + "','" + protocolo + "'," + (this.Volume001.pesoB || null) + "," + (this.Volume001.qVol || null) + ",'" + (this.Volume001.esp || '') + "'," + (cliente.CODTRANSP || null) + ");";
//   for (i = 0; i < produtos.length; i++) {
//     let indice = zeroEsq(i + 1, 3, 0);
//     let codigo = produtos[i].CODPRO;
//     sql += "insert into prodnfe (codnota,codpro,qtd,vluni,unid,aliq,ipi,cfop,impostoicms,baseicms,impostost,basest,sittrib) values (" + this.Identificacao.nNF + "," + codigo + "," + this["Produto" + indice].qCom + "," + this["Produto" + indice].vUnCom + ",'" + this["Produto" + indice].uCom + "'," + produtos[i].ALIQ + ",0," + this["Produto" + indice].CFOP + "," + (this["ICMS" + indice].pICMS) + "," + this["ICMS" + indice].vBC + "," + (this["ICMS" + indice].pICMSST || 0) + "," + this["ICMS" + indice].vBCST + "," + (this["ICMS" + indice].CST || this["ICMS" + indice].CSOSN) + "); "
//   }
//   sql += "end;"
//   Firebird.attach(options, function (err, db) {
//     if (err)
//       throw err;
//     db.execute(sql, function (err, result) {
//       let sql1 = "execute block as begin";
//       for (i = 0; i < cliente.PEDIDO; i++) {
//         sql1 += "update transito set nfe = " + this.Identificacao.nNF + " where documento = " + cliente[i].PEDIDO;
//       }
//       db.execute(sql1, function (err, result) {
//         db.detach(function () {
//           watcher.close();
//         });
//       });
//     });
//   });
//   console.log(sql)
//   pgtoavista = ''
//   cliente = {
//     'CODCLI': '',
//     'CODCIDADE': '',
//     'PEDIDO': '',
//     'CODTRANSP': ''
//   }
//   totais = {
//     'TOTAL': 0,
//     'DESCONTO': 0,
//     'OUTRO': 0,
//     'FRETE': 0,
//     'SEGURO': 0,
//     'PRODICMS': 0,
//     'PRODST': 0
//   }

// }
// Nota.prototype.InsereEmitente = function (CNPJCPF, xNome, xFant, IE, CRT, xLgr, nro, xCpl, xBairro, cMun, xMun, UF, CEP, cPais, xPais, Fone, cUF, cMunFG) {
//   this.Emitente = {
//     CNPJCPF: CNPJCPF,
//     xNome: xNome,
//     xFant: xFant,
//     IE: IE,
//     IEST: '',
//     IM: '',
//     CNAE: '',
//     CRT: CRT,
//     xLgr: xLgr,
//     nro: nro,
//     xCpl: xCpl,
//     xBairro: xBairro,
//     cMun: cMun,
//     xMun: xMun,
//     UF: UF,
//     CEP: CEP,
//     cPais: cPais,
//     xPais: xPais,
//     Fone: Fone,
//     cUF: cUF,
//     cMunFG: cMunFG
//   };
// }
// Nota.prototype.InsereDestinatario = function (CNPJCPF, xNome, IE, xLgr, nro, xCpl, xBairro, cMun, xMun, UF, CEP, cPais, xPais, Fone, Email) {
//   if (UF !== this.Emitente.UF) {
//     this.Identificacao.idDest = 2;
//   }
//   let indIE = 1;
//   let IEe = IE;
//   if (CNPJCPF.length == 11) { indIE = 9; IEe = ''; }
//   if (IEe == 'ISENTO') { indIE = 2; IEe = ''; }
//   if (UF == 'SP') {
//     NATOPER = 'VENDA MERC NO ESTADO';
//     this.Identificacao.natOp = NATOPER;
//   }
//   else if (UF != 'SP' && indIE == 9) {
//     NATOPER = 'VENDA DE MERCADORIA ADQUIR.OU REC.TERC. A NÃO CONTRIBUINTE';
//     this.Identificacao.natOp = NATOPER;
//   }
//   else if (UF != 'SP' && indIE != 9) {
//     NATOPER = 'VENDA MERC FORA ESTADO';
//     this.Identificacao.natOp = NATOPER;
//   }
//   this.Destinatario = {
//     idEstrangeiro: '',
//     CNPJCPF: CNPJCPF,
//     xNome: xNome,
//     indIEDest: indIE,
//     IE: IEe,
//     ISUF: '',
//     Email: Email || null,
//     xLgr: xLgr,
//     nro: nro,
//     xCpl: xCpl || null,
//     xBairro: xBairro,
//     cMun: cMun,
//     xMun: xMun,
//     UF: UF,
//     CEP: CEP,
//     cPais: cPais,
//     xPais: xPais,
//     Fone: Fone
//   }
// };
// Nota.prototype.CalculaTotais = function () {
//   this.Total = {
//     'vBC': dinheiro(TvBC),
//     'vICMS': dinheiro(TvICMS),
//     'vICMSDeson': dinheiro(TvICMSDeson),
//     'vBCST': dinheiro(TvBCST),
//     'vST': dinheiro(TvST),
//     'vProd': dinheiro(TvProd),
//     'vFrete': dinheiro(TvFrete),
//     'vSeg': dinheiro(TvSeg),
//     'vDesc': dinheiro(TvDesc),
//     'vII': dinheiro(TvII),
//     'vIPI': dinheiro(TvIPI),
//     'vPIS': dinheiro(TvPIS),
//     'vCOFINS': dinheiro(TvCOFINS),
//     'vOutro': dinheiro(TvOutro),
//     'vNF': dinheiro(TvBCST - TvICMSDeson + TvST + TvProd + TvFrete + TvSeg - TvDesc + TvII + TvIPI + TvPIS + TvCOFINS + TvOutro),
//     'vTotTrib': ''
//   };
//   this.DadosAdicionais = {
//     'infCpl': pgtoavista + 'Documento emitido por ME ou EPP optante pelo simples nacional;Estabelecimento impedido de recolher o ICMS pelo simples nacional no inciso 1 do art. 2 da LC 123/2006;IMPOSTO RECOLHIDO POR SUBSTITUICAO ART 313-Y DO RICMS;Valor dos produtos Substituicao Tributaria R$ ' + totais.PRODST.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.") + ';Valor dos produtos Tributado pelo Simples Nacional R$ ' + totais.PRODICMS.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.") + '.'
//     // pgtoavista +';'+ infoAdic+ '
//   };

// }
// Nota.prototype.InsereDuplicatas = function (numero, valor, vencimento) {
//   if (typeof valor == 'object') { valor = valor.valueOf() }
//   this.Identificacao.indPag = 1;
//   let nfat = '';
//   switch (numero) {
//     case '001':
//       nfat = 'A'
//       break;
//     case '002':
//       nfat = 'B'
//       break;
//     case '003':
//       nfat = 'C'
//       break;
//     case '004':
//       nfat = 'D'
//       break;
//     case '005':
//       nfat = 'E'
//       break;
//     case '006':
//       nfat = 'F'
//       break;
//     case '007':
//       nfat = 'G'
//       break;
//     case '008':
//       nfat = 'H'
//       break;
//   }
//   this['Duplicata' + numero] = {
//     'nDup': this.Identificacao.nNF + nfat,
//     'dVenc': formatDate(vencimento),
//     'vDup': valor
//   }
// }
// Nota.prototype.InsereProduto = function (indice, orig, sittrib, cod, descricao, ncm, cest, un, qtd, valor, aliq, codigo) {
//   let indIEDest = this.Destinatario.indIEDest;
//   let UFDest = this.Destinatario.UF;
//   let UFOrig = this.Emitente.UF;
//   let RegimeTrib = this.Emitente.CRT;
//   if (typeof valor == 'object') { valor = valor.valueOf() }
//   function defineImposto() {
//     let vBC = 0;
//     let vICMS = 0;
//     let CST = '';
//     let CSOSN = '';
//     let vBCST = 0;
//     let pICMS = 0;
//     let pICMSST = 0;
//     let vICMSST = 0;
//     if (RegimeTrib == 1) {
//       if (sittrib == 101) {  // sem S.T.
//         CSOSN = orig + '101';
//         totais.PRODICMS += dinheiro(valor * qtd);
//       }
//       if (sittrib == 060) {  // com S.T.
//         CSOSN = orig + '500';
//         totais.PRODST += dinheiro(valor * qtd);
//       }
//     }
//     if (RegimeTrib == 2) {
//       // if (UFOrig != UFDest) { aliq = 12; if (orig == 2) { aliq = 4 } }
//       if (sittrib == '101') {  // sem S.T.
//         vBC = dinheiro(qtd * valor * totais.FRETE / totais.TOTAL + (valor * qtd));
//         TvBC += vBC;
//         console.log(vBC)
//         vICMS = dinheiro(vBC * aliq / 100);
//         TvICMS += vICMS;
//         CST = '00';
//         pICMS = aliq;
//         totais.PRODICMS += dinheiro(valor * qtd);
//       }
//       else if (sittrib == '060') {  // com S.T.
//         vBC = 0;
//         TvBC += 0;
//         vICMS = 0;
//         TvICMS += vICMS;
//         CST = '60';
//         pICMS = 0;
//         totais.PRODST += dinheiro(valor * qtd);
//       }
//     }
//     return {
//       orig: orig,
//       CST: CST,
//       CSOSN: CSOSN,
//       modBC: '',
//       pRedBC: '',
//       vBC: vBC,
//       pICMS: pICMS,
//       vICMS: vICMS,
//       modBCST: '',
//       pMVAST: '',
//       pRedBCST: '',
//       vBCST: vBCST,
//       pICMSST: pICMSST,
//       vICMSST: vICMSST,
//       UFST: '',
//       pBCOp: '',
//       vBCSTRet: '',
//       vICMSSTRet: '',
//       motDesICMS: '',
//       pCredSN: '',
//       vCredICMSSN: '',
//       vBCSTDest: '',
//       vICMSSTDest: '',
//       vICMSDeson: '',
//       vICMSOp: '',
//       pDif: '',
//       vICMSDif: ''
//     }
//   }
//   function defineCFOP() {
//     console.log("defineCFOP")
//     console.log(UFDest)
//     console.log(UFOrig)
//     if (UFDest == UFOrig) {
//       if (sittrib == '101') {
//         console.log('5102')
//         return '5102';
//       }
//       else if (sittrib == '060') {
//         console.log('5405')
//         return '5405';
//       }
//     }
//     if (UFDest != UFOrig) {
//       if (indIEDest == 1) {
//         if (sittrib == '101') {
//           console.log('6102')
//           return '6102';
//         }
//         else if (sittrib == '060') {
//           return '6404';
//           console.log('6404')
//         }
//         // else if (sittrib == '101') {
//         //   return '6403';
//         //   console.log('6403')
//         // }        
//       }
//       else {
//         return '6108';
//       }
//     }
//     else { console.log('0000') }
//   }
//   TvProd += dinheiro((qtd * valor));
//   TvFrete += dinheiro((qtd * valor) * totais.FRETE / totais.TOTAL);
//   TvSeg += dinheiro((qtd * valor) * totais.SEGURO / totais.TOTAL);
//   TvDesc += dinheiro((qtd * valor) * totais.DESCONTO / totais.TOTAL);
//   TvOutro += dinheiro((qtd * valor) * totais.OUTRO / totais.TOTAL);

//   this['Produto' + indice] = {
//     cProd: cod,
//     cEAN: '',
//     xProd: descricao,
//     NCM: ncm,
//     CEST: cest,
//     EXTIPI: '',
//     CFOP: defineCFOP(),
//     uCom: un,
//     qCom: qtd,
//     vUnCom: valor,
//     vProd: dinheiro(qtd * valor),
//     cEANTrib: '',
//     uTrib: un,
//     qTrib: qtd,
//     vUnTrib: valor,
//     vFrete: dinheiro((qtd * valor) * totais.FRETE / totais.TOTAL),
//     vSeg: dinheiro((qtd * valor) * totais.SEGURO / totais.TOTAL),
//     vDesc: dinheiro((qtd * valor) * totais.DESCONTO / totais.TOTAL),
//     vOutro: dinheiro((qtd * valor) * totais.OUTRO / totais.TOTAL),
//     indTot: 1,
//     xPed: '',
//     nItemPed: '',
//     nFCI: '',
//     nRECOPI: '',
//     pDevol: '',
//     vIPIDevol: '',
//     vTotTrib: '',
//     infAdProd: ''
//   };
//   this['ICMS' + indice] = defineImposto();

//   this['IPI' + indice] = {
//     CST: '',
//     clEnq: '',
//     CNPJProd: '',
//     cSelo: '',
//     qSelo: '',
//     cEnq: '',
//     vBC: '',
//     qUnid: '',
//     vUnid: '',
//     pIPI: '',
//     vIPI: ''
//   };
//   this['II' + indice] = {
//     vBC: '',
//     vDespAdu: '',
//     vII: '',
//     vIOF: ''
//   };
//   this['PIS' + indice] = {
//     CST: '',
//     vBC: '',
//     pPIS: '',
//     qBCProd: '',
//     vAliqProd: '',
//     vPIS: ''
//   };
//   this['PISST' + indice] = {
//     vBC: '',
//     pPis: '',
//     qBCProd: '',
//     vAliqProd: '',
//     vPIS: ''
//   },
//     this['COFINS' + indice] = {
//       CST: '',
//       vBC: '',
//       pCOFINS: '',
//       qBCProd: '',
//       vAliqProd: '',
//       vCOFINS: ''
//     };
//   this['COFINSST' + indice] = {
//     vBC: '',
//     pCOFINS: '',
//     qBCProd: '',
//     vAliqProd: '',
//     vCOFINS: ''
//   };
//   this['ISSQN' + indice] = {
//     vBC: '',
//     vAliq: '',
//     vISSQN: '',
//     cMunFG: '',
//     cListServ: '',
//     cSitTrib: '',
//     vDeducao: '',
//     vDeducao: '',
//     vOutro: '',
//     vDescIncond: '',
//     vDescCond: '',
//     vISSRet: '',
//     indISS: '',
//     cServico: '',
//     cMun: '',
//     cPais: '',
//     nProcesso: '',
//     indIncentivo: ''
//   };
// };
// exports.iniciaNota = function (venda, produtos, faturas, avista, nota, info) {
//   infoAdic = info;
//   totais = {};
//   cliente = {};
//   TvBC = 0;
//   TvICMS = 0;
//   TvICMSDeson = 0;
//   TvBCST = 0;
//   TvST = 0;
//   TvProd = 0;
//   TvFrete = 0;
//   TvSeg = 0;
//   TvDesc = 0;
//   TvII = 0;
//   TvIPI = 0;
//   TvPIS = 0;
//   TvCOFINS = 0;
//   TvOutro = 0;
//   cliente = {
//     'CODCLI': venda.CODCLI,
//     'CODCIDADE': venda.CODCIDADE,
//     'PEDIDO': venda.LCTO.toString(),
//     'CODTRANSP': venda.TRANSPORTE.CODTRANSP || null
//   }
//   totais = {
//     'TOTAL': venda.TOTALPRODUTOS || 0,
//     'DESCONTO': venda.DESCONTO || 0,
//     'OUTRO': venda.OUTRO || 0,
//     'FRETE': venda.FRETE || 0,
//     'SEGURO': 0,
//     'PRODICMS': 0,
//     'PRODST': 0
//   }
//   numNota = nota;
//   let hoje = new Date();
//   let AAMM = '' + hoje.getFullYear().toString().substr(-2) + '' + zeroEsq(hoje.getMonth() + 1, 2, 0)
//   faznota();
//   function faznota() {
//     var NF = new Nota('3.10', 52, AAMM, '49419732000100', '55', '001', numNota, '1', '1');
//     NF.InsereEmitente('49419732000100', 'FLORESTAL COMÉRCIO DE FERRAGENS LTDA EPP', 'FLORESTAL FERRAGENS', '244147383110', '2', 'RUA SALTO GRANDE', '583', '', 'JARDIM DO TREVO', '3509502', 'CAMPINAS', 'SP', '13040001', '1058', 'BRASIL', '32783644', '35', '3509502')
//     NF.InsereDestinatario(venda.CGC, venda.RAZAO, venda.INSC, venda.ENDERECO, venda.NUMERO, venda.COMPLEMENTO, venda.BAIRRO, venda.CODIBGE, venda.CIDADE, venda.ESTADO, venda.CEP, '1058', 'BRASIL', venda.FONE, venda.EMAIL)
//     let indice = 1;
//     for (let item of venda.PAGAMENTO) {
//       if (item.tipo === 'BL') {
//         NF.InsereDuplicatas(zeroEsq(indice, 3, 0), item.valor, item.vencimento)
//         indice++;
//       }
//     }
//     if (venda.DESCONTOITEM.valor) {
//       pgtoavista = "Valor pago a vista R$ " + venda.DESCONTOITEM.valor*(-1) + ";";
//     }    
//     indice = 1;
//     produtos.forEach(function (item, index) {
//       NF.InsereProduto(zeroEsq(index + 1, 3, 0), item.ORIG, item.SITTRIB, item.CODPRO, item.DESCRICAO, item.NCM, item.CEST, item.UNIDADE, item.QTD, item.VALOR, item.ALIQ, item.CODPRO);
//     })
//     NF.InsereTransportador(venda.TRANSPORTE.TIPOFRETE, venda.TRANSPORTE.TRANSPORTADOR)
//     NF.InsereVolume(venda.TRANSPORTE.VOLUMES, 'CX', venda.TRANSPORTE.PESO)

//     NF.CalculaTotais();
//     watcher = fs.watch("" + config.PASTA + "", { persistent: true }, (eventType, filename) => {
//       console.log(filename);
//       console.log(eventType);
//       if (filename == config.RETORNO && eventType == 'change') {
//         fs.readFile("" + config.PASTA + "\\" + config.RETORNO + "", 'utf-8', (erro, resposta) => {
//           if (erro) { throw erro }
//           // fs.unlinkSync(""+config.PASTA+"\\"+config.RETORNO+"");
//           var retorno = ini.parse(resposta)
//           console.log(retorno)
//           if (retorno['NFE' + NF.Identificacao.nNF].XMotivo == "Autorizado o uso da NF-e") {
//             let nomexml = retorno['NFE' + NF.Identificacao.nNF].ChNFe + '-nfe.xml';
//             let protocolo = retorno['NFE' + NF.Identificacao.nNF].NProt;
//             NF.GravaBanco(produtos, nomexml, protocolo);
//             alert(retorno['NFE' + NF.Identificacao.nNF].XMotivo)
//           }
//           else {
//             let nomexml = retorno['NFE' + NF.Identificacao.nNF].ChNFe + '-nfe.xml';
//             let protocolo = retorno['NFE' + NF.Identificacao.nNF].NProt;
//             console.log(retorno['NFE' + NF.Identificacao.nNF].XMotivo)
//             alert(retorno['NFE' + NF.Identificacao.nNF].XMotivo)
//           }
//         });
//       };
//     });
//     let textoini = ini.stringify(NF);
//     console.log(textoini)
//     fs.writeFile("" + config.PASTA + "" + config.ARQUIVO + "", 'NFe.CriarEnviarNFe("\n' + textoini + '\n",1)', (err) => {
//       if (err) throw err;
//       console.log("arquivo salvo com sucesso em " + config.PASTA + "" + config.ARQUIVO + "");
//       fs.rename("" + config.PASTA + "" + config.ARQUIVO + "", "" + config.PASTA + "" + config.ENVIO + "", function (err) {

//         if (err) throw err;
//       })
//     });
//   }
// }