var nb = {};

nb.numBodies = 3;
nb.trailLength = 10;

nb.Body = function() {	
	this.mass = 20.0;
	this.vel = new THREE.Vector3(2.5-Math.random()*5, 2.5-Math.random()*5, 2.5-Math.random()*5);
	this.trail = new Queue(); 
	this.starMesh = new THREE.Mesh(this.starGeom, this.starMaterial);
	this.starMesh.position = new THREE.Vector3(3 - Math.random()*5, 3 - Math.random()*5, 3 - Math.random()*5);
	scene.add(starMesh);
}
nb.Body.prototype.starGeom = new THREE.TetrahedronGeometry(0.2,0);
nb.Body.prototype.starMaterial = new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:true});
nb.Body.prototype.starTrailGeom = new THREE.TetrahedronGeometry(0.05, 0);
nb.Body.prototype.starTrailMaterial = new THREE.MeshBasicMaterial({color:0xaaff33, wireframe:true});
nb.Body.prototype.setPos = function(v){
	if (v instanceof THREE.Vector3) {
		this.starMesh.position = v;
		return v
	} else {
		throw "Not a vector."
	}
}
nb.Body.prototype.pos = function() {
	return this.starMesh.position
}
// return the accel vector on a body, produced by all other bodies:
nb.Body.prototype.accel = function(body_array) { 
	var a = new THREE.Vector3(0,0,0);
	for (var i = 0; i < body_array.length; i++) {					
		if (!(body_array[i] === this)) { //refactor internal to something less ugly. PS -- I miss you "unless"! Love you!
			var r = new THREE.Vector3(0,0,0); 
			r.copy(body_array[i].pos);
			r.sub(this.pos); //get the distance between bodies.
			var r2 = r.dot(r);
			var r3 = r2*Math.sqrt(r2);						
			a.add(r.multiplyScalar(body_array[i].mass/r3)); //toDo: create copy method for body
		}
	}
	return a;
}
nb.Body.prototype.ekin = function() {
	return 0.5*this.mass*this.vel.dot(this.vel);
}
nb.Body.prototype.epot = function(body_array){
	ep = 0.0;
	for (var i = 0; i < body_array.length; i++) {					
		body = body_array[i]; 					
		if (!(body === this)) {
			var r = new THREE.Vector3(0,0,0); 
			r.copy(body.pos);
			r.sub(this.pos); //get the distance between bodies.
			ep += -1*body.mass*this.mass/Math.sqrt(r.dot(r));
		}
	}
	return ep;
}
nb.Body.prototype.updateTrail = function() {
	var tempPos = new THREE.Vector3();
	tempPos.copy(this.pos);
	if (this.trail.getLength() < trailLength) {		
		this.trail.enqueue(tempPos);
	} else {
		this.trail.dequeue();
		this.trail.enqueue(tempPos);
	}
}

/////////////////////

var container;
var camera, controls, scene, renderer;	
var starMeshes = [];
//var starTrailsArray = []; //master array that holds numBodies sub-arrays. 

initCamScene();
//initGeom();
initRenderer();
animate();
function initCamScene() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 20;
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	scene = new THREE.Scene();
}
function initGeom() {	
	var starGeom = new THREE.TetrahedronGeometry(0.2,0);			
	var starMaterial = new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:true});
	var starTrailGeom = new THREE.TetrahedronGeometry(0.05, 0);
	var starTrailMaterial = new THREE.MeshBasicMaterial({color:0xaaff33, wireframe:true});
	
	/**
	var starTrailMaterial = []
	starTrailMaterial[0] = new THREE.MeshBasicMaterial({color:0xff0000, wireframe:true});
	starTrailMaterial[1] = new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:true});
	starTrailMaterial[2] = new THREE.MeshBasicMaterial({color:0x0000ff, wireframe:true});
	**/
	for (var i = 0; i < numBodies; i++) {
		starMeshes[i] = new THREE.Mesh(starGeom, starMaterial);
		scene.add(starMeshes[i]);
		starTrailsArray[i] = new Array(trailLength);
		for (var j = 0; j < trailLength; j++) {
			starTrailsArray[i][j] = new THREE.Mesh(starTrailGeom, starTrailMaterial);
			scene.add(starTrailsArray[i][j]);
		}
	}
}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setSize( window.innerWidth, window.innerHeight );			
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	render();
}
function animate() {
	requestAnimationFrame( animate );
	controls.update();	
	render();
}		
				
function render() {		
/*
	try {
		nb.leapfrog();
		for (var i = 0; i < numBodies; i++) {
			starMeshes[i].position = nb.bodies[i].pos;		
			var trailLen = nb.bodies[i].trail.getLength();	
			if (trailLen < trailLength) {
				for (var k =0; k < trailLen; k++) {
					var tempPos = new THREE.Vector3();
					tempPos.copy(nb.bodies[i].trail.get(k));
					starTrailsArray[i][k].position = tempPos;						
				}
			console.log("body ", i, " trail array: ", nb.bodies[i].trail.getQueue());
			}//if trailLen <...
			else {
				starTrailsArray[i][9].copy
			}
		}	
	}
	catch(e) {
	}
	*/
	renderer.render(scene, camera);
}
