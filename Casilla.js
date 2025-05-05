import * as THREE from '../libs/three.module.js'
import { Pieza } from './Pieza.js'

class Casilla extends THREE.Object3D{
    constructor(mesh, posI, posJ){
        super();

        this.mesh = mesh.clone();
        this.mesh.material = this.mesh.material.clone();
        this.colorOriginal = this.mesh.material.color.getHex();
        this.posI = posI
        this.posJ = posJ
        this.pieza = null

        this.mesh.position.set(this.posI, -0.1, this.posJ)
        this.add(this.mesh)
    }

    setPieza(pieza, isBlanca, DETAIL_LEVEL){
        this.pieza = new Pieza(pieza, [this.posI, this.posJ], isBlanca, DETAIL_LEVEL);
        this.pieza.position.set(this.posI, 0, this.posJ);
        this.add(this.pieza);
    }

    setColorNavegable(){
        console.log(this.posI, this.posJ);
        this.mesh.material.color.set(0x00FF00);
    }

    setColorOriginal() {
        this.mesh.material.color.set(this.colorOriginal);
    }
}

export { Casilla }