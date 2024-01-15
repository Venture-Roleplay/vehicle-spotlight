import { Vector3 } from "vectors";

export function RotAnglesToVec(z: number, x: number) {
    const zRad = (z * Math.PI) / 180;
    const xRad = (x * Math.PI) / 180;
    const num = Math.abs(Math.cos(xRad));
    const vect = Vector3(
        -Math.sin(zRad) * num,
        Math.cos(zRad) * num,
        Math.sin(xRad)
    );
    return {
        x: vect.x,
        y: vect.y,
        z: vect.z,
    };
}
