exports.converteData = function (texto) {
	var data = texto.match(/(\d{2,4})(\/|-|\.)(\d{2})\2(\d{2,4})/).filter( function( elem, index, array ) {
    return Number(elem);
} )
	if (data[2].length === 4) {data.reverse()}
	console.log(data)
  return new Date(data);
}