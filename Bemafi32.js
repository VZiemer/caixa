
// requerido para a comunicação com a DLL
const ffi = require('ffi')
var ref = require('ref')
var ArrayType = require('ref-array');
// variáveis de comunicação com a DLL
var int = ref.types.int
var IntArray = ArrayType(int);
var stringPtr = ref.refType(ref.types.CString);
// comunicação com o Sistema Operacional
var os = require('os')
console.log(os.arch());
// nome da DLL, variável para sistemas x64
let DLL = 'BEMAFI32';
if (os.arch() == 'x64') DLL = 'BEMAFI64';
console.log(DLL)
// leitura das funções da DLL
const bemafi = ffi.Library(DLL, {
  // relatórios
  'Bematech_FI_LeituraX': ['int', []],
  'Bematech_FI_ReducaoZ': ['int', ['string', 'string']],
  //cupom fiscal
  'Bematech_FI_AbreCupom': ['int', ['string']],
  'Bematech_FI_VendeItem': ['int', ['string', 'string', 'string', 'string', 'string', 'int', 'string', 'string', 'string']],
  'Bematech_FI_CancelaItemAnterior': ['int', []],
  'Bematech_FI_CancelaItemGenerico': ['int', ['string']],
  'Bematech_FI_IniciaFechamentoCupom': ['int', ['string', 'string', 'string']],
  'Bematech_FI_EfetuaFormaPagamento': ['int', ['string', 'string']],
  'Bematech_FI_FechaCupomResumido': ['int', ['string', 'string']],
  'Bematech_FI_TerminaFechamentoCupom': ['int', ['string']],
  'Bematech_FI_FechaCupom': ['int', ['string', 'string', 'string', 'string', 'string', 'string']],
  'Bematech_FI_CancelaCupom': ['int', []],
  'Bematech_FI_VerificaImpressoraLigada': ['int', []],
  'Bematech_FI_AumentaDescricaoItem': ['int', ['string']],
  'Bematech_FI_AbrePortaSerial': ['int', []],
  'Bematech_FI_FechaPortaSerial': ['int', []],
  'Bematech_FI_NumeroCupom': ['int', [stringPtr]]
});



//cancelamento retorna o código
async function cancelaCupom() {
  const cancela = await bemafi.Bematech_FI_CancelaCupom()
  console.log('Cancela cupom ' + cancela)
  return cancela;
}


// inicio da função
async function gravaECF(venda) {

  // abre um novo cupom com CPF se houver
  const abrecupom = await bemafi.Bematech_FI_AbreCupom(venda.CPFCupom)
  console.log('abre cupom ' + abrecupom)

  // loop que faz a venda de todos os itens do cupom
  for (let item of venda.PRODUTOS) {
    if (item.SITTRIB == '060') {
      item.ALIQ = 'FF'
    }
    else if (!item.ALIQ) {
      item.ALIQ = 'FF'
    }
    else {
      item.ALIQ = item.ALIQ * 100
    };
    let descr = item.DESCRICAO
    if (descr.length > 29) {
      descr = descr.slice(0, 28)
    }
    // const aumentadesc = await bemafi.Bematech_FI_AumentaDescricaoItem(item.DESCRICAO)
    // console.log('aumentadesc ' + aumentadesc)
    console.log(item.ALIQ.toString())
    const vendaItem = await bemafi.Bematech_FI_VendeItem(item.CODFISCAL.toString(), descr, item.ALIQ.toString(), 'I', item.QTDFISCAL.toString(), 2, item.VALORUNITFISCAL.valueStr(), '%', '0000')
    console.log('vende item ' + vendaItem);
  }

  // faz o fechamento resumido do cupom
  console.log(venda.TOTALDESC.valueStr())
  const fechacupom = await bemafi.Bematech_FI_FechaCupom('Dinheiro', 'D', '$', '0000', venda.TOTALDESC.valueStr(), 'Obrigado, volte sempre !!!')
  console.log('fecha resumido ' + fechacupom);

  // retorna o numero do cupom após o fechamento
  let nCupom = ref.allocCString('      ')
  const cupom = await bemafi.Bematech_FI_NumeroCupom(nCupom)
  console.log('Nucupom ' + cupom)
  console.log(ref.readCString(nCupom, 0))
  return ref.readCString(nCupom, 0)
}

exports.gravaECF = gravaECF
exports.cancelaCupom = cancelaCupom

exports.leituraX = function () {
  bemafi.Bematech_FI_LeituraX()
}

exports.reducaoZ = function () {
  console.log('redução Z')
  return bemafi.Bematech_FI_ReducaoZ('', '')
}
