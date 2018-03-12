exports.Money = function(valor) {
    this.cents = Math.floor(valor);
    this.valueOf = function () {
            return (this.cents/100);
    }
    this.money = function() {
            return (this.cents/100);
        }
}
exports.toCents = function(valor) {
    return Math.floor((valor * 100) + 0.0001);
}
 

 