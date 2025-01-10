import { getOpenID } from "@/utils/openid"

export async function GET(request: Request) {
    const url = new URL(request.url)
    console.log("|");
    console.log(url);

    const result: {
        authenticated: boolean
        claimedIdentifier?: string | undefined
    } = await new Promise((resolve, reject) =>
        getOpenID().verifyAssertion(url.toString(), (error, result) => {
        if (error) {
            reject(error)
            return
        }

        resolve(result!)
        })
    )

    if (!result.authenticated) {
        return new Response(null, {
        status: 401
        })
    }

    if (!/^https?:\/\/steamcommunity\.com\/openid\/id\/\d+$/.test(result.claimedIdentifier!)) {
        return new Response(null, {
        status: 401
        })
    }

    const [steamId] = result.claimedIdentifier!.match(/(\d+)$/)!
    console.log(steamId);
    const data = Buffer.from(JSON.stringify(steamId), 'utf8').toString('base64');
    return Response.redirect(`http://localhost:3000/#data=${data}`, 302)
  }