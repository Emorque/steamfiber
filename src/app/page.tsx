'use client'
// import Image from "next/image";
// import styles from "./page.module.css";

// React imports
import { useState, useRef, useEffect } from 'react'

 // Getting types
import { FriendList, SteamProfile, FriendPositions } from '@/components/types';

// Components 
import { HomePage } from '@/components/HomePage'; 
import { Scene } from '@/components/Scene';
import { FiberPage } from '@/components/FiberPage';

export default function Home() {
  // Steam API states:
  const [steamProfile, setSteamProfile] = useState<SteamProfile | null>(null);
  const [friendsList, setFriendsList] = useState<FriendList | null>(null);
  const [friendsPositions, setFriendsPositions] = useState<FriendPositions | null>(null);

  // Accompanying function handles to communicate with the HomePage component:
  const handleSteamProfile = (userProfile : SteamProfile | null) => {
    setSteamProfile(userProfile);
  }

  const handleFriendsList = (friends : FriendList | null) => { setFriendsList(friends) }

  const handleFriendsPosition = (friendsPos : FriendPositions | null) => { setFriendsPositions(friendsPos) }
  
  if (steamProfile && friendsList && friendsPositions) {
    return (
      <FiberPage steamProfileProp={steamProfile} friendsListProp = {friendsList} friendsPositionProp = {friendsPositions}/>
    )
  }
  else {
    return (
      <HomePage steamProfileProp={handleSteamProfile} friendsListProp = {handleFriendsList} friendsPositionProp = {handleFriendsPosition}/>
    )
  }
}
