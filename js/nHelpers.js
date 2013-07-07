//Universal Attraction: web-based n-body simulator by Liav Koren is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//Based on a work at http://www.liavkoren.com/nBody_main.html.

////Misc helper code
////Picking
//document.addEventListener('mousedown', onDocMouseClick, false);
renderer.domElement.addEventListener( 'mousedown', onDocMouseClick, false );
var projector = new THREE.Projector();	
var gui = new dat.GUI();
function onDocMouseClick(event) {
	event.preventDefault();
	find_picked_bodies();
}
var body_gui, guiContainer;
function find_picked_bodies() { 	//standard raycasting picking code:
	var mouse = getMouseNDCoord();
	var raycaster = projector.pickingRay(mouse.clone(), camera);	
	intersects = [];		
	//check each body for picking, using the picking box as the test:
	n.bodies.some(function(body) {
		raycaster.intersectObject(body.pick_box);
		intersect = raycaster.intersectObject(body.pick_box);	
		if (intersect[0]) {
			intersect[0].object.visible = !intersect[0].object.visible;		//toggles visibility of the pickbox
			body.toggle_velocity();
			body_gui = new dat.GUI({autoPlace:false});
			if (intersect[0].object.visible) { //add the velocity gui elements.				
				body.pos_widget = w.make_widget(intersect[0].object.position, {height:0.5})		
				body.vel_widget = w.make_widget(body.vel_arrow.geometry.vertices[1], {height:0.15})	
				body.create_gui_div()
				guiContainer = document.getElementById('gui_' + body.id);				
				guiContainer.appendChild(body_gui.domElement);				
				body.update_gui_div_position(get_body_screen_coords(body.starMesh))	
				body_gui.addFolder('Body ' + body.id)
				body_gui.add(body, 'toggle_camera_lock').name("Toggle camera lock")			
				addFolder(body, 'Body ' + body.id);					
			} else {		
				guiContainer = document.getElementById('gui_' + body.id);
				$('#gui_' + body.id).remove()
				WIDGET_FACTORY.remove_widget(body.pos_widget)
				WIDGET_FACTORY.remove_widget(body.vel_widget)
				delete body.pos_widget			
				delete body.gui_div
				gui.removeFolder('Body ' + body.id)
			}
		}
	});
}
function remove_gui(gui, parent){
  	if(!parent) {
    	parent = DAT.GUI.autoPlaceContainer;
  	}
  	parent.removeChild(gui.domElement);
}
function get_body_screen_coords(mesh) {
	var halfWidth = window.innerWidth/2;
	var halfHeight = window.innerHeight/2;
	var vector = new projector.projectVector(new THREE.Vector3().getPositionFromMatrix(mesh.matrixWorld), camera);
	vector.x = (vector.x*halfWidth)+halfWidth
	vector.y = -1*(vector.y*halfHeight)+halfHeight
	return vector
}
////Gui
function getMouseNDCoord() {
 	var mouse = new THREE.Vector3();
	mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight ) * 2 + 1;
	mouse.z = 0.5;
	return mouse;
}
function addFolder(body, folderName) { //pass in the ref to the body that is being clicked, create a new folder for mod properties
	var starGui = gui.addFolder(folderName);
	starGui.add(body, "pos_x").listen().name("position x:")
	starGui.add(body, "pos_y").listen().name("position y:")
	starGui.add(body, "pos_z").listen().name("position z:")
	starGui.add(body, "vel_x",-5,5).step(0.1).listen().onChange(function(x) {body.set_vel(new THREE.Vector3(x,0,0))});
	starGui.add(body, "vel_y",-5,5).step(0.1).listen().onChange(function(y) {body.set_vel(new THREE.Vector3(0,y,0))});
	starGui.add(body, "vel_z",-5,5).step(0.1).listen().onChange(function(z) {body.set_vel(new THREE.Vector3(0,0,z))});			
}
function release_cam(){
	t = new THREE.Vector3().copy(controls.target);
	controls.target = t;
	controls.noPan = false;
}
window.onload = function() {
	gui.add(n, "numBodies", 2, 400).name("Number of bodies").min(0).step(1.0).listen().onChange(function(x) { n.change_num_stars(x)});
	gui.add(n, "stop_go").name("Play/Pause");
	gui.add(n, "reverse").onChange(function() {n.dt *= -1;}).name("Reverse time");
	gui.add(n, "addStar").name("Add another star");
	gui.add(n, "deleteStar").name("Remove a star");	
	gui.add(n, "eps", 0,10).step(0.1).name("Softening");
	gui.add(n, "simple_print").name("Save state");
	//gui.add(controls, "noPan").name("Release camera").listen().onChange(function() {cam_pan_toggle()});
	gui.add(controls, "noPan").name("Release camera").listen().onChange(function() {release_cam()});
}	
function widget_move(e) {
	n.bodies.forEach(function(body) {
		if (body.gui_div) {
			body.update_pos_vel()
	}
	})
}
////stats
var stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild( stats.domElement );

Array.prototype.last = function() {
	l = this.length;
	return this[l-1];
}

//http://stackoverflow.com/questions/14710559/dat-gui-how-hide-menu-from-code
dat.GUI.prototype.removeFolder = function(name) {
	var folder = this.__folders[name];
	if (!folder) {
	  return;
	}
	folder.close();
	this.__ul.removeChild(folder.domElement.parentNode);
	delete this.__folders[name];
this.onResize();
}

document.addEventListener('widget_move', widget_move, false)
