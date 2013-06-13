var camera, controls, scene, renderer, geom, line, counter;	
counter = 0;
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
	var mat = new THREE.LineBasicMaterial({color: 0x000000, linewidth:30});
	geom = new THREE.Geometry();

	line = new THREE.Line(geom, mat);
	dynaLine();
	scene.add(line);
}

function dynaLine() {
	limit = 15;
	//use Array.shift and Array.push to remove and add elements to an array in a Queue-like fashion.
	if (geom.vertices.length < limit) {
		for (var i = 0; i < limit; i++) {
			geom.vertices[i] = new THREE.Vector3(Math.random()*500, Math.random()*500, Math.random()*500);
		}
	} else {
		geom.vertices.shift();
		geom.vertices[geom.vertices.length] = new THREE.Vector3(Math.random()*500, Math.random()*500, Math.random()*500);
	}
	line.geometry.verticesNeedUpdate = true;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	//render();
}
function animate() {
	requestAnimationFrame( animate );
	controls.update();	
	render();
}					
function render() {		
	counter++;
	if (counter%20 == 0) {
		dynaLine();
	}
	renderer.render(scene, camera);
}

//window.setInterval(function(){dynaLine()}, 200);
//window.setInterval(function(){console.log("hi!")}, 200);