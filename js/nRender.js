var container;
var camera, controls, scene, renderer;	
initCamScene();
initRenderer();
animate();
function initCamScene() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 20;
	//controls = new THREE.OrbitControls( camera );
	controls = new THREE.TrackballControls( camera );
	controls.addEventListener( 'change', render );
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x202020, 50 );

}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: true } );
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
	stats.update();
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

