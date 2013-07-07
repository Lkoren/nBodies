//Universal Attraction: web-based n-body simulator by Liav Koren is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//Based on a work at http://www.liavkoren.com/nBody_main.html.

var nb = {
	numBodies: 3,
	trailLength: 5000,
	bodyID_Counter: 0
};

nb.Body = function(i) {	
	this.mass = 20.0;
	this.vel = new THREE.Vector3(2.5-Math.random()*5, 2.5-Math.random()*5, 2.5-Math.random()*5);
	this.starMesh = new THREE.Mesh(this.starGeom, this.starMaterial);
	this.starMesh.position = new THREE.Vector3(3 - Math.random()*5, 3 - Math.random()*5, 3 - Math.random()*5);		
	var trail_geom = new THREE.Geometry();	
	this.trail = new THREE.ParticleSystem(trail_geom, this.trail_material); 
	this.initTrail();
	this.init_vel_arrow();
	this.pick_box = new THREE.Mesh(this.pick_box_geom, this.pick_box_mat);	
	this.pick_box.position = this.pos();
	this.axis = new THREE.AxisHelper(1);
	this.axis.postition = new THREE.Vector3().copy(this.pos());
	scene.add(this.starMesh);
	scene.add(this.trail);
	scene.add(this.pick_box);	
	scene.add(this.axis);
	this.pick_box.visible = false;
	this.axis.visible = false;
	this.vel_x = this.vel.x;	//this is really clunky, used for adjusting position/velocity via gui, refactor this.	
	this.vel_y = this.vel.y;	
	this.vel_z = this.vel.z;	
	this.pos_x = this.pos().x
	this.pos_y = this.pos().y
	this.pos_z = this.pos().z	
	//this.camera_target = false;
	this.id = i;	
}
nb.Body.prototype.starGeom = new THREE.SphereGeometry(0.15, 32, 24);
nb.Body.prototype.toggle_camera_lock = function() {
	console.log("toggle cam lock");
	if (nb.nBodies.camera_target != this.pos()) {
		controls.target = this.pos();
		nb.nBodies.camera_target = this.pos();
		controls.noPan = true;
	} else {
		controls.target = new THREE.Vector3().copy(this.pos())
		controls.noPan = false;
		nb.nBodies.camera_target = null;
	}
}
nb.Body.prototype.starMaterial = new THREE.MeshBasicMaterial({color:0x101010});
nb.Body.prototype.trail_material = new THREE.ParticleBasicMaterial({size:0.1, color: 0x303030});
nb.Body.prototype.pick_box_geom = new THREE.CubeGeometry(0.4, 0.4, 0.4);
nb.Body.prototype.pick_box_mat = new THREE.MeshBasicMaterial({color:0x801010, wireframe:true});
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
nb.Body.prototype.accel = function(body_array, eps) { 
	var a = new THREE.Vector3(0,0,0);
	for (var i = 0; i < body_array.length; i++) {					
		if (!(body_array[i] === this)) { //refactor internal to something less ugly. PS -- I miss you "unless"! Love you!
			var r = new THREE.Vector3(0,0,0); 
			r.copy(body_array[i].pos());
			r.sub(this.pos()); //get the distance between bodies.
			var r2 = r.dot(r) + eps*eps;
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
			r.sub(this.pos() + n.eps*n.eps); //get the distance between bodies.
			ep += -1*body.mass*this.mass/Math.sqrt(r.dot(r));
		}
	}
	return ep;
}
nb.Body.prototype.updateTrail = function() {
	var t = this.trail;
	if (t.geometry.vertices.length > nb.trailLength) {
		t.geometry.vertices.shift();
	}
	t.geometry.vertices[t.geometry.vertices.length] = new THREE.Vector3().copy(this.pos());
	t.geometry.verticesNeedUpdate = true;
}
nb.Body.prototype.initTrail = function() {
	var t = this.trail.geometry.vertices;
	for (var i = 0; i < nb.trailLength; i++) {
		t.push(new THREE.Vector3(1000,1000,1000)); //better fix for this? 
	}
}
nb.Body.prototype.vel_arrow_mat = new THREE.LineBasicMaterial({color:0x301010});
nb.Body.prototype.init_vel_arrow = function(){
	this.vel_arrow_geom = new THREE.Geometry();
	this.vel_arrow = new THREE.Line(this.vel_arrow_geom, this.vel_arrow_mat);
	this.vel_arrow.geometry.vertices[0] = new THREE.Vector3().copy(this.pos());
	this.vel_arrow.geometry.vertices[1] = new THREE.Vector3().copy(this.pos()).add(this.vel);
	scene.add(this.vel_arrow);
	this.vel_arrow.visible = false;
};
nb.Body.prototype.toggle_velocity = function() {
	this.update_velocity();
	this.vel_arrow.visible = !this.vel_arrow.visible;
	this.vel_arrow.geometry.verticesNeedUpdate = true;
	return this;
};
nb.Body.prototype.update_velocity = function() {
	this.vel_arrow.geometry.vertices[0] = new THREE.Vector3().copy(this.pos());
	this.vel_arrow.geometry.vertices[1] = new THREE.Vector3().copy(this.pos()).add(this.vel);	
	this.vel_arrow.geometry.verticesNeedUpdate = true;
	return this;	
}

nb.Body.prototype.toggle_axis = function(){
	this.axis.position = new THREE.Vector3().copy(this.pos());
	this.axis.visible = !this.axis.visible;
	return this;
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
//refactor this logic:
nb.Body.prototype.set_vel_x = function(x){
	this.vel.x = x;
	this.update_velocity();
	return this;
}
nb.Body.prototype.set_vel_y = function(y){
	this.vel.y = y;
	this.update_velocity();
	return this;
}
nb.Body.prototype.set_vel_z = function(z){
	this.vel.z = z;
	this.update_velocity();
	return this;
}
nb.Body.prototype.create_gui_div = function(){
	var div = document.createElement("div")	
	div.style.visibility = "hidden"
	div.style.opacity = "0.5"
	div.style.width = "250px"
	div.style.height = "25px"
	div.style.position = "absolute"
	div.style["background-color"] = "#1050ff"
	div.style["z-index"] = "50"
	div.id = "gui_" + this.id;		
	this.gui_div = div;
	document.body.appendChild(this.gui_div);
}
nb.Body.prototype.update_gui_div_position = function(pos) {
	pos = pos || get_body_screen_coords(this.starMesh)
	this.gui_div.style.left = pos.x + 20 + "px"
	this.gui_div.style.top = pos.y + 20 + "px"
	this.gui_div.style.visibility = "visible"
}
nb.Body.prototype.remove_div = function() {
	this.gui_div.parentNode.removeChild(this.gui_div);
}

/////////////////////////
nb.nBodies = function() {
	this.e0;
	this.dt = 0.005;
	this.nSteps = 0;
	this.bodies = new Array(nb.numBodies);
	this.numBodies = nb.numBodies;
	this.reverse = false;
	for (var i = 0; i < nb.numBodies; i++) {		
		this.bodies[i] = new nb.Body(nb.bodyID_Counter);
		nb.bodyID_Counter = ++nb.bodyID_Counter;
	}
	this.time = 0;
	this.go = false;	
	this.eps = 0.01;
	this.camera_target = null;
}

//numerical softening parameter. See ArtCompSci, vol 4, pp 100...
nb.nBodies.prototype.set_eps = function(e) { 
	this.eps = e;
	return this;
}
//LEAPFROG integrator///////////////////////
nb.nBodies.prototype.leapfrog = function() { 
	var dt = this.dt;
	var bodyArr = this.bodies; //get all the bodies								
	this.bodies.forEach(function(body) {	
		var tempVel = new THREE.Vector3(0,0,0);
		body.vel.add(body.accel(bodyArr, n.eps).multiplyScalar(0.5*dt));	
		tempVel.copy(body.vel);
		body.pos().add(tempVel.multiplyScalar(dt));
		body.vel.add(body.accel(bodyArr, n.eps).multiplyScalar(0.5*dt));		
		body.updateTrail();		
	})
} 
nb.nBodies.prototype.integrate = function(){
	if (this.go){
		this.leapfrog();
		this.update_gui();
	}
	return this
}
nb.nBodies.prototype.stop_go = function(){
	this.go = !this.go;
	return this
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
nb.nBodies.prototype.set_trailLength = function(x) {
	nb.trailLength = x;
	return this
}
nb.nBodies.prototype.change_num_stars = function(x) {	//kind of ugly, refactor
	if (x >= 0) {
		if (x > this.bodies.length) {
			for (var i = 0; i < (x - this.bodies.length); i++) {
				this.addStar();
			}
			return this
		} else if ( this.bodies.length > x) {
			var i;
			for (i = 0; i < (this.bodies.length - x); i++) {
				this.deleteStar();
			}
			return this
		}
	}
}
nb.nBodies.prototype.addStar = function() {	
	this.bodies[this.bodies.length] = new nb.Body(nb.bodyID_Counter);	
	nb.bodyID_Counter = ++nb.bodyID_Counter;
	this.numBodies++;
	return this 
}
nb.nBodies.prototype.deleteStar = function(star) {	//todo: refactor this to use obj.traverse
	var index = this.bodies.length-1;
	var i;
	if (this.bodies.length > 0) {
		scene.remove(this.bodies[index].starMesh);
		scene.remove(this.bodies[index].trail);
		scene.remove(this.bodies[index].pick_box);
		scene.remove(this.bodies[index].vel_arrow);
		/*
		if (i =  selected_bodies.indexOf(this) > -1) {
			console.log(i);
			deleteGui_elements(this);
		}
		*/
		this.bodies.pop();
		this.numBodies--;
	};
	return this;
};
var n = new nb.nBodies;
nb.nBodies.prototype.update_gui= function() {
	this.bodies.forEach(function(body) {
		if(body.gui_div) { 
			body.update_gui_div_position(get_body_screen_coords(body.starMesh)) 
			body.widget.update_position(body.pos())
		}
	})
}

