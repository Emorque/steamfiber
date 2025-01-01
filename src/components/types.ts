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