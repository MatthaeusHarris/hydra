module.exports = function(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}