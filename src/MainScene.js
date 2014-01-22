function MainScene(cameraParameters, mainVertices, pointSize, sphereParameters){
	//gl instance
	var gl;
	
	//parameters
	var mainVertices = mainVertices;
	var cameraParameters = cameraParameters;
	var pointSize = pointSize;
	var sphereParameters = sphereParameters;
	
	var canvasWidth;
	var canvasHeight;
	
	//shader program
	var shaderProgram;
	
	//transformation matrices
	var mvMatrix = [];
	var pMatrix = [];
	var mvMatrixStack = [];
	var mvMatrixBase = [];
	var rotationMatrix = [];
	
	//objects
	var sphere;
	var walls = [];
	var pointSpheres = [];
	
	//timer
	var lastTime = 0;
	
	//pressed keys vector
	var pressedKeys = [];
	
	//flags
	var lightIndicator = false;
	var animationOnline = false;
	
	if(sphereParameters != null){
		animationOnline = true;
	}
	
	this.execute = function (){
		var canvas = document.getElementById("canvasID");
		initGL(canvas);
		prepareCamera();
		init3DScene();
		initShaders();
		init3DSceneBuffers();
		
		gl.clearColor(0.0, 0.0, 0.0, 0.3);
		//gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		//gl.depthMask(gl.TRUE);
		
		document.onkeydown = handleKeyDown;
	    document.onkeyup = handleKeyUp;
	    
	    onTick();
	}
	
	var prepareCamera = function(){
		var cameraMatrix = [];
		var projectionMatrix = [];
		
		
		quat.fromMat3(rotationMatrix, cameraParameters.rotation);
		
		mat4.fromRotationTranslation(mvMatrixBase, rotationMatrix, cameraParameters.translation);
		
		mat4.ortho(projectionMatrix, 0, canvasWidth, canvasHeight, 0, cameraParameters.nearestDistance, cameraParameters.farthestDistance);
		
		cameraMatrix = mat4.create();
		cameraMatrix[0] = cameraParameters.alpha;
		cameraMatrix[1] = 0;
		cameraMatrix[2] = 0;
		cameraMatrix[3] = 0;	
		
		cameraMatrix[4] = 0;
		cameraMatrix[5] = cameraParameters.beta;
		cameraMatrix[6] = 0;
		cameraMatrix[7] = 0;
			
		cameraMatrix[8] = cameraParameters.pixelX;
		cameraMatrix[9] = cameraParameters.pixelY;
		cameraMatrix[10] = -(cameraParameters.nearestDistance+cameraParameters.farthestDistance);
		cameraMatrix[11] = 1;
			
		cameraMatrix[12] = 0;
		cameraMatrix[13] = 0;
		cameraMatrix[14] = cameraParameters.nearestDistance*cameraParameters.farthestDistance;
		cameraMatrix[15] = 0;
		
		mat4.multiply(pMatrix, projectionMatrix, cameraMatrix);
		
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
		if(animationOnline == true)
		{
			animate();
		}
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
		if(wall.vertexPositionData[wall.constantIndex] <= 0)
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

	var init3DSceneBuffers = function(){
		initWallBuffers();
		initPointSpheresBuffers();
		if(animationOnline == true){
			prepareBuffers(sphere);
		}
		
	}
	
	var initPointSpheresBuffers = function(){
		for(var i = 0; i < pointSpheres.length; i++){
			prepareBuffers(pointSpheres[i]);
		}
	}
	
	
	
	var drawScene = function(){
		prepareScene();
		
		for(var i = 0; i < pointSpheres.length; i++){
			mat4.copy(mvMatrix, mvMatrixBase);
			drawSphere(pointSpheres[i]);	
		}
		
		if(animationOnline == true)
		{
			mat4.copy(mvMatrix, mvMatrixBase);
			drawSphere(sphere);
			
			mat4.copy(mvMatrix, mvMatrixBase);
			for(var i = 0; i < walls.length; i++){
				drawWall(walls[i]);
			}
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
	
	
	var drawSphere = function(sphere){
		var translation = vec3.create();
		
		mvMatrixPush();
		vec3.transformQuat(translation, [sphere.positionX, sphere.positionY, sphere.positionZ], rotationMatrix);
		mat4.translate(mvMatrix, mvMatrix, translation);
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sphere.vertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphere.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sphere.vertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, sphere.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.vertexIndexBuffer);

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
	
	var init3DScene = function(){
		initWalls();
		initPointSpheres();
		if(animationOnline == true)
		{
			initSphere();
		}
		
	}
	
	var initPointSpheres = function(){
		for(var i = 0; i < mainVertices.length; i++){
			pointSpheres[i] = new SphereObject(30, 30, pointSize, [mainVertices[i][0], mainVertices[i][1], mainVertices[i][2]], gl);
			pointSpheres[i].evaluateVertexBuffers();
		}
	}
	
	var initWalls = function(){
		
		walls[0] = new WallObject([mainVertices[4][0], mainVertices[4][1], mainVertices[4][2],
		                           mainVertices[0][0], mainVertices[0][1], mainVertices[0][2],
		                           mainVertices[3][0], mainVertices[3][1], mainVertices[3][2],
		                           mainVertices[7][0], mainVertices[7][1], mainVertices[7][2]], gl, 0);
		walls[1] = new WallObject([mainVertices[0][0], mainVertices[0][1], mainVertices[0][2],
		                           mainVertices[1][0], mainVertices[1][1], mainVertices[1][2],
		                           mainVertices[2][0], mainVertices[2][1], mainVertices[2][2],
		                           mainVertices[3][0], mainVertices[3][1], mainVertices[3][2]], gl, 2);
		walls[2] = new WallObject([mainVertices[1][0], mainVertices[1][1], mainVertices[1][2],
		                           mainVertices[5][0], mainVertices[5][1], mainVertices[5][2],
		                           mainVertices[6][0], mainVertices[6][1], mainVertices[6][2],
		                           mainVertices[2][0], mainVertices[2][1], mainVertices[2][2]], gl, 0);
		walls[3] = new WallObject([mainVertices[4][0], mainVertices[4][1], mainVertices[4][2],
		                           mainVertices[5][0], mainVertices[5][1], mainVertices[5][2],
		                           mainVertices[6][0], mainVertices[6][1], mainVertices[6][2],
		                           mainVertices[7][0], mainVertices[7][1], mainVertices[7][2]], gl, 2);
		walls[4] = new WallObject([mainVertices[7][0], mainVertices[7][1], mainVertices[7][2],
		                           mainVertices[3][0], mainVertices[3][1], mainVertices[3][2],
		                           mainVertices[2][0], mainVertices[2][1], mainVertices[2][2],
		                           mainVertices[6][0], mainVertices[6][1], mainVertices[6][2]], gl, 1);
		walls[5] = new WallObject([mainVertices[4][0], mainVertices[4][1], mainVertices[4][2],
		                           mainVertices[0][0], mainVertices[0][1], mainVertices[0][2],
		                           mainVertices[1][0], mainVertices[1][1], mainVertices[1][2],
		                           mainVertices[5][0], mainVertices[5][1], mainVertices[5][2]], gl, 1);		
	}
	
	
	var initSphere = function(){
		sphere = new SphereObject(30, 30, sphereParameters.radius, [sphereParameters.position[0], sphereParameters.position[1], sphereParameters.position[2]], gl);
		sphere.evaluateVertexBuffers();          
	}
	
	var initGL = function(canvas){
		try{
			gl = canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
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