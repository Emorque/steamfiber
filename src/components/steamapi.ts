import { FriendList, Friend, SteamProfile, FriendPositions } from '@/components/types'; // Getting types

export async function getSteamProfile(steam_id: string) : Promise<SteamProfile | null> {
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
    try {
        const response = await fetch(`/api/friendList/${steam_id}`);
        const data = await response.json();
        return data.friendslist;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}