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
	//controls = new THREE.OrbitControls( camera );
	//controls.addEventListener( 'change', render );
	scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );
    projector = new THREE.Projector();

}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );	
		
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render );  


    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener('mousedown', onDocMouseClick, false);
    
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
    //xAxisMesh.scale = new THREE.Vector3(10,10,10);

    var x = make_x_line();
    //scene.add(x);

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

function onDocMouseClick(event) {
    console.log("hi!");
    if (INTERSECTED) {
        if (INTERSECTED.currentHex == 255) { //blue = y Axis
            console.log(INTERSECTED.position);

            console.log("blue");
        } else if (INTERSECTED.currentHex == 16711680 ) { //Red = x Axis
            controls.noPan = true;
            controls.noRotate = true;

            console.log("red");
        } else if (INTERSECTED.currentHex == 65280  ) {
            console.log(INTERSECTED.position);
            console.log("green");
        }
    } else {
        controls.noPan = false;
        controls.noRotate = false;  
    }
    drag_ray = shootRay();    
}

function shootRay() {
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    vector.sub(camera.position);
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3().copy(vector));
    geom.vertices.push(new THREE.Vector3().copy(camera.position));    
    var mat = new THREE.LineBasicMaterial({color:0xffff00});
    var l = new THREE.Line(geom, mat);
    scene.add(l);    
    var origin = new THREE.Vector3(0,0,0);
    var xAxis = new THREE.Vector3(250,0,0);
    build_skew_line(camera.position, vector, origin, xAxis);
}

//skew line algo from http://nrich.maths.org/askedNRICH/edited/2360.html
//1st step, find the shortest distance between the skew lines:
//pass in two lines. The form for line is L = offsetVector + t*directionVector, where t is a free param.
//We'll call the shortest line connecting the two lines the skew_line_solution_vector
//function build_skew_line(offset1, vect1, offset2, vect2) { 
function build_skew_line(offset1, vect1, offset2, vect2) { 
    
    var skew_line_mat = new THREE.LineBasicMaterial({color:0x0000ff});
    var offset1, vect1, offset2, vect2;



    /*console.log("===================")
    console.log(" L1 = ", offset1.to_s(), " + x ", vect1.to_s());
    console.log(" L2 = ", offset2.to_s(), " + x ", vect2.to_s());*/
    var diff = new THREE.Vector3();
    var skew_line_solution_vector = new THREE.Vector3();
    var skew_line_solution_length; 
    diff.copy(offset1);
    diff.sub(offset2);
    skew_line_solution_vector.copy(vect2);
    skew_line_solution_vector.cross(new THREE.Vector3().copy(vect1)).normalize();
    skew_line_solution_length = diff.dot(skew_line_solution_vector);
    skew_line_solution_vector.multiplyScalar(skew_line_solution_length);    
    //console.log("vector of the shortest line that joins them = ", skew_line_solution_vector);
    var b = new THREE.Vector3().copy(offset1);
    b.add(skew_line_solution_vector);
    b.multiplyScalar(-1);
    b.add(offset2);

    if (check_solution(solve_eq_sys(vect1, vect2, b), b)) { 
       draw_skew_line(solve_eq_sys(vect1, vect2, b));
    } else {
        var b = new THREE.Vector3().copy(offset1);
        b.sub(skew_line_solution_vector);
        b.multiplyScalar(-1);
        b.add(offset2);
        check_solution(solve_eq_sys(vect1, vect2, b), b);
        draw_skew_line(solve_eq_sys(vect1, vect2, b));
    }

    // check a candidate solution from solve_eq_sys() against the lines.
    //give L1 = L2 => xV1 - yV2 = right_side
    function check_solution(sol, right_side) {  
        //console.log("checker recieves candidate sol: " + sol);
        var x = sol[0];
        var y = sol[1];     
        var LHS = new THREE.Vector3();
        LHS.setX(x*vect1.x + y*vect2.x);
        LHS.setY(x*vect1.y + y*vect2.y);
        LHS.setZ(x*vect1.z + y*vect2.z);
        /*console.log("=======");
        console.log("left hand side: \n ", LHS, "\n \n right hand side: \n", right_side);
        console.log("=======");*/
        LHS.sub(right_side);        
        return (LHS.length() < 0.001);        
    }
    function draw_skew_line(sol) { //uses the found solution to Ax = b.       
        /*console.log(" L1 = ", offset1.to_s(), " + x ", vect1.to_s());
        console.log(" L2 = ", offset2.to_s(), " + x ", vect2.to_s());
        console.log("incoming solution is", sol); */
        
        var skew_line_geom = new THREE.Geometry();        
        var start = new THREE.Vector3().copy(vect1);
        var end = new THREE.Vector3().copy(vect2);
        var x = sol[0];
        var y = sol[1];        
        start.multiplyScalar(x).add(offset1);
        end.multiplyScalar(-y).add(offset2);
        skew_line_geom.vertices.push(start);
        skew_line_geom.vertices.push(end);
        var skew_line = new THREE.Line(skew_line_geom, skew_line_mat);
        skew_line.name = "Skew line " + scene.children.length;
        scene.add(skew_line);
    }

}

THREE.Vector3.prototype.to_s = function() {
    var out = "(" +  this.x + ", " + this.y + ", " + this.z + ")";
    return out;   
}

function solve_eq_sys(v1, v2, b) { //solve sys of Ax = b, where A is two equations for skew lines.
    /* console.log("v1 = ", v1);
    console.log("v2 = ", v2);
    console.log("b = ", b);  */
    var a = $M([ [v1.x, v2.x, b.x],
                 [v1.y, v2.y, b.y], 
                 [v1.z, v2.z, b.z] ]);
    var a = a.toRightTriangular();
    var sol_y = a.e(2,3)/a.e(2,2);
    var sol_x = (a.e(1,3) - a.e(1,2)*sol_y)/a.e(1,1);
    /*console.log("x,y = ", sol_x, ", ", sol_y);
    console.log("==========") */
    return [sol_x, sol_y];

}

/*
var off1 = new THREE.Vector3(1,2,1);
var off2 = new THREE.Vector3(5,1,3);
var vec1 = new THREE.Vector3(1,0,-2);
var vec2 = new THREE.Vector3(-2,1,0);
*/

/*
var off1 = new THREE.Vector3(1,2,3);
var vec1 = new THREE.Vector3(2,3,5);
var off2 = new THREE.Vector3(-2,3,1);
var vec2 = new THREE.Vector3(1,3,6);

var line_mat = new THREE.LineBasicMaterial({color:0x000000});
var L1_geom = new THREE.Geometry();
var L2_geom = new THREE.Geometry();

L1_geom.vertices.push(new THREE.Vector3(-19,-28,-47));
L1_geom.vertices.push(new THREE.Vector3(21,32,53))
L2_geom.vertices.push(new THREE.Vector3(-12,-27,-59));
L2_geom.vertices.push(new THREE.Vector3(8,33,61)); 
*/

var line_mat1 = new THREE.LineBasicMaterial({color:0xff0000});
var line_mat2 = new THREE.LineBasicMaterial({color:0x00ff00});
var L1_geom = new THREE.Geometry();
var L2_geom = new THREE.Geometry();


var off1 = new THREE.Vector3(10,0,10);
var vec1 = new THREE.Vector3(0,10,0);
var off2 = new THREE.Vector3(0,10,0);
var vec2 = new THREE.Vector3(10,0,0);

L1_geom.vertices.push(off1);
L1_geom.vertices.push(new THREE.Vector3(10,10,10));
L2_geom.vertices.push(off2);
L2_geom.vertices.push(new THREE.Vector3(10,10,0)); 

/*
var off1 = new THREE.Vector3(0,0,10);
var vec1 = new THREE.Vector3(200,-100,-200);
var off2 = new THREE.Vector3(0,0,0);
var vec2 = new THREE.Vector3(25,0,0);



L1_geom.vertices.push(off1);
L1_geom.vertices.push(new THREE.Vector3(200,-100,-190));
L2_geom.vertices.push(off2);
L2_geom.vertices.push(new THREE.Vector3(25,0,0)); 
*/

/*
L1_geom.vertices.push(new THREE.Vector3(1,2,3));
L1_geom.vertices.push(new THREE.Vector3(3,5,8))
L2_geom.vertices.push(new THREE.Vector3(-2,3,1));
L2_geom.vertices.push(new THREE.Vector3(-1,6,7)); */
var L1 = new THREE.Line(L1_geom, line_mat1);
var L2 = new THREE.Line(L2_geom, line_mat2);

scene.add(L1);
scene.add(L2);

///
var a = new THREE.Vector3(1,5,10);
var b = new THREE.Vector3(-2,7,9);
var c = new THREE.Vector3(6,5,-3);
