export const dynamic = 'force-dynamic' // defaults to auto
import { NextResponse } from 'next/server';

const steam_key = process.env.STEAM_WEB_API;

export async function GET(request: Request, { params } : { params : {steamId: string}}) {
    try {
        const steam_id = params.steamId;    
        const res = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steam_key}&steamids=${steam_id}`, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
        }});
    
        if (!res.ok) { //https://nextjs.org/docs/app/building-your-application/routing/error-handling
            return 'There was an error.'
        }
    
        const steamProfile = await res.json();
        // console.log(steamProfile);
    
        if (!steamProfile.response.players || steamProfile.response.players === 0) {
            return NextResponse.json({error: 'Player not found'}, {status: 500})
        }
        
        return NextResponse.json(steamProfile.response.players);    
    }
    catch (error) {
        console.error(error);
        return NextResponse.json(error)
    }
}