declare module "express-serve-static-core" {
    interface Response {
        reply: Function;
    }
}