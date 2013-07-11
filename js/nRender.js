//Universal Attraction: web-based n-body simulator by Liav Koren is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//Based on a work at http://www.liavkoren.com/nBody_main.html.
var container;
var camera, controls, renderer;	
var composer;
initCamScene();
initRenderer();
animate();
function initCamScene() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 20;
	scene.fog = new THREE.FogExp2( 0x202020, 0.2 );
}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );			
	controls = new THREE.TrackballControls(camera, renderer.domElement);
	controls.addEventListener( 'change', render );	
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', mousemove, false );
    document.addEventListener('mousedown', mousedown, false);
    document.addEventListener('mouseup', mouseup, false);    
    window.addEventListener( 'resize', onWindowResize, false );
    scene.add(new THREE.AmbientLight(0x555555));
	var directionalLight = new THREE.DirectionalLight(0xffddcc);
	directionalLight.position.x = Math.random() - 0.5;
	directionalLight.position.y = Math.random() - 0.5;
	directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.normalize();
	scene.add( directionalLight );	
////
	//renderer.autoClear = false;
	//renderer.sortObjects = false;
	var renderModel = new THREE.RenderPass( scene, camera );
	var effectBloom = new THREE.BloomPass( 20 );
	var effectFilm = new THREE.FilmPass( 1, .1, 5000, false );
	effectFocus = new THREE.ShaderPass( THREE.FocusShader );
	effectFocus.uniforms[ "screenWidth" ].value = window.innerWidth;
	effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight;
	effectFocus.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );
	composer.addPass( renderModel );
	composer.addPass( effectBloom );
	composer.addPass( effectFilm );
	composer.addPass( effectFocus );	
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
		check_for_intersection();
	}
	catch(e) {
	}	
	//renderer.render(scene, camera);
	renderer.clear();
	composer.render( 0.01 );	
}