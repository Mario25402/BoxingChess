import * as THREE from '../libs/three.module.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import { Guante } from './Guante.js';

class Caballo extends THREE.Object3D {
	constructor(gui, titleGui, DETAIL_LEVEL) {
		super();
		this.createGUI(gui, titleGui);

        const material = new THREE.MeshNormalMaterial();

		var objLoader = new OBJLoader();

		objLoader.load('./obj/caballo.obj', (object) => {
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
		const guantes = new Guante(gui, 'Guantes', DETAIL_LEVEL);
		guantes.scale.set(0.4, 0.4, 0.4);
		//guantes.position.set(0, THREE.MathUtils.degToRad(90), 0);
		guantes.rotateY(THREE.MathUtils.degToRad(-90));
		guantes.guante.position.set(-3, 2.2, -1)
		guantes.guante2.position.set(3, 2.2, -1) 
		
		this.add(guantes);
	}

	createGUI(gui, titleGui) {
		this.guiControls = {
			reset: () => {
				this.guiControls.animate = false;

				this.update();
			}
		}
		var folder = gui.addFolder(titleGui);
		folder.add(this.guiControls, 'reset').name('[ Reset ]');
	}

	update() {
	}
}

export { Caballo };
