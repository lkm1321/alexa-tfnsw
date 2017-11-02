'use strict'

const request = require('request'); 
// require('request-debug', request); 
request.debug = false; 

function TFNSW(_apiKey){
	this.apiKey = _apiKey; 
	this.basePath = 'https://api.transport.nsw.gov.au/v1/tp/';

}

// Gets departure for station specified by 'name', after date/time. 

TFNSW.prototype.getDepartures = function(name, date, time, callback, type = 'stop', nameKey = ''){ // @TODO default inputs for date and time are current. 
	const opts = this.getOpts('departure_mon', {
		'type_dm': type,
		'name_dm': name,
		'nameKey_dm': nameKey, 
		'itdDate': date,
		'itdTime': time
	});
	return request(opts, callback);
}; 

TFNSW.prototype.getStop = function(name, number, callback){
	const opts = this.getOpts('stop_finder', {
		'type_sf': 'stop', 
		'name_sf': name, 
		'anyMaxSizeHitList': number.toString()
	});
	return request(opts, callback); 
};

TFNSW.prototype.getTrips = function(from, to, date, time, number, callback){
	const opts = this.getOpts('trip', {
		'itdDate': date, 
		'itdTime': time, 
		'type_origin': 'any', // This requres us to specify a location ID
		'name_origin': from, 
		'type_destination': 'any', 
		'name_destination': to, 
		'calcNumberOfTrips': number, 
		'inclMOT_1': 'on', // 1: Trains 4: Light rail 5: bus 7: coach 9: ferry 11: school bus
		'routeType': 'leasttime',
	}); 
	return request(opts, callback); 
}; 

TFNSW.prototype.getOpts = function(path, params){
	var protoOpts = {
		uri: this.basePath + path, 
		method: 'GET', 
		headers: {
    		'Authorization': 'apikey ' + this.apiKey,
    		'Accept': 'application/json',
    		'Accept-Language': 'en_AU'},
    	qs: {
    		"TfNSWDM":true,
    		"outputFormat":"rapidJSON",
    		"coordOutputFormat":"EPSG:4326",
    		"mode":"direct",
    		"depArrMacro":"dep",
    		"version":"10.2.2.48"
    	}
	};

	// 2nd argument overwrites the properties of the 1st. i.e. caller can overwrite at will. 
	protoOpts.qs = Object.assign(protoOpts.qs, params);

	return protoOpts; 
}

module.exports = TFNSW; 

