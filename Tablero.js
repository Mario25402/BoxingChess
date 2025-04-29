import * as THREE from '../libs/three.module.js'

class Tablero {
    constructor(i, j){
        this.tablero = new Array(i);

        for (let x = 0; x < i; x++){
            this.tablero[x] = new Array(j);
        }
    }

    get(i, j) {
        return this.tablero[i][j];
    }

    set(i, j, casilla) {
        this.tablero[i][j] = casilla;
    }
}

export { Tablero }