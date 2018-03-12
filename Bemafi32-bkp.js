const fs = require('fs');
let prodvenda = '';
let formaPgto = '';
let empresa = '';
let contador = 0;
function verificaStatus (callback){
    // verifica o estado do status da impressora
    setTimeout(function(){
        fs.readFile ('./'+empresa+'/Status.txt', 'utf8', function(err, data) {
            if (err) return verificaStatus(callback);
                else return callback();
        })
    },1200)
};

function abreCupom (cliente) {
    // abertura do cupom com cpf e chama a vendaItem
    gravacupom ('003|'+cliente+'|',vendeItem); 
}

function vendeItem () {
    let prodatual = prodvenda[contador];
    console.log(contador);
    contador++;
    if(prodatual)
        return gravacupom ('800|'+prodatual.CODIGO+'||'+prodatual.DESCRICAO+'|00|F1|'+prodatual.UNIDADE+'|I|0|'+prodatual.QTDPEDIDO+'|2|'+prodatual.VALOR+'|$|0,00|0,00|A|09011200|5101|Informacoes adicionais|90|0|||00||5103403|||||||||||||||||04||||||04||||||||||||||||',vendeItem);
    else
    return iniciaFechamento();  
}

function iniciaFechamento() {
    //usar funcção depois de inserir itens e antes de inserir pagamentos
    //AcrescimoDesconto: A para acrescimos D para desconto
    //Tipo : $ ou %
    //Valor : 14 digitos para valor e 4 digitos percentual (pode usar ,)
    contador = 0;
    gravacupom ('040|D|%|0|',fechaCupom);
}

function efetuaPagamento() {
    let pgtoAtual = formaPgto[contador];
    console.log(contador);
    contador++;
    if(pgtoAtual)
        return gravacupom ('023|Dinheiro|'+pgtoAtual.VALOR+'|',efetuaPagamento);
    else
    return fechaCupom(); 
}

function fechaCupom() {
    return gravacupom ('082|Obrigado, volte sempre !!!|');
}

function gravacupom (comando,callback) {
    //grava no cupom e retorna a próxima funcão (callback)
    console.log(comando); 
    fs.writeFile ('./'+empresa+'/BEMAFI32.CMD', comando, (err) =>  {
        verificaStatus(callback);
    })
}

exports.gravaECF = function(dados){
    if (dados.empresa==1) empresa = 'florestal';
    if (dados.empresa==2) empresa = 'local';
    prodvenda = dados.produtos;
    formaPgto = dados.pagamento;
    contador=0;
    abreCupom (dados.Cliente); 
}
