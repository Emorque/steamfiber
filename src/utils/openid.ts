import { RelyingParty } from 'openid'

import { getRedirectURL } from './redirect-url'
console.log(process.env.APP_URL)

export function getOpenID() {
  console.log("hi");
    return new RelyingParty(
      getRedirectURL(),
      process.env.APP_URL!,
      true,
      false,
      []
    )
}