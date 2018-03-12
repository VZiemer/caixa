const ffi = require('ffi')
var ref = require('ref')
var os = require('os')
let DLL = 'BEMAFI32';
if (os.arch() == 'x64') DLL = 'BEMAFI64';
console.log(os.arch());
console.log(DLL)
const bemafi = ffi.Library(DLL, {
    // relatórios
    'Bematech_FI_LeituraX': [ 'int',[]],
    'Bematech_FI_ReducaoZ': [ 'int',['string','string']], 
    //cupom fiscal
    'Bematech_FI_AbreCupom':['int',['string']],
    'Bematech_FI_VendeItem':['int',['string','string','string','string','string','int','string','string','string']],
    'Bematech_FI_CancelaItemAnterior':['int',[]],
    'Bematech_FI_CancelaItemGenerico':['int',['string']],
    'Bematech_FI_IniciaFechamentoCupom':['int',['string','string','string']],
    'Bematech_FI_EfetuaFormaPagamento':['int',['string','string']],
    'Bematech_FI_FechaCupomResumido':['int',['string','string']],
    'Bematech_FI_TerminaFechamentoCupom':['int',['string']],
    'Bematech_FI_FechaCupom':['int',['string','string','string','string','string','string']],
    'Bematech_FI_CancelaCupom':['int',[]]

  });
  
const fs = require('fs');
let prodvenda = '';
let formaPgto = '';
let empresa = '';

function abreCupom (cliente) {
    // abertura do cupom com cpf e chama a vendaItem
    bemafi.Bematech_FI_AbreCupom.async(cliente,vendeItem)
}

function vendeItem (err,res) {
    console.log("abrecupom" + res)
    var asyncLoop = function(o){
        var i=-1,
            length = o.length;
        
        var loop = function(){
            i++;
            if(i==length){o.callback(); return;}
            o.functionToLoop(loop, i);
        } 
        loop();//init
    }
    asyncLoop({
        length : prodvenda.length,
        functionToLoop : function(loop, i){
            if(prodvenda[i].DESCRICAO.length>29){
                prodvenda[i].DESCRICAO = prodvenda[i].DESCRICAO.slice(0,29);
            }
            if(!prodvenda[i].ALIQ) {
                prodvenda[i].ALIQ = 'FF'
            }
            else {
                prodvenda[i].ALIQ = prodvenda[i].ALIQ*100
            };
            bemafi.Bematech_FI_VendeItem.async(prodvenda[i].CODIGO.toString(),prodvenda[i].DESCRICAO,prodvenda[i].ALIQ.toString(),'I',prodvenda[i].QTDPEDIDO.toString(),2,prodvenda[i].VALOR.toFixed(2).toString(),'%','0000',function(err,res){
                console.log(prodvenda[i]);
                console.log("erro"+ err + "resposta"+res);
                loop();
            })                
        },
        callback : fechaCupomResumido   
    });
  
}

//USAR NO CASO DE FECHAMENTO NÃO RESUMIDO

// function iniciaFechamento() {
//     console.log("entrou no iniciaFechamento")
//     //usar funcção depois de inserir itens e antes de inserir pagamentos
//     //AcrescimoDesconto: A para acrescimos D para desconto
//     //Tipo : $ ou %
//     //Valor : 14 digitos para valor e 4 digitos percentual (pode usar ,)

//     bemafi.Bematech_FI_IniciaFechamentoCupom.async('D','%','0',efetuaPagamento)
// }

// function efetuaPagamento(err,res) {
//     console.log('iniciaFechamento' + res)
//     bemafi.Bematech_FI_EfetuaFormaPagamento.async('Dinheiro',formaPgto.toFixed(2).toString(),fechaCupom)
// }

// function fechaCupom(err,res) {
//     console.log('efetuapagamento'+err+res)
//     bemafi.Bematech_FI_TerminaFechamentoCupom.async('Obrigado, volte sempre !!!',finaliza);
// }

function fechaCupomResumido (err,res) {
    bemafi.Bematech_FI_FechaCupomResumido.async('Dinheiro','Obrigado, volte sempre !!!',finaliza)
}

function finaliza(err,res){
    console.log('fechaCupom' + err+res)
    prodvenda = null;
    formaPgto = null;
    console.log("cupom gerado com sucesso?? será??")
}




      bemafi.Bematech_FI_LeituraX()



