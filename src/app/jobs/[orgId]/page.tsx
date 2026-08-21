// import Jobs from "@/app/components/Jobs";
// import { addOrgAndUserData, JobModel } from "@/models/Job";
// import { getUser } from "@workos-inc/authkit-nextjs";
// import { AutoPaginatable, OrganizationMembership, WorkOS } from "@workos-inc/node";
// import mongoose from "mongoose";

// type PageProps = {
//   params: {
//     orgId: string;
//   };
// };

// export default async function CompanyJobsPage(props: PageProps) {
//   const workos = new WorkOS(process.env.WORKOS_API_KEY);
//   const org = await workos.organizations.getOrganization(props.params.orgId);
//   const { user } = await getUser();

//   // Explicitly cast the user to the correct type
//   const typedUser = user as unknown as import("@workos-inc/node").User;

//   let jobsDocs = JSON.parse(JSON.stringify(await JobModel.find({ orgId: org.id })));
//   jobsDocs = await addOrgAndUserData(jobsDocs, typedUser);

//   return (
//     <div>
//       <div className="container">
//         <h1 className="text-xl my-6">{org.name} Jobs</h1>
//       </div>
//       <Jobs jobs={jobsDocs} header={"Jobs posted by " + org.name} />
//     </div>
//   );
// }

import Jobs from "@/app/components/Jobs";

import { addOrgAndUserData, JobModel } from "@/models/Job";

import { getUser } from "@workos-inc/authkit-nextjs";

import { WorkOS } from "@workos-inc/node";

import mongoose from "mongoose";

type PageProps = {
  params: {
    orgId: string;
  };
};

export default async function CompanyJobsPage({ params }: PageProps) {
  await mongoose.connect(process.env.MONGO_URI as string);

  const workos = new WorkOS(process.env.WORKOS_API_KEY);

  const org = await workos.organizations.getOrganization(params.orgId);

  const { user } = await getUser();

  const typedUser = user as unknown as import("@workos-inc/node").User;

  const rawJobs = await JobModel.find({
    orgId: org.id,
  }).sort({
    createdAt: -1,
  });

  const jobsDocs = await addOrgAndUserData(rawJobs, typedUser);

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {org.name} Jobs
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Explore current opportunities posted by {org.name}.
        </p>
      </div>

      <Jobs jobs={jobsDocs} header={`Jobs posted by ${org.name}`} />
    </main>
  );
}
