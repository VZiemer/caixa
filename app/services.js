const Firebird = require ('node-firebird');
const dinheiro = require('./dinheiro');
const Venda = require('./venda'); 
let options = {};
options.host = 'sistema.florestalferragens.com.br';
options.port = 3050;
options.database = 'c:\\bessani softwares\\florestal\\base\\estoque.fdb';
options.user = 'SYSDBA';
options.password = 'masterkey';
options.lowercase_keys = false; // set to true to lowercase keys
options.role = null;            // default
const remote = require('electron').remote;
(function(){
    'use strict';
    angular.module('ventronElectron')
    .factory(
        'VendaSrvc',['$http','$q', function($http,$q) {
        var venda = new Venda()
        // var prodVenda = [];
        var listaVendas = function (status) {
            venda = {};
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;
            var deferred = $q.defer();
            $http.post("http://sistema.florestalferragens.com.br/api/listavendas",{'token':token,'busca':status,'empresa':empresa,'vendaaberta':venda.LCTO})
            .then(function(response) {
                deferred.resolve(response);
            },function(response){console.log(response)}); 
            return deferred.promise;   
        }
        var listaProdVenda = function (venda) {
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;            
            var deferred = $q.defer();
            // console.log(venda);
            Firebird.attach(options, function(err, db) {
                if (err)
                    throw err;
                    if (err) throw err;
                    db.query("SELECT PRODUTO.CODIGO,PRODUTO.CODINTERNO,PRODUTO.ALIQ,PRODUTO.SITTRIB,PRODUTO.LOCAL,PRODUTO.DESCRICAO,PRODUTO.UNIDADE,PRODVENDA.CODIGO AS CODPRODVENDA,PRODVENDA.QTD AS QTDPEDIDO,PRODVENDA.qtdreserva,PRODVENDA.valor,(prodvenda.VALOR*prodvenda.QTD) as total,prodvenda.valorini FROM PRODVENDA JOIN PRODUTO ON PRODVENDA.CODPRO = PRODUTO.CODIGO WHERE PRODVENDA.CODVENDA = ?",venda, function(err, result) {
                        if (err) throw err;
                        console.log(result)
                        db.detach(function() {
                            deferred.resolve(result);
                        });			
                    });	
            })
            return deferred.promise; 
        }
        var atualizaVenda = function (dados) { // atualiza e/ ou carrega uma venda
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;            
            var deferred = $q.defer();
            // console.log(venda);
            Firebird.attach(options, function(err, db) {
                if (err)
                    throw err;
                // db = DATABASE
                db.query("update or insert into venda (codcli,nomecli,codvend,obs,status,data,lcto) values (?,?,?,?,?,current_date,?) RETURNING LCTO ",dados, function(err, result) {
                    // IMPORTANT: close the connection
                    console.log(result)
                    if (err) throw err;
                    db.query("select v.lcto,v.codcli,v.nomecli,v.empresa,v.codvend,v.total,f.nome,tr.id_transito,tr.status, tr.peso,tr.volumes,tr.frete,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,mb.valor, mb.vcto as vencimento,mb.codban from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join func f on f.codigo = v.codvend join cidade ci on c.codcidade = ci.cod_cidade left join movban mb on mb.lctosaida = v.lcto left join transp on tr.codtransp = transp.codigo where lcto =? order by mb.codigo",result.LCTO, function(err, res) {
                        if (err) throw err;
                        console.log(res)
                            venda=new Venda(res[0].LCTO,res[0].ID_TRANSITO,res[0].CGC,res[0].INSC,res[0].CODCLI,res[0].NOMECLI,res[0].EMAIL,res[0].FONE,res[0].RAZAO,res[0].ENDERECO,res[0].NUMERO,res[0].BAIRRO,res[0].CEP,res[0].CODIBGE,res[0].CODCIDADE,res[0].CIDADE,res[0].ESTADO,res[0].COMPLEMENTO,res[0].DESCONTO,res[0].FRETE,res[0].SEGURO,res[0].TOTAL );
                            db.query("SELECT PRODUTO.CODIGO,PRODUTO.CODINTERNO,PRODUTO.ALIQ,PRODUTO.SITTRIB,PRODUTO.LOCAL,PRODUTO.DESCRICAO,PRODUTO.UNIDADE,PRODUTO.CEST,PRODVENDA.CODIGO AS CODPRODVENDA,PRODVENDA.QTD AS QTDPEDIDO,PRODVENDA.qtdreserva,PRODVENDA.valor,(prodvenda.VALOR*prodvenda.QTD) as total,prodvenda.valorini FROM PRODVENDA JOIN PRODUTO ON PRODVENDA.CODPRO = PRODUTO.CODIGO WHERE PRODVENDA.CODVENDA = ?",venda.LCTO, function(err, result) {
                                if (err) throw err;
                                console.log(result)
                                db.detach(function() {
                                    result.forEach(function(item){venda.insereProduto(item)});
                                    deferred.resolve(venda);
                                });			
                            });
                    });	
                });
            })
            return deferred.promise;  
        } 
        var puxaLocal = function (pedido) {
            console.log(pedido)
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;            
            var deferred = $q.defer();
            console.log(venda);
            $http.post("http://sistema.florestalferragens.com.br/api/puxalocal",{'token':token,'pedido':pedido})
            .then(function(response) {
                console.log(response);
                venda = response.data;
                deferred.resolve(response.data);
            },function(response){console.log(response)}); 
            return deferred.promise;   
        }         
        var atualizaProdVenda = function (prodvenda) {
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;            
            var deferred = $q.defer();
            // console.log(prodvenda);
            Firebird.attach(options, function(err, db) {
                if (err)
                    throw err;
                    if (err) throw err;
                    db.query("update prodvenda set valor=? where codigo =? returning codigo,valor",[prodvenda.VALOR,prodvenda.CODPRODVENDA], function(err, result) {
                        if (err) throw err;
                        if (result.CODIGO) {
                            console.log(result.VALOR)
                            venda.alteraValorProduto(result.CODIGO,result.VALOR)
                        }
                        // console.log(venda)
                        db.detach(function() {
                            deferred.resolve(venda);
                        });			
                    });	
            })
            return deferred.promise;  
        } 
        var descontoTotalVenda = function (lcto,descpercentual) {
            // var token = remote.getGlobal('dados').param.token;
            // var empresa = remote.getGlobal('dados').configs.empresa;            
            // var deferred = $q.defer();
            // $http.post("http://sistema.florestalferragens.com.br/api/descontototalvenda",{'token':token,'dados':[venda,descpercentual],'empresa':empresa})
            // .then(function(response) {
            //         console.log(response.data)
            //         deferred.resolve(response.data);
            // },function(response){console.log(response)}); 
            // return deferred.promise;  
            var deferred = $q.defer();
            Firebird.attach(options, function(err, db) {
                if (err)
                    throw err;
                    if (err) throw err;
                    db.query("select * from  desconto(?,?)",[lcto,descpercentual], function(err, result) {
                        if (err) throw err;
                        // console.log(venda)
                        db.detach(function() {
                            venda.PRODUTOS= []
                            result.forEach(function(item){venda.insereProduto(item)});
                            deferred.resolve(venda);
                        });			
                    });	
            })            
            return deferred.promise; 
        } 
        var descontoFechamento = function (vendas,descpercentual) {         
            var deferred = $q.defer();
            Firebird.attach(options, function(err, db) {
                if (err)
                    throw err;
                // db = DATABASE
                db.query("select * from  DESCONTO_FECHAMENTO(?,?)",[vendas,descpercentual],req.body.dados, function(err, result) {
                    db.query("SELECT PRODUTO.CODIGO,PRODUTO.CODINTERNO,PRODUTO.ALIQ,PRODUTO.SITTRIB,PRODUTO.LOCAL,PRODUTO.DESCRICAO,PRODUTO.UNIDADE,PRODVENDA.CODIGO AS CODPRODVENDA,PRODVENDA.QTD AS QTDPEDIDO,PRODVENDA.qtdreserva,PRODVENDA.valor,(prodvenda.VALOR*prodvenda.QTD) as total,prodvenda.valorini FROM PRODVENDA JOIN PRODUTO ON PRODVENDA.CODPRO = PRODUTO.CODIGO WHERE PRODVENDA.CODVENDA in (?) ",vendas, function(err, result) {
                        // IMPORTANT: close the connection
                        db.detach(function() {
                            res.json(result);
                        });			
                    });	
                });		
            })
        }
                                  
        var buscaCliente = function(cliente) {
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;            
            var deferred = $q.defer();
            $http.post("http://sistema.florestalferragens.com.br/api/pesquisacliente",{'token':token,'busca':cliente,'empresa':empresa})
            .then(function(response) {
                if (response) {
                    // prodVenda = '';
                    deferred.resolve(response);
                }
            },function(response){console.log(response)}); 
            return deferred.promise;             
        }      
        var formasPagamento = function(cliente) {
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;
            var deferred = $q.defer();
            $http.post("http://sistema.florestalferragens.com.br/api/pagamentos",{'token':token,'busca':cliente,'empresa':empresa})
            .then(function(response) {
                if (response) {
                    // prodVenda = '';
                    deferred.resolve(response);
                }
            },function(response){console.log(response)}); 
            return deferred.promise;             
        }  
        var valeCliente = function(cliente) {
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;
            var deferred = $q.defer();
            $http.post("http://sistema.florestalferragens.com.br/api/valecliente",{'token':token,'busca':cliente,'empresa':empresa})
            .then(function(response) {
                console.log(response)
                if (response) {
                    deferred.resolve(response.data[0].TOTAL);
                }
            },function(response){console.log(response)}); 
            return deferred.promise;             
        }      
        var inserePacote = function(codbar) {
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
        var confirmaVenda = function (venda) {
            var empresa = remote.getGlobal('dados').configs.empresa;
            var deferred = $q.defer();
            let pagamento = venda.PAGAMENTO;
            let sql = "execute block as begin ";
            for (i = 0; i < pagamento.length; i++) {
                sql += "insert into movban (codban,data,ent_sai,hora,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao,banco,agencia,conta,nrcheque,emnome)";
                sql += "values (" + pagamento[i].codban + ",current_date,'E',current_time," + pagamento[i].valor + "," + venda.LCTO + ",1,'VANIUS','" + pagamento[i].vencimento.dataFirebird() + "'," + venda.LCTO + "," + venda.CODCLI + ",'" + pagamento[i].tipo + "','N'," + pagamento[i].banco + ",'" + pagamento[i].agencia + "','" + pagamento[i].conta + "','" + pagamento[i].nrcheque + "','" + pagamento[i].emnome + "');";
            }
            sql += "update venda set status='F',data=current_date,empresa="+ empresa +" where lcto=" + venda.LCTO + ";";
            sql += 'end';
            Firebird.attach(options, function(err, db) {
                if (err)
                    throw err;
                // db = DATABASE
                db.execute(sql, function(err, result) {
                    if (err)
                    throw err;
                    // IMPORTANT: close the connection
                    db.detach(function(){
                        console.log(sql)
                        deferred.resolve(result)
                    });
                });	
            })
            return deferred.promise;   
        }        
        var retornaprodVenda = function () {
            return  prodVenda;
        } 
        var vendaNota = function (venda) {
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;            
            var deferred = $q.defer();

            Firebird.attach(options, function(err, db) {
                if (err)
                    throw err;
                    db.query("select v.lcto,v.codcli,v.empresa,v.total,tr.peso,tr.volumes,tr.frete,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,mb.valor,  mb.vcto as vencimento,mb.codban,transp.codigo as codtransp, transp.transportador from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join cidade ci on c.codcidade = ci.cod_cidade join movban mb on mb.lctosaida = v.lcto left join transp on tr.codtransp = transp.codigo where lcto = ? order by mb.codigo",venda, function(err, vendanf) {
                        db.query("select pv.codpro,pv.valor,pv.qtd,pr.codinterno, pr.descricao, pr.unidade, pr.sittrib, pr.classfis as ncm,pr.cest, pr.orig, pr.grupo, pr.aliq FROM prodvenda pv join produto pr on pr.codigo = pv.codpro where pv.codvenda = ?",venda, function(err, prodvenda) {
                            // IMPORTANT: close the connection
                            db.detach(function() {
                                deferred.resolve([vendanf,prodvenda])
                            });	
                        });			
                    });	
            })

            



            return deferred.promise;   
        }    
        return {
            listaVendas : listaVendas,
            descontoTotalVenda : descontoTotalVenda,
            listaProdVenda : listaProdVenda,
            retornaprodVenda : retornaprodVenda,
            confirmaVenda : confirmaVenda,
            inserePacote : inserePacote,
            buscaCliente : buscaCliente,
            atualizaVenda : atualizaVenda,
            atualizaProdVenda : atualizaProdVenda,
            formasPagamento : formasPagamento,
            valeCliente : valeCliente,
            puxaLocal : puxaLocal,
            vendaNota : vendaNota,
            descontoFechamento : descontoFechamento
        }
    }]);    
})();
(function(){
    'use strict';
    angular.module('ventronElectron')
    .factory(
        'LoginSrvc',['$http','$q','$location', function($http,$q,$location) {
        var login = function (dados) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: 'http://sistema.florestalferragens.com.br/api/authenticate',
                data: { name: dados.usuario.toUpperCase(), password:  dados.senha },
                headers: {
                    'Content-Type': 'application/json',
                     'Authorization': dados.computador
                }}).then(function(response) {
                        remote.getGlobal('dados').param = response.data;
                        deferred.resolve(response);                    
                   },function(response){
                       console.log(response);
                   }); 
            return deferred.promise;            
        }
        var cadastra = function (dados) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: 'http://sistema.florestalferragens.com.br/app/cadastracomputador',
                data: { busca: 'aplicativo' },
                headers: {
                    'Content-Type': 'application/json',
                     'Authorization': dados.computador
                }}).then(function(response) {
                        console.log(response);
                        deferred.resolve(response.data);                    
                   },function(response){
                       console.log(response);
                   }); 
            return deferred.promise;            
        }        
        return {
            login : login,
            cadastra : cadastra
        }
    }]);    
})();