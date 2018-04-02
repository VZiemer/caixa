function Dinheiro(valor) {
    this.valor = (Math.floor((valor * 100) + 0.0001) / 100);
}
Dinheiro.prototype.cents = function () {
    return Math.floor((this.valor * 100) + 0.0001);
}
Dinheiro.prototype.valueOf = function () {
    return this.valor;
};
Dinheiro.prototype.toString= function() {
    return "R$ " + this.valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
  }

  module.exports = Dinheiro;
 