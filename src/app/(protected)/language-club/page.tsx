import React, { Suspense } from "react";
import LangDataTable from "./_components/lang-data-table";
import { IconLoader2 } from "@tabler/icons-react";

const LanguageClubAdmin = () => {
  return (
    <div className="flex flex-col gap-4 w-full justify-center items-center mt-10 p-5">
      <h1 className="text-2xl font-bold text-center">
        Welcome to the Language Club Dashboard
      </h1>
      <p className="text-base text-gray-500 text-center">
        Here you can manage language club events.
      </p>
      <div className="w-full mt-10">
        <h2 className="text-xl font-bold text-start">Language Club Events</h2>
        <Suspense
          fallback={<IconLoader2 className="h-8 w-8 animate-spin mx-auto" />}
        >
          <LangDataTable />
        </Suspense>
      </div>
    </div>
  );
};

export default LanguageClubAdmin;
