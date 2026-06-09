import { Hono } from 'hono';
import userControllers from '../controllers/users.controllers';

type Bindings = {
    DB : D1Database
}


const userRoutes = new Hono<{ Bindings: Bindings }>()


userRoutes.post("/register",userControllers.registerUser);
userRoutes.get("/" ,userControllers.helloWorld);

export default userRoutes;