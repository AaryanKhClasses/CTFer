import { NextResponse } from 'next/server'
import { handleAuthError } from './auth'

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json(
        { success: true, data },
        { status }
    )
}

export function errorResponse(message: string, status = 400) {
    return NextResponse.json(
        { success: false, error: message },
        { status }
    )
}

export function handleAuthErrorResponse(error: unknown) {
    const { status, message } = handleAuthError(error)
    return errorResponse(message, status)
}

export function validationError(message: string) {
    return errorResponse(message, 400)
}

export function notFoundResponse(message = 'Resource not found') {
    return errorResponse(message, 404)
}

export function forbiddenResponse(message = 'Access denied') {
    return errorResponse(message, 403)
}

export function unauthorizedResponse(message = 'Authentication required') {
    return errorResponse(message, 401)
}
