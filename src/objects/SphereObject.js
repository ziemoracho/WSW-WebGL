function SphereObject(latitudeBands, longitudeBands, radius, position, gl){
	this.latitudeBands = latitudeBands;
	this.longitudeBands = longitudeBands;
	this.radius = radius;
	
	this.vertexPositionBuffer = [];
	this.vertexColorBuffer = [];
	this.vertexIndexBuffer = [];
	
	this.vertexPositionData = [];
	this.vertexColorData = [];
	this.indexData = [];
	
	this.rotationX = 0;
	this.rotationY = 0;
	this.rotationZ = 0;
	
	this.velocityAngleX = 0;
	this.velocityAngleY = 0;
	this.velocityAngleZ = 0;
	
	this.positionX = position[0];
	this.positionY = position[1];
	this.positionZ = position[2];

	this.velocityX = 1;
	this.velocityY = 1.2;
	this.velocityZ = 1.4;
	


	this.evaluateVertexBuffers = function(){
		 for(var latNumber=0; latNumber <= this.latitudeBands; latNumber++) {
	         var theta = latNumber * Math.PI / this.latitudeBands;
	         var sinTheta = Math.sin(theta);
	         var cosTheta = Math.cos(theta);
	
	         for(var longNumber=0; longNumber <= this.longitudeBands; longNumber++) {
	             var phi = longNumber * 2 * Math.PI / this.longitudeBands;
	             var sinPhi = Math.sin(phi);
	             var cosPhi = Math.cos(phi);
	
	             var x = cosPhi * sinTheta;
	             var y = cosTheta;
	             var z = sinPhi * sinTheta;
	
	             this.vertexPositionData.push(this.radius * x);
	             this.vertexPositionData.push(this.radius * y);
	             this.vertexPositionData.push(this.radius * z);
	             
	             this.vertexColorData.push(SphereObject.defaultColor[(0+longNumber)%4]);
	             this.vertexColorData.push(SphereObject.defaultColor[(1+longNumber)%4]);
	             this.vertexColorData.push(SphereObject.defaultColor[(2+longNumber)%4]);
	             this.vertexColorData.push(SphereObject.defaultColor[(3+longNumber)%4]);
	         }
	     }
		 
	     for(var latNumber = 0; latNumber < this.latitudeBands; latNumber++) {
	    	 for(var longNumber = 0; longNumber < this.longitudeBands; longNumber++) {
	    		 var first = (latNumber * (this.longitudeBands + 1)) + longNumber;
	    		 var second = first + this.longitudeBands + 1;
	    		 this.indexData.push(first);
	    		 this.indexData.push(second);
	    		 this.indexData.push(first + 1);
	
	    		 this.indexData.push(second);
	    		 this.indexData.push(second + 1);
	    		 this.indexData.push(first + 1);
	         }
	    }
	}
	
	this.evaluateMovement = function(lapsed){
		this.rotationX += this.velocityAngleX*lapsed/SphereObject.velocityConstant;
		this.rotationY += this.velocityAngleY*lapsed/SphereObject.velocityConstant;
		this.rotationZ += this.velocityAngleZ*lapsed/SphereObject.velocityConstant;
	
		this.positionX += this.velocityX*lapsed/SphereObject.velocityConstant;
		this.positionY += this.velocityY*lapsed/SphereObject.velocityConstant;
		this.positionZ += this.velocityZ*lapsed/SphereObject.velocityConstant;
	}
}

//constants
SphereObject.velocityConstant = 1000;
SphereObject.defaultColor = [1.0, 0.0, 1.0, 1.0];
