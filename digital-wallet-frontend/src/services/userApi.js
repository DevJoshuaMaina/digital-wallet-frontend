import apiClient from "./api"
import { API_ENDPOINTS } from "@/config/api"

export default {
    register(userData) {
        return apiClient.post(API_ENDPOINTS.USERS, userData)
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