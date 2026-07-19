import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";
import { HttpError } from "../../shared/httpErrors.js";

// creates an object provided by Google's authLibrary
const googleClient = new OAuth2Client();

export type GoogleIdentity = {
    sub: string;
    email: string;
    name: string;
};

type GoogleTokenPayload = {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
};

export type GoogleCredentialVerifier = (options: {
    idToken: string;
    audience: string;
}) => Promise<{ getPayload(): GoogleTokenPayload | undefined }>;


export async function verifyGoogleCredential(
    credential: string,
    options: {
        clientId?: string;
        verifyIdToken?: GoogleCredentialVerifier;
    } = {},
) : Promise<GoogleIdentity>{
    const clientId = options.clientId ?? env.googleClientId;
    const verifyIdToken = options.verifyIdToken ?? googleClient.verifyIdToken.bind(googleClient);

    // check if google client id is configured in env
    if (!clientId) {
        throw new HttpError(
        503,
        "Google Sign-In is not configured",
        );
    }

    try{
        // verifyIdToken = Google help verify
        // it returns 'ticket'
        const ticket = await verifyIdToken({
            idToken: credential,// the complete credential sent by frontend
            audience: clientId,// the clientId the credential should belong to
        });

        // ticket has a payload
        // Before verifyToken() succeeds, the credential si untrusted
        // After succeeds, return VERIFIED PAYLOAD
        const payload = ticket.getPayload();
        
        if(
            !payload?.sub ||
            !payload.email ||
            payload.email_verified !== true
        ){
            throw new HttpError(

                401,
                "Invalid Google credential",
            );
        }

        // later, we keep it
        // context provider will store it, make available for other components to ue=se
        return{
            sub: payload.sub,
            email: payload.email.toLowerCase(),
            name: payload.name?.trim() || payload.email.split("@")[0],//fallback if no name
        };
    }catch (error) {
        if (error instanceof HttpError) {
            throw error;
        }

        throw new HttpError(
            401,
            "Invalid or expired Google credential",
        );
    }
}
