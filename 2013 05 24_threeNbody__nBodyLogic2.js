var numBodies = 3;
var trailLength = 10;

function Body() {
	this.mass = 1.0;	
	this.pos = new THREE.Vector3(0,0,0);
	this.vel = new THREE.Vector3(0,0,0);	
	this.trail = new Queue();
}
Body.prototype.accel = function(body_array) { // return the accel vector on a body, produced by all other bodies.
	a = new THREE.Vector3(0,0,0);
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
Body.prototype.ekin = function() {
	return 0.5*this.mass*this.vel.dot(this.vel);
}
Body.prototype.epot = function(body_array){
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
Body.prototype.to_s = function() {
	console.log("Mass = ", this.mass);
	console.log("Pos = ", this.pos);
	console.log("Vel = ", this.vel);
}	
Body.prototype.updateTrail = function() {
	var tempPos = new THREE.Vector3();
	tempPos.copy(this.pos);
	if (this.trail.getLength() < trailLength) {		
		this.trail.enqueue(tempPos);
	} else {
		this.trail.dequeue();
		this.trail.enqueue(tempPos);
	}
}
/////////////////
function Nbody() {
	this.e0 = 0.0;
	this.dt = 0.005;
	this.dt_end = 10.0;
	this.nSteps = 0;
	this.bodies = new Array(numBodies);
	for (var i =0; i < numBodies; i++) {
		this.bodies[i] = new Body();					
	}				
	this.time = 0;				
	this.bodies[0].pos = new THREE.Vector3(1,0,0);
	this.bodies[1].pos = new THREE.Vector3(0,0,0);
	this.bodies[2].pos = new THREE.Vector3(0,0,0);
}
Nbody.prototype.nextStep = function(params) { //ToDo: have dt, dt_end, and integration method as params	
	this.dt = params.dt || this.dt;
	this.dt_end = params.dt_end || this.dt_end;				
	var t_end = this.dt_end - 0.5*this.dt;
	this.integrate();
	this.time += this.dt;
	this.nSteps++;				
}
Nbody.prototype.leapfrog = function() { ////////////////////////////////////LEAPFROG integrator
	var dt = this.dt;
	var bodyArr = this.bodies; //get all the bodies								
	this.bodies.forEach(function(body) {	
		var tempVel = new THREE.Vector3(0,0,0);
		body.vel.add(body.accel(bodyArr).multiplyScalar(0.5*dt));	
		tempVel.copy(body.vel);
		body.pos.add(tempVel.multiplyScalar(dt));
		body.vel.add(body.accel(bodyArr).multiplyScalar(0.5*dt));		
		body.updateTrail();		
	})
}
Nbody.prototype.integrate = function() {
	this.leapfrog();
}
Nbody.prototype.simple_print = function() {
	str = ["Total bodies: ", 2, "\n", 
			"dt: ", this.dt, "\n", 
			"at time: ", this.time, "after ", this.nSteps, "steps: \n"].join(" ");
	console.log(str);
	this.bodies.forEach(function(body) {
		body.to_s();
	})
	nrg = ["kin energy = ", this.ekin(), "\n",
			"pot energy = ", this.epot(), "\n",
			"total energy = ", this.e_tot(), "\n",
			"(e_init - e_fin)/e_init: ", (this.e0 - this.e_tot())/this.e0].join(" ");
	console.log(nrg);
}
Nbody.prototype.ekin = function() {
	ek = 0.0;
	this.bodies.forEach(function(body){
		ek += body.ekin();
	})
	return ek;
}			
Nbody.prototype.epot = function() {
	ep = 0.0;
	var bodyArr = this.bodies;
	this.bodies.forEach(function(body) {
		ep += body.epot(bodyArr);
	})
	return ep/2;
}
Nbody.prototype.e_init = function() {
	return this.e0 = this.ekin() + this.epot();
}
Nbody.prototype.e_tot = function() {
	return (this.ekin() + this.epot());
}
var initNbody = function(numBodies) {
	console.log("initializing with ", numBodies, " bodies.")
	var bodies = []
	var initNbody = {
		numBodies: numBodies,
		bodiesArray: bodies,
	}
	for (var i=0; i < numBodies; i++) {		
		bodies[i] = new Body();
		bodies[i].pos = new THREE.Vector3(3-Math.random()*5, 3-Math.random()*5, 3-Math.random()*5),
		bodies[i].vel = new THREE.Vector3(2.5-Math.random()*5, 2.5-Math.random()*5, 2.5-Math.random()*5),
		bodies[i].mass = 20.0;
		bodies[i].updateTrail();
	}
		console.log("Initalization done.");
		console.log("===================");
	return initNbody;
}

var nb = new Nbody();
nb.bodies = initNbody(numBodies).bodiesArray;
nb.e_init();