import prisma from "@sailviz/db";
import { ClubType } from "packages/types/src/types";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
import { createStripeCustomer } from "./stripe";

const os = implement(ORPCcontract);

export async function getClub(clubId: string) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });
  return club as unknown as ClubType; //have to do unknown as settings isn't typed in db
}

export async function updateClubById(input: any) {
  const club = await prisma.club.update({
    where: { id: input.id },
    data: input,
  });
  return club as unknown as ClubType;
}

export const club_all = os.club.all.handler(async ({ input }) => {
  const clubs = await prisma.club.findMany({
    omit: {
      settings: true,
      stripeCustomerId: true,
      userId: true,
    },
  });
  console.log(clubs);
  return clubs as unknown as ClubType[];
});

export const club_create = os.club.create.handler(async ({ input }) => {
  //create a new club with default settings
  const newClub = await prisma.club.create({
    data: {
      name: input.name,
      displayName: input.name,
      settings: {
        duties: [
          "Race Officer",
          "Assistant Race Officer",
          "Safety Officer",
          "Assistant Safety Officer",
          "Duty Officer",
        ],
        hornIP: "",
        clockIP: "",
        trackable: { orgID: "", enabled: false },
        clockOffset: 1,
        pursuitLength: 60,
      },
    },
  });

  //create the admin role for the club
  prisma.role.create({
    data: {
      name: "Admin",
      clubId: newClub.id,
      permissions: {
        allowed: [
          { label: "Edit Series", value: "editSeries" },
          { label: "Edit Races", value: "editRaces" },
          { label: "Edit Fleets", value: "editFleets" },
          { label: "Edit Results", value: "editResults" },
          { label: "Edit Boats", value: "editBoats" },
          { label: "Edit Hardware", value: "editHardware" },
          { label: "Edit Users", value: "editUsers" },
          { label: "Edit Roles", value: "editRoles" },
          { label: "Download Results", value: "DownloadResults" },
          { label: "Upload Entries", value: "UploadEntires" },
          { label: "View Integrations", value: "viewIntegrations" },
          { label: "View Developer", value: "viewDeveloper" },
          { label: "View Users", value: "viewUsers" },
          { label: "Dashboard Access", value: "dashboardAccess" },
          { label: "Edit Duties", value: "editDuties" },
          { label: "Trackable - View Settings", value: "trackableView" },
          { label: "Advanced Result edit", value: "advancedResultEdit" },
        ],
      },
    },
  });

  //create stripe customer
  createStripeCustomer(newClub.id);

  if (newClub) {
    return newClub as unknown as ClubType;
  } else {
    throw new ORPCError("Club not created");
  }
});

export const club_find = os.club.find.handler(async ({ input }) => {
  const club = await prisma.club.findUnique({
    where: { id: input.clubId },
  });
  if (club) {
    return club as unknown as ClubType;
  } else {
    throw new ORPCError("Club not found");
  }
});

export const club_name = os.club.name.handler(async ({ input }) => {
  const club = await prisma.club.findUnique({
    where: { name: input.clubName },
    omit: {
      settings: true,
      stripeCustomerId: true,
      userId: true,
    },
  });
  if (club) {
    return club as unknown as ClubType;
  } else {
    throw new ORPCError("Club not found");
  }
});
