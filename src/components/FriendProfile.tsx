import { useEffect, useRef, useState } from "react";
import { FriendList, FriendPositions, FriendsAdded, RecentlyPlayed, SteamNames, SteamProfile } from "./types";
import { getFriendsList, getRecentGames, getSteamProfile } from "./steamapi";
import { getSign } from "@/utils/helper";

const stateStyle: {[id: number] : string} = {
    0: "Offline", 
    1: "Online", 
    2: "Busy", 
    3: "Away", 
    4: "Snooze", 
    5: "Looking to Trade", 
    6: "Looking to Play"
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

export function FriendProfie({friend_id, friend_since, setFocus, hideFriend, allPositions, friendsListProp, friendsPositionProp, friendsAddedProp, currentSteamNames}  : FriendProps ) {

    const [friendProfile, setFriendProfile] = useState< SteamProfile | null>(null);
    const [recentGames, setRecentGames] = useState< RecentlyPlayed | null>(null);
    const [error, setError] = useState< string | null >(null);
  
    const [loading, setLoading] = useState<boolean>(false);
    const [chainHeight, setChainHeight] = useState<number>(0);
  
    const gameContainerRef = useRef<HTMLDivElement>(null)
    const [gameContainerHeight, setGameContainerHeight] = useState<number | undefined>(undefined);
    const [gameContainerReady, setGameContainerReady] = useState<boolean>(false);
    const [visibleGames, setVisibleGames] = useState<boolean>(true);
    const [gamesContainerSrc, setGamesContainerSrc] = useState<string>("/images/caret-down-fill.svg");
  
  
    const threadRef = useRef<HTMLDivElement>(null)
    const [threadHeight, setThreadHeight] = useState<number | undefined>(undefined);
    const [threadReady, setThreadReady] = useState<boolean>(false);
    const [visibleThread, setVisibleThread] = useState<boolean>(true);
    const [threadSrc, setThreadSrc] = useState<string>("/images/caret-down-fill.svg")

    const [visibleClipboard, setVisibleClipboard] = useState<boolean>(false);
    const [clipboardText, setClipboardText] = useState<string | null>("");
  
    const errorStyle = {
      opacity: error? 1 : 0,
      transform: error? "translate(10px,15px)" : "translate(10px,0px)",
      transition: "all 0.25s linear",
      padding: error? 5 : 0,
    }

    const clipboardStyle = {
      opacity: visibleClipboard? 1 : 0,
      textContent: "Copied ID",
      transform: visibleClipboard? "translate(0px,10px)" : "translate(0px,0px)",
      transition: "all 0.25s linear",
      padding: visibleClipboard? 5 : 0,
    }
  
    const errorFunc = (err: string) => {
      if (error) {
        return;
      }
      setError(err)
      setTimeout(() => {
        setError(null)
      }, 1500);
    }
  
    let friend_since_date = new Date(friend_since * 1000).toLocaleDateString('en-Us', { month: 'short', year: 'numeric', day: 'numeric' });
    if (friend_since_date === "Dec 31, 1969") { //This is the starting point of the UNIX timestamp. Only applicable to the user
      friend_since_date = ""
    }
  
    // Creating friend-chain thread
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
  
    const toggleGames = () => { 
      setVisibleGames(!visibleGames);
      if (gamesContainerSrc === "/images/caret-right-fill.svg") {
        setGamesContainerSrc("/images/caret-down-fill.svg")
      } 
      else {
        setGamesContainerSrc("/images/caret-right-fill.svg")
      }
    }
    
    const toggleThread = () => { 
      setVisibleThread(!visibleThread); 
      if (threadSrc === "/images/caret-right-fill.svg") {
        setThreadSrc("/images/caret-down-fill.svg")
      } 
      else {
        setThreadSrc("/images/caret-right-fill.svg")
      }
    }
  
    useEffect(() => {
      setVisibleGames(false)
      setGameContainerReady(false);
      setGameContainerHeight(undefined);
  
      setVisibleThread(false)
      setThreadReady(false);
      setThreadHeight(undefined);
  
      setThreadSrc("/images/caret-down-fill.svg")
      setGamesContainerSrc("/images/caret-down-fill.svg");
  
      const fetchData = async () => {
        setLoading(true); 
        const steamProfile = await getSteamProfile(friend_id);
        const recentlyPlayed = await getRecentGames(friend_id);
  
        setFriendProfile(steamProfile); 
        setRecentGames(recentlyPlayed); 
  
        if (steamProfile && recentlyPlayed) {
          setLoading(false); 
          currentSteamNames[steamProfile.steamid] = steamProfile.personaname;
          setGameContainerReady(true);
          setVisibleGames(true);
          
          setThreadReady(true);
          setVisibleThread(true);
        }
      };
    
      fetchData(); // Call the async function
    }, [friend_id]); // Dependency array ensures the effect runs when friend_id changes
  
    useEffect(() => {
      if (gameContainerRef.current && gameContainerReady) {
          setGameContainerHeight(gameContainerRef.current?.clientHeight + 100);
      }
    }, [gameContainerReady, gameContainerRef, gameContainerHeight]);
  
    
    useEffect(() => {
      if (threadRef.current && threadReady) {
          setThreadHeight(threadRef.current?.clientHeight + 100);
      }
    }, [threadReady, threadRef, threadHeight]);
  
    const gameContainerStyle = {
      maxHeight : visibleGames? gameContainerHeight : 0,
      overflow: "hidden",
      transition : "all 1s ease",
    }
  
    const threadStyle = {
      maxHeight : visibleThread? threadHeight : 0,
      overflow: "hidden",
      transition : "all 1s ease",
    }
    
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
          if (visibleClipboard) {
            return;
          }
          setVisibleClipboard(true);
          setClipboardText("Copied ID");
          setTimeout(() => {
            setVisibleClipboard(false)
            setClipboardText(null);
          }, 2000);
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
                  <div style={{position: "relative", zIndex:"10"}}>
                    <img src="/images/copy.svg" height={30} width={30} onClick={() => copyToClipboard()} className='cursor-pointer' fetchPriority='low' alt={`Click to copy ${friendProfile.personaname}'s Steam id`}></img>
                    <p id='clipboardText' style={clipboardStyle}>{clipboardText}</p>
                  </div>
                  <img fetchPriority='low' src='/images/hide.svg' width={30} height={30} onClick={() => hideProfile()} className='cursor-pointer' alt='Click to hide Friend Profile' id='friend-hide-btn'></img>
                
                  {/* <div id="clipboardText" style={clipboardStyle}>
                    <p>Copied ID</p>
                  </div> */}
                </div>
              </div>
            </div>
  
            {friend_since_date && friendProfile.profileurl && <p>Friends Since: {friend_since_date}</p>}
            <p><a href={friendProfile.profileurl} target='blank'>Visit Profile</a></p>
            <div style={{position: "relative"}}>
              <button id='add-friends-btn' onClick={() => addFriends()} style={{zIndex: 20, position: "relative"}}>Add Their Friends</button>
  
  
              {<p id='error-text' style={errorStyle}>{error}</p>}
            </div>
            {recentGames.games && 
            <>
              <div className='collapsible-header'>
                <h2>Recently Played:</h2>
                <button onClick={toggleGames} className='toggleBtn'>
                  <img src={gamesContainerSrc}></img>
                </button>
              </div>
              <div id='game-container' ref={gameContainerRef} style={gameContainerStyle}>
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
              <div className='collapsible-header'>
                <h2>Your Thread:</h2>
                <button onClick={toggleThread} className='toggleBtn'>
                  <img src={threadSrc}></img>
                </button>
              </div>
              <div id='thread-container' ref={threadRef} style={threadStyle}>
                <div id='fiber-line' style={fiberLineStyle}></div>
                <button className='thread-btn' key={`${friendProfile.personaname}'s friend thread`} 
                  onClick={() => setNewFocus(friend_id)} 
                  onMouseEnter={() => {
                    if (window.innerWidth > 700) {
                      setChainHeight(18);
                    }
                    else {
                      setChainHeight(15);
                    }
                  }}
                  onMouseLeave={() => { setChainHeight(0)} }>
                  {friendProfile.personaname}
                </button>
                {friend_chain.map((link, index) => {
                  return (
                      <button className='thread-btn' key={`${link} at index ${index}`} 
                        onClick={() => setNewFocus(allPositions[link].calledID)} 
                        onMouseEnter={() => {
                          if (window.innerWidth > 700) {
                            setChainHeight( (18 * (index + 2)) + (10 * (index + 1)) );
                          }
                          else {
                            setChainHeight( (15 * (index + 2)) + (10 * (index + 1)) );
                          }
                        }}
                        onMouseLeave={() => {setChainHeight(0)}}>
                        {allPositions[link].calledFriend}
                      </button>                    
                  )
                })}
              </div>
            </>}
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
  