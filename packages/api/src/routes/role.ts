import prisma from "@sailviz/db";
import { RoleType } from "@sailviz/types";

export function createRoleInClub(clubId: string) {
  return prisma.role.create({
    data: {
      clubId: clubId,
      name: "",
      permissions: {},
    },
  });
}

export async function getRolesByClub(clubId: string) {
  const roles = await prisma.role.findMany({
    where: { clubId },
  });
  return roles as RoleType[];
}

export async function updateRoleById(role: RoleType) {
  const { id, permissions, ...updateData } = role;
  const updatedRole = await prisma.role.update({
    where: { id },
    data: {
      ...updateData,
      permissions: permissions || {},
    },
  });
  return updatedRole as RoleType;
}

export async function deleteRoleById(role: RoleType) {
  const deletedRole = await prisma.role.delete({
    where: { id: role.id },
  });
  return deletedRole as RoleType;
}
