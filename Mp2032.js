// requerido para a comunica��o com a DLL
const ffi = require('ffi')
var ref = require('ref')
var ArrayType = require('ref-array');
var os = require('os')
var int = ref.types.int
let DLL = 'MP2032';

// if (os.arch() == 'x64') DLL = 'MP2064';
console.log(os.arch());
console.log(DLL)
const mp2032 = ffi.Library(DLL, {
    // fun��es da impressora impressora
    'ConfiguraTaxaSerial':['int',['int']],
    'IniciaPorta': [ 'int',['string']],
    'FechaPorta': ['int',[]],
    'AcionaGuilhotina': [ 'int',['int']], 
    'AjustaLarguraPapel': ['int',['int']],
    //func�es de impress�o
    // exemplo
    // sTexto   += 'Total bruto: 12.500,00' + #10; 
    // sTexto   += sTexto + 'Total l�quido: 9.600,00' + #10; 
    'BematechTX':['int',['string']],
    'FormataTX': ['int',['string','int','int','int','int','int']],
    'ImprimeBitmap':['int',['string','int']],
    'ComandoTX' : [ 'int',['string','int']],
    'ConfiguraCodigoBarras': ['int',['int','int','int','int','int']],
    'ImprimeCodigoBarrasEAN13': ['int',['string']],
    'ImprimeCodigoBarrasCODE128': ['int',['string']],
    'ImprimeCodigoQRCODE': ['int',['int','int','int','int','int','string']]

  });
var options = {
    year: "numeric", month: "numeric",
    day: "numeric", hour: "2-digit", minute: "2-digit",hour12: false
 };  
let contador = 0;  
let venda = []
let prodvenda = []
let formaPgto = []
let textoPedido =   "              RELATORIO PARA CONFERENCIA              \n";
// textoPedido    +=   'Data emissao: 08/03/2019  -  13:48:15 \n';
textoPedido    +=   '------------------------------------------------\n';
// textoPedido    +=   'Item Cod.  Descricao               QtdeUn VlrUnit VlrTot\n';
// textoPedido    +=   '--------------------------------------------------------\n';
// textoPedido    +=   '--------------------------------------------------------\n';
// textoPedido    +=   'TOTAL R$ :                                        999.99\n';
// textoPedido    +=   'Dinheiro :                                        999.99\n';
// textoPedido    +=   'TROCO :                                             0.00\n';
// textoPedido    +=   '\n';
// textoPedido    +=   '                   VOLTE SEMPRE!!                       \n';
// textoPedido    +=   '\n';
// textoPedido    +=   '**********************************************************';
// textoPedido    +=   '        IMPRESSAO DO CUPOM FISCAL ELETRONICO            \n';
// textoPedido    +=   '**********************************************************';
// textoPedido    +=   '\n';
// textoPedido    +=   '      LOCALDECOR COMERCIO DE FERRAGENS LTDA EPP         \n';
// textoPedido    +=   ' Rua Salto Grande, 583 - Jardim do Trevo, Campinas - SP \n';
// textoPedido    +=   'CNPJ: 18477591000159     IE: 795391300119     IM:       \n';
// textoPedido    +=   '--------------------------------------------------------\n';
// textoPedido    +=   '                 Extrato No. 9999999                    \n';
// textoPedido    +=   '              CUPOM FISCAL ELETRONICO - SAT             \n';
// textoPedido    +=   '--------------------------------------------------------\n';
// textoPedido    +=   'CONSUMIDOR NAO IDENTIFICADO                             \n';
// textoPedido    +=   'TOTAL R$   999.99                                       \n';
// textoPedido    +=   '\n';
// textoPedido    +=   '--------------------------------------------------------\n';
// textoPedido    +=   'OBSERVACOES DO CONTRIBUINTE:                            \n';
// textoPedido    +=   'Valor aprox. dos tributos desde cupom R$ 99.99(99.99%)  \n';
// textoPedido    +=   'Federal 99.99% Estadual 99.99% Municipal 99.99%         \n';
// textoPedido    +=   '(Conforme Lei Fed. 12.741/2012)                         \n';
// textoPedido    +=   '--------------------------------------------------------\n';
// textoPedido    +=   '                     SAT No. 9999999                    \n';
// textoPedido    +=   '                    09/03/2019 - 11:00                  \n';
// textoPedido    +=   '\n';
// textoPedido    +=   ' 9999 9999 9999 9999 9999 9999 9999 9999 9999 9999 9999 \n';


function asyncLoop (o){
    var i=-1,
        length = o.length;
    var loop = function(){
        i++;
        if(i==length){o.callback(); return;}
        o.functionToLoop(loop, i);
    } 
    loop();//init
}

function iniciaImpressao () {
    contador = 0;
    mp2032.ConfiguraTaxaSerial.async(80,iniciaPorta);
}

function AjustaLarguraPapel () {
    contador = 0;
    mp2032.AjustaLarguraPapel.async(115200,alinhamento);
}


function iniciaPorta () {
    mp2032.IniciaPorta.async("COM8",AjustaLarguraPapel)
}
function alinhamento (err,res) {
    let cent = String.fromCharCode(27,64);
    mp2032.ComandoTX.async(cent,cent.length,defineTexto);
}

function defineTexto (err,res) {
    let cent = String.fromCharCode(27,15);
    mp2032.ComandoTX.async(cent,cent.length,imprimeTexto);
}

function imprimeTexto (err,res) {
    console.log('iniciaImpressao' + err+res)
    // mp2032.FormataTX.async(textoPedido,1,0,0,0,1,ConfiguraCodigoBarras)
    mp2032.BematechTX.async(textoPedido,ConfiguraCodigoBarras)

}

function ConfiguraCodigoBarras (err,res) {
    console.log('impress�o de QR code' + err+res)
    mp2032.ConfiguraCodigoBarras.async(50,0,0,1,0,ImprimeCodbar128)
}

function ImprimeCodbar128 (err,res) {
    console.log('impress�o de QR code' + err+res)
    mp2032.ImprimeCodigoBarrasCODE128.async("99999999999999999999",Centraliza)
}

function Centraliza (err,res) {
    let cent = String.fromCharCode(27,97,1);
    mp2032.ComandoTX.async(cent,cent.length,ImprimeQR);
}

function ImprimeQR (err,res) {
    console.log('impress�o de QR code',err,res)
    mp2032.ImprimeCodigoQRCODE.async(1,6,0,10,1,"999999999999999999999999999999999999999999|20190903110000|99999||12312321",cortaVia)
}

function cortaVia (err,res) {
    contador++;
    // if (contador==1) 
    //     mp2032.AcionaGuilhotina.async(0,imprimeTexto)
    // if (contador==2) 
        mp2032.AcionaGuilhotina.async(1,FechaPorta)
}

function FechaPorta (err,res) {
    console.log('imprimeTexto' + err+res)
    mp2032.FechaPorta.async(finaliza)
}

function finaliza(err,res){
    console.log('finaliza' + err+res)
    contador = 0;
    venda=  null
    prodvenda = null;
    formaPgto = null;
    console.log("impresso com sucesso?? sera??")
}

exports.imprimeVenda = function(dados){
    let now = new Date();
    venda = dados.venda;
    prodvenda = dados.produtos;
    formaPgto = dados.pagamento;
    if (dados.empresa==1) empresa = 'Florestal Ferragens';
    if (dados.empresa==2) empresa = 'LocalDecor Ferragens';
    console.log("iniciando o processo")
    textoPedido += empresa + '\n'
    textoPedido += 'Pedido: '+ venda.LCTO + '\n' + 'Emissao: '  +  now.toLocaleTimeString("PT-BR", options) + '\n'
    textoPedido += 'Cod. Cliente: ' + venda.CODCLI + '\n'
    textoPedido += 'Vendedor:' + venda.NOMEVEND + '\n'
    textoPedido += 'Forma de Pagamento \r\n'
    formaPgto.forEach(element => {
        textoPedido +=   element.vencimento.getDate() + "/" + element.vencimento.getMonth() + "/" + element.vencimento.getFullYear() + '\t' + element.valor.toFixed(2) + '\t' + element.tipo + '\n'
    });
    textoPedido += 'Descricao\n'
    textoPedido += '  Qtd  Un\tCod.\tVl.Unit.\tSubtotal\n'
    prodvenda.forEach(element => {
        if (!element.QTDRESERVA)
        textoPedido +=element.DESCRICAO + '\n' + element.QTDPEDIDO + '  ' + element.UNIDADE + '\t' + element.CODINTERNO + '\t' + element.VALOR + '\t' + element.TOTAL + '\n'
    });
    textoPedido += '-----------------------------------------\n' + 'ITENS DE ENCOMENDA:\n'
    textoPedido += 'Descricao\n'
    textoPedido += '  Qtd  Un\tCod.\tVl.Unit.\tSubtotal\n'
    prodvenda.forEach(element => {
        if (element.QTDRESERVA)
        textoPedido +=element.DESCRICAO + '\n  ' + element.QTDPEDIDO + '\t' + element.UNIDADE + '\t' + element.CODINTERNO + '\t' + element.VALOR + '\t' + element.TOTAL + '\n'
    });    
    textoPedido += '-----------------------------------------\n' + 'Total Produtos: ' + venda.TOTAL.toFixed(2) + '\n\n'
    textoPedido += 'Conf._____________________________________\n\n'
    textoPedido += 'Ass.______________________________________\n\n'    
    iniciaImpressao();
}

iniciaImpressao();

