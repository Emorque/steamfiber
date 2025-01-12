import { useMemo, useRef, useState } from "react";
import { SteamNames } from "./types";
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { getHSL } from "@/utils/helper";
import { Fragment } from "@/shaders/fragment";
import { Vertex } from "@/shaders/vertex";
import { Text } from '@react-three/drei';


interface ParticleInfo {
    pId: string,
    friend_since : number,
    x: number,
    y: number, 
    z: number
}

interface LabelProps {
    position: {
        "x": number, 
        "y": number, 
        "z": number,
        "timestamp": number,
        "calledID": string
    };
    id: string;
    currentSteamNames: SteamNames;
    clicked : (pInfo: ParticleInfo) => void;
}

export function Particle({position, id, currentSteamNames, clicked} : LabelProps){
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!);
  const textRef = useRef<THREE.Mesh>(null!);
  const [active, setActive] = useState(false);

  const { camera } = useThree();

  const steamName = currentSteamNames[id]? currentSteamNames[id] : "?";

  const uniforms = useMemo(
      () => ({
          u_color: {
              // value: new THREE.Vector3(255,255,255),
              value: new THREE.Color(getHSL(position.x, position.y)),
          },
          u_intensity: {
              value: 0.8,
          },
          u_time: {
              value: 0.0,
          },
      }), []
  );

  useFrame(({clock}) => {
      // Rotate the mesh continuously
      if (active) {
        if (ref.current) ref.current.rotation.x += 0.010;
        if (ref.current) ref.current.rotation.y -= 0.001;
        if (ref.current) ref.current.rotation.z += 0.001;
      }

      if (textRef.current) textRef.current.lookAt(camera.position);        
      (ref.current.material as THREE.ShaderMaterial).uniforms.u_time.value = 0.5 * clock.getElapsedTime(); // Type ShaderMaterial needed to get the unforms... to register
  });

  const handleClick = () => {
      clicked({pId: id, friend_since: position.timestamp, x: position.x, y: position.y, z: position.z}); 
  }

  return (
      <>
          <mesh 
              position={[position.x,position.y,position.z]} 
              ref={ref}
              scale={active ? 1.15 : 1} 
              onPointerEnter={(e) => {
                setActive(true);
                e.stopPropagation();  
              }}
              onPointerLeave={(e) => {
                setActive(false);
                e.stopPropagation();
              }}
              onClick={(e) => {
                handleClick();
                e.stopPropagation();
              }}
          >
            <icosahedronGeometry args={[10, 1]} />
            <shaderMaterial
              fragmentShader={Fragment}
              vertexShader={Vertex}
              uniforms={uniforms}
              wireframe={false}
            />
          </mesh>
          {active && (
              <Text ref={textRef} fontSize={5} position={[position.x,position.y + 15,position.z]}>{steamName}</Text>
          )}
      </>
  );
}