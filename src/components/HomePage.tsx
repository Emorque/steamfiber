import { useState, useRef } from "react";

import { FriendList, Friend, SteamProfile, FriendPositions } from '@/components/types'; // Getting types

// import { getSteamProfile, getFriendsList } from "@/api/steam_api";

import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { HpParticle } from "./HpParticle";
// import { gsap } from "gsap";

interface HomePageProps {
    steamProfileProp : (userProfile: SteamProfile | null ) => void;
    friendsListProp : (friends : FriendList | null) => void;
    friendsPositionProp : (friendsPos : FriendPositions | null) => void;
}

function getSign() : number {
    return Math.random() < 0.5 ? 1: -1
}

export function HomePage({steamProfileProp, friendsListProp, friendsPositionProp} : HomePageProps) {
    const [steamId, setSteamId] = useState<string>('');

    // States for styling
    const [helpComponent, setHelpComponent] = useState<boolean>();
    const [infoComponent, setInfoComponent] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(false);
    const [emptyError, setError] = useState<boolean>(false);
    const [idError, setIdError] = useState<boolean>(false);
    const [animation, startAnimation] = useState<boolean>(false);

    // Nothing entered in input
    function EmptyError() {
        setError(true)
        setTimeout(() => {
            setError(false)
        }, 2000);
    }

    // Invalid Id is entered in input
    function SteamIdError() {
        setIdError(true)
        setTimeout(() => {
            setIdError(false)
        }, 2000);
    }

    const showHelpComponent = () => { setHelpComponent(true) }
    const hideHelpComponent = () => { setHelpComponent(false) }

    const handleInfo = () => {
        setInfoComponent(!infoComponent);
        setHelpComponent(false);
        console.log(infoComponent);
    }

    // Extra styles dependent on states
    const opacityStyle = {
        opacity: (helpComponent || infoComponent)? 0.5: 1,
        transition: 'all 0.3s ease'
    }

    const disappearStyle = {
        opacity: animation? 0: 1,
        transition: 'all 1s ease',
        // pointer-events: none
    }

    const errorStyle = {
        backgroundColor: (emptyError|| idError)? "rgb(243, 81, 81)" : "white",
        transition: 'all 0.5s ease'
    }

    
    return (
        <div id="form-page-container">
            <div id="form-page" style={disappearStyle}>
            <button id="info-button" onClick={handleInfo} disabled={disabledButton}>?</button>

                <div id="title" style={opacityStyle}>
                    <img src="/steamcircle.svg" height={64} width={64}></img>
                    <h1>SteamCircle</h1>
                </div>
                
                
                <div id="form-container" style={opacityStyle}>
                    <p>Enter Steam ID:</p>
                    {/* onSubmit={handleSubmit} */}
                    <form > 
                        <input
                            type="text"
                            style={errorStyle}
                            value={steamId}
                            onChange={(e) => setSteamId(e.target.value)}
                        />
                        <input 
                            type="submit"
                            style={{cursor:'pointer'}}
                        />
                    </form>
                    <div>
                        <button onClick={showHelpComponent} id="form-button" disabled={disabledButton}>Don't Know?</button>
                        {emptyError && (<p className="error-text">Please Enter your Steam ID</p>)}
                        {idError && (<p className="error-text">Invalid Steam ID</p>)}
                    </div>
                </div>

                {helpComponent && (
                    <div id="help-component">
                        <button id="close-form-btn" onClick={hideHelpComponent} disabled={disabledButton}>X</button>
                        <p>1. Visit <a href="https://steamcommunity.com/" target="blank">Steam</a> and select your username</p>
                        <p>2. Select "Account details"</p>
                        <p>3. Your Steam ID is below your username</p>
                        
                        <br/>
                        <img src="/steamId.png"></img>
                    </div>
                )}    

                {infoComponent && (
                    <div id="footer">
                        <h4>SteamCircle is a hobby project and is not affiliated with Value or Steam</h4>
                        <h4>Made with <a id="steam" href="https://developer.valvesoftware.com/wiki/Steam_Web_API" target="blank">Steam Web API</a></h4>
                        <h4>Steam is a trademark of Valve Corporation.</h4>
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