// requerido para a comunicação com a DLL
const ffi = require('ffi');
var ref = require('ref'),
    ArrayType = require('ref-array'),
    os = require('os'),
    int = ref.types.int,
    DLL = 'MP2032';

if (os.arch() == 'x64') DLL = 'MP2064';
console.log(os.arch());
console.log(DLL)
const mp2032 = ffi.Library(DLL, {
    // fun��es da impressora impressora
    'ConfiguraTaxaSerial': ['int', ['int']],
    'IniciaPorta': ['int', ['string']],
    'FechaPorta': ['int', []],
    'AcionaGuilhotina': ['int', ['int']],
    'AjustaLarguraPapel': ['int', ['int']],
    'BematechTX': ['int', ['string']],
    'FormataTX': ['int', ['string', 'int', 'int', 'int', 'int', 'int']],
    'ImprimeBitmap': ['int', ['string', 'int']],
    'ComandoTX': ['int', ['string', 'int']],
    'ConfiguraCodigoBarras': ['int', ['int', 'int', 'int', 'int', 'int']],
    'ImprimeCodigoBarrasEAN13': ['int', ['string']],
    'ImprimeCodigoBarrasCODE128': ['int', ['string']],
    'ImprimeCodigoQRCODE': ['int', ['int', 'int', 'int', 'int', 'int', 'string']]
});
var options = {
    year: "numeric", month: "numeric",
    day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
};
let contador = 0;
let venda = [];
let prodvenda = [];
let formaPgto = [];
let textoPedido = '';

// let textoPedido = "              RELATORIO PARA CONFERENCIA             \n";
// textoPedido += 'Data emissao: 08/03/2019  -  13:48:15                   \n';
// textoPedido += '--------------------------------------------------------\n';
// textoPedido += 'Item Cod.  Descricao               QtdeUn VlrUnit VlrTot\n';
// textoPedido += '--------------------------------------------------------\n';
// textoPedido += '--------------------------------------------------------\n';
// textoPedido += 'TOTAL R$ :                                        999.99\n';
// textoPedido += 'Dinheiro :                                        999.99\n';
// textoPedido += 'TROCO :                                             0.00\n';
// textoPedido += '\n';
// textoPedido += '                     VOLTE SEMPRE!!                     \n';
// textoPedido += '\n';
// textoPedido += '********************************************************\n';
// textoPedido += '        IMPRESSAO DO CUPOM FISCAL ELETRONICO            \n';
// textoPedido += '********************************************************\n';
// textoPedido += '\n';
// textoPedido += '      LOCALDECOR COMERCIO DE FERRAGENS LTDA EPP         \n';
// textoPedido += ' Rua Salto Grande, 583 - Jardim do Trevo, Campinas - SP \n';
// textoPedido += 'CNPJ: 18477591000159     IE: 795391300119     IM:       \n';
// textoPedido += '--------------------------------------------------------\n';
// textoPedido += '                 Extrato No. 9999999                    \n';
// textoPedido += '              CUPOM FISCAL ELETRONICO - SAT             \n';
// textoPedido += '--------------------------------------------------------\n';
// textoPedido += 'CONSUMIDOR NAO IDENTIFICADO                             \n';
// textoPedido += 'TOTAL R$   999.99                                       \n';
// textoPedido += '\n';
// textoPedido += '--------------------------------------------------------\n';
// textoPedido += 'OBSERVACÕES DO CONTRIBUINTE:                            \n';
// textoPedido += 'Valor aprox. dos tributos desde cupom R$ 99.99(99.99%)  \n';
// textoPedido += 'Federal 99.99% Estadual 99.99% Municipal 99.99%         \n';
// textoPedido += '(Conforme Lei Fed. 12.741/2012)                         \n';
// textoPedido += '--------------------------------------------------------\n';
// textoPedido += '                     SAT No. 9999999                    \n';
// textoPedido += '                    09/03/2019 - 11:00                  \n';
// textoPedido += '\n';
// textoPedido += ' 9999 9999 9999 9999 9999 9999 9999 9999 9999 9999 9999 \n';


function asyncLoop(o) {
    var i = -1,
        length = o.length;
    var loop = function () {
        i++;
        if (i == length) { o.callback(); return; }
        o.functionToLoop(loop, i);
    }
    loop(); //init
}

// function iniciaImpressao() {
//     contador = 0;
//     mp2032.ConfiguraTaxaSerial.async(80, iniciaPorta);
// }


// function iniciaPorta() {
//     mp2032.IniciaPorta.async("COM9", AjustaLarguraPapel)
// }

// function AjustaLarguraPapel() {
//     console.log("Largura")
//     contador = 0;
//     mp2032.AjustaLarguraPapel.async(115200, alinhamento);
// }




// function setUTF () {
//     console.log("setUTF")
//     let cent = String.fromCharCode(27, 116, 56);
//     mp2032.ComandoTX.async(cent, cent.length, alinhamento);    
// }

function alinhamento(err, res) {
    let cent = String.fromCharCode(27, 97, 48);
    mp2032.ComandoTX.async(cent, cent.length, defineTexto);
}

function defineTexto(err, res) {
    let cent = String.fromCharCode(27, 77, 49);
    mp2032.ComandoTX.async(cent, cent.length, imprimeTexto);
}

function imprimeTexto(err, res) {
    console.log('iniciaImpressao' + err + res)
    mp2032.FormataTX.async(textoPedido, 3, 0, 0, 0, 1, Centraliza)
    // mp2032.BematechTX.async(textoPedido,ConfiguraCodigoBarras)
}

function Centraliza(err, res) {
    let cent = String.fromCharCode(27, 97, 1);
    mp2032.ComandoTX.async(cent, cent.length, ConfiguraCodigoBarras);
}

function ConfiguraCodigoBarras(err, res) {
    console.log('impressão de QR code' + err + res)
    mp2032.ConfiguraCodigoBarras.async(50, 0, 0, 1, 0, ImprimeCodbar128)
}

function ImprimeCodbar128(err, res) {
    console.log('impressão de QR code' + err + res)
    mp2032.ImprimeCodigoBarrasCODE128.async("99999999999999999999", ImprimeQR)
}

function ImprimeQR(err, res) {
    console.log('impressão de QR code', err, res)
    mp2032.ImprimeCodigoQRCODE.async(1, 6, 0, 10, 1, "999999999999999999999999999999999999999999|20190903110000|99999||12312321", cortaVia)
}

function cortaVia(err, res) {
    contador++;
    // if (contador==1) 
    //     mp2032.AcionaGuilhotina.async(0,imprimeTexto)
    // if (contador==2) 
    mp2032.AcionaGuilhotina.async(1, FechaPorta)
}

function FechaPorta(err, res) {
    console.log('imprimeTexto' + err + res)
    mp2032.FechaPorta.async(finaliza)
}

function finaliza(err, res) {
    console.log('finaliza' + err + res)
    contador = 0;
    venda = null
    prodvenda = null;
    formaPgto = null;
    console.log("impresso com sucesso?? sera??")
    return "deu certo";
}

function zeroDir(valor, comprimento, digito) {
    var length = comprimento - valor.toString().length + 1;
    return valor + Array(length).join(digito || ' ');
};
function zeroEsq(valor, comprimento, digito) {
    var length = comprimento - valor.toString().length + 1;
    return Array(length).join(digito || ' ') + valor;
};

async function imprimeVenda(dados) {
    let now = new Date();
    venda = dados;
    prodvenda = dados.PRODUTOS;
    formaPgto = dados.PAGAMENTO;
    console.log('dados', dados);
    if (dados.empresa == 1) empresa = 'Florestal Ferragens';
    if (dados.empresa == 2) empresa = 'LocalDecor Ferragens';

    const configseria = await mp2032.ConfiguraTaxaSerial(9600);
    const porta = await mp2032.IniciaPorta("COM9");   //abre porta


    const ajustepepel = await mp2032.AjustaLarguraPapel(80);  //ajusta largura do papel
    console.log('ajustepepel :',ajustepepel )
    const setutf = await mp2032.ComandoTX(String.fromCharCode(27, 116, 56), 3);  // set UTF8
    console.log('setutf :',setutf )

    console.log("iniciando o processo")
    // let textoConfig = String.fromCharCode(27, 116, 56);
    // textoConfig += String.fromCharCode(27, 77, 49);
    // textoConfig = String.fromCharCode(27, 97, 48);
    // const impressaoConfig = await mp2032.BematechTX(textoConfig) // imprime texto
    // console.log('impressaoConfig :',impressaoConfig ) 
    const tamanhotexto = await mp2032.ComandoTX(String.fromCharCode(27, 15), 2);  // define tamanho texto
    console.log('tamanhotexto :',tamanhotexto )
    // textoPedido =  String.fromCharCode(15);
    textoPedido += String.fromCharCode(27, 97, 49); // centraliza o texto
    textoPedido += 'VENDA ' + venda.LCTO + '\n';
    textoPedido = String.fromCharCode(27, 97, 48); // alinha na esquerda
    textoPedido += 'Cliente: ' + venda.CODCLI + ' - ' + venda.NOMECLI + '\n';
    textoPedido += 'Vendedor:' + venda.NOMEVEND + '\n'
    textoPedido += 'Data emissao: ' + now.toLocaleTimeString("PT-BR", options) + '\n';
    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += 'Pagamento \r\n'
    formaPgto.forEach(element => {
        textoPedido += element.vencimento.getDate() + "/" + element.vencimento.getMonth() + "/" + element.vencimento.getFullYear() + '\t' + element.valor.valueStr() + '\t' + element.tipo + '\n'
    });
    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += 'Item  Cod. Descricao                         QtdeUn VlrUnit VlrTot \n';
    textoPedido += '-------------------------------------------------------------------\n';

    prodvenda.forEach((element, index) => {
        if (!element.QTDRESERVA)
        textoPedido += '  ' +zeroEsq(index,2,'0')  + '|' + zeroEsq(element.CODPRO,5) +'|' + zeroDir(element.DESCRICAO,32)  + ' ' + zeroEsq(element.QTD,4) + ' ' + element.UNIDADE + '|' + zeroEsq(element.VALOR.valor,7) + '|' + zeroEsq(element.TOTAL.valor,7,) + '\n'
    });


    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += 'ITENS DE ENCOMENDA:\n';
    prodvenda.forEach((element, index) => {
        if (element.QTDRESERVA)
        textoPedido += '  ' +zeroEsq(index,2,'0')  + '|' + zeroEsq(element.CODPRO,5) +'|' + zeroDir(element.DESCRICAO,32)  + ' ' + zeroEsq(element.QTD,4) + ' ' + element.UNIDADE + '|' + zeroEsq(element.VALOR.valor,7) + '|' + zeroEsq(element.TOTAL.valor,7,) + '\n'
    });
    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += 'TOTAL R$ :' + zeroEsq(venda.TOTAL.valor, (67 - 10)) + '\n';
    textoPedido += 'Dinheiro :' + zeroEsq('0.00', (67 - 10)) + '\n';
    textoPedido += 'TROCO :' + zeroEsq('0.00', (67 - 7)) + '\n';    
    textoPedido += '\n';
    textoPedido += '\n';
    textoPedido += 'Conf.______________________________________________________________\n';
    textoPedido += '\n';
    textoPedido += 'Ass._______________________________________________________________\n';
    textoPedido += '\n';
    textoPedido += '\n';
    textoPedido += '\n';
    textoPedido += '\n';
    textoPedido += '\n';

    // const tamanhotexto = await mp2032.ComandoTX(String.fromCharCode(27, 77, 49), 3);  // define tamanho texto
    // console.log('tamanhotexto :',tamanhotexto )
    // let command = String.fromCharCode(27, 64);
    // const alinhamento = await mp2032.ComandoTX(command, command.length); //alinhamento
    // console.log('alinhamento :',alinhamento )
    // const impressao = await mp2032.FormataTX(textoPedido, 3, 0, 0, 0, 1) // imprime texto
    const impressao = await mp2032.BematechTX(textoPedido) // imprime texto
    console.log('impressao :',impressao )
    const primCorte = await mp2032.AcionaGuilhotina(0) //realiza o corte
    console.log('primCorte :',primCorte)

    if (venda.NUCUPOM) {
    textoPedido = String.fromCharCode(27, 97, 49); // centraliza o texto
    textoPedido +=                 'RELATORIO PARA CONFERENCIA\n';
    textoPedido += String.fromCharCode(27, 97, 48); // alinha na esquerda
    textoPedido += 'Data emissao: ' + now.toLocaleTimeString("PT-BR", options) + '\n';
    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += 'Item  Cod. Descricao                         QtdeUn VlrUnit VlrTot \n';
    textoPedido += '-------------------------------------------------------------------\n';
    prodvenda.forEach((element, index) => {
        textoPedido += '  ' +zeroEsq(index,2,'0')  + '|' + zeroEsq(element.CODPRO,5) +'|' + zeroDir(element.DESCRICAO,32)  + ' ' + zeroEsq(element.QTD,4) + ' ' + element.UNIDADE + '|' + zeroEsq(element.VALOR.valor,7) + '|' + zeroEsq(element.TOTAL.valor,7,) + '\n'
    });
    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += 'TOTAL R$ :' + zeroEsq(venda.TOTAL.valor, (67 - 10)) + '\n';
    textoPedido += 'Dinheiro :' + zeroEsq('0.00', (67 - 10)) + '\n';
    textoPedido += 'TROCO :' + zeroEsq('0.00', (67 - 7)) + '\n';
    textoPedido += '\n';
    textoPedido += String.fromCharCode(27, 97, 49); // centraliza o texto
    textoPedido +=                           'VOLTE SEMPRE!!\n';
    textoPedido += '*******************************************************************\n';
    textoPedido +=                  'IMPRESSAO DO CUPOM FISCAL ELETRONICO\n';
    textoPedido += '*******************************************************************\n';
    textoPedido += '\n';
    textoPedido +=               'LOCALDECOR COMERCIO DE FERRAGENS LTDA EPP\n';
    textoPedido +=          'Rua Salto Grande, 583 - Jardim do Trevo, Campinas - SP\n';
    textoPedido +=            'CNPJ: 18477591000159     IE: 795391300119     IM:\n';
    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += String.fromCharCode(27, 97, 49); // centraliza o texto
    textoPedido +=                     'Extrato No. 9999999\n';
    textoPedido +=                 'CUPOM FISCAL ELETRONICO - SAT\n';
    textoPedido += String.fromCharCode(27, 97, 48); // alinha na esquerda
    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += (venda.CPFCupom ? 'CPF. ' + venda.CPFCupom : 'CONSUMIDOR NAO IDENTIFICADO') + '\n'
    textoPedido += 'TOTAL R$   ' + venda.TOTAL + '\n';
    textoPedido += '\n';
    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += 'OBSERVACÕES DO CONTRIBUINTE:                            \n';
    textoPedido += 'Valor aprox. dos tributos desde cupom R$ 99.99(99.99%)  \n';
    textoPedido += 'Federal 99.99% Estadual 99.99% Municipal 99.99%         \n';
    textoPedido += '(Conforme Lei Fed. 12.741/2012)                         \n';
    textoPedido += '-------------------------------------------------------------------\n';
    textoPedido += String.fromCharCode(27, 97, 49); // centraliza o texto
    textoPedido +=                       'SAT No. '+ venda.NUCUPOM +'\n';
    textoPedido +=           now.toLocaleTimeString("PT-BR", options) + '\n';
    textoPedido += '\n';
    textoPedido +=         '9999 9999 9999 9999 9999 9999 9999 9999 9999 9999 9999\n';  
    }

    // const impressao2 = await mp2032.FormataTX(textoPedido, 3, 0, 0, 0, 1); // imprime texto
    const impressao2 = await mp2032.BematechTX(textoPedido); // imprime texto
    console.log('impressao2 :',impressao2 )

    if (venda.NUCUPOM) {

        const configcobar = await mp2032.ConfiguraCodigoBarras(50, 1, 0, 0, 0); // configura codbar
        console.log('configcobar :',configcobar ) 
        let command = String.fromCharCode(27, 97, 49);
        const centraliza = await mp2032.ComandoTX(command, command.length); // centraliza
        console.log('centraliza :',centraliza )      
        const imprimeCbar = await mp2032.ImprimeCodigoBarrasCODE128("99999999999999999999")
        console.log('imprimeCbar :',imprimeCbar )
        const imprimeQR = await mp2032.ImprimeCodigoQRCODE(1, 6, 0, 10, 1, "999999999999999999999999999999999999999999|20190903110000|99999||12312321")
        console.log('imprimeQR :',imprimeQR )
        // command = String.fromCharCode(12);
        // const feed1 = await mp2032.ComandoTX(command, command.length); // pula
        // console.log('feed1 :',feed1)
        console.log (command)

    }

    const segundocorte = await mp2032.AcionaGuilhotina(1) //realiza o corte
    // command = String.fromCharCode(27, 64);
    // const alinhamento = await mp2032.ComandoTX(command, command.length); //alinhamento
    // console.log('alinhamento :',alinhamento )  
    const fechaporta = await mp2032.FechaPorta(); // fecha a portaa da impressora
    console.log('fechaporta :',fechaporta )
    console.log("impresso com sucesso?? sera??")
    return "deu certo";
}

exports.imprimeVenda = imprimeVenda;

