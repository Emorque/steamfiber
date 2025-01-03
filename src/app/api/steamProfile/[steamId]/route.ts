export const dynamic = 'force-dynamic' // defaults to auto
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
        
        return NextResponse.json(steamProfile.response.players);    
    }
    catch (error) {
        console.error(error);
        return NextResponse.json(error)
    }
}