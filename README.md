<img src="public/images/steamfiber.svg" width=75 height=75/>

# SteamFiber

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Steam](https://img.shields.io/badge/steam-%23000000.svg?style=for-the-badge&logo=steam&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)

SteamFiber is a NextJS application built with [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction). SteamFiber uses Steam's Web [API](https://steamcommunity.com/dev) to help create a 3D mapping of your Steam Friend network. 

## Demo
![SteamFiber_demo_resize](https://github.com/user-attachments/assets/bdef0ccd-8b1f-4a3b-a990-bee3484c7bc7)

## Getting Started
1. Visit [steamfiber.com](https://www.steamfiber.com/)
2. Enter your Steam ID
   1. You can obtain this by viewing your "Account details" on your Steam Account
   2. Or, you can login to SteamFiber via Steam. With one click, SteamFiber will fetch your Steam ID for you
3. Enjoy!

## Deploy SteamFiber Yourself
1. If you would like to deploy SteamFiber yourself, first, clone this repo
2. Create a <code>.env</code> file with the following values:
```
  STEAM_WEB_API = "" // Can be obtained at https://steamcommunity.com/dev/apikey   
  APP_URL=http://localhost:3000/ // Use if running locally, replace with your site's base URL if deploying
  NEXT_PUBLIC_SUPABASE_URL = // Include for sharing maps to work 
  NEXT_PUBLIC_SUPABASE_ANON_KEY = // Include for sharing maps to work 
```
3. Run the development server:
```
  npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result!

## How It Works
- Once the user's Steam ID is validatated, Steam's "GetFriendList" API method is called: 
```
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
```

- Then, that friends list is iterated upon, with its positioning randomized and dependent on the user's position. (Original user's position is defaulted to [0,0,0]). Three.js meshes are rendered at these positions, representing the corresponding friend.
```
{fList.friends.map((friend: Friend) => {
    const min = 1                
    const pos = {
        "x": getSign() * Math.random() * (max - min) + min,
        "y": getSign() * Math.random() * (max - min) + min,
        "z": Math.random() * 50 - 25,
        "timestamp": friend.friend_since,
        "calledFriend": steamProfile.personaname,
        "calledID": steamProfile.steamid
    }
    friendsPos[friend.steamid] = pos
});
friendsPos[steamProfile.steamid] = {
    "x": 0,
    "y": 0,
    "z": 0,
    "timestamp": 0,
    "calledFriend": steamProfile.personaname,
    "calledID": ""
}
```
- calledFriend and calledID are used to help create a "thread", connecting one friend back to the original user and displaying the path along the way


<details>
  <summary>Example</summary> 
    <img src=https://github.com/user-attachments/assets/7608956b-34e7-4c48-95d4-4ee3ac219463/>
</details>

## Integrating Supabase
SteamFiber allows users to share maps and does so by utlizing [Supabase](https://supabase.com/) for the backend. The code below is what is sent to Supabase when a user clicks to save their map. 
```
const { data : customMap, error, status } = await supabase
.from('customMaps')
.insert([
  { 'steamProfile': steamProfile, 'friendsPositions': friendsPos, 'steamNames': steamNames, 'addedNames': friendsAdded, 'user_id': userId},
])
.select('link')
.single()
```
<br/>The first four columns are needed for the map to be reconstructed. The fifth column 'user_id' is not required to recreate the map, but is recommended so you can assign each visiter to a user_id, to then implement [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) policies in your Supabase table. If you would not like to use Supabase but would like to integreate your own backend, the only data that needs to be saved to for a custom link are the first four columns.

## Learn More
Here are some great resources I used while developing SteamFiber
- [React Three Fiber Docs](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [Great intro to using shaders with R3F](https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/)
- [Drei](https://drei.docs.pmnd.rs/getting-started/introduction) has a great collection of resources, I particularly took advantage of [Camera Controls](https://drei.docs.pmnd.rs/controls/camera-controls)
- [GSAP](https://gsap.com/) was used for camera animations and it is a great tool to use with ThreeJS. Definetly give it a shot if you want to experiment with model/camera positionings
- While I did not use a graph library, I did make a prototype with [React Sigma](https://sim51.github.io/react-sigma/). It has a lot of great uses
- [Supabase](https://supabase.com/docs/guides/database/overview) looks to be a great backend service that I'll likely use for future projects

