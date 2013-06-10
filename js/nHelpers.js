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
	n.bodies.forEach(function(body) { 

		intersects.push(raycaster.intersectObject(body.starMesh));
	});



	console.log(intersects);
/*
	projector.unprojectVector( vector, camera );
	intersects = [];
	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
	n.bodies.forEach(function(body) { 
		console.log(raycaster.intersectObjects(body.starMesh));	
		intersects.push(raycaster.intersectObjects(body.starMesh));
	});	
	console.log(intersects);
*/
/*
	e.preventDefault();
		var m_vec = new THREE.Vector3(
					 2*(e.clientX / window.innerWidth ) - 1, 
					-2*(e.clientY / window.innerHeight ) + 1, 0.5 );
		projector.unprojectVector( m_vec, camera );
		var raycaster = new THREE.Raycaster(camera.position, 
						m_vec.sub(camera.position).normalize());
		console.log(raycaster.intersectObjects(n.bodies));
		return raycaster.intersectObjects(n.bodies);
*/
	/*
	var picking = (function(e) {
		var m_vec = new THREE.Vector3(
					 2*(e.clientX / window.innerWidth ) - 1, 
					-2*(e.clientY / window.innerHeight ) + 1, 0.5 );
		projector.unprojectVector( m_vec, camera );
		var raycaster = new THREE.Raycaster(camera.position, 
						m_vec.sub(camera.position).normalize());
		alert(raycaster.intersectObjects(n.bodies));
		return raycaster.intersectObjects(n.bodies);


	}());
*/
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