const mongoose = require("mongoose");

const { WorkOS } = require("@workos-inc/node");

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing.");
  }

  if (!process.env.WORKOS_API_KEY) {
    throw new Error("WORKOS_API_KEY is missing.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const workos = new WorkOS(process.env.WORKOS_API_KEY);

  const jobs = mongoose.connection.collection("jobs");

  const missingOrgNames = await jobs
    .find(
      {
        $or: [
          {
            orgName: {
              $exists: false,
            },
          },
          {
            orgName: null,
          },
          {
            orgName: "",
          },
        ],
      },
      {
        projection: {
          _id: 1,
          orgId: 1,
        },
      },
    )
    .toArray();

  console.log(`Found ${missingOrgNames.length} jobs to update.`);

  const organisationCache = new Map();

  for (const job of missingOrgNames) {
    if (!job.orgId) {
      console.warn(`Skipping ${job._id}: missing orgId`);

      continue;
    }

    let orgName = organisationCache.get(job.orgId);

    if (!orgName) {
      const organisation = await workos.organizations.getOrganization(
        job.orgId,
      );

      orgName = organisation.name;

      organisationCache.set(job.orgId, orgName);
    }

    await jobs.updateOne(
      {
        _id: job._id,
      },
      {
        $set: {
          orgName,
        },
      },
    );

    console.log(`Updated ${job._id}: ${orgName}`);
  }

  console.log("Company-name backfill complete.");

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);

  await mongoose.disconnect();

  process.exit(1);
});
