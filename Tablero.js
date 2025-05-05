import * as THREE from '../libs/three.module.js'
import { Casilla } from './Casilla.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Tablero extends THREE.Object3D{
    DETAIL_LEVEL = 3;

    constructor(i, j){
        super();

        this.tablero = new Array(i);
        for (let x = 0; x < i; x++){
            this.tablero[x] = new Array(j);
        }

        this.relllenarTablero(i, j);
        this.rellenarPiezas();
        this.crearRing();
    }

    relllenarTablero(i, j){
        let matBlanco2 = new THREE.MeshStandardMaterial({color: 0xE6CFCF});
        let matNegro2 = new THREE.MeshStandardMaterial({color: 0x4B4B4B});

        let geom = new THREE.BoxGeometry(1, 0.2, 1);
        
        for (let x = 0; x < i; x++){
            for (let z = 0; z < j; z++){

                let mat = matNegro2
                if ((x + z) % 2 == 0) mat = matBlanco2;
                let mesh = new THREE.Mesh(geom, mat);

                let casilla = new Casilla(mesh, x, z);
                this.tablero[x][z] = casilla;
                this.add(casilla)
            }
        }
    }

    rellenarPiezas(){
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
        /* for (let i = 0; i < 8; i++){
            if (i != 3){
                this.tablero[1][i].setPieza("Peon", true, this.DETAIL_LEVEL);
                this.tablero[6][i].setPieza("Peon", false, this.DETAIL_LEVEL);
            }
        } */
    }

    crearRing() {
        // Crear el ring principal
        const ringGeo = new THREE.BoxGeometry(8.75, 1, 8.75);
        const mat = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        ringGeo.translate(3.5, -0.5, 3.5);
        const ringBrush = new CSG.Brush(ringGeo, mat);
    
        // Crear el hueco del ring
        const huecoGeo = new THREE.BoxGeometry(8, 0.6, 8);
        huecoGeo.translate(3.5, -0.2, 3.5);
        const huecoBrush = new CSG.Brush(huecoGeo, mat);
    
        // Evaluador CSG
        const evaluador = new CSG.Evaluator();
    
        // Crear el ring con el hueco
        let ringFinal = evaluador.evaluate(ringBrush, huecoBrush, CSG.SUBTRACTION);
    
        // Crear los palos del ring
        const paloMat = new THREE.MeshStandardMaterial({ color: 0x0000FF });
        const paloPositions = [
            [3.5 + 4.125, 0.4, 3.5 + 4.125],
            [3.5 - 4.125, 0.4, 3.5 - 4.125],
            [3.5 + 4.125, 0.4, 3.5 - 4.125],
            [3.5 - 4.125, 0.4, 3.5 + 4.125],
        ];
    
        paloPositions.forEach(([x, y, z]) => {
            const paloGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, this.DETAIL_LEVEL);
            paloGeo.translate(x, y, z);
            const paloBrush = new CSG.Brush(paloGeo, paloMat);
            ringFinal = evaluador.evaluate(ringFinal, paloBrush, CSG.ADDITION); // Combinar con ADDITION
        });
    
        // Crear las cuerdas del ring
        const cuerdaMat = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
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
            ringFinal = evaluador.evaluate(ringFinal, cuerdaBrush, CSG.ADDITION); // Combinar con ADDITION
        });
    
        // Añadir el ring completo a la escena
        this.add(ringFinal);
    }

    getCasillasLibres(isBlanca){
        let casillasLibres = [];

        for (let i = 0; i < this.tablero.length; i++){
            for (let j = 0; j < this.tablero[i].length; j++){

                if (this.tablero[i][j].pieza == null){
                    casillasLibres.push([i, j]);
                }

                else{
                    let equipoPieza;
                    let equipoGeneral;

                    if (isBlanca) equipoPieza = "B"
                    else equipoPieza = "N"

                    if (this.tablero[i][j].pieza.isBlanca) equipoGeneral = "B"
                    else equipoGeneral = "N"

                    if (equipoPieza != equipoGeneral){
                        casillasLibres.push([i, j]);
                    }
                }
            }
        }

        return casillasLibres;
    }

    getPosiblesMovimientos(pieza){
        let movimientos = pieza.getPosiblesMovimientos(this.getCasillasLibres(pieza.isBlanca));
        console.log(movimientos);

        // cambiar color de las casillas de los movimientos
        for (let i = 0; i < movimientos.length; i++){
            let x = movimientos[i][0];
            let y = movimientos[i][1];

            this.tablero[x][y].setColorNavegable();
        }
    }

    repaint(){
        this.tablero.forEach((fila) => {
            fila.forEach((casilla) => {
                casilla.setColorOriginal();
            });
        });
    }

    

}

export { Tablero }