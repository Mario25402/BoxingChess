import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'
import { Guante } from './Guante.js';



class Torre extends THREE.Object3D {
	constructor(gui, titleGui, DETAIL_LEVEL) {
		super();

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
		this.shape.lineTo(0.5, 2);
		this.shape.lineTo(0, 2);
		this.shape.lineTo(0, 0);

		this.geometry = new THREE.LatheGeometry(this.shape.getPoints(20), DETAIL_LEVEL, 0, Math.PI * 2);
		this.geometry.scale(1, 1.5, 1);

		// Hueco Arriba
		this.cilindroGeo = new THREE.CylinderGeometry(0.4, 0.4, 1, DETAIL_LEVEL);
		this.cilindroGeo.translate(0, 3, 0);

		// Escalón 1
		this.boxGeo = new THREE.BoxGeometry(0.15, 0.6, 1.2);
		this.boxGeo.translate(0, 3, 0);

		// Escalón 2
		this.boxGeo2 = new THREE.BoxGeometry(0.15, 0.6, 1.2);
		this.boxGeo2.translate(0, 3, 0);
		this.boxGeo2.rotateY(THREE.MathUtils.degToRad(90));

		// Escalón 3
		this.boxGeo3 = new THREE.BoxGeometry(0.15, 0.6, 1.2);
		this.boxGeo3.translate(0, 3, 0);
		this.boxGeo3.rotateY(THREE.MathUtils.degToRad(45));

		// Escalón 4
		this.boxGeo4 = new THREE.BoxGeometry(0.15, 0.6, 1.2);
		this.boxGeo4.translate(0, 3, 0);
		this.boxGeo4.rotateY(THREE.MathUtils.degToRad(-45));

		// Brush
		this.cilinBrush = new CSG.Brush(this.cilindroGeo, material);
		this.shapeBrush = new CSG.Brush(this.geometry, material);
		this.boxBrush = new CSG.Brush(this.boxGeo, material);
		this.boxBrush2 = new CSG.Brush(this.boxGeo2, material);
		this.boxBrush3 = new CSG.Brush(this.boxGeo3, material);
		this.boxBrush4 = new CSG.Brush(this.boxGeo4, material);

		// Unión
		this.agujero = evaluador.evaluate(this.shapeBrush, this.cilinBrush, CSG.SUBTRACTION);
		this.agujero2 = evaluador.evaluate(this.agujero, this.boxBrush, CSG.SUBTRACTION);
		this.agujero3 = evaluador.evaluate(this.agujero2, this.boxBrush2, CSG.SUBTRACTION);
		this.agujero4 = evaluador.evaluate(this.agujero3, this.boxBrush3, CSG.SUBTRACTION);
		this.result = evaluador.evaluate(this.agujero4, this.boxBrush4, CSG.SUBTRACTION);

		this.add(this.result);

		// Guantes
		const guantes = new Guante(DETAIL_LEVEL);
		guantes.scale.set(0.4, 0.4, 0.4);
		guantes.guante.position.set(-3.5, 2.2, 0)
		guantes.guante2.position.set(3.5, 2.2, 0) 
		
		this.add(guantes);
	}
}

export { Torre };