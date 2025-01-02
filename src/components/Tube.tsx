import * as THREE from 'three'
import { FriendList, Friend, SteamProfile, FriendPositions, RecentlyPlayed } from '@/components/types'; // Getting types

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

function TubeInstance({position} : TubeInstanceProps){
    // console.log("exe")
    const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3( position[0],position[1],position[2]),
        // new THREE.Vector3( po.x/2, po.y/2, 0),
        new THREE.Vector3(position[3],position[4],position[5]),
    ])
    return (
        <>
            <mesh>
                <tubeGeometry args={[path, 64, 1, 8, false]}/>
                <meshStandardMaterial />
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
    // console.log(allPositions);

    while (start.x !== 0 && start.y !== 0 && start.z !== 0) {
        friendPos = allPositions[start.calledID]
        console.log(start, friendPos);
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