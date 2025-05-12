
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

		// Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
		this.renderer = this.createRenderer(myCanvas);

		// Se añade a la gui los controles para manipular los elementos de esta clase
		this.gui = this.createGUI();

		this.initStats();

		//Raycaster y vector del ratón
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.selectedPiece = null;

		// Se añade un listener para detectar el clic del ratón
		window.addEventListener('click', (event) => this.onMouseClick(event));
		window.addEventListener('contextmenu', (event) => this.onRightClick(event));

		// Construimos los distinos elementos que tendremos en la escena

		// Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
		// Tras crear cada elemento se añadirá a la escena con   this.add(variable)
		this.createLights();

		this.createCameras();

		// Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
		// Todas las unidades están en metros
		this.axis = new THREE.AxesHelper(2);
		this.add(this.axis);
		
		// Y un tablero
		let tablero = new Tablero(8, 8);
		tablero.position.set(-3.5, 0, -3.5);
		this.add(tablero);

		// Turno
		this.turnoBlancas = true;
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
	
		this.raycaster.setFromCamera(this.mouse, this.camera);
	
		// Recopilar todos los objetos detectables (incluyendo los hijos del Tablero)
		const objetosDetectables = [];
		this.traverse((child) => {
			if (child.isMesh) {
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
				if (currentObject.isBlanca !== this.turnoBlancas) {
					console.log("No es el turno de este equipo.");
					return;
				}
	
				// Restaurar el color de la pieza previamente seleccionada
				if (this.selectedPiece) {
					this.terminarMovimiento();
				}
	
				// Guardar la pieza seleccionada
				this.selectedPiece = currentObject;
				this.selectedPiece.originalColor = null;
	
				// Cambiar el color de la nueva pieza seleccionada
				this.selectedPiece.traverse((child) => {
					if (child.isMesh && child.material && child.material.color) {
						// Guardar el color original si no está guardado
						if (!this.selectedPiece.originalColor) {
							this.selectedPiece.originalColor = child.material.color.getHex();
						}
						if (this.selectedPiece.originalColor == 0x000000) {
							child.material.color.set(0x0000ff);
						} else {
							child.material.color.set(0xff0000);
						}
					}
	
					// Restaurar el color de las casillas
					this.children[5].repaint();
				});
			}
		} else {
			// Si no hay intersecciones (si se pulsa el fondo)
			if (this.selectedPiece) {
				// Restaurar el color de la pieza seleccionada
				this.terminarMovimiento();
	
				// Restaurar el color de las casillas
				this.children[5].repaint();
			}
		}
	
		// Mostrar posibles movimientos de la pieza seleccionada
		if (this.selectedPiece) {
			this.movimientosVerdes = this.children[5].getPosiblesMovimientos(this.selectedPiece);
		}
	}

	onRightClick(event) {
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = 1 - 2 * (event.clientY / window.innerHeight);
	
		this.raycaster.setFromCamera(this.mouse, this.camera);
	
		// Recopilar todas las casillas del tablero
		const casillas = [];
		this.traverse((child) => {
			if (child instanceof Casilla) {
				casillas.push(child);
			}
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
					// Colorear la casilla seleccionada y mover la pieza
					currentCasilla.setColorMov();
					this.selectedPiece.moveTo(currentCasilla, this);
	
					// Deseleccionar pieza y limpiar sus movimientos
					this.terminarMovimiento();
					this.movimientosVerdes = [];
	
					// Cambiar el turno al otro equipo
					this.turnoBlancas = !this.turnoBlancas;

					// Actualizar la cámara activa
					this.updateCamera();
				}
			}
		}
	}

	createCameras() {
		// Para crear una cámara le indicamos
		//   El ángulo del campo de visión en grados sexagesimales
		//   La razón de aspecto ancho/alto
		//   Los planos de recorte cercano y lejano
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50);
		// Recuerda: Todas las unidades están en metros
		// También se indica dónde se coloca
		this.camera.position.set(12, 8, 0);
		// Y hacia dónde mira
		var look = new THREE.Vector3(0, 0, 0);
		this.camera.lookAt(look);
		this.add(this.camera);

		this.cameraBlancas = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50);
		this.cameraBlancas.position.set(-12, 8, 0); // Misma posición pero 	con x negativa
    	this.cameraBlancas.lookAt(new THREE.Vector3(0, 0, 0));
    	this.add(this.cameraBlancas);

		// Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
		this.cameraControl = new TrackballControls(this.camera, this.renderer.domElement);
		// Se configuran las velocidades de los movimientos
		this.cameraControl.rotateSpeed = 5;
		this.cameraControl.zoomSpeed = -2;
		this.cameraControl.panSpeed = 0.5;
		// Debe orbitar con respecto al punto de mira de la cámara
		this.cameraControl.target = look;

		this.activeCamera = this.cameraBlancas;
	}

	updateCamera() {
		if (this.turnoBlancas) {
			this.activeCamera = this.cameraBlancas; // Usar la cámara de las piezas blancas
		} else {
			this.activeCamera = this.camera; // Usar la cámara de las piezas negras
		}
	}

	createGUI() {
		// Se crea la interfaz gráfica de usuario
		var gui = new GUI();

		// La escena le va a añadir sus propios controles. 
		// Se definen mediante un objeto de control
		// En este caso la intensidad de la luz y si se muestran o no los ejes
		this.guiControls = {
			// En el contexto de una función   this   alude a la función
			lightPower: 500.0,  // La potencia de esta fuente de luz se mide en lúmenes
			ambientIntensity: 0.5,
			axisOnOff: true
		}

		// Se crea una sección para los controles de esta clase
		var folder = gui.addFolder('Luz y Ejes');

		// Se le añade un control para la potencia de la luz puntual
		folder.add(this.guiControls, 'lightPower', 0, 1000, 20)
			.name('Luz puntual : ')
			.onChange((value) => this.setLightPower(value));

		// Otro para la intensidad de la luz ambiental
		folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05)
			.name('Luz ambiental: ')
			.onChange((value) => this.setAmbientIntensity(value));

		// Y otro para mostrar u ocultar los ejes
		folder.add(this.guiControls, 'axisOnOff')
			.name('Mostrar ejes : ')
			.onChange((value) => this.setAxisVisible(value));

		return gui;
	}

	createLights() {
		// Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
		// La luz ambiental solo tiene un color y una intensidad
		// Se declara como   var   y va a ser una variable local a este método
		//    se hace así puesto que no va a ser accedida desde otros métodos
		this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
		// La añadimos a la escena
		this.add(this.ambientLight);

		// Se crea una luz focal que va a ser la luz principal de la escena
		// La luz focal, además tiene una posición, y un punto de mira
		// Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
		// En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
		this.pointLight = new THREE.PointLight(0xffffff);
		this.pointLight.power = this.guiControls.lightPower;
		this.pointLight.position.set(2, 3, 1);
		this.add(this.pointLight);
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

		// La visualización se muestra en el lienzo recibido
		$(myCanvas).append(renderer.domElement);

		return renderer;
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

		// Se actualizan los elementos de la escena para cada frame

		// Se actualiza la posición de la cámara según su controlador
		this.cameraControl.update();

		// Se actualiza el resto del modelo
		TWEEN.update();

		// Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
		this.renderer.render(this, this.activeCamera);

		// Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
		// Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
		// Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
		requestAnimationFrame(() => this.update())
	}
}

/// La función   main
$(function () {

	// Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
	var scene = new MyScene("#WebGL-output");

	// Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
	window.addEventListener("resize", () => scene.onWindowResize());

	// Que no se nos olvide, la primera visualización.
	scene.update();
});
