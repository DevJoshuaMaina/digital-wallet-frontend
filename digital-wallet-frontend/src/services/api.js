import axios from 'axios'
import { API_BASE_URL } from '@/config/api'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

//Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const userStore = useUserStore()
        if (userStore.isAuthenticated) {
            //Add auth token if available
        }
        return config
    },
    (error) => Promise.reject(error)
)

//Response interceptor
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            const userStore = useUserStore()
            userStore.logout()
            router.push('/login')
        }
        return Promise.reject(error)
    }
)

export default apiClient