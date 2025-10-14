import prisma from "@sailviz/db";
import { UserType } from "@sailviz/types";

export async function updateUserById(user: UserType) {
  const { id, roles, ...updateData } = user;
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });
  return updatedUser;
}

export async function createUserInClub(clubId: string) {
  const newUser = await prisma.user.create({
    data: {
      username: "",
      email: null,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      clubId: clubId,
      roles: {},
      startPage: "Dashboard",
    },
  });
  return newUser;
}

export async function deleteUserById(userId: string) {
  const deletedUser = await prisma.user.delete({
    where: { id: userId },
  });
  return deletedUser;
}

export async function getUsersByClub(clubId: string) {
  const users = await prisma.user.findMany({
    where: { clubId },
  });
  return users;
}
