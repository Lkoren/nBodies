var nb = {
	numBodies: 3,
	trailLength: 1500,
};

nb.Body = function() {	
	this.mass = 20.0;
	this.vel = new THREE.Vector3(2.5-Math.random()*5, 2.5-Math.random()*5, 2.5-Math.random()*5);
	this.trail = new Queue(); 
	this.starMesh = new THREE.Mesh(this.starGeom, this.starMaterial);
	this.starMesh.position = new THREE.Vector3(3 - Math.random()*5, 3 - Math.random()*5, 3 - Math.random()*5);
	scene.add(this.starMesh);
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
			r.copy(body_array[i].pos());
			r.sub(this.pos()); //get the distance between bodies.
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
			r.copy(body.pos());
			r.sub(this.pos()); //get the distance between bodies.
			ep += -1*body.mass*this.mass/Math.sqrt(r.dot(r));
		}
	}
	return ep;
}
nb.Body.prototype.updateTrail = function() {
	var tempPos = new THREE.Vector3();
	tempPos.copy(this.pos());
	if (this.trail.getLength() < nb.trailLength) {
		t = new THREE.Mesh(this.starTrailGeom, this.starTrailMaterial);		
		scene.add(t);
		t.position.copy(this.pos());
		this.trail.enqueue(t);
	} 
	else {		
		t = this.trail.dequeue();
		t.position.copy(this.pos());
		this.trail.enqueue(t);
	}
}
nb.Body.prototype.getTrail = function(){
	return this.trail.getQueue()
}
nb.Body.prototype.to_s = function() {
	console.log("Mass = ", this.mass);
	console.log("Pos = ", this.pos());
	console.log("Vel = ", this.vel);
	console.log("ekin = ", this.ekin());
	console.log("epot = ", this.epot(n.bodies));  //is there a more general way to get this reference?
	console.log("eTot = ", this.ekin() + this.epot(n.bodies));
	console.log("=======") 
}	
/////////////////////////
nb.nBodies = function() {
	this.e0;
	this.dt = 0.005;
	this.nSteps = 0;
	this.bodies = new Array(nb.numBodies);
	for (var i = 0; i < nb.numBodies; i++) {
		this.bodies[i] = new nb.Body();
	}
	this.time = 0;
}
//LEAPFROG integrator///////////////////////
nb.nBodies.prototype.leapfrog = function() { 
	var dt = this.dt;
	var bodyArr = this.bodies; //get all the bodies								
	this.bodies.forEach(function(body) {	
	//for (var i = 0; i < nb.numBodies; i++) {
		var tempVel = new THREE.Vector3(0,0,0);
	//	body = this.bodies[i];
		body.vel.add(body.accel(bodyArr).multiplyScalar(0.5*dt));	
		tempVel.copy(body.vel);
		body.pos().add(tempVel.multiplyScalar(dt));
		body.vel.add(body.accel(bodyArr).multiplyScalar(0.5*dt));		
		body.updateTrail();		
	})
	//}
} 
nb.nBodies.prototype.integrate = function(){
	this.leapfrog();
}
nb.nBodies.prototype.simple_print = function() {
	str = ["Total bodies: ", nb.numBodies, "\n", 
			"dt: ", this.dt, "\n", 
			"at time: ", this.time, "after ", this.nSteps, "steps: \n"].join(" ");
	console.log(str);
	this.bodies.forEach(function(body) {
		body.to_s();
	})
	nrg = ["Total energy stats:", "\n",
			"kin energy = ", this.ekin(), "\n",
			"pot energy = ", this.epot(), "\n",
			"total energy = ", this.e_tot(), "\n",
			"(e_init - e_fin)/e_init: ", (this.e0 - this.e_tot())/this.e0].join(" ");
	console.log(nrg);
}
nb.nBodies.prototype.ekin = function() {
	ek = 0.0;
	this.bodies.forEach(function(body){
		ek += body.ekin();
	})
	return ek;
}	
nb.nBodies.prototype.epot = function() {
	ep = 0.0;
	var bodyArr = this.bodies;
	this.bodies.forEach(function(body) {
		ep += body.epot(bodyArr);
	})
	return ep/2;
}
nb.nBodies.prototype.e_init = function() {
	return this.e0 = this.ekin() + this.epot();
}
nb.nBodies.prototype.e_tot = function() {
	return (this.ekin() + this.epot());
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
	try {
		n.integrate();			
	}
	catch(e) {
	}	
	renderer.render(scene, camera);
}

var n = new nb.nBodies;