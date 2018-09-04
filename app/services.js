const Firebird = require('node-firebird');
const dinheiro = require('./dinheiro');
const Venda = require('./venda');
const options = require("./db.js");
const remote = require('electron').remote;
(function () {
    'use strict';
    angular.module('ventronElectron')
        .factory(
            'VendaSrvc', ['$http', '$q', function ($http, $q) {
                var venda = new Venda()
                // var prodVenda = [];
                var listaVendas = function (status) {
                    venda = {};
                    var token = remote.getGlobal('dados').param.token;
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    $http.post("http://sistema.florestalferragens.com.br/api/listavendas", {
                            'token': token,
                            'busca': status,
                            'empresa': empresa,
                            'vendaaberta': venda.LCTO
                        })
                        .then(function (response) {
                            deferred.resolve(response);
                        }, function (response) {
                            console.log(response)
                        });
                    return deferred.promise;
                }
                var CarregaFechamento = function (cliente) {
                    var token = remote.getGlobal('dados').param.token;
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    // console.log(venda);
                    Firebird.attach(options, function (err, db) {
                        if (err)
                            throw err;
                        if (err) throw err;
                        db.query("select * from NPABERTO", cliente, function (err, result) {
                            if (err) throw err;
                            console.log(result)
                            db.detach(function () {
                                deferred.resolve(result);
                            });
                        });
                    })
                    return deferred.promise;
                }
                var listaProdVenda = function (venda) {
                    var token = remote.getGlobal('dados').param.token;
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    // console.log(venda);
                    Firebird.attach(options, function (err, db) {
                        if (err)
                            throw err;
                        if (err) throw err;
                        // db.query("SELECT PRODUTO.CODIGO,PRODUTO.CODINTERNO,PRODUTO.ALIQ,PRODUTO.SITTRIB,PRODUTO.LOCAL,PRODUTO.DESCRICAO,PRODUTO.UNIDADE,PRODVENDA.CODIGO AS CODPRODVENDA,PRODVENDA.QTD AS QTDPEDIDO,PRODVENDA.qtdreserva,PRODVENDA.valor,(prodvenda.VALOR*prodvenda.QTD) as total,prodvenda.valorini FROM PRODVENDA JOIN PRODUTO ON PRODVENDA.CODPRO = PRODUTO.CODIGO WHERE PRODVENDA.CODVENDA = ?", venda, function (err, result) {
                        db.query("select * from LISTAPRODVENDAS(?)", venda, function (err, result) {
                            if (err) throw err;
                            console.log(result)
                            db.detach(function () {
                                deferred.resolve(result);
                            });
                        });
                    })
                    return deferred.promise;
                }
                var carregaNPcli = function (vendas) { // atualiza e/ ou carrega uma venda

                    let listaPedido = vendas.map(function (item, index) {
                        return item.LCTO;
                    }).toString()
                    venda = new Venda(vendas[0].LCTO, vendas[0].DATA, vendas[0].ID_TRANSITO, vendas[0].CGC, vendas[0].INSC, vendas[0].CODCLI, vendas[0].NOMECLI, '', '', vendas[0].EMAIL, vendas[0].FONE, vendas[0].RAZAO, vendas[0].ENDERECO, vendas[0].NUMERO, vendas[0].BAIRRO, vendas[0].CEP, vendas[0].CODIBGE, vendas[0].CODCIDADE, vendas[0].CIDADE, vendas[0].ESTADO, vendas[0].COMPLEMENTO, vendas[0].DESCONTO, vendas[0].FRETE, vendas[0].SEGURO, vendas[0].TOTAL);
                    vendas.forEach(function (item, index) {
                        if (index) {
                            venda.insereLcto(item.LCTO, item.ID_TRANSITO)
                        }
                    })
                    var token = remote.getGlobal('dados').param.token;
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    Firebird.attach(options, function (err, db) {
                        if (err)
                            throw err;
                        db.query("select * from LISTAPRODVENDAS(?)", listaPedido, function (err, result) {
                            if (err) throw err;
                            console.log(result)
                            db.detach(function () {
                                result.forEach(function (item) {
                                    if (item.QTDPEDIDO > 0) {
                                        venda.insereProduto(item)
                                        console.log("inseriu item")
                                    }
                                    if (item.QTDPEDIDO < 0) {
                                        venda.insereDescontos(item);
                                        console.log("descontou item")
                                    }
                                });
                                deferred.resolve(venda);
                            });
                        });
                    })
                    return deferred.promise;
                }
                var atualizaVenda = function (dados) { // atualiza e/ ou carrega uma venda
                    var token = remote.getGlobal('dados').param.token;
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    Firebird.attach(options, function (err, db) {
                        console.log("atualizavenda inicio")
                        if (err)
                            throw err;
                        db.query("update or insert into venda (codcli,nomecli,codvend,obs,status,data,lcto) values (?,?,?,?,?,current_date,?) RETURNING LCTO ", dados, function (err, result) {
                            console.log(result)
                            if (err) throw err;
                            db.query("select v.lcto,v.data,v.codcli,v.nomecli,v.empresa,v.codvend,v.frete,v.total,f.nome,tr.id_transito,tr.status, tr.peso,tr.volumes,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,mb.valor, mb.vcto as vencimento,mb.codban,f.nome as nomevend,prazocompra.descricao as faturamento from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join func f on f.codigo = v.codvend left join cidade ci on c.codcidade = ci.cod_cidade left join movban mb on mb.lctosaida = v.lcto left join transp on tr.codtransp = transp.codigo left join prazocompra on v.cdcondpagto = prazocompra.codigo where lcto =? order by mb.codigo", result.LCTO, function (err, res) {
                                if (err) throw err;
                                console.log(res)
                                venda = new Venda(res[0].LCTO, res[0].DATA, res[0].ID_TRANSITO, res[0].CGC, res[0].INSC, res[0].CODCLI, res[0].NOMECLI, res[0].CODVEND, res[0].NOMEVEND, res[0].EMAIL, res[0].FONE, res[0].RAZAO, res[0].ENDERECO, res[0].NUMERO, res[0].BAIRRO, res[0].CEP, res[0].CODIBGE, res[0].CODCIDADE, res[0].CIDADE, res[0].ESTADO, res[0].COMPLEMENTO, res[0].DESCONTO, res[0].FRETE, res[0].SEGURO, res[0].TOTAL,res[0].FATURAMENTO);
                                db.query("SELECT PRODUTO.CODIGO,PRODUTO.CODINTERNO,PRODUTO.ALIQ,PRODUTO.SITTRIB,PRODUTO.LOCAL,PRODUTO.DESCRICAO,PRODUTO.UNIDADE,PRODUTO.CEST,PRODVENDA.CODIGO AS CODPRODVENDA,PRODVENDA.QTD AS QTDPEDIDO,PRODVENDA.qtdreserva,PRODVENDA.valor,(prodvenda.VALOR*prodvenda.QTD) as total,prodvenda.valorini,prodvenda.prpromo FROM PRODVENDA JOIN PRODUTO ON PRODVENDA.CODPRO = PRODUTO.CODIGO WHERE PRODVENDA.CODVENDA = ?", venda.LCTO, function (err, result) {
                                    if (err) throw err;
                                    console.log(result)
                                    db.detach(function () {
                                        result.forEach(function (item) {
                                            venda.insereProduto(item)
                                        });
                                        console.log(venda)
                                        deferred.resolve(venda);
                                    });
                                });
                            });
                        });
                    })
                    return deferred.promise;
                }
                // var puxaLocal = function (pedido) {
                //     console.log(pedido)
                //     var token = remote.getGlobal('dados').param.token;
                //     var empresa = remote.getGlobal('dados').configs.empresa;
                //     var deferred = $q.defer();
                //     console.log(venda);
                //     $http.post("http://sistema.florestalferragens.com.br/api/puxalocal", {
                //             'token': token,
                //             'pedido': pedido
                //         })
                //         .then(function (response) {
                //             console.log(response);
                //             venda = response.data;
                //             deferred.resolve(response.data);
                //         }, function (response) {
                //             console.log(response)
                //         });
                //     return deferred.promise;
                // }
                var atualizaProdVenda = function (prodvenda) {
                    var token = remote.getGlobal('dados').param.token;
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    Firebird.attach(options, function (err, db) {
                        if (err)
                            throw err;
                        if (err) throw err;
                        db.query("update prodvenda set valor=? where codigo =? returning codigo,valor", [prodvenda.VALOR, prodvenda.CODPRODVENDA], function (err, result) {
                            if (err) throw err;
                            if (result.CODIGO) {
                                console.log(result.VALOR)
                                venda.alteraValorProduto(result.CODIGO, result.VALOR)
                            }
                            db.detach(function () {
                                deferred.resolve(venda);
                            });
                        });
                    })
                    return deferred.promise;
                }
                var descontoTotalVenda = function (lcto, descpercentual) {
                    var deferred = $q.defer();
                    let sql = ""
                    if (lcto.length === 1) { // desconto aplicado em venda única, antes do pagamento
                        console.log("desc fechamento")
                        sql = "select * from  desconto(?,?)";
                    }
                    if (lcto.length > 1) { // desconto aplicado em um fechamento
                        console.log("desc fechamento")
                        sql = "select * from  DESCONTO_FECHAMENTO(?,?)";
                    }
                    Firebird.attach(options, function (err, db) {
                        if (err)
                            throw err;
                        db.query(sql, [lcto, descpercentual], function (err, result) {
                            if (err) throw sql;
                            // console.log(venda)
                            db.detach(function () {
                                venda.PRODUTOS = []
                                result.forEach(function (item) {
                                    venda.insereProduto(item)
                                });
                                deferred.resolve(venda);
                            });
                        });
                    })
                    return deferred.promise;
                }
                var buscaCliente = function (cliente) {
                    var token = remote.getGlobal('dados').param.token;
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    $http.post("http://sistema.florestalferragens.com.br/api/pesquisacliente", {
                            'token': token,
                            'busca': cliente,
                            'empresa': empresa
                        })
                        .then(function (response) {
                            if (response) {
                                // prodVenda = '';
                                deferred.resolve(response);
                            }
                        }, function (response) {
                            console.log(response)
                        });
                    return deferred.promise;
                }
                var formasPagamento = function (cliente) {
                    var token = remote.getGlobal('dados').param.token;
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    $http.post("http://sistema.florestalferragens.com.br/api/pagamentos", {
                            'token': token,
                            'busca': cliente,
                            'empresa': empresa
                        })
                        .then(function (response) {
                            if (response) {
                                // prodVenda = '';
                                deferred.resolve(response);
                            }
                        }, function (response) {
                            console.log(response)
                        });
                    return deferred.promise;
                }
                var valeCliente = function (cliente) {
                    // var token = remote.getGlobal('dados').param.token;
                    // var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    Firebird.attach(options, function (err, db) {
                        if (err)
                            throw err;
                        db.query("select sum (vlbruto) as total,ent_sai  from movban where codcli=? and codban=107 and pagto is null group by ent_sai", cliente, function (err, result) {
                            if (err) throw err;
                            // console.log(venda)
                            db.detach(function () {
                                deferred.resolve(result);
                            });
                        });
                    })
                    // $http.post("http://sistema.florestalferragens.com.br/api/valecliente", { 'token': token, 'busca': cliente, 'empresa': empresa })
                    //     .then(function (response) {
                    //         console.log(response)
                    //         if (response) {
                    //             deferred.resolve(response.data[0].TOTAL);
                    //         }
                    //     }, function (response) { console.log(response) });
                    return deferred.promise;
                }
                var inserePacote = function (codbar) {
                    // var token = remote.getGlobal('dados').param.token;
                    // var empresa = remote.getGlobal('dados').configs.empresa;
                    // var deferred = $q.defer();
                    // $http.post("http://sistema.florestalferragens.com.br/api/inserepacote",{'token':token,'pacote':codbar,'empresa':empresa})
                    // .then(function(response) {
                    //     if (response) {
                    //         deferred.resolve(response);
                    //     }
                    // },function(response){console.log(response)}); 
                    // return deferred.promise;      
                }
                var confirmaVenda = function (venda, acao) {
                    let sql = "execute block as begin ";
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    if (acao === 'V') { // pagamento de uma venda no caixa
                        for (let item of venda.PAGAMENTO) {
                            sql += "insert into movban (codban,data,ent_sai,hora,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao,banco,agencia,conta,nrcheque,emnome)";
                            sql += "values (" + item.codban + ",current_date,'E',current_time," + item.valor + "," + venda.LCTO + ",1,'VANIUS','" + item.vencimento.dataFirebird() + "'," + venda.LCTO + "," + venda.CODCLI + ",'" + item.tipo + "','N'," + item.banco + ",'" + item.agencia + "','" + item.conta + "','" + item.nrcheque + "','" + item.emnome + "');";
                        }
                        sql += "update venda set status='F',data=current_date,nucupom=" + (venda.NUCUPOM || null) + ",nf_cupom=" + (venda.NFE || null) + ",empresa=" + empresa + ", cpfcupom= '" + venda.CPFCupom + "' where lcto=" + venda.LCTO + ";";
                    }
                    if (acao === 'F') { // pagamento de um fechamento no caixa

                        sql += "insert into movban (codban,pagto,data,ent_sai,hora,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao,banco,agencia,conta,nrcheque,emnome,historico) ";
                        sql += "values (107,current_date,current_date,'S',current_time," + venda.TOTALDESC.valueStr() + ",'',80,'VANIUS',current_date," + null + "," + venda.CODCLI + ",'NP','N',null,'','','','','Transf. para a Conta BOLETO');";
                        let numfat = 0
                        let totFaturas = venda.PAGAMENTO.reduce(function (acumulador, item) {
                            if (item.tipo === 'BL') {
                                return acumulador + 1
                            };
                            return acumulador;
                        }, 0)
                        for (let item of venda.PAGAMENTO) {
                            // if (item.tipo == 'BL') { docto = venda.NFE+'-'+(index+1)+'/'+venda.PAGAMENTO.length}
                            if (item.tipo === 'BL') {
                                numfat++;
                                sql += "insert into movban (codban,data,ent_sai,hora,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao,banco,agencia,conta,nrcheque,emnome,historico) ";
                                sql += "values (" + item.codban + ",current_date,'E',current_time," + item.valor + ",'" + (venda.NFE + "-" + numfat + '/' + totFaturas || '') + "',80,'VANIUS','" + item.vencimento.dataFirebird() + "'," + null + "," + venda.CODCLI + ",'" + item.tipo + "','N'," + item.banco + ",'" + item.agencia + "','" + item.conta + "','" + item.nrcheque + "','" + item.emnome + "','Transf. da Conta CLIENTES');";
                            }
                            if (item.tipo !== 'BL' && item.tipo !== 'NP') {
                                sql += "insert into movban (codban,data,ent_sai,hora,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao,banco,agencia,conta,nrcheque,emnome,historico) ";
                                sql += "values (" + item.codban + ",current_date,'E',current_time," + item.valor + ",'',80,'VANIUS','" + item.vencimento.dataFirebird() + "'," + null + "," + venda.CODCLI + ",'" + item.tipo + "','N'," + item.banco + ",'" + item.agencia + "','" + item.conta + "','" + item.nrcheque + "','" + item.emnome + "','Transf. da Conta CLIENTES');";
                            }
                        }
                        for (let item of venda.LCTO) {
                            sql += "update movban set pagto=CURRENT_DATE where lctosaida =" + item + "; ";
                        }
                    }
                    sql += 'end';
                    Firebird.attach(options, function (err, db) {
                        if (err)
                            throw err;
                        // db = DATABASE
                        db.execute(sql, function (err, result) {
                            if (err)
                                throw sql;
                            // IMPORTANT: close the connection
                            db.detach(function () {
                                console.log(sql)
                                deferred.resolve(result)
                            });
                        });
                    })
                    return deferred.promise;
                }
                var retornaprodVenda = function () {
                    return prodVenda;
                }
                var NumNota = function () {
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    Firebird.attach(options, function (err, db) {
                        if (err)
                            throw err;
                        // db = DATABASE
                        db.query('SELECT FIRST 1 NOTA FROM NFE ORDER BY NOTA DESC', function (err, result) {
                            db.detach(function () {
                                deferred.resolve(result[0].NOTA + 1)
                            });
                            // IMPORTANT: close the connection
                        });
                    });
                    return deferred.promise;

                }
                var cancelaCupom = function () {
                    var empresa = remote.getGlobal('dados').configs.empresa;
                    var deferred = $q.defer();
                    Firebird.attach(options, function (err, db) {
                        if (err)
                            throw err;
                        // db = DATABASE
                        db.query("update venda set cancela = 'S' where lcto = (select first 1 lcto from venda where empresa = ? and nucupom is not null order by nucupom desc )", empresa, function (err, result) {
                            db.detach(function () {
                                deferred.resolve('ok')
                            });
                            // IMPORTANT: close the connection
                        });
                    });
                    return deferred.promise;
                }


                var enviaNFe = function (nota) {
                    console.log(JSON.stringify(nota))
                    return new Promise((resolve, reject) => {
                        $http({
                            method: 'POST',
                            url: 'http://sistema.florestalferragens.com.br/enviaNota',
                            data: {
                                token: remote.getGlobal('dados').param.token,
                                empresa: remote.getGlobal('dados').configs.empresa,
                                nfe: nota
                            }
                        }).then(function (response) {
                            console.log(response)
                            console.log('mensagem', response[0])
                            console.log('nfe', response[1])
                            resolve(response[0], response[1]);
                        }, function (response) {
                            console.log('erros', response)
                            reject(response[0]);
                        });
                    });
                }

                var vendaNota = function (pedido) {
                    return new Promise((resolve, reject) => {
                        var token = remote.getGlobal('dados').param.token;
                        var empresa = remote.getGlobal('dados').configs.empresa;
                        // var deferred = $q.defer();
                        Firebird.attach(options, function (err, db) {
                            if (err)
                                reject(new Error(err));
                            db.query("select v.lcto,v.data,v.codcli,v.nomecli,v.empresa,v.codvend,v.frete,v.total,f.nome,tr.id_transito,tr.status, tr.peso,tr.volumes,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,mb.valor, mb.vcto as vencimento,mb.codban,f.nome as nomevend,prazocompra.descricao as faturamento from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join func f on f.codigo = v.codvend left join cidade ci on c.codcidade = ci.cod_cidade left join movban mb on mb.lctosaida = v.lcto left join transp on tr.codtransp = transp.codigo left join prazocompra on v.cdcondpagto = prazocompra.codigo where lcto =? order by mb.codigo", pedido, function (err, res) {
                                if (err) reject(new Error(err));
                                if (!res.length) reject(new Error('Venda não existe ou não está fechada'));
                                venda = new Venda(res[0].LCTO, res[0].DATA, res[0].ID_TRANSITO, res[0].CGC, res[0].INSC, res[0].CODCLI, res[0].NOMECLI, res[0].CODVEND, res[0].NOMEVEND, res[0].EMAIL, res[0].FONE, res[0].RAZAO, res[0].ENDERECO, res[0].NUMERO, res[0].BAIRRO, res[0].CEP, res[0].CODIBGE, res[0].CODCIDADE, res[0].CIDADE, res[0].ESTADO, res[0].COMPLEMENTO, res[0].DESCONTO, res[0].FRETE, res[0].SEGURO, res[0].TOTAL,res[0].FATURAMENTO);
                                venda.insereTransporte(res[0].VOLUMES, res[0].PESO, res[0].TIPOFRETE, res[0].TRANSPORTADOR)
                                res.forEach(function (item) {
                                    venda.inserePagamento({
                                        'valor': new dinheiro(item.VALOR),
                                        'tipo': item.TIPOPAG,
                                        'vencimento': item.VENCIMENTO,
                                        'pagto': '',
                                        'codban': item.CODBAN,
                                        'banco': null,
                                        'agencia': '',
                                        'conta': '',
                                        'nrcheque': '',
                                        'emnome': ''
                                    })
                                    console.log("inseriu item")
                                });
                                db.query("select * from LISTAPRODVENDAS(?)", pedido, function (err, result) {
                                    if (err) throw err;
                                    console.log(result)
                                    db.detach(function () {
                                        result.forEach(function (item) {
                                                venda.insereProduto(item)
                                                console.log("inseriu item")
                                        });
                                        resolve(venda);
                                    });
                                });
                            });
                        })

                    })
                }
                return {
                    listaVendas: listaVendas,
                    descontoTotalVenda: descontoTotalVenda,
                    listaProdVenda: listaProdVenda,
                    retornaprodVenda: retornaprodVenda,
                    confirmaVenda: confirmaVenda,
                    inserePacote: inserePacote,
                    buscaCliente: buscaCliente,
                    atualizaVenda: atualizaVenda,
                    atualizaProdVenda: atualizaProdVenda,
                    formasPagamento: formasPagamento,
                    valeCliente: valeCliente,
                    // puxaLocal: puxaLocal,
                    vendaNota: vendaNota,
                    NumNota: NumNota,
                    CarregaFechamento: CarregaFechamento,
                    carregaNPcli: carregaNPcli,
                    cancelaCupom: cancelaCupom,
                    enviaNFe: enviaNFe
                }
            }]);
})();
(function () {
    'use strict';
    angular.module('ventronElectron')
        .factory(
            'LoginSrvc', ['$http', '$q', '$location', function ($http, $q, $location) {
                var login = function (dados) {
                    var deferred = $q.defer();
                    $http({
                        method: 'POST',
                        url: 'http://sistema.florestalferragens.com.br/api/authenticate',
                        data: {
                            name: dados.usuario.toUpperCase(),
                            password: dados.senha
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': dados.computador
                        }
                    }).then(function (response) {
                        remote.getGlobal('dados').param = response.data;
                        console.log(response)
                        deferred.resolve(response);
                    }, function (response) {});
                    return deferred.promise;
                }
                var cadastra = function (dados) {
                    var deferred = $q.defer();
                    $http({
                        method: 'POST',
                        url: 'http://sistema.florestalferragens.com.br/app/cadastracomputador',
                        data: {
                            busca: 'aplicativo'
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': dados.computador
                        }
                    }).then(function (response) {
                        console.log(response);
                        deferred.resolve(response.data);
                    }, function (response) {
                        console.log(response);
                    });
                    return deferred.promise;
                }
                return {
                    login: login,
                    cadastra: cadastra
                }
            }]);
})();