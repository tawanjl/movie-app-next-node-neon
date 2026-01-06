import type { Request, Response } from "express"
import { prisma } from "../lib/prisma.ts"
import bcrypt from "bcrypt"
import { generateToken } from "../utils/generateToken.ts"



const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body

  // Check if user already exists
  const userExists = await prisma.user.findUnique({ where: { email: email } })

  if (userExists) {
    return res.status(400).json({ message: "User already exists with this email" })
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)



  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  // Generate token
  const token = generateToken(user.id, res)

  res.status(201).json({ status: "success", data: { user: { id: user.id, name: user.name, email: user.email }, token } })
}


const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  // Check if user email exists int the table
  const user = await prisma.user.findUnique({
    where: { email: email }
  })

  if (!user) {
    return res.status(400).json({ error: "Invalid email or password" })
  }

  // verify password
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid email or password" })
  }

  // Generate token
  const token = generateToken(user.id, res)

  res.status(200).json({ status: "success", data: { user: { id: user.id, name: user.name, email: user.email }, token } })

}

const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true
  })
  res.status(200).json({ status: "logout success" })
}

export { register, login, logout }