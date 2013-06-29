var container, cube, projector;
var camera, controls, scene, renderer;	
var axis_helper = new THREE.Object3D();
var mouse = {x:0, y:0}, INTERSECTED;
var pick_sphere;
initCamScene();
initRenderer();
initGeom({});
animate();

function initCamScene() {
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20000 );
	camera.position.z = 20;
	//controls = new THREE.OrbitControls( camera );
	//controls.addEventListener( 'change', render );
	scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );
    projector = new THREE.Projector();
    var sp_geom = new THREE.SphereGeometry(0.15, 32, 24);
    var sp_mat = new THREE.MeshBasicMaterial({color:0xcccccc, wireframe: true});
    pick_sphere = new THREE.Mesh(sp_geom, sp_mat);
    scene.add(pick_sphere);
    pick_sphere.visible = false;
}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );	
		
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render );  


    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener('mousedown', mousedown, false);
    document.addEventListener('mouseup', mouseup, false);
    
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

var xAxisMesh, yAxisMesh, zAxisMesh, x_axis_line;
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
    //xAxisMesh.scale = new THREE.Vector3(10,10,10);

    x_axis_line = make_x_line();
    scene.add(x_axis_line);

    scene.add(xAxisMesh);
    //axis_helper.add(xAxisMesh);
    
    yAxisMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
    yAxisGeometry = new THREE.CylinderGeometry(params.radius, params.radius, params.height);
    yAxisMesh = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
    yArrowMesh = new THREE.Mesh(arrowGeometry, yAxisMaterial);
    yAxisMesh.add(yArrowMesh);
    yArrowMesh.position.y += params.height / 2;
    yAxisMesh.position.y += params.height / 2;

    //yAxisMesh.scale = new THREE.Vector3(10,10,10);    
    scene.add(yAxisMesh);
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

    //zAxisMesh.scale = new THREE.Vector3(10,10,10);
    //axis_helper.add(zAxisMesh);    
    //scene.add(axis_helper);    

////////////
  var cubeGeometry = new THREE.CubeGeometry( 50, 50, 50 );
  var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x000088 } );
  cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  cube.position.set(100,0,0);
 // scene.add(cube);
    scene.add(zAxisMesh);
}

function make_x_line(){
    var mat = new THREE.LineBasicMaterial({color:0x880000});
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(0,0,0));
    geom.vertices.push(new THREE.Vector3(250,0,0));
    return new THREE.Line(geom, mat);
}

var intersects;
function update(){
    // find intersections
    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    // create an array containing all objects in the scene with which the ray intersects
    intersects = ray.intersectObjects( scene.children );

    // INTERSECTED = the object in the scene currently closest to the camera 
    //      and intersected by the Ray projected from the mouse position    
    // if there is one (or more) intersections
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
var mouse_button_pressed = false;
function mousedown(event) {
    mouse_button_pressed = true;
    controls.noRotate = true;
    var y_axis_line, z_axis_line;
    var mat = new THREE.LineBasicMaterial({color:0x880000});
    var y_geom = new THREE.Geometry();
    y_geom.vertices.push(new THREE.Vector3(0,0,0));
    y_geom.vertices.push(new THREE.Vector3(0,250,0));
    y_axis_line = new THREE.Line(y_geom, mat);
    var z_geom = new THREE.Geometry();
    z_geom.vertices.push(new THREE.Vector3(0,0,0));
    z_geom.vertices.push(new THREE.Vector3(0,0,250));    
    z_axis_line = new THREE.Line(z_geom, mat);
    scene.add(y_axis_line);
    scene.add(z_axis_line);

    if (INTERSECTED) {
        if (INTERSECTED.currentHex == 255) { //blue = z Axis
            //console.log(INTERSECTED.position);
            console.log("blue");
            //drag_ray = shootRay(z_axis_line);    
        } else if (INTERSECTED.currentHex == 16711680 ) { //Red = x Axis
            controls.noPan = true;
            controls.noRotate = true;
            //drag_ray = shootRay(x_axis_line);    
            console.log("red");
        } else if (INTERSECTED.currentHex == 65280  ) { // y axis
            //console.log(INTERSECTED.position);
            console.log("green");
            //drag_ray = shootRay(y_axis_line);            
        }        
    } else {
        controls.noPan = false;
        controls.noRotate = false;  
    }    
    drag_ray=shootRay(x_axis_line);
}

function onDocumentMouseMove( event ) {
    // event.preventDefault();    
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    if (mouse_button_pressed) {
        shootRay(x_axis_line);
       // controls.noRotate = true;
    } else {
        controls.noRotate = false;
    }
}

function mouseup() {
    console.log("up!");
    pick_sphere.visible = false;
    mouse_button_pressed = false;
    controls.noRotate = false;
}

function shootRay(targ_line) {
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    vector.sub(camera.position);
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3().copy(vector));
    geom.vertices.push(new THREE.Vector3().copy(camera.position));    
    var mat = new THREE.LineBasicMaterial({color:0xffff00});
    var l = new THREE.Line(geom, mat);
    //scene.add(l);    
    var origin = new THREE.Vector3(0,0,0);
    var xAxis = new THREE.Vector3(250,0,0);
    build_skew_line(l, targ_line);
}

//skew line algo from http://nrich.maths.org/askedNRICH/edited/2360.html
//1st step, find the shortest distance between the skew lines:
//pass in two lines. The form for line is L = offsetVector + t*directionVector, where t is a free param.
//We'll call the shortest line connecting the two lines the skew_line_solution_vector
//function build_skew_line(offset1, vect1, offset2, vect2) { 
function build_skew_line(line1, line2) {   
    var skew_line_mat = new THREE.LineBasicMaterial({color:0x0000ff});
    var diff = new THREE.Vector3();
    var skew_line_solution_vector = new THREE.Vector3();
    var skew_line_solution_length; 
    var L1, L2, L1_offset, L1_vect, L2_offset, L2_vect;

    init();
    function init() {
        L1 = make_line_equation(line1);
        L2 = make_line_equation(line2);
        L1_offset = L1[0];
        L1_vect = L1[1];
        L2_offset = L2[0];
        L2_vect = L2[1];
        diff.copy(L1_offset);
        diff.sub(L2_offset);
        skew_line_solution_vector.copy(L2_vect);
        skew_line_solution_vector.cross(new THREE.Vector3().copy(L1_vect)).normalize();
        skew_line_solution_length = diff.dot(skew_line_solution_vector);
        skew_line_solution_vector.multiplyScalar(skew_line_solution_length);    
    }
    //L1, L2 generate a system of equations, of the form Ax=b. 
    var b = new THREE.Vector3().copy(L1_offset);
    b.add(skew_line_solution_vector);
    b.multiplyScalar(-1);
    b.add(L2_offset);   
    //The skew line vector gets added to the righ-hand-side of the equation sys, however we don't 
    //know if the vector is pointing in the right direction or need to be flipped: 
    var candidate_solution = solve_eq_sys(L1_vect, L2_vect, b); 
    var sl;
    if (check_solution(candidate_solution, b)) { 
        sl = draw_skew_line(candidate_solution);
    } else {
        var b = new THREE.Vector3().copy(L1_offset);
        b.sub(skew_line_solution_vector);
        b.multiplyScalar(-1);
        b.add(L2_offset);
        candidate_solution = solve_eq_sys(L1_vect, L2_vect, b); 
        sl = draw_skew_line(candidate_solution);
    }
    if(sl.length() > 3) {
         scene.remove(sl);
         hide_pick_sphere();
    } else {
        show_pick_sphere(sl.geometry.vertices[1]);
        controls.noRotate = true;
    }

    // check a candidate solution from solve_eq_sys() against the lines.
    //give L1 = L2 => xV1 - yV2 = right_side
    function check_solution(sol, right_side) {  
        var x = sol[0];
        var y = sol[1];     
        var LHS = new THREE.Vector3();
        LHS.setX(x*L1_vect.x + y*L2_vect.x);
        LHS.setY(x*L1_vect.y + y*L2_vect.y);
        LHS.setZ(x*L1_vect.z + y*L2_vect.z);
        LHS.sub(right_side);        
        return (LHS.length() < 0.001);        
    }
    function draw_skew_line(sol) { //uses the found solution to Ax = b.       
        var skew_line_geom = new THREE.Geometry();        
        var start = new THREE.Vector3().copy(L1_vect);
        var end = new THREE.Vector3().copy(L2_vect);
        var x = sol[0];
        var y = sol[1];        
        start.multiplyScalar(x).add(L1_offset);
        end.multiplyScalar(-y).add(L2_offset);
        //console.log("start = ", start, " end = ", end);
        skew_line_geom.vertices.push(start);
        skew_line_geom.vertices.push(end);
        var skew_line = new THREE.Line(skew_line_geom, skew_line_mat);
        skew_line.name = "Skew line " + scene.children.length;
        //scene.add(skew_line);
        return skew_line;
    }
}
function show_pick_sphere(origin) {
    //pick_sphere.position = origin;
    xAxisMesh.position = origin;
    yAxisMesh.position = origin;
    zAxisMesh.position = origin;
    pick_sphere.visible = true;
}

function hide_pick_sphere(){
    pick_sphere.visible = false;
}

function make_line_equation(line) {
    var offset, vector;
    offset = new THREE.Vector3();
    offset.copy(line.geometry.vertices[0]);        
    vector = new THREE.Vector3().copy(line.geometry.vertices[1]);
    vector.sub(offset);
    return [offset, vector];
}

THREE.Vector3.prototype.to_s = function() {
    var out = "(" +  this.x + ", " + this.y + ", " + this.z + ")";
    return out;   
}
THREE.Line.prototype.length = function() {
    if (this instanceof THREE.Line) {
        a = new THREE.Vector3().copy(this.geometry.vertices[0]);        
        a.sub(this.geometry.vertices[1]);
        console.log(a);
        return a.length();
    }
}
function solve_eq_sys(v1, v2, b) { //solve sys of Ax = b, where A is two equations for skew lines.
    var a = $M([ [v1.x, v2.x, b.x],
                 [v1.y, v2.y, b.y], 
                 [v1.z, v2.z, b.z] ]);
    var a = a.toRightTriangular();
    var sol_y = a.e(2,3)/a.e(2,2);
    var sol_x = (a.e(1,3) - a.e(1,2)*sol_y)/a.e(1,1);
    return [sol_x, sol_y];

}

///
var a = new THREE.Vector3(1,5,10);
var b = new THREE.Vector3(-2,7,9);
var c = new THREE.Vector3(6,5,-3);
