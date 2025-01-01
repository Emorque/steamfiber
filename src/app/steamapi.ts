import type { NextApiRequest, NextApiResponse } from 'next'

const steam_key = process.env.STEAM_WEB_API;

export async function getSteamProfile(steamId:string) {
    try {
        // const steam_id = req.query.steam_id;
        const response = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steam_key}&steamids=${steamId}`);
        // if (!response.data.response.players || response.data.response.players.length === 0) {
        const data = response.json();
        return data;
    }
    catch (error) {
        console.log(error);
    }
}

export async function getFriendsList(steamId:string) {
    try {
        // const steam_id = req.query.steam_id;
        const response = await fetch(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steam_key}&steamid=${steamId}&relationship=friend`);
        const data = response.json();
        return data;
    }
    catch (error) {
        console.log(error);
    }
}