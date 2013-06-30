var container, cube, projector;
var camera, controls, scene, renderer;	
var axis_helper = new THREE.Object3D();
var mouse = {x:0, y:0}, INTERSECTED;
var intersects;
var mouse_button_pressed = false;
var xAxisMesh, yAxisMesh, zAxisMesh, x_axis_line;
var x_axis_line, y_axis_line, z_axis_line;
var x_pick_box, y_pick_box, z_pick_box;

initCamScene();
initRenderer();
initGeom({});
animate();

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
    document.addEventListener( 'mousemove', mouseMove, false );
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
	requestAnimationFrame(animate);
	controls.update();	
	render();	
    update();
}					
function render() {		
	renderer.render(scene, camera);
}
var x;
x = new THREE.Object3D();
function initGeom(params) {
    var arrowGeometry, xArrowMesh, xAxisGeometry, xAxisMaterial, yArrowMesh, 
    yAxisGeometry, yAxisMaterial, zArrowMesh, zAxisGeometry, zAxisMaterial;
    params = params || {}; //check for null val.
    params.radius = params.radius || 0.05;
    params.height = params.height || 2;	    
    scene.add(make_axis_lines());
    x_pick_box = make_axis_pick_box(0xff9999,  params);
    x_pick_box.rotation.z -= 90 * Math.PI / 180;
    x_pick_box.position.x += params.height / 1.0;
    x_pick_box.position.y = 0;
    scene.add(x_pick_box);

//    yAxisMesh = make_axis_mesh(0x00ff00, params);
    y_pick_box = make_axis_pick_box(0x99ff99, params);
    y_pick_box.rotation.y += 90 * Math.PI / 180;
    //yAxisMesh.add(y_pick_box);
    //yAxisMesh.position.y += params.height / 1.5;
    //scene.add(yAxisMesh);
    scene.add(y_pick_box);
    //zAxisMesh = make_axis_mesh(0x0000ff, params);
    z_pick_box = make_axis_pick_box(0x9999ff,  params);
    z_pick_box.rotation.y += 90 * Math.PI / 180;     
    /*zAxisMesh.add(z_pick_box);
    zAxisMesh.rotation.x += 90 * Math.PI / 180;    
    //zAxisMesh.position.z += params.height / 1.5; 
    scene.add(zAxisMesh);*/
    scene.add(z_pick_box);
}
function make_axis_mesh(c, params) {
    col = c || 0x000000;
    var mat = new THREE.MeshBasicMaterial({color: col});
    var arrow_geom = new THREE.CylinderGeometry(0, 2 * params.radius, params.height / 5);
    var axis_geom = new THREE.CylinderGeometry(params.radius, params.radius, params.height);
    var axis_mesh = new THREE.Mesh(axis_geom, mat);
    var arrow_mesh = new THREE.Mesh(arrow_geom, mat);
    arrow_mesh.position.setY(params.height/2);
    axis_mesh.add(arrow_mesh);
    return axis_mesh;
}
function make_axis_lines(){
    var mat = new THREE.LineBasicMaterial({color:0x880000});
    var x_geom = new THREE.Geometry();
    var line_axis_obj = new THREE.Object3D;    
    x_geom.vertices.push(new THREE.Vector3(0,0,0));
    x_geom.vertices.push(new THREE.Vector3(250,0,0));
    x_axis_line = new THREE.Line(x_geom, mat);
    x_axis_line.name = "x";
    line_axis_obj.add(x_axis_line);
    mat = new THREE.LineBasicMaterial({color:0x008800});
    var y_geom = new THREE.Geometry();
    y_geom.vertices.push(new THREE.Vector3(0,0,0));
    y_geom.vertices.push(new THREE.Vector3(0,250,0));
    y_axis_line = new THREE.Line(y_geom, mat);
    y_axis_line.name = "y";
    line_axis_obj.add(y_axis_line);
    mat = new THREE.LineBasicMaterial({color:0x000088});
    var z_geom = new THREE.Geometry();
    z_geom.vertices.push(new THREE.Vector3(0,0,0));
    z_geom.vertices.push(new THREE.Vector3(0,0,250));    
    z_axis_line = new THREE.Line(z_geom, mat)
    z_axis_line.name = "z";
    line_axis_obj.add(z_axis_line);
    return(line_axis_obj);
}
function make_axis_pick_box(col, params){
    col = 0x000000 || col;
    var mat = new THREE.MeshBasicMaterial({color:col, transparent: true, opacity: 0.7});
    var wireframe_mat = new THREE.MeshBasicMaterial({color:col, wireframe:true, transparency: true, opacity: 0.7});
    var geom = new THREE.CubeGeometry(0.05 * params.height, 1.5 * params.height, 0.5 * params.height);
    var pick_cube = new THREE.Mesh(geom, mat);
    pick_cube.add(new THREE.Mesh(geom, wireframe_mat));
    pick_cube.position.setY(1*params.height); //delete after cleanup
    pick_cube.axis = "x";
    return pick_cube;
}
function update(){
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
    intersects = ray.intersectObjects( scene.children, true ); //true sets recursive, checks children of obj.
    if ( intersects.length > 0 ) {
        if ( intersects[ 0 ].object != INTERSECTED ) {
            if ( INTERSECTED ) 
                //console.log(intersects[ 0 ].object);
                INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            console.log(INTERSECTED.currentHex);
            INTERSECTED.material.color.setHex( 0xffff00 );
        }
    } else {
        if ( INTERSECTED ) 
            INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
    }
    controls.update();
}
function lock_cam(){
    controls.noPan = true;
    controls.noRotate = true;    
    return controls;
}
function unlock_cam() {
    controls.noPan = false;
    controls.noRotate = false;    
    return controls;
}
////mouse events:
var sliding_axis;
function mousedown(event) { //better way to do this than using sliding_axis?
    mouse_button_pressed = true;
    controls.noRotate = true;
    if (INTERSECTED) {
        if (INTERSECTED.currentHex == 16751001) { //Red = x Axis
            lock_cam();
            shootRay(x_axis_line);    
            sliding_axis = x_axis_line;
            //console.log("red");
        } else if (INTERSECTED.currentHex == 10092441) { //Green = y axis
            //console.log("green");
            shootRay(y_axis_line);
            sliding_axis = y_axis_line;
        } else if (INTERSECTED.currentHex == 10066431) { //Blue = z Axis
            //console.log("blue");
            shootRay(z_axis_line);    
            sliding_axis = z_axis_line;            
        }
    } else {
        controls.noPan = false;
        controls.noRotate = false;  
    }    
}
function mouseMove( event ) {
    // event.preventDefault();    
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    if (mouse_button_pressed) {
        shootRay(sliding_axis);
       // controls.noRotate = true;
    } else {
        controls.noRotate = false;
    }
}
function mouseup() {
    mouse_button_pressed = false;
    controls.noRotate = false;
}
////Geometry stuff:
function shootRay(targ_line) {
    console.log(targ_line.name);
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    vector.sub(camera.position);
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3().copy(vector));
    geom.vertices.push(new THREE.Vector3().copy(camera.position));    
    var mat = new THREE.LineBasicMaterial({color:0xffff00});
    var l = new THREE.Line(geom, mat);
    //scene.add(l);    
    build_skew_line(l, targ_line);
}
//skew line algo from http://nrich.maths.org/askedNRICH/edited/2360.html . 1st step, find the length of the shortest line that connects
//both skew lines. The form for line is L = offsetVector + t*directionVector, where t is a free param. We'll call this shortest line
//which connecting the two lines the skew_line_solution_vector 
function build_skew_line(line1, line2) {   
    var skew_line_mat = new THREE.LineBasicMaterial({color:0x0000ff});
    var diff = new THREE.Vector3();
    var skew_line_solution_vector = new THREE.Vector3();
    var skew_line_solution_length; 
    var L1, L2, L1_offset, L1_vect, L2_offset, L2_vect;
    var b, candidate_solution, skew_line;
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
        //skew_line_sol_vect = |(off1 - off1) * (vect1 x vect2) / |(vect1 x vect2)|| * (vect1 x vect2) / |(vect1 x vect2)| 
        //where * = dot product or scalarMultiplication, x = cross product. See nrich.math.org ref above. 
        skew_line_solution_vector.copy(L2_vect);
        skew_line_solution_vector.cross(new THREE.Vector3().copy(L1_vect)).normalize();
        skew_line_solution_length = diff.dot(skew_line_solution_vector);
        skew_line_solution_vector.multiplyScalar(skew_line_solution_length);    
    }
    //After you've +/- the skew_line_solution_vector to one of the lines, L1, L2 will intersect in 
    //one of those two systems, generatating a system of equations, of the form Ax=b. 
    b = new THREE.Vector3().copy(L1_offset);
    b.add(skew_line_solution_vector);
    b.multiplyScalar(-1);
    b.add(L2_offset);   
    //The skew line vector gets added to the righ-hand-side of the equation sys, however we don't 
    //know if the vector is pointing in the right direction or needs to be flipped.
    candidate_solution = solve_eq_sys(L1_vect, L2_vect, b);     
    if (check_solution(candidate_solution, b)) { 
        sl = draw_skew_line(candidate_solution);
    } else {
        b = new THREE.Vector3().copy(L1_offset);
        b.sub(skew_line_solution_vector);
        b.multiplyScalar(-1);
        b.add(L2_offset);
        candidate_solution = solve_eq_sys(L1_vect, L2_vect, b); 
        skew_line = draw_skew_line(candidate_solution);
    }
    if (skew_line.length() < 3) {
        update_widget(skew_line.geometry.vertices[1]);
        controls.noRotate = true;        
    }
    // check a candidate solution from solve_eq_sys() against the lines. If we set L1 = L2, we get a system of  xV1 - yV2 = right_side
    //where right_side = the sum of the offset vectors + the translation vector b, which we found above. We can plug candidate 
    //solutions back into the system and test for equality. 
    function check_solution(sol, right_side) {  
        var x = sol[0];
        var y = sol[1];     
        var LHS = new THREE.Vector3();
        LHS.setX(x*L1_vect.x + y*L2_vect.x);
        LHS.setY(x*L1_vect.y + y*L2_vect.y);
        LHS.setZ(x*L1_vect.z + y*L2_vect.z);
        LHS.sub(right_side);        
        return (LHS.length() < 0.00001); // nb: this is > 0 to deal with small numerical errors. 
    }
    function draw_skew_line(sol) { //uses the found solution to Ax = b.       
        var skew_line_geom = new THREE.Geometry();        
        var start = new THREE.Vector3().copy(L1_vect);
        var end = new THREE.Vector3().copy(L2_vect);
        var x = sol[0];
        var y = sol[1];        
        start.multiplyScalar(x).add(L1_offset);
        end.multiplyScalar(-y).add(L2_offset);
        skew_line_geom.vertices.push(start);
        skew_line_geom.vertices.push(end);
        var skew_line = new THREE.Line(skew_line_geom, skew_line_mat);
        skew_line.name = "Skew line " + scene.children.length;
        //scene.add(skew_line);
        return skew_line;
    }
}
function update_widget(origin, params) {
    params = params || {}; //check for null val.
    params.radius = params.radius || 0.05;
    params.height = params.height || 2;    
    x_pick_box.position = new THREE.Vector3().copy(origin);
    x_pick_box.position.x += params.height;
    y_pick_box.position = new THREE.Vector3().copy(origin);
    y_pick_box.position.y += params.height;
    z_pick_box.position = new THREE.Vector3().copy(origin);
    z_pick_box.position.z += params.height;
    x_axis_line.position = origin;
    y_axis_line.position = origin;
    z_axis_line.position = origin;
}
function make_line_equation(line) {
    var offset, vector;
    offset = new THREE.Vector3();
    offset.copy(line.geometry.vertices[0]);        
    vector = new THREE.Vector3().copy(line.geometry.vertices[1]);
    vector.sub(offset);
    return [offset, vector];
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
THREE.Vector3.prototype.to_s = function() {
    var out = "(" +  this.x + ", " + this.y + ", " + this.z + ")";
    return out;   
}
THREE.Line.prototype.length = function() {
    if (this instanceof THREE.Line) {
        a = new THREE.Vector3().copy(this.geometry.vertices[0]);        
        a.sub(this.geometry.vertices[1]);
        return a.length();
    }
}

///
var a = new THREE.Vector3(1,5,10);
var b = new THREE.Vector3(-2,7,9);
var c = new THREE.Vector3(6,5,-3);
