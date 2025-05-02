import { useEffect, useRef, useState } from "react";

import { Friend, SteamProfile, FriendPositions, FriendsAdded, IdSubmissions, SteamNames } from '@/components/types'; // Getting types
import { getSteamProfile, getFriendsList } from "./steamapi";

import { Canvas } from '@react-three/fiber'
import { HpParticle } from "./HpParticle";

import "./homepage.css";

import { getSign, validId } from "@/utils/helper";
import Link from "next/link";

interface HomePageProps {
    steamProfileProp : (userProfile: SteamProfile | null ) => void;
    friendsPositionProp : (friendsPos : FriendPositions | null) => void;
    friendsAddedProp : (originalUser : FriendsAdded | null) => void;
    steamNamesProps : (newSteamNames : SteamNames | null) => void;
}

export function HomePage({steamProfileProp, friendsPositionProp, friendsAddedProp, steamNamesProps} : HomePageProps) {
    // States that get set by user's input
    const [steamId, setSteamId] = useState<string>('');

    // States for styling
    const [helpComponent, setHelpComponent] = useState<boolean>();
    const [infoComponent, setInfoComponent] = useState<boolean>(false);
    const [databaseComponent, setDatabaseComponent] = useState<boolean>(false);
    const [signInComponennt, setSignInComponent] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(false);

    const [idMessage, setIdMessage] = useState< string | null >(null);
    const [idColor, setIdColor] = useState<string>("white");
    const [animation, startAnimation] = useState<boolean>(false);

    // States for local storage and already checked Ids
    const [localIds, setLocalIds] = useState<string[][]>([]);
    const [checkedIds] = useState<IdSubmissions>(new Set<string>());

    // Needed for form submit to be called more than once
    const [formReady, setFormReady] = useState<boolean>(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(()=> {
        const tempLocalIds : string[][]= []
        
        // Getting the used ids from local storage
        const prevSearchesLS = localStorage.getItem("searches")
        if (prevSearchesLS) {
            const prevSearches = JSON.parse(prevSearchesLS);
            if (prevSearches && typeof prevSearches === 'object') {
                for (const [key, value] of Object.entries(prevSearches)) {
                    const id = typeof value === "string" ? value: JSON.stringify(value); 
                    tempLocalIds.push([key, id]);
                }
            }
        }
        setLocalIds(tempLocalIds);
    }, [])

    useEffect(() => {
        if (!location.hash) {
          return
        }
    
        const params = new URLSearchParams(location.hash.replace('#', ''))
        const data = params.get('data')
    
        if (!data) {
          return
        }

        const user = atob(data)
        // quotation marks are in user so those need to be taken out before setting steamId
        setSteamId(user.substring(1,user.length - 1))
        setFormReady(true);
      }, [])

      useEffect(() => {
        if (formRef.current && steamId && formReady) {
            formRef.current.requestSubmit();
        }
      }, [formReady])

    function SteamIdMessage(id_message : string) {
        if (idMessage) {
            return;
        }

        setIdMessage(id_message)
        if (id_message === "Steam ID Obtained") {
            setIdColor("rgb(81, 243, 108)");
        }
        else {
            setIdColor("rgb(243, 81, 81)");
        }
        setTimeout(() => {
            setIdMessage(null);
            setIdColor("white");
        }, 2000);
    }

    const showHelpComponent = () => { 
        setHelpComponent(true)
        setDatabaseComponent(false);
    }
    const hideHelpComponent = () => { setHelpComponent(false) }

    const showDatabase = () => { setDatabaseComponent(true)}
    const hideDatabaseComponent = () => {setDatabaseComponent(false)}

    const showSignInComponent = () => { 
        setSignInComponent(true)
        setDatabaseComponent(false);
    }
    const hideSignInComponent = () => { setSignInComponent(false) }

    const handleInfo = () => {
        setInfoComponent(!infoComponent);
        setHelpComponent(false);
        setDatabaseComponent(false);
        setSignInComponent(false);
    }

    const setSteamName = (steamName: string) => {
        setSteamId(steamName);
        setHelpComponent(false);
        setDatabaseComponent(false);
        setSignInComponent(false);
    }

    const clearSteamName = (steamName: string) => {
        const prevSearchesLS = localStorage.getItem("searches")
        if (prevSearchesLS) {
            const prevSearches = JSON.parse(prevSearchesLS);
            if (prevSearches && typeof prevSearches === 'object' && prevSearches.hasOwnProperty(steamName)) {
                delete prevSearches[steamName]
                localStorage.setItem("searches", JSON.stringify(prevSearches))
                // for (const [key, value] of localIds) {
                    
                // }
                let index : number
                for (let i = 0; i < localIds.length; i++) {
                    if (localIds[i][0] == steamName) index = i 
                }
                setLocalIds(list => list.splice(index, 1))
            }
        }
    }

    // Extra styles dependent on states
    const opacityStyle = {
        opacity: (helpComponent || infoComponent || databaseComponent || signInComponennt)? 0.5: 1,
        transition: 'all 0.3s ease'
    }

    const disappearStyle = {
        opacity: animation? 0: 1,
        transition: 'all 1s ease',
    }

    const messageStyle = {
        backgroundColor: idColor,
        transition: 'all 0.5s ease'
    }

    const messageTextStyle = {
        color : idColor,
    }

    const databaseStyle = {
        maxHeight: Math.min((localIds.length * 35) + 10, 200)
    }

    const handleSubmit = async (event : React.FormEvent) => {
        event.preventDefault();
        let steamProfile;
        let prevSearches 
        const prevSearchesLS = localStorage.getItem("searches")
        if (prevSearchesLS) prevSearches = JSON.parse(prevSearchesLS);
        if (prevSearches && typeof prevSearches === 'object' && prevSearches.hasOwnProperty(steamId)){
            const id = prevSearches[steamId]
            if (id) {
                steamProfile = await getSteamProfile(id);
            }
            else{
                SteamIdMessage("Invalid Steam ID");
                return
            }
        }
        else {
            if (!validId(steamId)) {
                SteamIdMessage("Invalid Steam ID");
                return
            }
            if (!(steamId)) {
                SteamIdMessage("Please Enter your Steam ID");
                return
            }
            if (checkedIds.has(steamId)) {
                SteamIdMessage("Enter a different Steam ID");
                return
            }
            steamProfile = await getSteamProfile(steamId);
        }
        if (steamProfile) {
            steamProfileProp(steamProfile);
        } else {
            checkedIds.add(steamId);
            SteamIdMessage("Invalid Steam ID");
            return;
        }

        const fList = await getFriendsList(steamProfile.steamid);
        if (!fList) {
            checkedIds.add(steamId);
            SteamIdMessage("Friends List is Private");
            return;
        }
        if (fList) {
        startAnimation(true);
        setDisabledButton(true);

        setTimeout(async () => {
            const friendsPos : FriendPositions = {}
            let prevSearches
            const prevSearchesLS = localStorage.getItem("searches")
            if (prevSearchesLS) prevSearches = JSON.parse(prevSearchesLS)
            if (prevSearches && typeof prevSearches === 'object') {
                prevSearches[steamProfile.personaname] = steamProfile.steamid;
                localStorage.setItem("searches", JSON.stringify(prevSearches))                
            }
            else {
                prevSearches = {
                    [steamProfile.personaname]: steamProfile.steamid,      
                };
                localStorage.setItem("searches", JSON.stringify(prevSearches))
            }
            const length = fList.friends.length
            const max = Math.sqrt(2000 * length) / 2;

            {fList.friends.map((friend: Friend) => {
                const min = 1                
                const pos = {
                    "x": getSign() * Math.random() * (max - min) + min,
                    "y": getSign() * Math.random() * (max - min) + min,
                    "z": Math.random() * 50 - 25,
                    "timestamp": friend.friend_since,
                    "calledFriend": steamProfile.personaname,
                    "calledID": steamProfile.steamid
                }
                friendsPos[friend.steamid] = pos
            });
            friendsPos[steamProfile.steamid] = {
                "x": 0,
                "y": 0,
                "z": 0,
                "timestamp": 0,
                "calledFriend": steamProfile.personaname,
                "calledID": ""
            }
            friendsPositionProp(friendsPos);
            }
            const originalUser = {[steamProfile.steamid] : true}
            friendsAddedProp(originalUser);
            const newSteamNames : SteamNames = {
                [steamProfile.steamid] : steamProfile.personaname
            }
            steamNamesProps(newSteamNames);          
        }, 5000);
    }
    };
    
    return (
        <div id="form-page-container">
            <div id="form-page" style={disappearStyle}>
            <button id="info-button" onClick={handleInfo} disabled={disabledButton}>?</button>

                <div id="title" style={opacityStyle}>
                    <img src="/images/steamfiber.svg" height={64} width={64} fetchPriority='low' alt="Steam Fiber Logo"></img>
                    <h1>SteamFiber</h1>
                </div>
                
                
                <div id="form-container" style={opacityStyle}>
                    <p>Enter Steam ID:</p>
                    <div style={{position: "relative"}}>
                        <form ref={formRef} onSubmit={handleSubmit}> 
                            <input
                                type="text"
                                style={messageStyle}
                                value={steamId}
                                name="input-steamID"
                                onChange={(e) => setSteamId(e.target.value)}
                            />
                            <input 
                                type="submit"
                                style={{cursor:'pointer'}}
                            />
                        </form>
                        <button className="database-btn" onClick={showDatabase}>
                            <img src="/images/database.svg" width={15} height={15} alt="button for toggling local storage of previously searched users"></img>
                        </button>
                    </div>
                    <div id='btn-container'>
                        <button onClick={showHelpComponent} className="form-button" disabled={disabledButton}>Don&apos;t Know?</button>
                        {idMessage && (<p style={messageTextStyle} className="error-text">{idMessage}</p>)}
                        <button onClick={showSignInComponent} className="form-button" disabled={disabledButton}>Sign in with Steam</button>
                        <Link id="demo" href={"/demo"}>Want to Demo Instead?</Link>
                    </div>
                </div>

                {databaseComponent && (
                    <div id="database-wrapper" style={databaseStyle}>
                        <div id="database-btn-wrapper">
                            <h2 id="database-title">Previous Searches</h2>    
                            <button id="close-database-btn" onClick={hideDatabaseComponent} disabled={disabledButton}>X</button>
                        </div>
                        <div id="database-component">
                            {localIds.map(([key, value]) => {
                                return (
                                    <div className="database-btns" key={value}>
                                        <button className="steamName-btn" onClick={() => setSteamName(key)}>
                                            {key}
                                        </button>
                                        <button className="steamName-btn" onClick={() => clearSteamName(key)}>
                                            X
                                        </button>
                                    </div>
                                )
                            })}
                            
                            {/* Useful for testing out the wrapper's handling of overflow */}
                            {/* <div className="database-btns">
                                <button className="steamName-btn">
                                    key
                                </button>
                                <button className="steamName-btn">
                                    X
                                </button>
                            </div> */}
                        </div>
                    </div>
                )}    

                {helpComponent && (
                    <div id="help-wrapper">
                        <div id="help-component">
                            <button id="close-form-btn" onClick={hideHelpComponent} disabled={disabledButton}>X</button>
                            <p>1. Visit <a href="https://steamcommunity.com/" target="blank">Steam</a> and select your username</p>
                            <p>2. Select &quot;Account details&quot;</p>
                            <p>3. Your Steam ID is below your username</p>
                            <br/>
                            <p>SteamFiber can only display your friends if your Steam Community profile visibility is set to &quot;Public&quot;</p>
                            <br/>
                            <img id="help-image" src="/images/account.webp" alt="Acccount details page for a Steam User" width={294} height={130}></img>
                        </div>
                    </div>
                    
                )}    

                {signInComponennt && (
                    <div id="signIn-wrapper">
                        <button id="close-signIn-btn" onClick={hideSignInComponent} disabled={disabledButton}>X</button>
                        <div id="signIn-component">
                            <p>Logging into SteamFiber with Steam will fetch your Steam ID</p>
                            <a id="signInBtn" href="/api/auth">
                                Sign In With Steam
                            </a>
                            <p>SteamFiber is a hobby project and is not affiliated with Value or Steam</p>
                            <p>After clicking the button above, you will be redirected to <span style={{fontStyle: "italic"}}>https://steamcommunity.com</span>, where if you are already signed in, allow requries you to click &quot;Sign In&quot;</p>
                            <p>SteamFiber does not obtain your username or password, nor is any obtained data stored</p>
                        </div>
                    </div>
                )}

                {infoComponent && (
                    <div id="footer">
                        <h4>SteamFiber is a hobby project and is not affiliated with Value or Steam</h4>
                        <h4>Steam is a trademark of Valve Corporation</h4>
                        <h4>SteamFiber only uses end user data from Steam to display information to you</h4>
                        <h4>Made with <a id="steam" href="https://developer.valvesoftware.com/wiki/Steam_Web_API" target="blank">Steam Web API</a></h4>
                    </div> 
                )}
            </div>
            <div id="canvas-form-container" style={opacityStyle}>
                <Canvas>
                    <HpParticle animationStart={animation}/>
                    <ambientLight color={"white"} intensity={2}/>
                </Canvas>
            </div> 
        </div>      
    )
}