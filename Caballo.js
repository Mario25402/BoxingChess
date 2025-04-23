import * as THREE from '../libs/three.module.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js'

class Caballo extends THREE.Object3D {
	constructor(gui, titleGui) {
		super();
		this.createGUI(gui, titleGui);

        const material = new THREE.MeshNormalMaterial();

		var matlLoader = new MTLLoader();
		var objLoader = new OBJLoader();

		matlLoader.load('./obj/caballo.mtl', (materials) => {
			objLoader.setMaterials(materials);
			objLoader.load('./obj/caballo.obj', (object) => {
				object.position.set(0, 0, 0);
                object.scale.set(0.05, 0.05, 0.05)
				this.add(object);
			}, null, null);
		});
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
