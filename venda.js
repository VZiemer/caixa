const dinheiro = require('./dinheiro');
function Venda(lcto, data, transito, cgc, insc, codcli, nomecli, email, fone, razao, endereco, numero, bairro, cep, codibge, codcidade, cidade, estado, complemento, desconto, frete, seguro, total) {
    //venda
    this.LCTO = []
    this.DATA = new Date(data)
    this.LCTO.push(lcto)
    //transito
    this.TRANSITO = []
    this.TRANSITO.push(transito)
    //cliente
    this.CGC = cgc || null
    this.INSC = insc || null
    this.NFE = null
    this.CODCLI = codcli || null
    this.NOMECLI = nomecli || null
    this.EMAIL = email || null
    this.FONE = fone || null
    this.RAZAO = razao || null
    //endereço
    this.ENDERECO = endereco || null
    this.NUMERO = numero || null
    this.BAIRRO = bairro || null
    this.CEP = cep || null
    this.CODIBGE = codibge || null
    this.CODCIDADE = codcidade || null
    this.CIDADE = cidade || null
    this.ESTADO = estado || null
    this.COMPLEMENTO = complemento || null
    //valores
    this.DESCONTO = new dinheiro(desconto) || 0
    this.FRETE = new dinheiro(frete) || 0
    this.SEGURO = new dinheiro(seguro) || 0
    this.TOTAL = 0
    this.TOTALDESC = 0
    this.DESCONTOITEM = 0
    this.PAGAR = this.TOTAL
    //produtos
    this.PRODUTOS = []
    this.PAGAMENTO = []
};
Venda.prototype.insereLcto = function (lcto, transito) {
    //lcto
    console.log("inserelcto" + lcto + " " + transito)
    this.LCTO.push(lcto)
    //transito
    this.TRANSITO.push(transito)
}

Venda.prototype.calculaTotal = function () {
    this.TOTAL = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
        return valorAnterior + (valorAtual.TOTALSD);
    }, 0))
    this.TOTALDESC = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
        return valorAnterior + (valorAtual.TOTAL);
    }, 0))
    this.PAGAR = this.TOTALDESC
}
Venda.prototype.VLDESC = function () { return new dinheiro(this.TOTAL - this.TOTALDESC) }
Venda.prototype.PERCENTDESC = function () { return (1 - (this.TOTAL / this.TOTALDESC)) }
Venda.prototype.insereProduto = function (produto) {
    // if (produto.VALOR.valor < 0) {

    // }
    // if (produto.VALOR.valor >= 0) {
        this.PRODUTOS.push(new Produto(produto.CODIGO, produto.VALOR, produto.QTDPEDIDO, produto.QTDRESERVA, produto.UNIDADE, produto.CODPRODVENDA, produto.VALORINI, produto.DESCRICAO, produto.CODINTERNO, produto.SITTRIB, produto.NCM, produto.ORIG, produto.GRUPO, produto.ALIQ, produto.CEST));
        this.calculaTotal()
    // }
}
Venda.prototype.inserePagamento = function (pagamento) {
    this.PAGAMENTO.push(pagamento);
}
Venda.prototype.insereDescontos = function (produto) {
    this.DESCONTOITEM += produto.VALOR * produto.QTDPEDIDO
}
Venda.prototype.alteraValorProduto = function (codprodvenda, valor) {
    console.log(codprodvenda)
    let index = this.PRODUTOS.findIndex(obj => obj.CODPRODVENDA == codprodvenda)
    console.log(this.PRODUTOS)
    console.log(index)
    this.PRODUTOS[index].VALOR = new dinheiro(valor)
    this.PRODUTOS[index].TOTAL = new dinheiro(valor * this.PRODUTOS[index].QTD)
    this.calculaTotal()
}
function Produto(codpro, valor, qtd, qtdreserva, unidade, codprodvenda, valorini, descricao, codinterno, sittrib, ncm, orig, grupo, aliq, cest) {
    this.CODPRO = codpro || null
    this.CODPRODVENDA = codprodvenda || null
    this.CODINTERNO = codinterno || null
    this.DESCRICAO = descricao || null
    this.VALOR = new dinheiro(valor) || 0
    this.VALORINI = new dinheiro(valorini) || 0
    this.QTD = qtd || 0
    this.QTDRESERVA = qtdreserva || 0
    this.TOTAL = new dinheiro(valor * qtd)
    this.TOTALSD = new dinheiro(valorini * qtd)
    this.UNIDADE = unidade || null
    this.SITTRIB = sittrib || null
    this.NCM = ncm || null
    this.CEST = cest || null
    this.ORIG = orig
    this.GRUPO = grupo || null
    this.ALIQ = aliq || 0
}


module.exports = Venda;