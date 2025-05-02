// 76561198066405189  - Person with 2000 Friends

import { SteamProfile, FriendPositions, FriendsAdded, SteamNames } from '@/components/types'; // Getting types
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei';
import { useState, useRef, useEffect } from "react";
import { createClient } from '@/utils/supabase/client'

import { Particle } from './Particle';
import { FriendProfie } from './FriendProfile';
import { Tube } from './Tube';

import "./fiberpage.css"
import "./wk.css"

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
    // friendsListProp : FriendList;
    friendsPositionProp : FriendPositions;
    friendsAddedProp : FriendsAdded;
    steamNamesProps: SteamNames;
}

export function FiberPageWK({steamProfileProp, friendsPositionProp, friendsAddedProp, steamNamesProps} : FiberPageProps) {
  // Structures passed to fiberPage from homePage
  const [steamProfile] = useState<SteamProfile>(steamProfileProp);
  // const [friendsList, setFriendsList] = useState<FriendList | null>(friendsListProp);
  const [friendsPos, setFriendsPos] = useState<FriendPositions | null>(friendsPositionProp);
  const friendsAdded = friendsAddedProp;
  const steamNames = steamNamesProps;

  // Supabase client
  const supabase = createClient();
  const [currentLink, setLink] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>();
  const [linkLoading, setLinkLoading] = useState<boolean>(false);
  // To limit their writes to about 5 a day, I'll use this state.
  // If more writes/reads are made to SteamFiber, I'll add an auth requirement for writes

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
  const [shareState, setShare] = useState<boolean>(false);
  const [visibleProfile, setVisibleProfile] = useState<boolean>(true);

  // Misc States
  const [disabledRandom, setDisabledRandom] = useState<boolean>(false);
  const [showUI, setUI] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  
  const [searchError, setSearchError] = useState<boolean>(false);
  
// New content pretaining to the walkthrough ver.
const [walkthrough, setWalkthrough] = useState<boolean>(true)
const [wkStep, setWKStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(1)

  // Tab click to toggle UI
  useEffect(() => {
    const handleKeyClick = (event : {key : string}) => {
      if (event.key === "Shift") {
        if (showUI || visibleProfile) {
          setUI(false);
          setVisibleProfile(false);
        }
        else{
          setUI(true);
          setVisibleProfile(true);
        }
      }
    }
    document.addEventListener('keydown', handleKeyClick);

    return () => {
      document.removeEventListener('keydown', handleKeyClick);
    }
  }, [showUI, visibleProfile, steamProfile, friendsPos, friendsAdded, steamNames])

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
    if (pInfo.x === 0 && pInfo.y === 0 && pInfo.z === 0 && wkStep === 2){
        setWKStep(3)
        // setWalkthrough(false)
    }
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
        // alert('Friend Id not Found');
        if (searchError) {
          return;
        }
        setSearchError(true);
        setTimeout(() => {
          setSearchError(false)
        }, 2000);
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
      }, 2000)
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

  const toggleCameraSettings = () => { 
    setCameraSettings(!cameraSettings); 
    if (wkStep === 4) setWKStep(5);
  }

  const toggleHorizontalCamera = () => {
    if (horizontalCamera === "right") {
      setHorizontalCamera("left");
    }
    else {
      setHorizontalCamera("right");
    }
  }

  const toggleDatabase = () => { setVisibleDatabase(!visibleDatabase); }
  const showShare = () => { 
    setShare(true);
    if (wkStep === 6 && !walkthrough) {
        setWKStep(7)
        setWalkthrough(true)
    }
  }
  const closeShare = () => { 
    setShare(false)
    setWKStep(8)
    }

  const getLink = () => {
    if (linkLoading || linkError) return;
    setLinkLoading(true);
    const currentTime = Date.now()
    const oneHourInMilliseconds = 3600000; // 1 hour = 3600 * 1000 milliseconds
    const lastUpload = localStorage.getItem("lastUpload")
    if (lastUpload) {
      const timeDifference = currentTime - parseInt(lastUpload);
      if (timeDifference > oneHourInMilliseconds){
        generateLink();
      }
      else {
        setLinkError(`You can generate a link in ${(60 - (timeDifference / 60000)).toFixed(0)} mins`)
        setLinkLoading(false);
        setTimeout(() => {
          setLinkError("");
        }, 2000);
      }
    }
    else {
      localStorage.setItem("lastUpload", currentTime.toString())
      generateLink();
    }
  }

  const generateLink = async () => {
    try {
      const user = await supabase.auth.getUser();
      // console.log(user);
      let userId;
      if (user.data.user !== null) { // Just using if(user) is not enough, as even if there is no user signin anonymously, an object is still created
        userId = user.data.user?.id
      }
      else {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

        if (authError) {
          console.error('Error signing in anonymously:', authError.message);
          return;
        }
        userId = authData.user?.id
      }

      const { data : customMap, error, status } = await supabase
      .from('customMaps')
      .insert([
        { 'steamProfile': steamProfile, 'friendsPositions': friendsPos, 'steamNames': steamNames, 'addedNames': friendsAdded, 'user_id': userId},
      ])
      .select('link')
      .single()

        //   RLS Policy that prevents users from making more than one map per hour. This error is returned if user is making too many maps
      if (error && status === 403) {
        setLinkError("You can generate a link in the next hour")
        setLinkLoading(false);
        setTimeout(() => {
          setLinkError("");
        }, 2000);
      }
      else if (error && status !== 406) {
        setLinkError("Unable to Generate Link")
        setLinkLoading(false);
        setTimeout(() => {
          setLinkError("");
        }, 2000);
      }

      if (customMap) {
        setLink(`steamfiber.com/custom/${customMap.link}`)
        setLinkLoading(false);
        localStorage.setItem("lastUpload", Date.now().toString())
        setWKStep(8)
      }
    }
    catch {
      setLinkError("Unable to Generate Link")
      setLinkLoading(false);
      setTimeout(() => {
        setLinkError("");
      }, 2000);
    }
  }

  const [copyMessage, setCopyMessage] = useState<boolean>(false)
  const copyLink = () => {
    if (currentLink) navigator.clipboard.writeText(currentLink);
    setCopyMessage(true)
    setTimeout(() => {
      setCopyMessage(false)
    }, 2000)
    if (wkStep === 8) setWKStep(9)
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
    padding: 5,
    maxHeight: visibleDatabase? Math.min(125, 25 * Object.keys(steamNames).length): 0,
    transition: "max-height 0.5s ease",
  }

  const searchStyle = {
    display: searchError? "block" : "none",
  }

  const pageStyle = {
    opacity: shareState? 0.6: 1
  }

  const linkErrorStyle = {
    position: "absolute" as const, 
    color: linkError ? "rgb(243, 81, 81)" : "#eaeaea",
    zIndex: 0,
    transform: linkError ? "translate(0px, 30px)" : "translate(0px, 15px)",
    transition: 'all 0.25s linear'
};

  const inputStyle = {
    backgroundColor: searchError ? "rgb(243, 81, 81)" : "#eaeaea",
    transition: "all 1s ease"
  }

  if (steamProfile && friendsPos) {
    const friendProfileBg = {
      background: `linear-gradient(#0B1829 0%, #0B1829 34%,${profileBgColor} 100%)`,
      display: visibleProfile? "block": "none",
    }

    return (
      <>
      {shareState &&
        <>
          <div id='share-wrapper'>
            <div id='share-container'>
              <h2 style={{marginTop: 4, marginLeft: 4}}>Share Map</h2>
              <button id='friend-close-btn' onClick={closeShare}>X</button>
              <div style={{display: 'flex', flexDirection: 'column', gap: 25, margin: 15, marginTop: 20, alignItems: 'center'}}>
                <button style={{zIndex: 10}} className='shareBtns' onClick={getLink}>
                  {linkLoading? (
                    <>
                      Loading 
                      <span className='loading-dot'>.</span>
                      <span className='loading-dot'>.</span>
                      <span className='loading-dot'>.</span>
                    </>
                  ): (
                    "Generate Link"
                  )}

                </button>
                <p style={linkErrorStyle}>{linkError}</p>
                {currentLink && <button className='shareBtns' disabled={copyMessage} onClick={copyLink}>{copyMessage? "Copied to Clipboard" : "Copy Link"}</button>}
              </div>
              
            </div>     
            {(wkStep === 7 || wkStep === 8) && 
            <div id='wk_six'>
                {wkStep === 7? <h3>&quot;Generate Link&quot; creates a custom link of your map ( 1/hr )</h3> : <h3>&quot;Copy Link&quot; copies the link to your clipboard, now your map is shareable with anyone!</h3>}
            </div>
            }                 
          </div>
        </>
      }
      <div id='fiberpage-container' style={pageStyle}>
        <Canvas camera={{near: 1, far:1500} }> {/* far: 1000 seems to be when objects clip at the furthest distance*/}
          {/* This is the user's particle */}
          <Particle position={{"x": 0,"y": 0,"z": 0,"timestamp": 0,"calledID": ""}} key={steamProfile.steamid} id={steamProfile.steamid} currentSteamNames={steamNames} clicked={handleClick}/>

          {/* Looping over friendsList to create a new particle for each friend naively */}
          {/* A more optimized approach is to use instancing, but I'll save the optimization for the future as I get better with THREE */}
          <ambientLight intensity={3} />
          
          <CustomCameraControls particlePos={cameraPos} cameraRef={cameraControlsRef}/>
          {
            Object.keys(friendsPos).map(key => {
              return (
                <Particle position={friendsPos[key]} key={key} id={key} currentSteamNames = {steamNames} clicked={handleClick}/>
              )
            })
          }
          {displayedSteamId && <Tube po={displayedSteamId} allPositions = {friendsPos}/>}
        </Canvas>

        {displayedSteamId && 
            <>
                <div style={friendProfileBg} id='friend-container'>
                <div id='star-bg'></div>
                <button id='friend-close-btn' onClick={turnOff}>X</button>
                <FriendProfie friend_id= {displayedSteamId.pId} friend_since={displayedSteamId.friend_since} setFocus={setNewFocus} hideFriend={hideFriendProfile} allPositions = {friendsPos} friendsPositionProp={handleNewFriendsPosition} friendsAddedProp={friendsAdded} currentSteamNames = {steamNames}/>
                </div>
            </>
        }

        {walkthrough && 
            <div id="wk_wrapper" className={wkStep === 2? "wk_wrapper2" : ""}>
                {wkStep === 1 &&
                <div className='wk_content scroll_wk' id="wk_one">
                    <h1>SteamFiber</h1>
                    <h3>Where you can make a 3D map of your Steam Network</h3>
                    <div>
                      <button onClick={() => setWKStep(2)}>Begin Walkthrough</button>
                      <button onClick={() => setWalkthrough(false)}>Skip Walkthrough</button>
                    </div>
                    
                </div>
                }
                {wkStep === 2 && 
                <div className='wk_content scroll_wk' id="wk_two">
                    <div id='ct_one'>
                        <h3>Click the White Particle</h3>
                        <h3>It represents the Origin User in the network</h3>
                    </div>
                    <div id='ct_two'></div>
                    <div className='ct_side'/>
                    <div className='ct_side'/>
                </div>
                }
                {wkStep === 3 && 
                <div id="wk_three" className='scroll_wk'>
                    <div className='friend_info'>
                        <img src='/images/focus.svg'/>
                        <p>Centers Selected User on Screen</p>
                    </div>

                    <div className='friend_info'>
                        <img src='/images/copy.svg'/>
                        <p>Copies Steam ID to Clipboard</p>
                    </div>

                    <div className='friend_info'>
                        <img src='/images/hide.svg'/>
                        <p>Hides UI</p>
                        <p>Can be toggled with &quot;Shift&quot;</p>
                    </div>

                    <div className='friend_info'>
                        <h3>&quot;Visit Profile&quot;</h3>
                        <p>Clickable Link to user&apos;s Steam Profile Page</p>
                    </div>

                    <div className='friend_info'>
                        <h3>&quot;Add Their Friends&quot;</h3>
                        <p>Adds user&apos;s friends to the network (Public Profile required)</p>
                    </div>
                    
                    <div className='friend_info'>
                        <h3>&quot;Recently Played&quot;</h3>
                        <p>Last Played Games (Last 2 weeks)</p>
                    </div>

                    <button onClick={() => {setWKStep(4); turnOff()}}>Next</button>
                </div>
                }
                {wkStep === 4&& 
                <div id="wk_four">
                    <div className='wk_cover'></div>
                    <div className='scroll_wk wks_content'>
                      <div className='search_info'>
                          <h3>Search Bar</h3>
                          <p>Search Users (by Steam ID or Name)</p>
                      </div>

                      <div className='search_info'>
                          <img src='/images/database.svg'/>
                          <p>Shows Clicked Usernames</p>
                      </div>
                      
                      <div className='search_info'>
                          <img src='/images/share.svg'/>
                          <p>Opens &quot;Share&quot; Menu</p>
                      </div>
                      
                      <div className='search_info'>
                          <img src='/images/shuffle.svg'/>
                          <p>Selects Random User</p>
                      </div>
                      
                      <div className='search_info'>
                          <img src='/images/focus.svg'/>
                          <p>Resets to Origin User</p>
                      </div>

                      <div className='search_info'>
                          <img src='/images/cameraSettings.svg'/>
                          <p>Toggles Camera UI</p>
                          <br/>
                          <div className='search_info_btn'><p>Click</p><img src='/images/cameraSettings.svg'/><p>to Continue</p></div>
                      </div>
                    </div>
                </div>
                }
                {wkStep === 5 &&
                <div id="wk_five">
                    <div className='wk_cover'></div>
                    <div className='scroll_wk wks_content'>
                      <div className='search_info'>
                          <img src='/images/cameraBase.svg'/>
                          <p>Click to switch direction, then a deg° button to Turn</p>
                      </div>

                      <div className='search_info'>
                          <div>
                              <img src='/images/zoom-in.svg'/>
                              <img src='/images/zoom-out.svg'/>
                          </div>
                          <p>Zoom In / Zoom Out</p>
                      </div>

                      <div className='search_info'>
                          <div id='search_camara'>
                              <img src='/images/cameraBase.svg'/>
                              <img src='/images/arrow-repeat.svg'/>
                          </div>
                          <p>Toggles &quot;Free Roam&quot;: the camera rotates around the current origin</p>
                      </div>

                      <div className='search_info'>
                          <img src='/images/hide.svg'/>
                          <p>Hides UI</p>
                          <p>Can be toggled with &quot;Shift&quot;</p>
                      </div>

                      <button onClick={() => {setWalkthrough(false); setWKStep(6)}}>
                          Explore the Rest!
                      </button>
                      <div className='search_info_btn'><p>Click</p><img src='/images/share.svg'/><p>when you&apos;re ready to share your map!</p></div>
                  
                    </div>
                  </div>}
            </div>
        }

        {showUI && <>
          <div id='search-wrapper' className={(wkStep > 3)? "leftUI" : ""}>
            <form id='search-container' onSubmit={handleSubmit}>
              <input
                  type="text"
                  id="fiberpage-search"
                  value={search}
                  style={inputStyle}
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
            <button className="database-btn share-btn" disabled={wkStep === 4 || wkStep === 5} onClick={showShare}>
              <img src="/images/share.svg" width={15} height={15} alt='button for toggling list of steam names previously seen'></img>
            </button>

            <div id='searchError' style={searchStyle}>
              <p>User not found</p>
            </div>

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
          <div id='camera-container' className={(wkStep > 3)? "leftUI2" : ""}>
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
              <div className='hideMessageDiv'>
                <img fetchPriority='low' onClick={hideUI} src='/images/hide.svg' width={50} height={50} className='cursor-pointer hideMessageImg' alt='Click to hide UI'></img>
                <p className=' hideMessage'> Shift To Toggle</p>
              </div>
            </div>
          </div>
        </>
      }
      </div>
    </>
    )
  }
}