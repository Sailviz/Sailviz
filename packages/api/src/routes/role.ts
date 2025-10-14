import prisma from "@sailviz/db";

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
  return roles;
}
