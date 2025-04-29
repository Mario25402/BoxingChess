import * as THREE from '../libs/three.module.js'
import { Pieza } from './Pieza.js'

class Casilla extends THREE.Object3D{
    constructor(mesh, posI, posJ, pieza){
        super();

        this.mesh = mesh
        this.posI = posI
        this.posJ = posJ
        this.pieza = pieza

        this.mesh.position.set(this.posI, 0, this.posJ)
        this.add(this.mesh)
    }
}

export { Casilla }