var container, cube, projector;
var camera, controls, scene, renderer;	
//var axis_helper = ne w THREE.Object3D();
var mouse = {x:0, y:0}, INTERSECTED;
var intersects;
var mouse_button_pressed = false;
var x_axis_line, y_axis_line, z_axis_line;
var x_pick_box, y_pick_box, z_pick_box;
var sliding_axis; //keeps track of which, if any, axis we are alowed to move along. 
var w,x; 

//initGeom({});
initCamScene();
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
    
/*
    document.addEventListener( 'mousemove', w.mousemove, false );
    document.addEventListener('mousedown', w.mousedown.bind(w), false);
    document.addEventListener('mouseup', w.mouseup.bind(w), false);

    document.addEventListener( 'mousemove', x.mousemove.bind(x), false );
    document.addEventListener('mousedown', x.mousedown.bind(x), false);
    document.addEventListener('mouseup', x.mouseup.bind(x), false);    
    */
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
    x.update();
    w.update();
}					
function render() {		
	renderer.render(scene, camera);
}

var axis_widget = function(name) {
    this.origin = new THREE.Vector3(0,0,0);    
    this.params = {
        radius: 0.05,
        height: 2,
    };	
    this.name = name;
	this.x_pick_box = {};
	this.y_pick_box = {};
	this.z_pick_box = {};
    this.x_axis_line = {};
    this.y_axis_line = {};
    this.z_axis_line = {};    
    //this.sliding_axis = {};    	
}

axis_widget.prototype.mousemove = function(event) {
    // event.preventDefault();    
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    if (mouse_button_pressed && sliding_axis) {
        shootRay(sliding_axis);
       // controls.noRotate = true;
    } else {
        controls.noRotate = false;
    }
}	
axis_widget.prototype.init = function() {
	var params = this.params;
    params = params || {}; //check for null val.
    params.radius = params.radius || 0.05;
    params.height = params.height || 2;     
    scene.add(this.make_axis_lines());
    x_pick_box = this.make_axis_pick_box(0xff9999, params, "x");
    x_pick_box.rotation.z -= 90 * Math.PI / 180;
    x_pick_box.position.x += params.height / 1.0;
    x_pick_box.position.y = 0;
    scene.add(x_pick_box);
    y_pick_box = this.make_axis_pick_box(0x99ff99, params, "y");
    y_pick_box.rotation.y += 90 * Math.PI / 180;
    y_pick_box.position.y += params.height;
    scene.add(y_pick_box);
    z_pick_box = this.make_axis_pick_box(0x9999ff, params, "z");
    z_pick_box.rotation.x += 90 * Math.PI / 180;     
    z_pick_box.rotation.y += 90 * Math.PI / 180;  
    z_pick_box.position.z += params.height;
    scene.add(z_pick_box);
}
axis_widget.prototype.make_axis_lines = function() {
    var mat = new THREE.LineBasicMaterial({color:0x880000});
    var x_geom = new THREE.Geometry();
    var line_axis_obj = new THREE.Object3D;    
    x_geom.vertices.push(new THREE.Vector3(0.5,0,0));
    x_geom.vertices.push(new THREE.Vector3(4,0,0));
    this.x_axis_line = new THREE.Line(x_geom, mat);
    this.x_axis_line.name = "x";
    line_axis_obj.add(this.x_axis_line);
    mat = new THREE.LineBasicMaterial({color:0x008800});
    var y_geom = new THREE.Geometry();
    y_geom.vertices.push(new THREE.Vector3(0,0.5,0));
    y_geom.vertices.push(new THREE.Vector3(0,4,0));
    this.y_axis_line = new THREE.Line(y_geom, mat);
    this.y_axis_line.name = "y";
    line_axis_obj.add(this.y_axis_line);
    mat = new THREE.LineBasicMaterial({color:0x000088});
    var z_geom = new THREE.Geometry();
    z_geom.vertices.push(new THREE.Vector3(0,0,0.5));
    z_geom.vertices.push(new THREE.Vector3(0,0,4));    
    this.z_axis_line = new THREE.Line(z_geom, mat)
    this.z_axis_line.name = "z";    
    line_axis_obj.add(this.z_axis_line);
    return(line_axis_obj);        
}
axis_widget.prototype.make_axis_pick_box = function(col, params, name){
    col = 0x000000 || col;
    var mat = new THREE.MeshBasicMaterial({color:col, transparent: true, opacity: 0.7});
    var wireframe_mat = new THREE.MeshBasicMaterial({color:col, wireframe:true, transparency: true, opacity: 0.7});
    var geom = new THREE.CubeGeometry(0.05 * params.height, 1.5 * params.height, 0.5 * params.height);
    var pick_cube = new THREE.Mesh(geom, mat);
    pick_cube.add(new THREE.Mesh(geom, wireframe_mat));
    pick_cube.axis = name;
    return pick_cube;
}
axis_widget.prototype.update = function() {	
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
    intersects = ray.intersectObjects( scene.children, true ); //true sets recursive, checks children of obj.
    if ( intersects.length > 0 ) {
    	//console.log(INTERSECTED);
    	//console.log(this.name.name);

		document.addEventListener( 'mousemove', w.mousemove.bind(intersects), false );
	    document.addEventListener('mousedown', w.mousedown.bind(intersects), false);
	    document.addEventListener('mouseup', w.mouseup.bind(intersects), false);


        if ( intersects[ 0 ].object != INTERSECTED ) {
            if ( INTERSECTED ) 
                INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex( 0xffff00 );
        }
    } else {
        if ( INTERSECTED ) 
            INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
   		document.removeEventListener( 'mousemove', w.mousemove.bind(intersects), false );
	    document.removeEventListener('mousedown', w.mousedown.bind(intersects), false);
	    document.removeEventListener('mouseup', w.mouseup.bind(intersects), false);
   
    }
    controls.update();
}
function lock_cam() {
    controls.noPan = true;
    controls.noRotate = true;    
    return controls;
}
axis_widget.prototype.unlock_cam = function() {
    controls.noPan = false;
    controls.noRotate = false;    
    return controls;
}
axis_widget.prototype.mousedown = function() {
	console.log("this = ", this);

    mouse_button_pressed = true;
    controls.noRotate = true;
    if (INTERSECTED) {
        if (INTERSECTED.currentHex == 16751001) { //Red = x Axis        	
            lock_cam();
            this.shootRay(this.x_axis_line);    
            sliding_axis = x_axis_line;
        } else if (INTERSECTED.currentHex == 10092441) { //Green = y axis
            this.shootRay(this.y_axis_line);
            sliding_axis = this.y_axis_line;
        } else if (INTERSECTED.currentHex == 10066431) { //Blue = z Axis
            this.shootRay(this.z_axis_line);    
            sliding_axis = this.z_axis_line;            
        }
    } else {
        controls.noPan = false;
        controls.noRotate = false;  
        sliding_axis = null;
    }    
}
axis_widget.prototype.mousemove = function(event) {
    // event.preventDefault();    
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    if (mouse_button_pressed && sliding_axis) {
        this.shootRay(sliding_axis);
       // controls.noRotate = true;
    } else {
        controls.noRotate = false;
    }        
}
axis_widget.prototype.mouseup = function() {
    mouse_button_pressed = false;
    controls.noRotate = false;    
}
axis_widget.prototype.shootRay = function(targ_line) {
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    vector.sub(camera.position);
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3().copy(vector));
    geom.vertices.push(new THREE.Vector3().copy(camera.position));    
    var mat = new THREE.LineBasicMaterial({color:0xffff00});
    var l = new THREE.Line(geom, mat);
    this.build_skew_line(l, targ_line);
}
//skew line algo from http://nrich.maths.org/askedNRICH/edited/2360.html . 1st step, find the length of the shortest line that connects
//both skew lines. The form for line is L = offsetVector + t*directionVector, where t is a free param. We'll call this shortest line
//which connecting the two lines the skew_line_solution_vector     
axis_widget.prototype.build_skew_line = function(line1, line2){
    var skew_line_mat = new THREE.LineBasicMaterial({color:0x333333});
    var diff = new THREE.Vector3();
    var skew_line_solution_vector = new THREE.Vector3();
    var skew_line_solution_length; 
    var L1, L2, L1_offset, L1_vect, L2_offset, L2_vect;
    var b, candidate_solution, skew_line;
    var that = this;
    console.log("that = ", that);
    init();
    function init() {
        L1 = that.make_line_equation(line1);
        L2 = that.make_line_equation(line2);
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
    candidate_solution = this.solve_eq_sys(L1_vect, L2_vect, b);     
    if (check_solution(candidate_solution, b)) { 
        sl = draw_skew_line(candidate_solution);
    } else {
        b = new THREE.Vector3().copy(L1_offset);
        b.sub(skew_line_solution_vector);
        b.multiplyScalar(-1);
        b.add(L2_offset);
        candidate_solution = this.solve_eq_sys(L1_vect, L2_vect, b); 
        skew_line = draw_skew_line(candidate_solution);
    }
    if (skew_line.length() < 3) {
        this.update_widget(skew_line.geometry.vertices[1]);
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
        scene.add(skew_line);
        return skew_line;
    }        
}
axis_widget.prototype.update_widget = function(origin, params) {
    var origin_x_offset, origin_y_offset, origin_z_offset;
    params = params || {}; //check for null val.
    params.radius = params.radius || 0.05;
    params.height = params.height || 2;    
    x_pick_box.position = new THREE.Vector3().copy(origin);
    x_pick_box.position.x += params.height;
    y_pick_box.position = new THREE.Vector3().copy(origin);
    y_pick_box.position.y += params.height;
    z_pick_box.position = new THREE.Vector3().copy(origin);
    z_pick_box.position.z += params.height;
    //toDo: refactor to something cleaner.
    origin_x_offset = new THREE.Vector3().copy(origin).add(new THREE.Vector3(250,0,0));
    origin_y_offset = new THREE.Vector3().copy(origin).add(new THREE.Vector3(0,250,0));
    origin_z_offset = new THREE.Vector3().copy(origin).add(new THREE.Vector3(0,0,250));
    this.x_axis_line.geometry.vertices[0].copy(origin);
    this.x_axis_line.geometry.vertices[1] = origin_x_offset;    
    this.y_axis_line.geometry.vertices[0].copy(origin);
    this.y_axis_line.geometry.vertices[1] = origin_y_offset;
    this.z_axis_line.geometry.vertices[0].copy(origin);
    this.z_axis_line.geometry.vertices[1] = origin_z_offset;
    this.x_axis_line.geometry.verticesNeedUpdate = true;
    this.y_axis_line.geometry.verticesNeedUpdate = true;
    this.z_axis_line.geometry.verticesNeedUpdate = true;        
}
axis_widget.prototype.make_line_equation = function(line) {
	//console.log("make line: ", line);
    var offset, vector;
    offset = new THREE.Vector3();
    offset.copy(line.geometry.vertices[0]);        
    vector = new THREE.Vector3().copy(line.geometry.vertices[1]);
    vector.sub(offset);
    return [offset, vector];        
}
axis_widget.prototype.solve_eq_sys = function (v1, v2, b) {
    var a = $M([ [v1.x, v2.x, b.x],
                 [v1.y, v2.y, b.y], 
                 [v1.z, v2.z, b.z] ]);
    var a = a.toRightTriangular();
    var sol_y = a.e(2,3)/a.e(2,2);
    var sol_x = (a.e(1,3) - a.e(1,2)*sol_y)/a.e(1,1);
    return [sol_x, sol_y];        
}

x = new axis_widget({name: "x"});
x.init();

w = new axis_widget({name: "w"});
w.init();




/*
y = axis_widget();
y.init();

z = axis_widget();
z.init(); */
initRenderer();
animate();

THREE.Line.prototype.length = function() {
    if (this instanceof THREE.Line) {
        a = new THREE.Vector3().copy(this.geometry.vertices[0]);        
        a.sub(this.geometry.vertices[1]);
        return a.length();
    }
}