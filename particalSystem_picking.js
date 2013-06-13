var camera, controls, scene, renderer, mesh;	
initCamScene();
initRenderer();
initGeom();
animate();







function initCamScene() {
	camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, .001, 25000 );
	camera.position.z = 1500;
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	scene = new THREE.Scene();
	scene.add( new THREE.AmbientLight( 0xeef0ff ) );
	var light1 = new THREE.DirectionalLight( 0xffffff, 2 );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );
	scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );

}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );			
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}
function initGeom() {
	var tex = THREE.ImageUtils.loadTexture("assets/star.jpg");	
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set(1,1);
	var particle_material = new THREE.ParticleBasicMaterial({color: 0x000000, size: 10, sizeAttenuation: true});
	//var geom = new THREE.PlaneGeometry(100,100);
	var geom = new THREE.CubeGeometry(100,100,100);
	//var mesh = new THREE.Mesh(geom, mat);
	mesh = new THREE.ParticleSystem(geom, particle_material);
	/*
	mesh.material.side = THREE.DoubleSide;
	mesh.rotation.x = -Math.PI/2;
	mesh.scale.set(1,1,1);
	*/
	scene.add(mesh);
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
	renderer.render(scene, camera);
}

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
	var intersects = [];
	intersects = raycaster.intersectObject(mesh);

	console.log(intersects);


}


