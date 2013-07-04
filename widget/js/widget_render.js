var container, camera, controls, scene, renderer;  

function initCamScene() {
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20000 );
	camera.position.z = 20;
	scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );
    projector = new THREE.Projector();
}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );		
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render );  
    document.addEventListener( 'mousemove', mousemove, false );
    document.addEventListener('mousedown', mousedown, false);
    document.addEventListener('mouseup', mouseup, false);
    window.addEventListener( 'resize', onWindowResize, false );
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    container.appendChild( renderer.domElement );
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	render();
}
function animate() {
	requestAnimationFrame(animate);
	controls.update();	
	render();	    
    try{
        check_for_intersection();
    } catch(e) {
    }

}					
function render() {		
	renderer.render(scene, camera);
}