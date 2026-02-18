import apiClient from "./api"
import { API_ENDPOINTS } from "@/config/api"

export default {
    async register(userData) {
        try {
            return await apiClient.post(API_ENDPOINTS.USERS, userData)
        }
        catch (error) {
            if (error.response?.status === 404 || error.response?.status === 405 || error.response?.status === 403) {
                return apiClient.post(`${ API_ENDPOINTS.USERS }/register`, userData)
            }
            throw error
        }
    },

    login(credentials){
        //Assuming a simple login endpoint; adjust if backend has one
        return apiClient.post(`${ API_ENDPOINTS.USERS }/login`, credentials)
    },

    getUserByID(id) {
        return apiClient.get(API_ENDPOINTS.USER_BY_ID(id))
    },

    getUserByUsername(username) {
        return apiClient.get(API_ENDPOINTS.USER_BY_USERNAME(username))
    },

    updateUser(id, userData) {
        return apiClient.put(API_ENDPOINTS.USER_BY_ID(id), userData)
    },

    searchUsers(query){
        return apiClient.get(`${ API_ENDPOINTS.USERS }/search`, { params: { query } })
    }
}
