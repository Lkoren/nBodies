var container;
var camera, controls, scene, renderer;	
var starMeshes = [];
var starTrailsArray = []; //master array that holds numBodies sub-arrays. 

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
	var starGeom = new THREE.TetrahedronGeometry(0.2,0);			
	var starMaterial = new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:true});
	var starTrailGeom = new THREE.TetrahedronGeometry(0.05, 0);
	var starTrailMaterial = new THREE.MeshBasicMaterial({color:0xaaff33, wireframe:true});
	for (var i = 0; i < numBodies; i++) {
		starMeshes[i] = new THREE.Mesh(starGeom, starMaterial);
		scene.add(starMeshes[i]);
		starTrailsArray[i] = new Array(trailLength);
		for (var j = 0; j < trailLength; j++) {
			starTrailsArray[i][j] = new THREE.Mesh(starTrailGeom, starTrailMaterial);
			scene.add(starTrailsArray[i][j]);
		}
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
		for (var j = 0; j < starTrailsArray.length; j++){
			for (var k = 0; k < trailLength; k++) {	
				var tempPos = new THREE.Vector3();
				tempPos.copy(nb.bodies[j].trail.get(k));
				starTrailsArray[j][k].position = tempPos;								
			}
		}
	}
	catch(e) {
	}
	renderer.render(scene, camera);
}

