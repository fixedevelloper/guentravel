import {api} from "../api/axios-instance";

export interface FareRulesParams {
    sessionId: string
    fareSourceCode: string
    fareSourceCodeInbound?: string | null
}

export const fetchFareRules = async ({ sessionId, fareSourceCode, fareSourceCodeInbound }: FareRulesParams) => {
    const response = await api.post('/flights/fare-rules', {
        session_id: sessionId,
        fare_source_code: fareSourceCode,
        fare_source_code_inbound: fareSourceCodeInbound || null
    })

    // Laravel renvoie { success: true, data: { ... } }
    return response.data?.data
}