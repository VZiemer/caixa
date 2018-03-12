const ffi = require('ffi')
var ref = require('ref')
var os = require('os')
var int = ref.types.int
let DLL = 'MP2032';
if (os.arch() == 'x64') DLL = 'MP2064';
console.log(os.arch());
console.log(DLL)
const mp2032 = ffi.Library(DLL, {
    // funções da impressora impressora
    'ConfiguraTaxaSerial':['int',['int']],
    'IniciaPorta': [ 'int',['string']],
    'FechaPorta': ['int',[]],
    'AcionaGuilhotina': [ 'int',['int']], 
    'AjustaLarguraPapel': ['int',['int']],
    //funcões de impressão
    // exemplo
    // sTexto   += 'Total bruto: 12.500,00' + #10; 
    // sTexto   += sTexto + 'Total líquido: 9.600,00' + #10; 
    'BematechTX':['int',['string']],
    'FormataTX': ['int',['string','int','int','int','int','int']],
    'ImprimeBitmap':['int',['string','int']],
    // 'ImprimeCodigoBarrasEAN13': ['int',['string']],
    // 'ImprimeCodigoQRCODE': ['int',['int','int,','int','int','int','string']]

  });
var options = {
    year: "numeric", month: "numeric",
    day: "numeric", hour: "2-digit", minute: "2-digit",hour12: false
 };  
let contador = 0;  
let venda = []
let prodvenda = []
let formaPgto = []
let textoPedido = 'DOCUMENTO NAO FISCAL \n';
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
    mp2032.ConfiguraTaxaSerial.async(115200,iniciaPorta);
}
function iniciaPorta () {
    mp2032.IniciaPorta.async("192.168.15.110",imprimeTexto)
}
function imprimeTexto (err,res) {
    console.log('iniciaImpressao' + err+res)
    mp2032.BematechTX.async(textoPedido,cortaVia)
}
function cortaVia (err,res) {
    contador++;
    if (contador==1) 
        mp2032.AcionaGuilhotina.async(0,imprimeTexto)
    if (contador==2) 
        mp2032.AcionaGuilhotina.async(0,FechaPorta)
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
    console.log("impresso com sucesso?? será??")
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

