function star_background(number_of_stars) {
	this.number_of_star = number_of_stars || 200	
	this.material = new THREE.ParticleBasicMaterial(
										{size: 0.5, sizeAttenuation: false, color: 0xffeeee, fog: false})
	this.geometry = new THREE.Geometry();
	init_geometry(this.geometry)	
	init_background(this.geometry, this.material)


}

star_background.prototype.update_position = function(new_pos) {
		this.geometry.vertices.forEach(function (pos) {
			pos.add(new_pos)
		});
		this.geometry.verticesNeedUpdate = true		
	}
var init_geometry = function(g) {
	var g = this.geometry
		var v = g.vertices
		for (var i = 0; i < 200; i++) {
			var temp = new THREE.Vector3(2*Math.random()-1, 2*Math.random()-1, 2*Math.random()-1)
			temp.normalize()
			temp.multiplyScalar(500)
			v.push(temp)
		}
	return g		
}
var init_background = function(geom, mat) {
	scene.add(new THREE.ParticleSystem(geom, mat))
}

var background
background = star_background(200)