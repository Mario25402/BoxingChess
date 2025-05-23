import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'
import { MathUtils } from '../libs/three.module.js';
import { Guante } from './Guante.js';



class Rey extends THREE.Object3D {
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
		}

		else {
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
		shape.quadraticCurveTo(3.02, 1.59, 2, 2)
		shape.quadraticCurveTo(1.02, 3.88, 1, 6)
		shape.lineTo(1.5, 6.3)
		shape.lineTo(1.5, 6.7)
		shape.lineTo(1, 7)
		shape.quadraticCurveTo(1, 7.32, 1.14, 8)
		shape.lineTo(1.25, 8)
		shape.lineTo(1.25, 8.25)
		shape.lineTo(0, 8.25)
		shape.lineTo(0, 0)

		let geom = new THREE.LatheGeometry(shape.getPoints(), DETAIL_LEVEL)
		const cuerpo = new CSG.Brush(geom, material)

		// Cuello
		geom = new THREE.CylinderGeometry(1.5, 1, 1.25, DETAIL_LEVEL)
		geom.translate(0, 8.875, 0)
		const cuello = new CSG.Brush(geom, material)

		// Anillo
		geom = new THREE.TorusGeometry(0.5, 0.1, DETAIL_LEVEL, DETAIL_LEVEL);
		geom.rotateX(MathUtils.degToRad(90));
		geom.scale(0.8, 0.8, 0.8)
		geom.translate(0, 9.5, 0)
		const anillo = new CSG.Brush(geom, material)

		// Cruz
		shape = new THREE.Shape()
		shape.moveTo(0, 0);
		shape.lineTo(0.5, 0);
		shape.quadraticCurveTo(0.24, 0.47, 0.2, 1)
		shape.lineTo(0, 1);
		shape.lineTo(0, 0);

		geom = new THREE.LatheGeometry(shape.getPoints(), DETAIL_LEVEL)
		geom.scale(0.8, 0.8, 0.8)

		const aspa1 = geom.clone()
		const aspa2 = geom.clone()
		const aspa3 = geom.clone()

		geom.translate(0, 9.4, 0)
		const aspaDown = new CSG.Brush(geom, material)

		aspa1.rotateZ(MathUtils.degToRad(90))
		aspa1.translate(0.9, 10.3, 0)
		const aspaDer = new CSG.Brush(aspa1, material)

		aspa2.rotateZ(MathUtils.degToRad(-90))
		aspa2.translate(-0.9, 10.3, 0)
		const aspaIzq = new CSG.Brush(aspa2, material)

		aspa3.rotateZ(MathUtils.degToRad(180))
		aspa3.translate(0, 11.2, 0)
		const aspaUp = new CSG.Brush(aspa3, material)

		geom = new THREE.SphereGeometry(0.25)
		geom.translate(0, 10.3, 0)
		const esfera = new CSG.Brush(geom, material)

		// Unión 
		let cruz = evaluador.evaluate(aspaDown, anillo, CSG.ADDITION);
		cruz = evaluador.evaluate(cruz, aspaDer, CSG.ADDITION);
		cruz = evaluador.evaluate(cruz, aspaIzq, CSG.ADDITION);
		cruz = evaluador.evaluate(cruz, aspaUp, CSG.ADDITION);
		cruz = evaluador.evaluate(cruz, esfera, CSG.ADDITION);

		let rey = evaluador.evaluate(cuerpo, cuello, CSG.ADDITION);
		rey = evaluador.evaluate(rey, cruz, CSG.ADDITION);

		// Convertir el resultado de CSG a THREE.Mesh para poder cambiar el color
		const geomRey = rey.geometry;
		geomRey.rotateY(MathUtils.degToRad(90));
		const meshRey = new THREE.Mesh(geomRey, material);
		this.add(meshRey);

		// Guantes
		const guantes = new Guante(isBlanca, DETAIL_LEVEL);
		guantes.rotation.set(0, MathUtils.degToRad(90), 0);
		guantes.guante.position.set(-3.5, 3, 0);
		guantes.guante2.position.set(3.5, 3, 0);

		this.add(guantes);
	}

	getMovimientos(casillaActual, casillasOcupadas) {
		const [x, y] = casillaActual;
		const movimientos = [];

		// Posibles movimientos del Rey (una casilla en cualquier dirección)
		const posiblesMovimientos = [
			[x + 1, y],     // Derecha
			[x - 1, y],     // Izquierda
			[x, y + 1],     // Arriba
			[x, y - 1],     // Abajo
			[x + 1, y + 1], // Diagonal arriba-derecha
			[x - 1, y + 1], // Diagonal arriba-izquierda
			[x + 1, y - 1], // Diagonal abajo-derecha
			[x - 1, y - 1]  // Diagonal abajo-izquierda
		];

		for (const [nx, ny] of posiblesMovimientos) {
			// Verificar que el movimiento esté dentro del tablero
			if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
				// Verificar si la casilla está ocupada
				if (!casillasOcupadas.some(([ox, oy]) => ox === nx && oy === ny))
					movimientos.push([nx, ny]); // Casilla libre

				else movimientos.push([nx, ny]); // Puede capturar la pieza enemiga
			}
		}

		return movimientos;
	}
}

export { Rey };
