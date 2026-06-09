import { Hono } from "hono";
import userRoutes from "./user.routes";

type Bindings = {
    DB : D1Database
}

const mainRoute = new Hono<{ Bindings: Bindings }>()

// User routes
mainRoute.route("/user",userRoutes);

export default mainRoute;