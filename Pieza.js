import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.module.js'
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

        this.casillaActual = casillaActual
        this.DETAIL_LEVEL = DETAIL_LEVEL;
        this.isBlanca = isBlanca
        this.ficha = ficha;

        if (isBlanca) this.colorOriginal = new THREE.MeshStandardMaterial({color: 0xFBDBB5});
        else this.colorOriginal = new THREE.MeshStandardMaterial({color: 0x222222});

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

        this.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
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

    moveTo(nueva, scene) {
        if (scene.selectedPiece.ficha == "Reina" && (scene.oponente && scene.oponente.ficha == "Peon"))
            this.movimientoGolpe(scene, nueva);

        else this.movimientoNormal(scene, nueva)
    }

    movimientoNormal(scene, nueva) {
        const nuevaPos = new THREE.Vector3(nueva.posI, 0, nueva.posJ);
        
        // Fase 1: Levantar la pieza
        const levantar = new TWEEN.Tween(this.position)
            .to({ y: 1 }, 300) // Elevar la pieza 1 unidad en el eje Y
            .easing(TWEEN.Easing.Quadratic.Out);
    
        // Fase 2: Mover la pieza en línea recta
        const mover = new TWEEN.Tween(this.position)
            .to({ x: nuevaPos.x, z: nuevaPos.z }, 700)
            .easing(TWEEN.Easing.Quadratic.InOut);
    
        // Fase 3: Bajar la pieza
        const bajar = new TWEEN.Tween(this.position)
            .to({ y: 0 }, 300) // Bajar la pieza al tablero
            .easing(TWEEN.Easing.Quadratic.In);
    
        // Encadenar las fases
        levantar.chain(mover);
        mover.chain(bajar);
    
        // Al finalizar la animación, actualizar referencias y restaurar el color
        bajar.onComplete(() => {
            // Quitar la pieza de la casilla actual
            if (this.parent instanceof Casilla) {
                this.parent.quitarPieza();
            }
    
            // Mover la pieza a la nueva casilla
            nueva.ponerPieza(this);
    
            // Actualizar la posición actual de la pieza
            this.casillaActual = [nueva.posI, nueva.posJ];
    
            // Restaurar el color original de la pieza
            this.traverse((child) => {
                if (child.isMesh && child.material && child.material.color) {
                    child.material.color.set(this.colorOriginal);
                }
            });
    
            // Deseleccionar la pieza
            if (scene && scene.selectedPiece === this) {
                scene.selectedPiece = null;
            }
    
            // Restaurar los colores del tablero
            if (scene && scene.children[13]) {
                scene.children[13].repaint();
            }
        });
    
        // Iniciar la animación
        levantar.start();
    }

    movimientoGolpe(scene, nueva){
        const nuevaPosPelea = new THREE.Vector3(scene.oponente.parent.posI -1, 0, scene.oponente.parent.posJ);
        
        // Fase 1: Levantar la pieza
        const levantar = new TWEEN.Tween(this.position)
            .to({ y: 1 }, 300)
            .easing(TWEEN.Easing.Quadratic.Out);

        const moverPelea = new TWEEN.Tween(this.position)
            .to({ x: nuevaPosPelea.x, z: nuevaPosPelea.z }, 700)
            .easing(TWEEN.Easing.Quadratic.InOut);

        const bajar = new TWEEN.Tween(this.position)
            .to({ y: 0 }, 300)
            .easing(TWEEN.Easing.Quadratic.In);

        const lanzar = new TWEEN.Tween(scene.oponente.position)
            .to({ x: scene.oponente.position.x + 3, y: 2, z: scene.oponente.position.z + 3 }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                if (scene.oponente.parent instanceof Casilla) {
                    scene.oponente.parent.quitarPieza();
                }
                scene.remove(scene.oponente);
                scene.oponente = null; // Limpiar la referencia
            });
        

        const mover = new TWEEN.Tween(this.position)
            .to({ x: nuevaPosPelea.x + 1, z: nuevaPosPelea.z }, 700)
            .easing(TWEEN.Easing.Quadratic.InOut);

        // Encadenar las fases
        levantar.chain(moverPelea);
        moverPelea.chain(bajar);
        bajar.chain(lanzar);
        lanzar.chain(mover);
    
        // Al finalizar la animación, actualizar referencias y restaurar el color
        mover.onComplete(() => {
            // Quitar la pieza de la casilla actual
            if (this.parent instanceof Casilla) {
                this.parent.quitarPieza();
            }
    
            // Mover la pieza a la nueva casilla
            nueva.ponerPieza(this);
    
            // Actualizar la posición actual de la pieza
            this.casillaActual = [scene.oponente.parent.posI, scene.oponente.parent.posJ];
    
            // Restaurar el color original de la pieza
            this.traverse((child) => {
                if (child.isMesh && child.material && child.material.color) {
                    child.material.color.set(this.colorOriginal);
                }
            });
    
            // Deseleccionar la pieza
            if (scene && scene.selectedPiece === this) {
                scene.selectedPiece = null;
            }
    
            // Restaurar los colores del tablero
            if (scene && scene.children[13]) {
                scene.children[13].repaint();
            }
        });
    
        // Iniciar la animación
        levantar.start();
    }
}

export { Pieza }