const dinheiro = require('./dinheiro');
class Venda {
    constructor(lcto, data, transito, cgc, insc, codcli, nomecli, codvend, nomevend, email, fone, razao, endereco, numero, bairro, cep, codibge, codcidade, cidade, estado, complemento, desconto, frete, seguro, total, fatura, liberafat, liberanp) {
        //dados da venda
        this.LCTO = [];
        this.DATA = new Date(data);
        this.LCTO.push(lcto);
        this.CODVEND = codvend || null;
        this.NOMEVEND = nomevend || null;
        //dados do transito
        this.TRANSITO = [];
        this.TRANSITO.push(transito);
        //cliente
        this.CGC = cgc || null;
        this.CPFCupom = null;
        this.INSC = insc || null;
        this.NFE = null;
        this.CODCLI = codcli || null;
        this.NOMECLI = nomecli || null;
        this.EMAIL = email || null;
        this.FONE = fone || null;
        this.RAZAO = razao || null;
        //endereço
        this.ENDERECO = endereco || null;
        this.NUMERO = numero || null;
        this.BAIRRO = bairro || null;
        this.CEP = cep || null;
        this.CODIBGE = codibge || null;
        this.CODCIDADE = codcidade || null;
        this.CIDADE = cidade || null;
        this.ESTADO = estado || null;
        this.COMPLEMENTO = complemento || null;
        //valores que vem da tabela
        this.DESCONTO = new dinheiro(desconto) || 0;
        this.FRETE = new dinheiro(frete) || 0;
        this.SEGURO = new dinheiro(seguro) || 0;
        // valores calculados ao inserir itens na venda
        this.TOTALPRODUTOS = new dinheiro(0); // inicia zerado
        this.TOTAL = new dinheiro(0); // inicia zerado
        this.TOTALDESC = new dinheiro(0); // inicia zerado
        this.DESCONTOITEM = new dinheiro(0); // inicia zerado
        this.PAGAR = new dinheiro(0); // inicia zerado
        //produtos
        this.PRODUTOS = [];
        //pagamentos
        this.PAGAMENTO = [];
        //dados do transportador
        this.TRANSPORTE = [];
        //documentos fiscais
        this.NUCUPOM = null;
        this.NFE = null;
        this.FATURAMENTO = fatura || null;
        this.LIBERAFAT = liberafat || 0;
        this.LIBERANP = liberanp || 0;
    }
    insereCPFCupom(valor) {
        this.CPFCupom = valor;
    }
    insereTransporte(volumes, peso, tipofrete, transportador) {
        /* TIPOS DE FRETE
         0– Por conta do emitente;
         1– Por conta do destinatário/remetente;
         2– Por conta de terceiros;
         9– Sem frete. (V2.0) */
        this.TRANSPORTE = {
            VOLUMES: volumes || '',
            PESO: peso || '',
            TIPOFRETE: tipofrete || '',
            TRANSPORTADOR: transportador || ''
        };
    }
    insereNucupom(cupom) {
        this.NUCUPOM = cupom;
    }
    insereNfe(nfe) {
        this.NFE = nfe;
    }
    insereLcto(lcto, transito) {
        //lcto
        console.log("inserelcto" + lcto + " " + transito);
        this.LCTO.push(lcto);
        //transito
        this.TRANSITO.push(transito);
    }
    calculaTotal() {
        this.TOTAL = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
            return valorAnterior + (valorAtual.TOTALSD);
        }, 0)).soma(this.FRETE);
        this.TOTALDESC = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
            return valorAnterior + (valorAtual.TOTAL);
        }, 0)).soma(this.FRETE);
        this.PAGAR = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
            return valorAnterior + (valorAtual.TOTAL);
        }, 0)).soma(this.FRETE);
        this.TOTALPRODUTOS = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
            return valorAnterior + (valorAtual.TOTAL);
        }, 0));
    }
    aplicaDesconto(percent) {
        for (let prod of this.PRODUTOS) {
            console.log(prod.VALOR.valor);
            if (prod.VALOR.valor === prod.VALORINI.valor) {
                prod.VALORDESCPREV = new dinheiro(prod.VALOR.desconto(4) * prod.QTD);
                console.log(prod.VALORDESCPREV.valor);
            }
            else {
                prod.VALORDESCPREV = prod.TOTAL;
            }
        }
    }
    descontoPrev() {
        return new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
            return valorAnterior + (valorAtual.VALORDESCPREV);
        }, 0));
    }
    VLDESC() { return new dinheiro(this.TOTAL - this.TOTALDESC); }
    PERCENTDESC() { return (100 - (this.TOTALDESC * 100 / this.TOTAL)).toFixed(0); }
    insereProduto(produto) {
        this.PRODUTOS.push(new Produto(produto.CODIGO, produto.VALOR, produto.QTDPEDIDO, produto.QTDRESERVA, produto.UNIDADE, produto.CODPRODVENDA, produto.VALORINI, produto.PRPROMO, produto.DESCRICAO, produto.CODINTERNO, produto.SITTRIB, produto.NCM, produto.ORIG, produto.GRUPO, produto.ALIQ, produto.CEST, produto.BASECALC, produto.FRETEPROD, produto.ALIQIPI, produto.CODFISCAL, produto.MULTQTD,produto.QTDFISCAL,produto.VALORUNITFISCAL));
        this.calculaTotal();
    }
    inserePagamento(pagamento) {
        this.PAGAMENTO.push(pagamento);
    }
    insereDescontos(produto) {
        this.DESCONTOITEM.soma(produto.VALOR * produto.QTDPEDIDO);
    }
    alteraValorProduto(codprodvenda, valor) {
        console.log(codprodvenda);
        let index = this.PRODUTOS.findIndex(obj => obj.CODPRODVENDA == codprodvenda);
        console.log(this.PRODUTOS);
        console.log(index);
        this.PRODUTOS[index].VALOR = new dinheiro(valor);
        this.PRODUTOS[index].TOTAL = new dinheiro(valor * this.PRODUTOS[index].QTD);
        this.calculaTotal();
    }
}
;



class Produto {
    constructor(codpro, valor, qtd, qtdreserva, unidade, codprodvenda, valorini, valorpromo, descricao, codinterno, sittrib, ncm, orig, grupo, aliq, cest, basecalc, freteprod, aliqipi, codprofiscal, multqtd,qtdfiscal,valorunitfiscal) {
        this.CODPRO = codpro || null;
        this.CODPROFISCAL = codprofiscal || null;
        this.CODPRODVENDA = codprodvenda || null;
        this.CODINTERNO = codinterno || null;
        this.DESCRICAO = descricao || null;
        this.VALOR = new dinheiro(valor) || 0;
        this.VALORINI = new dinheiro(valorini) || 0;
        this.VALORPROMO = new dinheiro(valorpromo) || 0;
        this.QTD = qtd || 0;
        this.MULTQTD = multqtd;
        this.QTDRESERVA = qtdreserva || 0;
        this.TOTAL = new dinheiro(valor * qtd);
        this.TOTALSD = new dinheiro(valorini * qtd);
        this.UNIDADE = unidade || null;
        this.SITTRIB = sittrib || null;
        this.NCM = ncm || null;
        this.CEST = cest || null;
        this.ORIG = orig;
        this.GRUPO = grupo || null;
        this.ALIQ = aliq || 0;
        this.BASECALC = new dinheiro(basecalc);
        this.FRETEPROD = new dinheiro(freteprod);
        this.ALIQIPI = aliqipi || null;
        this.QTDFISCAL = qtdfiscal;
        this.VALORUNITFISCAL = new dinheiro(valorunitfiscal);
    }
}


module.exports = Venda;