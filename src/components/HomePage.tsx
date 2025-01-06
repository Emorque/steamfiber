import { useState } from "react";

import { FriendList, Friend, SteamProfile, FriendPositions, FriendsAdded, IdSubmissions } from '@/components/types'; // Getting types
import { getSteamProfile, getFriendsList } from "./steamapi";


import { Canvas } from '@react-three/fiber'
import { HpParticle } from "./HpParticle";

import "./homepage.css";

interface HomePageProps {
    steamProfileProp : (userProfile: SteamProfile | null ) => void;
    friendsListProp : (friends : FriendList | null) => void;
    friendsPositionProp : (friendsPos : FriendPositions | null) => void;
    friendsAddedProp : (originalUser : FriendsAdded | null) => void;
}

function getSign() : number {
    return Math.random() < 0.5 ? 1: -1
}

function validId(steam_id: string) {
    if (steam_id.length !== 17 && steam_id.length !== 16) {
        return false
    }
    for (let i = 0; i < steam_id.length; i++){
        if (!(steam_id[i] >= '0' && steam_id[i] <= '9' )){
            return false
        }
    }
    return true
}

export function HomePage({steamProfileProp, friendsListProp, friendsPositionProp, friendsAddedProp} : HomePageProps) {
    const [steamId, setSteamId] = useState<string>('');

    // States for styling
    const [helpComponent, setHelpComponent] = useState<boolean>();
    const [infoComponent, setInfoComponent] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(false);

    const [idError, setIdError] = useState< string | null >(null)
    const [animation, startAnimation] = useState<boolean>(false);

    const [checkedIds] = useState<IdSubmissions>(new Set<string>());

    function SteamIdError(error_message : string) {
        setIdError(error_message)
        setTimeout(() => {
            setIdError(null)
        }, 2000);
    }

    const showHelpComponent = () => { setHelpComponent(true) }
    const hideHelpComponent = () => { setHelpComponent(false) }

    const handleInfo = () => {
        setInfoComponent(!infoComponent);
        setHelpComponent(false);
    }

    // Extra styles dependent on states
    const opacityStyle = {
        opacity: (helpComponent || infoComponent)? 0.5: 1,
        transition: 'all 0.3s ease'
    }

    const disappearStyle = {
        opacity: animation? 0: 1,
        transition: 'all 1s ease',
    }

    const errorStyle = {
        backgroundColor: idError? "rgb(243, 81, 81)" : "white",
        transition: 'all 0.5s ease'
    }

    const handleSubmit = async (event : React.FormEvent) => {
        event.preventDefault();
        // console.log(checkedIds);
        if (!validId(steamId)) {
            SteamIdError("Invalid Steam ID");
            return
        }
        if (!(steamId)) {
            SteamIdError("Please Enter your Steam ID");
            return
        }
        if (checkedIds.has(steamId)) {
            SteamIdError("Enter a different Steam ID");
            return
        }
        const steamProfile = await getSteamProfile(steamId);
        if (steamProfile) {
            steamProfileProp(steamProfile);
            startAnimation(true);
            setDisabledButton(true);
        } else {
            checkedIds.add(steamId);
            SteamIdError("Invalid Steam ID");
            return;
        }

        setTimeout(async () => {
            const fList = await getFriendsList(steamId);
            if (fList) {
                friendsListProp(fList);
                const friendsPos : FriendPositions = {}
    
                const length = fList.friends.length
                const max = Math.sqrt(2000 * length) / 2;
    
                {fList.friends.map((friend: Friend) => {
                    const min = 1                
                    const pos = {
                        "x": getSign() * Math.random() * (max - min) + min,
                        "y": getSign() * Math.random() * (max - min) + min,
                        "z": Math.random() * 50 - 25,
                        "timestamp": friend.friend_since,
                        "calledID": steamId
                    }
                    friendsPos[friend.steamid] = pos
                });
                friendsPos[steamId] = {
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "timestamp": 0,
                    "calledID": steamId
                }
                friendsPositionProp(friendsPos);
                }
                const originalUser = {[steamId] : true}
                friendsAddedProp(originalUser);          
            }
        }, 5000);
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
                    <form onSubmit={handleSubmit}> 
                        <input
                            type="number"
                            style={errorStyle}
                            value={steamId}
                            name="input-steamID"
                            onChange={(e) => setSteamId(e.target.value)}
                        />
                        <input 
                            type="submit"
                            style={{cursor:'pointer'}}
                        />
                    </form>
                    <div>
                        <button onClick={showHelpComponent} id="form-button" disabled={disabledButton}>Don&apos;t Know?</button>
                        {idError && (<p className="error-text">{idError}</p>)}
                    </div>
                </div>

                {helpComponent && (
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