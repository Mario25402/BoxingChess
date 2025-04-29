import * as THREE from '../libs/three.module.js'

import { Rey } from './Rey.js'
import { Alfil } from './Alfil.js'
import { Torre } from './Torre.js'
import { Peon } from './Peon.js'
import { Caballo } from './Caballo.js'
import { Reina } from './Reina.js'

class Pieza {
    constructor(pieza, casillaActual, equipo, DETAIL_LEVEL){
        this.casillaActual = casillaActual
        this.equipo = equipo // True = blancas, False = negras
        this.pieza = new Peon(DETAIL_LEVEL);

        switch (pieza) {
            case "Rey":
                this.pieza = new Rey(DETAIL_LEVEL);
                break;

            case "Reina":
                this.pieza = new Reina(DETAIL_LEVEL);
                break;
            
            case "Caballo":
                this.pieza = new Caballo(DETAIL_LEVEL);
                break;

            case "Torre":
                this.pieza = new Torre(DETAIL_LEVEL);
                break;

            case "Alfil":
                this.pieza = new Alfil(DETAIL_LEVEL);
                break;
        }
    }
}

export { Pieza }