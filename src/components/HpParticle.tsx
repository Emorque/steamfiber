import * as THREE from 'three'
import { useRef } from "react";
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from "gsap";

interface UserSquareProps {
    animationStart : boolean;
}

export function HpParticle({animationStart} : UserSquareProps) {
    const userRef = useRef<THREE.Mesh>(null!);
    const {camera} = useThree();

    const timeline = gsap.timeline({repeat: 2, repeatDelay: 2.5}); 

    useFrame(() => {
        if (animationStart) {
            if (userRef.current) userRef.current.rotation.x += 0.01;
            if (userRef.current) userRef.current.rotation.y += 0.01;   
        }
        else {
            if (userRef.current) userRef.current.rotation.z -= 0.01;
        }
    })

    if (animationStart) {
        timeline.to(camera.position, {
            x: 0, 
            y: -1,
            z: 8,
            duration: 2.5,
        });

        timeline.to(camera.position, {
            x: 0, 
            y: -1,
            z: 4,
            duration: 2.5,
        });
    }
    
    return (
        <mesh position={[0,-1,4]} ref={userRef}>
            <boxGeometry args={[1,1,1]}/>
            <meshStandardMaterial/>
        </mesh>
    )
}