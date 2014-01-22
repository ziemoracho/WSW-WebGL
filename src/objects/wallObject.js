function WallObject(vertices, gl, constantIndex){
	this.vertexPositionBuffer = [];
	this.vertexColorBuffer = [];
	this.vertexIndexBuffer = [];
	this.constantIndex = constantIndex;

	this.indexData = [0, 1, 2, 0 ,2 ,3];
	this.vertexPositionData = vertices;
	this.vertexColorData = [];
	this.lightChangeIndicator = false;
	
	this.isLightened = false;
	
	this.lighten = function(){
		if(this.isLightened != true){
			this.isLightened = true;
			this.prepareColor(WallObject.defaultColorLighten);
			this.lightChangeIndicator = true;
		}
	}
	
	this.unlighten = function(){
		if(this.isLightened == true){
			this.isLightened = false;
			this.prepareColor(WallObject.defaultColorUnlighten);
			this.lightChangeIndicator = true;
		}
		
	}
	
	this.prepareColor = function(color){
		for(var i = 0; i < 16; i++){
			this.vertexColorData[i] = color[i%4];
		}
	}
	
	this.resetLightChangeIndicator = function(){
		lightChangeIndicator = false;
	}
	
	
	this.prepareColor(WallObject.defaultColorUnlighten);
	
}

WallObject.defaultColorUnlighten = [0.0, 0.0, 0.0, 0.05];
WallObject.defaultColorLighten = [1.0, 0.0, 0.0, 0.3];



