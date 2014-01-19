function WallObject(vertices, color, gl, constantIndex){
	this.vertexPositionBuffer = [];
	this.vertexColorBuffer = [];
	this.vertexIndexBuffer = [];
	this.constantIndex = constantIndex;

	this.indexData = [0, 1, 2, 0 ,2 ,3];
	this.vertexPositionData = vertices;
	this.vertexColorData = [];
	this.color = color;
	this.lightChangeIndicator = false;
	
	this.isLightened = false;
	
	this.lighten = function(){
		if(this.isLightened != true){
			this.isLightened = true;
			this.prepareColor(WallObject.defaultColor);
			this.lightChangeIndicator = true;
		}
	}
	
	this.unlighten = function(){
		if(this.isLightened == true){
			this.isLightened = false;
			this.prepareColor(this.color);
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
	
	
	this.prepareColor(this.color);
	
}

WallObject.defaultColor = [1.0, 1.0, 1.0, 0.2];



