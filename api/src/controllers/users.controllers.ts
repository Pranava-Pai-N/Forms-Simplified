import { connectDB } from "../lib/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



const registerUser = async (content: any) => {
    const body = await content.req.json();


    const { name, email, password } = body;


    if (!name || !email || !password) {
        return content.json({
            success: false,
            message: "Please provide all the details properly ..."
        })
    }

    const prisma = connectDB(content.env.HYPERDRIVE)


    const exisitingUser = await prisma.user.findFirst({
        where: {
            email: email
        }
    });

    if (exisitingUser) {
        return content.json({
            success: false,
            message: "You already have an account. Please login with the credentials to continue"
        },400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: name,
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
        }
    });

    if (!user) {
        return content.json({
            success: false,
            message: "Error creating the user. Try again later"
        });
    };

    return content.json({
        success: true,
        message: "User created successfully ..",
        user
    },201)
}


const helloWorld = (content: any) => {
    return content.json({
        success: true,
        message: "Hello World"
    })
}


const userControllers = {
    registerUser,
    helloWorld
}


export default userControllers;