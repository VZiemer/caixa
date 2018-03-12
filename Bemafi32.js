const ffi = require('ffi')
var ref = require('ref')
var os = require('os')
var int = ref.types.int
var nCupom = ref.alloc('string');
var ArrayType = require('ref-array');
var IntArray = ArrayType(int);
var stringPtr = ref.refType(ref.types.CString);
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
    'Bematech_FI_CancelaCupom':['int',[]],
    'Bematech_FI_VerificaImpressoraLigada':['int',[]],
    'Bematech_FI_AbrePortaSerial':['int',[]],
    'Bematech_FI_FechaPortaSerial':['int',[]],
    'Bematech_FI_DataHoraImpressora':['int',['string','string']],
    'Bematech_FI_NumeroCupom':['int',[stringPtr]]

  });
 
const fs = require('fs');
let prodvenda = '';
let formaPgto = '';
let cupom = '';

function abreCupom (cliente) {
    // cupom = bemafi.Bematech_FI_NumeroCupom('');
    console.log (cupom);
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
            let descr = prodvenda[i].DESCRICAO
            console.log(descr)
            if(descr.length>29){
                descr = descr.slice(0,28);
            }
            if(prodvenda[i].SITTRIB == '060') {
                prodvenda[i].ALIQ = 'FF'
            }  
            else if(!prodvenda[i].ALIQ) {
                prodvenda[i].ALIQ = 'FF'
            }          
            else {
                prodvenda[i].ALIQ = prodvenda[i].ALIQ*100
            };
            bemafi.Bematech_FI_VendeItem.async(prodvenda[i].CODIGO.toString(),descr,prodvenda[i].ALIQ.toString(),'I',prodvenda[i].QTDPEDIDO.toString(),2,prodvenda[i].VALOR.toFixed(2).toString(),'%','0000',function(err,res){
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
//     //usar função depois de inserir itens e antes de inserir pagamentos
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
    if(res == 1) {
        console.log('fechaCupom' + err+res)
        prodvenda = null;
        formaPgto = null;
        console.log("cupom gerado com sucesso")
    }
    else fechaCupomResumido(err,res)
}

exports.gravaECF = function(dados){
    prodvenda = dados.produtos;
    formaPgto = dados.pagamento;
    console.log(dados.Cliente)
    console.log("iniciando o processo")
    abreCupom(dados.Cliente); 
}

exports.leituraX = function (){
      bemafi.Bematech_FI_LeituraX()
}

exports.reducaoZ = function (){
    bemafi.Bematech_FI_ReducaoZ('','')
}
exports.acertaHora = function (){
    function formatDate() {
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear().toString().substr(-2)
      
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
      
        return [day, month, year].join('');
      }
      function formatTime() {
        var d = new Date(),
            hour = '' + (d.getHours() + 1),
            minute = '' + d.getMinutes(),
            second = d.getSeconds()
      
        if (hour.length < 2) month = '0' + hour;
        if (minute.length < 2) day = '0' + minute;
        if (second.length < 2) day = '0' + second;
      
        return [hour, minute, second].join('');
      }

    bemafi.Bematech_FI_DataHoraImpressora(formatDate(),formatTime())
}
exports.nuCupom = function (){
    var nCupom = ref.alloc(stringPtr);
    console.log(bemafi.Bematech_FI_NumeroCupom(nCupom)) 
    // bemafi.Bematech_FI_NumeroCupom(nCupom);
    var x = nCupom.deref();
    console.log(x)
    // bemafi.Bematech_FI_NumeroCupom.async(nCupom,function(err,res){
    //     console.log(res)
    //     console.log(a)
    //     return a
    // });
}
