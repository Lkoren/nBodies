////Misc helper code

/*
public: 
priv: mouse vector -> projector.unproject( m, cam), intersects, var projector, raycaster, 
return intersects array.
*/
////Picking
document.addEventListener('mousedown', onDocMouseClick, false);
var projector = new THREE.Projector();	
function onDocMouseClick(event) {
	event.preventDefault();
	var mouse = new THREE.Vector3();
	mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight ) * 2 + 1;
	mouse.z = 0.5;
	var raycaster = projector.pickingRay(mouse.clone(), camera);
	intersects = [];	
	n.bodies.some(function(body) {
		raycaster.intersectObject(body.pick_box);
		intersect = raycaster.intersectObject(body.pick_box);	
		if (intersect[0]) {
			intersect[0].object.visible = !intersect[0].object.visible;		
			body.toggle_velocity();
		}
	});
}
////Gui
window.onload = function() {
	var gui = new dat.GUI();
	gui.add(n, "numBodies", 2, 100).min(0).step(1.0).listen().onChange(function(x) { n.change_num_stars(x)});
	//gui.add(n, "set_trailLength", 0, 5000).name("Trail length");
	gui.add(n, "stop_go").name("Play/Pause");
	gui.add(n, "reverse").onChange(function() {n.dt *= -1;}).name("Reverse time");
	gui.add(n, "addStar").name("Add another star");
	gui.add(n, "deleteStar").name("Remove a star");
}
////stats
var stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild( stats.domElement );

