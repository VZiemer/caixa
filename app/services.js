const remote = require('electron').remote;
(function(){
    'use strict';
    
    angular.module('ventronElectron')
    .factory(
        'VendaSrvc',['$http','$q', function($http,$q) {
        var venda = {
                  'LCTO':null,
                  'DATA':'',
                  'CODCLI':'',
                  'NOMECLI':'',
                  'CODVEND':'',
                  'NOMEVEND':'',
                  'OBS':'',
                  'STATUS':''
                };
        var prodVenda = [];
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
            $http.post("http://sistema.florestalferragens.com.br/api/listaprodvenda",{'token':token,'busca':venda,'empresa':empresa})
            .then(function(response) {
                prodVenda = response.data;
                deferred.resolve(response.data);
            },function(response){console.log(response)}); 
            return deferred.promise;   
        }
        var atualizaVenda = function (dados) {
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;            
            var deferred = $q.defer();
            console.log(venda);
            $http.post("http://sistema.florestalferragens.com.br/api/atualizavenda",{'token':token,'dados':dados,'empresa':empresa})
            .then(function(response) {
                console.log(response);
                venda = response.data;
                deferred.resolve(response.data);
            },function(response){console.log(response)}); 
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
            console.log(prodvenda);
            $http.post("http://sistema.florestalferragens.com.br/api/atualizaprodvenda",{'token':token,'dados':prodvenda,'empresa':empresa})
            .then(function(response) {
                    console.log(response.data)
                    deferred.resolve(response.data);
                
            },function(response){console.log(response)}); 
            return deferred.promise;   
        } 
        var descontoTotalVenda = function (venda,descpercentual) {
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;            
            var deferred = $q.defer();
            $http.post("http://sistema.florestalferragens.com.br/api/descontototalvenda",{'token':token,'dados':[venda,descpercentual],'empresa':empresa})
            .then(function(response) {
                    console.log(response.data)
                    deferred.resolve(response.data);
            },function(response){console.log(response)}); 
            return deferred.promise;   
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
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;
            var deferred = $q.defer();
            $http.post("http://sistema.florestalferragens.com.br/api/inserepacote",{'token':token,'pacote':codbar,'empresa':empresa})
            .then(function(response) {
                if (response) {
                    deferred.resolve(response);
                }
            },function(response){console.log(response)}); 
            return deferred.promise;      
        }        
        var confirmaVenda = function (venda,pagamento) {
            console.log(venda);
            console.log(pagamento);
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;
            var deferred = $q.defer();
            $http.post("http://sistema.florestalferragens.com.br/api/confirmapagamentoteste",{'token':token,'venda':venda,'pagamento':pagamento,'empresa':empresa})
            .then(function(response) {
                if (response.data) {
                    prodVenda = '';
                    var venda = {
                        'LCTO':null,
                        'DATA':'',
                        'CODCLI':'',
                        'NOMECLI':'',
                        'CODVEND':'',
                        'NOMEVEND':'',
                        'OBS':'',
                        'STATUS':''
                      };                    
                    deferred.resolve(response.data);
                }
            },function(response){console.log(response)}); 
            return deferred.promise;   
        }        
        var retornaprodVenda = function () {
            return  prodVenda;
        } 
        var vendaNota = function (venda) {
            var token = remote.getGlobal('dados').param.token;
            var empresa = remote.getGlobal('dados').configs.empresa;            
            var deferred = $q.defer();
            $http.post("http://sistema.florestalferragens.com.br/api/vendaNF",{'token':token,'busca':venda,'empresa':empresa})
            .then(function(response) {
                deferred.resolve(response.data);
            },function(response){console.log(response)}); 
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
            vendaNota : vendaNota
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