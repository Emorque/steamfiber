import { getOpenID } from "@/utils/openid"

export async function GET() {
    const url: string = await new Promise((resolve, reject) =>
        getOpenID().authenticate("https://steamcommunity.com/openid", false, (error, url) => {
            if (error) {
            reject(error)
            return
            }

            resolve(url!)
        })
        )
        console.log(url);
        return Response.redirect(url, 302); // 302 is the standard HTTP status code for a temporary redirect
}