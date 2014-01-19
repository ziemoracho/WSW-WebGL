function MainScene(){
	//gl instance
	var gl;
	
	//shader program
	var shaderProgram;
	
	//transformation matrices
	var mvMatrix = [];
	var pMatrix = [];
	var mvMatrixStack = [];
	
	//objects
	var sphere;
	var walls = [];
	
	//timer
	var lastTime = 0;
	
	//pressed keys vector
	var pressedKeys = [];
	
	//flags
	var lightIndicator = false;
	
	this.execute = function (){
		var canvas = document.getElementById("canvasID");
		initGL(canvas);
		initObjects();
		initShaders();
		initBuffers();
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		
		document.onkeydown = handleKeyDown;
	    document.onkeyup = handleKeyUp;
		onTick();
	}
	
	this.onButtonLinearStop = function(){
		sphere.velocityX = 0;
		sphere.velocityY = 0;
		sphere.velocityZ = 0;
	}
	
	this.onButtonLinearHit = function(x, y, z){
		sphere.velocityX += x;
		sphere.velocityY += y;
		sphere.velocityZ += z;
	}
	this.onButtonAngularStop = function(){
		sphere.velocityAngleX = 0;
		sphere.velocityAngleY = 0;
		sphere.velocityAngleZ = 0;
	}
	
	this.onButtonAngularHit = function(x, y, z){
		sphere.velocityAngleX += x;
		sphere.velocityAngleY += y;
		sphere.velocityAngleZ += z;
	}
	
	var onTick = function(){
		requestAnimFrame(onTick);
		drawScene();
		handleKeys();	
		animate();
	}
	
	var animate = function(){
		var lapsed = 0;
		var timeNow = new Date().getTime();
		if(lastTime != 0){
			lapsed = timeNow - lastTime;	
			sphere.evaluateMovement(lapsed);
			checkCollisions();
		}
		lastTime = timeNow;
	}
	
	var checkCollisions = function(){
		for(var i = 0; i < walls.length; i++){
			checkCollisionWith(walls[i]);
		}
	}
	
	var checkCollisionWith = function(wall){
		lightIndicator = false;
		if(wall.vertexPositionData[wall.constantIndex] < 0)
		{
			switch(wall.constantIndex){
			case 0:
				if(sphere.positionX - sphere.radius <= wall.vertexPositionData[wall.constantIndex]){
					sphere.velocityX = -sphere.velocityX;
					sphere.positionX = wall.vertexPositionData[wall.constantIndex] + MainScene.rescueQuantum + sphere.radius;
					lightIndicator = true;
				}
				break;
			case 1:
				if(sphere.positionY - sphere.radius <= wall.vertexPositionData[wall.constantIndex]){
					sphere.velocityY = -sphere.velocityY;
					sphere.positionY = wall.vertexPositionData[wall.constantIndex] + MainScene.rescueQuantum + sphere.radius;
					lightIndicator = true;
				}
				break;
			case 2:
				if(sphere.positionZ - sphere.radius <= wall.vertexPositionData[wall.constantIndex]){
					sphere.velocityZ = -sphere.velocityZ;
					sphere.positionZ = wall.vertexPositionData[wall.constantIndex] + MainScene.rescueQuantum + sphere.radius;
					lightIndicator = true;
				}
				break;
			}
		}
		else{
			switch(wall.constantIndex){
			case 0:
				if(sphere.positionX + sphere.radius >= wall.vertexPositionData[wall.constantIndex]){
					sphere.velocityX = -sphere.velocityX;
					sphere.positionX = wall.vertexPositionData[wall.constantIndex] - MainScene.rescueQuantum - sphere.radius;
					lightIndicator = true;
				}
				break;
			case 1:
				if(sphere.positionY + sphere.radius >= wall.vertexPositionData[wall.constantIndex]){
					sphere.velocityY = -sphere.velocityY;
					sphere.positionY = wall.vertexPositionData[wall.constantIndex] - MainScene.rescueQuantum - sphere.radius;
					lightIndicator = true;
				}
				break;
			case 2:
				if(sphere.positionZ + sphere.radius >= wall.vertexPositionData[wall.constantIndex]){
					sphere.velocityZ = -sphere.velocityZ;
					sphere.positionZ = wall.vertexPositionData[wall.constantIndex] - MainScene.rescueQuantum - sphere.radius;
					lightIndicator = true;
				}
				break;
			}
		}
		
		if(lightIndicator == true)
		{
			lightenWall(wall);
		}
		else{
			unlightenWall(wall);
		}
		
		
	}

	var initBuffers = function(){
		initSphereBuffers();
		initWallBuffers();
	}
	
	var drawScene = function(){
		prepareScene();
		
		mat4.identity(mvMatrix);
		
		drawSphere();
		
		mat4.identity(mvMatrix);
		for(var i = 0; i < walls.length; i++){
			drawWall(walls[i]);
		}	
	}
	
	var drawWall = function(wall){
		gl.bindBuffer(gl.ARRAY_BUFFER, wall.vertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, wall.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, wall.vertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,	wall.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wall.vertexIndexBuffer);

		setMatrixUniforms();

		gl.drawElements(gl.TRIANGLES, wall.vertexIndexBuffer.itemNumber, gl.UNSIGNED_SHORT, 0);
	}
	
	
	var drawSphere = function(){
		mat4.translate(mvMatrix, mvMatrix, [sphere.positionX, sphere.positionY, sphere.positionZ]);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sphere.vertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphere.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sphere.vertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, sphere.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.vertexIndexBuffer);

		mvMatrixPush();
		mat4.rotate(mvMatrix, mvMatrix, degToRad(sphere.rotationX), [1, 0, 0]);
		mat4.rotate(mvMatrix, mvMatrix, degToRad(sphere.rotationY), [0, 1, 0]);
		mat4.rotate(mvMatrix, mvMatrix, degToRad(sphere.rotationZ), [0, 0, 1]);
		
		setMatrixUniforms();
		
		gl.drawElements(gl.TRIANGLES, sphere.vertexIndexBuffer.itemNumber, gl.UNSIGNED_SHORT, 0);
		mvMatrixPop();
		
	}
	
	
	var prepareScene = function(){
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		mat4.perspective(pMatrix, 45*Math.PI/180, gl.viewportWidth / gl.viewportHeight, 0.1	, 100.0);
	}
	
	
	var initSphereBuffers = function(){
		sphere.evaluateVertexBuffers();
		prepareBuffers(sphere);
	}
	
	var prepareBuffers = function(object){
		preparePositionBuffer(object);
		prepareColorBuffer(object);
		prepareIndexBuffer(object);
	}
	
	var preparePositionBuffer = function(object){
		object.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertexPositionData), gl.STATIC_DRAW);
		object.vertexPositionBuffer.itemSize = 3;
		object.vertexPositionBuffer.itemNumber = object.vertexPositionData.length / object.vertexPositionBuffer.itemSize;
	}
	
	var prepareColorBuffer = function(object){
		object.vertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertexColorData), gl.STATIC_DRAW);
		object.vertexColorBuffer.itemSize = 4;
		object.vertexColorBuffer.itemNumber = object.vertexColorData.length / object.vertexColorBuffer.itemSize;
	}
	
	var prepareIndexBuffer = function(object){
		object.vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indexData), gl.STATIC_DRAW);
		object.vertexIndexBuffer.itemSize = 1;
		object.vertexIndexBuffer.itemNumber = object.indexData.length / object.vertexIndexBuffer.itemSize;
	}
	
	var initWallBuffers = function(){
		for(var i = 0; i < walls.length; i++){
			prepareBuffers(walls[i]);
		}	
	}
	
	var lightenWall = function(wall){
		wall.lighten();
		if(wall.lightChangeIndicator == true)
		{
			prepareColorBuffer(wall);
			wall.resetLightChangeIndicator();
		}
		
		
	}
	
	var unlightenWall = function(wall){
		wall.unlighten();
		if(wall.lightChangeIndicator == true)
		{
			prepareColorBuffer(wall);
			wall.resetLightChangeIndicator();
		}
	}
	
	
	var initObjects = function(){
		sphere = new SphereObject(30, 30, 0.2, [0, 0, -7.0], gl);
		sphere.evaluateVertexBuffers();
		
		walls[0] = new WallObject([-2.0, 2.0, 0.0,
		                           -2.0, 2.0, -10.0,
		                           -2.0, -2.0, -10.0,
		                           -2.0, -2.0, 0.0], [1.0, 1.0, 0.0, 0.75], gl, 0);
		walls[1] = new WallObject([-2.0, 2.0, -10.0,
		                           2.0, 2.0, -10.0,
		                           2.0, -2.0, -10.0,
		                           -2.0, -2.0, -10.0], [0.0, 1.0, 1.0, 0.75], gl, 2);
		walls[2] = new WallObject([2.0, 2.0, -10.0,
		                           2.0, 2.0, 0.0,
		                           2.0, -2.0, 0.0,
		                           2.0, -2.0, -10.0], [1.0, 0.0, 0.0, 0.75], gl, 0);
		walls[3] = new WallObject([-2.0, 2.0, 0.0,
		                           -2.0, 2.0, -10.0,
		                           2.0, 2.0, -10.0,
		                           2.0, 2.0, 0.0], [0.0, 1.0, 0.0, 0.75], gl, 1);
		walls[4] = new WallObject([-2.0, -2.0, 0.0,
		                           -2.0, -2.0, -10.0,
		                           2.0, -2.0, -10.0,
		                           2.0, -2.0, 0.0], [0.0, 0.0, 1.0, 0.75], gl, 1);
		walls[5] = new WallObject([-2.0, 2.0, 0.0,
		                           2.0, 2.0, 0.0,
		                           2.0, -2.0, 0.0,
		                           -2.0, -2.0, 0.0], [1.0, 0.0, 1.0, 0.75], gl, 2);		
		
		                           
	}
	
	var initGL = function(canvas){
		try{
			gl = canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
		}
		catch(e){
		}
	
		if(!gl){
			alert("Could not initialize webGL!");
		}
	}
	
	var getShader = function(gl, id){
		var shaderScript = document.getElementById(id);
	
		if(!shaderScript){
			return null;	
		}
	
		var str = "";
		var k = shaderScript.firstChild;
		while(k){
			if(k.nodeType == 3){
				str += k.textContent;
			}	
			k = k.nextSibling;
		}
	
		var shader;
	
		if(shaderScript.type == "x-shader/x-fragment"){
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		}
		else if(shaderScript.type == "x-shader/x-vertex"){
			shader = gl.createShader(gl.VERTEX_SHADER);
		}
		else{
			return null;	
		}
	
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			alert(gl.getShaderInfoLog(shader));
			return null;
		}
	
		return shader;
	}
	
	var setMatrixUniforms = function(){
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	}
	
	var mvMatrixPush = function(){
		var tmp = mat4.create();
	
		mat4.copy(tmp, mvMatrix);
		mvMatrixStack.push(tmp);
	}
	
	var mvMatrixPop = function(){
		if(mvMatrixStack.length == 0){
			throw "Invalid pop matrix (length == 0)";
		}
		else{
			mvMatrix = mvMatrixStack.pop();
		}
	}
	
	var degToRad = function(degrees){
		return degrees * Math.PI / 180;
	}
	
	var initShaders = function(){
		var fragmentShader = getShader(gl, "shader-fs");
		var vertexShader = getShader(gl, "shader-vs");
	
		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, fragmentShader);
		gl.attachShader(shaderProgram, vertexShader);
		gl.linkProgram(shaderProgram);
	
		if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
			alert("Could not initialize shaders!");
		}
	
		gl.useProgram(shaderProgram);
	
		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");	
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	
		shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
		gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	
		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	}
	
	var handleKeyUp = function(event){
		pressedKeys[event.keyCode] = false;
	}
	var handleKeyDown = function(event){
		pressedKeys[event.keyCode] = true;
	}
	
	var handleKeys = function(){
		if(pressedKeys[33])
		{
			sphere.velocityAngleZ += 1;
			lightenWall(walls[0]);
		}
		if(pressedKeys[34])
		{
			sphere.velocityAngleZ -= 1;
			unlightenWall(walls[0]);
		}
		if(pressedKeys[39])
		{
			sphere.velocityAngleY += 1;
		}
		if(pressedKeys[37])
		{
			sphere.velocityAngleY -= 1;
		}
		if(pressedKeys[40])
		{
			sphere.velocityAngleX += 1;
		}
		if(pressedKeys[38])
		{
			sphere.velocityAngleX -= 1;
		}
	}

}

MainScene.rescueQuantum = 0.01;