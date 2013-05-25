var container;
var camera, controls, scene, renderer;	
var starMeshes = [];

initCamScene();
initGeom();
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
	starGeom = new THREE.TetrahedronGeometry(0.2,0);			
	var starMaterial = new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:true});
	for (var i = 0; i < numBodies; i++) {
		starMeshes[i] = new THREE.Mesh(starGeom, starMaterial);
		scene.add(starMeshes[i]);
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
	try {
		nb.leapfrog();
		for (var i = 0; i < numBodies; i++) {
			starMeshes[i].position = nb.bodies[i].pos;			
		}
	}
	catch(e) {
	}
	renderer.render( scene, camera );
}
