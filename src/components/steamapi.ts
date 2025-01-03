import { FriendList, SteamProfile, RecentlyPlayed } from '@/components/types'; // Getting types

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

export async function getSteamProfile(steam_id: string) : Promise<SteamProfile | null> {
    if (!validId) return null;
    
    if (!steam_id) {
        return null
    }
    try {
        const response = await fetch(`/api/steamProfile/${steam_id}`);
        const data = await response.json();
        return data[0];
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

export async function getFriendsList(steam_id: string) : Promise<FriendList | null> {
    if (!validId) return null;
    
    try {
        const response = await fetch(`/api/friendList/${steam_id}`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data.friendslist;
    }
    catch (error) {
        console.error(error);
        console.log("hitherer")
        return null;
    }
}


export async function getRecentGames(steam_id: string) : Promise<RecentlyPlayed | null> {
    if (!validId) return null;
    
    try {
        const response = await fetch(`/api/recentGames/${steam_id}`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data.response;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}