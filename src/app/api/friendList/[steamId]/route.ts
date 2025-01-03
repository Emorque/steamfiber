import { NextResponse } from 'next/server';

const steam_key = process.env.STEAM_WEB_API;

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

export async function GET(request: Request, { params } : { params : {steamId: string}}) {
    const steam_id = params.steamId;    
    if (!validId(steam_id)) {
        return NextResponse.json({error: 'Invalid ID'}, {status: 500})
    }
    try {
        const res = await fetch(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steam_key}&steamid=${steam_id}&relationship=friend`, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
        }});
    
        if (!res.ok) { //https://nextjs.org/docs/app/building-your-application/routing/error-handling
            const errorMessage = await res.text();
            return NextResponse.json({ message: 'There was an error fetching friends list', details: errorMessage }, { status: 500 })        
        }
        const friendsList = await res.json();
        return NextResponse.json(
            friendsList, 
            {
                status: 200,
                headers: {
                  // public: This response is allowed to be cached by anything
                  // max-age=3600: The response is considered "fresh" for 3600 seconds (1 hour), after which it's considered "stale"
                  // stale-while-revalidate=60: After the data is considered stale, it's allowed to serve stale content for an additional 60 seconds while it fetches fresh content in the bg
                  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=60'
                }   
            }
        );    
    }
    catch (error) {
        console.error(error);
        return NextResponse.json(error)
    }
}