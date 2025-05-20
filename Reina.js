import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.module.js'
import * as CSG from '../libs/three-bvh-csg.js'
import { MathUtils } from '../libs/three.module.js';
import { Guante } from './Guante.js';
import { Guan_R } from './Guan_R.js';



class Reina extends THREE.Object3D {
	constructor(isBlanca, DETAIL_LEVEL) {
		super();

		let material;
		const alturaCuerpo = 8.25;
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
		shape.lineTo(1.25, alturaCuerpo)
		shape.lineTo(0, alturaCuerpo)
		shape.lineTo(0, 0)

		let geom = new THREE.LatheGeometry(shape.getPoints(), DETAIL_LEVEL)
		const cuerpo = new CSG.Brush(geom, material)

		// Cuello
		shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(1, 0);
		shape.quadraticCurveTo(1.10, 0.5, 1.6, 0.8);
		shape.lineTo(1.4, 0.8);
		shape.lineTo(1, 0.5);
		shape.lineTo(0, 0.5)

		geom = new THREE.LatheGeometry(shape.getPoints(), DETAIL_LEVEL);
		geom.translate(0, alturaCuerpo, 0)
		const cuello = new CSG.Brush(geom, material);

		// Borde Cuello
		shape = new THREE.Shape();
		shape.absarc(0, 0, 0.15, 0, Math.PI * 2, false);

		const puntos = [];
		const radio = 1.5;
		const amplitud = 0;
		const frecuencia = 6;
		const numPuntos = 100;

		for (let i = 0; i <= numPuntos; i++) {
			const angulo = (i / numPuntos) * Math.PI * 2;
			const x = Math.cos(angulo) * (radio + amplitud * Math.sin(frecuencia * angulo));
			const y = Math.sin(angulo) * (radio + amplitud * Math.sin(frecuencia * angulo));
			const z = 0.1 * Math.sin(angulo * frecuencia);

			puntos.push(new THREE.Vector3(x, y, z));
		}

		const path = new THREE.CatmullRomCurve3(puntos, true);
		const opt = {
			steps: numPuntos,
			curveSegments: 16,
			extrudePath: path
		};

		geom = new THREE.ExtrudeGeometry(shape, opt);
		geom.rotateX(MathUtils.degToRad(90));
		geom.translate(0, 0.8 + alturaCuerpo, 0);
		const bordeCuello = new CSG.Brush(geom, material);

		// Esfera Grande
		geom = new THREE.SphereGeometry(1.1);
		geom.translate(0, 0.7 + alturaCuerpo, 0);
		const esferaGrande = new CSG.Brush(geom, material);

		// Esfera Pequeña
		geom = new THREE.SphereGeometry(0.3);
		geom.translate(0, 1.95 + alturaCuerpo, 0);
		const esferaPequeña = new CSG.Brush(geom, material);

		// Unión
		let reina = evaluador.evaluate(cuello, bordeCuello, CSG.ADDITION);
		reina = evaluador.evaluate(reina, esferaGrande, CSG.ADDITION);
		reina = evaluador.evaluate(reina, esferaPequeña, CSG.ADDITION);
		reina = evaluador.evaluate(reina, cuerpo, CSG.ADDITION);

		const geomReina = reina.geometry;
		const meshReina = new THREE.Mesh(geomReina, material);
		this.add(meshReina);

		// Brazos
		const brazoIzq = new Guan_R(isBlanca, DETAIL_LEVEL);
		brazoIzq.position.set(0, 6.25, 0.75);
		brazoIzq.scale.set(-0.5, 0.5, 0.5);
		brazoIzq.rotation.x = MathUtils.degToRad(-22);

		const brazoDer = new Guan_R(isBlanca, DETAIL_LEVEL);
		brazoDer.position.set(0, 6.25, -0.75);
		brazoDer.scale.set(0.5, 0.5, 0.5);
		brazoDer.rotation.y = Math.PI;
		brazoDer.rotation.x = MathUtils.degToRad(22);

		this.add(brazoIzq);
		this.add(brazoDer);

		// Acceso rapido desde otras clases
		this.brazoIzq = brazoIzq;
		this.brazoDer = brazoDer;

	}

	getMovimientos(casillaActual, casillasOcupadas) {
		const [x, y] = casillaActual;
		const movimientos = [];

		// Direcciones posibles: combinando Torre (líneas rectas) y Alfil (diagonales)
		const direcciones = [
			[1, 0],   // Abajo
			[-1, 0],  // Arriba
			[0, 1],   // Derecha
			[0, -1],  // Izquierda
			[1, 1],   // Diagonal abajo-derecha
			[-1, -1], // Diagonal arriba-izquierda
			[1, -1],  // Diagonal abajo-izquierda
			[-1, 1]   // Diagonal arriba-derecha
		];

		for (const [dx, dy] of direcciones) {
			let i = x + dx;
			let j = y + dy;

			while (i >= 0 && i < 8 && j >= 0 && j < 8) {
				const casilla = [i, j];

				// Si la casilla está ocupada, detener el movimiento
				if (casillasOcupadas.some(([ox, oy]) => ox === i && oy === j)) {
					movimientos.push(casilla); // Puede capturar la pieza enemiga
					break;
				}

				movimientos.push(casilla);
				i += dx;
				j += dy;
			}
		}

		return movimientos;
	}

	animarGolpe(onGolpeCompleto) {
		const brazo = this.brazoDer;
		if (!brazo) return;

		const hombro = brazo.pivoteHombro;
		const codo = brazo.pivoteCodo;

		const rotHombroIniY = hombro.rotation.y;
		const rotHombroIniZ = hombro.rotation.z;
		const rotCodoIni = codo.rotation.x;
		const rotCodoIniY = codo.rotation.y;

		// 1. Sube el brazo a -90° en Z (posición horizontal)
		const subir = new TWEEN.Tween({ z: rotHombroIniZ })
			.to({ z: -Math.PI / 2 }, 500)
			.onUpdate(({ z }) => {
				hombro.rotation.z = z;
				this.brazoIzq.repaint();
				this.brazoDer.repaint();
			});

		// 2. Echa el brazo para atrás en Y
		const atras = new TWEEN.Tween({ y: rotHombroIniY, c: rotCodoIni, yc: rotCodoIniY })
			.to({
				y: THREE.MathUtils.degToRad(40),
				c: THREE.MathUtils.degToRad(20),
				yc: THREE.MathUtils.degToRad(100)
			}, 700)
			.onUpdate(({ y, c, yc }) => {
				hombro.rotation.y = y;
				codo.rotation.x = c;
				codo.rotation.y = yc;
			});

		// 3. Puñetazo: vuelve el brazo hacia adelante en Y y flexiona el codo
		const punetazo = new TWEEN.Tween({ y: THREE.MathUtils.degToRad(40), c: THREE.MathUtils.degToRad(20) })
			.to({
				y: rotHombroIniY - 0.25,
				c: THREE.MathUtils.degToRad(-10)
			}, 400)
			.onUpdate(({ y, c }) => {
				hombro.rotation.y = y;
				codo.rotation.x = c;
			})
			.onComplete(() => {
				if (typeof onGolpeCompleto === "function") onGolpeCompleto();
			});

		// 4. Regresa a la posición original (Y, C, Z)
		const regreso = new TWEEN.Tween({
			y: rotHombroIniY - 0.25,
			z: -Math.PI / 2,
			c: THREE.MathUtils.degToRad(-10),
			yc: codo.rotation.y
		})
			.to({
				y: rotHombroIniY,
				z: rotHombroIniZ,
				c: rotCodoIni,
				yc: rotCodoIniY
			}, 1000)
			.onUpdate(({ y, z, c, yc }) => {
				hombro.rotation.y = y;
				hombro.rotation.z = z;
				codo.rotation.x = c;
				codo.rotation.y = yc;
			});


		subir.chain(atras);
		atras.chain(punetazo);
		punetazo.chain(regreso);
		subir.start();
	}
}

export { Reina };
