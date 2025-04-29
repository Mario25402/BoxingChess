import * as THREE from '../libs/three.module.js'
import { Pieza } from './Pieza.js'

class Casilla extends THREE.Object3D{
    constructor(mesh, posI, posJ){
        super();

        this.mesh = mesh
        this.posI = posI
        this.posJ = posJ
        this.pieza = null

        this.mesh.position.set(this.posI, -0.1, this.posJ)
        this.add(this.mesh)
    }

    setPieza(pieza, isBlanca, DETAIL_LEVEL){
        this.pieza = new Pieza(pieza, [this.posI, this.J], isBlanca, DETAIL_LEVEL);
        this.pieza.position.set(this.posI, 0, this.posJ);
        this.add(this.pieza);
    }
}

export { Casilla }