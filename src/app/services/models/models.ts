export interface Handler {
    message: string,
    container: RegisterField
}
export interface AuthenticationErrorHandlerDM {
    error: any,
    handler: Handler
}

export enum RegisterField {
    name,
    surname,
    username,
    email,
    password,
    confirmPassword,
    general
}
