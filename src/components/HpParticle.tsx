import * as THREE from 'three'
import { useMemo, useRef } from "react";
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from "gsap";

interface UserSquareProps {
    animationStart : boolean;
}

import { Vertex } from '@/shaders/vertex';
import { Fragment } from '@/shaders/fragment';

export function HpParticle({animationStart} : UserSquareProps) {
    const userRef = useRef<THREE.Mesh>(null!);
    const {camera} = useThree();

    // const pTimeRef = useRef({value : 0});

    const timeline = gsap.timeline({repeat: 2, repeatDelay: 2.5}); 

    const uniforms = useMemo(
        () => ({
            u_color: {
                // value: new THREE.Vector3(255,255,255),
                value: new THREE.Color("hsl(0, 0.00%, 100.00%)"),
            },
            u_intensity: {
                value: animationStart? 0.1 : 0,
            },
            u_time: {
                value: 0.0,
            },
        }), []
    );

    useFrame(({clock}) => {
        (userRef.current.material as THREE.ShaderMaterial).uniforms.u_time.value = 0.4 * clock.getElapsedTime(); // Type ShaderMaterial needed to get the unforms... to register
        if (animationStart) {
            if (userRef.current) userRef.current.rotation.x += 0.005;
            if (userRef.current) userRef.current.rotation.y -= 0.005;
            if (userRef.current) userRef.current.rotation.z += 0.005; 
        }
        else {
            if (userRef.current) userRef.current.rotation.y += 0.005;
        }
    })

    if (animationStart) {
        timeline.to(camera.position, {
            x: 0, 
            y: -1.2,
            z: 8,
            duration: 2.5,
        });

        timeline.to(camera.position, {
            x: 0, 
            y: -1.2,
            z: 3,
            duration: 2.5,
        });
    }
    
    return (
        <mesh
        ref={userRef}
        position={[0, -1.2, 4]}
        scale={1}
      >
        <icosahedronGeometry args={[1, 1]} />
        <shaderMaterial
          fragmentShader={Fragment}
          vertexShader={Vertex}
          uniforms={uniforms}
          wireframe={false}
        />
      </mesh>
    )
}