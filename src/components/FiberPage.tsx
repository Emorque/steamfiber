// 76561198066405189  - Person with 2000 Friends

import { FriendList, SteamProfile, FriendPositions, RecentlyPlayed, FriendsAdded, SteamNames } from '@/components/types'; // Getting types
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, Text } from '@react-three/drei';
import { useState, useRef, useEffect, useMemo} from "react";

import { getSteamProfile, getFriendsList, getRecentGames } from "./steamapi";
import { Tube } from './Tube';

import "./fiberpage.css"

import * as THREE from 'three'
import { DEG2RAD } from 'three/src/math/MathUtils.js'

import { Vertex } from '@/shaders/vertex';
import { Fragment } from '@/shaders/fragment';

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
    timestamp : number;
    clicked : (pInfo: ParticleInfo) => void;
}

interface FriendProps {
    friend_id : string;
    friend_since: number;
    setFocus : (currParticlePos : [number,number,number]) => void;
    hideFriend: (setHide : boolean) => void;
    allPositions: FriendPositions;
    friendsListProp: (newFriends : FriendList | null) => void;
    friendsPositionProp: (newFriendsPos : FriendPositions | null) => void;
    friendsAddedProp: FriendsAdded;
    currentSteamNames : SteamNames;
}

interface CameraAnimationProps {
    particlePos : [number,number,number];
    cameraRef: React.RefObject<CameraControls>;
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
  const saturation = Math.min(Math.max(Math.sqrt(x**2 + y**2), 10), 80);
  const lightness = "50%";
  return `hsl(${hue}, ${saturation}%, ${lightness})`;
}

function Three({position, id, currentSteamNames, timestamp, clicked} : LabelProps){
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
        clicked({pId: id, friend_since: timestamp, x: position.x, y: position.y, z: position.z}); 
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
              {/* <boxGeometry args={[10, 10, 10]} /> */}
              <shaderMaterial
                fragmentShader={Fragment}
                vertexShader={Vertex}
                uniforms={uniforms}
                wireframe={false}
              />
                {/* <meshStandardMaterial color={getHSL(position.x, position.y)}/> */}

            </mesh>
            {active && (
                <Text ref={textRef} fontSize={5} position={[position.x,position.y + 15,position.z]}>{steamName}</Text>
            )}
        </>
    );
}

const stateStyle: {[id: number] : string} = {
    0: "Offline", 
    1: "Online", 
    2: "Busy", 
    3: "Away", 
    4: "Snooze", 
    5: "Looking to Trade", 
    6: "Looking to Play"
}
 
  
function FriendProfie({friend_id, friend_since, setFocus, hideFriend, allPositions, friendsListProp, friendsPositionProp, friendsAddedProp, currentSteamNames}  : FriendProps ) {
    const [friendProfile, setFriendProfile] = useState< SteamProfile | null>(null);
    const [recentGames, setRecentGames] = useState< RecentlyPlayed | null>(null);
    const [error, setError] = useState< string | null >(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [chainHeight, setChainHeight] = useState<number>(0);
  
    const getSign = () => {
      return Math.random() < 0.5 ? 1 : -1
    }

    const errorStyle = {
      opacity: error? 1 : 0,
      transform: error? "translate(10px,15px)" : "translate(10px,0px)",
      transition: "all 0.25s linear",
    }

    const errorFunc = (err: string) => {
      setError(err)
      setTimeout(() => {
        setError(null)
      }, 1500);
    }

    let friend_since_date = new Date(friend_since * 1000).toLocaleDateString('en-Us', { month: 'short', year: 'numeric', day: 'numeric' });
    if (friend_since_date === "Dec 31, 1969") { //This is the starting point of the UNIX timestamp. Only applicable to the user
      friend_since_date = ""
    }

    const friend_chain = []
    let current_id = friend_id;
    let next_id;

    while (current_id !== "") {
      next_id = allPositions[current_id].calledID;
      friend_chain.push(current_id);
      current_id = next_id;
    }
    friend_chain.pop();

    const fiberLineStyle = {
      maxHeight: chainHeight + "px", 
    }

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true); 
        const steamProfile = await getSteamProfile(friend_id);
        const recentlyPlayed = await getRecentGames(friend_id);
  
        setFriendProfile(steamProfile); 
        setRecentGames(recentlyPlayed); 
  
        if (steamProfile && recentlyPlayed) {
          setLoading(false); 
          currentSteamNames[steamProfile.steamid] = steamProfile.personaname;
        }
      };
    
      fetchData(); // Call the async function
    }, [friend_id]); // Dependency array ensures the effect runs when friend_id changes
    
    // https://react.dev/reference/rsc/server-components
      if (friendProfile && recentGames && !loading) {
        const setNewFocus = (focus_id : string) => {
          const currParticlePos = allPositions[focus_id]
          setFocus([currParticlePos.x,currParticlePos.y,currParticlePos.z]);
        }

        const hideProfile = () => {
          hideFriend(false);
        }
  
        const copyToClipboard = () => {
          navigator.clipboard.writeText(friend_id);
        }
  
        const addFriends = async () => {
          // if (allPositions.length)
          if (Object.keys(allPositions).length > 2000) {
            errorFunc("Friend Limit Reached");
            return;
          }
          if (friend_id in friendsAddedProp) {
            errorFunc("Friends Already Added");
            return;
          }
          const friendsFriendList = await getFriendsList(friend_id);
          if (friendsFriendList) {
            const currParticlePos = allPositions[friend_id]
            const forward = currParticlePos.z > 0 ? 1 : -1;
  
            friendsListProp(friendsFriendList);
            const newFriendsPos : FriendPositions = {}
  
            const length = friendsFriendList.friends.length
            const max = Math.sqrt(2000 * length) / 2;
  
            {friendsFriendList.friends.map((friend) => {
              if (!(friend.steamid in allPositions)) {
                const min = 1                
                const pos = {
                    "x": (getSign() * Math.random() * (max - min) + min) + currParticlePos.x,
                    "y": (getSign() * Math.random() * (max - min) + min) + currParticlePos.y,
                    "z": currParticlePos.z + (forward * (Math.random() * 50 + 25)),
                    "timestamp": friend.friend_since,
                    "calledFriend": friendProfile.personaname,
                    "calledID": friend_id
                }
                newFriendsPos[friend.steamid] = pos
              }
            });
            }
            friendsAddedProp[friend_id] = true;
            friendsPositionProp(newFriendsPos);
          }
          else {
            friendsAddedProp[friend_id] = false;
            errorFunc("Private Profile");
          }          
        }
  
        return (
          <div id='friend-profile'>
            <h2 id='friend-name'>{friendProfile.personaname}</h2>  
            <div id='photo-status'>
              <img id='friend-photo' src={friendProfile.avatarfull} fetchPriority='low' alt={`${friendProfile.personaname}'s Steam Picture`}></img>
              <div id='profile-buttons'>
                <h4>{stateStyle[friendProfile.personastate]}</h4>
                <div id='copy-focus'>
                  <img src="/images/focus.svg" height={30} width={30} onClick={() => setNewFocus(friend_id)} className='cursor-pointer' fetchPriority='low' alt={`Click to focus on ${friendProfile.personaname}`}></img>
                  <img src="/images/copy.svg" height={30} width={30} onClick={() => copyToClipboard()} className='cursor-pointer' fetchPriority='low' alt={`Click to copy ${friendProfile.personaname}'s Steam id`}></img>
                  <img fetchPriority='low' src='/images/hide.svg' width={30} height={30} onClick={() => hideProfile()} className='cursor-pointer' alt='Click to hide Friend Profile' id='friend-hide-btn'></img>
                </div>
              </div>
            </div>

            {friend_since_date && friendProfile.profileurl && <p>Friends Since: {friend_since_date}</p>}
            <p><a href={friendProfile.profileurl} target='blank'>Visit Profile</a></p>
            <div style={{position: "relative"}}>
              {/* <p onClick={() => addFriends()} style={{zIndex: 20, position: "relative"}}><a>Add Their Friends</a></p> */}
              <button id='add-friends-btn' onClick={() => addFriends()} style={{zIndex: 20, position: "relative"}}>Add Their Friends</button>


              {<p id='error-text' style={errorStyle}>{error}</p>}
            </div>
            {recentGames.games && 
            <>
              <h2>Recently Played:</h2>
              <div id='game-container'>
                {recentGames.games && recentGames.games.map((game) => {
                  return (
                    <div className='game' key={game.appid}>
                      <a href={`https://store.steampowered.com/app/${game.appid}/`} target='blank'>
                        <div className='game-metadata'>
                          <img fetchPriority='low' src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} alt={`Icon of ${game.name}`} className='game-icon'/>
                          <p>{game.name}</p>
                        </div>
                      </a>
                      <p>{(game.playtime_2weeks / 60).toFixed(1)} hrs played recently</p>
                      <p>{(game.playtime_forever / 60).toFixed(1)} hrs on Record</p>
                    </div>
                  )
                })}
              </div>
              <br/>
            </>
            }

            {/* Friend Chain */}
            {friend_chain.length > 0 && 
            <>                
              <h2>Your Thread:</h2>
              <div id='thread-container'>
                <div id='fiber-line' style={fiberLineStyle}></div>
                <button className='thread-btn' onClick={() => setNewFocus(friend_id)} onMouseEnter={() => {window.innerWidth > 700? setChainHeight(18) : setChainHeight(15)}} onMouseLeave={() => {setChainHeight(0)}}>
                  {friendProfile.personaname}
                </button>
                {friend_chain.map((link, index) => {
                  return (
                    <>
                      {/* <img fetchPriority='low' src="/images/arrow-up.svg" width={10} height={10} alt={`Down arrow for thread`}></img> */}
                      <button className='thread-btn' onClick={() => setNewFocus(allPositions[link].calledID)} onMouseEnter={() => {window.innerWidth > 700? setChainHeight( (18 * (index + 2)) + (10 * (index + 1)) ) : setChainHeight( (15 * (index + 2)) + (10 * (index + 1)) )}} onMouseLeave={() => {setChainHeight(0)}}>
                        {allPositions[link].calledFriend}
                      </button>
                    </>
                    
                  )
                })}
              </div>
            </>}
            {/* <>
              <h2>Your Thread:</h2>
              <p>{friendProfile.personaname}</p>
              {friend_chain && friend_chain.map((link) => {
                <p>{allPositions[link[0]].calledFriend}</p>
              })}
            </> */}
            <br/>
          </div>
        )
      } 
      else {
        return (
          <h2>Loading
            <span className='loading-dot'>.</span>
            <span className='loading-dot'>.</span>
            <span className='loading-dot'>.</span>
          </h2>
        )
      }    
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
    // const saturation = (Math.sqrt(x**2 + y**2));
    // const lightness = "50%";
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
    const [steamProfile] = useState<SteamProfile>(steamProfileProp);
    const [friendsList, setFriendsList] = useState<FriendList | null>(friendsListProp);
    const [friendsPos, setFriendsPos] = useState<FriendPositions | null>(friendsPositionProp);
    const friendsAdded = friendsAddedProp;
    const steamNames = steamNamesProps;

    const [displayedSteamId, setDisplayedSteamId] = useState<ParticleInfo | null>(null);

    // Styling States
    const [profileBgColor, setBgColor] = useState<string>("#0B1829");
    const [cameraSettings, setCameraSettings] = useState<boolean>(false);
    const [horizontalCamera, setHorizontalCamera] = useState<string>("right");
    const [verticalCamera, setVerticalCamera] = useState<string>("up");
    const [freeRoamIcon, setFreeRoamIcon] = useState<string>("/images/arrow-repeat.svg");
    const [showUI, setUI] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [freeRoam, setFreeRoam] = useState<string>("free roam");

    const [disabledRandom, setDisabledRandom] = useState<boolean>(false);

    const [visibleProfile, setVisibleProfile] = useState<boolean>(true);

    const cameraControlsRef = useRef<CameraControls>(null);
    const [cameraPos, setCameraPos] = useState<[number, number, number] | [0,0,0]>([0,0,0]);


    // Next two functions are for updating both maps FriendList and FriendPos with friend's friendList data
    const handleNewFriendsList = (newFriends : FriendList | null) => {
        if (newFriends && friendsPos && friendsList) {
          const friendListClone = {... friendsList}
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
  
    const handleSubmit = async (event : React.FormEvent) => {
      event.preventDefault();
      if (friendsPos) {
        if (search in friendsPos) {
          const position = friendsPos[search];
          const info : ParticleInfo = {
            pId: search,
            friend_since : position.timestamp,
            x: position.x,
            y: position.y, 
            z: position.z
          }

          setDisplayedSteamId(info);
          setBgColor(getProfileHSL(info.x,info.y));
          setCameraPos([position.x, position.y, position.z]);
        }
        else {
          alert('Friend Id not Found');
        }
      }    
    }
  
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
  
    const hideUI = () => {
      setUI(false);
    }
  
    const setNewFocus = (newFocus : [number,number,number]) => {
      setCameraPos(newFocus);
    }

    const hideFriendProfile = () => {
      setVisibleProfile(false);
    }
  
    // camera control buttons
    const fourdegrees = () => {
      const sign = (horizontalCamera === "right")? 1 : -1;
      cameraControlsRef.current?.rotate(45 * DEG2RAD * sign, 0, true); // This is a pretty cool spin animation
    }
    const ninedegrees = () => {
      const sign = (horizontalCamera === "right")? 1 : -1;
      cameraControlsRef.current?.rotate(90 * DEG2RAD * sign, 0, true); // This is a pretty cool spin animation
    }
    const hundreddegrees = () => {
      const sign = (horizontalCamera === "right")? 1 : -1;
      cameraControlsRef.current?.rotate(180 * DEG2RAD * sign, 0, true); // This is a pretty cool spin animation
    }
  
    const fourdegreesUp = () => {
      const sign = (verticalCamera === "up")? -1 : 1;
      cameraControlsRef.current?.rotate(0, 45 * DEG2RAD * (sign), true); // This is a pretty cool spin animation without the DEG2RAD
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
  
    if (friendsList && steamProfile && friendsPos) {
        const friendProfileBg = {
            background: `linear-gradient(#0B1829 0%, #0B1829 34%,${profileBgColor} 100%)`,
            display: visibleProfile? "block": "none",
        }
  
        return (
            <div id='fiberpage-container'>
              <Canvas camera={{near: 1, far:1500} }> {/* far: 1000 seems to be when objects clip at the furthest distance*/}
                {/* This is the user's particle */}
                <Three position={{"x": 0,"y": 0,"z": 0,"timestamp": 0,"calledID": ""}} key={steamProfile.steamid} id={steamProfile.steamid} currentSteamNames={steamNames} timestamp={0} clicked={handleClick}/>
    
                {/* Looping over friendsList to create a new particle for each friend naively */}
                {/* A more optimized approach is to use instancing, but I'll save the optimization for the future as I get better with THREE */}
                <ambientLight intensity={3} />
                
                <CustomCameraControls particlePos={cameraPos} cameraRef={cameraControlsRef}/>
    
                {friendsList.friends.map((friend) => {
                  return (
                      <Three position={friendsPos[friend.steamid]} key={friend.steamid} id={friend.steamid} currentSteamNames = {steamNames} timestamp={friend.friend_since} clicked={handleClick}/>
                  )
                })}
                {displayedSteamId && <Tube po={displayedSteamId} allPositions = {friendsPos}/>}
              </Canvas>

              {displayedSteamId && 
              <>
              <div style={friendProfileBg} id='friend-container'>
                {/* <div id='friend-container'>
                </div> */}
                <div id='star-bg'></div>
                <button id='friend-close-btn' onClick={turnOff}>X</button>
                <FriendProfie friend_id= {displayedSteamId.pId} friend_since={displayedSteamId.friend_since} setFocus={setNewFocus} hideFriend={hideFriendProfile} allPositions = {friendsPos} friendsListProp ={handleNewFriendsList} friendsPositionProp={handleNewFriendsPosition} friendsAddedProp={friendsAdded} currentSteamNames = {steamNames}/>
              </div>
              </>
              }

              {showUI && <>
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
                        <button onClick={fourdegrees}>45°</button>
                        <button onClick={ninedegrees}>90°</button>
                        <button onClick={hundreddegrees}>180°</button>
                      </div>
                    </div>
        
                    <div className='settings-container'>
                        <div onClick={toggleVerticalCamera} className='camera-container cursor-pointer'>
                          <img fetchPriority='low' src="/images/cameraBase.svg" width={50} height={50} className='base-camera cursor-pointer' alt='base camera image'></img>
                          <img fetchPriority='low' src="/images/arrow-up.svg" width={25} height={25} style={verticalStyle} className='arrow cursor-pointer' alt={`Currently toggled to face ${verticalCamera}`}></img>
                        </div>
                        <button id='fortyfive-degrees' onClick={fourdegreesUp}>45°</button>
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