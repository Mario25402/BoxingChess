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

    quitarPieza(esCaptura = false){
        if (this.pieza != null){
            const tablero = this.parent;
            const scene = tablero.parent;

            if (esCaptura) {
                let offset = 1;
                let baseY = -0.5;
                let baseX = tablero.position.x;
                let baseZ = tablero.position.z;

               if (this.pieza.isBlanca) {
                    let fila = Math.floor(scene.capturadasBlancas / 8);
                    let col = scene.capturadasBlancas % 8;
                    let y = (fila === 0) ? -0.5 : 0; // Primera fila a -0.5, segunda a 0
                    this.pieza.position.set(
                        baseX + 7 - col * offset - fila,
                        y,
                        baseZ + 8 + 1 + fila
                    );
                    this.pieza.rotation.y = THREE.MathUtils.degToRad(90);
                    scene.capturadasBlancas++;
                } else {
                    let fila = Math.floor(scene.capturadasNegras / 8);
                    let col = scene.capturadasNegras % 8;
                    let y = (fila === 0) ? -0.5 : 0; // Primera fila a -0.5, segunda a 0
                    this.pieza.position.set(
                        baseX + col * offset + fila,
                        y,
                        baseZ - 2 - fila
                    );
                    this.pieza.rotation.y = THREE.MathUtils.degToRad(90);
                    scene.capturadasNegras++;
                }
                this.remove(this.pieza);
                scene.add(this.pieza);
            } else {
                this.remove(this.pieza);
            }
            this.pieza = null;
        }
    }

    ponerPieza(pieza) {
        if (this.pieza != null) {
            this.remove(this.pieza); // Eliminar la pieza existente si hay una
        }
    
        this.pieza = pieza;
        this.pieza.position.set(this.posI, 0, this.posJ); // Actualizar la posición de la pieza en el tablero
        this.add(this.pieza); // Añadir la pieza a la casilla
    }

    setPieza(pieza, isBlanca, DETAIL_LEVEL){
        this.pieza = new Pieza(pieza, [this.posI, this.posJ], isBlanca, DETAIL_LEVEL);
        this.pieza.position.set(this.posI, 0, this.posJ);
        this.add(this.pieza);
    }

    setColorNavegable(){
        this.mesh.material.color.set(0x00FF00);
    }

    setColorOriginal() {
        this.mesh.material.color.set(this.colorOriginal);
    }

    setColorComer() {
        this.mesh.material.color.set(0xFFCC00);
    }

    setColorMov() {
        this.mesh.material.color.set(0x006400);
    }
}

export { Casilla }