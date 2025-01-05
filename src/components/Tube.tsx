import * as THREE from 'three'
import { FriendPositions } from '@/components/types'; // Getting types

import { TubeFragment } from '@/shaders/fragment';
import { TubeVertex } from '@/shaders/vertex';
import { useMemo } from 'react';

interface TubeProps {
    po : {
        pId: string,
        x: number,
        y: number, 
        z: number
    },
    allPositions: FriendPositions
}

interface TubeInstanceProps {
    position: [number,number,number, number,number,number]; //each triplet is a set of coordiantes that make up the tube's path
}

const getHSL = (x: number, y: number) => {
    // HSL color values are specified with: hsl(hue, saturation, lightness)
    // Hue: The position of a color on the color wheel, represented as an angle in degrees. Red is 0°, green is 120°, and blue is 240°.
    // Saturation: The intensity of a color, represented as a percentage. 100% is full saturation, and 0% is a shade of gray.
    // Lightness: The brightness of a color, represented as a percentage. 100% lightness is white, 0% lightness is black, and 50% lightness is normal.
    if (x === 0 && y === 0 || x === 100 && y === 100|| x === -100 && y === -100 ) {
      return `hsl(0, 0%, 100%)`; 
    }
    const hue = ((Math.atan2(y, x) * 180) / Math.PI) + 180;
    const saturation = (Math.sqrt(x**2 + y**2));
    const lightness = "50%";
    return `hsl(${hue}, ${saturation + 70}%, ${lightness})`;
  
}

function TubeInstance({position} : TubeInstanceProps){
    const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3( position[0],position[1],position[2]),
        // new THREE.Vector3( po.x/2, po.y/2, 0),
        new THREE.Vector3(position[3],position[4],position[5]),
    ])

    const uniforms = useMemo(
        () => ({
            u_color1: {
                value: new THREE.Color(getHSL(position[0], position[1])),
            },
            u_color2: {
                value: new THREE.Color(getHSL(position[3], position[4]))
            }
        }), []
    );
    return (
        <>
            <mesh>
                <tubeGeometry args={[path, 1, 1, 8, false]}/>
                {/* <meshStandardMaterial /> */}
                <shaderMaterial 
                    fragmentShader= {TubeFragment}
                    vertexShader= {TubeVertex}
                    uniforms={uniforms}
                />
            </mesh>
        </>
    )
}

export function Tube({po, allPositions} : TubeProps) {
    if (po.x === 0 && po.y === 0 && po.z === 0) {
        return
    }

    let start = allPositions[po.pId];
    let friendPos
    let tubeCoordinates: [number,number,number, number,number,number]
    const friendAdjList = [];

    while (start.x !== 0 && start.y !== 0 && start.z !== 0) {
        friendPos = allPositions[start.calledID]
        tubeCoordinates = [start.x, start.y, start.z, friendPos.x,friendPos.y,friendPos.z]
        friendAdjList.push(tubeCoordinates)
        start = friendPos
    }

    return (
        friendAdjList.map((coordiantes) => {
            return (
                <TubeInstance position={coordiantes} key={coordiantes.toString()}/>
            )
        })
    )
}