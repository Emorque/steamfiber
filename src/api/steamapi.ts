import type { NextApiRequest, NextApiResponse } from 'next'

const steam_key = process.env.STEAM_WEB_API;

export async function getSteamProfile(req: NextApiRequest, res: NextApiResponse) {
    try {
        const steam_id = req.query.steam_id;
        const response = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steam_key}&steamids=${steam_id}`);
        // if (!response.data.response.players || response.data.response.players.length === 0) {
        const data = response.json();
        return data;
    }
    catch (error) {
        console.log(error);
    }
}

export async function getFriendsList(req: NextApiRequest, res: NextApiResponse) {
    try {
        const steam_id = req.query.steam_id;
        const response = await fetch(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steam_key}&steamid=${steam_id}&relationship=friend`);
        const data = response.json();
        return data;
    }
    catch (error) {
        console.log(error);
    }
}