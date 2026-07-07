export interface DeepLResponse {
    alternatives?: string[]
    code?: number
    message?: string
    data?: string
    id?: number
    sourceLang?: string
}
export interface GoogleTranslateResponse {
    src?: string;
    sentences?: {
        trans?: string;
    }[];
}