import * as THREE from '../libs/three.module.js'

import { Rey } from './Rey.js'
import { Alfil } from './Alfil.js'
import { Torre } from './Torre.js'
import { Peon } from './Peon.js'
import { Caballo } from './Caballo.js'
import { Reina } from './Reina.js'

class Pieza extends THREE.Object3D{
    constructor(pieza, casillaActual, isBlanca, DETAIL_LEVEL){
        super();

        this.casillaActual = casillaActual

        switch (pieza) {
            case "Rey":
                this.pieza = new Rey(null, "", isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.11, 0.11, 0.11)
                break;

            case "Reina":
                this.pieza = new Reina(null, "", isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.11, 0.11, 0.11)
                break;
            
            case "Caballo":
                this.pieza = new Caballo(null, "", isBlanca, DETAIL_LEVEL);
                this.pieza.rotateY(THREE.MathUtils.degToRad(180));
                this.pieza.scale.set(0.3, 0.3, 0.3)
                break;

            case "Torre":
                this.pieza = new Torre(null, "", isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.3, 0.3, 0.3)
                break;

            case "Alfil":
                this.pieza = new Alfil(null, "", isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.11, 0.11, 0.11)
                break;
            
            case "Peon":
                this.pieza = new Peon(null, "", isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.3, 0.3, 0.3)
                break;
        }

        if (!isBlanca) this.pieza.rotateY(THREE.MathUtils.degToRad(180));

        this.add(this.pieza);
    }
}

export { Pieza }