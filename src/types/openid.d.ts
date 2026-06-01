declare module "openid" {
  export class RelyingParty {
    constructor(
      returnUrl: string,
      realm: string | null,
      stateless: boolean,
      strictMode: boolean,
      extensions: unknown[],
    );

    authenticate(
      identifier: string,
      immediate: boolean,
      callback: (
        error: Error | null,
        authenticationUrl?: string | null,
      ) => void,
    ): void;

    verifyAssertion(
      requestOrUrl: string | Request,
      callback: (
        error: Error | null,
        result?: { authenticated: boolean; claimedIdentifier?: string },
      ) => void,
    ): void;
  }
}
