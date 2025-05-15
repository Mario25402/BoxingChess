import * as THREE from '../libs/three.module.js'
import { Casilla } from './Casilla.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Tablero extends THREE.Object3D {
    DETAIL_LEVEL = 3;

    constructor(i, j) {
        super();

        this.tablero = new Array(i);
        for (let x = 0; x < i; x++) {
            this.tablero[x] = new Array(j);
        }

        this.relllenarTablero(i, j);
        this.rellenarPiezas();
        this.crearRing();
    }

    relllenarTablero(i, j) {
        let matBlanco2 = new THREE.MeshStandardMaterial({ color: 0xE6CFCF });
        let matNegro2 = new THREE.MeshStandardMaterial({ color: 0x4B4B4B });

        let geom = new THREE.BoxGeometry(1, 0.2, 1);

        for (let x = 0; x < i; x++) {
            for (let z = 0; z < j; z++) {

                let mat = matNegro2
                if ((x + z) % 2 == 0) mat = matBlanco2;
                let mesh = new THREE.Mesh(geom, mat);

                //Añade sombras
                mesh.receiveShadow = true;
                mesh.castShadow = false;

                let casilla = new Casilla(mesh, x, z);
                this.tablero[x][z] = casilla;
                this.add(casilla)
            }
        }
    }

    rellenarPiezas() {
        // Figuras Blancas
        this.tablero[0][0].setPieza("Torre", true, this.DETAIL_LEVEL);
        this.tablero[0][1].setPieza("Caballo", true, this.DETAIL_LEVEL);
        this.tablero[0][2].setPieza("Alfil", true, this.DETAIL_LEVEL);
        this.tablero[0][3].setPieza("Reina", true, this.DETAIL_LEVEL);
        this.tablero[0][4].setPieza("Rey", true, this.DETAIL_LEVEL);
        this.tablero[0][5].setPieza("Alfil", true, this.DETAIL_LEVEL);
        this.tablero[0][6].setPieza("Caballo", true, this.DETAIL_LEVEL);
        this.tablero[0][7].setPieza("Torre", true, this.DETAIL_LEVEL);

        // Figuras Negras
        this.tablero[7][0].setPieza("Torre", false, this.DETAIL_LEVEL);
        this.tablero[7][1].setPieza("Caballo", false, this.DETAIL_LEVEL);
        this.tablero[7][2].setPieza("Alfil", false, this.DETAIL_LEVEL);
        this.tablero[7][3].setPieza("Rey", false, this.DETAIL_LEVEL);
        this.tablero[7][4].setPieza("Reina", false, this.DETAIL_LEVEL);
        this.tablero[7][5].setPieza("Alfil", false, this.DETAIL_LEVEL);
        this.tablero[7][6].setPieza("Caballo", false, this.DETAIL_LEVEL);
        this.tablero[7][7].setPieza("Torre", false, this.DETAIL_LEVEL);

        // Peones Blancos y Negros
        for (let i = 0; i < 8; i++) {
            this.tablero[1][i].setPieza("Peon", true, this.DETAIL_LEVEL);
            this.tablero[6][i].setPieza("Peon", false, this.DETAIL_LEVEL);
        }
    }

    arraysIguales(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    }

    crearRing() {
        // Crear el ring principal
        const ringGeo = new THREE.BoxGeometry(8.75, 1, 8.75);
        const mat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
        ringGeo.translate(3.5, -0.5, 3.5);
        const ringBrush = new CSG.Brush(ringGeo, mat);

        var loader2 = new THREE.TextureLoader();
        var textura = loader2.load('./imgs/box.png')
        var mate = new THREE. MeshStandardMaterial ( {map:textura, color: 0xffffff, metalness: 0.8, roughness: 0.2} ) ;

        const cartel = new THREE.BoxGeometry(0.45, 0.75, 4);
        //const mate = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
        cartel.translate(3.5 + 4.2, -0.5, 3.5);
        const cart = new THREE.Mesh(cartel,mate);
        this.add(cart);

        const cartel2 = new THREE.BoxGeometry(0.45, 0.75, 4);
        //const mate = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
        cartel2.translate(3.5 - 4.2, -0.5, 3.5);
        const cart2 = new THREE.Mesh(cartel2,mate);
        this.add(cart2);


        // Crear el hueco del ring
        const huecoGeo = new THREE.BoxGeometry(8, 0.6, 8);
        huecoGeo.translate(3.5, -0.2, 3.5);
        const huecoBrush = new CSG.Brush(huecoGeo, mat);

        // Evaluador CSG
        const evaluador = new CSG.Evaluator();

        // Crear el ring con el hueco
        let ringFinal = evaluador.evaluate(ringBrush, huecoBrush, CSG.SUBTRACTION);

        // Crear los palos del ring
        const paloMat1 = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000, 
            metalness: 0.75, 
            roughness: 0.2 
        });
        const paloMat2 = new THREE.MeshStandardMaterial({ 
            color: 0x0000FF, 
            metalness: 0.75, 
            roughness: 0.2 
        });

        const paloPositions = [
            [3.5 - 4.125, 0.4, 3.5 + 4.125],  // Arriba izquierda
            [3.5 - 4.125, 0.4, 3.5 - 4.125],  // Arriba derecha
            [3.5 + 4.125, 0.4, 3.5 - 4.125],  // Abajo derecha
            [3.5 + 4.125, 0.4, 3.5 + 4.125]  // Abajo izquierda
        ];

        paloPositions.forEach(([x, y, z]) => {
            const paloGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, this.DETAIL_LEVEL);
            paloGeo.translate(x, y, z);

            let paloMat = paloMat2;
            if (this.arraysIguales([x, y, z], [3.5 - 4.125, 0.4, 3.5 + 4.125]) ||
                this.arraysIguales([x, y, z], [3.5 - 4.125, 0.4, 3.5 - 4.125])) {
                paloMat = paloMat1;
            }

            const paloBrush = new CSG.Brush(paloGeo, paloMat);
            ringFinal = evaluador.evaluate(ringFinal, paloBrush, CSG.ADDITION);
        });

        // Crear las cuerdas del ring
        const loader = new THREE.TextureLoader();
        const bumpTexture = loader.load('./imgs/lazo.png');
        //const cuerdaMat = new THREE.MeshStandardMaterial({ color: 0xB7B7B7 });
        const cuerdaMat = new THREE.MeshStandardMaterial({
            color:  0xB7B7B7,
            bumpMap: bumpTexture,
            bumpScale: 1,
        });

        const cuerdaConfigs = [
            { pos: [3.5, 0.2, 3.5 + 4.125], rotZ: 90 },
            { pos: [3.5, 0.2, 3.5 - 4.125], rotZ: 90 },
            { pos: [3.5 + 4.125, 0.2, 3.5], rotZ: 90, rotY: 90 },
            { pos: [3.5 - 4.125, 0.2, 3.5], rotZ: 90, rotY: 90 },
            { pos: [3.5, 0.6, 3.5 + 4.125], rotZ: 90 },
            { pos: [3.5, 0.6, 3.5 - 4.125], rotZ: 90 },
            { pos: [3.5 + 4.125, 0.6, 3.5], rotZ: 90, rotY: 90 },
            { pos: [3.5 - 4.125, 0.6, 3.5], rotZ: 90, rotY: 90 },
        ];

        cuerdaConfigs.forEach(({ pos, rotZ, rotY }) => {
            const cuerdaGeo = new THREE.CylinderGeometry(0.05, 0.05, 8.5, this.DETAIL_LEVEL);
            if (rotZ) cuerdaGeo.rotateZ(THREE.MathUtils.degToRad(rotZ));
            if (rotY) cuerdaGeo.rotateY(THREE.MathUtils.degToRad(rotY));
            cuerdaGeo.translate(...pos);
            const cuerdaBrush = new CSG.Brush(cuerdaGeo, cuerdaMat);
            ringFinal = evaluador.evaluate(ringFinal, cuerdaBrush, CSG.ADDITION);
        });

        // Añadir el ring completo a la escena
        ringFinal.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        this.add(ringFinal);
    }

    getCasillasLibres(isBlanca) {
        let casillasLibres = [];

        for (let i = 0; i < this.tablero.length; i++) {
            for (let j = 0; j < this.tablero[i].length; j++) {

                if (this.tablero[i][j].pieza == null) {
                    casillasLibres.push([i, j]);
                }

                else {
                    let equipoPieza;
                    let equipoGeneral;

                    if (isBlanca) equipoPieza = "B"
                    else equipoPieza = "N"

                    if (this.tablero[i][j].pieza.isBlanca) equipoGeneral = "B"
                    else equipoGeneral = "N"

                    if (equipoPieza != equipoGeneral) {
                        casillasLibres.push([i, j]);
                    }
                }
            }
        }

        return casillasLibres;
    }

    getCasillasOcupadas() {
        let casillasOcupadas = [];

        for (let i = 0; i < this.tablero.length; i++) {
            for (let j = 0; j < this.tablero[i].length; j++) {
                if (this.tablero[i][j].pieza != null) {
                    casillasOcupadas.push([i, j]);
                }
            }
        }

        return casillasOcupadas;
    }

    getPosiblesMovimientos(pieza) {
        let casillasLibres = this.getCasillasLibres(pieza.isBlanca);
        let casillasOcupadas = this.getCasillasOcupadas();
        let movimientos = pieza.getPosiblesMovimientos(casillasLibres, casillasOcupadas);

        // Cambiar color de las casillas de los movimientos
        for (let i = 0; i < movimientos.length; i++) {
            let x = movimientos[i][0];
            let y = movimientos[i][1];

            // Verificar si la casilla contiene una pieza enemiga
            if (this.tablero[x][y].pieza != null && this.tablero[x][y].pieza.isBlanca !== pieza.isBlanca) {
                this.tablero[x][y].setColorComer(); // Pintar en azul si es una pieza enemiga
            } else {
                this.tablero[x][y].setColorNavegable(); // Pintar en verde si es una casilla libre
            }
        }

        return movimientos;
    }

    repaint() {
        this.tablero.forEach((fila) => {
            fila.forEach((casilla) => {
                casilla.setColorOriginal();
            });
        });
    }

    // Movmiento casilla a casilla (arrglar caballo)
    /*moveTo(nueva, scene) {
        const camino = this.calcularCamino(this.casillaActual, nueva); // Calcula las casillas intermedias
        const animaciones = [];

        // Crear animaciones para cada casilla en el camino
        for (let i = 0; i < camino.length; i++) {
            const casilla = camino[i];
            const nuevaPos = new THREE.Vector3(casilla[0], 0, casilla[1]);

            // Fase 1: Levantar la pieza
            const levantar = new TWEEN.Tween(this.position)
                .to({ y: 1 }, 300) // Elevar la pieza 1 unidad en el eje Y
                .easing(TWEEN.Easing.Quadratic.Out);

            // Fase 2: Mover la pieza en línea recta
            const mover = new TWEEN.Tween(this.position)
                .to({ x: nuevaPos.x, z: nuevaPos.z }, 700) // Mover en X y Z
                .easing(TWEEN.Easing.Quadratic.InOut);

            // Fase 3: Bajar la pieza
            const bajar = new TWEEN.Tween(this.position)
                .to({ y: 0 }, 300) // Bajar la pieza al tablero
                .easing(TWEEN.Easing.Quadratic.In);

            // Encadenar las fases
            levantar.chain(mover);
            mover.chain(bajar);

            // Agregar la animación al arreglo
            animaciones.push(levantar, mover, bajar);
        }

        // Encadenar todas las animaciones
        for (let i = 0; i < animaciones.length - 1; i++) {
            animaciones[i].chain(animaciones[i + 1]);
        }

        // Al finalizar la última animación, actualizar referencias y restaurar el color
        animaciones[animaciones.length - 1].onComplete(() => {
            // Quitar la pieza de la casilla actual
            if (this.parent instanceof Casilla) {
                this.parent.quitarPieza();
            }

            // Mover la pieza a la nueva casilla
            nueva.ponerPieza(this);

            // Actualizar la posición actual de la pieza
            this.casillaActual = [nueva.posI, nueva.posJ];

            // Restaurar el color original de la pieza
            this.traverse((child) => {
                if (child.isMesh && child.material && child.material.color) {
                    child.material.color.set(this.colorOriginal); // Restaurar el color original
                }
            });

            // Deseleccionar la pieza
            if (scene && scene.selectedPiece === this) {
                scene.selectedPiece = null;
            }

            // Restaurar los colores del tablero
            if (scene && scene.children[4]) {
                scene.children[4].repaint();
            }
        });

        // Iniciar la animación
        animaciones[0].start();
    }

    // Método para calcular el camino entre dos casillas
    calcularCamino(casillaActual, nueva) {
        const camino = [];
        const [x1, y1] = casillaActual;
        const [x2, y2] = [nueva.posI, nueva.posJ];

        // Movimiento en línea recta (puedes ajustar esto según las reglas de cada pieza)
        const dx = Math.sign(x2 - x1);
        const dy = Math.sign(y2 - y1);

        let x = x1;
        let y = y1;

        while (x !== x2 || y !== y2) {
            x += dx;
            y += dy;
            camino.push([x, y]);
        }

        return camino;
    } */

}

export { Tablero }