import * as THREE from '../libs/three.module.js'
import { Casilla } from './Casilla.js'

class Tablero extends THREE.Object3D{
    constructor(i, j){
        super();
        this.tablero = new Array(i);

        for (let x = 0; x < i; x++){
            this.tablero[x] = new Array(j);
        }

        this.relllenarTablero(i, j);
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

                let casilla = new Casilla(mesh, x, z, null);
                this.tablero[x][z] = casilla;
                this.add(casilla)
            }
        }
    }
}

export { Tablero }