export type User = {
    id: string,
    kcid: string,
    name: string,
    email: string
}
declare namespace Express {
    export interface Request {
       user?: User
    }
 }