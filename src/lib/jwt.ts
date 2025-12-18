import jwt, { JwtPayload } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

if(!JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment variables')

export interface JWTPayload {
    sub: string
    role: 'PLAYER' | 'ADMIN'
    ver: number
}

function isJWTPayload(payload: JwtPayload): payload is JWTPayload {
    return (
        typeof payload.sub === 'string' &&
        (payload.role === 'PLAYER' || payload.role === 'ADMIN') &&
        typeof payload.ver === 'number'
    )
}

export function signJWT(payload: JWTPayload) {
    return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' })
}

export function verifyJWT(token: string): JWTPayload {
    const decoded = jwt.verify(token, JWT_SECRET)
    if(typeof decoded === 'string') throw new Error('Invalid token payload')
    if(!isJWTPayload(decoded)) throw new Error('Invalid token payload structure')
    return decoded
}
