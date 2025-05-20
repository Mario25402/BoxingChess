import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Guan_R extends THREE.Object3D {
    constructor(isBlanca, DETAIL_LEVEL) {
        super();
        this.isBlanca = isBlanca;

        // Materiales
        let material, material2;
        if (this.isBlanca) {
            material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
            material2 = new THREE.MeshStandardMaterial({ color: 0xFBDBB5 });
        }

        else {
            material = new THREE.MeshStandardMaterial({ color: 0x0000FF });
            material2 = new THREE.MeshStandardMaterial({ color: 0x222222 });
        }

        const evaluador = new CSG.Evaluator();

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(-0.18, 0.46, -0.23, 0.96);
        shape.quadraticCurveTo(-0.26, 1.38, -0.19, 1.8);
        shape.quadraticCurveTo(-0.1, 1.96, 0.08, 1.9);
        shape.lineTo(0.17, 1.84);
        shape.quadraticCurveTo(0.29, 1.84, 0.36, 1.93);
        shape.quadraticCurveTo(0.48, 2.08, 0.33, 2.22);
        shape.quadraticCurveTo(0.07, 2.54, -0.35, 2.5);
        shape.quadraticCurveTo(-0.83, 2.46, -1, 2);
        shape.quadraticCurveTo(-1.14, 1.5, -1.14, 0.99);
        shape.quadraticCurveTo(-1.13, 0.49, -1, 0);
        shape.lineTo(0, 0);

        const options = {
            depth: 0.5,
            bevelEnabled: true,
            bevelThickness: 0.8,
            bevelSize: 0.3,
            bevelSegments: DETAIL_LEVEL,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, options);
        const shapeBrush = new CSG.Brush(geometry, material);

        const cilGeo = new THREE.CylinderGeometry(1.05, 1.2, 0.95, DETAIL_LEVEL);
        cilGeo.translate(-0.65, -0.4, 0.25);
        cilGeo.scale(0.7, 1, 1);
        const cilBrush = new CSG.Brush(cilGeo, material);

        const cilindroGeo3 = new THREE.CylinderGeometry(0.4, 0.3, 1.75, DETAIL_LEVEL);
        const cilinBrush = new CSG.Brush(cilindroGeo3, material);

        const esferaGeo = new THREE.SphereGeometry(0.4, DETAIL_LEVEL, DETAIL_LEVEL);
        esferaGeo.translate(0, 0.87, 0);
        const esferaBrush = new CSG.Brush(esferaGeo, material);

        let dedo = evaluador.evaluate(cilinBrush, esferaBrush, CSG.ADDITION);
        dedo.geometry.scale(1, 1, 0.75);
        dedo.geometry.rotateX(THREE.MathUtils.degToRad(22));
        dedo.geometry.rotateZ(THREE.MathUtils.degToRad(-20));
        dedo.geometry.translate(-0.5, 1.2, 1.4);

        let puno = evaluador.evaluate(shapeBrush, cilBrush, CSG.ADDITION);
        let guante = evaluador.evaluate(dedo, puno, CSG.ADDITION);

        // Brazo Superior
        const brazoSupLength = 5;
        const brazoSup = new THREE.CylinderGeometry(0.3, 0.3, brazoSupLength, 16);

        brazoSup.translate(0, -brazoSupLength / 2, 0);
        const brazoSupMesh = new THREE.Mesh(brazoSup, material2);

        // Hombro
        const pivoteHombro = new THREE.Object3D();
        pivoteHombro.position.set(0, 0, 0);

        // Rotación
        const angulo = -30 * Math.PI / 180;
        brazoSupMesh.rotation.x = angulo;

        // Codo
        const codoPos = new THREE.Vector3(0, -brazoSupLength, 0);
        codoPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), angulo);

        // Pivote del codo
        const pivoteCodo = new THREE.Object3D();
        pivoteCodo.position.copy(codoPos);

        // Esfera del codo
        const codoGeo = new THREE.SphereGeometry(0.5, DETAIL_LEVEL, DETAIL_LEVEL);
        const codoMesh = new THREE.Mesh(codoGeo, material2);
        codoMesh.position.set(0, 0, 0); // el codo está en el origen del pivoteCodo

        // Brazo inferior
        const brazoInfLength = 3;
        const brazoInf = new THREE.CylinderGeometry(0.3, 0.3, brazoInfLength, 16);
        brazoInf.translate(0, -brazoInfLength / 2, 0);
        const brazoInfMesh = new THREE.Mesh(brazoInf, material2);
        brazoInfMesh.rotation.x = 0;

        // Guante
        const meshGuante = new THREE.Mesh(guante.geometry, material);
        meshGuante.position.y = -brazoInfLength - 0.5; // al final del brazo inferior
        meshGuante.position.x = 0.5;
        meshGuante.rotation.x = Math.PI; // <-- Gira el guante 180 grados para que mire hacia abajo

        this.colorOriginal = material.color.getHex();

        // Jerarquía
        pivoteCodo.add(codoMesh);
        pivoteCodo.add(brazoInfMesh);
        pivoteCodo.add(meshGuante);

        pivoteHombro.add(brazoSupMesh);
        pivoteHombro.add(pivoteCodo);

        this.add(pivoteHombro);

        // Referencias animación
        this.pivoteHombro = pivoteHombro;
        this.pivoteCodo = pivoteCodo;
        this.brazoSupMesh = brazoSupMesh;
        this.brazoInfMesh = brazoInfMesh;
        this.meshGuante = meshGuante;
    }

    // Devuelve el color original del guante
    repaint() {
        this.meshGuante.material.color.set(this.colorOriginal);
    }
}

export { Guan_R };