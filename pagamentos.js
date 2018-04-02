const Hoje = new Date();
const dinheiro = require('./dinheiro'); 
const calendario = require('calendario');
calendario.use('BR-SP');
Pagamento = function (vl,tipo,venc,codban,banco,agencia,conta,nrcheque,emnome,pagto) {
    if (!calendario.isWorkday(venc)) {
        venc = new Date(venc+1*24*60*60*1000);
    }
    return {
   'valor' : vl,
    'tipo' : tipo,
    'vencimento' : venc,
    'pagto' : pagto,
    'codban' : codban,
    'banco': banco || null,
    'agencia':agencia || '',
    'conta': conta || '',
    'nrcheque':nrcheque || '',
    'emnome':emnome || ''
    };
}
exports.Pagamentos = function (vlTot,vlParc,numParc,tipopag,periodo,codban,banco,agencia,conta,nrcheque,venctoch,emnome) {
    var arred = new dinheiro(vlTot- (vlParc*numParc));
    var parc = new dinheiro(vlParc)
    var vencto =''
    var pagto = ''
    if (arred) {
    parc1 = new dinheiro(arred + parc);         
    }
    var parcelas = [];
    if (tipopag=='NP') {
        vencto = new Date();
        vencto.setMonth(vencto.getMonth()+1, periodo);     
    }
    else if (tipopag=='CH') {
        if (venctoch) {
            vencto = venctoch;
        }
        else { vencto = new Date(); }
    }
    else if (tipopag=='VL') {
        pagto = new Date()  
        vencto = new Date(Date.now()+1*periodo*24*60*60*1000) 
    }        
    else {
        vencto = new Date(Date.now()+1*periodo*24*60*60*1000)
    }
    parcelas.push(new Pagamento(parc1,tipopag,vencto,codban,banco,agencia,conta,nrcheque,emnome,pagto))
    for (i=1; i<numParc;i++) {
        var vencto = new Date(Date.now()+(i+1)*periodo*24*60*60*1000)   
        parcelas.push( new Pagamento(parc,tipopag,vencto,codban,banco,agencia,conta,nrcheque,emnome,pagto));
    }
    return parcelas;
}
