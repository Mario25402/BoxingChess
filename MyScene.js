
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import Stats from '../libs/stats.module.js'

// Clases de mi proyecto

import { Tablero } from './Tablero.js'
import { Casilla } from './Casilla.js'
import { Pieza } from './Pieza.js'


/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
	constructor(myCanvas) {
		super();

		this.renderer = this.createRenderer(myCanvas);
		this.golpeCameraMode = "ninguna"; // Inicializa la cámara de golpe en modo "ninguna"
		this.capturadasBlancas = 0;
		this.capturadasNegras = 0;

		this.gui = this.createGUI();
		this.initStats();

		// Raycaster y vector del ratón
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		this.selectedPiece = null;
		this.turnoBlancas = true;
		this.oponente = null

		// Eventos
		window.addEventListener('click', (event) => this.onMouseClick(event));
		window.addEventListener('contextmenu', (event) => this.onRightClick(event));

		this.createLights();
		this.createCameras();
		this.update();

		this.axis = new THREE.AxesHelper(2);
		this.add(this.axis);

		let tablero = new Tablero();
		tablero.position.set(-3.5, 0, -3.5);
		this.add(tablero);

		this.activeCamera = this.cameraBlancas;
	}

	initStats() {
		var stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms

		// Align top-left
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';

		$("#Stats-output").append(stats.domElement);
		this.stats = stats;
	}

	terminarMovimiento() {
		// Restaurar el color de la pieza
		this.selectedPiece.traverse((child) => {
			if (child.isMesh && child.material.color) {
				child.material.color.set(this.selectedPiece.originalColor);
			}
		});

		this.selectedPiece = null; // Deseleccionar la pieza
	}

	onMouseClick(event) {
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = 1 - 2 * (event.clientY / window.innerHeight);

		this.raycaster.setFromCamera(this.mouse, this.activeCamera);

		// Recopilar todos los objetos detectables
		const objetosDetectables = [];
		this.traverse((child) => {
			if (child.isMesh) {
				// Si es una pieza y está capturada, no se añade
				let piezaPadre = child;
				while (piezaPadre && !(piezaPadre instanceof Pieza)) {
					piezaPadre = piezaPadre.parent;
				}

				if (piezaPadre && piezaPadre.userData.capturada) return;
				objetosDetectables.push(child);
			}
		});

		const intersects = this.raycaster.intersectObjects(objetosDetectables, true);

		if (intersects.length > 0) {
			const pickedObject = intersects[0].object;

			// Verificar si el objeto pertenece a una pieza
			let currentObject = pickedObject;
			while (currentObject && !(currentObject instanceof Pieza)) {
				currentObject = currentObject.parent;
			}

			if (currentObject instanceof Pieza) {
				// Verificar si la pieza pertenece al equipo del turno actual
				if (currentObject.isBlanca !== this.turnoBlancas) return;

				// Restaurar el color de la pieza previamente seleccionada
				if (this.selectedPiece) this.terminarMovimiento();

				// Guardar la pieza seleccionada
				this.selectedPiece = currentObject;
				this.selectedPiece.originalColor = null;

				// Cambiar el color de la nueva pieza seleccionada
				this.selectedPiece.traverse((child) => {
					if (child.isMesh && child.material && child.material.color) {
						// Guardar el color original si no está guardado
						if (!this.selectedPiece.originalColor)
							this.selectedPiece.originalColor = child.material.color.getHex();

						if (this.selectedPiece.originalColor == 0x222222)
							child.material.color.set(0x0000ff);

						else child.material.color.set(0xff0000);
					}

					// Restaurar el color de las casillas
					this.children[13].repaint();
				});
			}
		}

		// Si no hay intersecciones (se pulsa el fondo)
		else {
			if (this.selectedPiece) {
				// Restaurar el color de la pieza seleccionada
				this.terminarMovimiento();

				// Restaurar el color de las casillas
				this.children[13].repaint();
			}
		}

		// Mostrar posibles movimientos de la pieza seleccionada
		if (this.selectedPiece) {
			this.movimientosVerdes = this.children[13].getPosiblesMovimientos(this.selectedPiece);
		}
	}

	onRightClick(event) {
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = 1 - 2 * (event.clientY / window.innerHeight);

		this.raycaster.setFromCamera(this.mouse, this.activeCamera);

		// Recopilar todas las casillas del tablero
		const casillas = [];
		this.traverse((child) => {
			if (child instanceof Casilla)
				casillas.push(child);
		});

		// Detectar intersecciones con las casillas
		const intersects = this.raycaster.intersectObjects(casillas, true);

		if (intersects.length > 0) {
			const pickedObject = intersects[0].object;

			// Si es una pieza, escoger su casilla
			let currentCasilla = pickedObject;
			while (currentCasilla && !(currentCasilla instanceof Casilla)) {
				currentCasilla = currentCasilla.parent;
			}

			if (currentCasilla instanceof Casilla) {
				// Verificar si la casilla está en los movimientos verdes
				const esCasillaValida = this.movimientosVerdes.some(
					(casilla) => casilla[0] === currentCasilla.posI && casilla[1] === currentCasilla.posJ
				);

				if (esCasillaValida) {
					// Verificar si hay una pieza que se va a comer
					if (currentCasilla.pieza && (currentCasilla.pieza.isBlanca !== this.turnoBlancas))
						this.oponente = currentCasilla.pieza;

					else this.oponente = null;

					// Colorear la casilla seleccionada y mover la pieza
					currentCasilla.setColorMov();
					this.selectedPiece.moveTo(currentCasilla, this);

					// Deseleccionar pieza y limpiar sus movimientos
					this.terminarMovimiento();
					this.movimientosVerdes = [];

					// Cambiar el turno al otro equipo
					this.turnoBlancas = !this.turnoBlancas;
					this.updateCamera();
				}
			}
		}
	}

	createCameras() {
		// Cámara principal
		this.cameraBlancas = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50);
		this.cameraBlancas.position.set(-12, 8, 0); // Misma posición pero 	con x negativa
		this.cameraBlancas.lookAt(new THREE.Vector3(0, 0, 0));
		this.add(this.cameraBlancas);

		this.cameraControlBlancas = new TrackballControls(this.cameraBlancas, this.renderer.domElement);
		this.cameraControlBlancas.rotateSpeed = 5;
		this.cameraControlBlancas.zoomSpeed = -2;
		this.cameraControlBlancas.panSpeed = 0.5;
		this.cameraControlBlancas.target = new THREE.Vector3(0, 0, 0);;

		// Cámara para el golpe de la reina
		this.golpeCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 50);
		this.golpeCamera.position.set(0, 2, 2); // Ajusta la posición según tu escena
		this.golpeCamera.lookAt(new THREE.Vector3(0, 0, 0));
		this.add(this.golpeCamera);

		this.activeCamera = this.cameraBlancas;
	}

	updateCamera() {
		if (this.turnoBlancas) {
			this.animacionCamara(this.activeCamera, true)
			this.spotLight.color.set(0xff0000); // Rojo para blancas
		}

		else {
			this.animacionCamara(this.activeCamera, false)
			this.spotLight.color.set(0x0000ff); // Azul para negras
			this.spotLight.power = 250;
		}
	}

	animacionCamara(camera, isBlancas) {
		const destino = isBlancas ? new THREE.Vector3(-12, 8, 0)
			: new THREE.Vector3(12, 8, 0);

		const animacion = new TWEEN.Tween(camera.position)
			.to(destino, 1500)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				camera.lookAt(new THREE.Vector3(0, 0, 0)); // Mantener la cámara mirando al centro
			})
			.start();
	}

	createGUI() {
		var gui = new GUI();
		gui.add(this, 'golpeCameraMode', ['primeraPersona', 'lateral', 'ninguna']).name('Cámara Golpe: ');
		return gui;
	}

	createLights() {
		this.ambientLight = new THREE.AmbientLight('white', 0.5);
		this.add(this.ambientLight);

		this.directinalLight = new THREE.DirectionalLight(0xffffff, 1.25);
		this.directinalLight.position.set(-(3.5 - 4.125 + 3), 3, 0);
		this.add(this.directinalLight);

		this.directinalLight.target.position.set(3.5 - 4.125, 0, 0);
		this.add(this.directinalLight.target);

		this.directinalLight2 = new THREE.DirectionalLight(0xffffff, 1.25);
		this.directinalLight2.position.set(3.5 - 4.125 + 3, 3, 0);
		this.add(this.directinalLight2);

		this.directinalLight2.target.position.set(-(3.5 - 4.125), 0, 0);
		this.add(this.directinalLight2.target);

		this.spotLight = new THREE.SpotLight(0xff0000, 250);
		this.spotLight.position.set(0, 5, 0);
		this.spotLight.power = 250;
		this.add(this.spotLight);

		this.spotLight2 = new THREE.SpotLight(0xffffff, 150);
		this.spotLight2.position.set(3.5 - 4.2 - 10, 1, 5.25);
		this.spotLight2.angle = Math.PI / 12;
		this.spotLight2.target.position.set(3.5 - 4.2 - 0, -3.45, -3); // Apunta al centro de la escena

		this.add(this.spotLight2);
		this.add(this.spotLight2.target);

		this.spotLight3 = new THREE.SpotLight(0xffffff, 150);
		this.spotLight3.position.set(-(3.5 - 4.2 - 10), 1, -5.25); // Invertimos X y Z
		this.spotLight3.angle = Math.PI / 12;
		this.spotLight3.target.position.set(-(3.5 - 4.2 - 0), -3.45, 3); // Invertimos X y Z

		this.add(this.spotLight3);
		this.add(this.spotLight3.target);

		this.spotLight.castShadow = true;
		this.directinalLight.castShadow = true;
		this.directinalLight2.castShadow = true;
	}

	setLightPower(valor) {
		this.pointLight.power = valor;
	}

	setAmbientIntensity(valor) {
		this.ambientLight.intensity = valor;
	}

	setAxisVisible(valor) {
		this.axis.visible = valor;
	}

	createRenderer(myCanvas) {
		// Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

		// Se instancia un Renderer   WebGL
		var renderer = new THREE.WebGLRenderer();

		// Se establece un color de fondo en las imágenes que genera el render
		renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

		// Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
		renderer.setSize(window.innerWidth, window.innerHeight);

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Mejor calidad

		// La visualización se muestra en el lienzo recibido
		$(myCanvas).append(renderer.domElement);

		return renderer;
	}

	setBackground(imagePath) {
		// Cargar la textura de la imagen
		const loader = new THREE.TextureLoader();
		loader.load(imagePath, (texture) => {
			// Asignar la textura como fondo de la escena
			this.background = texture;
		});
	}

	setCameraAspect(ratio) {
		// Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
		// su sistema operativo hay que actualizar el ratio de aspecto de la cámara
		this.camera.aspect = ratio;
		// Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
		this.camera.updateProjectionMatrix();
	}

	onWindowResize() {
		// Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
		// Hay que actualizar el ratio de aspecto de la cámara
		this.setCameraAspect(window.innerWidth / window.innerHeight);

		// Y también el tamaño del renderizador
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	update() {

		if (this.stats) this.stats.update();

		if (this.activeCamera === this.cameraBlancas) {
			this.cameraControlBlancas.update();
		}

		TWEEN.update();

		// Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
		this.renderer.render(this, this.activeCamera);

		// Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
		// Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
		// Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
		requestAnimationFrame(() => this.update())
	}
}

/// La función main
$(function () {

	// Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
	var scene = new MyScene("#WebGL-output");

	// Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
	window.addEventListener("resize", () => scene.onWindowResize());

	// Que no se nos olvide, la primera visualización.
	scene.update();
});
