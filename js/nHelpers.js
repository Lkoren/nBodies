//Universal Attraction: web-based n-body simulator by Liav Koren is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//Based on a work at http://www.liavkoren.com/nBody_main.html.

////Misc helper code
////Picking
//document.addEventListener('mousedown', onDocMouseClick, false);
renderer.domElement.addEventListener( 'mousedown', onDocMouseClick, false );
var projector = new THREE.Projector();	
var gui = new dat.GUI();
function onDocMouseClick(event) {
	//standard raycasting picking code:
	event.preventDefault();
	var mouse = getMouseCoord();
	var raycaster = projector.pickingRay(mouse.clone(), camera);
	intersects = [];		
	//check each body for picking, using the picking box as the test:
	n.bodies.some(function(body) {
		raycaster.intersectObject(body.pick_box);
		intersect = raycaster.intersectObject(body.pick_box);	
		if (intersect[0]) {
			intersect[0].object.visible = !intersect[0].object.visible;		//toggles visibility of the pickbox
			body.toggle_velocity();
			body.toggle_axis();				
			if (intersect[0].object.visible) { //add the velocity gui elements.
				addFolder(body);
				controls.target = body.pos(); //set camera
				controls.noPan = true;
			} else {			
				gui.removeFolder('Body ' + (n.bodies.indexOf(body) + 1));
			}
		}
	});
}
////Gui
function getMouseCoord() {
 	var mouse = new THREE.Vector3();
	mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight ) * 2 + 1;
	mouse.z = 0.5;
	return mouse;
}
function addFolder(body) { //pass in the ref to the body that is being clicked, create a new folder for mod properties
	var starGui = gui.addFolder('Body ' + (n.bodies.indexOf(body) + 1));
	starGui.add(body, "vel_x",-5,5).step(0.1).onChange(function(x) {body.set_vel_x(x)});
	starGui.add(body, "vel_y",-5,5).step(0.1).onChange(function(y) {body.set_vel_y(y)});
	starGui.add(body, "vel_z",-5,5).step(0.1).onChange(function(z) {body.set_vel_z(z)});	
}
window.onload = function() {
	//var gui = new dat.GUI();
	gui.add(n, "numBodies", 2, 400).name("Number of bodies").min(0).step(1.0).listen().onChange(function(x) { n.change_num_stars(x)});
	//gui.add(n, "set_trailLength", 0, 5000).name("Trail length");
	gui.add(n, "stop_go").name("Play/Pause");
	gui.add(n, "reverse").onChange(function() {n.dt *= -1;}).name("Reverse time");
	gui.add(n, "addStar").name("Add another star");
	gui.add(n, "deleteStar").name("Remove a star");	
	gui.add(n, "eps", 0,10).step(0.1).name("Softening");
	gui.add(n, "simple_print").name("Save state");
	gui.add(controls, "noPan").name("Lock cam on target").listen().onChange(function(noPan) {if(noPan) {
																							t = new THREE.Vector3().clone(controls.target);
																							controls.target = t;
																							controls.noPan = false;}});}	

dat.GUI.prototype.removeFolder = function(name) { ////http://stackoverflow.com/questions/14710559/dat-gui-how-hide-menu-from-code 
    var folder = this.__folders[name];
    if (!folder) {
      return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
  }

////stats
var stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild( stats.domElement );

