export const dynamic = 'force-dynamic' // defaults to auto
import { NextResponse } from 'next/server';

const steam_key = process.env.STEAM_WEB_API;

export async function GET(request: Request, { params } : { params : {steamId: string}}) {
    try {
        const steam_id = params.steamId;    
        const res = await fetch(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steam_key}&steamid=${steam_id}&relationship=friend`, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
        }});
    
        if (!res.ok) { //https://nextjs.org/docs/app/building-your-application/routing/error-handling
            return 'There was an error.'
        }
        
        const friendsList = await res.json();
        return NextResponse.json(friendsList);    
    }
    catch (error) {
        console.error(error);
        return NextResponse.json(error)
    }
}