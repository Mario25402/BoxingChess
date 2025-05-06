import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.module.js'
import { StraightAnimator } from './Animator.js'
import { Casilla } from './Casilla.js'


import { Rey } from './Rey.js'
import { Alfil } from './Alfil.js'
import { Torre } from './Torre.js'
import { Peon } from './Peon.js'
import { Caballo } from './Caballo.js'
import { Reina } from './Reina.js'

class Pieza extends THREE.Object3D{
    constructor(ficha, casillaActual, isBlanca, DETAIL_LEVEL){
        super();

        this.animacion = new StraightAnimator();
        this.casillaActual = casillaActual
        this.DETAIL_LEVEL = DETAIL_LEVEL;
        this.isBlanca = isBlanca
        this.ficha = ficha;

        switch (ficha) {
            case "Rey":
                this.pieza = new Rey(isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.11, 0.11, 0.11)
                break;

            case "Reina":
                this.pieza = new Reina(isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.11, 0.11, 0.11)
                break;
            
            case "Caballo":
                this.pieza = new Caballo(isBlanca, DETAIL_LEVEL);
                this.pieza.rotateY(THREE.MathUtils.degToRad(180));
                this.pieza.scale.set(0.3, 0.3, 0.3)
                break;

            case "Torre":
                this.pieza = new Torre(isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.3, 0.3, 0.3)
                break;

            case "Alfil":
                this.pieza = new Alfil(isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.11, 0.11, 0.11)
                break;
            
            case "Peon":
                this.pieza = new Peon(isBlanca, DETAIL_LEVEL);
                this.pieza.scale.set(0.3, 0.3, 0.3)
                break;
        }

        if (!isBlanca) this.pieza.rotateY(THREE.MathUtils.degToRad(180));

        this.add(this.pieza);
    }

    getPosiblesMovimientos(casillasLibres, casillasOcupadas) {
        let movimientos = this.pieza.getMovimientos(this.casillaActual, casillasOcupadas);
        let posiblesMovimientos = [];
    
        // Filtrar los movimientos posibles (solo casillas libres o con piezas enemigas)
        for (let i = 0; i < movimientos.length; i++) {
            for (let j = 0; j < casillasLibres.length; j++) {
                if (movimientos[i][0] == casillasLibres[j][0] && movimientos[i][1] == casillasLibres[j][1]) {
                    posiblesMovimientos.push(movimientos[i]);
                }
            }
        }
    
        return posiblesMovimientos;
    }

    moveTo(nueva) {
        let nuevaPos = new THREE.Vector3(nueva.posI, 0, nueva.posJ);
        let actual = new THREE.Vector3(this.casillaActual[0], 0, this.casillaActual[1]);
    
        // Iniciar la animación
        this.animacion.setAndStart(actual, nuevaPos, 100)

        // Quitar la pieza de la casilla actual
        if (this.parent instanceof Casilla) {
            this.parent.quitarPieza();
        }

        // Mover la pieza a la nueva casilla
        nueva.ponerPieza(this);

        // Actualizar la posición actual de la pieza
        this.casillaActual = [nueva.posI, nueva.posJ];
    }
}

export { Pieza }