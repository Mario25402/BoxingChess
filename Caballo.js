import * as THREE from '../libs/three.module.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import { Guante } from './Guante.js';

class Caballo extends THREE.Object3D {
	constructor(isBlanca, DETAIL_LEVEL) {
		super();

		let material;
		if (isBlanca) material = new THREE.MeshStandardMaterial({color: 0xFBDBB5});
		else material = new THREE.MeshStandardMaterial({color: 0x000000});

		var objLoader = new OBJLoader();
		objLoader.load('./obj/caballo1.obj', (object) => {
			object.traverse((child) => {
				if (child.isMesh) {
					child.material = material; // Asignar el material
				}
			});
			object.position.set(0, 0, 0);
			object.scale.set(0.05, 0.05, 0.05)
			this.add(object);
		}, null, null);

		// Guantes
		const guantes = new Guante(isBlanca, DETAIL_LEVEL);
		guantes.scale.set(0.4, 0.4, 0.4);
		guantes.rotateY(THREE.MathUtils.degToRad(-90));
		guantes.guante.position.set(-3, 2.2, -1)
		guantes.guante2.position.set(3, 2.2, -1) 
		
		this.add(guantes);
	}
}

export { Caballo };
