import prisma from "@sailviz/db";
import { UserType, RoleType, Permission } from "@sailviz/types";

function toUserType(u: any & { roles: any[] }): UserType {
  const roles: RoleType[] = (u.roles || []).map((r) => ({
    id: r.id,
    name: r.name,
    clubId: r.clubId,
    // permissions is stored as JSON in DB; coerce to our runtime type
    permissions:
      (r.permissions as unknown as { allowed?: Permission[] }) || undefined,
  }));

  return {
    id: u.id,
    username: u.username,
    uuid: (u as unknown as { uuid: string | null }).uuid ?? null,
    startPage: u.startPage,
    admin: u.admin,
    email: (u as unknown as { email: string | null }).email ?? null,
    emailVerified: u.emailVerified,
    image: (u as unknown as { image: string | null }).image ?? null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    displayUsername:
      (u as unknown as { displayUsername: string | null }).displayUsername ??
      null,
    roles,
    clubId: (u.clubId ?? "") as string,
  };
}

export async function updateUserById(user: UserType): Promise<UserType> {
  const { id, roles, ...updateData } = user;
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData as any,
    include: { roles: true },
  });
  return toUserType(updatedUser as any);
}

export async function createUserInClub(clubId: string): Promise<UserType> {
  const newUser = await prisma.user.create({
    data: {
      username: "",
      email: null,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      clubId: clubId,
      startPage: "Dashboard",
    },
    include: { roles: true },
  });
  return toUserType(newUser as any);
}

export async function deleteUserById(userId: string): Promise<UserType> {
  const deletedUser = await prisma.user.delete({
    where: { id: userId },
    include: { roles: true },
  });
  return toUserType(deletedUser as any);
}

export async function getUsersByClub(clubId: string): Promise<UserType[]> {
  const users = await prisma.user.findMany({
    where: { clubId },
    include: { roles: true },
  });
  return users.map((u) => toUserType(u as any));
}
