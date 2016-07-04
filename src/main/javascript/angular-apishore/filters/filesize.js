apishore.filter('filesize', function() {
	var units = [ 'bytes', 'KB', 'MB', 'GB', 'TB', 'PB' ];

	return function(bytes, precision) {
		bytes = parseFloat(bytes);
		if (isNaN(bytes) || !isFinite(bytes)) {
			return 'Unknown';
		}
		var unit = 0;
		while (bytes >= 1024) {
			bytes /= 1024;
			unit++;
		}
		return unit == 0 ? bytes + ' bytes' : bytes.toFixed(+precision) + ' ' + units[unit];
	};
});