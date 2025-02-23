'use client'
import { useState} from 'react'

 // Getting types
import { SteamProfile, FriendPositions, FriendsAdded, SteamNames } from '@/components/types';

// Components 
import { HomePage } from '@/components/HomePage'; 
import { FiberPage } from '@/components/FiberPage';

export default function Home() {
  // Steam API states:
  const [steamProfile, setSteamProfile] = useState<SteamProfile | null>(null);
  const [friendsPositions, setFriendsPositions] = useState<FriendPositions | null>(null);
  const [friendsAdded, setFriendsAdded] = useState<FriendsAdded | null>(null);
  const [currentSteamNames, setSteamNames] = useState<SteamNames | null>(null)

  // Accompanying function handles to communicate with the HomePage component:
  const handleSteamProfile = (userProfile : SteamProfile | null) => { setSteamProfile(userProfile); }

  const handleFriendsPosition = (friendsPos : FriendPositions | null) => { setFriendsPositions(friendsPos) }

  const handleFriendsAdded = (originalUser : FriendsAdded | null) => { setFriendsAdded(originalUser) }

  const handleSteamNames = (newSteamNames : SteamNames | null) => { setSteamNames(newSteamNames) }
  
  if (steamProfile && friendsPositions && friendsAdded && currentSteamNames) {
    return (
      <FiberPage steamProfileProp={steamProfile} friendsPositionProp = {friendsPositions} friendsAddedProp = {friendsAdded} steamNamesProps = {currentSteamNames}/>
    )
  }
  else {
    return (
      <HomePage steamProfileProp={handleSteamProfile} friendsPositionProp = {handleFriendsPosition}  friendsAddedProp= {handleFriendsAdded} steamNamesProps = {handleSteamNames}/>
    )
  }
}
