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
	//scene.fog = new THREE.FogExp2( 0x202020, 0.2 );
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
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( renderModel );	

	var rgbShiftEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
	rgbShiftEffect.uniforms[ 'amount' ].value = 0.0015;
	//composer.addPass( rgbShiftEffect );



	var effectFilm = new THREE.FilmPass( 0.1, 0.0, 0.0, false );
	composer.addPass( effectFilm );
	
var edgeEffect = new THREE.ShaderPass( THREE.EdgeShader );
	edgeEffect.uniforms[ 'aspect' ].value.x = window.innerWidth;
	edgeEffect.uniforms[ 'aspect' ].value.y = window.innerHeight;
	composer.addPass( edgeEffect );

	var effectBloom = new THREE.BloomPass( 3, 25, 10, 512);
	//filmShader + edgeShader + bloom(10,25,10) gives a nice, blown-out, fuzzy effect.
	//bloom interface: ( strength, kernelSize, sigma, resolution )
	//strength: how strong is the effect. 
	//resoluation a quality setting. Above 1024, gets too expensive. 
	//kernalSize: kernal size is a sort of resolution setting. The signal is probably being convolved with a kernal, 
		//and this setting affects that. Also seems computationally expensive. Keep < 40, ideally less than 10.  
	//sigma: a sort of bleed or blur setting. 
	//seems to affect how blurry/sharp the output is. Higher = sharper

	/*	strength = ( strength !== undefined ) ? strength : 1;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	sigma = ( sigma !== undefined ) ? sigma : 4.0;
	resolution = ( resolution !== undefined ) ? resolution : 256;*/
	composer.addPass( effectBloom ); 

	

	var effect = new THREE.ShaderPass( THREE.CopyShader);
	effect.renderToScreen = true;
	composer.addPass( effect );


	//effectBloom.renderToScreen = true;
	

	//effectFocus = new THREE.ShaderPass( THREE.FocusShader );
	//effectFocus.uniforms[ "screenWidth" ].value = window.innerWidth;
	//effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight;
	//effectFocus.renderToScreen = true;


	
	//composer.addPass( effectFilm );
	//composer.addPass( effectFocus );	
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	render();

	edgeEffect.uniforms[ 'aspect' ].value.x = window.innerWidth;
	edgeEffect.uniforms[ 'aspect' ].value.y = window.innerHeight;	
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
	composer.render();	
}