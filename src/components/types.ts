export type FriendList = {
    "friends" : Friend[]
}
  
export type Friend = {
    "steamid": string;
    "relationship": string,
    "friend_since": number,
}
  
export type SteamProfile = {
    "steamid": string;
    "personaname" : string, 
    "profileurl": string, 
    "avatarfull": string,
    "personastate": number
    // There are more info gathered from a getPlayerSummaries call, but this all I will be using for now.  
}
  
export type FriendPositions =  {
    [id : string] : {
        "x": number, 
        "y": number, 
        "z": number,
        "timestamp": number,
        "calledID": string
    } // x,y,z,unix timestamp,id of the user who was queried by getFriendsList
}

export type GamesInfo = {
    "appid": number,
    "name": string,
    "playtime_2weeks": number,
    "playtime_forever": number,
    "img_icon_url": string
}

export type RecentlyPlayed = {
    "total_count": number;
    "games" : [GamesInfo]
}

export type FriendsAdded = {
    [id: string] : boolean
}

export type IdSubmissions = Set<string>;