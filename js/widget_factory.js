/*
WIDGET FACTORY API:
make_widget()
remove_widget()

Widget methods:
getDescendents (needed for intersection testing)

PRIVATE METHODS:
shoot_ray(target_line)
build_skew_line(L1, L2)
	find_candidate_solution(L1, L2)
	check_candidate_solution(sol, right_hand_side)
	solve_eq_sys(v1, v2, b)
init_widget();
update(origin, params);
lock_cam() -- replace w. controls.enabled = true/false
intersect_plane(target_plane)
make_line_equation(line)

AUGMENTED:
THREE.Line.prototype.length = function() {

LISTENERS:
mousemove,
mousedown,
mouseup
*/

var projector;
var mouse_button_pressed = false;
var sliding_axis; //keeps track of which, if any, axis we are alowed to move along. 
var mouse = {x:0, y:0}, INTERSECTED;
//var intersects;
var w,x; 
//var x_axis_line, y_axis_line, z_axis_line;
//var x_pick_box, y_pick_box, z_pick_box;
initCamScene();
initRenderer();
animate();

projector = new THREE.Projector();

function WIDGET_FACTORY() {
	//this.widgets = [];  --why is this not a publically accesible var?
};
WIDGET_FACTORY.widgets = [];
WIDGET_FACTORY.update = function() {
	var private = "private";
	function shoot_ray() {
		console.log(private);
	};
	shoot_ray();
}
WIDGET_FACTORY.start_factory = function() {
	return WIDGET_FACTORY;
}
WIDGET_FACTORY.mouse_over_widget = null;
WIDGET_FACTORY.intersected_widget = null;
WIDGET_FACTORY.make_widget = function(origin, params) {
	var widget = {};
	widget.origin = origin || new THREE.Vector3(0,0,0);
	widget.params = params || {};
	widget.params.radius = widget.params.radius || 0.05;
    widget.params.height = widget.params.height || 2; 
	this.widgets.push(widget);	
	var that = widget;
	init_widget();
	widget.getDescendants = function() {
		return [that.x_pick_box, that.y_pick_box, that.z_pick_box];
	}
	widget.intersected = function(m) {
		return this.getDescendants().indexOf(m) > - 1 ? true : false;
	}
	function init_widget() {
		var axis_lines, axis_pick_boxes;
		that.axis_lines = make_widget_axis_lines();	//useful to have axis_lines for updating all three at once: axis_lines.position = new ...
		that.x_axis = that.axis_lines.children[0];
		that.y_axis = that.axis_lines.children[1];
		that.z_axis = that.axis_lines.children[2];
		that.axis_lines.position = widget.origin;
		scene.add(that.axis_lines);
		axis_pick_boxes = make_widget_pick_boxes();
	}	
	function make_widget_axis_lines() {
	    var line_axis_obj = new THREE.Object3D();
	    var x_axis_line, y_axis_line, z_axis_line;
	    x_axis_line = make_axis_line(new THREE.Vector3(0.5,0,0),new THREE.Vector3(4,0,0), 0x880000, "x axis line");
	    y_axis_line = make_axis_line(new THREE.Vector3(0,0.5,0), new THREE.Vector3(0,4,0), 0x008800, "y axis line");
	    z_axis_line = make_axis_line(new THREE.Vector3(0,0,0.5), new THREE.Vector3(0,0,4), 0x000088, "z axis line");
	    line_axis_obj.add(x_axis_line);
	    line_axis_obj.add(y_axis_line);
	    line_axis_obj.add(z_axis_line);
	    return(line_axis_obj);  		
	}
	function make_axis_line(v1, v2, col, name) {
		var geom = new THREE.Geometry();
		var mat = new THREE.LineBasicMaterial({color: col});
		geom.vertices = [v1, v2];
		var L = new THREE.Line(geom, mat);
		L.axis = "name";
		return L;
	}
	function make_widget_pick_boxes() {
		var x_pick_box, y_pick_box, z_pick_box, pos;
		that.x_pick_box = make_pick_box(0xff9999, widget.params, "x pick box");
	    that.x_pick_box.rotation.z -= 90 * Math.PI / 180;
	    that.x_pick_box.position.x += that.params.height / 1.0;
	    that.x_pick_box.position.add(that.origin);
	    scene.add(that.x_pick_box);		
	 	that.y_pick_box = make_pick_box(0x99ff99, widget.params, "y pick box");
	    that.y_pick_box.rotation.y += 90 * Math.PI / 180;
	    that.y_pick_box.position.y += widget.params.height;
	    that.y_pick_box.position.add(that.origin);
	    scene.add(that.y_pick_box);
	    that.z_pick_box = make_pick_box(0x9999ff, widget.params, "z pick box");
	    that.z_pick_box.rotation.x += 90 * Math.PI / 180;     
	    that.z_pick_box.rotation.y += 90 * Math.PI / 180;  
	    that.z_pick_box.position.z += widget.params.height;
	    that.z_pick_box.position.add(that.origin);
	    scene.add(that.z_pick_box);   
	}
	function make_pick_box(col, params, name) {
		var mat = new THREE.MeshBasicMaterial({color:col, transparent: true, opacity: 0.7});
    	var wireframe_mat = new THREE.MeshBasicMaterial({color:col, wireframe:true, transparency: true, opacity: 0.7});
	    var geom = new THREE.CubeGeometry(0.05 * params.height, 1.5 * params.height, 0.5 * params.height);
	    var pick_cube = new THREE.Mesh(geom, mat);
	    pick_cube.add(new THREE.Mesh(geom, wireframe_mat));
	    pick_cube.axis = name;
	    pick_cube.widget = that; // this creates a double link. 
	    return pick_cube;    	
	}
	return widget;
}
WIDGET_FACTORY.remove_widget = function(w)  {
	this.widgets.splice(this.widgets.indexOf(w),1);
	return this.widgets
}
WIDGET_FACTORY.shootRay = function() {
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    vector.sub(camera.position);
    var geom = new THREE.Geometry();
    geom.vertices = [new THREE.Vector3().copy(vector), new THREE.Vector3().copy(camera.position)]
    	//change this to vec3:
	    var mat = new THREE.LineBasicMaterial({color:0xffff00});
	    var l = new THREE.Line(geom, mat);
    scene.add(l);    
    //build_skew_line(l, targ_line);    
}

////

function mousedown(event) { //better way to do this than using sliding_axis?
    mouse_button_pressed = true;

    if (INTERSECTED) { //INTERSECTED stores the MESH that is currently picked, but we need the WIDGET that the mesh is a part of:
    	WIDGET_FACTORY.widgets.forEach(function(w){ //get that widget!    		
    		if (w.intersected(INTERSECTED)) {
				WIDGET_FACTORY.intersected_widget = w;
				//console.log(w);
    		}
    	})
    	controls.enabled = false;
        if (INTERSECTED.currentHex == 16751001) { //Red = x Axis
            controls.enabled = false;
            //shootRay(intersected_widget, intersected_widget.x_axis);    
           // sliding_axis = x_axis_line;
        } else if (INTERSECTED.currentHex == 10092441) { //Green = y axis
            //shootRay(y_axis_line);
            //sliding_axis = y_axis_line;
        } else if (INTERSECTED.currentHex == 10066431) { //Blue = z Axis
            WIDGET_FACTORY.shootRay(WIDGET_FACTORY.intersected_widget, WIDGET_FACTORY.intersected_widget.z_axis);    
            //sliding_axis = z_axis_line;            
        }
    } else {
        controls.enabled = true;
        WIDGET_FACTORY.intersected_widget = null;
    }    
}
function check_for_intersection() {
	var vector, raycaster, intersects;
	vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );
	raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize());
	var intersects = raycaster.intersectObjects(WIDGET_FACTORY.widgets, true);
	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[ 0 ].object ) {
			if ( INTERSECTED ) 
				INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
			INTERSECTED.material.color.setHex( 0xffff00 );
			//plane.position.copy( INTERSECTED.position );
			//plane.lookAt( camera.position );
			}
		} else {
		    if ( INTERSECTED ) 
            	INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        	INTERSECTED = null;		
	}
	//console.log(INTERSECTED);
	return INTERSECTED;
}

function mousemove( event ) {
    check_for_intersection();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    if (mouse_button_pressed && sliding_axis) {
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
////
THREE.Line.prototype.length = function() {
    if (this instanceof THREE.Line) {
        a = new THREE.Vector3().copy(this.geometry.vertices[0]);        
        a.sub(this.geometry.vertices[1]);
        return a.length();
    }
}
////
var a = new THREE.Vector3(1,2,3);
var b = new THREE.Vector3(5,5,5);
var w = WIDGET_FACTORY.start_factory();
var x = w.make_widget(a);
var y = w.make_widget(b);