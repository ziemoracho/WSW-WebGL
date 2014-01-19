var mainScene;

function onLoad(){
	mainScene = new MainScene();
	mainScene.execute();
}

function onButtonLinearStop(){
	mainScene.onButtonLinearStop();
}

function onButtonAngularStop(){
	mainScene.onButtonAngularStop();
}

function onButtonAngularHit(){
	var x = parseInt(document.getElementById("angleX").value);
	var y = parseInt(document.getElementById("angleY").value);
	var z = parseInt(document.getElementById("angleZ").value);

	mainScene.onButtonAngularHit(x, y, z);
}

function onButtonLinearHit(){
	var x = parseInt(document.getElementById("directionX").value);
	var y = parseInt(document.getElementById("directionY").value);
	var z = parseInt(document.getElementById("directionZ").value);

	mainScene.onButtonLinearHit(x, y, z);
}


