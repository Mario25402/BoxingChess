import * as THREE from '../libs/three.module.js'
import { Casilla } from './Casilla.js'

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
    }

    relllenarTablero(i, j){
        let matBlanco = new THREE.MeshStandardMaterial({color: 0xFBDBB5});
        let matNegro = new THREE.MeshStandardMaterial({color: 0x000000});

        let geom = new THREE.BoxGeometry(1, 0.2, 1);
        
        for (let x = 0; x < i; x++){
            for (let z = 0; z < j; z++){

                let mat = matNegro
                if ((x + z) % 2 == 0) mat = matBlanco;
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
        for (let i = 0; i < 8; i++){
            this.tablero[1][i].setPieza("Peon", true, this.DETAIL_LEVEL);
            this.tablero[6][i].setPieza("Peon", false, this.DETAIL_LEVEL);
        }
    }
}

export { Tablero }