// 76561198066405189  - Person with 2000 Friends

import { FriendList, SteamProfile, FriendPositions, FriendsAdded, SteamNames } from '@/components/types'; // Getting types
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei';
import { useState, useRef, useEffect } from "react";

import { Particle } from './Particle';
import { FriendProfie } from './FriendProfile';
import { Tube } from './Tube';

import "./fiberpage.css"

import * as THREE from 'three'
import { DEG2RAD } from 'three/src/math/MathUtils.js'

interface ParticleInfo {
    pId: string,
    friend_since : number,
    x: number,
    y: number, 
    z: number
}

interface CameraAnimationProps {
  particlePos : [number,number,number];
  cameraRef: React.RefObject<CameraControls>;
}

function CustomCameraControls({particlePos, cameraRef} : CameraAnimationProps){
  const currentPos = new THREE.Vector3();
  
  useEffect(() => {
    if (cameraRef.current?.camera.position.equals(new THREE.Vector3(0,3.061616997868383e-16,5))) {
      // setLookAt( positionX, positionY, positionZ, targetX, targetY, targetZ, enableTransition )
      cameraRef.current.setLookAt(0,0,200, 0,0,0, true);
    }
    else if ( cameraRef.current && cameraRef.current.getPosition(currentPos).z < particlePos[2]) {
      cameraRef.current?.setLookAt(particlePos[0],particlePos[1],particlePos[2] - 200, particlePos[0],particlePos[1],particlePos[2], true);
    }
    else {
      cameraRef.current?.setLookAt(particlePos[0],particlePos[1],particlePos[2] + 200, particlePos[0],particlePos[1],particlePos[2], true);
    }
  }, [particlePos, cameraRef]); // Adding currentPos resets back to the main user

  return(<CameraControls
    enabled={true}
    ref={cameraRef}
    />)
}

const getProfileHSL = (x: number, y: number) => {
    if (x === 0 && y === 0 || x === 100 && y === 100|| x === -100 && y === -100 ) {
      return "#0B1829"; 
    }
    const hue = ((Math.atan2(y, x) * 180) / Math.PI) + 180;
    return `hsl(${hue}, 60%, 15%)`;
}
  
interface FiberPageProps {
    steamProfileProp : SteamProfile;
    friendsListProp : FriendList;
    friendsPositionProp : FriendPositions;
    friendsAddedProp : FriendsAdded;
    steamNamesProps: SteamNames;
}

export function FiberPage({steamProfileProp, friendsListProp, friendsPositionProp, friendsAddedProp, steamNamesProps} : FiberPageProps) {
  // Structures passed to fiberPage from homePage
  const [steamProfile] = useState<SteamProfile>(steamProfileProp);
  const [friendsList, setFriendsList] = useState<FriendList | null>(friendsListProp);
  const [friendsPos, setFriendsPos] = useState<FriendPositions | null>(friendsPositionProp);
  const friendsAdded = friendsAddedProp;
  const steamNames = steamNamesProps;

  const [displayedSteamId, setDisplayedSteamId] = useState<ParticleInfo | null>(null);

  // States for handling camera
  const [cameraSettings, setCameraSettings] = useState<boolean>(false);
  const [horizontalCamera, setHorizontalCamera] = useState<string>("right");
  const [verticalCamera, setVerticalCamera] = useState<string>("up");
  const [freeRoam, setFreeRoam] = useState<string>("free roam");
  const [cameraPos, setCameraPos] = useState<[number, number, number] | [0,0,0]>([0,0,0]);
  const cameraControlsRef = useRef<CameraControls>(null);
  
  // Styling States
  const [profileBgColor, setBgColor] = useState<string>("#0B1829");
  const [freeRoamIcon, setFreeRoamIcon] = useState<string>("/images/arrow-repeat.svg");
  const [visibleDatabase, setVisibleDatabase] = useState<boolean>(false);
  const [visibleProfile, setVisibleProfile] = useState<boolean>(true);

  // Misc States
  const [disabledRandom, setDisabledRandom] = useState<boolean>(false);
  const [showUI, setUI] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Next two functions are for updating both maps FriendList and FriendPos with friend's friendList data
  const handleNewFriendsList = (newFriends : FriendList | null) => {
      if (newFriends && friendsPos && friendsList) {
        const friendListClone = {... friendsList} // Deep copy
        newFriends.friends.map((friend) => {
        if (!(friend.steamid in friendsPos || friend.steamid === steamProfile?.steamid) ) {
            friendListClone.friends.push(friend); 
        }
        })
        setFriendsList(friendListClone);
      }
  }

  const handleNewFriendsPosition = (newFriendsPos : FriendPositions | null) => {
    if (newFriendsPos && friendsPos) {
      const friendsPosClone = {... friendsPos}; 
      for (const key of Object.keys(newFriendsPos)) {
        if (!(key in friendsPos || key === steamProfile?.steamid) ) {
          friendsPosClone[key] = newFriendsPos[key]
        }
      }
      setFriendsPos(friendsPosClone);
    }
  }

  const handleClick = (pInfo: ParticleInfo) => {
    setDisplayedSteamId(pInfo);
    setBgColor(getProfileHSL(pInfo.x, pInfo.y));
    setUI(true);
    setVisibleProfile(true);
  }

  const turnOff = () => {
    setDisplayedSteamId(null);
    setBgColor("#0B1829");
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (friendsPos) {
      let user = search;

      // Checking for steamName
      for (const [key, value] of Object.entries(steamNames)) {
        if (value === user) {
          user = key;  
          break;
        }
      }
      
      // Check if user is in friendsPos
      if (user in friendsPos) {
        const position = friendsPos[user];
        const info: ParticleInfo = {
          pId: user,
          friend_since: position.timestamp,
          x: position.x,
          y: position.y,
          z: position.z,
        };
  
        // State updates (ensure these happen outside the render)
        setDisplayedSteamId(info);
        setBgColor(getProfileHSL(info.x, info.y));
        setCameraPos([position.x, position.y, position.z]);
      } else {
        alert('Friend Id not Found');
      }
    }
  };
  

  const randomFriend = () => {
    if (friendsPos) {
      // Getting a random id
      const friend_ids = Object.keys(friendsPos);
      const friend_ids_length = friend_ids.length;
      const random_friend = Math.floor(Math.random() * (friend_ids_length));

      // Get the info and set the corresponding states
      const position = friendsPos[friend_ids[random_friend]];
      const info : ParticleInfo = {
        pId: friend_ids[random_friend],
        friend_since : position.timestamp,
        x: position.x,
        y: position.y, 
        z: position.z
      }
      setDisplayedSteamId(info);
      setVisibleProfile(true);
      setBgColor(getProfileHSL(info.x,info.y));
      setCameraPos([position.x, position.y, position.z]);
      setDisabledRandom(true);

      setTimeout(() => {
        setDisabledRandom(false);
      }, 1000)
    }

  }

  const backToUser = () => {
    if (steamProfile) {
      const userInfo : ParticleInfo = {
        pId: steamProfile.steamid,
        friend_since: 0,
        x: 0,
        y: 0,
        z: 0
      }
      setDisplayedSteamId(userInfo);
      setBgColor("#0B1829");
      setCameraPos([0,0,0]);
    }
  }

  const hideUI = () => { setUI(false); }

  const setNewFocus = (newFocus : [number,number,number]) => { setCameraPos(newFocus); }

  const hideFriendProfile = () => { setVisibleProfile(false); }

  // camera control buttons  
  const moveCameraHorizontally = (deg: number) => {
    const sign = (horizontalCamera === "right")? 1 : -1;
    cameraControlsRef.current?.rotate(deg * DEG2RAD * sign, 0, true);
  }

  const moveCameraVertically = (deg: number) => {
    const sign = (verticalCamera === "up")? -1 : 1;
    cameraControlsRef.current?.rotate(0, deg * DEG2RAD * (sign), true);
  }

  const zoomIn = () => { cameraControlsRef.current?.dolly(45, true); }

  const zoomOut = () => { cameraControlsRef.current?.dolly(-45, true); }
  
  const intervalID = useRef<number | null | NodeJS.Timeout>(null); //NodeJS.Timeout needed in this nextjs app

  const handleFreeRoam = () => {
    if (freeRoam && intervalID.current) {
      clearInterval(intervalID.current);
      intervalID.current = null
      setFreeRoam("free roam")
      setFreeRoamIcon("/images/arrow-repeat.svg");
    } else {
      intervalID.current = setInterval(freeRoamAnimation, 250) //The default smooth time for camera controls is 0.25 seconds: (.smoothTime)
      setFreeRoam("pause")
      setFreeRoamIcon("/images/pause-circle.svg")
    }       
  }

  const toggleCameraSettings = () => { setCameraSettings(!cameraSettings); }

  const toggleHorizontalCamera = () => {
    if (horizontalCamera === "right") {
      setHorizontalCamera("left");
    }
    else {
      setHorizontalCamera("right");
    }
  }

  const toggleDatabase = () => { setVisibleDatabase(!visibleDatabase); }

  const toggleVerticalCamera = () => {
    if (verticalCamera === "up") {
      setVerticalCamera("down");
    }
    else {
      setVerticalCamera("up");
    }
  }

  function freeRoamAnimation() {
    cameraControlsRef.current?.rotate(5 * DEG2RAD, 0, true); // This is a pretty cool spin animation
    // cameraControlsRef.current?.rotate(0,-10 * DEG2RAD, true); // This is a pretty cool spin animation
  }

  const cameraStyle = {
    maxHeight: cameraSettings? Math.min(277, window.innerHeight - 136) : 0,
    overflow: cameraSettings && 413 > window.innerHeight ? "scroll" : "hidden", // Add scroll if content exceeds viewport height      transition: 'max-height 0.5s ease',
    transition: 'max-height 0.5s ease',
    backgroundColor: "#0d0c1113",
    width: "fit-content",
    paddingRight: "6px", //for the scrollbar to not overlap
  } 

  const horizontalStyle = {
    transform: (horizontalCamera === "right")? "scaleX(1)" : "scaleX(-1)",
    transition: "all 0.5 linear"
  }

  const verticalStyle = {
    transform: (verticalCamera === "up")? "scaleY(1)" : "scaleY(-1)",
    transition: "all 0.5 linear"
  }

  const randomBtnStyle = {
    opacity: disabledRandom? 0.2: 1,
    transition: "opacity 0.25s linear"
  }

  const prevUsersStyle = {
    maxHeight: visibleDatabase? Math.min(125, 25 * Object.keys(steamNames).length): 0,
    transition: "max-height 0.5s ease",
  }

  if (friendsList && steamProfile && friendsPos) {
    const friendProfileBg = {
      background: `linear-gradient(#0B1829 0%, #0B1829 34%,${profileBgColor} 100%)`,
      display: visibleProfile? "block": "none",
    }

    return (
      <div id='fiberpage-container'>
        <Canvas camera={{near: 1, far:1500} }> {/* far: 1000 seems to be when objects clip at the furthest distance*/}
          {/* This is the user's particle */}
          <Particle position={{"x": 0,"y": 0,"z": 0,"timestamp": 0,"calledID": ""}} key={steamProfile.steamid} id={steamProfile.steamid} currentSteamNames={steamNames} clicked={handleClick}/>

          {/* Looping over friendsList to create a new particle for each friend naively */}
          {/* A more optimized approach is to use instancing, but I'll save the optimization for the future as I get better with THREE */}
          <ambientLight intensity={3} />
          
          <CustomCameraControls particlePos={cameraPos} cameraRef={cameraControlsRef}/>

          {friendsList.friends.map((friend) => {
            return (
              <Particle position={friendsPos[friend.steamid]} key={friend.steamid} id={friend.steamid} currentSteamNames = {steamNames} clicked={handleClick}/>
            )
          })}
          {displayedSteamId && <Tube po={displayedSteamId} allPositions = {friendsPos}/>}
        </Canvas>

        {displayedSteamId && 
        <>
        <div style={friendProfileBg} id='friend-container'>
          <div id='star-bg'></div>
          <button id='friend-close-btn' onClick={turnOff}>X</button>
          <FriendProfie friend_id= {displayedSteamId.pId} friend_since={displayedSteamId.friend_since} setFocus={setNewFocus} hideFriend={hideFriendProfile} allPositions = {friendsPos} friendsListProp ={handleNewFriendsList} friendsPositionProp={handleNewFriendsPosition} friendsAddedProp={friendsAdded} currentSteamNames = {steamNames}/>
        </div>
        </>
        }

        {showUI && <>
          <div id='search-wrapper'>
            <form id='search-container' onSubmit={handleSubmit}>
              <input
                  type="text"
                  value={search}
                  name="input-search-steamID"
                  onChange={(e) => setSearch(e.target.value)}
              />
              <input 
                  type="submit"
                  style={{cursor:'pointer'}}
              />
            </form>
            <button className="database-btn" onClick={toggleDatabase}>
              <img src="/images/database.svg" width={15} height={15} alt='button for toggling list of steam names previously seen'></img>
            </button>
            <div id='prev-users-wrapper' style={prevUsersStyle}>
              <div id='previous-users'>
                {Object.values(steamNames).map((value) => {
                  return (
                    <button key={`button for user ${value}`} className='steam-names-btn' onClick={() => {setSearch(value)}}>
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div id='camera-container'>
            <div id='select-btns'> 
              <button onClick={randomFriend} style={{border: 0, backgroundColor: "transparent", padding: 0}} disabled={disabledRandom}>
                <img fetchPriority='low' src='/images/shuffle.svg' width={40} height={40} className='cursor-pointer' style={randomBtnStyle} alt='Click to select a random friend'/>  
              </button>
              <img fetchPriority='low' onClick={backToUser} src='/images/focus.svg' width={40} height={40} className='cursor-pointer' alt='Click to focus back to yourself'/>  
            </div>

            <img fetchPriority='low' id='toggleCameraSettings' onClick={toggleCameraSettings} src='/images/cameraSettings.svg' width={50} height={50} className='cursor-pointer' alt='Click to toggle camera settings'></img>
            
            <div style={cameraStyle}>                    
              <div className='settings-container'>
                <div onClick={toggleHorizontalCamera} className='camera-container'>
                  <img fetchPriority='low' src="/images/cameraBase.svg" width={50} height={50} className='base-camera cursor-pointer' alt='base camera image'></img>
                  <img fetchPriority='low' src="/images/arrow-right.svg" width={25} height={25} style={horizontalStyle} className='arrow cursor-pointer' alt={`Currently toggled to face ${horizontalCamera}`}></img>
                </div>
                <div id='horizontal-degrees'>
                  {/* <button onClick={fourdegrees}>45°</button> */}
                  <button onClick={() => moveCameraHorizontally(45)}>45°</button>
                  <button onClick={() => moveCameraHorizontally(90)}>90°</button>
                  <button onClick={() => moveCameraHorizontally(180)}>180°</button>
                </div>
              </div>
  
              <div className='settings-container'>
                <div onClick={toggleVerticalCamera} className='camera-container cursor-pointer'>
                  <img fetchPriority='low' src="/images/cameraBase.svg" width={50} height={50} className='base-camera cursor-pointer' alt='base camera image'></img>
                  <img fetchPriority='low' src="/images/arrow-up.svg" width={25} height={25} style={verticalStyle} className='arrow cursor-pointer' alt={`Currently toggled to face ${verticalCamera}`}></img>
                </div>
                <button id='fortyfive-degrees' onClick={() => moveCameraVertically(45)}>45°</button>
              </div>
              <div id='zoom-btns'>
                <img fetchPriority='low' onClick={zoomIn} src='/images/zoom-in.svg' width={30} height={30} className='cursor-pointer' alt='Click to zoom in'></img>
                <img fetchPriority='low' onClick={zoomOut} src='/images/zoom-out.svg' width={30} height={30} className='cursor-pointer' alt='Click to zoom out'></img>
              </div>
              <div>
                <div onClick={handleFreeRoam} className='camera-container'>
                  <img fetchPriority='low' src="/images/cameraBase.svg" width={50} height={50} className='base-camera cursor-pointer' alt='base camera image'></img>
                  <img fetchPriority='low' src={freeRoamIcon} width={25} height={25} className='arrow cursor-pointer' alt={`Currently toggled to ${freeRoam} on click`}></img>
                </div>
              </div>
              <img fetchPriority='low' onClick={hideUI} src='/images/hide.svg' width={50} height={50} className='cursor-pointer' alt='Click to hide UI'></img>
            </div>
          </div>
        </>
      }
      </div>
    )
  }
}