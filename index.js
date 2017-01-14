var request = require("request");

var Service, Characteristic;

module.exports = function(homebridge) {
	console.log("homebridge API version: " + homebridge.version);
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-windowcover-webapi", "WindowCoverWebAPI", WindowCover);
};


function WindowCover(log, config) {
	this.service = new Service.WindowCovering(this.name);
	this.log = log;
	this.name = config.name || "Window cover";
	this.id = config.id || 0;	
	this.apiroute = config.WebAPIroute;


	// Required Characteristics
	this.currentPosition = 100;
	this.targetPosition = 100;

	//Characteristic.PositionState.DECREASING = 0;
	//Characteristic.PositionState.INCREASING = 1;
	//Characteristic.PositionState.STOPPED = 2;

	this.positionState = Characteristic.PositionState.STOPPED;
	this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);

	// Optional Characteristics
	//this.holdPosition = Characteristic.HoldPosition;
	//this.targetHorizontalTiltAngle = Characteristic.TargetHorizontalTiltAngle;
	//this.targetVerticalTiltAngle = Characteristic.TargetVerticalTiltAngle;
	//this.currentHorizontalTiltAngle = Characteristic.CurrentHorizontalTiltAngle;
	//this.currentVerticalTiltAngle = Characteristic.CurrentVerticalTiltAngle;
	//this.obstructionDetected = Characteristic.ObstructionDetected;

}

WindowCover.prototype = {
	//Start
	identify: function(callback) {
		this.log("Identify requested!");
		callback(null);
	},
	// Required
	getCurrentPosition: function(callback) {
		if (this.apiroute !== undefined) {
			//HTTP API ACTION
			var url = this.apiroute + this.id + "/STATUS";
			
			this.callWebAPI(url,
				function(res){
					if (Object.keys(res).length > 0){
						this.currentPosition = res['current'];
						this.log("getCurrentPosition:", this.currentPosition);
						this.service.setCharacteristic(Characteristic.CurrentPosition, this.currentPosition);
						callback(null, this.currentPosition);
					} else {
						callback(err, this.currentPotision);
					}
				}.bind(this)
			);
		} else {
			//FAKE SUCCESS
			this.log("Fake Success");
			this.log("getCurrentPosition:", this.currentPosition);
			var error = null;
			callback(error, this.currentPosition);
		}
	},

	getName: function(callback) {
		this.log("getName :", this.name);
		var error = null;
		callback(error, this.name);
	},

	getTargetPosition: function (callback) {
		if (this.apiroute !== undefined) {
			//HTTP API ACTION
			var url = this.apiroute + this.id + "/STATUS";
			
			this.callWebAPI(url,
				function(res){
					if (Object.keys(res).length > 0){
						this.targetPosition = res['target'];
						this.log("getTargetPosition :", this.targetPosition);
						this.service.setCharacteristic(Characteristic.TargetPosition, this.targetPosition);
						callback(null, this.targetPosition);
					} else {
						callback(err, this.targetPosition);
					}
				}.bind(this)
			);
		} else {
			//FAKE SUCCESS
			this.log("Fake Success");
			this.log("getTargetPosition :", this.targetPosition);
			this.service.setCharacteristic(Characteristic.TargetPosition, this.targetPosition);
			var error = null;
			callback(error, this.targetPosition);
		}
	},

	setTargetPosition: function (value, callback) {
		this.log("setTargetPosition from %s to %s", this.targetPosition, value);
		this.targetPosition = value;

				
		if(this.targetPosition < this.currentPosition) {
			this.positionState = 0;
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.DECREASING);
		} else if(this.targetPosition > this.currentPosition) {
			this.positionState = 1;
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.INCREASING);
		} else if(this.targetPosition == this.currentPosition) {
			this.positionState = 2;
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
		}		

		if (this.apiroute !== undefined) {
			if (this.positionState != 2){
				//HTTP API ACTION
				var url = this.apiroute + this.id + "/" + this.targetPosition;
				
				this.callWebAPI(url,
					function(res){
						if (Object.keys(res).length > 0){
							this.currentPosition = res['current'];
							this.service.setCharacteristic(Characteristic.CurrentPosition, this.currentPosition);
							this.positionState = res['state'];
							this.service.setCharacteristic(Characteristic.PositionState, this.positionState);
							callback(null);
						} else {
							callback(err);
						}
					}.bind(this)
				);
			} else {
				callback(null);	
			}
		} else {
			//FAKE SUCCESS
			this.log("Fake Success");
			this.currentPosition = this.targetPosition;
			this.service.setCharacteristic(Characteristic.CurrentPosition, this.currentPosition);
			this.log("currentPosition is now %s", this.currentPosition);
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
			callback(null); // success
		}
	},

	getPositionState: function(callback) {
		if (this.apiroute !== undefined) {
			//HTTP API ACTION
			var url = this.apiroute + this.id + "/STATUS";
			
			this.callWebAPI(url,
				function(res){
					if (Object.keys(res).length > 0){
						this.positionState = res['state'];
						this.log("getPositionState:", this.positionState);
						this.service.setCharacteristic(Characteristic.PositionState, this.positionState);
						callback(null, this.positionState);
					} else {
						callback(err, this.positionState);
					}
				}.bind(this)
			);
		} else {
			//FAKE SUCCESS
			this.log("Fake Success");
			this.log("getPositionState:", this.positionState);
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
			var error = null;
			callback(error, this.positionState);
		}
	},

	getServices: function() {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "HTTP Manufacturer")
			.setCharacteristic(Characteristic.Model, "HTTP Model")
			.setCharacteristic(Characteristic.SerialNumber, "HTTP Serial Number");

		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));

		// Required Characteristics
		this.service
			.getCharacteristic(Characteristic.CurrentPosition)
			.on('get', this.getCurrentPosition.bind(this));

 		this.service
			.getCharacteristic(Characteristic.TargetPosition)
			.on('get', this.getTargetPosition.bind(this))
			.on('set', this.setTargetPosition.bind(this));

		this.service
			.getCharacteristic(Characteristic.PositionState)
			.on('get', this.getPositionState.bind(this));

		// Optional Characteristics
		//TODO
	
		return [informationService, this.service];
	},
	
	callWebAPI: function(url, callback)
	{
			var json = [{}];
			
			this.log("GET", url);
			request.get({
				url: url
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					this.log("Response success: " + url);
					json = JSON.parse(body);
					callback(json[0]);
				} else {
					this.log("Response error" , err);
				}
			}.bind(this));
	}
};
