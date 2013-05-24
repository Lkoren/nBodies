var container;
var camera, controls, scene, renderer;	
var starMesh, starMesh2, starMesh3;	

init();
animate();
function init() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 20;
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	scene = new THREE.Scene();
	starGeom = new THREE.TetrahedronGeometry(0.1,0);			
	var starMaterial = new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:true});
	starMesh = new THREE.Mesh(starGeom, starMaterial);
	starMesh2 = new THREE.Mesh(starGeom, starMaterial);
	starMesh3 = new THREE.Mesh(starGeom, starMaterial);
	scene.add(starMesh);				
	scene.add(starMesh2);
	scene.add(starMesh3);				
	// renderer
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
	starMesh.rotation.x += 0.01;
	starMesh.rotation.y += 0.005;
	starMesh2.rotation.z += 0.02;
	starMesh2.rotation.y += -0.005;

	try {
		nb.leapfrog();
		starMesh.position = nb.bodies[0].pos;
		starMesh2.position = nb.bodies[1].pos;
		starMesh3.position = nb.bodies[2].pos;
	}
	catch(e) {
		//console.log("uh oh!", e);
	}
	renderer.render( scene, camera );
}
				
