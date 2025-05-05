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

	getMovimientos(casillaActual, casillasOcupadas) {
		const [x, y] = casillaActual;
		const movimientos = [];
	
		// Posibles movimientos en forma de "L"
		const posiblesMovimientos = [
			[x + 2, y + 1], // Abajo-derecha
			[x + 2, y - 1], // Abajo-izquierda
			[x - 2, y + 1], // Arriba-derecha
			[x - 2, y - 1], // Arriba-izquierda
			[x + 1, y + 2], // Derecha-abajo
			[x + 1, y - 2], // Derecha-arriba
			[x - 1, y + 2], // Izquierda-abajo
			[x - 1, y - 2]  // Izquierda-arriba
		];
	
		for (const [nx, ny] of posiblesMovimientos) {
			// Verificar que el movimiento esté dentro del tablero
			if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
				// Verificar si la casilla está ocupada
				if (!casillasOcupadas.some(([ox, oy]) => ox === nx && oy === ny)) {
					movimientos.push([nx, ny]); // Casilla libre
				} else {
					movimientos.push([nx, ny]); // Puede capturar la pieza enemiga
				}
			}
		}
	
		return movimientos;
	}
}

export { Caballo };
