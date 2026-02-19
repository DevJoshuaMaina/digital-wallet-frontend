const toFieldErrors = (errors) => {
    if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return {}

    return Object.entries(errors).reduce((acc, [key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
            acc[key] = String(value[0])
        }
        else if (typeof value === 'string') {
            acc[key] = value
        }
        return acc
    }, {})
}

const extractMessage = (data) => {
    if (!data) return null
    if (typeof data === 'string') return data
    if (typeof data.message === 'string' && data.message.trim()) return data.message
    if (typeof data.error === 'string' && data.error.trim()) return data.error
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail

    if (Array.isArray(data.errors) && data.errors.length > 0) {
        const firstError = data.errors[0]
        if (typeof firstError === 'string') return firstError
        if (typeof firstError?.message === 'string') return firstError.message
        if (typeof firstError?.defaultMessage === 'string') return firstError.defaultMessage
    }

    if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        const firstFieldError = Object.values(data.errors)[0]
        if (Array.isArray(firstFieldError) && firstFieldError.length > 0) {
            return String(firstFieldError[0])
        }
        if (typeof firstFieldError === 'string') {
            return firstFieldError
        }
    }

    return null
}

export function handleApiError(error) {
    if (error.response) {
        const data = error.response.data
        const fieldErrors = toFieldErrors(data?.errors)
        const status = error.response.status
        return {
            message: extractMessage(data) || `Request failed (HTTP ${status}).`,
            status,
            data,
            fieldErrors
        }
    }
    else if (error.request) {
        return {
            message: 'No response from server. Please check your connection.',
            status: 0,
            fieldErrors: {}
        }
    }
    else {
        return {
            message: error.message || 'An unexpected error occurred.',
            status: 0,
            fieldErrors: {}
        }
    }
}
