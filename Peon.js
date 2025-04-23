import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'
import { MathUtils } from '../libs/three.module.js';
import { Guante } from './Guante.js';

class Peon extends THREE.Object3D {
	constructor(gui, titleGui) {
		super();
		this.createGUI(gui, titleGui);

		const material = new THREE.MeshNormalMaterial();
		const evaluador = new CSG.Evaluator();

		// Cuerpo
		this.shape = new THREE.Shape();
		this.shape.moveTo(0, 0);
		this.shape.lineTo(1, 0);
		this.shape.quadraticCurveTo(0.96, 0.21, 0.75, 0.19);
		this.shape.quadraticCurveTo(1, 0.29, 0.75, 0.4);
		this.shape.quadraticCurveTo(0.46, 0.8, 0.5, 1.3);
		this.shape.quadraticCurveTo(0.8, 1.39, 0.5, 1.5);
		this.shape.lineTo(0, 1.5);
		this.shape.lineTo(0, 0);

		this.geometry = new THREE.LatheGeometry(this.shape.getPoints(20), 30, 0, Math.PI * 2);
		this.geometry.scale(1, 1.25, 1);
		this.shapeBrush = new CSG.Brush(this.geometry, material);

		// Cabeza
		this.esferaGeo = new THREE.SphereGeometry(0.65, 100, 100);
		this.esferaGeo.translate(0, 2.25, 0);
		this.esferaBrush = new CSG.Brush(this.esferaGeo, material);

		// Unión
		this.peon = evaluador.evaluate(this.shapeBrush, this.esferaBrush, CSG.ADDITION);
		this.peon.translateX(2.25);
		this.add(this.peon);

		// Guantes
		const guantes = new Guante(gui);
		guantes.scale.set(0.4, 0.4, 0.4);
		guantes.guante.position.set(2.3, 1.62, 0)
		guantes.guante2.position.set(8.9, 1.62, 0) 
		
		this.add(guantes);
	}
	
	createGUI(gui, titleGui) {
		this.guiControls = {
			reset: () => {
				this.update();
			}
		}

		var folder = gui.addFolder(titleGui);
		folder.add(this.guiControls, 'reset').name('[ Reset ]');
	}

	update() {
	}
}

export { Peon };