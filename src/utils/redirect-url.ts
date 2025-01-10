
export function getRedirectURL(): string {
  const url = new URL(`/api/auth/callback`, process.env.APP_URL)
    console.log(url);
  return url.href
}