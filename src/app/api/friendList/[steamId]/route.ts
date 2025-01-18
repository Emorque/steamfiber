import { NextResponse } from 'next/server';
import { validId } from '@/utils/helper';

const steam_key = process.env.STEAM_WEB_API;

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
            return NextResponse.json({error: 'Private Profile'}, {status: 500})
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
        // console.error(error);
        return NextResponse.json(error)
    }
}