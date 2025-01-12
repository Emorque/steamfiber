import { NextResponse } from 'next/server';
import { validId } from '@/utils/helper';

const steam_key = process.env.STEAM_WEB_API;

export async function GET(request: Request, { params } : { params : {steamId: string}}) {
    const steam_id = params.steamId;    
    if (!validId(steam_id)) {
        return NextResponse.json({error: 'Invalid ID'}, {status: 500})
    }
    try {
        const res = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steam_key}&steamids=${steam_id}`, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
        }});
    
        if (!res.ok) { //https://nextjs.org/docs/app/building-your-application/routing/error-handling
            return NextResponse.json({error: 'Player not found'}, {status: 500})
        }
    
        const steamProfile = await res.json();

        if (!steamProfile.response.players) {
            return NextResponse.json({error: 'Player has a private profile'}, {status: 500})
        }
        else if (steamProfile.response.players === 0) {
            return NextResponse.json({error: 'Player has no friends to display'}, {status: 500})
        }
        
        return NextResponse.json(
            steamProfile.response.players,
            {
              status: 200,
              headers: {
                // public: This response is allowed to be cached by anything
                // max-age=3600: The response is considered "fresh" for 3600 seconds (1 hour), after which it's considered "stale"
                // stale-while-revalidate=60: After the data is considered stale, it's allowed to serve stale content for an additional 60 seconds while it fetches fresh content in the bg
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=60'
              },
            }
          )
    }
    catch (error) {
        console.error(error);
        return NextResponse.json(error)
    }
}