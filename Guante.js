import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'


class Guante extends THREE.Object3D {
    constructor(isBlanca, DETAIL_LEVEL) {
        super();

        let material, material2;
        const evaluador = new CSG.Evaluator();

        if (isBlanca) {
            material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
            material2 = new THREE.MeshStandardMaterial({ color: 0xFBDBB5 });
        }

        else {
            material = new THREE.MeshStandardMaterial({ color: 0x0000FF });
            material2 = new THREE.MeshStandardMaterial({ color: 0x222222 })
        }

        // Puño
        this.shape = new THREE.Shape();
        this.shape.moveTo(0, 0);
        this.shape.quadraticCurveTo(-0.18, 0.46, -0.23, 0.96);
        this.shape.quadraticCurveTo(-0.26, 1.38, -0.19, 1.8);
        this.shape.quadraticCurveTo(-0.1, 1.96, 0.08, 1.9);
        this.shape.lineTo(0.17, 1.84);
        this.shape.quadraticCurveTo(0.29, 1.84, 0.36, 1.93);
        this.shape.quadraticCurveTo(0.48, 2.08, 0.33, 2.22);
        this.shape.quadraticCurveTo(0.07, 2.54, -0.35, 2.5);
        this.shape.quadraticCurveTo(-0.83, 2.46, -1, 2);
        this.shape.quadraticCurveTo(-1.14, 1.5, -1.14, 0.99);
        this.shape.quadraticCurveTo(-1.13, 0.49, -1, 0);
        this.shape.lineTo(0, 0);

        this.cilindroGeo3 = new THREE.CylinderGeometry(0.4, 0.3, 1.75, DETAIL_LEVEL);
        this.cilMesh3 = new THREE.Mesh(this.cilindroGeo3, material);

        this.esferaGeo = new THREE.SphereGeometry(0.4, DETAIL_LEVEL, DETAIL_LEVEL);
        this.esferaGeo.translate(0, 0.87, 0);

        var options = {
            depth: 0.5,
            bevelEnabled: true,
            bevelThickness: 0.8,
            bevelSize: 0.3,
            bevelSegments: DETAIL_LEVEL,
        };
        var geometry = new THREE.ExtrudeGeometry(this.shape, options);

        this.cilGeo = new THREE.CylinderGeometry(1.05, 1.2, 0.95, DETAIL_LEVEL);
        this.cilGeo.translate(-0.65, -0.4, 0.25);
        this.cilGeo.scale(0.7, 1, 1);

        this.cilinBrush = new CSG.Brush(this.cilindroGeo3, material);
        this.esferaBrush = new CSG.Brush(this.esferaGeo, material);
        this.shapeBrush = new CSG.Brush(geometry, material);
        this.cilBrush = new CSG.Brush(this.cilGeo, material);

        // Brazos
        const brazoInf = new THREE.CylinderGeometry(0.3, 0.3, 3, 3);
        brazoInf.translate(-0.5, -2.2, 0.2);
        const brazoInfBrush = new CSG.Brush(brazoInf, material2);

        const codo = new THREE.SphereGeometry(0.5, DETAIL_LEVEL, DETAIL_LEVEL);
        codo.translate(-0.5, -3.8, 0.2);
        const codoBrush = new CSG.Brush(codo, material2);

        const brazoSup = new THREE.CylinderGeometry(0.3, 0.3, 5, 3);
        brazoSup.rotateX(THREE.MathUtils.degToRad(-30));
        brazoSup.translate(-0.5, -6, 1.5);
        const brazoSupBrush = new CSG.Brush(brazoSup, material2);

        // Unión
        this.dedo = evaluador.evaluate(this.cilinBrush, this.esferaBrush, CSG.ADDITION);

        this.dedo.geometry.scale(1, 1, 0.75);
        this.dedo.geometry.rotateX(THREE.MathUtils.degToRad(22));
        this.dedo.geometry.rotateZ(THREE.MathUtils.degToRad(-20));
        this.dedo.geometry.translate(-0.5, 1.2, 1.4);

        this.puno = evaluador.evaluate(this.shapeBrush, this.cilBrush, CSG.ADDITION);
        this.guante = evaluador.evaluate(this.dedo, this.puno, CSG.ADDITION);

        // Adición de brazos
        this.guante = evaluador.evaluate(this.guante, brazoInfBrush, CSG.ADDITION);
        this.guante = evaluador.evaluate(this.guante, codoBrush, CSG.ADDITION);
        this.guante = evaluador.evaluate(this.guante, brazoSupBrush, CSG.ADDITION);

        // Brazo 2
        this.guante2 = this.guante.clone();
        this.guante2.translateZ(1);
        this.guante2.scale.set(0.5, 0.5, 0.5);
        this.guante2.rotateY(THREE.MathUtils.degToRad(90));
        this.guante2.rotateX(THREE.MathUtils.degToRad(160));

        this.guante.scale.set(0.5, 0.5, -0.5);
        this.guante.rotateY(THREE.MathUtils.degToRad(90));
        this.guante.rotateX(THREE.MathUtils.degToRad(-160));

        this.add(this.guante2);
        this.add(this.guante);
    }
}

export { Guante };