'use client'
import { useCallback, useEffect, useState} from 'react'
import { SteamProfile, FriendPositions, FriendsAdded, SteamNames } from '@/components/types';
import { createClient } from '@/utils/supabase/client'
import { FiberPageWK } from '@/components/FiberPageWK';

export default function Walkthrough() {
  const supabase = createClient()
  
  const [steamProfile, setSteamProfile] = useState<SteamProfile | null>(null);
  const [friendsPositions, setFriendsPositions] = useState<FriendPositions | null>(null);
  const [friendsAdded, setFriendsAdded] = useState<FriendsAdded | null>(null);
  const [currentSteamNames, setSteamNames] = useState<SteamNames | null>(null)
  const [loading, setLoading] = useState(true)

  const setPage = useCallback(async () => {
    try {
      setLoading(true)

      const { data: customMap , error, status } = await supabase
      .from("customMaps")
      .select('steamProfile, friendsPositions, steamNames, addedNames')
      .eq('link', "7634100f-ed51-4290-8042-ca2ee99d1464")
      .single();

      if (error && status !== 406) {
        console.log(error)
        throw error
      }

      if (customMap) {
        setSteamProfile(customMap.steamProfile); // .single() seemed to solve ts error, seems like it assures that customMap is one row?
        setFriendsPositions(customMap.friendsPositions);
        setFriendsAdded(customMap.addedNames);
        setSteamNames(customMap.steamNames);
      }
    } catch {
      alert("Error loading custom map");
    } finally {
      setLoading(false)
    }
  }, [supabase]);

  useEffect(() => {
    setPage()
  }, [setPage]);

  if (steamProfile && friendsPositions && friendsAdded && currentSteamNames && !loading) {
    return (
      <FiberPageWK steamProfileProp={steamProfile} friendsPositionProp = {friendsPositions} friendsAddedProp = {friendsAdded} steamNamesProps = {currentSteamNames}/>
    )
  }
  else {
    return (
        <div className='loading_page'>
            <div className='loading_icon'>
                <h3>Loading</h3>
            </div>    
        </div>)
  }
}