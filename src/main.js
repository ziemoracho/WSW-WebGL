var mainScene;

function onButtonLinearStop(){
	mainScene.onButtonLinearStop();
}

function onButtonAngularStop(){
	mainScene.onButtonAngularStop();
}

function onButtonAngularHit(){
	var x = parseFloat(document.getElementById("angleX").value);
	var y = parseFloat(document.getElementById("angleY").value);
	var z = parseFloat(document.getElementById("angleZ").value);

	mainScene.onButtonAngularHit(x, y, z);
}

function onButtonLinearHit(){
	var x = parseFloat(document.getElementById("directionX").value);
	var y = parseFloat(document.getElementById("directionY").value);
	var z = parseFloat(document.getElementById("directionZ").value);

	mainScene.onButtonLinearHit(x, y, z);
}

function onFileLoad(){
	var file = document.getElementById("fileId").value.replace(/C:\\fakepath\\/i, '');
	var canvas = document.getElementById("canvasID");
	var width = parseInt(document.getElementById("imageWidth").value);
	var height = parseInt(document.getElementById("imageHeight").value);
	
	canvas.style.background ='url('+file+')';
	canvas.style.width = width;
	canvas.style.height = height;
}

function onReload3DStructureButton(sphereParameters){
	var cameraParameters = new Object();
	var mainVertices = [];
	var pointSize;
	
	cameraParameters.translation = vec3.create();
	cameraParameters.translation[0] = parseFloat(document.getElementById("translationX").value);
	cameraParameters.translation[1] = parseFloat(document.getElementById("translationY").value);
	cameraParameters.translation[2] = parseFloat(document.getElementById("translationZ").value);
	                               
	cameraParameters.rotation = mat4.create();
	                            
	cameraParameters.rotation[0] = parseFloat(document.getElementById("rotationXX").value);
	cameraParameters.rotation[1] = parseFloat(document.getElementById("rotationXY").value);
	cameraParameters.rotation[2] = parseFloat(document.getElementById("rotationXZ").value);
	cameraParameters.rotation[3] = parseFloat(document.getElementById("rotationYX").value);
	cameraParameters.rotation[4] = parseFloat(document.getElementById("rotationYY").value);
	cameraParameters.rotation[5] = parseFloat(document.getElementById("rotationYZ").value);
	cameraParameters.rotation[6] = parseFloat(document.getElementById("rotationZX").value);
	cameraParameters.rotation[7] = parseFloat(document.getElementById("rotationZY").value);
	cameraParameters.rotation[8] = parseFloat(document.getElementById("rotationZZ").value);
	
	cameraParameters.alpha = parseFloat(document.getElementById("cameraAlpha").value);
	cameraParameters.beta = parseFloat(document.getElementById("cameraBeta").value);
	
	cameraParameters.pixelX = parseFloat(document.getElementById("cameraPixelX").value);
	cameraParameters.pixelY = parseFloat(document.getElementById("cameraPixelY").value);
	
	cameraParameters.nearestDistance = parseFloat(document.getElementById("nearestDistance").value);
	cameraParameters.farthestDistance = parseFloat(document.getElementById("farthestDistance").value);

	mainVertices[0] = [];
	mainVertices[0][0] = parseFloat(document.getElementById("verticeFirstX").value);
	mainVertices[0][1] = parseFloat(document.getElementById("verticeFirstY").value);
	mainVertices[0][2] = parseFloat(document.getElementById("verticeFirstZ").value);
	
	mainVertices[1] = [];
	mainVertices[1][0] = parseFloat(document.getElementById("verticeSecondX").value);
	mainVertices[1][1] = parseFloat(document.getElementById("verticeSecondY").value);
	mainVertices[1][2] = parseFloat(document.getElementById("verticeSecondZ").value);
	
	mainVertices[2] = [];
	mainVertices[2][0] = parseFloat(document.getElementById("verticeThirdX").value);
	mainVertices[2][1] = parseFloat(document.getElementById("verticeThirdY").value);
	mainVertices[2][2] = parseFloat(document.getElementById("verticeThirdZ").value);
	
	mainVertices[3] = [];
	mainVertices[3][0] = parseFloat(document.getElementById("verticeFourthX").value);
	mainVertices[3][1] = parseFloat(document.getElementById("verticeFourthY").value);
	mainVertices[3][2] = parseFloat(document.getElementById("verticeFourthZ").value);
	
	mainVertices[4] = [];
	mainVertices[4][0] = parseFloat(document.getElementById("verticeFifthX").value);
	mainVertices[4][1] = parseFloat(document.getElementById("verticeFifthY").value);
	mainVertices[4][2] = parseFloat(document.getElementById("verticeFifthZ").value);
	
	mainVertices[5] = [];
	mainVertices[5][0] = parseFloat(document.getElementById("verticeSixthX").value);
	mainVertices[5][1] = parseFloat(document.getElementById("verticeSixthY").value);
	mainVertices[5][2] = parseFloat(document.getElementById("verticeSixthZ").value);
	
	mainVertices[6] = [];
	mainVertices[6][0] = parseFloat(document.getElementById("verticeSeventhX").value);
	mainVertices[6][1] = parseFloat(document.getElementById("verticeSeventhY").value);
	mainVertices[6][2] = parseFloat(document.getElementById("verticeSeventhZ").value);
	
	mainVertices[7] = [];
	mainVertices[7][0] = parseFloat(document.getElementById("verticeEighthX").value);
	mainVertices[7][1] = parseFloat(document.getElementById("verticeEighthY").value);
	mainVertices[7][2] = parseFloat(document.getElementById("verticeEighthZ").value);
	
	
	pointSize = parseFloat(document.getElementById("pointSize").value);
	
	mainScene = new MainScene(cameraParameters, mainVertices, pointSize, sphereParameters);
	mainScene.execute();
}

function onStartAnimationButton(){
	var sphereParameters = new Object();

	sphereParameters.position = [];
	sphereParameters.position[0] = parseFloat(document.getElementById("sphereX").value);
	sphereParameters.position[1] = parseFloat(document.getElementById("sphereY").value);
	sphereParameters.position[2] = parseFloat(document.getElementById("sphereZ").value);
	sphereParameters.radius = parseFloat(document.getElementById("sphereR").value);
	
	onReload3DStructureButton(sphereParameters);
}




