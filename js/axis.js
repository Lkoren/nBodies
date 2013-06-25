var container, cube, projector;
var camera, controls, scene, renderer;	
var axis_helper = new THREE.Object3D();
var mouse = {x:0, y:0}, INTERSECTED;
initCamScene();
initRenderer();
initGeom({});
animate();

function initCamScene() {
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20000 );
	camera.position.z = 20;
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener('mousedown', onDocMouseClick, false);

    projector = new THREE.Projector();

}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );			
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
	requestAnimationFrame( animate );
	controls.update();	
	render();	
    update();
}					
function render() {		
	renderer.render(scene, camera);
}

var xAxisMesh, yAxisMesh, zAxisMesh;
function initGeom(params) {
    var arrowGeometry, xArrowMesh, xAxisGeometry, xAxisMaterial, yArrowMesh, 
    yAxisGeometry, yAxisMaterial, zArrowMesh, zAxisGeometry, zAxisMaterial;

    if (params == null) {
      params = {};
    }
    params.radius = params.radius || 0.05;
    params.height = params.height || 2;	
	arrowGeometry = new THREE.CylinderGeometry(0, 2 * params.radius, params.height / 5);
    xAxisMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
    xAxisGeometry = new THREE.CylinderGeometry(params.radius, params.radius, params.height);
    xAxisMesh = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
    xArrowMesh = new THREE.Mesh(arrowGeometry, xAxisMaterial);    
    xAxisMesh.add(xArrowMesh);

    
    xArrowMesh.position.y += params.height / 2;
    xAxisMesh.rotation.z -= 90 * Math.PI / 180;
    xAxisMesh.position.x += params.height / 2;
    xAxisMesh.scale = new THREE.Vector3(10,10,10);
    x_helper = createArrow("red");
    x_helper.position.y +=params.height/2;
    x_helper.rotation.z -= 90*Math.PI/180;
    x_helper.position.x += params.height/2;
    x_helper.scale =  new THREE.Vector3(10,10,10);

    scene.add(xAxisMesh);
    scene.add(x_helper);
    //axis_helper.add(xAxisMesh);
    
    yAxisMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
    yAxisGeometry = new THREE.CylinderGeometry(params.radius, params.radius, params.height);
    yAxisMesh = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
    yArrowMesh = new THREE.Mesh(arrowGeometry, yAxisMaterial);
    yAxisMesh.add(yArrowMesh);
    yArrowMesh.position.y += params.height / 2;
    yAxisMesh.position.y += params.height / 2;

    yAxisMesh.scale = new THREE.Vector3(10,10,10);    scene.add(yAxisMesh);
    //axis_helper.add(yAxisMesh);

    zAxisMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000FF
    });
    zAxisGeometry = new THREE.CylinderGeometry(params.radius, params.radius, params.height);
    zAxisMesh = new THREE.Mesh(zAxisGeometry, zAxisMaterial);
    zArrowMesh = new THREE.Mesh(arrowGeometry, zAxisMaterial);
    zAxisMesh.add(zArrowMesh);
    zAxisMesh.rotation.x += 90 * Math.PI / 180;
    zArrowMesh.position.y += params.height / 2;
    zAxisMesh.position.z += params.height / 2;

    zAxisMesh.scale = new THREE.Vector3(10,10,10);
    //axis_helper.add(zAxisMesh);    
    //scene.add(axis_helper);    

////////////
  var cubeGeometry = new THREE.CubeGeometry( 50, 50, 50 );
  var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x000088 } );
  cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  cube.position.set(100,0,0);
  //scene.add(cube);
    scene.add(zAxisMesh);
}
function createArrow(color) {
    var geom = new THREE.Geometry();
    var v = geom.vertices;
    v.push(new THREE.Vector3(2,0,0));
    v.push(new THREE.Vector3(2,9,0));
    v.push(new THREE.Vector3(7,8,0));
    v.push(new THREE.Vector3(0,15,0));
    v.push(new THREE.Vector3(-7,8,0));
    v.push(new THREE.Vector3(-2,9,0));
    v.push(new THREE.Vector3(-2,0,0));

    var f = geom.faces;
    f.push(new THREE.Face3(6,1,0));
    f.push(new THREE.Face3(6,5,1));
    f.push(new THREE.Face3(4,3,2));
    
    if (color) try{ 
        c = new THREE.Color(color);
    } catch(e) {
        c = new THREE.Color();
        c.r = Math.random()*255;
        c.g = Math.random()*255;
        c.b = Math.random()*255;
    }
    var mat = new THREE.MeshBasicMaterial({color:c});
    return new THREE.Mesh(geom, mat);
}

function onDocumentMouseMove( event ) 
{
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();
    
    // update the mouse variable
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

var intersects;
function update()
{
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
    intersects = ray.intersectObjects( scene.children );
    if ( intersects.length > 0 )
    {
        // if the closest object intersected is not the currently stored intersection object
        if ( intersects[ 0 ].object != INTERSECTED ) {
            // restore previous intersection object (if it exists) to its original color
            if ( INTERSECTED ) 
                INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            // store reference to closest object as current intersection object
            INTERSECTED = intersects[ 0 ].object;
            // store color of closest object (for later restoration)
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            // set a new color for closest object
            INTERSECTED.material.color.setHex( 0xffff00 );
        }
    } 
    else // there are no intersections
    {
        // restore previous intersection object (if it exists) to its original color
        if ( INTERSECTED ) 
            INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        // remove previous intersection object reference
        //     by setting current intersection object to "nothing"
        INTERSECTED = null;
    }
    controls.update();
}

function onDocMouseClick(event) {
    if (INTERSECTED) {
        if (INTERSECTED.currentHex == 255) { //blue = y Axis
            console.log(INTERSECTED.position);
            console.log("blue");
        } else if (INTERSECTED.currentHex == 16711680 ) { //Red = x Axis
            console.log(INTERSECTED.position);
            console.log("red");
        } else if (INTERSECTED.currentHex == 65280  ) {
            console.log(INTERSECTED.position);
            console.log("green");
        }
    }
}
