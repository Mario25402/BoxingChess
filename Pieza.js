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
        if (scene.selectedPiece.ficha == "Reina" 
        && (scene.oponente && scene.oponente.ficha == "Peon"))
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
            if (scene && scene.children[14]) {
                scene.children[14].repaint();
            }
        });
    
        // Iniciar la animación
        levantar.start();
    }

    movimientoGolpe(scene, nueva){
        // Guardar la posición de la casilla del oponente antes de eliminarlo
        const oponenteCasillaPos = [
            scene.oponente.parent.posI,
            scene.oponente.parent.posJ
        ];

        let acercamiento = -0.6;
        let direccion = -9;

        if (this.isBlanca){
            acercamiento = 0.6
            direccion = 9;
        }

        const nuevaPosPelea = new THREE.Vector3(scene.oponente.parent.posI - acercamiento, 0, scene.oponente.parent.posJ);

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

        // Lanza al peón solo cuando termina el puñetazo de la reina
        const lanzar = new TWEEN.Tween(scene.oponente.position)
            .to({ x: scene.oponente.position.x + direccion, y: 2, z: scene.oponente.position.z + direccion }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                if (scene.oponente.parent instanceof Casilla) {
                    scene.oponente.parent.quitarPieza();
                }
                scene.remove(scene.oponente);
                scene.oponente = null; // Limpiar la referencia
            });

        const mover = new TWEEN.Tween(this.position)
            .to({ x: nuevaPosPelea.x + acercamiento, z: nuevaPosPelea.z }, 700)
            .easing(TWEEN.Easing.Quadratic.InOut);

        // Encadenar las fases
        levantar.chain(moverPelea);
        moverPelea.chain(bajar);
        lanzar.chain(mover);

        bajar.onComplete(() => {
            if (this.ficha === "Reina" && typeof this.pieza.animarGolpe === "function") {
                const objetivo = new THREE.Vector3();
                scene.oponente.getWorldPosition(objetivo);
                const origen = new THREE.Vector3();
                this.getWorldPosition(origen);

                let camPos;

            if (scene.golpeCameraMode === "primeraPersona") {
                // PRIMERA PERSONA
                const alturaOjos = 1;
                camPos = origen.clone();
                camPos.y += alturaOjos;
                const alturaPeon = 0.5;
                objetivo.y += alturaPeon;
                const direccion = objetivo.clone().sub(origen).normalize();
                camPos.add(direccion.clone().multiplyScalar(0.2));
                scene.golpeCamera.position.copy(camPos);
                scene.golpeCamera.lookAt(objetivo);
                scene.activeCamera = scene.golpeCamera;
            } else if (scene.golpeCameraMode === "lateral") {
                // LATERAL
                const direccion = objetivo.clone().sub(origen).normalize();
                const lateral = new THREE.Vector3(-direccion.z, 0, direccion.x).normalize();
                const distancia = 3;
                const altura = 3;
                camPos = origen.clone().add(lateral.multiplyScalar(-distancia));
                camPos.y += altura;
                scene.golpeCamera.position.copy(camPos);
                scene.golpeCamera.lookAt(objetivo);
                scene.activeCamera = scene.golpeCamera;
            }
            // Si es "ninguna", NO cambies la cámara ni hagas nada

            this.pieza.animarGolpe(() => {
                lanzar.start();
                setTimeout(() => {
                    if (this.isBlanca) {
                        scene.activeCamera = scene.camera;
                    } else {
                        scene.activeCamera = scene.cameraBlancas;
                    }
                }, 550);
            });
            } else {
                lanzar.start();
            }
        });

        mover.onComplete(() => {
            // Quitar la pieza de la casilla actual
            if (this.parent instanceof Casilla) {
                this.parent.quitarPieza();
            }

            // Mover la pieza a la nueva casilla
            nueva.ponerPieza(this);

            // Actualizar la posición actual de la pieza usando la posición guardada
            this.casillaActual = [oponenteCasillaPos[0], oponenteCasillaPos[1]];

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
            if (scene && scene.children[14]) {
                scene.children[14].repaint();
            }
        });

        // Iniciar la animación
        levantar.start();
    }
}

export { Pieza }