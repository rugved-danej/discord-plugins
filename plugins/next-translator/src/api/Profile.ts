import { findByProps } from "@vendetta/metro"

let fetchProfile = findByProps("fetchProfile")?.fetchProfile;
let userProfileStore = findByProps("getUserProfile");

export async function getUserBio(userId: string): Promise<string | null> {
    if (!fetchProfile || !userProfileStore) return null;
    
    let profile = userProfileStore.getUserProfile(userId);
    if (!profile) {
        await fetchProfile(userId);
        profile = userProfileStore.getUserProfile(userId);
    }
    
    return profile?.bio || null;
}
