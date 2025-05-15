import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'
import { MathUtils } from '../libs/three.module.js';
import { Guante } from './Guante.js';



class Alfil extends THREE.Object3D {
	constructor(isBlanca, DETAIL_LEVEL) {
		super();

		let material;
		const evaluador = new CSG.Evaluator();

		const loader = new THREE.TextureLoader();
		const bumpTexture = loader.load('./imgs/pie.png');


		if (isBlanca) {
			material = new THREE.MeshStandardMaterial({
				color: 0xFBDBB5,
				bumpMap: bumpTexture,
				bumpScale: 1,
			});
		} else {
			material = new THREE.MeshStandardMaterial({
				color: 0x222222,
				bumpMap: bumpTexture,
				bumpScale: 2,
			});
		}

		// Cuerpo
		let shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(3, 0);
		shape.lineTo(3, 0.5);
		shape.lineTo(2.5, 0, 5);
		shape.quadraticCurveTo(2.91, 0.59, 3, 1);
		shape.quadraticCurveTo(2.96, 1.5, 2.5, 1.7);
		shape.quadraticCurveTo(1.77, 1.77, 1.85, 2.5);
		shape.lineTo(1.59, 2.5);
		shape.quadraticCurveTo(0.25, 4, 0.75, 6);
		shape.lineTo(0, 6);
		shape.lineTo(0, 0);

		let geom = new THREE.LatheGeometry(shape.getPoints(), DETAIL_LEVEL);
		const cuerpo = new CSG.Brush(geom, material);

		// Cabeza
		shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(1, 0);
		shape.quadraticCurveTo(2, 0.75, 0.2, 4);
		shape.lineTo(0, 4);
		shape.lineTo(0, 0);

		geom = new THREE.LatheGeometry(shape.getPoints(), DETAIL_LEVEL);
		geom.scale(0.7, 0.7, 0.7);
		geom.translate(0, 7, 0);
		const cabeza = new CSG.Brush(geom, material);

		// Punta
		geom = new THREE.SphereGeometry(0.35, DETAIL_LEVEL, DETAIL_LEVEL);
		geom.scale(0.7, 0.7, 0.7);
		geom.translate(0, 9.9, 0);
		const esfera = new CSG.Brush(geom, material);

		// Corte
		geom = new THREE.BoxGeometry(0.35, 1.2, 2.5)
		geom.rotateZ(MathUtils.degToRad(-30));
		geom.scale(0.7, 0.7, 0.7);
		geom.translate(0.5, 9, 0);
		const corte = new CSG.Brush(geom, material);

		// Collar 1
		geom = new THREE.TorusGeometry(0.9, 0.3, DETAIL_LEVEL, DETAIL_LEVEL);
		geom.rotateX(MathUtils.degToRad(90));
		geom.translate(0, 6.25, 0);
		const collar1 = new CSG.Brush(geom, material);

		// Collar 2
		geom = new THREE.TorusGeometry(0.7, 0.3, DETAIL_LEVEL, DETAIL_LEVEL);
		geom.rotateX(MathUtils.degToRad(90));
		geom.translate(0, 6.55, 0);
		const collar2 = new CSG.Brush(geom, material);

		// Collar 3
		geom = new THREE.TorusGeometry(0.5, 0.3, DETAIL_LEVEL, DETAIL_LEVEL);
		geom.rotateX(MathUtils.degToRad(90));
		geom.scale(1.1, 0.35, 1.1);
		geom.translate(0, 6.9, 0);
		const collar3 = new CSG.Brush(geom, material);

		// Unión
		let alfil = evaluador.evaluate(cabeza, esfera, CSG.ADDITION);
		alfil = evaluador.evaluate(alfil, corte, CSG.SUBTRACTION);
		alfil = evaluador.evaluate(cuerpo, alfil, CSG.ADDITION);

		alfil = evaluador.evaluate(alfil, collar1, CSG.ADDITION);
		alfil = evaluador.evaluate(alfil, collar2, CSG.ADDITION);
		alfil = evaluador.evaluate(alfil, collar3, CSG.ADDITION);

		//this.add(alfil);
		const geomAlfil = alfil.geometry
		const meshAlfil = new THREE.Mesh(geomAlfil, material);
		this.add(meshAlfil);

		// Guantes
		const guantes = new Guante(isBlanca, DETAIL_LEVEL);
		guantes.rotation.set(0, MathUtils.degToRad(90), 0);
		guantes.guante.position.set(-3.5, 3, 0)
		guantes.guante2.position.set(3.5, 3, 0)
		
		this.add(guantes);
	}

	getMovimientos(casillaActual, casillasOcupadas) {
		const [x, y] = casillaActual;
		const movimientos = [];
	
		// Direcciones diagonales: [dx, dy]
		const direcciones = [
			[1, 1],   // Diagonal abajo-derecha
			[-1, -1], // Diagonal arriba-izquierda
			[1, -1],  // Diagonal abajo-izquierda
			[-1, 1]   // Diagonal arriba-derecha
		];
	
		for (const [dx, dy] of direcciones) {
			let i = x + dx;
			let j = y + dy;
	
			// Continuar en la dirección mientras esté dentro del tablero
			while (i >= 0 && i < 8 && j >= 0 && j < 8) {
				const casilla = [i, j];
	
				// Si la casilla está ocupada, detener el movimiento
				if (casillasOcupadas.some(([ox, oy]) => ox === i && oy === j)) {
					movimientos.push(casilla); // Puede capturar la pieza enemiga
					break;
				}
	
				movimientos.push(casilla); // Casilla libre
				i += dx;
				j += dy;
			}
		}
	
		return movimientos;
	}
}

export { Alfil };
