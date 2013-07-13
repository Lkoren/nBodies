//Universal Attraction: web-based n-body simulator by Liav Koren is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//Based on a work at http://www.liavkoren.com/nBody_main.html.

////Misc helper code
////Picking
//document.addEventListener('mousedown', onDocMouseClick, false);

info = function() {	
}
info.toggle_info = function() {
	if ($('#info-container').length == 0) {
		$('body').append('<div id="info-container"></div>');		
		$('#info-container').append('<div id="floating-info"></div>');		
		$('#info-container').css({"position":"absolute", "left":"50%", "z-index": "100", "top":"20px", "width":"70%", "display":"none"})
		$('#floating-info').css({"position":"relative", "left": "-50%", "background":"#dddddd", "opacity":"0.8", "top": "20px", "padding-left": "2em",
								"padding-right": "2em", "padding-top": "0.5em","padding-bottom": "0.5em", "display":"none"})
	}
	$('#floating-info').html(" <p>This is an experimental, n-body simulator, running in WebGL. This would not have been possible\
		without the excellent <a href = 'http://threejs.org/' target='_blank'>three.js</a> framework, as well as the \
		excellent <a href= 'http://www.artcompsci.org/' target='_blank'>Art of Computational Science/Maya Open Lab</a> \
		resource by Piet Hut and Jun Makino. While incomplete and, apparently inactive, the Maya Open Lab is an great \
		introduction to Ruby, astronomical simulation and the nuances of numerical simulation. </p> \
\
		<p> The <a href='http://en.wikipedia.org/wiki/N-body_problem' target='_blank'>n-body problem</a> dates to the first work on gravity done by Newton. \
		Two bodies moving under the influence of gravity have a small and well-understood set of behaviors. For three bodies, \
		analytic solutions exist for special cases only. A general analytic solution cannot be found for three or more bodies. \
		Special case analytic solutions to the three body problem have been discovered over the decades \
		(several of them by major figures of 18/19th century math), as well as most recently by \
		<a href= 'http://suki.ipb.ac.rs/3body/' target='_blank'> Milovan Šuvakov and Veljko Dmitrašinović</a>.\
\
		<p> Currently this simulation models bodies as point masses, and uses a leap-frog integration method to calculate motion. \
		Leap-frog is time-reversible, but only second-order accurate. Numerical softening has recently been implimented. Implimenting \
		a runga-kutta fourth-order integrator is also part of the dev-path, however currently I am still focused on developing several core \
		interface features. </p>\
\
		<p>This project is under very active development, as of the July 2013. It has been tested to work in Chrome and Firefox under \
		 Win 7. Chrome current provides the best performance. Some features do not work in all versions of Firefox, and some features are \
		 still being debugged. WebGL is currently not supported by IE, although it is expected in IE11. \
\
		<p>This is a personal project by <a href='http://www.liavkoren.org' target='_blank'>Liav Koren</a>. I am a Toronto based designer, technologist and researcher.\
		I have been passionate about space, physics, generative geometry and computational design for a long time. All code by me is licensed \
		Creative Commons, Share Alike, non-Commercial. The full code base will be pushed to Git Hub in the near future. \
		")
	$('#info-container').toggle()
	$('#floating-info').toggle()
	$('#floating-info').click(function() { $(this).css({'display':'none'}); $(this).parent().css({'display':'none'}) })
}

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
				body.pos_widget = WIDGET_FACTORY.make_widget(intersect[0].object.position, {height:0.5, type: "position"})		
				body.vel_widget = WIDGET_FACTORY.make_widget(body.vel_arrow.geometry.vertices[1], {height:0.15, type: "velocity"})	

				body.create_gui_div()				
				guiContainer = document.getElementById('gui_' + body.id);				
				guiContainer.appendChild(body_gui.domElement);				
				body.update_gui_div_position(get_body_screen_coords(body.starMesh))	
				body_gui.addFolder('Body ' + body.id)
				body_gui.add(body, 'toggle_camera_lock').name("Toggle camera lock")			
				addFolder(body, 'Body ' + body.id);	
				//reset_gui_css("#gui_" + body.id)													
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
reset_gui_css = function(name) {
	$(name).find(".dg").css({"width":"120px"}) //futz with gui.dat's defaults	
/*	console.log($(name).children())
	console.log($(name).find(".close-button"))
	$(name).children().css({"width":"120px !important"}) //futz with gui.dat's defaults	
	var t = name + " .dg.main"
	$(t).css({"width":"120px !important"})
	$(name).find(".close-button").css({"width":"120px !important"}) //futz with gui.dat's defaults	
	console.log($(name).children())
	console.log($(name).find(".close-button"))	 */
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

function addFolder(body, folderName) { //pass in the ref to the body that is being clicked, create a new folder for mod properties
	var starGui = gui.addFolder(folderName);
	starGui.add(body, "pos_x").step(0.1).listen().name("position x:").onChange(function(x) {update_body_position(new THREE.Vector3(x,0,0), body)})
	starGui.add(body, "pos_y").step(0.1).listen().name("position y:").onChange(function(y) {update_body_position(new THREE.Vector3(0,y,0), body)})
	starGui.add(body, "pos_z").step(0.1).listen().name("position z:").onChange(function(z) {update_body_position(new THREE.Vector3(0,0,z), body)})	
	starGui.add(body, "vel_x",-5,5).step(0.1).listen().onChange(function(x) {body.set_vel(new THREE.Vector3(x,0,0), body.vel_widget)});
	starGui.add(body, "vel_y",-5,5).step(0.1).listen().onChange(function(y) {body.set_vel(new THREE.Vector3(0,y,0), body.vel_widget)});
	starGui.add(body, "vel_z",-5,5).step(0.1).listen().onChange(function(z) {body.set_vel(new THREE.Vector3(0,0,z), body.vel_widget)});			
}
update_body_position = function(v, body) {
	if (v.x) {
		body.starMesh.position.x = v.x	
	} else if (v.y) {
		body.starMesh.position.y = v.y	
	} else if (v.z) {
		body.starMesh.position.z = v.z
	}
	body.update_velocity_arrow_geometry()
	update_vel_widget_position(body)
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
	gui.add(info, "toggle_info").name("  -- ABOUT --")
	gui.add(n, "options");
}	
function widget_move(e) {
	n.bodies.forEach(function(body) {
		if (body.gui_div) {
			body.update_pos_vel()
			if (e.detail.params.type == "velocity" && e.detail == body.vel_widget  ) {
				if (e.detail.intersected_mesh.axis == "x pick box") {
					body.vel.x = e.detail.origin.x - body.pos().x
				} else if (e.detail.intersected_mesh.axis == "y pick box") {
					body.vel.y = e.detail.origin.y - body.pos().y
				} else if (e.detail.intersected_mesh.axis == "z pick box") {
					body.vel.z = e.detail.origin.z - body.pos().z
				}
			} else if (e.detail.params.type == "position") {
				update_vel_widget_position(body)
			}
			body.update_velocity_arrow_geometry()
		}
	})
}
update_vel_widget_position = function(body) {
	var temp = new THREE.Vector3().copy(body.pos()).add(body.vel)
	body.vel_widget.update_position(temp)
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
////

toggle_info_div = function() {
	console.log("toggle")
}
document.addEventListener('widget_move', widget_move, false)
